---
phase: 12-qa-tech-debt
plan: 01
subsystem: database
tags: [payload-cms, typescript, code-generation, type-safety]

# Dependency graph
requires:
  - phase: 09-filter-logic-refactor
    provides: "Hub-based filter types using Fensterforman/Sicherheitsgla"
provides:
  - "Clean TypeScript type names: Fensterform, Sicherheitsglas"
  - "typescript.interface override pattern for Payload CMS collections"
  - "Full audit of all collection interface names"
affects: [any-future-phase-importing-payload-types]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "typescript.interface override in Payload collection config to control generated type names"

key-files:
  created: []
  modified:
    - "src/collections/produkte/fensterformen.ts"
    - "src/collections/ausstattung/sicherheitsglas.ts"
    - "src/payload-types.ts"
    - "src/lib/konfigurator/types.ts"
    - "src/lib/konfigurator/filters.ts"
    - "src/components/konfigurator/steps/step-form.tsx"
    - "src/components/konfigurator/steps/step-verglasung-extras.tsx"
    - "tests/unit/test-filters-hub.test.ts"
    - "tests/unit/test-filters.test.ts"

key-decisions:
  - "typescript.interface override is the correct Payload CMS mechanism for controlling generated type names without changing admin UI labels"
  - "Full audit of all 28+ collection interfaces found no additional truncated names beyond the 2 known ones"
  - "Pre-existing TypeScript errors (18) in unrelated files left untouched per scope boundary rules"

patterns-established:
  - "typescript.interface override: use when Payload derives incorrect TypeScript names from German labels"

requirements-completed: [DEBT-03]

# Metrics
duration: 7min
completed: 2026-03-20
---

# Phase 12 Plan 01: Fix Truncated TypeScript Type Names Summary

**Fixed Fensterforman/Sicherheitsgla type generation typos via typescript.interface overrides, cascaded renames through 9 files, audited all 28+ collection interfaces**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-20T16:37:50Z
- **Completed:** 2026-03-20T16:44:29Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Added `typescript.interface` overrides to fensterformen and sicherheitsglas collections
- Regenerated payload-types.ts with clean interface names (Fensterform, Sicherheitsglas)
- Systematically audited all 28+ generated interfaces -- no other truncated names found
- Updated all 6 consuming files (types, filters, components, tests) with correct type names
- All 284 tests pass, reduced pre-existing TypeScript errors by 11

## Task Commits

Each task was committed atomically:

1. **Task 1: Add typescript.interface overrides, regenerate types, audit ALL collections** - `28e93da` (fix)
2. **Task 2: Update all type imports across codebase after rename** - `63f70e1` (fix)

## Files Created/Modified
- `src/collections/produkte/fensterformen.ts` - Added typescript.interface: "Fensterform" override
- `src/collections/ausstattung/sicherheitsglas.ts` - Added typescript.interface: "Sicherheitsglas" override
- `src/payload-types.ts` - Regenerated with clean interface names
- `src/lib/konfigurator/types.ts` - Updated Fensterforman -> Fensterform, Sicherheitsgla -> Sicherheitsglas
- `src/lib/konfigurator/filters.ts` - Updated type references in Hub filter logic
- `src/components/konfigurator/steps/step-form.tsx` - Updated Fensterform type import/usage
- `src/components/konfigurator/steps/step-verglasung-extras.tsx` - Updated Sicherheitsglas type import/usage
- `tests/unit/test-filters-hub.test.ts` - Updated both type references in Hub filter tests
- `tests/unit/test-filters.test.ts` - Updated Fensterform type reference in legacy filter tests

## Decisions Made
- Used `typescript.interface` property (Payload CMS built-in) to override generated names -- no admin UI impact
- Audited all collections systematically as requested by user decision, confirming only 2 truncated names existed
- Pre-existing TS errors in unrelated files (route.ts, store.ts, use-undo-redo.ts, profile-hooks tests) left untouched per scope boundary

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The `replace_all` edit operation for `Sicherheitsgla` also matched the already-correct `Sicherheitsglas` in step-verglasung-extras.tsx comments/JSX text, producing `Sicherheitsglass` (double-s). Caught immediately via grep verification and corrected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- DEBT-03 resolved, clean type names available for all future development
- Plan 12-02 and 12-03 can proceed independently (different tech debt items)

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 12-qa-tech-debt*
*Completed: 2026-03-20*
