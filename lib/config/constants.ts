/**
 * EVERYTHING FILE - Security & System Constants
 * Strict boundaries, allowlists, and defense-in-depth rules.
 */

export const FILE_SIZE_LIMITS = {
  // Client-side browser tools memory safety limit
  BROWSER_TOOLS_MAX_BYTES: 100 * 1024 * 1024, // 100 MB
  // Server conversion worker limits
  CONVERSION_MAX_BYTES: 25 * 1024 * 1024, // 25 MB
  // Image tool max size
  IMAGE_MAX_BYTES: 25 * 1024 * 1024, // 25 MB
  // Target compression presets
  TARGET_1MB_BYTES: 1024 * 1024, // 1 MB
  TARGET_500KB_BYTES: 500 * 1024, // 500 KB
} as const;

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;

export type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

export const ALLOWED_MIME_TYPES: Record<AllowedExtension, string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
};

// Cryptographic / File signature magic bytes
export const MAGIC_BYTES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // RIFF
  WEBP_HEADER: [0x57, 0x45, 0x42, 0x50], // WEBP
  ZIP_DOCX: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP header used by docx)
} as const;

export const DOCX_SECURITY_LIMITS = {
  MAX_ENTRIES: 1000,
  MAX_TOTAL_UNCOMPRESSED_BYTES: 100 * 1024 * 1024, // 100 MB
  MAX_COMPRESSION_RATIO: 15, // Ratio > 15:1 triggers zip-bomb alert
  FORBIDDEN_ENTRY_PATTERNS: [
    /\.\./,             // Path traversal
    /^[/\\]/,           // Absolute paths
    /\.(exe|dll|bat|cmd|ps1|vbs|js|sh|py)$/i, // Executables inside docx
  ],
} as const;

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_CONVERSION_REQUESTS: 15,
  MAX_HONEYPOT_BURST: 5,
} as const;
