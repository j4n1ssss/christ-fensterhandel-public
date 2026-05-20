---
phase: 04-dashboards-und-rollen
plan: 01
subsystem: auth
tags: [access-control, payload-cms, jwt, role-based, status-machine]

requires:
  - phase: 01-fundament
    provides: "Users collection with rolle field, all CMS collections, StatusHistorie"
provides:
  - "Access control functions (isAdmin, isAdminOrMitarbeiter, isOwnAnfrage)"
  - "Role check helpers (hasRole, isStaff, staffCanRead, staffCanWrite)"
  - "Status transition validation (VALID_TRANSITIONS, COMMENT_REQUIRED, isValidTransition)"
  - "saveToJWT on rolle field for JWT-based access control"
  - "Field-level access on interne_notizen, kontaktdaten, gesamtpreis"
  - "All 21 collections locked down with explicit access control"
affects: [04-02, 04-03, 05-automation, api-endpoints]

tech-stack:
  added: []
  patterns: [payload-access-functions, field-level-access, status-state-machine, tdd-red-green]

key-files:
  created:
    - src/access/is-admin.ts
    - src/access/is-admin-or-mitarbeiter.ts
    - src/access/is-own-anfrage.ts
    - src/access/role-checks.ts
    - src/lib/status-transitions.ts
    - tests/unit/test-access-control.test.ts
    - tests/unit/test-status-transitions.test.ts
  modified:
    - src/collections/system/users.ts
    - src/collections/system/media.ts
    - src/collections/business/anfragen.ts
    - src/collections/business/status-historie.ts
    - src/collections/business/preisregeln.ts
    - src/collections/business/rabattcodes.ts
    - src/collections/produkte/*.ts (7 files)
    - src/collections/ausstattung/*.ts (8 files)

key-decisions:
  - "Field-level access uses inline arrow functions instead of Access type imports (Payload FieldAccess vs Access type incompatibility)"
  - "Task 3 merged into Task 2 commit since _status_kommentar and afterChange hook are tightly coupled with status transition validation"
  - "Pre-existing SSG build error (useSearchParams Suspense) documented as out of scope"

patterns-established:
  - "Access function pattern: src/access/*.ts exports Payload Access functions"
  - "Role helper pattern: hasRole(user, roles[]) for reusable role checks"
  - "Field-level access: inline ({ req }) => ... for Payload FieldAccess compatibility"
  - "Status state machine: VALID_TRANSITIONS record with isValidTransition validator"

requirements-completed: [SEC-01, SEC-02, SEC-03, ADMIN-04, ADMIN-05, ADMIN-06]

duration: 6min
completed: 2026-03-10
---

# Phase 4 Plan 1: Access Control & Status Transitions Summary

**Role-based access control on all 21 Payload collections with status transition state machine, field-level security, and 56 unit tests (TDD)**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T06:51:07Z
- **Completed:** 2026-03-10T06:57:31Z
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments
- All 21 collections locked down with explicit access control (no open defaults)
- Status transition validation prevents invalid state changes (e.g., neu -> abgeschlossen blocked)
- Comment required for RUECKFRAGE and ABGELEHNT transitions
- saveToJWT: true on rolle field enables JWT-based access control
- Field-level access: interne_notizen (staff only), kontaktdaten (admin update), gesamtpreis (admin update)
- 56 unit tests covering all role permutations and transition rules (TDD)
- afterChange hook placeholder ready for Phase 5 N8N webhook integration

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Access control + status transition tests** - `3c4a931` (test)
2. **Task 1 GREEN: Access control utilities + status transition logic** - `50c61ae` (feat)
3. **Task 2+3: Apply access control to all collections + saveToJWT + transition validation + _status_kommentar** - `9f437ab` (feat)

_Note: Task 3 was naturally included in Task 2 since _status_kommentar field and afterChange hook are tightly coupled with status transition validation._

## Files Created/Modified
- `src/access/is-admin.ts` - Admin-only access function
- `src/access/is-admin-or-mitarbeiter.ts` - Staff (admin/mitarbeiter) access function
- `src/access/is-own-anfrage.ts` - Kunde sees own Anfragen, staff sees all
- `src/access/role-checks.ts` - hasRole, isStaff, staffCanRead, staffCanWrite helpers
- `src/lib/status-transitions.ts` - VALID_TRANSITIONS map, COMMENT_REQUIRED, isValidTransition, getNextStatuses
- `src/collections/system/users.ts` - saveToJWT, access control, admin.hidden for Kunde
- `src/collections/business/anfragen.ts` - Full access control, transition validation, field-level access, _status_kommentar, afterChange placeholder
- `src/collections/business/status-historie.ts` - create=isAdminOrMitarbeiter
- `src/collections/business/preisregeln.ts` - read=isAdminOrMitarbeiter, CUD=isAdmin
- `src/collections/business/rabattcodes.ts` - read=isAdminOrMitarbeiter, CUD=isAdmin
- `src/collections/system/media.ts` - read=public, CUD=isAdmin
- `src/collections/produkte/*.ts` (7 files) - read=public, CUD=isAdmin
- `src/collections/ausstattung/*.ts` (8 files) - read=public, CUD=isAdmin
- `tests/unit/test-access-control.test.ts` - 36 tests for all access functions
- `tests/unit/test-status-transitions.test.ts` - 20 tests for transition logic

## Decisions Made
- Field-level access uses inline arrow functions instead of imported Access type (Payload FieldAccess type differs from collection-level Access type)
- Task 3 merged into Task 2 commit since _status_kommentar and afterChange hook are tightly coupled with status transition validation
- Pre-existing SSG build error with useSearchParams Suspense boundary is out of scope (not introduced by this plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hasRole null safety for nullable rolle field**
- **Found during:** Task 2 (build verification)
- **Issue:** Generated Payload type has `rolle?: ('admin' | ...) | null` - role can be null/undefined
- **Fix:** Added `user.rolle != null &&` guard in hasRole function
- **Files modified:** src/access/role-checks.ts
- **Verification:** TypeScript compilation passes, all tests pass
- **Committed in:** 9f437ab (Task 2 commit)

**2. [Rule 1 - Bug] Fixed field-level access type mismatch**
- **Found during:** Task 2 (build verification)
- **Issue:** Payload `Access` type (collection-level) is not assignable to `FieldAccess` (field-level) due to different `id` parameter types
- **Fix:** Used inline arrow functions for field-level access instead of imported Access functions
- **Files modified:** src/collections/business/anfragen.ts
- **Verification:** TypeScript compilation passes
- **Committed in:** 9f437ab (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Pre-existing SSG build error on /konfigurator/fenster (useSearchParams without Suspense) prevents full `next build` from succeeding, but TypeScript compilation (`tsc --noEmit`) is clean. This is an existing issue, not introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Access control foundation complete, ready for Plan 02 (Admin Dashboard views)
- All access functions importable from `@/access/*` for custom admin components
- Status transition logic importable from `@/lib/status-transitions` for UI status dropdowns
- afterChange hook placeholder ready for Phase 5 N8N webhook integration

---
*Phase: 04-dashboards-und-rollen*
*Completed: 2026-03-10*
