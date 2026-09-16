import { describe, it, expect, beforeEach } from "vitest";
import { SecurityLogger } from "@/lib/server/security-logger";

describe("SecurityLogger - Sanitized Telemetry & Correlation IDs", () => {
  beforeEach(() => {
    SecurityLogger.clearEvents();
  });

  it("generates correct SEC-YYYY-XXXXXX correlation ID format", () => {
    const id = SecurityLogger.generateEventId();
    const currentYear = new Date().getFullYear();
    expect(id).toMatch(new RegExp(`^SEC-${currentYear}-[0-9A-F]{6}$`));
  });

  it("generates user-safe generic error reference format ERR-XXXX", () => {
    const ref = SecurityLogger.generateErrorRef();
    expect(ref).toMatch(/^ERR-[0-9A-F]{4}$/);
  });

  it("masks IPv4 addresses to preserve network source while protecting individual privacy", () => {
    const masked = SecurityLogger.sanitizeIp("192.168.1.100");
    expect(masked).toBe("192.168.xxx.xxx");
  });

  it("sanitizes user agents to prevent log injection / CRLF", () => {
    const maliciousUa = "Mozilla/5.0\r\nADMIN_HEADER: injected\n<script>";
    const sanitized = SecurityLogger.sanitizeUserAgent(maliciousUa);
    expect(sanitized).not.toContain("\r");
    expect(sanitized).not.toContain("\n");
  });

  it("stores sanitized security events without document contents or credentials", () => {
    const eventId = SecurityLogger.logSecurityEvent(
      "INVALID_FILE_UPLOAD",
      "/api/pdf-to-word",
      "warning",
      "10.20.30.40",
      "TestAgent/1.0",
      { reason: "signature_mismatch" }
    );

    expect(eventId).toBeDefined();
    const events = SecurityLogger.getEvents(1);
    expect(events.length).toBe(1);
    expect(events[0].id).toBe(eventId);
    expect(events[0].endpoint).toBe("/api/pdf-to-word");
    expect(events[0].sourceIpMasked).toBe("10.20.xxx.xxx");
  });
});
