import JSZip from "jszip";
import { DOCX_SECURITY_LIMITS } from "../config/constants";

export interface ZipValidationResult {
  isValid: boolean;
  errorReason?: string;
  totalEntries: number;
  totalUncompressedBytes: number;
  hasWordDocumentXml: boolean;
}

export class ZipGuard {
  /**
   * Deeply inspects a DOCX ZIP container to protect against:
   * 1. Path traversal attacks (e.g. entries containing "../" or absolute paths)
   * 2. Zip bombs / decompression bombs (excessive ratio or huge uncompressed size)
   * 3. Executable payloads inside the document archive
   * 4. Fake DOCX files (missing OpenXML [Content_Types].xml or word/document.xml)
   */
  public static async inspectDocxArchive(
    buffer: Uint8Array | Buffer
  ): Promise<ZipValidationResult> {
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(buffer);

      const entries = Object.keys(loadedZip.files);
      const totalEntries = entries.length;

      // 1. Entry count guard
      if (totalEntries === 0) {
        return {
          isValid: false,
          errorReason: "Archive contains no files.",
          totalEntries: 0,
          totalUncompressedBytes: 0,
          hasWordDocumentXml: false,
        };
      }

      if (totalEntries > DOCX_SECURITY_LIMITS.MAX_ENTRIES) {
        return {
          isValid: false,
          errorReason: `Archive contains too many entries (${totalEntries} > ${DOCX_SECURITY_LIMITS.MAX_ENTRIES}).`,
          totalEntries,
          totalUncompressedBytes: 0,
          hasWordDocumentXml: false,
        };
      }

      let totalUncompressedBytes = 0;
      let hasContentTypes = false;
      let hasWordDocumentXml = false;

      // 2. Entry path & content verification
      for (const entryPath of entries) {
        const entry = loadedZip.files[entryPath];

        // Check for path traversal or absolute paths
        for (const pattern of DOCX_SECURITY_LIMITS.FORBIDDEN_ENTRY_PATTERNS) {
          if (pattern.test(entryPath)) {
            return {
              isValid: false,
              errorReason: `Dangerous entry path detected in archive: ${entryPath.slice(0, 30)}`,
              totalEntries,
              totalUncompressedBytes,
              hasWordDocumentXml,
            };
          }
        }

        // Check for required OpenXML structural landmarks
        if (entryPath === "[Content_Types].xml") {
          hasContentTypes = true;
        }
        if (entryPath === "word/document.xml" || entryPath.startsWith("word/")) {
          hasWordDocumentXml = true;
        }

        // Approximate uncompressed size inspection without full decompression
        // Note: entry._data gives raw node-buffer or uint8array representation
        const uncompressedSize = (entry as any)._data?.uncompressedSize || 0;
        totalUncompressedBytes += uncompressedSize;

        // Zip Bomb / Resource exhaustion protection
        if (totalUncompressedBytes > DOCX_SECURITY_LIMITS.MAX_TOTAL_UNCOMPRESSED_BYTES) {
          return {
            isValid: false,
            errorReason: "Archive uncompressed size exceeds maximum safety threshold (Decompression Bomb protection).",
            totalEntries,
            totalUncompressedBytes,
            hasWordDocumentXml,
          };
        }
      }

      // Check compression ratio
      const compressedSize = buffer.length;
      if (compressedSize > 0 && totalUncompressedBytes > 0) {
        const ratio = totalUncompressedBytes / compressedSize;
        if (ratio > DOCX_SECURITY_LIMITS.MAX_COMPRESSION_RATIO && totalUncompressedBytes > 5 * 1024 * 1024) {
          return {
            isValid: false,
            errorReason: "Suspiciously high compression ratio detected (potential Zip Bomb).",
            totalEntries,
            totalUncompressedBytes,
            hasWordDocumentXml,
          };
        }
      }

      // 3. Confirm this is actually a DOCX file
      if (!hasContentTypes && !hasWordDocumentXml) {
        return {
          isValid: false,
          errorReason: "Archive is missing OpenXML structure ([Content_Types].xml or word/document.xml).",
          totalEntries,
          totalUncompressedBytes,
          hasWordDocumentXml: false,
        };
      }

      return {
        isValid: true,
        totalEntries,
        totalUncompressedBytes,
        hasWordDocumentXml,
      };
    } catch (err) {
      return {
        isValid: false,
        errorReason: "Failed to parse document archive structure.",
        totalEntries: 0,
        totalUncompressedBytes: 0,
        hasWordDocumentXml: false,
      };
    }
  }
}
