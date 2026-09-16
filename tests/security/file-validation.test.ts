import { describe, it, expect } from "vitest";
import { SecurityValidator } from "@/lib/server/security-validator";
import { MAGIC_BYTES } from "@/lib/config/constants";

describe("SecurityValidator - File Validation & Input Sanitization", () => {
  describe("Magic Bytes Verification", () => {
    it("validates legitimate PDF magic bytes %PDF", () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
      const res = SecurityValidator.validateMagicBytes(pdfBytes);
      expect(res.isValid).toBe(true);
      expect(res.detectedType).toBe("pdf");
    });

    it("validates legitimate JPEG magic bytes", () => {
      const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const res = SecurityValidator.validateMagicBytes(jpgBytes);
      expect(res.isValid).toBe(true);
      expect(res.detectedType).toBe("jpg");
    });

    it("validates legitimate PNG magic bytes", () => {
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const res = SecurityValidator.validateMagicBytes(pngBytes);
      expect(res.isValid).toBe(true);
      expect(res.detectedType).toBe("png");
    });

    it("validates legitimate WebP magic bytes", () => {
      // RIFF....WEBP
      const webpBytes = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20
      ]);
      const res = SecurityValidator.validateMagicBytes(webpBytes);
      expect(res.isValid).toBe(true);
      expect(res.detectedType).toBe("webp");
    });

    it("validates legitimate ZIP / DOCX magic bytes PK..", () => {
      const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
      const res = SecurityValidator.validateMagicBytes(docxBytes);
      expect(res.isValid).toBe(true);
      expect(res.detectedType).toBe("docx");
    });

    it("rejects malicious shell script disguised as a PDF", () => {
      const fakePdf = new TextEncoder().encode("#!/bin/bash\nrm -rf /");
      const res = SecurityValidator.validateMagicBytes(fakePdf);
      expect(res.isValid).toBe(false);
      expect(res.detectedType).toBe("unknown");
    });

    it("rejects Windows PE executable disguised as a PDF (MZ header)", () => {
      const fakePdf = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
      const res = SecurityValidator.validateMagicBytes(fakePdf);
      expect(res.isValid).toBe(false);
      expect(res.detectedType).toBe("unknown");
    });
  });

  describe("Filename Sanitization & Path Traversal Guard", () => {
    it("strips path traversal sequences ../ and ..\\", () => {
      const malicious = "../../../etc/passwd.pdf";
      const sanitized = SecurityValidator.sanitizeFilename(malicious);
      expect(sanitized).not.toContain("..");
      expect(sanitized).not.toContain("/");
      expect(sanitized).not.toContain("\\");
    });

    it("strips null bytes from filenames", () => {
      const nullByteName = "document\0.pdf.exe";
      const sanitized = SecurityValidator.sanitizeFilename(nullByteName);
      expect(sanitized).not.toContain("\0");
    });

    it("strips shell metacharacters", () => {
      const shellPayload = "file;rm -rf /;`whoami`$PATH.pdf";
      const sanitized = SecurityValidator.sanitizeFilename(shellPayload);
      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("`");
      expect(sanitized).not.toContain("$");
    });

    it("prevents hidden dotfiles", () => {
      const dotfile = ".env";
      const sanitized = SecurityValidator.sanitizeFilename(dotfile);
      expect(sanitized.startsWith(".")).toBe(false);
    });

    it("enforces max length boundaries", () => {
      const longName = "a".repeat(200) + ".pdf";
      const sanitized = SecurityValidator.sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(100);
      expect(sanitized.endsWith(".pdf")).toBe(true);
    });
  });

  describe("Double Extension Detection", () => {
    it("detects dangerous double extension .pdf.exe", () => {
      expect(SecurityValidator.hasDangerousDoubleExtension("invoice.pdf.exe")).toBe(true);
    });

    it("detects dangerous double extension .docx.js", () => {
      expect(SecurityValidator.hasDangerousDoubleExtension("report.docx.js")).toBe(true);
    });

    it("detects dangerous double extension .jpg.bat", () => {
      expect(SecurityValidator.hasDangerousDoubleExtension("photo.jpg.bat")).toBe(true);
    });

    it("allows standard benign filenames", () => {
      expect(SecurityValidator.hasDangerousDoubleExtension("annual_report_2026.pdf")).toBe(false);
      expect(SecurityValidator.hasDangerousDoubleExtension("photo.final.jpg")).toBe(false);
    });
  });

  describe("MIME & Upload Validation (Defense-in-Depth)", () => {
    it("rejects MIME spoofing where .pdf extension has JPG bytes", () => {
      const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const res = SecurityValidator.validateUpload("test.pdf", "application/pdf", jpgBytes, "pdf");
      expect(res.isValid).toBe(false);
      expect(res.errorReason).toContain("mismatch");
    });

    it("rejects non-allowlisted extension .svg", () => {
      const svgBytes = new TextEncoder().encode("<svg onload=alert(1)>");
      const res = SecurityValidator.validateUpload("vector.svg", "image/svg+xml", svgBytes);
      expect(res.isValid).toBe(false);
      expect(res.errorReason).toContain("not allowed");
    });
  });
});
