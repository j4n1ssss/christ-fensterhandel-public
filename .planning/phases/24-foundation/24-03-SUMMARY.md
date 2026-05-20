---
phase: 24-foundation
plan: 03
subsystem: security
tags: [rate-limiting, csrf, seed-guard, env-hygiene, security-hardening]

# Dependency graph
requires: []
provides:
  - "In-memory rate limiter with withRateLimit HOF wrapper (src/lib/rate-limit.ts)"
  - "CSRF wrapper withCsrf HOF and generateCsrfToken (src/lib/security.ts)"
  - "Rate limiting on 5 API routes + login middleware"
  - "CSRF protection on 3 mutating custom API routes + stripe checkout"
  - "Seed script production guard"
  - ".env.example tracked in git with categorized variables"
affects: [25-email, 26-pdf, 27-stripe, 28-angebots-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "withRateLimit HOF wrapper for per-route rate limiting with configurable limits"
    - "withCsrf HOF wrapper combining origin check + double-submit cookie token"
    - "Middleware-level rate limiting for Payload-managed routes (/api/users/login)"
    - "Production guard pattern at script entry point (process.exit before imports)"

key-files:
  created:
    - src/lib/rate-limit.ts
    - tests/unit/test-rate-limit.test.ts
    - tests/unit/test-csrf.test.ts
    - tests/unit/test-seed-guard.test.ts
  modified:
    - src/lib/security.ts
    - src/middleware.ts
    - src/app/api/anfrage/submit/route.ts
    - src/app/api/anfrage/calculate-price/route.ts
    - src/app/api/anfrage/validate-discount/route.ts
    - src/app/api/status-pruefen/route.ts
    - src/app/api/stripe/checkout/route.ts
    - src/seed/index.ts
    - .gitignore
    - .env.example

key-decisions:
  - "Rate limiter uses in-memory Map with 5-minute cleanup interval (no Redis, single-server Coolify)"
  - "CSRF applied only to mutating routes (submit, validate-discount, stripe/checkout) -- calculate-price and status-pruefen are read-only, no CSRF"
  - "Stripe webhook excluded from CSRF (uses Stripe signature verification)"
  - "Middleware approach for /api/users/login rate limiting because it is a Payload-managed route"
  - "Seed guard placed before all imports to prevent DB connection in production"

patterns-established:
  - "withRateLimit(handler, {limit, windowMs, keyPrefix}) for all custom API routes"
  - "withCsrf(handler) for all mutating custom API routes"
  - "Production guard at top of scripts (check NODE_ENV + DATABASE_URL)"

requirements-completed: [SEC-01, SEC-02, SEC-03, SEC-04]

# Metrics
duration: 14min
completed: 2026-03-28
---

# Phase 24 Plan 03: Security Hardening Summary

**Rate limiting on 5 API routes (Login 5/min, Submit 3/min, Status 10/min, Rabatt 10/min, Stripe 5/min), CSRF on all mutating custom routes via withCsrf HOF, seed production guard, and .env.example tracked in git**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-28T21:57:52Z
- **Completed:** 2026-03-28T22:12:49Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Created in-memory rate limiter library with Map store, cleanup interval, withRateLimit HOF wrapper, getClientIp helper, and _resetStore for testing
- Extended security.ts with generateCsrfToken (64-char hex via crypto.randomBytes) and withCsrf HOF wrapper (origin check + double-submit token)
- Protected 5 API routes with rate limiting: submit (3/min), calculate-price (10/min), validate-discount (10/min), status-pruefen (10/min), stripe/checkout (5/min)
- Protected 3 mutating routes with CSRF via withCsrf wrapper: submit, validate-discount, stripe/checkout
- Added middleware-level rate limiting for /api/users/login (5/min per IP via x-forwarded-for)
- Replaced manual isSameOriginOrReferer check in stripe/checkout with consistent withCsrf wrapper
- Added production guard to seed script (process.exit(1) when NODE_ENV=production + DATABASE_URL localhost warning)
- Removed .env.example from .gitignore so it is properly tracked in git
- Updated .env.example with categorized sections (Database, Payload, Application, Stripe, N8N, Node)
- 21 unit tests passing: 6 rate-limit, 8 CSRF, 7 seed-guard

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for rate limiter and CSRF wrapper** - `8d2139d` (test)
2. **Task 1 GREEN: Rate limiter and CSRF wrapper implementation** - `5e39799` (feat)
3. **Task 2: Apply rate limiting + CSRF to API routes, seed guard, .env fix** - `a2cd799` (feat)

_Note: Task 1 was TDD with RED (14 failing tests) then GREEN (all 14 passing) commits._

## Files Created/Modified
- `src/lib/rate-limit.ts` - In-memory rate limiter: checkRateLimit, withRateLimit, getClientIp, _resetStore
- `src/lib/security.ts` - Extended with generateCsrfToken and withCsrf (existing functions unchanged)
- `src/middleware.ts` - Added rate limiting block for /api/users/login (5/min per IP)
- `src/app/api/anfrage/submit/route.ts` - Wrapped with withRateLimit(withCsrf(_POST), { limit: 3 })
- `src/app/api/anfrage/calculate-price/route.ts` - Wrapped with withRateLimit(_POST, { limit: 10 })
- `src/app/api/anfrage/validate-discount/route.ts` - Wrapped with withRateLimit(withCsrf(_POST), { limit: 10 })
- `src/app/api/status-pruefen/route.ts` - Wrapped with withRateLimit(_POST, { limit: 10 })
- `src/app/api/stripe/checkout/route.ts` - Replaced manual CSRF with withRateLimit(withCsrf(_POST), { limit: 5 })
- `src/app/api/stripe/webhook/route.ts` - NOT modified (uses Stripe signature, no CSRF needed)
- `src/seed/index.ts` - Production guard at top: NODE_ENV check + DATABASE_URL localhost warning
- `.gitignore` - Removed .env.example entry
- `.env.example` - Updated with categorized sections and all env vars
- `tests/unit/test-rate-limit.test.ts` - 6 tests: allow, block, key isolation, window expiry, wrapper 429, wrapper passthrough
- `tests/unit/test-csrf.test.ts` - 8 tests: token generation, withCsrf rejection/passthrough, existing validateCsrfToken behavior
- `tests/unit/test-seed-guard.test.ts` - 7 tests: NODE_ENV guard, DATABASE_URL localhost patterns

## Decisions Made
- Rate limiter uses in-memory Map (no Redis) because the deployment is single-server Coolify on Netcup VPS. A 5-minute cleanup interval prevents memory leaks from expired entries.
- CSRF protection scoped to mutating routes only: submit, validate-discount, stripe/checkout. Calculate-price (read/compute) and status-pruefen (read) are not mutations so they get rate limiting only.
- Stripe webhook excluded from both CSRF and rate limiting because it uses Stripe signature verification and Stripe controls the call rate.
- Login rate limiting implemented at middleware level (not withRateLimit wrapper) because /api/users/login is a Payload-managed route that cannot be wrapped with a custom handler.
- Seed guard placed before all imports to ensure no DB connection is established in production.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Jest 30 CLI flag change: `--testPathPattern` replaced by `--testPathPatterns`, and `-x` replaced by `--bail`. Same issue as plan 24-01.
- Rate limiter setInterval prevents clean Jest exit; used `--forceExit` flag (expected behavior, not a bug).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All API routes are now rate-limited and mutating routes have CSRF protection
- Security infrastructure is complete for downstream payment/financial features (Phase 25-28)
- Seed script is safe for production deployment
- .env.example properly tracked for team onboarding

## Self-Check: PASSED

All 4 created files verified on disk. All 3 commit hashes (8d2139d, 5e39799, a2cd799) verified in git log.

---
*Phase: 24-foundation*
*Completed: 2026-03-28*
