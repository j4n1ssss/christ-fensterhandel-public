---
phase: 27-stripe-end-to-end
plan: 03
subsystem: payments-ui
tags: [stripe, react, tailwind, polling, redirect, kunden-dashboard, danke-seite]

# Dependency graph
requires:
  - phase: 27-stripe-end-to-end/01
    provides: "Stripe data fields on Anfragen (stripe_payment_status, stripe_expires_at, stripe_refunded_amount_cents)"
  - phase: 27-stripe-end-to-end/02
    provides: "GET /api/stripe/redirect/[anfrageId], GET /api/stripe/payment-status polling endpoint"
provides:
  - "Refactored StripePayButton with 3 states: zahlungslink_versendet (redirect CTA), bezahlt (confirmation), refund (notice + Gutschrift)"
  - "Danke-Seite /zahlung/[status] with 3 variants: erfolgreich (polling), abgebrochen (retry), fehler (static)"
  - "Login-aware dashboard buttons on Danke-Seite"
  - "Updated anfrage-detail.tsx passing all Stripe props including derived gutschriftUrl"
affects: [27-04-admin-zahlungs-panel, kunden-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Component-internal visibility: StripePayButton returns null for irrelevant statuses instead of parent conditional rendering"
    - "Payment polling: useEffect + setInterval with clearInterval on success/timeout/unmount"
    - "Login-awareness: fetch /api/users/me to determine logged-in state on client"

key-files:
  created:
    - src/app/(frontend)/zahlung/[status]/page.tsx
    - src/app/(frontend)/zahlung/[status]/layout.tsx
  modified:
    - src/components/kunden/stripe-pay-button.tsx
    - src/components/kunden/anfrage-detail.tsx

key-decisions:
  - "StripePayButton handles its own visibility via status prop (returns null for unrelated statuses) instead of parent conditional rendering"
  - "gutschriftUrl derived from dokumente prop (existing data flow) rather than adding separate rechnungen fetch"
  - "Dashboard link uses /kunden/dashboard/{anfrageId} (actual route) not /kunden/anfragen/{anfrageId}"

patterns-established:
  - "Component-internal visibility pattern: Components receive status prop and decide internally whether to render, simplifying parent components"
  - "Payment result page pattern: /zahlung/[status] with session_id query param for polling and retry-link resolution"

requirements-completed: [STRP-04]

# Metrics
duration: 16min
completed: 2026-04-01
---

# Phase 27 Plan 03: Customer Payment UI Summary

**Refactored StripePayButton with redirect/bezahlt/refund states and Danke-Seite with polling, 3 variants, and login-aware navigation**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-01T00:06:00Z
- **Completed:** 2026-04-01T00:22:15Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- StripePayButton now renders 3 distinct states: payment CTA at zahlungslink_versendet (with expiry date and price), green confirmation at bezahlt, and refund notice with optional Gutschrift download link
- Danke-Seite polls /api/stripe/payment-status every 2s with 30s timeout, showing spinner -> success or timeout message
- Three Danke-Seite variants (erfolgreich, abgebrochen, fehler) with login-aware CTAs: dashboard button for logged-in users, email hint for guests
- anfrage-detail.tsx passes all Stripe fields and derives gutschriftUrl from existing dokumente data

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor StripePayButton + update anfrage-detail props** - `44acc6c` (feat)
2. **Task 2: Create Danke-Seite with polling and 3 variants** - `dbf8c20` (feat)

## Files Created/Modified

- `src/components/kunden/stripe-pay-button.tsx` - Complete refactor: 3 rendering states (zahlungslink_versendet, bezahlt, refund), extended props interface, Gutschrift download link
- `src/components/kunden/anfrage-detail.tsx` - Removed old status condition, passes all Stripe props and derived gutschriftUrl to StripePayButton
- `src/app/(frontend)/zahlung/[status]/page.tsx` - Danke-Seite client component with polling, 3 variants (erfolgreich/abgebrochen/fehler), login-awareness
- `src/app/(frontend)/zahlung/[status]/layout.tsx` - Server layout with noindex robots metadata

## Decisions Made

- **StripePayButton self-manages visibility:** Instead of wrapping StripePayButton in a status condition in the parent, the component receives the `status` prop and returns `null` for irrelevant statuses. This simplifies the parent and keeps payment logic encapsulated.
- **gutschriftUrl from dokumente prop:** The plan suggested deriving from `anfrage.rechnungen` but Anfragen don't have a direct rechnungen relation. Instead, derived from the existing `dokumente` prop which already contains gutschrift entries fetched by the page component.
- **Dashboard route correction:** Used `/kunden/dashboard/${anfrageId}` (the actual route) instead of `/kunden/anfragen/${anfrageId}` specified in the plan template, matching the existing route structure at `src/app/(frontend)/kunden/dashboard/[id]/page.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed anfrage.status type mismatch**
- **Found during:** Task 1 (anfrage-detail prop passing)
- **Issue:** `anfrage.status` is typed as `string | null | undefined` in Anfragen, but StripePayButton expects `string`
- **Fix:** Added fallback `anfrage.status || ""` when passing to StripePayButton
- **Files modified:** src/components/kunden/anfrage-detail.tsx
- **Verification:** TypeScript compiles without errors on our files
- **Committed in:** 44acc6c (Task 1 commit)

**2. [Rule 1 - Bug] Corrected dashboard link route**
- **Found during:** Task 2 (Danke-Seite creation)
- **Issue:** Plan template used `/kunden/anfragen/{id}` but actual route is `/kunden/dashboard/{id}`
- **Fix:** Used correct route `/kunden/dashboard/${anfrageId}` matching existing page structure
- **Files modified:** src/app/(frontend)/zahlung/[status]/page.tsx
- **Verification:** Route matches existing file at src/app/(frontend)/kunden/dashboard/[id]/page.tsx
- **Committed in:** dbf8c20 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered

None -- plan executed smoothly. Pre-existing TypeScript errors in unrelated files (zahlungs-panel.tsx, pdf-preview, render-pdf, list-view, test files) remain but are out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Customer payment UI complete: StripePayButton + Danke-Seite ready for end-to-end testing
- Plan 04 (Admin ZahlungsPanel + RefundModal + AttentionBar badge) can proceed independently
- All frontend routes consume APIs built in Plan 02 (redirect, payment-status, refund)

## Self-Check: PASSED

All 4 created/modified files verified present. Both task commits (44acc6c, dbf8c20) confirmed in git log.

---
*Phase: 27-stripe-end-to-end*
*Completed: 2026-04-01*
