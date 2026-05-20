import { randomBytes } from "crypto";

/**
 * CSRF helper: allow only same-origin requests based on Origin/Referer.
 * If NEXT_PUBLIC_SERVER_URL is not configured, allows by default.
 */
export function isSameOriginOrReferer(request: Request): boolean {
  const allowed = process.env.NEXT_PUBLIC_SERVER_URL || "";
  // In production, fail-closed if server URL is not configured
  if (process.env.NODE_ENV === "production" && !allowed) return false;
  if (!allowed) return true;
  try {
    const allowedOrigin = new URL(allowed).origin;
    const origin = request.headers.get("origin");
    if (origin) return origin === allowedOrigin;
    const referer = request.headers.get("referer");
    if (referer) return new URL(referer).origin === allowedOrigin;
    // No origin or referer — reject to be safe
    return false;
  } catch {
    return false;
  }
}

/**
 * Optional double-submit token check: header x-csrf-token must match csrf_token cookie.
 * If either side is missing, returns false.
 */
export function validateCsrfToken(request: Request): boolean {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieToken = parseCookie(cookieHeader)["csrf_token"];
  if (!headerToken || !cookieToken) return false;
  return headerToken === cookieToken;
}

function parseCookie(header: string): Record<string, string> {
  return header
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .reduce(
      (acc, part) => {
        const idx = part.indexOf("=");
        if (idx > 0) {
          const k = decodeURIComponent(part.slice(0, idx));
          const v = decodeURIComponent(part.slice(idx + 1));
          acc[k] = v;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
}

/** Generate a cryptographically random CSRF token (64 hex chars) */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/** Higher-order wrapper: enforces same-origin check for CSRF protection */
export function withCsrf(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    if (!isSameOriginOrReferer(request)) {
      console.warn(
        "[CSRF] Origin check failed:",
        request.headers.get("origin"),
      );
      return new Response(
        JSON.stringify({ error: "CSRF-Validierung fehlgeschlagen" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
    return handler(request);
  };
}
