---
phase: 05-externe-integrationen
plan: 01
subsystem: payments
tags: [stripe, checkout, webhook, payment]

requires:
  - phase: 04-dashboards-und-rollen
    provides: Kunden-Dashboard with AnfrageDetail component and status transitions
  - phase: 01-fundament
    provides: Anfragen collection with status field and Payload CMS setup
provides:
  - Stripe client singleton (src/lib/stripe.ts)
  - POST /api/stripe/checkout — creates Checkout Session for bestaetigt Anfragen
  - POST /api/stripe/webhook — verifies signature, updates status to bezahlt idempotently
  - StripePayButton client component with loading/error states
  - Unit tests for checkout session creation and webhook handling
affects: [06-website-compliance, deployment, n8n-integration]

tech-stack:
  added: [stripe@20.4.1]
  patterns: [stripe-checkout-redirect, webhook-signature-verification, idempotent-status-update]

key-files:
  created:
    - src/lib/stripe.ts
    - src/app/api/stripe/checkout/route.ts
    - src/app/api/stripe/webhook/route.ts
    - src/components/kunden/stripe-pay-button.tsx
    - tests/unit/test-stripe-checkout.test.ts
    - tests/unit/test-stripe-webhook.test.ts
  modified:
    - src/components/kunden/anfrage-detail.tsx
    - .env.example
    - package.json

key-decisions:
  - "Stripe Checkout manages payment methods automatically (no explicit payment_method_types list)"
  - "StripePayButton extracted as separate client component to keep AnfrageDetail as server component"
  - "Webhook uses request.text() for raw body to preserve signature integrity"
  - "Idempotent webhook: skips update if Anfrage already bezahlt, still returns 200"

patterns-established:
  - "Stripe webhook pattern: text() raw body, constructEvent verify, idempotent update"
  - "Client component extraction: interactive buttons as separate 'use client' components imported into RSC"

requirements-completed: [PAY-01, PAY-02, PAY-03]

duration: 4min
completed: 2026-03-10
---

# Phase 5 Plan 1: Stripe Payment Summary

**Stripe Checkout integration with checkout session creation, webhook-based status update to bezahlt, and active payment button in Kunden-Dashboard**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-10T09:22:38Z
- **Completed:** 2026-03-10T09:26:38Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Stripe client singleton with createCheckoutSession helper (EUR currency, anfrage metadata)
- POST /api/stripe/checkout validates bestaetigt status and returns Stripe checkout URL
- POST /api/stripe/webhook verifies Stripe signature and idempotently updates Anfrage to bezahlt
- Active "Jetzt bezahlen" button replaces disabled placeholder in Kunden-Dashboard
- 8 unit tests covering checkout creation, status validation, signature rejection, idempotency

## Task Commits

Each task was committed atomically:

1. **Task 0: Wave 0 test stubs** - `1e1db87` (test)
2. **Task 1: Stripe Client + Checkout + Webhook** - `3fc7fb4` (feat)
3. **Task 2: Bezahl-Button aktivieren** - `5ac6062` (feat)

## Files Created/Modified
- `src/lib/stripe.ts` - Stripe client singleton + createCheckoutSession helper
- `src/app/api/stripe/checkout/route.ts` - POST endpoint creating Stripe Checkout Session
- `src/app/api/stripe/webhook/route.ts` - POST endpoint receiving Stripe webhooks
- `src/components/kunden/stripe-pay-button.tsx` - Client component with payment button + loading/error
- `src/components/kunden/anfrage-detail.tsx` - Replaced disabled placeholder with StripePayButton
- `tests/unit/test-stripe-checkout.test.ts` - 4 tests for checkout session creation
- `tests/unit/test-stripe-webhook.test.ts` - 4 tests for webhook handling
- `.env.example` - Added STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
- `package.json` - Added stripe@20.4.1 dependency

## Decisions Made
- Removed `automatic_payment_methods` from Checkout Session params (not valid for Stripe Checkout API v20; Checkout auto-manages payment methods)
- Used `@jest-environment node` docblock instead of changing global jest config (Request/Response needed for API route tests)
- StripePayButton as separate client component (AnfrageDetail stays RSC)
- Duplicated formatPrice in StripePayButton (small helper, avoids cross-component import complexity)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed automatic_payment_methods from Checkout Session**
- **Found during:** Task 1 (Stripe Client implementation)
- **Issue:** `automatic_payment_methods` is a Payment Intents API parameter, not valid for Checkout Sessions in Stripe v20
- **Fix:** Removed the property; Stripe Checkout automatically manages payment methods by default
- **Files modified:** src/lib/stripe.ts
- **Verification:** TypeScript compiles clean, tests pass
- **Committed in:** 3fc7fb4 (Task 1 commit)

**2. [Rule 3 - Blocking] Switched test environment from jsdom to node**
- **Found during:** Task 1 (test verification)
- **Issue:** jsdom environment lacks Request/Response globals needed by NextResponse import
- **Fix:** Added `@jest-environment node` docblock to both test files
- **Files modified:** tests/unit/test-stripe-checkout.test.ts, tests/unit/test-stripe-webhook.test.ts
- **Verification:** All 8 tests pass
- **Committed in:** 3fc7fb4 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required

To use Stripe payments, add real keys to `.env`:
- `STRIPE_SECRET_KEY=sk_test_...` (from Stripe Dashboard > API Keys)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe Dashboard > Webhooks, or `stripe listen --forward-to localhost:3000/api/stripe/webhook`)

## Next Phase Readiness
- Stripe payment flow complete end-to-end (checkout + webhook)
- Ready for Plan 05-02 (N8N integration) or Phase 6 (Website/Compliance)
- Production deployment will need real Stripe keys and webhook endpoint configuration

## Self-Check: PASSED

All 6 created files verified on disk. All 3 task commits (1e1db87, 3fc7fb4, 5ac6062) verified in git log.

---
*Phase: 05-externe-integrationen*
*Completed: 2026-03-10*
