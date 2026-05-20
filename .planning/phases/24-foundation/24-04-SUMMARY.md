---
phase: 24-foundation
plan: 04
subsystem: data-integrity-pricing
tags: [optimistic-locking, cent-migration, version-field, 409-conflict, formatCents]
dependency_graph:
  requires: [24-02, 24-03]
  provides: [optimistic-locking, cent-integer-prices, version-field]
  affects: [PDF-generation, Stripe-integration, Angebote, Rechnungen, admin-display]
tech_stack:
  added: []
  patterns: [optimistic-locking-with-version-field, cent-integer-arithmetic, conflict-detection-409]
key_files:
  created:
    - src/lib/anfrage/optimistic-lock.ts
    - tests/unit/test-optimistic-lock.test.ts
  modified:
    - src/collections/business/anfragen.ts
    - src/components/admin/anfrage-detail-view.tsx
    - src/components/admin/splitbutton.tsx
    - src/components/admin/status-workflow.tsx
    - src/lib/anfrage/price-server.ts
    - src/lib/stripe.ts
    - src/app/api/anfrage/submit/route.ts
    - src/app/api/anfrage/calculate-price/route.ts
    - src/lib/cart/types.ts
    - src/seed/data/preisregeln.ts
    - src/seed/data/farben.ts
    - src/seed/data/verglasungen.ts
    - src/seed/data/extras.ts
    - src/seed/data/sprossen.ts
    - src/seed/data/glasdekore.ts
    - src/seed/data/sicherheitsglas.ts
    - src/seed/data/schallschutz.ts
    - src/components/admin/anfragen-list-view.tsx
    - src/components/admin/product-card.tsx
    - src/components/admin/attention-bar.tsx
    - src/components/admin/dashboard-overview.tsx
    - src/components/admin/anfrage-edit-button.tsx
    - tests/unit/test-server-price.test.ts
    - tests/unit/test-stripe-checkout.test.ts
decisions:
  - "VersionConflictError class in optimistic-lock.ts (not APIError) to avoid Payload ESM import in Jest tests"
  - "beforeChange hook catches VersionConflictError and re-throws as APIError(msg, 409)"
  - "Rabattcodes wert field NOT migrated to cents (marked TODO for future cleanup)"
  - "Stripe checkout test CSRF failures are pre-existing from plan 24-03, not caused by this plan"
  - "Cart store formula unchanged (previewPrice * quantity still works in cents)"
metrics:
  duration: 35m 13s
  completed: 2026-03-29
---

# Phase 24 Plan 04: Optimistic Locking + Cent Migration Summary

Optimistic locking with version field (1 -> n), 409 conflict detection, toast + reload button on Anfragen; complete float-to-cent migration across price-server, Stripe, submit route, calculate-price route, 8 seed data files, and 5 admin display components using formatCents.

## Tasks Completed

### Task 1: Optimistic Locking on Anfragen (TDD)
**Commit:** d845b87

- Created `src/lib/anfrage/optimistic-lock.ts` with `checkOptimisticLock()` function and `VersionConflictError` class
- Added `version` number field (defaultValue: 1, readOnly, sidebar) to Anfragen collection
- beforeChange hook: compares client version vs DB version, throws APIError 409 on mismatch, auto-increments on success
- Handles create (sets version 1), update (increments), and missing version (treats as 1)
- anfrage-detail-view.tsx: `isConflict` state, toast.error on 409, "Seite neu laden" reload button banner
- Splitbutton + StatusWorkflow: send `version` field in PATCH request bodies
- anfrage-edit-button.tsx: sends version, handles 409 with alert
- 6 unit tests covering: version match, mismatch (409), error message, increment, create, missing version

### Task 2: Cent Migration
**Commit:** d9bb83e

- **price-server.ts:** `preisCents = Math.round(flaeche * regel.grundpreis_pro_m2)` + direct aufpreis addition in cents, returns integer cents
- **stripe.ts:** `unit_amount: gesamtpreis` (removed `Math.round(gesamtpreis * 100)`)
- **submit route:** Removed `Math.round(gesamtpreis * 100) / 100` float rounding; discount: `Math.round(gesamtpreis * (1 - wert/100))` for percent, `gesamtpreis - Math.round(latest.wert * 100)` for absolute
- **calculate-price route:** Removed float rounding on subtotal
- **8 seed data files:** All aufpreis/grundpreis values multiplied by 100 (e.g., 120 EUR -> 12000 cents, 30 EUR -> 3000 cents)
- **Anfragen collection:** Labels updated to "Gesamtpreis (Cent)" and "Einzelpreis (Cent)"
- **5 admin components:** `formatCurrency` -> `formatCents` in anfragen-list-view, product-card, attention-bar, dashboard-overview; edit-button uses `Math.round(parseFloat(v))` for integer parsing
- **Cart types:** `previewPrice` documented as cents
- **Tests updated:** test-server-price.test.ts mock data to cents, test-stripe-checkout.test.ts gesamtpreis values to cents

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test infrastructure compatibility for APIError import**
- **Found during:** Task 1 RED phase
- **Issue:** `import { APIError } from "payload"` fails in Jest (ESM incompatibility)
- **Fix:** Created VersionConflictError class in optimistic-lock.ts; hook catches and re-throws as APIError
- **Files modified:** src/lib/anfrage/optimistic-lock.ts, tests/unit/test-optimistic-lock.test.ts
- **Commit:** d845b87

**2. [Rule 1 - Bug] Test regressions from cent migration**
- **Found during:** Task 2 verification
- **Issue:** test-server-price.test.ts and test-stripe-checkout.test.ts used old float EUR mock values
- **Fix:** Updated mock data to use cent values (150 -> 15000, 249.99 -> 24999, etc.)
- **Files modified:** tests/unit/test-server-price.test.ts, tests/unit/test-stripe-checkout.test.ts
- **Commit:** d9bb83e

**3. [Rule 2 - Missing critical functionality] Edit button version + 409 handling**
- **Found during:** Task 2 (editing anfrage-edit-button.tsx for cents)
- **Issue:** Edit button PATCH request didn't send version field, no 409 conflict handling
- **Fix:** Added `version: doc?.version` to request body, added 409 status check with alert
- **Files modified:** src/components/admin/anfrage-edit-button.tsx
- **Commit:** d9bb83e

### Pre-existing Issues (Out of Scope)

- test-stripe-checkout.test.ts: 3 CSRF-related failures (400->403, 401->403, 200->403) from plan 24-03 CSRF middleware addition. Tests don't send CSRF tokens. Not caused by cent migration.
- anfragen-list-view.tsx TS2345: Pre-existing type error on `getLetzeAktion` parameter.

## Verification Results

- Optimistic lock tests: 6/6 passed
- Full test suite: 620/623 passed (3 pre-existing CSRF failures)
- TypeScript: No new type errors from modified files
- Stripe: `Math.round(gesamtpreis * 100)` removed, `unit_amount: gesamtpreis` confirmed
- Admin display: All 5 components use formatCents, no formatCurrency for price fields
- Version field: Present in collection with readOnly, sidebar, defaultValue 1
- Reload button: "Seite neu laden" text + `window.location.reload()` in detail view

## Self-Check: PASSED

All created files exist. All commit hashes verified.
