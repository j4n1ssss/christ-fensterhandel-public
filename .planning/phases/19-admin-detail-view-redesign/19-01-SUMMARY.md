---
phase: 19-admin-detail-view-redesign
plan: 01
subsystem: ui
tags: [status-config, formatCurrency, wartezeit, urgency, scss, admin-detail-view]

# Dependency graph
requires:
  - phase: 18-statuses-transitions-collection-felder
    provides: StatusKey type, STATUS_COLORS, VALID_TRANSITIONS
provides:
  - QUICK_ACTIONS map for all 20 statuses with human-readable labels
  - formatCurrency shared utility (de-DE, EUR)
  - detail-view-helpers (wartezeit, urgency, produkt-zusammenfassung, terminal/completed detection)
  - BEM-like CSS classes in custom.scss for attention-bar, splitbutton, product-card, tab-panel, detail-layout, quantity-badge, terminal-info, comment-panel, status-badge, urgency-badge, spec-row
affects: [19-02-sub-components, 19-03-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [BEM-like CSS in custom.scss, pure data modules without React]

key-files:
  created:
    - src/lib/format-currency.ts
    - src/lib/detail-view-helpers.ts
    - tests/unit/test-quick-actions.test.ts
    - tests/unit/test-detail-view-helpers.test.ts
  modified:
    - src/lib/status-config.ts
    - src/app/(payload)/custom.scss

key-decisions:
  - "QUICK_ACTIONS targets validated against VALID_TRANSITIONS at test time"
  - "formatCurrency extracted as standalone module for reuse by kunden and admin components"

patterns-established:
  - "BEM-like CSS in custom.scss for Payload admin components (no Tailwind)"
  - "Pure data helper modules (no React, no 'use client') for testability"

requirements-completed: [ADMN-01, ADMN-10]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 19 Plan 01: Data Layer + CSS Foundation Summary

**QUICK_ACTIONS map for 20 statuses, formatCurrency shared utility, wartezeit/urgency helpers, and 11 BEM-like CSS class families in custom.scss**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T11:12:39Z
- **Completed:** 2026-03-25T11:16:04Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- QUICK_ACTIONS export added to status-config.ts with all 20 StatusKey entries, validated against VALID_TRANSITIONS
- formatCurrency extracted from anfrage-detail-view.tsx to shared utility
- detail-view-helpers.ts with getWaitingDays, getUrgencyLevel, getProduktZusammenfassung, isTerminalStatus, isCompletedStatus, shouldShowDetailsTab, URGENCY_COLORS
- 11 CSS class families appended to custom.scss (attention-bar, status-badge, urgency-badge, splitbutton, comment-panel, detail-layout, product-card, quantity-badge, tab-panel, terminal-info, spec-row)
- 23 unit tests all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: QUICK_ACTIONS + formatCurrency + detail-view-helpers (TDD)** - `023387c` (feat)
2. **Task 2: BEM-like CSS classes in custom.scss** - `f4c7d34` (feat)

_Note: Task 1 followed TDD flow (RED -> GREEN in single commit since source modules were new)_

## Files Created/Modified
- `src/lib/status-config.ts` - Added QUICK_ACTIONS export with 20 status entries
- `src/lib/format-currency.ts` - Shared de-DE EUR currency formatter
- `src/lib/detail-view-helpers.ts` - Wartezeit, urgency, produkt-zusammenfassung, status detection helpers
- `src/app/(payload)/custom.scss` - 240 lines of BEM-like structural CSS for detail view components
- `tests/unit/test-quick-actions.test.ts` - 7 tests validating QUICK_ACTIONS completeness and correctness
- `tests/unit/test-detail-view-helpers.test.ts` - 16 tests validating all helper functions and formatCurrency

## Decisions Made
None - followed plan as specified

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All data exports and CSS classes ready for Plan 02 (sub-components)
- QUICK_ACTIONS map ready for SplitButton component
- detail-view-helpers ready for AttentionBar and ProductCard components
- custom.scss classes ready for all React component className references

## Self-Check: PASSED

- All 6 files verified on disk
- Both commit hashes (023387c, f4c7d34) found in git log

---
*Phase: 19-admin-detail-view-redesign*
*Completed: 2026-03-25*
