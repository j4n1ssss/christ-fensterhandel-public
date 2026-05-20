/**
 * Unit tests for CSRF helpers (generateCsrfToken, withCsrf, validateCsrfToken).
 *
 * @jest-environment node
 */

describe("CSRF Helpers", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SERVER_URL;
  });

  describe("generateCsrfToken", () => {
    it("returns a 64-character hex string", async () => {
      const { generateCsrfToken } = await import("@/lib/security");
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns different values on each call", async () => {
      const { generateCsrfToken } = await import("@/lib/security");
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("withCsrf", () => {
    it("rejects request with no origin header (returns 403)", async () => {
      const { withCsrf } = await import("@/lib/security");
      const handler = jest.fn().mockResolvedValue(new Response("ok"));

      const wrapped = withCsrf(handler);
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it("rejects request with wrong CSRF token (returns 403)", async () => {
      const { withCsrf } = await import("@/lib/security");
      const handler = jest.fn().mockResolvedValue(new Response("ok"));

      const wrapped = withCsrf(handler);
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          "x-csrf-token": "wrong-token",
          Cookie: "csrf_token=correct-token",
        },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("CSRF-Token ungueltig");
      expect(handler).not.toHaveBeenCalled();
    });

    it("passes through when origin matches AND token matches", async () => {
      const { withCsrf } = await import("@/lib/security");
      const handler = jest
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );

      const wrapped = withCsrf(handler);
      const token = "abc123";
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          "x-csrf-token": token,
          Cookie: `csrf_token=${token}`,
        },
      });

      const response = await wrapped(request);
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(request);
    });
  });

  describe("validateCsrfToken (existing behavior)", () => {
    it("returns false when no cookie", async () => {
      const { validateCsrfToken } = await import("@/lib/security");
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: { "x-csrf-token": "some-token" },
      });

      expect(validateCsrfToken(request)).toBe(false);
    });

    it("returns false when no header", async () => {
      const { validateCsrfToken } = await import("@/lib/security");
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: { Cookie: "csrf_token=some-token" },
      });

      expect(validateCsrfToken(request)).toBe(false);
    });

    it("returns true when cookie and header match", async () => {
      const { validateCsrfToken } = await import("@/lib/security");
      const token = "matching-token-value";
      const request = new Request("http://localhost:3000/api/test", {
        method: "POST",
        headers: {
          "x-csrf-token": token,
          Cookie: `csrf_token=${token}`,
        },
      });

      expect(validateCsrfToken(request)).toBe(true);
    });
  });
});
