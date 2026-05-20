---
phase: 20-admin-list-view-redesign
plan: 01
subsystem: ui
tags: [admin, list-view, status-config, attention-score, css, bem]

requires:
  - phase: 19-admin-detail-view-redesign
    provides: detail-view-helpers.ts (getWaitingDays), custom.scss (Phase 19 BEM classes), status-config.ts (StatusKey, STATUS_COLORS, STATUS_LABELS)
provides:
  - STATUS_WEIGHT constant (20 entries, 4 weight tiers)
  - LIST_TAB_FILTERS constant (5 tabs mapping to StatusKey arrays)
  - list-view-helpers.ts with 5 pure functions (getAttentionScore, getScoreColor, formatRelativeTime, getSmartDefaultTab, getLetzeAktion)
  - Phase 20 BEM CSS classes for list view components
affects: [20-02-PLAN, admin-list-view-components]

tech-stack:
  added: []
  patterns: [attention-score-computation, relative-time-formatting, smart-default-tab, list-view-bem-css]

key-files:
  created:
    - src/lib/list-view-helpers.ts
    - tests/unit/test-list-view-helpers.test.ts
  modified:
    - src/lib/status-config.ts
    - tests/unit/test-status-config.test.ts
    - src/app/(payload)/custom.scss

key-decisions:
  - "reklamation added to rueckfrage tab filter for complete 20-status coverage (plan listed only 19 in tabs)"

patterns-established:
  - "Attention score: waitingDays x statusWeight for prioritizing admin list view rows"
  - "Score color ranges: green 1-5, yellow 6-15, orange 16-30, red 31+"
  - "Smart default tab: rueckfrage > offen > alle priority"

requirements-completed: [ADMN-07, ADMN-08, ADMN-09]

duration: 5min
completed: 2026-03-25
---

# Phase 20 Plan 01: Data Layer + CSS Foundation Summary

**STATUS_WEIGHT/LIST_TAB_FILTERS constants, 5 pure list-view helper functions with 139 passing tests, and complete BEM CSS class set for admin list view components**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T15:32:51Z
- **Completed:** 2026-03-25T15:38:35Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added STATUS_WEIGHT (20 entries, 4 tiers: 3=admin-action, 2=admin-check, 1=external-wait, 0=terminal) and LIST_TAB_FILTERS (5 tabs covering all 20 statuses) to status-config.ts
- Created list-view-helpers.ts with 5 pure functions: getAttentionScore, getScoreColor, formatRelativeTime, getSmartDefaultTab, getLetzeAktion
- Added comprehensive unit tests (139 total pass including new and extended tests)
- Appended full Phase 20 BEM CSS class set (filter tabs, table, score bar, 3-dot menu, pagination, empty/error/loading states) to custom.scss

## Task Commits

Each task was committed atomically:

1. **Task 1: STATUS_WEIGHT + LIST_TAB_FILTERS + list-view-helpers.ts with tests** - `13d7c00` (feat)
2. **Task 2: Phase 20 CSS classes in custom.scss** - `ce9af76` (feat)

## Files Created/Modified
- `src/lib/status-config.ts` - Added STATUS_WEIGHT and LIST_TAB_FILTERS constants
- `src/lib/list-view-helpers.ts` - New file with 5 pure helper functions for admin list view
- `tests/unit/test-list-view-helpers.test.ts` - New test file with 5 describe blocks covering all functions
- `tests/unit/test-status-config.test.ts` - Extended with STATUS_WEIGHT and LIST_TAB_FILTERS test blocks
- `src/app/(payload)/custom.scss` - Appended Phase 20 BEM CSS classes (247 lines)

## Decisions Made
- reklamation added to rueckfrage tab filter: plan only listed 19 statuses across tabs (missing reklamation). Added to rueckfrage tab since it requires admin attention similar to hersteller_problem. This ensures union of all non-alle tabs equals all 20 StatusKeys.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added reklamation to LIST_TAB_FILTERS.rueckfrage**
- **Found during:** Task 1 (LIST_TAB_FILTERS implementation)
- **Issue:** Plan specified only 19 statuses across tabs, missing reklamation. Test "every StatusKey appears in exactly one non-alle tab" would fail.
- **Fix:** Added reklamation to the rueckfrage tab array (semantically correct: complaints need admin attention)
- **Files modified:** src/lib/status-config.ts
- **Verification:** All 139 tests pass, coverage test confirms all 20 StatusKeys present
- **Committed in:** 13d7c00 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for test correctness. No scope creep.

## Issues Encountered
- Jest CLI flags changed: `--testPathPattern` replaced by `--testPathPatterns` and `-x` replaced by `--bail` in newer Jest version. Adapted commands accordingly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data layer and CSS foundation complete for Plan 02
- Plan 02 can import STATUS_WEIGHT, LIST_TAB_FILTERS from status-config.ts
- Plan 02 can import all 5 helper functions from list-view-helpers.ts
- All BEM CSS classes ready for use in React components

## Self-Check: PASSED

- All 5 created/modified files verified on disk
- Both task commits (13d7c00, ce9af76) verified in git log
- 139 unit tests passing

---
*Phase: 20-admin-list-view-redesign*
*Completed: 2026-03-25*
