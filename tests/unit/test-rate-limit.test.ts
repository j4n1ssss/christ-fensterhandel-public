/**
 * Unit tests for in-memory rate limiter.
 *
 * @jest-environment node
 */

import { checkRateLimit, withRateLimit, _resetStore } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    _resetStore();
  });

  describe("checkRateLimit", () => {
    it("allows first N calls within limit", () => {
      const result1 = checkRateLimit("test:ip1", 3, 60_000);
      const result2 = checkRateLimit("test:ip1", 3, 60_000);
      const result3 = checkRateLimit("test:ip1", 3, 60_000);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it("blocks on the call exceeding the limit", () => {
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);

      const result = checkRateLimit("test:ip1", 3, 60_000);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it("isolates keys: different keys do not interfere", () => {
      // Exhaust limit for ip1
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000); // blocked

      // ip2 should still be allowed
      const result = checkRateLimit("test:ip2", 3, 60_000);
      expect(result.allowed).toBe(true);
    });

    it("resets after window expires", () => {
      const realDateNow = Date.now;
      let mockTime = 1000000;

      Date.now = () => mockTime;

      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);
      checkRateLimit("test:ip1", 3, 60_000);

      const blocked = checkRateLimit("test:ip1", 3, 60_000);
      expect(blocked.allowed).toBe(false);

      // Advance time past the window
      mockTime += 61_000;

      const afterExpiry = checkRateLimit("test:ip1", 3, 60_000);
      expect(afterExpiry.allowed).toBe(true);

      Date.now = realDateNow;
    });
  });

  describe("withRateLimit", () => {
    it("returns 429 with JSON body and Retry-After header when limit exceeded", async () => {
      const handler = jest
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );

      const wrapped = withRateLimit(handler, {
        limit: 1,
        windowMs: 60_000,
        keyPrefix: "test-wrap",
      });

      const makeRequest = () =>
        new Request("http://localhost/api/test", {
          headers: { "x-forwarded-for": "1.2.3.4" },
        });

      // First call passes through
      await wrapped(makeRequest());
      expect(handler).toHaveBeenCalledTimes(1);

      // Second call gets blocked
      const response = await wrapped(makeRequest());
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error).toBe(
        "Zu viele Anfragen. Bitte warten Sie einen Moment.",
      );
      expect(response.headers.get("Retry-After")).toBeTruthy();
    });

    it("passes through to handler when under limit", async () => {
      const handler = jest
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
        );

      const wrapped = withRateLimit(handler, {
        limit: 5,
        windowMs: 60_000,
        keyPrefix: "test-pass",
      });

      const request = new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": "5.6.7.8" },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(request);
    });
  });
});
