import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "@/lib/server/rate-limiter";

describe("RateLimiter - Sliding Window Endpoint Protection", () => {
  beforeEach(() => {
    RateLimiter.reset();
  });

  it("permits requests within the rate limit threshold", () => {
    const ip = "192.168.1.50";
    for (let i = 0; i < 5; i++) {
      const res = RateLimiter.check(ip, 5, 10000);
      expect(res.isAllowed).toBe(true);
    }
  });

  it("blocks requests that exceed the rate limit threshold", () => {
    const ip = "10.0.0.99";
    // Threshold = 3
    RateLimiter.check(ip, 3, 10000);
    RateLimiter.check(ip, 3, 10000);
    RateLimiter.check(ip, 3, 10000);

    const fourthRequest = RateLimiter.check(ip, 3, 10000);
    expect(fourthRequest.isAllowed).toBe(false);
    expect(fourthRequest.remaining).toBe(0);
    expect(fourthRequest.resetMs).toBeGreaterThan(0);
  });

  it("isolates rate limits per distinct IP address", () => {
    const ip1 = "172.16.0.1";
    const ip2 = "172.16.0.2";

    RateLimiter.check(ip1, 1, 10000);
    const ip1Second = RateLimiter.check(ip1, 1, 10000);
    expect(ip1Second.isAllowed).toBe(false);

    // ip2 should still be allowed
    const ip2First = RateLimiter.check(ip2, 1, 10000);
    expect(ip2First.isAllowed).toBe(true);
  });
});
