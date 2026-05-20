---
phase: 27-stripe-end-to-end
plan: 02
subsystem: payments
tags: [stripe, webhooks, checkout, refund, redirect, idempotency, email]

# Dependency graph
requires:
  - phase: 27-stripe-end-to-end/01
    provides: "Stripe data model fields, status config, core lib functions (createCheckoutSession, expireExistingSession, findOrCreateStripeCustomer)"
provides:
  - "Webhook handler for 4 Stripe event types (checkout completed/expired, charge refunded, charge dispute)"
  - "GET /api/stripe/redirect/[anfrageId] with auto-regeneration of expired sessions"
  - "GET /api/stripe/payment-status polling endpoint for Danke-Seite"
  - "POST /api/stripe/refund admin-only endpoint with Zod validation"
  - "Refactored afterChange hook triggering checkout at zahlungslink_versendet"
  - "zahlung_dispute and rueckerstattung email event types with templates"
affects: [27-03-danke-seite, 27-04-zahlungs-panel, admin-detail-view]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Webhook idempotency via stripe_payment_status check before update"
    - "Redirect route with auto-regeneration (expire old -> create new -> redirect)"
    - "Inline rate limiting for dynamic routes (withRateLimit incompatible with route params)"
    - "Structured logging with [Component] prefix and metadata objects"

key-files:
  created:
    - src/app/api/stripe/redirect/[anfrageId]/route.ts
    - src/app/api/stripe/payment-status/route.ts
    - src/app/api/stripe/refund/route.ts
    - src/emails/templates/dispute-warnung.tsx
  modified:
    - src/app/api/stripe/webhook/route.ts
    - src/collections/business/anfragen.ts
    - src/lib/email/types.ts
    - src/lib/email/event-matrix.ts
    - src/lib/email/render-email.ts
    - src/lib/email/mock-data.ts
    - src/components/kunden/stripe-pay-button.tsx
    - tests/unit/test-stripe-checkout.test.ts

key-decisions:
  - "Redirect route uses inline checkRateLimit instead of withRateLimit wrapper (dynamic route params not supported by HOF)"
  - "Webhook idempotency checks stripe_payment_status field (not anfrage status) to avoid race conditions"
  - "Redirect route queues new zahlungslink email on session regeneration (per CONTEXT)"
  - "Refund route sets rueckerstattung_ausstehend only for full refunds; partial refunds don't change anfrage status"
  - "Added rueckerstattung and zahlung_dispute to EmailEventType (were missing, needed by webhook handlers)"

patterns-established:
  - "Webhook handler pattern: switch on event.type, handler per event, idempotency check first"
  - "Admin-only API route pattern: payload.auth -> rolle check -> Zod validation -> optimistic lock -> business logic"

requirements-completed: [STRP-01, STRP-05, STRP-06, STRP-07, STRP-08, STRP-09, STRP-10]

# Metrics
duration: 9min
completed: 2026-03-31
---

# Phase 27 Plan 02: Stripe Backend Routes Summary

**4 Stripe webhook handlers with idempotency, redirect route with auto-regeneration, payment-status polling, admin refund API with Zod + optimistic lock**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-31T23:41:00Z
- **Completed:** 2026-03-31T23:50:14Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Complete webhook handler with 4 event types: checkout.session.completed, checkout.session.expired, charge.refunded, charge.dispute.created -- all with idempotency guards
- Redirect route auto-regenerates expired Stripe sessions transparently, with rate limiting and email notification
- Admin-only refund API with full/partial refund support, Zod validation, optimistic locking, StatusHistorie tracking
- Payment-status polling endpoint for Danke-Seite (reads DB, not Stripe API)
- afterChange hook now triggers Checkout Session creation at zahlungslink_versendet (not bestaetigt)
- Added dispute-warnung email template and zahlung_dispute + rueckerstattung event types to email system

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor afterChange hook + Expand webhook to 4 event types + Delete old checkout route** - `711d024` (feat)
2. **Task 2: Create redirect route, payment-status polling route, and refund API route** - `54041af` (feat)

## Files Created/Modified

- `src/app/api/stripe/webhook/route.ts` - Complete rewrite: 4 event handlers with idempotency, Gutschrift PDF generation, email queuing
- `src/app/api/stripe/redirect/[anfrageId]/route.ts` - New: Public GET redirect with auto-regeneration, rate limiting
- `src/app/api/stripe/payment-status/route.ts` - New: Polling endpoint returning stripe_payment_status from DB
- `src/app/api/stripe/refund/route.ts` - New: Admin-only refund with Zod, optimistic lock, Stripe API
- `src/collections/business/anfragen.ts` - afterChange hook: zahlungslink_versendet trigger, expireExistingSession, redirect URL
- `src/lib/email/types.ts` - Added rueckerstattung and zahlung_dispute to EmailEventType union
- `src/lib/email/event-matrix.ts` - Added rueckerstattung and zahlung_dispute entries with templates and subjects
- `src/lib/email/render-email.ts` - Registered dispute-warnung template, added buildTemplateProps case
- `src/lib/email/mock-data.ts` - Added mock data for dispute-warnung template, fixed rueckerstattung eventType
- `src/emails/templates/dispute-warnung.tsx` - New: Staff notification for Stripe disputes with urgency styling
- `src/components/kunden/stripe-pay-button.tsx` - Updated to use redirect route instead of deleted checkout route
- `tests/unit/test-stripe-checkout.test.ts` - Removed tests for deleted checkout route, kept lib tests

