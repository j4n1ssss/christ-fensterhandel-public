---
phase: 17-status-config-centralization
plan: 01
subsystem: api
tags: [typescript, status-management, centralization, refactoring]

# Dependency graph
requires: []
provides:
  - "Single Source of Truth status-config.ts with all 13 exports (3 types, 7 constants, 3 helpers)"
  - "StatusKey union type for type-safe status access"
  - "Dual-format color exports: hex (STATUS_COLORS) for admin, Tailwind (STATUS_TAILWIND) for kunden"
  - "Customer-facing text, phase mapping, status groups, email trigger list"
affects: [17-02, 18-new-statuses, 19-kunden-dashboard, 20-filter-tabs, 21-email-triggers]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Dual-format color exports (hex + Tailwind) from shared module", "StatusKey union type with Record<StatusKey, T> for exhaustive mapping", "Helper functions with string input and graceful fallback"]

key-files:
  created:
    - src/lib/status-config.ts
    - tests/unit/test-status-config.test.ts
  modified: []

key-decisions:
  - "Separate flat maps (STATUS_COLORS, STATUS_LABELS, etc.) over single nested config object for simpler consumer imports"
  - "Helper functions accept string (not StatusKey) for safe access from database values"
  - "Em-dash (U+2014) in bestaetigt customer text, real UTF-8 umlauts everywhere"

patterns-established:
  - "Status metadata module pattern: pure data, no client directive, no framework imports"
  - "Fallback pattern: getStatusColor returns gray (#6b7280), getStatusLabel returns raw key"

requirements-completed: [STAT-01]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 17 Plan 01: Status-Config Centralization Summary

**Pure TypeScript status-config.ts module with 13 named exports covering 7 statuses: hex colors, German labels, Tailwind classes, customer texts, phase mapping, status groups, email triggers, and 3 helper functions with fallback behavior**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T20:04:35Z
- **Completed:** 2026-03-24T20:07:50Z
- **Tasks:** 1
- **Files created:** 2

## Accomplishments
- Created src/lib/status-config.ts as Single Source of Truth for all status metadata
- Exported 3 types (StatusKey, StatusGroup, CustomerPhase), 7 constants, 3 helper functions
- Full TDD: 43 unit tests covering every export, every status key, and fallback behavior
- Real UTF-8 umlauts, em-dash in customer text, null phase for abgelehnt

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing tests for status-config** - `2479cad` (test)
2. **Task 1 (GREEN): Implement status-config.ts** - `460af8d` (feat)

_TDD task with RED/GREEN commits._

## Files Created/Modified
- `src/lib/status-config.ts` - Single Source of Truth for all status metadata (13 exports)
- `tests/unit/test-status-config.test.ts` - 43 unit tests for all exports and helpers

## Decisions Made
- Used separate flat Record maps over a single nested config object -- simpler consumer imports, each component imports only what it needs
- Helper functions accept `string` (not `StatusKey`) for safe access from database values with graceful fallbacks
- Used em-dash (U+2014) for bestaetigt customer text as specified in plan
- Real UTF-8 umlauts throughout (not ASCII substitutes)

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
- Jest `--testPathPattern` flag renamed to `--testPathPatterns` in current version -- adapted command accordingly
- Minor: removed literal 'use client' string from JSDoc comment to keep grep verification clean

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- status-config.ts ready for Plan 02 to migrate all 6 consumer components
- All exports match existing component usage patterns (hex for admin, Tailwind objects for kunden)
- Helper functions provide drop-in replacement for inline fallback patterns

## Self-Check: PASSED

All files exist, all commits verified:
- src/lib/status-config.ts: FOUND
- tests/unit/test-status-config.test.ts: FOUND
- 17-01-SUMMARY.md: FOUND
- Commit 2479cad (RED): FOUND
- Commit 460af8d (GREEN): FOUND

---
*Phase: 17-status-config-centralization*
*Completed: 2026-03-24*
