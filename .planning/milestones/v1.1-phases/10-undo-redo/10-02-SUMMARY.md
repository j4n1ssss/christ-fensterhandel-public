---
phase: 10-undo-redo
plan: 02
subsystem: ui
tags: [undo-redo, payload-admin, form-api, keyboard-shortcuts, react-context, field-highlight, toast]

# Dependency graph
requires:
  - phase: 10-undo-redo
    plan: 01
    provides: UndoRedoStack class, createCleanSnapshot, getDocKey utilities
provides:
  - UndoRedoProvider (global admin React Context wrapping all admin views)
  - useUndoRedo hook (debounced snapshots, undo/redo actions, field highlighting, toast feedback)
  - ProfileEditToolbar (Undo2/Redo2 icon buttons in Profile Edit-View beforeDocumentControls)
  - Keyboard shortcuts Cmd+Z / Cmd+Shift+Z scoped to editDepth 1
affects: [11-edit-history (same Profile Edit-View), 12-qa-tech-debt (overall QA)]

# Tech tracking
tech-stack:
  added: []
  patterns: [global-provider-via-payload-admin-components-providers, direct-addEventListener-over-useHotkey, field-highlight-via-dom-query-label-plus-input]

key-files:
  created:
    - src/components/admin/undo-redo-provider.tsx
    - src/components/admin/use-undo-redo.ts
    - src/components/admin/profile-edit-toolbar.tsx
  modified:
    - src/payload.config.ts
    - src/collections/produkte/profile.ts
    - src/components/admin/undo-redo-stack.ts
    - tests/unit/test-undo-redo.test.ts
  deleted:
    - src/components/admin/undo-redo-poc.tsx

key-decisions:
  - "Replace useHotkey with direct addEventListener for keyboard shortcut reliability (useHotkey did not fire consistently)"
  - "Field highlight targets .field-label (text color) + .rs__control or .field-type__wrap (background/border) instead of generic data-path query"
  - "Guard timing increased to DEBOUNCE_MS+100 (400ms) to prevent undo/redo action from being re-captured as new snapshot"
  - "floorIndex default changed from -1 to 0, canUndo uses > floorIndex (not > floorIndex+1) for correct save-checkpoint semantics"
  - "Removed save-detection useEffect (unreliable) -- undo/redo after save documented as known issue for later redesign (docs/todos/013)"
  - "Tooltip text uses explicit Cmd+Z / Cmd+Shift+Z labels instead of Unicode symbols for clarity"

patterns-established:
  - "Admin provider registration: string path in admin.components.providers array (payload.config.ts)"
  - "beforeDocumentControls for collection-specific toolbar injection (profile.ts)"
  - "Direct DOM event listeners for keyboard shortcuts when Payload hooks are unreliable"
  - "Snapshot hash update after dispatch to prevent re-capture race condition"

requirements-completed: [UNDO-02, UNDO-03, UNDO-04]

# Metrics
duration: 8min
completed: 2026-03-19
---

# Phase 10 Plan 02: Undo/Redo UI Summary

**UndoRedoProvider + useUndoRedo hook + ProfileEditToolbar with Cmd+Z/Cmd+Shift+Z keyboard shortcuts, field highlight (label color + input background), and German toast feedback -- QA-verified and bugfixed in live admin**

## Performance

- **Duration:** 8 min (execution) + QA session with bugfixes
- **Started:** 2026-03-19T13:00:00Z
- **Completed:** 2026-03-19T13:39:12Z
- **Tasks:** 3
- **Files modified:** 7 (3 created, 3 modified, 1 deleted)

## Accomplishments
- Complete undo/redo system operational in Profile Edit-View with buttons and keyboard shortcuts
- Field highlight shows label text color change (amber) plus input/select background and border pulse on undo/redo
- German toast feedback ("N Felder rückgängig gemacht" / "N Felder wiederhergestellt") with 2-second auto-dismiss
- PoC component replaced by production toolbar; import map regenerated
- 6 QA bugfixes applied during manual testing for production reliability (details below)
- 245 unit tests pass (1 new test added for corrected floor semantics)

## Task Commits

Each task was committed atomically:

1. **Task 1: UndoRedoProvider + useUndoRedo hook + ProfileEditToolbar** - `d1c618d` (feat)
2. **Task 2: Wire into Payload config + replace PoC + generate importmap** - `83f88d4` (feat)
3. **Task 3: QA bugfixes from manual testing** - `2421a0d` (fix)

## Files Created/Modified
- `src/components/admin/undo-redo-provider.tsx` - Global React Context holding Map<docKey, UndoRedoStack> instances
- `src/components/admin/use-undo-redo.ts` - Hook wiring debounced form watching, undo/redo dispatch, field highlighting, keyboard shortcuts
- `src/components/admin/profile-edit-toolbar.tsx` - Undo2/Redo2 icon buttons with tooltip, hover states, disabled opacity
- `src/payload.config.ts` - Added providers array with UndoRedoProvider registration
- `src/collections/produkte/profile.ts` - Replaced PoC with ProfileEditToolbar in beforeDocumentControls
- `src/components/admin/undo-redo-stack.ts` - Fixed floorIndex default and canUndo boundary check
- `tests/unit/test-undo-redo.test.ts` - Updated test 8 for corrected floor semantics + added test 8b
- `src/components/admin/undo-redo-poc.tsx` - DELETED (replaced by production toolbar)

