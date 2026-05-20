---
phase: 03-kauffluss
plan: 02
subsystem: api
tags: [zod, payload-local-api, price-calculation, discount-validation, anfrage-nummer]

# Dependency graph
requires:
  - phase: 01-fundament
    provides: "CMS collections (preisregeln, rabattcodes, anfragen) with seeded data"
  - phase: 02-konfigurator-pipeline
    provides: "KonfiguratorSelections type, calculatePreviewPrice formula, price-calculator pattern"
provides:
  - "Server-side price calculation via Payload Local API (calculateServerPrice)"
  - "Discount code validation with 5-case chain (validateDiscountCode)"
  - "Sequential ANF-YYYY-NNN number generator (generateAnfrageNummer)"
  - "Shared Zod schemas for contact form and submission (kontaktSchema, submissionSchema)"
  - "POST /api/anfrage/calculate-price endpoint"
  - "POST /api/anfrage/validate-discount endpoint"
affects: [03-kauffluss, 04-auth-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Payload Local API for server-side CMS queries", "Pure function extraction for testable validation logic", "TDD with mocked Payload instance"]

key-files:
  created:
    - src/lib/anfrage/schemas.ts
    - src/lib/anfrage/price-server.ts
    - src/lib/anfrage/anfrage-nummer.ts
    - src/lib/anfrage/discount-validator.ts
    - src/app/api/anfrage/calculate-price/route.ts
    - src/app/api/anfrage/validate-discount/route.ts
    - tests/unit/test-anfrage-schemas.test.ts
    - tests/unit/test-server-price.test.ts
    - tests/unit/test-anfrage-nummer.test.ts
    - tests/unit/test-discount-validation.test.ts
    - tests/unit/test-snapshot.test.ts
  modified: []

key-decisions:
  - "Extracted validateDiscountCode as pure function for unit testing without HTTP layer"
  - "calculateServerPrice receives payload instance as parameter (no global import) for testability"
  - "Snapshot uses z.record(z.string(), z.unknown()) for flexible selections/resolvedNames structure"

patterns-established:
  - "Payload Local API pattern: pass payload instance to business logic functions"
  - "Pure validation functions exported separately from API routes for testability"
  - "ANF-YYYY-NNN sequential numbering with padStart(3, '0')"

requirements-completed: [PREIS-01, PREIS-02, PREIS-03, PREIS-04, PREIS-05]

# Metrics
duration: 4min
completed: 2026-03-09
---

# Phase 3 Plan 02: Server-Pricing + Discount Validation Summary

**Server-side price calculation via Payload Local API, 5-case discount validation chain, Zod contact/submission schemas, and sequential ANF-YYYY-NNN generator**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-09T19:21:54Z
- **Completed:** 2026-03-09T19:25:37Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Server-side price calculator mirrors client formula but reads CMS data via Payload Local API (tamper-proof)
- Discount validation covers all 5 cases: ungueltig, abgelaufen, aufgebraucht, min_bestellwert, valid
- kontaktSchema validates required + optional contact fields with German error messages
- 34 unit tests pass across 5 test files

## Task Commits

Each task was committed atomically (TDD: test then implementation):

1. **Task 1: Shared schemas, server price, anfrage-nummer** - `095cb4b` (test) + `93aa84e` (feat)
2. **Task 2: API Routes + discount validation** - `cdbcdcd` (test) + `c608a54` (feat)

## Files Created/Modified
- `src/lib/anfrage/schemas.ts` - Zod v4 schemas: kontaktSchema, snapshotItemSchema, submissionSchema
- `src/lib/anfrage/price-server.ts` - Server-side calculateServerPrice using Payload Local API
- `src/lib/anfrage/anfrage-nummer.ts` - Sequential ANF-YYYY-NNN number generator
- `src/lib/anfrage/discount-validator.ts` - Pure validateDiscountCode function with 5-case chain
- `src/app/api/anfrage/calculate-price/route.ts` - POST endpoint returning authoritative prices
- `src/app/api/anfrage/validate-discount/route.ts` - POST endpoint for discount code validation
- `tests/unit/test-anfrage-schemas.test.ts` - Schema validation tests (10 tests)
- `tests/unit/test-server-price.test.ts` - Server price calculation tests (6 tests)
- `tests/unit/test-anfrage-nummer.test.ts` - Anfrage number generation tests (4 tests)
- `tests/unit/test-discount-validation.test.ts` - Discount validation tests (7 tests)
- `tests/unit/test-snapshot.test.ts` - Snapshot structure tests (5 tests)

## Decisions Made
- Extracted validateDiscountCode as a pure function separate from the API route for unit testability without HTTP mocking
- calculateServerPrice receives payload instance as parameter rather than importing globally, enabling easy mocking in tests
- Used z.record(z.string(), z.unknown()) for snapshot selections/resolvedNames to keep the schema flexible across different configurator states

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All backend pricing/validation logic complete for the Kauffluss
- Ready for Plan 03 (Warenkorb UI, Anfrage submission flow, Danke-Seite)
- API endpoints available at /api/anfrage/calculate-price and /api/anfrage/validate-discount

---
*Phase: 03-kauffluss*
*Completed: 2026-03-09*
