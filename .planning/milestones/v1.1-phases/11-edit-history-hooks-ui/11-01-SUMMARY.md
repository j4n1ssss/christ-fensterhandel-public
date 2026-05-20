---
phase: 11-edit-history-hooks-ui
plan: 01
subsystem: api
tags: [payload-hooks, diff-computation, edit-history, relationship-resolution, tdd]

# Dependency graph
requires:
  - phase: 07-deployment
    provides: edit_history collection with immutable access control
provides:
  - Pure diff computation library (computeDiff) for field-level change detection
  - Async relationship label resolution (resolveRelationshipLabels) with graceful degradation
  - Profile beforeChange hook setting last_edited_by
  - Profile afterChange hook creating edit_history entries with full diff
  - last_edited_by field on Profile collection (hidden, maxDepth 1)
  - History tab config and ProfileLastEditor component registration in profile admin
affects: [11-02-PLAN, edit-history-ui, profile-collection]

# Tech tracking
tech-stack:
  added: []
  patterns: [beforeChange-data-mutation, afterChange-audit-log, context-skip-guard, dot-path-group-diff, sorted-array-relationship-comparison]

key-files:
  created:
    - src/lib/diff-utils.ts
    - src/hooks/profile-edit-history.ts
    - tests/unit/test-diff-utils.test.ts
    - tests/unit/test-profile-hooks.test.ts
  modified:
    - src/collections/produkte/profile.ts
    - src/payload-types.ts

key-decisions:
  - "computeDiff is a synchronous pure function with no Payload dependency -- async resolution is separate"
  - "hasMany relationship arrays compared via sorted JSON.stringify -- order-insensitive"
  - "Group fields (technische_daten, masse) use dot-path notation for sub-field granularity"
  - "HAS_MANY_RELATIONSHIP_FIELDS derived from RELATIONSHIP_FIELDS minus material at module load"

patterns-established:
  - "Diff utility pattern: pure computeDiff + async resolveRelationshipLabels (decoupled from Payload)"
  - "Profile hook pattern: beforeChange for data mutation (last_edited_by), afterChange for side effects (edit_history)"
  - "Context guard pattern: context.skipEditHistory in afterChange + passed to nested create call"

requirements-completed: [HIST-02, HIST-03, HIST-04]

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 11 Plan 01: Edit-History Hooks Summary

**Pure diff computation with group dot-paths and relationship label resolution, Profile hooks (beforeChange + afterChange) with context-based infinite loop guard, and 39 unit tests**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T21:59:22Z
- **Completed:** 2026-03-19T22:05:13Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Diff utility library handling all Profile field types: text, number, select, checkbox, textarea, upload, group (dot-path), single relationship, hasMany relationship (sorted array comparison)
- Relationship label resolution at save time (snapshot frozen) with graceful degradation on lookup failure
- Profile hooks wired: beforeChange sets last_edited_by, afterChange creates edit_history entries with computed diff
- Infinite loop prevention via context.skipEditHistory guard
- Admin config updated: History tab at /history, ProfileLastEditor in beforeDocumentControls
- 39 total unit tests (27 diff-utils + 12 hooks) covering HIST-02, HIST-03, HIST-04

## Task Commits

Each task was committed atomically:

1. **Task 1: Diff utility library + unit tests** - `8a0f477` (test + feat, TDD)
2. **Task 2: Profile hooks + schema updates + wiring + tests** - `0938cc8` (feat)

## Files Created/Modified
- `src/lib/diff-utils.ts` - Pure diff computation functions and relationship label resolution
- `src/hooks/profile-edit-history.ts` - beforeChange and afterChange hook functions for Profile
- `src/collections/produkte/profile.ts` - Added hooks, last_edited_by field, history tab, ProfileLastEditor
- `src/payload-types.ts` - Regenerated with last_edited_by on Profile type
- `tests/unit/test-diff-utils.test.ts` - 27 tests for diff computation and label resolution
- `tests/unit/test-profile-hooks.test.ts` - 12 tests for hook logic and context guard

## Decisions Made
- computeDiff is synchronous and pure (no async, no Payload dependency) -- async label resolution is a separate function
- hasMany relationship arrays use sorted comparison: same IDs in different order is NOT a change
- Group fields use dot-path notation (e.g., `technische_daten.uw_wert`) for sub-field granularity
- HAS_MANY_RELATIONSHIP_FIELDS derived automatically from RELATIONSHIP_FIELDS minus `material` at module load

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `--testPathPattern` flag is deprecated in current Jest version, replaced with `--testPathPatterns` (existing project issue)
- importMap.js is gitignored (generated file) -- excluded from commit, regenerated via `npm run generate:importmap`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Hooks and diff logic complete, ready for Plan 02 (UI components: ProfileLastEditor + ProfileHistoryPanel)
- Component paths registered in importMap.js and profile admin config
- All 284 tests pass (full suite green, no regressions)

## Self-Check: PASSED

- [x] src/lib/diff-utils.ts -- FOUND
- [x] src/hooks/profile-edit-history.ts -- FOUND
- [x] tests/unit/test-diff-utils.test.ts -- FOUND
- [x] tests/unit/test-profile-hooks.test.ts -- FOUND
- [x] src/collections/produkte/profile.ts -- FOUND
- [x] Commit 8a0f477 -- FOUND
- [x] Commit 0938cc8 -- FOUND

---
*Phase: 11-edit-history-hooks-ui*
*Completed: 2026-03-19*
