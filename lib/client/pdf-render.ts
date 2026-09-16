/**
 * Client-Side PDF Renderer using pdfjs-dist
 * Handles visual thumbnails, PDF -> JPG rendering, and PDF -> Text extraction.
 */

export interface RenderedPageImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

export class ClientPDFRenderer {
  private static pdfjsLib: any = null;

  private static async getPdfJs() {
    if (typeof window === "undefined") {
      throw new Error("ClientPDFRenderer can only run in the browser.");
    }

    if (!this.pdfjsLib) {
      const pdfjs = await import("pdfjs-dist");
      // Use unpkg worker or cdnjs worker matching version 3.11.174
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      this.pdfjsLib = pdfjs;
    }

    return this.pdfjsLib;
  }

  /**
   * Renders a single PDF page into an HTML5 Canvas element
   */
  public static async renderPageToCanvas(
    pdfBuffer: ArrayBuffer,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.0
  ): Promise<{ width: number; height: number }> {
    const pdfjs = await this.getPdfJs();
    // Copy array buffer to avoid detach errors
    const doc = await pdfjs.getDocument({ data: pdfBuffer.slice(0) }).promise;
    const page = await doc.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context.");

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    return { width: viewport.width, height: viewport.height };
  }

  /**
   * Renders all or specified PDF pages to high-resolution JPG images
   */
  public static async renderPDFToJPGs(
    pdfBuffer: ArrayBuffer,
    scale: number = 1.5,
    quality: number = 0.92
  ): Promise<RenderedPageImage[]> {
    const pdfjs = await this.getPdfJs();
    const doc = await pdfjs.getDocument({ data: pdfBuffer.slice(0) }).promise;
    const totalPages = doc.numPages;
    const results: RenderedPageImage[] = [];

    const offscreenCanvas = document.createElement("canvas");
    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context.");

    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });

      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;

      // Fill white background for JPG
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const blob = await new Promise<Blob>((resolve) => {
        offscreenCanvas.toBlob(
          (b) => resolve(b || new Blob()),
          "image/jpeg",
          quality
        );
      });

      const dataUrl = offscreenCanvas.toDataURL("image/jpeg", quality);

      results.push({
        pageNumber: i,
        blob,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return results;
  }

  /**
   * Extracts selectable text from all pages in a PDF document.
   * XSS-safe: Returns raw strings without HTML markup.
   */
  public static async extractTextFromPDF(
    pdfBuffer: ArrayBuffer
  ): Promise<{ text: string; pages: Array<{ pageNumber: number; text: string }> }> {
    const pdfjs = await this.getPdfJs();
    const doc = await pdfjs.getDocument({ data: pdfBuffer.slice(0) }).promise;
    const totalPages = doc.numPages;
    const pagesText: Array<{ pageNumber: number; text: string }> = [];
    let fullText = "";

    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();

      // Concatenate text items cleanly with spacing
      let lastY: number | null = null;
      let pageStr = "";

      for (const item of textContent.items as any[]) {
        if ("str" in item) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += "\n";
          }
          pageStr += item.str + " ";
          lastY = item.transform[5];
        }
      }

      pageStr = pageStr.trim();
      pagesText.push({ pageNumber: i, text: pageStr });
      fullText += `--- Page ${i} ---\n${pageStr}\n\n`;
    }

    return { text: fullText.trim(), pages: pagesText };
  }
}
