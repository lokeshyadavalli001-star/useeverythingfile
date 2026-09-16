# EVERYTHING FILE — Security Architecture & Threat Model

**Tagline:** One place for every file problem.  
**Secondary Tagline:** Convert. Compress. Organize. Protect.

---

## 1. Executive Summary & Security Philosophy
EVERYTHING FILE is engineered with a **Zero-Trust, Privacy-First, Defense-in-Depth** model. The platform is designed under the assumption that **every uploaded file is potentially hostile** and that client-side execution should be maximized to achieve zero operating cost, eliminate server storage liabilities, and protect user document confidentiality.

---

## 2. Threat Model

```
ASSETS
  ├── User Uploaded Documents (Confidentiality & Integrity)
  ├── Server Infrastructure & Worker Process (Availability & Integrity)
  ├── Server Secrets & Environment Configuration (Confidentiality)
  └── User Privacy & Anonymity (Zero Tracking / Zero Cookies)
       ↓
THREAT AGENTS
  ├── Untrusted / Hostile Web Users (Uploading malicious payloads)
  ├── Automated Vulnerability Scanners (Probing hidden/admin paths)
  ├── Malicious Polyglot Documents (Exploiting parser bugs)
  └── Resource Exhaustion / Denial of Service Attackers
       ↓
ATTACK SURFACES
  ├── File Upload Endpoints (/api/pdf-to-word, /api/word-to-pdf)
  ├── In-Memory Browser Parser Engines (pdf-lib, pdfjs-dist, Canvas)
  ├── Document Archive Decompression (DOCX / OpenXML ZIP structures)
  ├── Network Decoy Endpoints (/admin-test, /internal-status)
  └── Public HTTP Headers & Content Security Policy
```

---

## 3. Defense-in-Depth Security Controls

### 3.1. File Input Validation
- **Magic Byte Verification:** The server checks raw file binary signatures (`%PDF-`, `PK\x03\x04`, `\xFF\xD8\xFF`, `\x89PNG`, `RIFF....WEBP`). `Content-Type` headers are never trusted alone.
- **Filename Sanitization:** Filenames from users are sanitized for display only (stripping path traversals `../`, null bytes, control characters, and shell metacharacters). User filenames are **NEVER** used as server filesystem paths.
- **Double-Extension Guard:** Files with dangerous patterns such as `.pdf.exe` or `.docx.sh` are rejected before parsing.
- **File Size Boundaries:** Strict size limits are enforced (100 MB client-side browser tools, 25 MB conversion worker).

### 3.2. ZIP Bomb & Archive Decompression Guard (DOCX)
- DOCX files are ZIP archives and represent a known attack surface for path traversal and decompression bombs.
- `ZipGuard` inspects every archive entry:
  - Rejects entries with `..`, absolute paths, or executable extensions.
  - Rejects archives exceeding 1,000 entries or 100 MB uncompressed size.
  - Detects suspicious compression ratios ($> 15:1$).
  - Verifies authentic OpenXML markers (`[Content_Types].xml`, `word/document.xml`).

### 3.3. Isolated Worker & Temporary Storage
- Temporary conversion files are created in isolated directories outside the web root (`os.tmpdir()/everything-file-secure-temp/<random-uuid>`) with `0700` permissions.
- **Immediate Destruction Lifecycle:** Files are deleted in a guaranteed `finally` block immediately after conversion output is streamed.
- The conversion worker operates without database credentials, without cloud API keys, and with outbound network calls disabled.

### 3.4. HTTP Security Headers & Content Security Policy (CSP)
- `Content-Security-Policy`: Restricts scripts, frames, and connect destinations.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`

### 3.5. Rate Limiting & Abuse Mitigation
- Sliding-window in-memory rate limiter per IP address on all conversion endpoints (15 requests/minute).
- Exceeding thresholds returns standard `429 Too Many Requests` with generic error references (`ERR-XXXX`).

### 3.6. Security Telemetry & Decoy Honeypots
- Decoy endpoints (`/admin-test`, `/internal-status`) safely record probing telemetry and return fabricated non-functional payloads (`decoy-admin`).
- Telemetry logs record sanitized event IDs (`SEC-YYYY-XXXXXX`), timestamps, masked IPs, and event types.
- **STRICT AUDIT POLICY:** Logs NEVER contain passwords, tokens, session IDs, or uploaded document contents.

---

## 4. Residual Risks & Ongoing Maintenance
1. **Zero-Day Vulnerabilities in Open-Source Parsers:** Continuous dependency scanning (`npm audit`) and immediate patching.
2. **Scanned Documents Without Text:** Client-side vector text extraction requires machine-readable text; pure image scans require future OCR workers.
3. **Realistic Security Posture:** No system can honestly claim to be &quot;100% unhackable&quot;. Our system minimizes risk through defense-in-depth and architectural isolation.
