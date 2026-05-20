interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (entry.resetAt < now) store.delete(key);
      }
    },
    5 * 60 * 1000,
  );
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    console.warn(`[Rate-Limit] Blocked: ${key} (${entry.count}/${limit})`);
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/** Extract client IP from request, handling reverse proxy (Coolify/Traefik) */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Higher-order wrapper: wraps a route handler with rate limiting */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  opts: { limit: number; windowMs: number; keyPrefix: string },
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);
    const key = `${opts.keyPrefix}:${ip}`;
    const result = checkRateLimit(key, opts.limit, opts.windowMs);

    if (!result.allowed) {
      return new Response(
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

    return handler(request);
  };
}

/** Reset store (for testing only) */
export function _resetStore() {
  store.clear();
}