## Decisions Made

- **Inline rate limiting for redirect route:** The `withRateLimit` higher-order function only passes `(request)` to the handler, but Next.js dynamic routes need `(request, { params })`. Used `checkRateLimit` directly inside the handler instead.
- **Webhook idempotency on stripe_payment_status:** Checking the Stripe-specific field rather than the Anfrage status prevents race conditions where multiple webhook deliveries could conflict with status transitions from other sources.
- **Email on session regeneration:** When the redirect route regenerates an expired session, it queues a new `zahlungslink_versendet` email per CONTEXT decision (customer should get updated link).
- **rueckerstattung + zahlung_dispute added to EmailEventType:** These were not in the union but needed by webhook handlers. Rule 2 auto-fix for missing critical functionality.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated StripePayButton to use redirect route**
- **Found during:** Task 1 (Deleting old checkout route)
- **Issue:** `src/components/kunden/stripe-pay-button.tsx` referenced the deleted POST `/api/stripe/checkout` route
- **Fix:** Changed to direct redirect via `window.location.href = /api/stripe/redirect/${anfrageId}`
- **Files modified:** src/components/kunden/stripe-pay-button.tsx
- **Verification:** TypeScript compiles, no more references to deleted route
- **Committed in:** 711d024 (Task 1 commit)

**2. [Rule 3 - Blocking] Removed obsolete checkout route tests**
- **Found during:** Task 1 (Deleting old checkout route)
- **Issue:** `tests/unit/test-stripe-checkout.test.ts` imported from deleted `@/app/api/stripe/checkout/route`, causing TS errors
- **Fix:** Removed the `describe("POST /api/stripe/checkout")` test block, kept `createCheckoutSession` unit tests and Phase 27 test stubs
- **Files modified:** tests/unit/test-stripe-checkout.test.ts
- **Verification:** TypeScript compiles, no more import errors
- **Committed in:** 711d024 (Task 1 commit)

**3. [Rule 2 - Missing Critical] Added rueckerstattung and zahlung_dispute to email type system**
- **Found during:** Task 1 (Writing webhook handlers that queue these events)
- **Issue:** `rueckerstattung` and `zahlung_dispute` not in EmailEventType union or EVENT_MATRIX. Template slug existed in render-email.ts but event type was missing, preventing type-safe email queuing.
- **Fix:** Added both to EmailEventType union, EVENT_MATRIX entries with correct empfaenger/templates/betreff, registered dispute-warnung template in render-email.ts, added mock data entries
- **Files modified:** src/lib/email/types.ts, src/lib/email/event-matrix.ts, src/lib/email/render-email.ts, src/lib/email/mock-data.ts
- **Verification:** TypeScript compiles, email system has complete type coverage for all webhook event types
- **Committed in:** 711d024 (Task 1 commit)

**4. [Rule 1 - Bug] Used inline rate limiting for dynamic redirect route**
- **Found during:** Task 2 (Creating redirect route)
- **Issue:** Plan specified `withRateLimit` wrapper but the function signature `(request: Request) => Promise<Response>` doesn't support Next.js dynamic route params `(request, { params })`
- **Fix:** Used `checkRateLimit` and `getClientIp` directly inside the handler function instead of the HOF wrapper
- **Files modified:** src/app/api/stripe/redirect/[anfrageId]/route.ts
- **Verification:** Rate limiting works, route still receives params correctly
- **Committed in:** 54041af (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (2 blocking, 1 missing critical, 1 bug)
**Impact on plan:** All auto-fixes necessary for correctness. Blocking issues from deleting old route, missing email types for webhook handlers, and rate-limit wrapper incompatibility with dynamic routes. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 backend routes ready for frontend consumption (Plans 03 and 04)
- Plan 03 (Danke-Seite) can use `/api/stripe/payment-status?session_id=...` for polling
- Plan 04 (ZahlungsPanel) can use `/api/stripe/refund` for admin refund button
- Email system has complete type coverage for all Stripe-related events
- 20 pre-existing TypeScript errors remain (in unrelated files: pdf-preview, render-pdf, list-view, test files)

## Self-Check: PASSED

All created files verified present. Both task commits (711d024, 54041af) confirmed in git log. Deleted checkout route confirmed absent.

---
*Phase: 27-stripe-end-to-end*
*Completed: 2026-03-31*
