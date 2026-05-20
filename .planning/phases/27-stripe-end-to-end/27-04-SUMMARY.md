---
plan: "27-04"
phase: "27-stripe-end-to-end"
status: complete
started: 2026-04-01
completed: 2026-04-01
---

## Summary

Built all admin-facing Stripe UI components: ZahlungsPanel with payment status badge, Stripe dashboard links, collapsible details, and regenerate/refund actions. RefundModal with full/partial radio, amount input, reason textarea, and double confirmation. AttentionBar payment status badge with copy-to-clipboard. Splitbutton price guard blocking zahlungslink_versendet without price. Custom SCSS styles for new components.

## Self-Check: PASSED

All acceptance criteria verified:
- [x] ZahlungsPanel shows in right column with payment status, link, expiry, amount, and collapsible details
- [x] AttentionBar shows payment status badge with copy icon
- [x] RefundModal has radio for full/partial, amount input, reason textarea, double confirmation
- [x] Splitbutton blocks transition to zahlungslink_versendet when gesamtpreis is 0 or null
- [x] Neuen Link erstellen button visible only when stripe_payment_status is abgelaufen
- [x] CSS classes for zahlungs-panel and refund-modal in custom.scss

## Commits

| Hash | Message |
|------|---------|
| f449e16 | feat(27-04): add ZahlungsPanel, RefundModal, regenerate endpoint, and payment CSS |
| a4f50c6 | feat(27-04): integrate ZahlungsPanel, payment badge, and price guard into admin views |

## Key Files

### Created
- `src/components/admin/zahlungs-panel.tsx` — Payment details panel with all fields, actions, and collapsible details
- `src/components/admin/refund-modal.tsx` — Refund dialog with validation and double confirmation
- `src/app/api/stripe/regenerate/[anfrageId]/route.ts` — Admin-only endpoint for expired link regeneration

### Modified
- `src/components/admin/anfrage-detail-view.tsx` — Integrates ZahlungsPanel in right column
- `src/components/admin/attention-bar.tsx` — Payment status badge with copy-to-clipboard
- `src/components/admin/splitbutton.tsx` — Price guard for zahlungslink_versendet
- `src/app/(payload)/custom.scss` — CSS classes for zahlungs-panel and refund-modal

## Deviations

- **Rule 3 (auto-fix):** Changed toast import from `sonner` (not installed) to `@payloadcms/ui`
- **Rule 3 (auto-fix):** Fixed readonly array `.includes()` type errors with explicit casts
- **Orchestrator completion:** Task 2 commit was completed by orchestrator after agent timeout
