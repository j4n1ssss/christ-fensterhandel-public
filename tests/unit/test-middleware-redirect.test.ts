/**
 * @jest-environment node
 *
 * This test file uses the Node environment (not jsdom) because Next.js middleware
 * depends on Web API globals (Request, Response, Headers) which are natively
 * available in Node 22 but not in jsdom.
 */
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

/**
 * Helper to create a mock NextRequest with optional JWT cookie payload.
 * The JWT payload is base64-encoded to simulate Payload's JWT format.
 * No crypto verification needed -- middleware only reads the rolle claim.
 */
function createMockRequest(
  pathname: string,
  jwtPayload?: Record<string, unknown>,
): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  const request = new NextRequest(url);
  if (jwtPayload) {
    const payloadBase64 = btoa(JSON.stringify(jwtPayload));
    const token = `header.${payloadBase64}.signature`;
    request.cookies.set("payload-token", token);
  }
  return request;
}

describe("Middleware customer redirect for /admin routes", () => {
  it("redirects customer (rolle=kunde) accessing /admin to /kunden/dashboard", () => {
    const request = createMockRequest("/admin", {
      rolle: "kunde",
      email: "kunde@test.de",
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/kunden/dashboard");
  });

  it("passes through unauthenticated user (no payload-token cookie) accessing /admin", () => {
    const request = createMockRequest("/admin");
    const response = middleware(request);

    // Should NOT redirect -- passes through to Payload which handles auth
    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through admin (rolle=admin) accessing /admin normally", () => {
    const request = createMockRequest("/admin", {
      rolle: "admin",
      email: "admin@christ.de",
    });
    const response = middleware(request);

    // Should NOT redirect -- admin has access
    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects customer accessing /admin/collections/users to /kunden/dashboard", () => {
    const request = createMockRequest("/admin/collections/users", {
      rolle: "kunde",
      email: "kunde@test.de",
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/kunden/dashboard");
  });

  it("does NOT affect non-admin routes for customers", () => {
    const routes = [
      "/konfigurator",
      "/kunden/dashboard",
      "/warenkorb",
      "/anfrage",
    ];
    for (const route of routes) {
      const request = createMockRequest(route, {
        rolle: "kunde",
        email: "kunde@test.de",
      });
      const response = middleware(request);

      // Non-admin routes should not redirect to /kunden/dashboard
      const location = response.headers.get("location");
      if (location) {
        expect(location).not.toContain("/kunden/dashboard");
      }
    }
  });

  it("passes through mitarbeiter accessing /admin normally", () => {
    const request = createMockRequest("/admin", {
      rolle: "mitarbeiter",
      email: "mitarbeiter@christ.de",
    });
    const response = middleware(request);

    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through viewer accessing /admin normally", () => {
    const request = createMockRequest("/admin", {
      rolle: "viewer",
      email: "viewer@christ.de",
    });
    const response = middleware(request);

    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });
});
