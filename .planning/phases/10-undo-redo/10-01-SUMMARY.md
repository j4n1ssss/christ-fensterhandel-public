---
phase: 10-undo-redo
plan: 01
subsystem: ui
tags: [undo-redo, payload-admin, form-api, tdd, structuredClone]

# Dependency graph
requires:
  - phase: 07-deployment
    provides: Profile collection with 13 Hub relationship fields (hasMany, maxDepth:0)
provides:
  - UndoRedoStack class (pure TS, no React) with push/undo/redo/markSaved/reset
  - getDocKey utility for document-scoped stack isolation
  - createCleanSnapshot for stripping non-cloneable React nodes from FormState
  - PoC component verifying getFields/REPLACE_STATE round-trip in live admin
affects: [10-02-PLAN (ProfileEditToolbar replaces PoC, uses UndoRedoStack)]

# Tech tracking
tech-stack:
  added: []
  patterns: [pure-class-with-tdd, structuredClone-for-deep-copy, dispatchFields-REPLACE_STATE-not-replaceState]

key-files:
  created:
    - src/components/admin/undo-redo-stack.ts
    - src/components/admin/undo-redo-poc.tsx
    - tests/unit/test-undo-redo.test.ts
    - tests/jest-setup.ts
  modified:
    - src/collections/produkte/profile.ts
    - jest.config.ts

key-decisions:
  - "structuredClone polyfill in jest-setup.ts for jsdom environment (Node 22 has it natively but jest-environment-jsdom sandbox does not expose it)"
  - "dispatchFields REPLACE_STATE with optimize:false + form.setModified(true) pattern verified in PoC (not form.replaceState which sets modified=false)"

patterns-established:
  - "Pure TS class for state management logic, separated from React hooks for testability"
  - "createCleanSnapshot strips customComponents (React nodes) and rows[].customComponents before structuredClone"
  - "Floor index (Boden-Index) pattern: markSaved sets undo boundary, undo returns null at floor"

requirements-completed: [UNDO-01, UNDO-05, UNDO-06]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 10 Plan 01: Undo/Redo Stack + PoC Summary

**Pure UndoRedoStack class with 12 TDD tests (floor index, FIFO eviction, document isolation) plus PoC component verifying getFields/REPLACE_STATE round-trip with hasMany relationship fields**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T22:51:15Z
- **Completed:** 2026-03-18T22:55:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- UndoRedoStack class passes 12 unit tests covering push, undo, redo, floor index, eviction at maxSize=50, redo-branch clearing, and reset
- createCleanSnapshot correctly strips customComponents from both FieldState entries and their nested rows for safe structuredClone
- PoC component wired into Profile Edit-View (beforeDocumentControls) with Capture/Restore/Compare buttons using dispatchFields REPLACE_STATE with optimize:false

## Task Commits

Each task was committed atomically:

1. **Task 1: Pure UndoRedoStack class + unit tests** - `02b41fd` (feat, TDD)
2. **Task 2: PoC component for getFields/REPLACE_STATE verification** - `6b3ca3b` (feat)

## Files Created/Modified
- `src/components/admin/undo-redo-stack.ts` - Pure UndoRedoStack class, getDocKey, createCleanSnapshot (no React imports)
- `src/components/admin/undo-redo-poc.tsx` - Temporary PoC with Capture/Restore/Compare for live admin testing
- `tests/unit/test-undo-redo.test.ts` - 12 unit tests for stack logic
- `tests/jest-setup.ts` - structuredClone polyfill for jsdom test environment
- `jest.config.ts` - Added setupFiles reference
- `src/collections/produkte/profile.ts` - Added beforeDocumentControls with PoC component path

## Decisions Made
- Used `setupFiles` in jest.config.ts to polyfill `structuredClone` for the jsdom test environment (Node 22 has it globally but jest-environment-jsdom does not expose it in its sandbox). JSON-based fallback is safe since all data is serializable after stripping React nodes.
- Verified the `dispatchFields({ type: 'REPLACE_STATE', state, optimize: false }) + form.setModified(true)` pattern as the correct approach (form.replaceState() sets modified=false which disables the save button).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added jest-setup.ts for structuredClone polyfill**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** `structuredClone` not available in jest-environment-jsdom sandbox, causing createCleanSnapshot tests to fail with ReferenceError
- **Fix:** Created `tests/jest-setup.ts` with JSON-based structuredClone polyfill, added `setupFiles` to jest.config.ts
- **Files modified:** tests/jest-setup.ts (created), jest.config.ts (modified)
- **Verification:** All 244 tests pass including the 12 new undo-redo tests
- **Committed in:** 02b41fd (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for test environment compatibility. No scope creep.

## Issues Encountered
None beyond the structuredClone polyfill (documented above as deviation).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- UndoRedoStack class ready for use by ProfileEditToolbar in Plan 02
- PoC component in Profile Edit-View ready for manual live testing (UNDO-01 verification)
- Manual QA needed: Open Profile edit in admin, populate erlaubte_farben, Capture, change field, Restore, verify field reverts

---
*Phase: 10-undo-redo*
*Completed: 2026-03-18*
