import { RATE_LIMIT_CONFIG } from "../config/constants";

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private static store: Map<string, RateLimitRecord> = new Map();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  private static ensureCleanup() {
    if (!this.cleanupInterval) {
      // Periodic purge of stale records every 2 minutes
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
          const fresh = record.timestamps.filter(
            (t) => now - t < RATE_LIMIT_CONFIG.WINDOW_MS
          );
          if (fresh.length === 0) {
            this.store.delete(key);
          } else {
            record.timestamps = fresh;
          }
        }
      }, 2 * 60 * 1000);

      // Allow node to exit cleanly
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Evaluates if a request is permitted under rate limit thresholds.
   */
  public static check(
    identifier: string,
    limit: number = RATE_LIMIT_CONFIG.MAX_CONVERSION_REQUESTS,
    windowMs: number = RATE_LIMIT_CONFIG.WINDOW_MS
  ): { isAllowed: boolean; remaining: number; resetMs: number } {
    this.ensureCleanup();

    const now = Date.now();
    let record = this.store.get(identifier);

    if (!record) {
      record = { timestamps: [] };
      this.store.set(identifier, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, windowMs - (now - oldest));
      return {
        isAllowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record this new request timestamp
    record.timestamps.push(now);

    return {
      isAllowed: true,
      remaining: limit - record.timestamps.length,
      resetMs: windowMs,
    };
  }

  public static reset(): void {
    this.store.clear();
  }
}
