---
phase: 15-core-navigation
plan: 01
subsystem: ui
tags: [shadcn, radix, tailwind, jest, testing-library, webhook-badge, client-component]

# Dependency graph
requires:
  - phase: none
    provides: none (first plan in v1.2 milestone)
provides:
  - Shadcn Collapsible, Badge, Button components installed and importable
  - WebhookFehlerBadge refactored to client component with useEffect + fetch
  - Test scaffolds for custom nav (9 describe blocks) and config registration
  - Jest config fixed for JSX transform in test files
affects: [15-02-PLAN, custom-nav implementation, payload.config.ts modification]

# Tech tracking
tech-stack:
  added: ["@radix-ui/react-collapsible", "shadcn/ui (collapsible, badge, button)"]
  patterns: ["Client-side polling with useEffect + setInterval", "Shadcn Badge destructive variant for error counts", "tsconfig.jest.json for JSX transform override"]

key-files:
  created:
    - src/components/ui/collapsible.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/button.tsx
    - tests/unit/test-webhook-badge.test.tsx
    - tests/unit/test-custom-nav.test.tsx
    - tests/unit/test-nav-config.test.ts
    - tsconfig.jest.json
  modified:
    - src/components/admin/webhook-fehler-badge.tsx
    - jest.config.ts
    - package.json
    - package-lock.json

key-decisions:
  - "tsconfig.jest.json created to override jsx: preserve to react-jsx for Jest transform"
  - "Nav config test uses double-quote string matching to match linter-enforced format"
  - "Produktverwaltung test covers 17 collections (plan said 16, Zusatzlichter was missing)"

patterns-established:
  - "Jest test files import @testing-library/jest-dom directly for DOM matchers"
  - "WebhookFehlerBadge client pattern: useEffect + fetch + 60s setInterval polling"

requirements-completed: [INT-01, INT-02]

# Metrics
duration: 9min
completed: 2026-03-23
---

# Phase 15 Plan 01: Foundation Summary

**Shadcn UI components (Collapsible, Badge, Button) installed, WebhookFehlerBadge refactored from server to client component with useEffect+fetch+polling, and 3 test files scaffolded covering all 11 requirement IDs**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-23T15:22:47Z
- **Completed:** 2026-03-23T15:32:01Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Installed Shadcn Collapsible, Badge, and Button via CLI with @radix-ui/react-collapsible dependency
- Refactored WebhookFehlerBadge from server component (getPayload) to client component (useEffect + fetch) with 60s polling and Shadcn Badge destructive variant
- Created comprehensive test scaffolds: 7 passing WebhookFehlerBadge tests, 9 describe blocks for custom nav (RED until Plan 02), 4 config registration tests (2 RED until Plan 02)
- Fixed Jest JSX transform issue by creating tsconfig.jest.json with react-jsx override

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Shadcn UI components** - `89d41d4` (chore)
2. **Task 2: Refactor WebhookFehlerBadge (TDD RED)** - `1a64825` (test)
3. **Task 2: Refactor WebhookFehlerBadge (TDD GREEN)** - `b3aab3f` (feat)
4. **Task 3: Create test infrastructure** - `9964032` (test)

## Files Created/Modified
- `src/components/ui/collapsible.tsx` - Shadcn Collapsible (wraps @radix-ui/react-collapsible)
- `src/components/ui/badge.tsx` - Shadcn Badge with destructive variant
- `src/components/ui/button.tsx` - Shadcn Button with ghost variant
- `src/components/admin/webhook-fehler-badge.tsx` - Refactored to 'use client' with useEffect + fetch
- `tests/unit/test-webhook-badge.test.tsx` - 7 tests for badge (all green)
- `tests/unit/test-custom-nav.test.tsx` - 9 describe blocks for custom nav (RED until Plan 02)
- `tests/unit/test-nav-config.test.ts` - 4 tests for config registration (2 RED until Plan 02)
- `jest.config.ts` - Updated to use tsconfig.jest.json
- `tsconfig.jest.json` - JSX transform override for Jest
- `package.json` / `package-lock.json` - @radix-ui/react-collapsible added

## Decisions Made
- Created `tsconfig.jest.json` extending `tsconfig.json` with `jsx: react-jsx` to fix JSX transform in Jest (the project uses `jsx: preserve` for Next.js, which breaks JSX in jest.mock factories)
- Updated nav config test assertions to use double-quote string matching since the project linter enforces double quotes in `.ts` files
- Fixed Produktverwaltung test to cover 17 collections (plan said 16 but CONTEXT.md lists 17 including Zusatzlichter under KONFIGURATION)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Jest JSX transform failure with jsx: preserve**
- **Found during:** Task 2 (TDD RED phase)
- **Issue:** `jest.mock` factory function using JSX was not being transformed because tsconfig has `jsx: preserve` (for Next.js). Jest's ts-jest passed JSX through untransformed, causing SyntaxError.
- **Fix:** Created `tsconfig.jest.json` extending tsconfig.json with `compilerOptions: { jsx: "react-jsx" }`, updated jest.config.ts to reference it.
- **Files modified:** jest.config.ts, tsconfig.jest.json (new)
- **Verification:** All 7 webhook badge tests pass
- **Committed in:** 1a64825 (part of TDD RED commit)

**2. [Rule 1 - Bug] Produktverwaltung test missing Zusatzlichter collection**
- **Found during:** Task 3 (test scaffolds)
- **Issue:** Plan specified "all 16 collection links" but CONTEXT.md lists 17 collections under Produktverwaltung (Zusatzlichter under KONFIGURATION was missing from the plan's list)
- **Fix:** Added "Zusatzlichter" to the expected labels array, updated test name to "renders all 17 collection links"
- **Files modified:** tests/unit/test-custom-nav.test.tsx
- **Verification:** Test scaffold includes all 17 labels matching CONTEXT.md
- **Committed in:** 9964032 (part of Task 3 commit)

**3. [Rule 1 - Bug] Nav config test quote mismatch**
- **Found during:** Task 3 (test scaffolds)
- **Issue:** Plan specified single-quote string assertions (`Nav: '@/components/admin/custom-nav#default'`) but the project linter enforces double quotes, so payload.config.ts uses double-quote strings
- **Fix:** Updated test assertions to match double-quote format
- **Files modified:** tests/unit/test-nav-config.test.ts
- **Verification:** Graphics and providers tests pass against actual config
- **Committed in:** 9964032 (part of Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Shadcn components ready for Plan 02 to build custom-nav.tsx
- WebhookFehlerBadge client component ready for embedding in custom nav
- Test scaffolds ready to go GREEN as Plan 02 implements custom-nav.tsx and modifies payload.config.ts
- Jest infrastructure working correctly with JSX transform

## Self-Check: PASSED

All 8 created/modified files verified on disk. All 4 commit hashes found in git log. SUMMARY.md exists at expected path.

---
*Phase: 15-core-navigation*
*Completed: 2026-03-23*
