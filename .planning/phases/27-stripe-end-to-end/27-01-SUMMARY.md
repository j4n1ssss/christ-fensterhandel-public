---
phase: 27-stripe-end-to-end
plan: 01
subsystem: payments
tags: [stripe, checkout, customer, refund, status-config, collection-fields]

# Dependency graph
requires:
  - phase: 24-bestellungsflow-backend
    provides: Settings global with stripe_zahlungslink_ablauf_stunden and stripe_waehrung
  - phase: 18-statuses-transitions-collection-felder
    provides: Status config maps and transitions infrastructure
provides:
  - 6 Stripe fields on Anfragen collection in Stripe-Daten tab
  - stripe_customer_id on Users collection
  - rueckerstattung_ausstehend and rueckerstattung_abgeschlossen statuses in all config maps
  - Refund transitions from all post-bezahlt statuses
  - Extended createCheckoutSession with Customer/Expiry/Settings integration
  - findOrCreateStripeCustomer with DSGVO-minimal data
  - expireExistingSession for max-1-active-session enforcement
  - stripe-helpers.ts with dashboard URL, payment status colors/labels, visibility constants
affects: [27-02-webhook-handlers, 27-03-admin-zahlungs-panel, 27-04-kunden-zahlungs-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [options-object-function-signature, settings-driven-stripe-config, stripe-customer-idempotency]

key-files:
  created:
    - src/lib/stripe-helpers.ts
  modified:
    - src/collections/business/anfragen.ts
    - src/collections/system/users.ts
    - src/lib/status-config.ts
    - src/lib/status-transitions.ts
    - src/lib/stripe.ts
    - src/app/api/stripe/checkout/route.ts
    - tests/unit/test-status-config.test.ts
    - tests/unit/test-status-transitions.test.ts

key-decisions:
  - "createCheckoutSession uses options object (not positional args) for extensibility"
  - "findOrCreateStripeCustomer checks Users DB first, then Stripe API by email, then creates new"
  - "rueckerstattung_abgeschlossen is terminal (like storniert) with empty transitions"
  - "stripe_customer_id field access restricted to admin/mitarbeiter only"

patterns-established:
  - "Options object pattern: stripe functions accept single options object instead of positional parameters"
  - "Settings-driven config: currency and expiry read from Settings global at runtime"
  - "DSGVO-minimal Stripe data: only email + name sent to Stripe Customer API"

requirements-completed: [STRP-02, STRP-06, STRP-11]

# Metrics
duration: 40min
completed: 2026-03-31
---

# Phase 27 Plan 01: Stripe Data Model + Core Library Summary

**Stripe data fields on Anfragen/Users, refund status lifecycle, and extended checkout session with Customer/Expiry/Settings integration**

## Performance

- **Duration:** 40 min
- **Started:** 2026-03-31T22:56:11Z
- **Completed:** 2026-03-31T23:37:10Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Added 6 Stripe fields (checkout_url, session_id, payment_intent_id, payment_status, expires_at, refunded_amount_cents) in dedicated Stripe-Daten tab on Anfragen
- Added stripe_customer_id on Users for idempotent Stripe Customer lookups
- Extended status lifecycle with rueckerstattung_ausstehend (amber, pending) and rueckerstattung_abgeschlossen (red, terminal) across all 9 config maps
- Rebuilt createCheckoutSession with Settings-driven currency/expiry, Customer integration, and new redirect URLs
- Created stripe-helpers.ts with pure-function utilities for admin UI (dashboard URLs, payment status colors/labels, visibility constants)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Stripe fields to Anfragen + Users, extend status config** - `b44d393` (feat)
2. **Task 2: Extend stripe.ts with Customer/Expiry/Settings, create stripe-helpers.ts** - `8074fa3` (feat)
3. **Fix: Update checkout API route call site** - `6577775` (fix, Rule 3 deviation)

## Files Created/Modified
- `src/lib/stripe-helpers.ts` - Pure-function utilities: PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS, getStripeDashboardUrl, ZAHLUNGS_PANEL_VISIBLE_STATUSES, REFUND_ALLOWED_STATUSES
- `src/lib/stripe.ts` - Extended createCheckoutSession (options object), findOrCreateStripeCustomer, expireExistingSession
- `src/collections/business/anfragen.ts` - 6 Stripe fields in Stripe-Daten tab, 2 new status options, updated createCheckoutSession call
- `src/collections/system/users.ts` - stripe_customer_id field (readOnly, sidebar, staff-only access)
- `src/lib/status-config.ts` - rueckerstattung_ausstehend + rueckerstattung_abgeschlossen in all 9 config maps
- `src/lib/status-transitions.ts` - Refund transitions from 7 post-bezahlt statuses, 2 new terminal entries
- `src/app/api/stripe/checkout/route.ts` - Updated to use new options-object createCheckoutSession
- `tests/unit/test-status-config.test.ts` - Updated assertions for 22 statuses (was 20), 15 email triggers (was 14)
- `tests/unit/test-status-transitions.test.ts` - Updated for 22 statuses, 2 terminal states, updated bezahlt/abgeschlossen assertions

## Decisions Made
- createCheckoutSession uses options object pattern instead of positional args for better extensibility
- findOrCreateStripeCustomer follows lookup chain: Users DB -> Stripe API by email -> create new (DSGVO-minimal)
- rueckerstattung_abgeschlossen is terminal status (empty VALID_TRANSITIONS) like storniert
- rueckerstattung_abgeschlossen added to EMAIL_TRIGGER_STATUSES (customer-facing), rueckerstattung_ausstehend not (internal)
- stripe_customer_id access restricted to admin/mitarbeiter roles via inline field access function

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated test assertions for new status count**
- **Found during:** Task 1 (status config extension)
- **Issue:** Existing tests had hardcoded status counts (20 -> 22, 14 -> 15) and specific transition arrays
- **Fix:** Updated all toHaveLength assertions and specific transition expectations in both test files
- **Files modified:** tests/unit/test-status-config.test.ts, tests/unit/test-status-transitions.test.ts
- **Verification:** All 163 tests pass
- **Committed in:** b44d393 (Task 1 commit)

**2. [Rule 3 - Blocking] Updated checkout API route to use new function signature**
- **Found during:** Task 2 (stripe.ts signature change)
- **Issue:** src/app/api/stripe/checkout/route.ts called createCheckoutSession with old 4-arg signature, causing TS2554 error
- **Fix:** Updated to options object with kundenEmail, kundenName, userId extracted from anfrage data
- **Files modified:** src/app/api/stripe/checkout/route.ts
- **Verification:** TypeScript compiles without errors
- **Committed in:** 6577775

---

**Total deviations:** 2 auto-fixed (1 bug in tests, 1 blocking call-site update)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None -- plan executed smoothly with only expected call-site updates.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Stripe data fields exist on collections, ready for webhook handlers (Plan 02)
- Status lifecycle complete with refund flow, ready for admin UI (Plan 03)
- stripe-helpers.ts provides all constants needed by ZahlungsPanel (Plan 03) and Kunden flow (Plan 04)

---
*Phase: 27-stripe-end-to-end*
*Completed: 2026-03-31*
