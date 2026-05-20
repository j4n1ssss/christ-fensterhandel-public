---
phase: 28-angebots-workflow
plan: 00
subsystem: testing
tags: [jest, test-stubs, tdd, angebot, pricing, versioning, agb]

# Dependency graph
requires:
  - phase: 27-stripe-end-to-end
    provides: Jest config, test patterns, Stripe webhook test stubs
provides:
  - 5 test stub files covering all Angebots-Workflow behaviors
  - 37 todo tests ready for implementation in Plans 28-01 through 28-04
affects: [28-angebots-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [Wave 0 test stubs with it.todo() before implementation]

key-files:
  created:
    - tests/unit/test-angebot-pricing.test.ts
    - tests/unit/test-angebot-versioning.test.ts
    - tests/unit/test-angebot-annehmen.test.ts
    - tests/unit/test-angebot-agb.test.ts
    - tests/unit/test-angebot-webhook-expiry.test.ts
  modified: []

key-decisions:
  - "All tests use it.todo() pattern (no skip/pending) for Jest discovery"
  - "Pricing test imports calcNetFromGross/calcGrossFromNet from existing tax lib"

patterns-established:
  - "Wave 0 test stubs: define behavior before implementation via it.todo()"

requirements-completed: [ANG-01, ANG-02, ANG-03, ANG-05]

# Metrics
duration: 2min
completed: 2026-04-01
---

# Phase 28 Plan 00: Test Stubs Summary

**37 behavioral test stubs across 5 files covering pricing, versioning, acceptance validation, AGB checkbox, and webhook expiry reset**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T08:52:48Z
- **Completed:** 2026-04-01T08:55:00Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Created 5 test stub files with 37 it.todo() tests defining expected Angebots-Workflow behaviors
- All 5 test suites discovered by Jest and pass (0 failures, 37 pending)
- Subsequent plans 28-01 through 28-04 can reference these tests in their verify blocks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 5 test stub files for Angebots-Workflow behaviors** - `f557033` (test)

## Files Created/Modified
- `tests/unit/test-angebot-pricing.test.ts` - 11 todo tests for Brutto/Netto derivation, custom price detection, Rabatt calculation
- `tests/unit/test-angebot-versioning.test.ts` - 4 todo tests for version increment and latest-version queries
- `tests/unit/test-angebot-annehmen.test.ts` - 11 todo tests for status, expiry, AGB, and checkout creation validation
- `tests/unit/test-angebot-agb.test.ts` - 7 todo tests for AGB schema validation and timestamp storage
- `tests/unit/test-angebot-webhook-expiry.test.ts` - 4 todo tests for checkout expiry reset with flow metadata

## Decisions Made
- All tests use `it.todo()` pattern (consistent with existing Wave 0 stubs in test-stripe-webhook.test.ts)
- Pricing test file imports existing `calcNetFromGross`/`calcGrossFromNet` from `@/lib/tax` to establish the dependency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Jest `--testPathPattern` flag replaced by `--testPathPatterns` (plural) in current version -- used correct flag for verification

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 test stub files ready for Plans 28-01 through 28-04 to flesh out
- Test infrastructure verified: Jest discovers and runs all stubs successfully

## Self-Check: PASSED

- [x] tests/unit/test-angebot-pricing.test.ts - FOUND
- [x] tests/unit/test-angebot-versioning.test.ts - FOUND
- [x] tests/unit/test-angebot-annehmen.test.ts - FOUND
- [x] tests/unit/test-angebot-annehmen.test.ts - FOUND
- [x] tests/unit/test-angebot-agb.test.ts - FOUND
- [x] tests/unit/test-angebot-webhook-expiry.test.ts - FOUND
- [x] Commit f557033 - FOUND

---
*Phase: 28-angebots-workflow*
*Completed: 2026-04-01*
