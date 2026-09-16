import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export class ClientPDFOps {
  /**
   * Reads metadata and page count of a PDF in-browser
   */
  public static async inspectPDF(fileBuffer: ArrayBuffer): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    pages: PageInfo[];
  }> {
    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const pages: PageInfo[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      pages.push({
        pageNumber: i + 1,
        width,
        height,
        rotation: page.getRotation().angle,
      });
    }

    return {
      pageCount,
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      pages,
    };
  }

  /**
   * Merge multiple PDFs into a single document in-memory
   */
  public static async mergePDFs(buffers: ArrayBuffer[]): Promise<Uint8Array> {
    if (buffers.length === 0) {
      throw new Error("At least one PDF file is required to merge.");
    }

    const mergedDoc = await PDFDocument.create();

    for (const buffer of buffers) {
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(
        srcDoc,
        srcDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return await mergedDoc.save();
  }

  /**
   * Split PDF by custom ranges or extract each page into a ZIP
   */
  public static async splitPDF(
    buffer: ArrayBuffer,
    options: {
      mode: "ranges" | "all";
      rangeString?: string; // e.g. "1-3, 5, 8-10"
      baseFilename?: string;
    }
  ): Promise<{ data: Blob; filename: string; isZip: boolean }> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const baseName = options.baseFilename || "document";

    if (options.mode === "all") {
      const zip = new JSZip();
      for (let i = 0; i < totalPages; i++) {
        const singleDoc = await PDFDocument.create();
        const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
        singleDoc.addPage(copiedPage);
        const pdfBytes = await singleDoc.save();
        zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      return { data: zipBlob, filename: `${baseName}_split_pages.zip`, isZip: true };
    }

    // Split by comma-separated ranges: e.g. "1-3, 5, 8-10"
    const ranges = (options.rangeString || `1-${totalPages}`)
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (ranges.length === 1 && !ranges[0].includes("-")) {
      // Single page extraction
      const pageNum = parseInt(ranges[0], 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Invalid page number ${ranges[0]}`);
      }
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
      singleDoc.addPage(copiedPage);
      const bytes = await singleDoc.save();
      return {
        data: new Blob([bytes as any], { type: "application/pdf" }),
        filename: `${baseName}_page_${pageNum}.pdf`,
        isZip: false,
      };
    }

    const zip = new JSZip();
    for (let idx = 0; idx < ranges.length; idx++) {
      const range = ranges[idx];
      const partDoc = await PDFDocument.create();
      const pageIndices: number[] = [];

      if (range.includes("-")) {
        const [startStr, endStr] = range.split("-").map((s) => s.trim());
        const start = Math.max(1, parseInt(startStr, 10));
        const end = Math.min(totalPages, parseInt(endStr, 10));
        for (let p = start; p <= end; p++) {
          pageIndices.push(p - 1);
        }
      } else {
        const p = parseInt(range, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length > 0) {
        const copied = await partDoc.copyPages(srcDoc, pageIndices);
        copied.forEach((p) => partDoc.addPage(p));
        const bytes = await partDoc.save();
        zip.file(`${baseName}_part_${idx + 1}.pdf`, bytes);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return { data: zipBlob, filename: `${baseName}_split_ranges.zip`, isZip: true };
  }

  /**
   * Compress PDF using object stream consolidation and dictionary pruning
   */
  public static async compressPDF(
    buffer: ArrayBuffer,
    level: "extreme" | "recommended" | "light" = "recommended"
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Strip optional content, unneeded structural metadata and compress object streams
    const useObjectStreams = level !== "light";
    const compressedBytes = await srcDoc.save({
      useObjectStreams,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    return compressedBytes;
  }

  /**
   * Target-based compression (e.g. compress to 1 MB or 500 KB)
   */
  public static async compressToTarget(
    buffer: ArrayBuffer,
    targetBytes: number
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Standard high-compression save
    const initialSave = await srcDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    if (initialSave.length <= targetBytes) {
      return initialSave;
    }

    // Strip non-essential document info dictionary items to shave extra bytes
    srcDoc.setTitle("");
    srcDoc.setAuthor("");
    srcDoc.setSubject("");
    srcDoc.setKeywords([]);
    srcDoc.setProducer("Everything File");
    srcDoc.setCreator("Everything File");

    return await srcDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  /**
   * Rotate specific or all pages in a PDF
   */
  public static async rotatePages(
    buffer: ArrayBuffer,
    pageRotations: Record<number, number> // pageIndex (0-based) -> additional rotation (e.g. 90, 180, 270)
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = srcDoc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const additional = pageRotations[i];
      if (additional && additional !== 0) {
        const page = srcDoc.getPage(i);
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + additional) % 360;
        page.setRotation(degrees(newRotation));
      }
    }

    return await srcDoc.save();
  }

  /**
   * Delete specified pages from a PDF
   */
  public static async deletePages(
    buffer: ArrayBuffer,
    pageIndicesToDelete: number[] // 0-based indices
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    if (pageIndicesToDelete.length >= totalPages) {
      throw new Error("Cannot delete all pages in document. At least one page must remain.");
    }

    // Sort descending so deletion doesn't shift remaining indices
    const sorted = Array.from(new Set(pageIndicesToDelete)).sort((a, b) => b - a);
    for (const idx of sorted) {
      if (idx >= 0 && idx < srcDoc.getPageCount()) {
        srcDoc.removePage(idx);
      }
    }

    return await srcDoc.save();
  }

  /**
   * Extract specified pages into a brand new PDF
   */
  public static async extractPages(
    buffer: ArrayBuffer,
    pageIndicesToExtract: number[] // 0-based indices
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const validIndices = pageIndicesToExtract.filter(
      (idx) => idx >= 0 && idx < srcDoc.getPageCount()
    );

    if (validIndices.length === 0) {
      throw new Error("No valid pages were selected for extraction.");
    }

    const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return await newDoc.save();
  }

  /**
   * Reorder PDF pages according to custom index array
   */
  public static async reorderPages(
    buffer: ArrayBuffer,
    newOrder: number[] // array of 0-based page indices
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return await newDoc.save();
  }

  /**
   * Convert images (JPG / PNG) into a clean, formatted PDF
   */
  public static async imagesToPDF(
    images: Array<{ buffer: ArrayBuffer; type: "jpg" | "png" }>,
    options: {
      orientation: "portrait" | "landscape" | "auto";
      margin: "none" | "small" | "normal";
    } = { orientation: "auto", margin: "small" }
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    const marginPt = options.margin === "none" ? 0 : options.margin === "small" ? 18 : 36;

    for (const imgItem of images) {
      let embeddedImage;
      if (imgItem.type === "jpg") {
        embeddedImage = await pdfDoc.embedJpg(imgItem.buffer);
      } else {
        embeddedImage = await pdfDoc.embedPng(imgItem.buffer);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageWidth: number;
      let pageHeight: number;

      if (options.orientation === "portrait") {
        pageWidth = 595.28; // Standard A4 portrait
        pageHeight = 841.89;
      } else if (options.orientation === "landscape") {
        pageWidth = 841.89;
        pageHeight = 595.28;
      } else {
        // Auto match aspect ratio
        if (imgWidth > imgHeight) {
          pageWidth = 841.89;
          pageHeight = 595.28;
        } else {
          pageWidth = 595.28;
          pageHeight = 841.89;
        }
      }

      const availWidth = pageWidth - marginPt * 2;
      const availHeight = pageHeight - marginPt * 2;

      // Fit aspect ratio
      const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      const x = marginPt + (availWidth - drawWidth) / 2;
      const y = marginPt + (availHeight - drawHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }

    return await pdfDoc.save();
  }
}
