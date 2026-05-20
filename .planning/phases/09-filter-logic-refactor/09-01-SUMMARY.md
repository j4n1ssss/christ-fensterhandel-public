---
phase: 09-filter-logic-refactor
plan: 01
subsystem: api
tags: [konfigurator, filters, hub-pattern, feature-flag, zustand, payload-cms]

# Dependency graph
requires:
  - phase: 07-deployment
    provides: "Hub fields on Profile collection (13 erlaubte_* relationship fields with maxDepth:0)"
  - phase: 08-migration-backfill
    provides: "Backfilled erlaubte_farben on all active profiles"
provides:
  - "getHubField<T>() generic helper for Profile Hub field filtering"
  - "USE_HUB feature flag controlling Steps 4-6 and 8-9"
  - "Hub code paths in filters.ts for all affected steps"
  - "Server-side aktiv=true filtering for 15 CMS collections"
  - "depth=1 for profile collection in loadCMSData"
  - "Profile cascade dependencies in STEP_DEPENDENCIES"
  - "Step 8 legacy path returns dichtungsfarben (new field in return shape)"
  - "33 unit tests for Hub filter logic"
affects: [09-02 (validation script), 10-undo-redo, 12-qa-tech-debt]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hub-filter pattern: getHubField intersects Profile Hub IDs with cmsData collection"
    - "Feature flag pattern: USE_HUB boolean controls legacy vs Hub code paths"
    - "COLLECTIONS_WITH_AKTIV Set for server-side aktiv filtering"

key-files:
  created:
    - "tests/unit/test-filters-hub.test.ts"
  modified:
    - "src/lib/konfigurator/filters.ts"
    - "src/lib/konfigurator/store.ts"
    - "src/lib/konfigurator/step-config.ts"
    - "tests/unit/test-cascade-reset.test.ts"

key-decisions:
  - "getHubField returns T[] | null (null = category hidden, not empty array)"
  - "Step 8 legacy path extended with dichtungsfarben field for consistent return shape"
  - "USE_HUB=false as default -- admin must populate Hub fields before switching"
  - "COLLECTIONS_WITH_AKTIV excludes preisregeln (no aktiv field)"
  - "depth=1 only for profile collection (Hub fields use maxDepth:0 = string IDs)"

patterns-established:
  - "Hub-filter: getHubField(profil, 'erlaubte_X', cmsData, 'collectionName') for centralized filtering"
  - "Feature flag: if(USE_HUB) { hub-code } else { legacy-code } in switch cases"
  - "Server-side aktiv filter: URLSearchParams with where[aktiv][equals]=true"

requirements-completed: [FILT-01, FILT-02, FILT-03, FILT-05, DEBT-01, DEBT-02]

# Metrics
duration: 6min
completed: 2026-03-18
---

# Phase 9 Plan 1: Hub Filter Logic Summary

**getHubField() helper with USE_HUB feature flag replacing chain-filters for Steps 4-6/8-9, plus server-side aktiv filtering and profile cascade dependencies**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-18T20:17:02Z
- **Completed:** 2026-03-18T20:22:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Implemented getHubField<T>() generic helper that intersects Profile Hub field IDs with cmsData collections, returning T[] | null
- Added USE_HUB=false feature flag with Hub code paths for Steps 4-6, 8-9 (legacy preserved in else branches)
- Added server-side aktiv=true filtering for 15 product/ausstattung collections (excludes preisregeln)
- Changed profile collection depth from 2 to 1 (Hub fields use maxDepth:0)
- Updated STEP_DEPENDENCIES so profile changes cascade-reset Steps 4-9
- Step 8 now returns dichtungsfarben in both Hub and legacy paths (consistent return shape)
- 33 new unit tests covering getHubField, legacy behavior, and Hub scenarios -- full suite 223 tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Hub filter tests + implement getHubField + refactor filters.ts** - `20fb467` (feat)
2. **Task 2: Update store.ts aktiv-filter + depth change, and step-config.ts dependencies** - `089ad08` (feat)

## Files Created/Modified
- `src/lib/konfigurator/filters.ts` - Added USE_HUB flag, getHubField helper, Hub code paths for Steps 4-6/8-9, dichtungsfarben in Step 8 legacy
- `src/lib/konfigurator/store.ts` - COLLECTIONS_WITH_AKTIV Set, server-side aktiv filter, depth=1 for profile
- `src/lib/konfigurator/step-config.ts` - STEP_DEPENDENCIES updated with Step 3 for Hub-affected steps
- `tests/unit/test-filters-hub.test.ts` - 33 tests for getHubField, USE_HUB flag, legacy behavior, Hub scenarios
- `tests/unit/test-cascade-reset.test.ts` - Updated for new dependency graph (Step 3 cascades to 4-9)

## Decisions Made
- getHubField returns T[] | null rather than T[] -- null signals "category hidden" which UI will use to conditionally render
- Step 8 legacy path extended with dichtungsfarben: cmsData.dichtungsfarben so components can always read filtered.dichtungsfarben regardless of USE_HUB state
- COLLECTIONS_WITH_AKTIV is a Set (O(1) lookup) listing 15 collections that have the aktiv boolean field
- Profile depth reduced to 1 because Hub fields use maxDepth:0 (return string IDs, not populated objects)
- Tested getHubField directly for Hub scenarios rather than mocking USE_HUB module constant

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hub filter logic complete, USE_HUB=false deployed safely
- Ready for Plan 2: validation script (npm run validate:hub-fields) to verify Profile completeness before switching USE_HUB=true
- Step 8/9 UI components will need to handle the new dichtungsfarben field and null categories (separate UI plan)

---
*Phase: 09-filter-logic-refactor*
*Completed: 2026-03-18*
