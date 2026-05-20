---
phase: 08-migration-backfill
plan: 01
subsystem: database
tags: [payload-cms, migration, backfill, typescript, jest, tdd]

# Dependency graph
requires:
  - phase: 07-data-model-foundation
    provides: Hub fields on Profile collection (erlaubte_farben relationship field)
provides:
  - Standalone migration script for backfilling erlaubte_farben on all Profile documents
  - Pure derivation logic (matchFarbenForProfile) tested with 10 unit tests
  - npm script migrate:farben for one-command execution
affects: [09-filter-logic-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns: [dynamic-import-for-jest-compatibility, standalone-payload-migration-script, tdd-pure-function-extraction]

key-files:
  created:
    - src/migrations/backfill-erlaubte-farben.ts
    - tests/unit/test-backfill-farben.test.ts
  modified:
    - package.json

key-decisions:
  - "Dynamic imports for Payload/config inside main() to keep pure functions Jest-testable"
  - "Guard script execution with argv check to prevent auto-run on test import"

patterns-established:
  - "Migration script pattern: pure functions at top (exported, testable), script body with dynamic imports below"
  - "Standalone Payload script with dynamic import() instead of static import for Jest compatibility"

requirements-completed: [MIG-01, MIG-02, MIG-03]

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 8 Plan 1: Backfill erlaubte_farben Summary

**Standalone migration script deriving erlaubte_farben from farben.erlaubte_materialien + profile.material with TDD-verified pure logic, paginated processing, dry-run mode, and idempotency**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T14:58:06Z
- **Completed:** 2026-03-18T15:02:01Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Pure derivation logic (matchFarbenForProfile, shouldBackfill, extractId) with 10 passing unit tests via TDD
- Complete migration script with Payload Local API integration, paginated profile processing, and in-memory Farben matching
- Dry-run mode (--dry-run flag), idempotency checks (skip already-filled profiles), structured logging with [UPDATED]/[SKIPPED]/[WARN] markers
- npm script `migrate:farben` registered for one-command execution

## Task Commits

Each task was committed atomically:

1. **Task 1: Derivation logic as pure function + unit tests** - `2411e55` (test) - TDD RED->GREEN
2. **Task 2: Migration script with Payload integration + npm script** - `0ebbb45` (feat)

## Files Created/Modified
- `src/migrations/backfill-erlaubte-farben.ts` - Migration script with exported pure functions and Payload integration
- `tests/unit/test-backfill-farben.test.ts` - 10 unit tests covering derivation, idempotency, edge cases
- `package.json` - Added `migrate:farben` npm script

## Decisions Made
- Used dynamic `import()` for Payload and config inside `main()` instead of top-level static imports, so Jest can import the file without triggering ESM parse errors from payload's node_modules
- Added argv-based guard (`process.argv[1].includes('backfill-erlaubte-farben')`) to prevent `main()` from auto-executing when the module is imported by tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved Payload imports to dynamic imports for Jest compatibility**
- **Found during:** Task 2 (Migration script integration)
- **Issue:** Static `import { getPayload } from 'payload'` at file top caused Jest to fail with ESM parse error on payload's node_modules
- **Fix:** Changed to dynamic `import()` inside `main()` function; added execution guard to prevent main() from running during test imports
- **Files modified:** src/migrations/backfill-erlaubte-farben.ts
- **Verification:** All 10 unit tests pass with `npx jest --testPathPatterns=test-backfill-farben --bail`
- **Committed in:** 0ebbb45 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary to keep pure functions testable while colocating them with the migration script. No scope creep.

## Issues Encountered
- Jest 30 replaced `--testPathPattern` with `--testPathPatterns` and `-x` with `--bail` -- adjusted verification commands accordingly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- erlaubte_farben backfill script ready to run against seeded database: `npm run migrate:farben` or `npm run migrate:farben -- --dry-run`
- Phase 9 (Filter Logic Refactor) can proceed -- it depends on erlaubte_farben being populated, which this migration provides
- Manual integration testing recommended: seed database, run migration, verify in Admin UI

---
*Phase: 08-migration-backfill*
*Completed: 2026-03-18*
