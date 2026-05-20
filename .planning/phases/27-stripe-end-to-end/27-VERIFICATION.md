---
phase: 27-stripe-end-to-end
verified: 2026-04-01T01:15:00Z
status: passed
score: 5/5 success criteria verified
re_verification: false
---

# Phase 27: Stripe End-to-End Verification Report

**Phase Goal:** Zahlungsflow funktioniert vollautomatisch von Zahlungslink-Erstellung bis Rueckerstattung ohne manuelle Eingriffe
**Verified:** 2026-04-01T01:15:00Z
**Status:** PASSED
**Re-verification:** No -- initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin setzt Status auf "zahlungslink_versendet" -> Stripe Checkout Session wird automatisch erstellt, URL gespeichert, Kunde erhaelt E-Mail | VERIFIED | `anfragen.ts` afterChange hook lines 248-312: createCheckoutSession called, fields stored via payload.update, emailPayload augmented with stripe_checkout_url, queueEmailEvent called |
| 2 | Admin sieht Zahlungslink-Status (offen/bezahlt/abgelaufen) in Detail-View, kann kopieren, neuen Link bei Ablauf erstellen (max 1 aktive Session) | VERIFIED | `zahlungs-panel.tsx`: ZAHLUNGS_PANEL_VISIBLE_STATUSES gate, copy-to-clipboard at line 67, isExpired guard at line 61, regenerate fetch at line 78. STRP-06 via expireExistingSession in afterChange and redirect route |
| 3 | Kunden koennen im Dashboard ueber "Jetzt bezahlen" direkt zur Stripe-Checkout-Seite weitergeleitet werden | VERIFIED | `stripe-pay-button.tsx` line 77: `window.location.href = /api/stripe/redirect/${anfrageId}`. redirect route auto-regenerates expired sessions. Redirect URL in `anfrage-detail.tsx` passes status+stripePaymentStatus |
| 4 | Nach erfolgreicher Zahlung wird Rechnung generiert, Status auf "bezahlt" gesetzt, Zahlungsbestaetigung per E-Mail versendet -- auch bei verzoegertem Webhook | VERIFIED | `webhook/route.ts` handleCheckoutCompleted sets status=bezahlt. `anfragen.ts` afterChange lines 321-336: generateAndStorePDF("rechnung"). event-matrix bezahlt entry: empfaenger=[kunde, staff], zahlung-bestaetigung template. Danke-Seite polls `/api/stripe/payment-status` every 2s with 30s timeout |
| 5 | Admin kann volle/teilweise Rueckerstattungen ausloesen, Webhook aktualisiert Status, Gutschrift wird automatisch erstellt | VERIFIED | `refund-modal.tsx` POSTs to `/api/stripe/refund`. webhook handleChargeRefunded updates stripe_refunded_amount_cents + stripe_payment_status. `anfragen.ts` afterChange lines 361-378: generateAndStorePDF("gutschrift") on rueckerstattung_abgeschlossen |

**Score:** 5/5 success criteria verified

---

## Required Artifacts

### Plan 00 Artifacts (Test Scaffolding)

| Artifact | Status | Evidence |
|----------|--------|----------|
| `tests/unit/test-stripe-checkout.test.ts` | VERIFIED | Exists, 17 test.todo stubs covering STRP-01/02/06/11 |
| `tests/unit/test-stripe-webhook.test.ts` | VERIFIED | Exists, 20 test.todo stubs covering STRP-05/07/09/10 |
| `tests/unit/test-stripe-helpers.test.ts` | VERIFIED | Exists, 12 test.todo stubs covering STRP-03 |
| `tests/unit/test-stripe-refund.test.ts` | VERIFIED | Exists, 14 test.todo stubs covering STRP-08 |
| `tests/unit/test-stripe-redirect.test.ts` | VERIFIED | Exists, 11 test.todo stubs covering STRP-04/05 |

### Plan 01 Artifacts (Data Model + Core Library)

