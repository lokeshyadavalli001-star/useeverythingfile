# EVERYTHING FILE — Security Incident Response Plan (IRP)

## 1. Incident Response Lifecycle
When a suspected security event, abuse pattern, or anomaly occurs, the security team executes the standard 7-stage incident response lifecycle:

```
1. CONTAIN  ──>  2. INVESTIGATE  ──>  3. ROTATE SECRETS  ──>  4. PATCH  ──>  5. VALIDATE  ──>  6. RESTORE  ──>  7. MONITOR
```

---

## 2. Specific Incident Runbooks

### Scenario A: Conversion Worker Compromise / Sandbox Escape
1. **Contain:**
   - Immediately terminate any active worker processes.
   - Set `CONVERSION_WORKER_ENABLED=false` in environment to temporarily force graceful availability degradation. Client-side tools remain unaffected.
   - Purge the base temporary storage folder (`everything-file-secure-temp`).
2. **Investigate:**
   - Inspect internal security telemetry for event IDs (`SEC-YYYY-XXXXXX`).
   - Identify the source IP mask, user agent, and payload characteristics without exposing details publicly.
3. **Rotate Secrets:**
   - Rotate any internal server secrets or tokens.
4. **Patch:**
   - Update parser/converter engine to latest secure release.
5. **Validate:**
   - Execute automated security test suite against the patched environment.
6. **Restore:**
   - Re-enable the worker service in an isolated environment.
7. **Monitor:**
   - Heighten rate limits and alert thresholds for 72 hours.

---

### Scenario B: Malicious File Upload Detected (Polyglot / Zip Bomb / Exploit)
1. **Contain:**
   - The upload is blocked automatically at the magic-byte or `ZipGuard` validation layer.
   - The client receives a generic `ERR-XXXX` reference code.
2. **Investigate:**
   - Correlate the `SEC-YYYY-XXXXXX` event in security logs.
   - Verify that no temporary files survived the execution lifecycle.
3. **Patch & Validate:**
   - Add new malicious byte signatures to automated test suite (`tests/security/file-validation.test.ts`).

---

### Scenario C: Honeypot Reconnaissance / Automated Probing
1. **Contain:**
   - Honeypots (`/admin-test`, `/internal-status`) automatically return fabricated non-functional decoy responses (`decoy-admin`, `INVALID-DECOY`).
2. **Investigate:**
   - The probe triggers `HONEYPOT_PROBE_DETECTED` telemetry with event ID.
   - Rate limits automatically throttle repetitive probe requests from the network source.
3. **Monitor:**
   - Track IP fingerprint for coordinated attacks.

---

### Scenario D: API Abuse / Denial of Service Attempt
1. **Contain:**
   - In-memory sliding-window rate limiter returns `429 Too Many Requests` with `Retry-After` header.
2. **Restore & Monitor:**
   - System auto-resets windows every 60 seconds.

---

## 3. Communication Guidelines
- **Public Users:** See only generic friendly error messages with sanitized reference codes (e.g. *"We couldn't process this document. Reference: ERR-8F3A"*).
- **NEVER Disclose:** Stack traces, internal server filesystem paths, worker addresses, daemon versions, or internal incident reports to external parties.