## Decisions Made
- **useHotkey replaced with direct addEventListener:** The Payload useHotkey hook did not fire consistently during QA testing. Switched to a direct keydown event listener with manual metaKey/ctrlKey detection and editDepth guard. More reliable and equally safe.
- **Field highlight refined for Payload DOM structure:** Initial approach queried `[data-path]` which missed most fields. Production approach navigates from `#field-{path}` up to `.field-type`, then targets `.field-label` (text color) and `.rs__control` or `.field-type__wrap` (background/border) for correct visual feedback on both text inputs and React Select dropdowns.
- **Guard timing increased to 400ms:** The initial 50ms guard was insufficient -- the debounced snapshot capture at 300ms could still fire after the guard cleared, re-capturing the undo/redo state as a new snapshot. Increased to DEBOUNCE_MS + 100 = 400ms.
- **Save-detection useEffect removed:** Auto-detecting save completion by comparing value/initialValue was unreliable (fired too early, caused incorrect floor positioning). Removed entirely. Undo/redo after save is documented as a known issue for a later bulletproof redesign (docs/todos/013).
- **floorIndex semantics corrected:** Default changed from -1 to 0, and canUndo/undo checks use `> floorIndex` instead of `> floorIndex + 1`, allowing undo TO the save point (the saved state) but not past it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] useHotkey not firing reliably**
- **Found during:** Task 3 (Manual QA)
- **Issue:** Cmd+Z and Cmd+Shift+Z via Payload's useHotkey hook did not trigger consistently in the Profile Edit-View
- **Fix:** Replaced useHotkey with direct `document.addEventListener('keydown', handler)` using useEffect cleanup, with manual metaKey/ctrlKey detection and editDepth === 1 guard
- **Files modified:** src/components/admin/use-undo-redo.ts
- **Committed in:** 2421a0d

**2. [Rule 1 - Bug] Field highlight targeting wrong DOM elements**
- **Found during:** Task 3 (Manual QA)
- **Issue:** `[data-path]` selector missed most Payload fields; React Select dropdowns have highlight-relevant elements inside `.rs__control`
- **Fix:** Navigate from `#field-{path}` to `.field-type` parent, then target `.field-label` for text color and `.rs__control` or `.field-type__wrap` for background/border
- **Files modified:** src/components/admin/use-undo-redo.ts
- **Committed in:** 2421a0d

**3. [Rule 1 - Bug] Tooltip text using escaped Unicode instead of real UTF-8**
- **Found during:** Task 3 (Manual QA)
- **Issue:** Tooltips showed `\u00FC` escape sequences instead of actual umlauts, and used Unicode symbols for modifier keys
- **Fix:** Replaced with real UTF-8 characters and explicit "Cmd+Z" / "Cmd+Shift+Z" text
- **Files modified:** src/components/admin/profile-edit-toolbar.tsx
- **Committed in:** 2421a0d

**4. [Rule 1 - Bug] floorIndex default and boundary check incorrect**
- **Found during:** Task 3 (Manual QA)
- **Issue:** With floorIndex defaulting to -1 and canUndo checking `> floorIndex + 1`, it was impossible to undo back to the save-point state after markSaved()
- **Fix:** floorIndex default changed to 0, checks use `> floorIndex` allowing undo TO the floor (save state) but not past it
- **Files modified:** src/components/admin/undo-redo-stack.ts, tests/unit/test-undo-redo.test.ts
- **Committed in:** 2421a0d

**5. [Rule 1 - Bug] Undo/redo state re-captured as new snapshot**
- **Found during:** Task 3 (Manual QA)
- **Issue:** After dispatching REPLACE_STATE, the debounced snapshot capture would fire and push the restored state as a new entry, corrupting the stack
- **Fix:** Update lastSnapshotHashRef after dispatch; increase guard timing from 50ms to DEBOUNCE_MS+100 (400ms); add double-check guard inside debounce callback
- **Files modified:** src/components/admin/use-undo-redo.ts
- **Committed in:** 2421a0d

**6. [Rule 1 - Bug] Save-detection useEffect unreliable**
- **Found during:** Task 3 (Manual QA)
- **Issue:** Auto-detecting save completion by comparing all field values to initialValues fired at wrong times, setting floor incorrectly
- **Fix:** Removed the entire save-detection useEffect. Documented as known limitation for later redesign (docs/todos/013_2026-03-19_undo-redo-save-robustheit.md)
- **Files modified:** src/components/admin/use-undo-redo.ts
- **Committed in:** 2421a0d

---

**Total deviations:** 6 auto-fixed (all Rule 1 bugs found during QA)
**Impact on plan:** All bugfixes necessary for correct operation discovered during the planned manual QA checkpoint. Core functionality works. Save-checkpoint behavior deferred to a dedicated todo for bulletproof redesign.

## Issues Encountered
- Undo/Redo after Save is unreliable -- the floor (save checkpoint) positioning needs a more robust approach than comparing value/initialValue. Documented in docs/todos/013_2026-03-19_undo-redo-save-robustheit.md for later dedicated work.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 10 (Undo/Redo) complete: UndoRedoStack + Provider + Hook + Toolbar all operational
- Profile Edit-View has production undo/redo with buttons, keyboard shortcuts, field highlight, and toast
- Phase 11 (Edit-History Hooks + UI) can proceed -- same Profile Edit-View, no conflicts with undo/redo components
- Known limitation: undo/redo after save needs dedicated redesign (separate todo, not blocking Phase 11/12)

## Self-Check: PASSED

- All 3 created files exist (undo-redo-provider.tsx, use-undo-redo.ts, profile-edit-toolbar.tsx)
- PoC file confirmed deleted (undo-redo-poc.tsx)
- All 3 commits verified (d1c618d, 83f88d4, 2421a0d)
- 245 tests pass

---
*Phase: 10-undo-redo*
*Completed: 2026-03-19*