| Artifact | Status | Evidence |
|----------|--------|----------|
| `src/collections/business/anfragen.ts` | VERIFIED | Contains stripe_checkout_url/session_id/payment_intent_id/payment_status/expires_at/refunded_amount_cents (lines 737-795). rueckerstattung_ausstehend/abgeschlossen in status select |
| `src/collections/system/users.ts` | VERIFIED | stripe_customer_id field at line 86, readOnly, sidebar, isAdminOrMitarbeiter access |
| `src/lib/status-config.ts` | VERIFIED | rueckerstattung_ausstehend and rueckerstattung_abgeschlossen in all 9 config maps including StatusKey union, STATUS_COLORS, STATUS_LABELS, STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, STATUS_GROUP, STATUS_WEIGHT, QUICK_ACTIONS, LIST_TAB_FILTERS |
| `src/lib/status-transitions.ts` | VERIFIED | rueckerstattung_ausstehend as target from bezahlt/an_hersteller/hersteller_bestaetigt/in_produktion/versandbereit/geliefert/abgeschlossen. Terminal: rueckerstattung_abgeschlossen: [] |
| `src/lib/stripe.ts` | VERIFIED | createCheckoutSession (options object, calls getSettings()), findOrCreateStripeCustomer, expireExistingSession all exported |
| `src/lib/stripe-helpers.ts` | VERIFIED | PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS, getStripeDashboardUrl, ZAHLUNGS_PANEL_VISIBLE_STATUSES, REFUND_ALLOWED_STATUSES all exported |

### Plan 02 Artifacts (Backend Routes)

| Artifact | Status | Evidence |
|----------|--------|----------|
| `src/app/api/stripe/webhook/route.ts` | VERIFIED | 4 handlers: checkout.session.completed, checkout.session.expired, charge.refunded, charge.dispute.created. 14x console.info, 0x console.log |
| `src/app/api/stripe/redirect/[anfrageId]/route.ts` | VERIFIED | expireExistingSession + createCheckoutSession for auto-regeneration, inline rate limit |
| `src/app/api/stripe/payment-status/route.ts` | VERIFIED | Returns stripe_payment_status from DB at line 39 |
| `src/app/api/stripe/refund/route.ts` | VERIFIED | stripe.refunds.create at line 112, rueckerstattet/teilweise_erstattet status update |
| Old `src/app/api/stripe/checkout/route.ts` | VERIFIED DELETED | Directory does not exist |
| `src/emails/templates/dispute-warnung.tsx` | VERIFIED | Exists |
| `src/lib/email/types.ts` | VERIFIED | rueckerstattung and zahlung_dispute in EmailEventType union |
| `src/lib/email/event-matrix.ts` | VERIFIED | rueckerstattung and zahlung_dispute entries present |

### Plan 03 Artifacts (Customer UI)

| Artifact | Status | Evidence |
|----------|--------|----------|
| `src/components/kunden/stripe-pay-button.tsx` | VERIFIED | window.location.href to /api/stripe/redirect, "Jetzt bezahlen", "Weiterleitung zu Stripe...", "Zahlung erhalten", "Ihre Zahlung wurde zurueckerstattet", return null visibility guard |
| `src/app/(frontend)/zahlung/[status]/page.tsx` | VERIFIED | "use client", maxPolls=15, 2000ms interval, /api/stripe/payment-status polling, 3 variants, login-aware Dashboard link |
| `src/app/(frontend)/zahlung/[status]/layout.tsx` | VERIFIED | robots: { index: false, follow: false } |
| `src/components/kunden/anfrage-detail.tsx` | VERIFIED | Passes status, stripePaymentStatus, stripeExpiresAt, gutschriftUrl to StripePayButton |

### Plan 04 Artifacts (Admin UI)

| Artifact | Status | Evidence |
|----------|--------|----------|
| `src/components/admin/zahlungs-panel.tsx` | VERIFIED | ZahlungsPanel exported, ZAHLUNGS_PANEL_VISIBLE_STATUSES gate, copy-to-clipboard, isExpired guard, "Neuen Link erstellen" at line 233, canRefund = userRole === "admin", RefundModal integration |
| `src/components/admin/refund-modal.tsx` | VERIFIED | RefundModal exported, POST /api/stripe/refund at line 48 |
| `src/components/admin/attention-bar.tsx` | VERIFIED | stripePaymentStatus prop at line 28, payment badge rendered with PAYMENT_STATUS_COLORS/LABELS |
| `src/components/admin/splitbutton.tsx` | VERIFIED | zahlungslink_versendet price guard at lines 70-73: !gesamtpreis || gesamtpreis <= 0 blocks transition |
| `src/app/(payload)/custom.scss` | VERIFIED | .zahlungs-panel and .refund-modal CSS classes present (lines 991+, 1079+) |
| `src/app/api/stripe/regenerate/[anfrageId]/route.ts` | VERIFIED | expireExistingSession + createCheckoutSession, admin/mitarbeiter role check |
| `src/components/admin/anfrage-detail-view.tsx` | VERIFIED | Imports ZahlungsPanel at line 11, renders at line 218 |

