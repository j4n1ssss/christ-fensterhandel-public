---
phase: 12-qa-tech-debt
plan: 03
subsystem: documentation, qa
tags: [adr, versions-drafts, payload-cms, tech-debt, type-safety, build-verification]

# Dependency graph
requires:
  - phase: 12-01
    provides: "Type rename fixes (Fensterformen/Sicherheitsglas)"
  - phase: 12-02
    provides: "Hub-Status badge and filter for Profile list"
  - phase: 09-filter-logic-refactor
    provides: "Hub-filtered dichtungsfarben (DEBT-04) and filterOptions consistency (DEBT-05)"
provides:
  - "ADR-001 documenting no versions:drafts decision for v1.1"
  - "Inline decision comment in profile.ts"
  - "Expanded Out-of-Scope reasoning in REQUIREMENTS.md"
  - "DEBT-04 and DEBT-05 verified complete via automated checks"
  - "Clean build and full test suite pass after all Phase 12 changes"
  - "5 pre-existing type errors fixed to achieve clean build"
affects: [v1.2-planning, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: ["ADR format for architecture decisions in docs/entscheidungen/"]

key-files:
  created:
    - "docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md"
  modified:
    - "src/collections/produkte/profile.ts"
    - ".planning/REQUIREMENTS.md"
    - "src/app/api/anfrage/submit/route.ts"
    - "src/components/admin/use-undo-redo.ts"
    - "src/hooks/profile-edit-history.ts"
    - "src/lib/konfigurator/store.ts"
    - "src/scripts/validate-hub-fields.ts"

key-decisions:
  - "ADR-001: No versions:drafts in v1.1 due to _status migration risk (existing profiles become invisible)"
  - "Use != null (loose equality) instead of !== null for Payload optional fields that can be null OR undefined"

patterns-established:
  - "ADR pattern: docs/entscheidungen/{NNN}_{YYYY-MM-DD}_{beschreibung}.md"
  - "Inline decision comments at file top for critical architecture choices"

requirements-completed: [DEBT-04, DEBT-05, DEBT-06]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 12 Plan 03: Versions ADR + DEBT Verification Summary

**ADR-001 documenting no-versions:drafts decision, DEBT-04/DEBT-05 verified complete, 5 pre-existing type errors fixed for clean build (284 tests pass)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T13:13:05Z
- **Completed:** 2026-03-22T13:21:18Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created formal ADR (Architecture Decision Record) documenting why versions:drafts is not enabled in v1.1
- Verified DEBT-04 (dichtungsfarben Hub-filtered in filters.ts) and DEBT-05 (all 13 Hub fields have filterOptions aktiv=true)
- Fixed 5 pre-existing type errors that prevented clean build
- All 284 tests pass across 23 test suites
- All Phase 12 requirements (HUB-05, DEBT-03, DEBT-04, DEBT-05, DEBT-06) marked Complete

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ADR, add inline comment, and update REQUIREMENTS.md** - `f80fc0e` (docs)
2. **Task 2: Verify DEBT-04 and DEBT-05 completeness and run final build** - `697ad11` (fix)

## Files Created/Modified
- `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` - ADR documenting no versions:drafts decision
- `src/collections/produkte/profile.ts` - Added inline decision comment at top
- `.planning/REQUIREMENTS.md` - Updated Out-of-Scope reasoning, marked DEBT-04/05/06 Complete
- `src/app/api/anfrage/submit/route.ts` - Fixed null/undefined safety in rabattcode validation
- `src/components/admin/use-undo-redo.ts` - Fixed string|number id type for docKey
- `src/hooks/profile-edit-history.ts` - Fixed BasePayload type compatibility
- `src/lib/konfigurator/store.ts` - Fixed Set<string> type for COLLECTIONS_WITH_AKTIV
- `src/scripts/validate-hub-fields.ts` - Fixed re-export to import+re-export for local usage

## Decisions Made
- ADR-001: No versions:drafts in v1.1 -- _status migration risk makes existing profiles invisible
- Used `!= null` (loose equality) for Payload optional fields that can be both null and undefined
- Used `String(id)` conversion for Payload document IDs that can be string|number
- Used `Parameters<typeof fn>[1]` type extraction for resolveRelationshipLabels payload parameter

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed null/undefined safety in rabattcode validation**
- **Found during:** Task 2 (final build)
- **Issue:** `rabatt.aktuelle_nutzungen` and `rabatt.max_nutzungen` can be `null` or `undefined`, but `!== null` only narrows out `null`
- **Fix:** Changed `!== null` to `!= null` (covers both null and undefined), added `?? 0` for aktuelle_nutzungen
- **Files modified:** src/app/api/anfrage/submit/route.ts
- **Verification:** Build passes, no type errors
- **Committed in:** 697ad11

**2. [Rule 1 - Bug] Fixed string|number id type in useUndoRedo**
- **Found during:** Task 2 (final build)
- **Issue:** `useDocumentInfo().id` returns `string | number` but `getDocKey()` expects `string`
- **Fix:** Wrapped with `String(id || "")`
- **Files modified:** src/components/admin/use-undo-redo.ts
- **Verification:** Build passes
- **Committed in:** 697ad11

**3. [Rule 1 - Bug] Fixed BasePayload type compatibility in profile-edit-history**
- **Found during:** Task 2 (final build)
- **Issue:** `req.payload` (BasePayload) not assignable to resolveRelationshipLabels' custom payload type
- **Fix:** Used `Parameters<typeof resolveRelationshipLabels>[1]` type extraction via `as unknown as`
- **Files modified:** src/hooks/profile-edit-history.ts
- **Verification:** Build passes
- **Committed in:** 697ad11

**4. [Rule 1 - Bug] Fixed Set type narrowing in store.ts**
- **Found during:** Task 2 (final build)
- **Issue:** `COLLECTIONS_WITH_AKTIV` Set's const type excluded "preisregeln" from CMS_COLLECTIONS iteration
- **Fix:** Changed to `Set<string>` and removed unnecessary type assertion at call site
- **Files modified:** src/lib/konfigurator/store.ts
- **Verification:** Build passes
- **Committed in:** 697ad11

**5. [Rule 3 - Blocking] Fixed missing local binding for REQUIRED_HUB_FIELDS**
- **Found during:** Task 2 (final build)
- **Issue:** `export { X } from "y"` re-exports without creating local binding -- REQUIRED_HUB_FIELDS not available in module scope
- **Fix:** Changed to `import { X } from "y"; export { X };`
- **Files modified:** src/scripts/validate-hub-fields.ts
- **Verification:** Build passes
- **Committed in:** 697ad11

---

**Total deviations:** 5 auto-fixed (4 bugs, 1 blocking)
**Impact on plan:** All fixes were pre-existing type errors surfaced by the build step. No scope creep -- all necessary for clean build verification.

## Issues Encountered
None beyond the pre-existing type errors documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 12 (QA & Tech-Debt) is COMPLETE -- all 3 plans executed
- v1.1 milestone is ready for closure
- All 32 v1.1 requirements verified Complete
- Clean build + 284 passing tests confirm no regressions
- ADR pattern established in docs/entscheidungen/ for future decisions

## Self-Check: PASSED

- FOUND: docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md
- FOUND: .planning/phases/12-qa-tech-debt/12-03-SUMMARY.md
- FOUND: f80fc0e (Task 1 commit)
- FOUND: 697ad11 (Task 2 commit)

---
*Phase: 12-qa-tech-debt*
*Completed: 2026-03-22*
