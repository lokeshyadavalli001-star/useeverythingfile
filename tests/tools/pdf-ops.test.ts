import { describe, it, expect } from "vitest";
import { ClientPDFOps } from "@/lib/client/pdf-ops";
import { PDFDocument } from "pdf-lib";

async function createSamplePdf(pageCount: number = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`Page ${i + 1}`);
  }
  return await doc.save();
}

describe("ClientPDFOps - In-Browser PDF Operations", () => {
  it("inspects PDF and retrieves page count and dimensions", async () => {
    const pdfBytes = await createSamplePdf(4);
    const meta = await ClientPDFOps.inspectPDF(pdfBytes.buffer);

    expect(meta.pageCount).toBe(4);
    expect(meta.pages.length).toBe(4);
    expect(meta.pages[0].width).toBe(400);
    expect(meta.pages[0].height).toBe(600);
  });

  it("merges multiple PDFs into a single document", async () => {
    const doc1 = await createSamplePdf(2);
    const doc2 = await createSamplePdf(3);

    const merged = await ClientPDFOps.mergePDFs([doc1.buffer, doc2.buffer]);
    const meta = await ClientPDFOps.inspectPDF(merged.buffer);

    expect(meta.pageCount).toBe(5);
  });

  it("deletes specified pages from a document", async () => {
    const doc = await createSamplePdf(5);
    // Delete page 2 and page 4 (0-indexed: 1 and 3)
    const cleaned = await ClientPDFOps.deletePages(doc.buffer, [1, 3]);
    const meta = await ClientPDFOps.inspectPDF(cleaned.buffer);

    expect(meta.pageCount).toBe(3);
  });

  it("prevents deleting all pages in a document", async () => {
    const doc = await createSamplePdf(2);
    await expect(
      ClientPDFOps.deletePages(doc.buffer, [0, 1])
    ).rejects.toThrow("Cannot delete all pages");
  });

  it("extracts specific pages into a new document", async () => {
    const doc = await createSamplePdf(5);
    // Extract pages 1 and 3 (0-indexed: 0 and 2)
    const extracted = await ClientPDFOps.extractPages(doc.buffer, [0, 2]);
    const meta = await ClientPDFOps.inspectPDF(extracted.buffer);

    expect(meta.pageCount).toBe(2);
  });

  it("reorders pages according to custom array", async () => {
    const doc = await createSamplePdf(3);
    // Reverse order: 2, 1, 0
    const reordered = await ClientPDFOps.reorderPages(doc.buffer, [2, 1, 0]);
    const meta = await ClientPDFOps.inspectPDF(reordered.buffer);

    expect(meta.pageCount).toBe(3);
  });

  it("rotates pages correctly", async () => {
    const doc = await createSamplePdf(2);
    // Rotate page 1 by 90 degrees
    const rotated = await ClientPDFOps.rotatePages(doc.buffer, { 0: 90 });
    const meta = await ClientPDFOps.inspectPDF(rotated.buffer);

    expect(meta.pages[0].rotation).toBe(90);
    expect(meta.pages[1].rotation).toBe(0);
  });
});