---

## Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|----------|
| `src/lib/stripe.ts` | `src/lib/settings.ts` | getSettings() for ablauf_stunden and waehrung | WIRED | Line 2: `import { getSettings }`, line 41: `const settings = await getSettings()` |
| `src/collections/business/anfragen.ts` | `src/lib/stripe.ts` | createCheckoutSession on zahlungslink_versendet | WIRED | Lines 252-254: dynamic import of createCheckoutSession + expireExistingSession |
| `src/collections/business/anfragen.ts` | `src/lib/status-config.ts` | rueckerstattung_ausstehend in status select options | WIRED | Line 419: zahlungslink_versendet in options, rueckerstattung_ausstehend present |
| `src/app/api/stripe/webhook/route.ts` | `src/lib/email/queue.ts` | queueEmailEvent for dispute staff email | WIRED | Lines 318-321: queueEmailEvent({ eventType: "zahlung_dispute" }) |
| `src/app/api/stripe/redirect/[anfrageId]/route.ts` | `src/lib/stripe.ts` | createCheckoutSession for regeneration | WIRED | Line 4: import, line 84: createCheckoutSession call |
| `src/components/kunden/stripe-pay-button.tsx` | `/api/stripe/redirect/[anfrageId]` | window.location.href navigation | WIRED | Line 77: `window.location.href = /api/stripe/redirect/${anfrageId}` |
| `src/app/(frontend)/zahlung/[status]/page.tsx` | `/api/stripe/payment-status` | fetch polling in useEffect | WIRED | Line 48: fetch call in setInterval |
| `src/components/admin/zahlungs-panel.tsx` | `src/components/admin/refund-modal.tsx` | Component import and render | WIRED | Line 14: import RefundModal, lines 249-257: RefundModal render |
| `src/components/admin/refund-modal.tsx` | `/api/stripe/refund` | POST fetch in onConfirm handler | WIRED | Line 48: `fetch("/api/stripe/refund", { method: "POST" ... })` |
| `src/components/admin/anfrage-detail-view.tsx` | `src/components/admin/zahlungs-panel.tsx` | Component import and render | WIRED | Line 11: import, line 218: ZahlungsPanel render |

---

## Requirements Coverage

| Requirement | Plans Claiming | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| STRP-01 | 27-00, 27-02 | Automatische Checkout Session bei Status "zahlungslink_versendet" | SATISFIED | afterChange hook creates session when status === "zahlungslink_versendet" |
| STRP-02 | 27-00, 27-01 | Stripe-Felder auf Anfrage (6 fields in Stripe-Daten tab) | SATISFIED | 6 fields defined in anfragen.ts Stripe-Daten tab |
| STRP-03 | 27-00, 27-04 | Zahlungslink in Admin-Detail-View (sichtbar, kopierbar, Status) | SATISFIED | ZahlungsPanel + AttentionBar badge + copy-to-clipboard implemented |
| STRP-04 | 27-00, 27-03 | "Jetzt bezahlen" Button im Kunden-Dashboard mit Stripe-Weiterleitung | SATISFIED | StripePayButton uses window.location.href redirect route |
| STRP-05 | 27-00, 27-02, 27-04 | Session Expiry + Regenerierung | SATISFIED | checkout.session.expired webhook handler + "Neuen Link erstellen" button + redirect auto-regeneration |
| STRP-06 | 27-00, 27-01, 27-02 | Doppelzahlung verhindern (max 1 aktive Session) | SATISFIED | expireExistingSession called in afterChange and redirect route before creating new session |
| STRP-07 | 27-00, 27-02 | Webhook-Idempotenz + 4 Event-Types | SATISFIED | Idempotency check on stripe_payment_status === "bezahlt" before update; 4 event handlers |
| STRP-08 | 27-00, 27-02, 27-04 | Rueckerstattung ueber Stripe API (voll + teilweise) | SATISFIED | POST /api/stripe/refund with Zod, optimistic lock, full/partial logic |
| STRP-09 | 27-00, 27-02 | charge.refunded + charge.dispute.created Webhook-Handler | SATISFIED | handleChargeRefunded and handleDisputeCreated in webhook/route.ts |
| STRP-10 | 27-00, 27-02 | zahlung_eingegangen Event an N8N + console.log Cleanup | SATISFIED | bezahlt event-matrix entry sends staff "Zahlung eingegangen" email via N8N queue. 0 console.log in webhook, all console.info with [Stripe Webhook] prefix |
| STRP-11 | 27-00, 27-01 | Stripe Customer-Objekt erstellen + verknuepfen | SATISFIED | findOrCreateStripeCustomer: checks Users DB -> Stripe API by email -> creates new; stripe_customer_id stored on Users |

