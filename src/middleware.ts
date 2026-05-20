import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * i18n middleware: Redirects bare CMS paths to locale-prefixed paths.
 * Non-CMS routes (konfigurator, warenkorb, kunden, admin, api, etc.) are skipped.
 */

/**
 * Decode rolle from Payload JWT cookie without crypto verification.
 * Security is enforced by Payload's access.admin on the server side.
 * This is purely a UX redirect layer.
 */
function getRoleFromToken(request: NextRequest): string | null {
  const token = request.cookies.get("payload-token")?.value;
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.rolle || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Helper: forward x-pathname header on all passthrough responses
  const forwardPathname = () => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  };

  // Rate limit login attempts (5/min per IP)
  if (pathname === "/api/users/login" && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const result = checkRateLimit(`login:${ip}`, 5, 60_000);
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Zu viele Anfragen. Bitte warten Sie einen Moment.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          },
        },
      );
    }
  }

  // Skip static files (paths with file extensions)
  if (pathname.includes(".")) return forwardPathname();

  // Customer admin block: redirect customers to /kunden area
  if (pathname.startsWith("/admin")) {
    const rolle = getRoleFromToken(request);
    if (rolle === "kunde") {
      const url = request.nextUrl.clone();
      url.pathname = "/kunden/dashboard";
      return NextResponse.redirect(url);
    }
    // Non-customer or unauthenticated: pass through to Payload
    return forwardPathname();
  }

  // All other routes: pass through
  return forwardPathname();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
