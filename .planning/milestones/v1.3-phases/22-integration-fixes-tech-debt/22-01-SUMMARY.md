---
phase: 22-integration-fixes-tech-debt
plan: 01
subsystem: ui
tags: [deduplication, status-labels, admin, kunden, tech-debt]

# Dependency graph
requires:
  - phase: 19-admin-detail-view
    provides: formatCurrency shared module, detail-view-helpers, splitbutton
  - phase: 21-kunden-dashboard-n8n
    provides: STATUS_CUSTOMER_TEXT pattern in kunden components
provides:
  - Single-source-of-truth for formatCurrency (no local copies)
  - Exported HERSTELLER_STATUSES from detail-view-helpers.ts
  - Customer-facing STATUS_CUSTOMER_TEXT in gast-tracking-form.tsx
  - Real stornierung date in Splitbutton via lastStatusChangeAt prop
affects: [admin-components, kunden-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "STATUS_CUSTOMER_TEXT pattern for all kunden-facing status displays"
    - "Prop-drilling lastStatusChangeAt for accurate date display"

key-files:
  created: []
  modified:
    - src/components/admin/dashboard-overview.tsx
    - src/lib/detail-view-helpers.ts
    - src/components/admin/tab-panel.tsx
    - src/app/(payload)/custom.scss
    - src/components/kunden/gast-tracking-form.tsx
    - src/components/admin/splitbutton.tsx
    - src/components/admin/anfrage-detail-view.tsx

key-decisions:
  - "Use 'unbekannt' as fallback for missing stornierung date instead of fabricating today's date"

patterns-established:
  - "All kunden components use STATUS_CUSTOMER_TEXT for status display, never getStatusLabel"
  - "HERSTELLER_STATUSES single source in detail-view-helpers.ts, imported by consumers"

requirements-completed: [STAT-02, KUND-01]

# Metrics
duration: 5min
completed: 2026-03-27
---

# Phase 22 Plan 01: Integration Fixes and Tech Debt Summary

**Deduplicated formatCurrency and HERSTELLER_STATUSES to single sources, replaced admin labels with customer-facing STATUS_CUSTOMER_TEXT in gast-tracking-form, and fixed Splitbutton to show real stornierung date**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-27T08:09:46Z
- **Completed:** 2026-03-27T08:14:48Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Eliminated local formatCurrency duplicate in dashboard-overview.tsx, now imports from shared @/lib/format-currency
- Exported HERSTELLER_STATUSES from detail-view-helpers.ts and eliminated local copy in tab-panel.tsx
- Replaced all 4 getStatusLabel call sites in gast-tracking-form.tsx with STATUS_CUSTOMER_TEXT for customer-friendly display
- Fixed Splitbutton to show real stornierung date from last_status_change_at field with "unbekannt" fallback
- Removed dead .link-standard-view CSS class from custom.scss
- All 569 unit tests pass, no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Deduplicate shared utilities and remove dead CSS** - `98592a0` (fix)
2. **Task 2: Fix customer-facing labels in gast-tracking and Splitbutton stornierung date** - `fb28a06` (fix)

## Files Created/Modified
- `src/components/admin/dashboard-overview.tsx` - Replaced local formatCurrency with shared import
- `src/lib/detail-view-helpers.ts` - Exported HERSTELLER_STATUSES array
- `src/components/admin/tab-panel.tsx` - Imported HERSTELLER_STATUSES, removed local duplicate
- `src/app/(payload)/custom.scss` - Removed dead .link-standard-view class
- `src/components/kunden/gast-tracking-form.tsx` - Replaced getStatusLabel with STATUS_CUSTOMER_TEXT at 4 sites
- `src/components/admin/splitbutton.tsx` - Added lastStatusChangeAt prop, use real date for stornierung
- `src/components/admin/anfrage-detail-view.tsx` - Pass lastStatusChangeAt to Splitbutton

## Decisions Made
- Used "unbekannt" as fallback text when lastStatusChangeAt is null/undefined, instead of fabricating today's date (honesty over cosmetics)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure (exit code 1) caused by `useSearchParams` called conditionally in `anfragen-list-view.tsx` line 89 -- this is NOT caused by our changes and was already failing before phase 22. Logged as out-of-scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All shared utility deduplication complete
- Customer-facing components consistently use STATUS_CUSTOMER_TEXT
- Pre-existing build error in anfragen-list-view.tsx should be addressed in a future plan

## Self-Check: PASSED

- All 7 modified files verified present
- Commit 98592a0 (Task 1) verified in git log
- Commit fb28a06 (Task 2) verified in git log
- SUMMARY.md created at expected path

---
*Phase: 22-integration-fixes-tech-debt*
*Completed: 2026-03-27*