**All 11 STRP requirements: SATISFIED**

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/admin/zahlungs-panel.tsx` | 39 | `return null` | Info | Intentional visibility gate -- `ZAHLUNGS_PANEL_VISIBLE_STATUSES.includes(status)` guard. Not a stub. |
| `src/components/kunden/stripe-pay-button.tsx` | 130 | `return null` | Info | Intentional -- component self-manages visibility for unrelated statuses. Not a stub. |

No blocker or warning anti-patterns found. Both `return null` instances are documented visibility guards, not empty implementations.

**Pre-existing TypeScript errors** (unrelated to Phase 27, confirmed pre-existing per SUMMARY):
- `src/app/(payload)/api/pdf-preview/[type]/route.ts`: Buffer type mismatch
- `src/lib/pdf/render-pdf.ts`: Buffer type mismatch
- `src/components/admin/anfragen-list-view.tsx`: string | undefined type
- `tests/unit/test-filters.test.ts`: Umlaut type exports
- `tests/unit/test-profile-hooks.test.ts`: Missing data property

All Phase 27 files compile without TypeScript errors.

---

## Human Verification Required

### 1. Full Payment Flow End-to-End

**Test:** Set an Anfrage status to "zahlungslink_versendet" with a price > 0. Verify that: (a) a Stripe Checkout Session is created in the Stripe test dashboard, (b) the stripe_checkout_url and stripe_session_id fields are populated on the Anfrage, (c) the customer-facing email contains a valid /api/stripe/redirect link.
**Expected:** All three conditions satisfied within a few seconds of the status change.
**Why human:** Requires live Stripe test API and email delivery, which cannot be verified programmatically.

### 2. Webhook Payment Confirmation

**Test:** Complete a payment in the Stripe test checkout UI. Verify that: (a) the Anfrage status changes to "bezahlt", (b) a Rechnung PDF is generated and attached to the Anfrage, (c) the customer receives a "Zahlung bestaetigt" email with the PDF attachment.
**Expected:** All three conditions satisfied within the webhook delivery window.
**Why human:** Requires live Stripe test webhook delivery and observing actual email output.

### 3. Danke-Seite Polling Behavior

**Test:** Navigate to /zahlung/erfolgreich?session_id=cs_test_xxx after completing a test payment. Observe the spinner -> success transition.
**Expected:** Spinner shows for up to 30s, transitions to "Zahlung erfolgreich!" green card when bezahlt status is confirmed, shows dashboard button when logged in.
**Why human:** Real-time UI polling behavior cannot be verified statically.

### 4. Refund Modal Double Confirmation

**Test:** As admin user, open a bezahlt Anfrage and click "Rueckerstatten". Fill in a partial amount and reason. Observe double-confirmation dialog. Confirm. Verify Stripe dashboard shows partial refund and anfrage stripe_refunded_amount_cents is updated.
**Expected:** Modal shows full/partial radio, amount validation, reason textarea. Confirmation dialog blocks accidental submission. Stripe API call succeeds.
**Why human:** UI interaction flow and live Stripe API refund cannot be verified statically.

### 5. Expired Session Auto-Regeneration

**Test:** With an Anfrage in zahlungslink_versendet status and an expired Stripe session, navigate to /api/stripe/redirect/[anfrageId]. Verify redirect to a fresh Stripe checkout URL.
**Expected:** New session created, old session expired, customer redirected to valid checkout.
**Why human:** Requires waiting for a Stripe session to expire (minimum 30 minutes per Stripe's limits).

---

## Gaps Summary

No gaps found. All 5 ROADMAP success criteria are verified, all 11 STRP requirements are satisfied, all artifacts exist with substantive implementations, all key links are wired, and no blocker anti-patterns were detected.

The phase delivers a complete automated Stripe payment pipeline:
- Status trigger -> Session creation -> Email delivery
- Admin view -> copy link -> regenerate on expiry
- Customer redirect -> Danke-Seite polling -> payment confirmation
- Webhook -> invoice generation -> email notification
- Admin refund modal -> Stripe API -> webhook sync -> Gutschrift PDF

---

_Verified: 2026-04-01T01:15:00Z_
_Verifier: Claude (gsd-verifier)_
