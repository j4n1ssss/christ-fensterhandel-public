---
phase: 16-session-persistence-role-visibility
plan: 02
subsystem: auth
tags: [payload-access-control, middleware, jwt, role-based-access, customer-block]

# Dependency graph
requires:
  - phase: 16-01
    provides: "Session persistence and role visibility nav filtering"
provides:
  - "access.admin function on Users collection blocking customers"
  - "Middleware customer redirect /admin -> /kunden/dashboard"
  - "getRoleFromToken Edge-safe JWT cookie parser"
  - "Test coverage for admin access block and middleware redirect"
affects: [kunden-portal, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: ["access.admin for collection-level admin panel restriction", "JWT payload base64 decode in middleware without crypto verification"]

key-files:
  created:
    - tests/unit/test-access-admin-block.test.ts
    - tests/unit/test-middleware-redirect.test.ts
  modified:
    - src/collections/system/users.ts
    - src/middleware.ts

key-decisions:
  - "Dual-layer security: access.admin for server-side enforcement + middleware for UX redirect"
  - "Middleware uses @jest-environment node for Next.js server API compatibility in tests"
  - "Unauthenticated users pass through to Payload login (not redirected to /kunden)"

patterns-established:
  - "access.admin pattern: return req.user.rolle !== 'kunde' blocks customers while allowing all staff"
  - "JWT cookie decode pattern: atob(payload.split('.')[1]) for Edge-safe role extraction without crypto"
  - "@jest-environment node docblock for testing Next.js middleware in Jest"

requirements-completed: [UX-03]

# Metrics
duration: 5min
completed: 2026-03-23
---

# Phase 16 Plan 02: Admin Access Block Summary

**Payload access.admin blocking customers plus middleware redirect from /admin to /kunden/dashboard with Edge-safe JWT cookie parsing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-23T19:20:01Z
- **Completed:** 2026-03-23T19:25:24Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Users collection now has access.admin function that blocks rolle=kunde from admin panel
- Middleware intercepts /admin routes, decodes JWT cookie, redirects customers to /kunden/dashboard
- 13 new tests covering all role scenarios (admin, mitarbeiter, viewer, kunde, unauthenticated)
- Full test suite (340 tests) passes with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test scaffolds for access.admin block and middleware redirect** - `c8541a1` (test)
2. **Task 2: Implement access.admin on Users collection and customer redirect in middleware** - `a2d9e32` (feat)

_Note: TDD flow -- Task 1 was RED phase (failing tests), Task 2 was GREEN phase (implementation)_

## Files Created/Modified
- `tests/unit/test-access-admin-block.test.ts` - 6 tests for access.admin per role (admin/mitarbeiter/viewer/kunde/null)
- `tests/unit/test-middleware-redirect.test.ts` - 7 tests for middleware redirect (customer redirect, staff passthrough, non-admin routes)
- `src/collections/system/users.ts` - Added access.admin function blocking customers
- `src/middleware.ts` - Added getRoleFromToken helper and customer redirect logic for /admin routes

## Decisions Made
- Used BOTH access.admin (server-side security) AND middleware (UX redirect) -- defense-in-depth approach
- Unauthenticated users on /admin pass through to Payload's own login page (not redirected to /kunden)
- Removed /admin from SKIP_PREFIXES array, handled explicitly before the loop for redirect logic
- Used @jest-environment node docblock for middleware tests (jsdom lacks Web API Request/Response globals)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Jest middleware test environment**
- **Found during:** Task 1 (test scaffold creation)
- **Issue:** jsdom test environment lacks Request/Response/Headers Web API globals needed by next/server
- **Fix:** Used @jest-environment node docblock for test-middleware-redirect.test.ts
- **Files modified:** tests/unit/test-middleware-redirect.test.ts
- **Verification:** Tests execute without import errors, 7 tests pass
- **Committed in:** c8541a1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Environment fix necessary for test execution. No scope creep.

## Issues Encountered
None beyond the jest environment deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Customer admin block is complete and tested
- Customers are redirected to /kunden/dashboard when accessing /admin
- Staff roles (admin/mitarbeiter/viewer) have normal admin panel access
- /kunden/* routes need to exist for the redirect to land on valid pages (future phase)

## Self-Check: PASSED

All 5 files verified present. Both commit hashes (c8541a1, a2d9e32) found in git log.

---
*Phase: 16-session-persistence-role-visibility*
*Plan: 02*
*Completed: 2026-03-23*
