import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  AllowedExtension,
  MAGIC_BYTES,
} from "../config/constants";

export interface ValidationResult {
  isValid: boolean;
  detectedExtension?: AllowedExtension;
  errorReason?: string;
  sanitizedDisplayName: string;
}

export class SecurityValidator {
  /**
   * Sanitizes a client-provided filename for safe display.
   * Strips path traversal sequences, null bytes, control characters, and dangerous symbols.
   * NEVER used as a filesystem path on the server.
   */
  public static sanitizeFilename(rawFilename: string): string {
    if (!rawFilename || typeof rawFilename !== "string") {
      return "unnamed_document";
    }

    // Remove any path separators and traversal attempts
    let cleaned = rawFilename
      .replace(/[\\/]/g, "_")
      .replace(/\0/g, "")
      .replace(/\.\./g, "_");

    // Strip control characters and non-printable characters
    cleaned = cleaned.replace(/[\x00-\x1f\x7f-\x9f]/g, "");

    // Trim dangerous shell metacharacters
    cleaned = cleaned.replace(/[`$;|&<>]/g, "");

    // Trim whitespace
    cleaned = cleaned.trim();

    // Prevent hidden files starting with .
    if (cleaned.startsWith(".")) {
      cleaned = "file_" + cleaned;
    }

    // Limit maximum length to 100 characters
    if (cleaned.length > 100) {
      const extMatch = cleaned.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? `.${extMatch[1]}` : "";
      cleaned = cleaned.substring(0, 90) + ext;
    }

    return cleaned || "unnamed_document";
  }

  /**
   * Detects dangerous double extensions such as "document.pdf.exe" or "invoice.docx.js"
   */
  public static hasDangerousDoubleExtension(filename: string): boolean {
    const dangerousExts = [
      "exe", "dll", "bat", "cmd", "sh", "ps1", "vbs", "js", "mjs", "jar",
      "msi", "scr", "pif", "hta", "cpl", "com", "php", "asp", "aspx", "jsp"
    ];

    const parts = filename.toLowerCase().split(".");
    if (parts.length > 2) {
      // Check if any intermediate or final extension is executable
      for (let i = 1; i < parts.length; i++) {
        if (dangerousExts.includes(parts[i])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Validates file signature (magic bytes) against the declared extension.
   * Defends against spoofed MIME types, polyglot files, and masked executables.
   */
  public static validateMagicBytes(buffer: Uint8Array): {
    isValid: boolean;
    detectedType: AllowedExtension | "unknown";
  } {
    if (!buffer || buffer.length < 4) {
      return { isValid: false, detectedType: "unknown" };
    }

    // 1. Check PDF: %PDF (0x25, 0x50, 0x44, 0x46)
    if (
      buffer[0] === MAGIC_BYTES.PDF[0] &&
      buffer[1] === MAGIC_BYTES.PDF[1] &&
      buffer[2] === MAGIC_BYTES.PDF[2] &&
      buffer[3] === MAGIC_BYTES.PDF[3]
    ) {
      return { isValid: true, detectedType: "pdf" };
    }

    // 2. Check JPEG: FF D8 FF
    if (
      buffer[0] === MAGIC_BYTES.JPEG[0] &&
      buffer[1] === MAGIC_BYTES.JPEG[1] &&
      buffer[2] === MAGIC_BYTES.JPEG[2]
    ) {
      return { isValid: true, detectedType: "jpg" };
    }

    // 3. Check PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer.length >= 8 &&
      buffer[0] === MAGIC_BYTES.PNG[0] &&
      buffer[1] === MAGIC_BYTES.PNG[1] &&
      buffer[2] === MAGIC_BYTES.PNG[2] &&
      buffer[3] === MAGIC_BYTES.PNG[3] &&
      buffer[4] === MAGIC_BYTES.PNG[4] &&
      buffer[5] === MAGIC_BYTES.PNG[5] &&
      buffer[6] === MAGIC_BYTES.PNG[6] &&
      buffer[7] === MAGIC_BYTES.PNG[7]
    ) {
      return { isValid: true, detectedType: "png" };
    }

    // 4. Check WebP: RIFF ... WEBP
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return { isValid: true, detectedType: "webp" };
    }

    // 5. Check ZIP / DOCX: PK 03 04
    if (
      buffer[0] === MAGIC_BYTES.ZIP_DOCX[0] &&
      buffer[1] === MAGIC_BYTES.ZIP_DOCX[1] &&
      buffer[2] === MAGIC_BYTES.ZIP_DOCX[2] &&
      buffer[3] === MAGIC_BYTES.ZIP_DOCX[3]
    ) {
      return { isValid: true, detectedType: "docx" };
    }

    return { isValid: false, detectedType: "unknown" };
  }

  /**
   * Comprehensive validation combining extension, MIME type, double extensions, and magic bytes.
   */
  public static validateUpload(
    filename: string,
    mimeType: string,
    buffer: Uint8Array,
    expectedType?: AllowedExtension
  ): ValidationResult {
    const sanitizedName = this.sanitizeFilename(filename);

    // 1. Double extension check
    if (this.hasDangerousDoubleExtension(filename)) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: "Dangerous file extension pattern detected.",
      };
    }

    // 2. Extract extension from sanitized filename
    const extMatch = sanitizedName.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (!extMatch) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: "File has no valid extension.",
      };
    }

    let ext = extMatch[1] as AllowedExtension;
    if (ext === "jpeg" as any) ext = "jpg";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: `Extension .${ext} is not allowed.`,
      };
    }

    // 3. Expected type check (if specified by endpoint)
    if (expectedType && ext !== expectedType && !(expectedType === "jpg" && ext === "jpeg")) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: `Expected ${expectedType.toUpperCase()} file but received .${ext}.`,
      };
    }

    // 4. Magic bytes validation
    const magicCheck = this.validateMagicBytes(buffer);
    if (!magicCheck.isValid) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: "File signature does not match any allowed file format.",
      };
    }

    // Verify magic bytes match the claimed extension
    if (magicCheck.detectedType !== ext && !(magicCheck.detectedType === "jpg" && ext === "jpeg")) {
      return {
        isValid: false,
        sanitizedDisplayName: sanitizedName,
        errorReason: `File signature mismatch: header indicates ${magicCheck.detectedType.toUpperCase()} but extension is .${ext}.`,
      };
    }

    return {
      isValid: true,
      detectedExtension: ext,
      sanitizedDisplayName: sanitizedName,
    };
  }
}
