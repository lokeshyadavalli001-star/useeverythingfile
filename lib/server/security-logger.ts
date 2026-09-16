import crypto from "crypto";

export type SecuritySeverity = "info" | "warning" | "high" | "critical";

export interface SecurityEvent {
  id: string;             // SEC-YYYY-XXXXXX
  timestamp: string;
  eventType: string;
  endpoint: string;
  severity: SecuritySeverity;
  sourceIpMasked: string; // Sanitized/hashed or masked
  userAgentSanitized: string;
  details?: Record<string, string | number | boolean>;
}

export class SecurityLogger {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_LOG_RETENTION = 500;

  /**
   * Generates a security correlation event ID (e.g. SEC-2026-8F4A2C)
   */
  public static generateEventId(): string {
    const year = new Date().getFullYear();
    const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `SEC-${year}-${rand}`;
  }

  /**
   * Generates a generic public error reference (e.g. ERR-8F3A)
   */
  public static generateErrorRef(): string {
    return `ERR-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  }

  /**
   * Masks or hashes an IP address to preserve privacy while supporting abuse monitoring
   */
  public static sanitizeIp(ip: string | null | undefined): string {
    if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
      return "127.0.0.1";
    }
    // Mask IPv4: 192.168.1.100 -> 192.168.xxx.xxx
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.xxx.xxx`;
      }
    }
    // Hash IPv6 or complex IPs
    return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12);
  }

  /**
   * Sanitizes User Agent string to prevent header injection in logs
   */
  public static sanitizeUserAgent(ua: string | null | undefined): string {
    if (!ua) return "Unknown";
    // Strip control characters, keep max 120 chars
    return ua.replace(/[\r\n\x00-\x1f]/g, "").slice(0, 120);
  }

  /**
   * Safely logs a security event.
   * STRICT POLICY: NEVER logs passwords, tokens, API keys, session IDs, or file contents.
   */
  public static logSecurityEvent(
    eventType: string,
    endpoint: string,
    severity: SecuritySeverity,
    rawIp?: string | null,
    rawUserAgent?: string | null,
    details?: Record<string, string | number | boolean>
  ): string {
    const eventId = this.generateEventId();
    const event: SecurityEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      eventType,
      endpoint,
      severity,
      sourceIpMasked: this.sanitizeIp(rawIp),
      userAgentSanitized: this.sanitizeUserAgent(rawUserAgent),
      details: details ? { ...details } : undefined,
    };

    this.events.unshift(event);
    if (this.events.length > this.MAX_LOG_RETENTION) {
      this.events.pop();
    }

    // In non-production or server stdout, print sanitized structure
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[SECURITY ${severity.toUpperCase()}] [${eventId}] ${eventType} @ ${endpoint} (${event.sourceIpMasked})`);
    }

    return eventId;
  }

  /**
   * Internal telemetry getter for testing and diagnostics.
   * Never exposed to public endpoints.
   */
  public static getEvents(limit: number = 20): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  public static clearEvents(): void {
    this.events = [];
  }
}
