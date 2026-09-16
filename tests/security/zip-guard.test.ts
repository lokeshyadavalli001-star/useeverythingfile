import { describe, it, expect } from "vitest";
import { ZipGuard } from "@/lib/server/zip-guard";
import JSZip from "jszip";

describe("ZipGuard - DOCX Archive Security & Decompression Bomb Guard", () => {
  it("validates legitimate OpenXML DOCX archive structure", async () => {
    const zip = new JSZip();
    zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types></Types>');
    zip.file("word/document.xml", '<?xml version="1.0"?><document>Hello</document>');
    const buffer = await zip.generateAsync({ type: "uint8array" });

    const res = await ZipGuard.inspectDocxArchive(buffer);
    expect(res.isValid).toBe(true);
    expect(res.hasWordDocumentXml).toBe(true);
    expect(res.totalEntries).toBeGreaterThanOrEqual(2);
  });

  it("blocks path traversal entries in archive (../etc/passwd)", async () => {
    const zip = new JSZip();
    zip.file("[Content_Types].xml", "<Types></Types>");
    zip.file("../../../etc/passwd", "malicious traversal payload");
    const buffer = await zip.generateAsync({ type: "uint8array" });

    const res = await ZipGuard.inspectDocxArchive(buffer);
    expect(res.isValid).toBe(false);
    expect(res.errorReason).toContain("Dangerous entry path");
  });

  it("blocks archive containing dangerous executable files (.exe)", async () => {
    const zip = new JSZip();
    zip.file("[Content_Types].xml", "<Types></Types>");
    zip.file("word/payload.exe", "MZ executable payload");
    const buffer = await zip.generateAsync({ type: "uint8array" });

    const res = await ZipGuard.inspectDocxArchive(buffer);
    expect(res.isValid).toBe(false);
    expect(res.errorReason).toContain("Dangerous entry path");
  });

  it("rejects generic non-DOCX zip files missing OpenXML landmarks", async () => {
    const zip = new JSZip();
    zip.file("random_file.txt", "just plain text");
    const buffer = await zip.generateAsync({ type: "uint8array" });

    const res = await ZipGuard.inspectDocxArchive(buffer);
    expect(res.isValid).toBe(false);
    expect(res.errorReason).toContain("missing OpenXML structure");
  });

  it("rejects completely empty archive", async () => {
    const zip = new JSZip();
    const buffer = await zip.generateAsync({ type: "uint8array" });

    const res = await ZipGuard.inspectDocxArchive(buffer);
    expect(res.isValid).toBe(false);
    expect(res.errorReason).toContain("no files");
  });
});
