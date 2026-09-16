# EVERYTHING FILE

> **Tagline:** One place for every file problem.  
> **Secondary Tagline:** Convert. Compress. Organize. Protect.

A production-quality, browser-first file utility platform designed with a **Zero-Operating-Cost**, **Zero-Trust**, and **Privacy-First** architecture.

---

## 🌟 Key Architectural Features

1. **100% Client-Side Processing for Standard Tools:**  
   All 12 PDF tools and 8 Image tools run directly inside the browser using WebAssembly and HTML5 Canvas (`pdf-lib`, `pdfjs-dist`, Canvas API). **Your files are never uploaded to any server** for standard processing.
2. **Zero Operating Cost:**  
   No paid third-party APIs, no paid cloud storage buckets, no paid databases, and no monthly API consumption fees.
3. **Isolated Document Conversion Subsystem (PDF ↔ Word):**  
   Strict defense-in-depth API worker architecture (`/api/pdf-to-word`, `/api/word-to-pdf`) with:
   - Cryptographically randomized internal IDs (user filenames are **never** used as filesystem paths)
   - Magic byte verification (`%PDF-`, `PK\x03\x04`)
   - Deep DOCX Zip inspection (protection against Zip bombs, path traversal `../`, and embedded executables)
   - Temporary file lifecycle outside web root with immediate purge upon completion
   - High-fidelity in-browser semantic DOCX generator fallback
4. **OWASP Top 10 Hardened Security:**  
   - Strict Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
   - Decoy honeypots (`/admin-test`, `/internal-status`) logging telemetry without capturing credentials
   - In-memory sliding window rate limiting
   - Sanitized security correlation IDs (`SEC-YYYY-XXXXXX`)
   - Zero tracking cookies and zero authentication cookies

---

## 🛠️ Supported Tools (22 Tools Total)

### 📄 PDF Tools
- **Merge PDF (`/merge-pdf`):** Combine multiple PDF documents with visual reordering.
- **Split PDF (`/split-pdf`):** Split by page ranges or extract all pages into a ZIP.
- **Compress PDF (`/compress-pdf`):** 3-level stream optimization (Extreme, Recommended, Less).
- **Compress PDF to 1 MB (`/compress-pdf-to-1mb`):** Calibrated for government and university portals.
- **Compress PDF to 500 KB (`/compress-pdf-to-500kb`):** Target optimization for strict email attachments.
- **PDF → JPG (`/pdf-to-jpg`):** High-resolution page-by-page rendering with batch ZIP download.
- **JPG → PDF (`/jpg-to-pdf`):** Transform multiple photos into a consolidated PDF with margins & orientation.
- **Delete PDF Pages (`/delete-pdf-pages`):** Interactive visual grid to select and remove pages.
- **Extract PDF Pages (`/extract-pdf-pages`):** Interactive visual grid to export selected pages.
- **Reorder PDF (`/reorder-pdf`):** Rearrange page sequence with drag-and-drop or touch arrows.
- **Rotate PDF (`/rotate-pdf`):** Rotate individual pages or all pages ($90^\circ, 180^\circ, 270^\circ$).
- **PDF → Text (`/pdf-to-text`):** Extract selectable text into plain text with copy & `.txt` download.

### 🖼️ Image Tools
- **Compress Image (`/compress-image`):** Quality slider (1–100%) with real-time size delta.
- **Resize Image (`/resize-image`):** Dimension scaling (px) or presets (25%, 50%, 75%) with aspect ratio lock.
- **JPG → PNG (`/jpg-to-png`):** Lossless PNG conversion.
- **PNG → JPG (`/png-to-jpg`):** Quality conversion with custom background color fill for transparent areas.
- **JPG → WebP (`/jpg-to-webp`):** Modern WebP compression.
- **WebP → JPG (`/webp-to-jpg`):** Universal JPG compatibility.
- **Image → PDF (`/image-to-pdf`):** Multi-format (JPG, PNG, WebP) to PDF document.
- **Crop Image (`/crop-image`):** Precision cropper with 1:1, 4:3, 16:9 presets, zoom, and rotation.

### 📝 Document Conversion Subsystem
- **PDF → Word (`/pdf-to-word`):** Convert PDF to editable Word `.docx` via client generator or isolated worker.
- **Word → PDF (`/word-to-pdf`):** Convert Word `.docx` to universal read-only PDF with sandbox validation.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Security & Tool Tests
```bash
npm test
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🔒 Security Documentation
- [Security Architecture & Threat Model](file:///c:/Users/yadav/OneDrive/Desktop/Everything%20File/docs/SECURITY.md)
- [Security Incident Response Plan](file:///c:/Users/yadav/OneDrive/Desktop/Everything%20File/docs/INCIDENT_RESPONSE.md)

---

## 📄 License
Open source under the MIT License.
