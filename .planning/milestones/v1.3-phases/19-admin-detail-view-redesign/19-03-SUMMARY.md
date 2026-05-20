---
phase: 19-admin-detail-view-redesign
plan: 03
status: complete
started: 2026-03-25
completed: 2026-03-25
---

## Summary

Rewrote `anfrage-detail-view.tsx` from a 540-line 3-column layout to a ~200-line 2-column composition using four sub-components (AttentionBar, Splitbutton, ProductCard, TabPanel). During visual verification, added createdAt display and wartezeit fallback to AttentionBar, removed broken "Standard-Ansicht" link, and added Wartezeit column to dashboard table.

## Key Files

### Created
- (none)

### Modified
- `src/components/admin/anfrage-detail-view.tsx` — Complete rewrite composing sub-components into 2-column layout
- `src/components/admin/attention-bar.tsx` — Added createdAt prop, "vom DD.MM.YYYY" display, wartezeit fallback to createdAt
- `src/components/admin/dashboard-overview.tsx` — Added Wartezeit column with urgency colors to "Letzte 10 Anfragen" table

## Commits
- `c5d8b50` — feat(19-03): rewrite anfrage-detail-view composing sub-components into 2-column layout
- `4608bdc` — fix(19): add createdAt to attention bar, wartezeit fallback, dashboard wartezeit column

## Deviations
- AttentionBar was missing createdAt display entirely — added "vom DD.MM.YYYY" during checkpoint review
- Wartezeit used only `last_status_change_at` which is null for fresh "neu" anfragen — added `createdAt` fallback
- Removed "Zurueck zur Standard-Ansicht" link per user decision (custom views are permanent, Payload default UI not wanted)
- Added Dashboard Wartezeit column (not in original plan scope, but logical extension spotted during verification)

## Self-Check: PASSED
