---
phase: 11-edit-history-hooks-ui
plan: 02
subsystem: ui
tags: [payload-admin, react-components, edit-history, document-controls, history-panel]

# Dependency graph
requires:
  - phase: 11-edit-history-hooks-ui
    provides: edit_history hooks, diff-utils, last_edited_by field, admin component registrations
provides:
  - ProfileLastEditor header component showing last editor name, email, and timestamp
  - ProfileHistoryPanel document view tab with expandable before/after diffs
  - Event badges (update, create, keine Aenderungen) with color-coded styling
  - Relationship label resolution display in diff views
affects: [12-qa-tech-debt, profile-collection-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [initialData-for-resolved-relationships, beforeDocumentControls-client-component, document-view-tab-with-rest-fetch]

key-files:
  created: []
  modified:
    - src/components/admin/profile-last-editor.tsx
    - src/components/admin/profile-history-panel.tsx

key-decisions:
  - "useDocumentInfo().initialData for resolved relationship data (form state only stores IDs as strings)"
  - "isResolvedEditor type guard for robust object detection instead of typeof string check"
  - "Real UTF-8 umlauts in all UI text (keine Aenderungen -> keine Änderungen)"

patterns-established:
  - "initialData pattern: use useDocumentInfo().initialData for accessing resolved relationship objects (form state via useAllFormFields stores only IDs)"
  - "beforeDocumentControls renders inline with save buttons in the document controls bar"

requirements-completed: [HIST-05, HIST-06]

# Metrics
duration: 2min
completed: 2026-03-20
---

# Phase 11 Plan 02: Edit-History UI Components Summary

**ProfileLastEditor header via initialData (not form state) + ProfileHistoryPanel with expandable diffs, fixed visibility bug and UTF-8 umlaut transliterations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-20T13:45:03Z
- **Completed:** 2026-03-20T13:46:38Z
- **Tasks:** 2 (Task 1 from prior session, Task 2 continuation fix)
- **Files modified:** 2

## Accomplishments
- ProfileLastEditor header shows "Zuletzt bearbeitet von [Name] ([Email]) am [Datum]" inline with document controls
- ProfileHistoryPanel document view tab at /history loads last 50 entries with expand/collapse diffs
- Fixed critical visibility bug: switched from useAllFormFields (stores only IDs) to useDocumentInfo().initialData (has resolved relationship objects with maxDepth:1)
- Fixed all ASCII umlaut transliterations to real UTF-8 characters

## Task Commits

Each task was committed atomically:

1. **Task 1: ProfileLastEditor header + ProfileHistoryPanel tab** - `3607b65` (feat)
2. **Task 2: Visual QA fixes -- last-editor visibility + umlaut corrections** - `6bf074a` (fix)

## Files Created/Modified
- `src/components/admin/profile-last-editor.tsx` - Fixed data source from useAllFormFields to useDocumentInfo().initialData; added isResolvedEditor type guard
- `src/components/admin/profile-history-panel.tsx` - Fixed "keine Aenderungen" -> "keine Änderungen" and "Noch keine Aenderungen protokolliert." -> "Noch keine Änderungen protokolliert."

## Decisions Made
- **useDocumentInfo().initialData over useAllFormFields:** Payload form state stores relationship values as raw ID strings, not resolved objects. The initialData from useDocumentInfo() contains the server-loaded document data with maxDepth:1 resolution, making it the correct source for displaying resolved relationship data like last_edited_by user objects.
- **isResolvedEditor type guard:** More robust than a simple typeof check. Validates the object has both `id` and `email` properties before treating it as a resolved editor.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ProfileLastEditor invisible due to wrong data source**
- **Found during:** Task 2 (Visual QA checkpoint continuation)
- **Issue:** useAllFormFields() returns form state where relationship field values are stored as string IDs (not resolved objects). The component checked `typeof lastEditedBy === "string"` and returned null, making it permanently invisible.
- **Fix:** Switched to useDocumentInfo().initialData which has the server-loaded document data with maxDepth:1 resolution. Added isResolvedEditor type guard for robust object detection.
- **Files modified:** src/components/admin/profile-last-editor.tsx
- **Verification:** 284 tests pass, import map unchanged
- **Committed in:** 6bf074a

**2. [Rule 1 - Bug] ASCII umlaut transliterations in UI text**
- **Found during:** Task 2 (Visual QA checkpoint continuation)
- **Issue:** "keine Aenderungen" and "Noch keine Aenderungen protokolliert." used ASCII transliterations instead of real UTF-8 umlauts, violating project convention.
- **Fix:** Replaced with "keine Änderungen" and "Noch keine Änderungen protokolliert."
- **Files modified:** src/components/admin/profile-history-panel.tsx
- **Verification:** Grep confirms no remaining transliterations
- **Committed in:** 6bf074a

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correct user-visible behavior. No scope creep.

## Issues Encountered
- Payload form state (useAllFormFields) stores relationship field values as raw ID strings even when maxDepth > 0 on the field config. This is by design -- the form state represents form input values, not resolved API data. The initialData from useDocumentInfo() is the correct source for resolved relationships.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 11 complete: hooks + diff-utils (Plan 01) and UI components (Plan 02) both shipped
- Ready for Phase 12 (QA & Tech-Debt)
- All 284 tests pass (full suite green, no regressions)

## Self-Check: PASSED

- [x] src/components/admin/profile-last-editor.tsx -- FOUND
- [x] src/components/admin/profile-history-panel.tsx -- FOUND
- [x] Commit 3607b65 -- FOUND
- [x] Commit 6bf074a -- FOUND

---
*Phase: 11-edit-history-hooks-ui*
*Completed: 2026-03-20*
