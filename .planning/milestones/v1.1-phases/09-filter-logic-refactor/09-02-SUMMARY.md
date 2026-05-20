---
phase: 09-filter-logic-refactor
plan: 02
subsystem: ui
tags: [konfigurator, steps, hub-pattern, validation, tdd, feature-flag]

# Dependency graph
requires:
  - phase: 09-filter-logic-refactor-01
    provides: "getHubField() helper, USE_HUB flag, Hub code paths in filters.ts, dichtungsfarben in Step 8 return"
provides:
  - "Step 8 reads dichtungsfarben from filter result (not store.cmsData)"
  - "Step 9 null-safe category rendering (sections hidden when Hub returns null)"
  - "Step 4 handles both legacy array and Hub object return types"
  - "validateProfile() pure function with Pflicht/optional distinction"
  - "npm run validate:hub-fields for pre-deployment verification"
  - "9 unit tests for validation logic"
affects: [12-qa-tech-debt]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Null-safe section rendering: {data.field !== null && (<Section>...</Section>)}"
    - "Dual return type handling: Array.isArray(result) to detect legacy vs Hub format"
    - "Validation script pattern: pure functions at top, dynamic imports in main()"

key-files:
  created:
    - "src/scripts/validate-hub-fields.ts"
    - "tests/unit/test-validate-hub.test.ts"
  modified:
    - "src/components/konfigurator/steps/step-farben.tsx"
    - "src/components/konfigurator/steps/step-verglasung-extras.tsx"
    - "src/components/konfigurator/steps/step-fluegel.tsx"
    - "package.json"

key-decisions:
  - "Step 4 uses Array.isArray() to detect legacy vs Hub return type at runtime"
  - "Step 9 optional sections hidden entirely (not shown as 'not available') when Hub returns null"
  - "Validation script follows backfill-erlaubte-farben pattern: pure functions + dynamic imports"

patterns-established:
  - "Hub-aware component: check return type shape, fallback to legacy filtering when needed"
  - "Null-safe section: conditional render entire Section when category data is null"

requirements-completed: [FILT-04, FILT-06]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 9 Plan 2: Step Component Updates + Hub Validation Script Summary

**Step components consume Hub filter return types (dichtungsfarben, null categories, dual return), plus validateProfile() script with Pflicht/optional distinction and npm script**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T20:26:00Z
- **Completed:** 2026-03-18T20:31:00Z
- **Tasks:** 3 of 3 (Task 3 human-verify checkpoint: approved)
- **Files modified:** 6

## Accomplishments
- Step 8 (Farben) reads dichtungsfarben from getFilteredOptions result instead of store.cmsData directly
- Step 9 (Verglasung & Extras) hides optional sections (Schallschutz, Sicherheitsglas, Glasdekor, Sprossen, Extras) when Hub returns null
- Step 4 (Fluegel) handles both legacy Fluegelanzahl[] array and Hub { fluegelanzahl, zusatzlichter } object return
- Created validateProfile() with REQUIRED_HUB_FIELDS (5 Pflicht) and OPTIONAL_HUB_FIELDS (8 optional) distinction
- npm run validate:hub-fields registered for pre-deployment verification
- 9 new unit tests (TDD: RED then GREEN), full suite 232 tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Update step components to consume new filter return types** - `f175747` (feat)
2. **Task 2 RED: Failing tests for validation script** - `9bacfd7` (test)
3. **Task 2 GREEN: Implement validation script + npm script** - `cf20557` (feat)

## Files Created/Modified
- `src/components/konfigurator/steps/step-farben.tsx` - Cast includes dichtungsfarben, reads from filtered.dichtungsfarben
- `src/components/konfigurator/steps/step-verglasung-extras.tsx` - Null-safe type cast, guarded extras grouping, 5 section null checks
- `src/components/konfigurator/steps/step-fluegel.tsx` - Array.isArray dual return type handling for Hub vs legacy
- `src/scripts/validate-hub-fields.ts` - Pure validateProfile() + standalone script with pagination
- `tests/unit/test-validate-hub.test.ts` - 9 test cases covering valid, invalid, warnings, edge cases
- `package.json` - Added validate:hub-fields npm script

## Decisions Made
- Step 4 uses Array.isArray() runtime check to detect legacy (Fluegelanzahl[]) vs Hub ({ fluegelanzahl, zusatzlichter }) return -- avoids coupling to USE_HUB constant
- Step 9 sections are hidden entirely when null (not shown as "not available") -- cleaner UX consistent with CONTEXT.md decision
- Validation script uses same pattern as backfill-erlaubte-farben.ts: pure functions exported at top for Jest, dynamic imports in main()

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Task 3 (human-verify checkpoint) approved: all 10 configurator steps work with USE_HUB=false, no console errors
- Phase 9 complete, ready for Phase 10 (Undo/Redo)
- Before switching USE_HUB=true: admin must populate Hub fields, then run npm run validate:hub-fields

---
*Phase: 09-filter-logic-refactor*
*Completed: 2026-03-18 (Task 3 QA checkpoint approved)*
