---
phase: 28-angebots-workflow
plan: 01
subsystem: backend
tags: [angebot, api, stripe, webhook, status-transitions, pdf, pricing, rate-limit]

# Dependency graph
requires:
  - phase: 28-angebots-workflow/00
    provides: Test stubs for pricing, annehmen, webhook expiry
  - phase: 27-stripe-end-to-end
    provides: Stripe integration, webhook handler, createCheckoutSession
provides:
  - POST /api/angebot/erstellen (one-click Angebots-Erstellung with custom pricing)
  - POST /api/angebot/annehmen (customer-facing Angebots-Annahme with Stripe Checkout)
  - Updated status transitions (angebot_versendet -> zahlungslink_versendet)
  - Webhook expiry reset for Angebots-Annahme flow
  - generateAndStorePDF custom pricing extension
  - Collection field extensions (Angebote + Anfragen)
affects: [28-angebots-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [_skip_auto_pdf transient field guard, Stripe session metadata for flow identification, inline rate limiting for public routes]

key-files:
  created:
    - src/app/api/angebot/erstellen/route.ts
    - src/app/api/angebot/annehmen/route.ts
  modified:
    - src/lib/status-transitions.ts
    - src/lib/stripe.ts
    - src/lib/pdf/generate-and-store.ts
    - src/collections/business/angebote.ts
    - src/collections/business/anfragen.ts
    - src/app/api/stripe/webhook/route.ts
    - tests/unit/test-angebot-pricing.test.ts
    - tests/unit/test-angebot-annehmen.test.ts
    - tests/unit/test-angebot-webhook-expiry.test.ts
    - tests/unit/test-status-transitions.test.ts

key-decisions:
  - "_skip_auto_pdf transient field prevents double PDF generation when API sets angebot_versendet"
  - "Stripe session metadata.flow=angebots_annahme identifies Angebots-Annahme for webhook expiry reset"
  - "Annehmen route uses inline checkRateLimit (not withRateLimit HOF) for public route compatibility"
  - "Webhook resets to angebot_versendet only when status=zahlungslink_versendet (race condition safe)"

patterns-established:
  - "Transient fields (_skip_auto_pdf) stripped by beforeChange hook, checked in afterChange"
  - "Stripe metadata.flow for multi-path checkout identification in webhook handlers"

requirements-completed: [ANG-01, ANG-02, ANG-03]

# Metrics
duration: 3min
completed: 2026-04-01
---

# Phase 28 Plan 01: Collection + Acceptance + Pricing Backend Summary

**Complete backend foundation for Angebots-Workflow: two API routes, custom pricing PDF generation, status transitions, Stripe flow metadata, and webhook expiry reset**

## Performance

- **Duration:** 3 min (continuation from crashed executor)
- **Started:** 2026-04-01T09:13:08Z
- **Completed:** 2026-04-01T09:14:00Z
- **Tasks:** 4
- **Files modified:** 12

## Accomplishments

- Added `zahlungslink_versendet` to `angebot_versendet` transitions array
- Extended Angebote collection with 3 custom pricing fields (preisanpassung_begruendung, preisanpassung_positionen, rabatt_cents)
- Extended Anfragen collection with 2 AGB timestamp fields (agb_akzeptiert_am, agb_akzeptiert_bei_annahme_am)
- Added `_skip_auto_pdf` transient field guard to prevent double PDF generation
- Extended `generateAndStorePDF` with `customPricing` option for admin-set prices
- Created POST /api/angebot/erstellen with CSRF + rate limiting (staff-only, one-click flow)
- Created POST /api/angebot/annehmen with rate limiting (customer-facing, creates Stripe Checkout)
- Extended `CreateCheckoutOptions` with optional `metadata` field for flow identification
- Updated webhook `handleCheckoutExpired` to reset status to `angebot_versendet` on Angebots-Annahme expiry
- Implemented 36 passing tests + 4 todo stubs across pricing, annehmen, and webhook expiry suites

## Task Commits

Each task was committed atomically:

1. **Task 1: Status transitions + Collection field extensions** - `e53534e` (feat)
2. **Task 2: afterChange hook guard + generateAndStorePDF custom pricing** - `20a97d5` (feat)
3. **Task 3: API route POST /api/angebot/erstellen** - `3185bd2` (feat)
4. **Task 4: API route POST /api/angebot/annehmen + Stripe metadata + webhook expiry** - `18c3761` (feat)

## Files Created/Modified

- `src/lib/status-transitions.ts` - Added zahlungslink_versendet transition from angebot_versendet
- `src/collections/business/angebote.ts` - 3 new fields: preisanpassung_begruendung, preisanpassung_positionen, rabatt_cents
- `src/collections/business/anfragen.ts` - 2 new AGB date fields + _skip_auto_pdf guard in hooks
- `src/lib/pdf/generate-and-store.ts` - customPricing option in generateAndStorePDF
- `src/app/api/angebot/erstellen/route.ts` - One-click Angebots-Erstellung API (staff-only)
- `src/app/api/angebot/annehmen/route.ts` - Angebots-Annahme API (customer-facing)
- `src/lib/stripe.ts` - Optional metadata field on CreateCheckoutOptions
- `src/app/api/stripe/webhook/route.ts` - Angebots-Annahme expiry reset logic
- `tests/unit/test-status-transitions.test.ts` - New transition test
- `tests/unit/test-angebot-pricing.test.ts` - Implemented pricing derivation tests
- `tests/unit/test-angebot-annehmen.test.ts` - Implemented annehmen validation tests
- `tests/unit/test-angebot-webhook-expiry.test.ts` - Implemented webhook expiry reset tests

## Decisions Made

- `_skip_auto_pdf` transient field pattern prevents double PDF when API route sets status to angebot_versendet
- Stripe session `metadata.flow = "angebots_annahme"` identifies checkout sessions from Angebots-Annahme for webhook expiry handling
- Annehmen route uses inline `checkRateLimit` (not `withRateLimit` HOF) because it is a public route that also handles dynamic params
- Webhook only resets status when `anfrage.status === "zahlungslink_versendet"` to prevent race conditions with bezahlt

## Deviations from Plan

None - plan executed exactly as written. Task 4 files were created by the previous (crashed) executor and committed by the continuation agent.

## Issues Encountered

- Previous executor crashed mid-execution (API error) during Task 4
- All Task 4 file changes were intact on disk but uncommitted
- Continuation agent verified changes, ran tests, and committed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both API routes ready for UI integration in Plans 28-02 (Admin Modal) and 28-03 (Kunden Frontend)
- Webhook expiry reset enables customer re-acceptance flow
- Custom pricing infrastructure ready for admin Angebots-Modal

## Self-Check: PASSED

- [x] src/app/api/angebot/erstellen/route.ts - FOUND
- [x] src/app/api/angebot/annehmen/route.ts - FOUND
- [x] src/lib/status-transitions.ts - FOUND
- [x] src/lib/stripe.ts - FOUND
- [x] src/app/api/stripe/webhook/route.ts - FOUND
- [x] Commit e53534e - FOUND
- [x] Commit 20a97d5 - FOUND
- [x] Commit 3185bd2 - FOUND
- [x] Commit 18c3761 - FOUND

---
*Phase: 28-angebots-workflow*
*Completed: 2026-04-01*
