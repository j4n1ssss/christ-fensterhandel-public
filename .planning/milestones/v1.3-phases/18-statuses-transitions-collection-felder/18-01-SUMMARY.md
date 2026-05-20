---
phase: 18-statuses-transitions-collection-felder
plan: 01
subsystem: database
tags: [typescript, status-config, payload-cms, flat-maps]

# Dependency graph
requires:
  - phase: 17-status-config-centralization
    provides: Initial 7-status status-config.ts with flat map pattern
provides:
  - 20-status StatusKey union type
  - 7 complete flat maps (COLORS, LABELS, TAILWIND, CUSTOMER_TEXT, CUSTOMER_PHASE, GROUP, EMAIL_TRIGGER_STATUSES)
  - 14 customer-facing statuses via EMAIL_TRIGGER_STATUSES
  - Semantic color groups (amber, blue, green, emerald, violet, cyan, gray, red)
affects: [18-02-transitions, 18-03-collection-fields, 19-admin-splitbutton, 20-filter-tabs, 21-kunden-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: [semantic-color-groups, 20-status-lifecycle]

key-files:
  created: []
  modified:
    - src/lib/status-config.ts
    - tests/unit/test-status-config.test.ts

key-decisions:
  - "Labels use real UTF-8 umlauts (Bestätigt, Rückfrage, geöffnet) not ASCII-safe equivalents"
  - "Em-dash character stored as literal UTF-8, not \\u2014 escape"
  - "Breaking color change: neu from blue to amber, in_bearbeitung from amber to blue (semantic grouping)"

patterns-established:
  - "Semantic color groups: 7 groups (Aktionsbedarf/amber, Bearbeitung/blue, Bezahlung/green+emerald, Hersteller/violet, Lieferung/cyan, Abgeschlossen/gray, Problem/red)"
  - "Customer-facing subset: 14 of 20 statuses trigger customer emails; 6 are internal-only"

requirements-completed: [STAT-03]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 18 Plan 01: Status Config 20 Summary

**20-status StatusKey union with 7 semantic flat maps, 14 customer-facing email triggers, and TDD test coverage (100 tests)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T08:58:01Z
- **Completed:** 2026-03-25T09:03:39Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Extended StatusKey from 7 to 20 string literals covering the full order lifecycle
- Populated all 7 flat maps (STATUS_COLORS, STATUS_LABELS, STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, STATUS_GROUP, EMAIL_TRIGGER_STATUSES) with data for all 20 keys
- EMAIL_TRIGGER_STATUSES narrowed from 7 (all) to 14 customer-facing statuses, excluding 6 internal-only statuses
- 100 unit tests pass green with TDD workflow (RED then GREEN)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update test-status-config.test.ts for 20-status assertions** - `56a6645` (test -- TDD RED)
2. **Task 2: Extend status-config.ts to 20 statuses with all flat maps** - `b3af550` (feat -- TDD GREEN)

## Files Created/Modified
- `src/lib/status-config.ts` - Extended from 7 to 20 StatusKey entries with all 7 flat maps populated
- `tests/unit/test-status-config.test.ts` - Updated from 7-status to 20-status assertions (100 tests)

## Decisions Made
- Labels use real UTF-8 umlauts per project feedback rule, not ASCII-safe equivalents used in UI-SPEC
- Em-dash characters stored as literal UTF-8 (not \u2014 escapes) per project "no Unicode escapes in UI texts" rule
- Breaking color change applied: neu moves from blue (#3b82f6) to amber (#f59e0b), in_bearbeitung from amber (#eab308) to blue (#3b82f6) for semantic grouping consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- status-config.ts is the foundation consumed by every other file in Phase 18 and Phases 19-21
- Ready for Plan 18-02 (status-transitions.ts extension) and Plan 18-03 (collection field additions)
- No blockers

## Self-Check: PASSED

- [x] src/lib/status-config.ts exists
- [x] tests/unit/test-status-config.test.ts exists
- [x] 18-01-SUMMARY.md exists
- [x] Commit 56a6645 found (Task 1 - TDD RED)
- [x] Commit b3af550 found (Task 2 - TDD GREEN)

---
*Phase: 18-statuses-transitions-collection-felder*
*Completed: 2026-03-25*
