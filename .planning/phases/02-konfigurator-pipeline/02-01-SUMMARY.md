---
phase: 02-konfigurator-pipeline
plan: 01
subsystem: konfigurator
tags: [zustand, zod, nuqs, typescript, jest, konfigurator, filtering, price-calculation]

requires:
  - phase: 01-fundament
    provides: Payload CMS collections with relationship fields (erlaubte_materialien, erlaubte_profile, fuer_produkttypen, etc.)
provides:
  - KonfiguratorSelections, CMSData, WingOpening, StepConfig TypeScript types
  - Zustand store with persist middleware, cascade reset, CMS data loading
  - Client-side conditional filtering for steps 2-8 using CMS relationships
  - Zod validation schemas per step with dynamic min/max from profile
  - Price calculator (area * grundpreis_pro_m2 + aufpreise)
  - URL state sync via nuqs, LocalStorage persistence helpers
  - Step dependency graph with transitive resolution
affects: [02-02-konfigurator-shell, 02-03-steps-1-5, 02-04-steps-6-10]

tech-stack:
  added: [zustand@5, nuqs@2, zod@3, react-hook-form@7, "@hookform/resolvers@5", jest@29, ts-jest, "@testing-library/react", "@testing-library/jest-dom"]
  patterns: [zustand-persist-with-skipHydration, cms-relationship-filtering, transitive-dependency-graph, tdd-red-green]

key-files:
  created:
    - jest.config.ts
    - src/lib/konfigurator/types.ts
    - src/lib/konfigurator/step-config.ts
    - src/lib/konfigurator/store.ts
    - src/lib/konfigurator/url-state.ts
    - src/lib/konfigurator/filters.ts
    - src/lib/konfigurator/persistence.ts
    - src/lib/konfigurator/schemas.ts
    - src/lib/konfigurator/price-calculator.ts
    - tests/unit/test-cascade-reset.test.ts
    - tests/unit/test-filters.test.ts
    - tests/unit/test-schemas.test.ts
    - tests/unit/test-price-calculator.test.ts
  modified:
    - package.json

key-decisions:
  - "Zustand store uses skipHydration:true with persist middleware to avoid SSR hydration mismatch"
  - "getFilteredOptions returns unknown for flexibility across different step return types (arrays, objects, null)"
  - "extractId helper handles both string IDs and populated Payload objects in relationship fields"
  - "Set<number> for completedSteps serialized as array in LocalStorage, restored via merge function"

patterns-established:
  - "CMS filtering pattern: extractId() normalizes string|object relationship fields before comparison"
  - "Cascade reset pattern: BFS traversal of STEP_DEPENDENCIES for transitive dependent discovery"
  - "Schema context pattern: getStepSchema(step, context) accepts optional runtime constraints"

requirements-completed: [KONF-01, KONF-13, KONF-14]

duration: 7min
completed: 2026-03-09
---

# Phase 2 Plan 01: Konfigurator-Logik Summary

**Zustand store with cascade reset, conditional CMS filtering for steps 2-8, Zod schemas with dynamic profile constraints, and area-based price calculator -- 32 tests passing**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-09T17:25:56Z
- **Completed:** 2026-03-09T17:33:00Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Complete configurator logic layer: types, store, filters, schemas, price calculator
- 32 unit tests across 4 test suites all passing
- TypeScript compiles cleanly with zero errors
- Test framework (Jest + ts-jest + testing-library) fully configured

## Task Commits

Each task was committed atomically:

1. **Task 1: Test-Framework + Konfigurator-Types + Step-Config** - `792877f` (feat)
2. **Task 2: Store + Filters + Schemas + Price Calculator + alle Tests** - `c3be0fd` (feat)

## Files Created/Modified
- `jest.config.ts` - Jest configuration with ts-jest, jsdom, path aliases
- `src/lib/konfigurator/types.ts` - CMSData, KonfiguratorSelections, WingOpening, StepConfig interfaces
- `src/lib/konfigurator/step-config.ts` - STEPS array, STEP_DEPENDENCIES graph, findDependentSteps()
- `src/lib/konfigurator/store.ts` - Zustand store with persist, cascade reset, CMS data loading
- `src/lib/konfigurator/url-state.ts` - nuqs URL state sync hook
- `src/lib/konfigurator/filters.ts` - getFilteredOptions() for steps 2-8 using CMS relationships
- `src/lib/konfigurator/persistence.ts` - showRestoreDialog(), clearSavedConfig() helpers
- `src/lib/konfigurator/schemas.ts` - getStepSchema() with dynamic min/max from profile
- `src/lib/konfigurator/price-calculator.ts` - calculatePreviewPrice() with area + aufpreise
- `tests/unit/test-cascade-reset.test.ts` - 6 tests for transitive dependency resolution
- `tests/unit/test-filters.test.ts` - 14 tests for conditional filtering (steps 2-8)
- `tests/unit/test-schemas.test.ts` - 7 tests for Zod validation including dynamic constraints
- `tests/unit/test-price-calculator.test.ts` - 5 tests for price calculation
- `package.json` - Added zustand, nuqs, zod, react-hook-form, jest, testing-library

## Decisions Made
- Used `skipHydration: true` in Zustand persist config to avoid SSR hydration mismatch (client component pattern)
- `getFilteredOptions` returns `unknown` type -- each step returns a different shape (arrays, objects with aussen/innen, null for masse constraints)
- `extractId()` helper normalizes Payload relationship fields that can be either string IDs or populated objects
- completedSteps stored as `Set<number>` in memory, serialized to array for LocalStorage via custom merge function
- Installed ts-node as dev dependency (required by Jest for TypeScript config file parsing)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed ts-node for Jest config parsing**
- **Found during:** Task 1 (Test Framework Setup)
- **Issue:** Jest requires ts-node to parse TypeScript config files, but it was not listed in plan's install command
- **Fix:** Ran `npm install -D ts-node`
- **Files modified:** package.json, package-lock.json
- **Verification:** Jest runs successfully with TypeScript config
- **Committed in:** 792877f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor dependency addition. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All configurator logic modules ready for UI layer consumption
- Types, store, filters, schemas, and price calculator exported and tested
- Next plan (02-02) can import useKonfiguratorStore, getFilteredOptions, getStepSchema, calculatePreviewPrice directly

---
*Phase: 02-konfigurator-pipeline*
*Completed: 2026-03-09*

## Self-Check: PASSED
- All 13 created files verified on disk
- Both task commits (792877f, c3be0fd) verified in git log
- 32/32 tests passing
- TypeScript compiles with zero errors
