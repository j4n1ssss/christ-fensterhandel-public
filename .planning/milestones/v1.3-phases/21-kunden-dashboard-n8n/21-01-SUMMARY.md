---
phase: 21-kunden-dashboard-n8n
plan: 01
subsystem: ui
tags: [react, tailwind, progress-stepper, status-banner, customer-dashboard, accessibility]

# Dependency graph
requires:
  - phase: 18-status-lifecycle
    provides: STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, CustomerPhase type in status-config.ts
provides:
  - ProgressStepper component (5-phase visual stepper with completed/active/upcoming states)
  - ProgressStepperMini component (compact dots-only variant for list cards)
  - StatusBanner component (error/warning banners for special/terminal statuses)
  - pulse-slow CSS animation keyframe in globals.css
affects: [21-02-PLAN, kunden-dashboard, anfrage-detail, anfragen-liste]

# Tech tracking
tech-stack:
  added: []
  patterns: [customer-phase-stepper-pattern, status-banner-variant-pattern]

key-files:
  created:
    - src/components/kunden/progress-stepper.tsx
    - src/components/kunden/status-banner.tsx
    - tests/unit/test-progress-stepper.test.tsx
    - tests/unit/test-status-banner.test.tsx
  modified:
    - src/app/globals.css

key-decisions:
  - "ProgressStepper uses contents class for flat DOM structure with connecting lines between steps"
  - "StatusBanner role assignment: alert for terminal (storniert/abgelehnt), status for all others"
  - "Mini variant uses aria-label on container instead of individual dot labels (decorative dots)"

patterns-established:
  - "Customer phase stepper: 5-phase dot+line visual with emerald-500/primary/gray-300 color scheme"
  - "Status banner variant: error (red-50) vs warning (orange-50) with conditional text append"

requirements-completed: [KUND-02, STAT-05]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 21 Plan 01: ProgressStepper + StatusBanner Components Summary

**Two tested presentational components (ProgressStepper with 5-phase visual stepper and StatusBanner with error/warning variants) consuming status-config.ts data, plus pulse-slow CSS animation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T11:00:06Z
- **Completed:** 2026-03-26T11:03:17Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- ProgressStepper renders 5-phase horizontal stepper with completed (emerald), active (primary+pulse), and upcoming (gray) visual states
- ProgressStepperMini renders compact 8px dots-only variant for list cards with aria-label on container
- StatusBanner renders error (red) banners for storniert/abgelehnt/zahlungsproblem and warning (orange) for rueckfrage/hersteller_problem/reklamation
- All text sourced from STATUS_CUSTOMER_TEXT -- no hardcoded customer text
- 21 unit tests passing (10 ProgressStepper, 2 ProgressStepperMini, 10 StatusBanner) -- actually 11+10=21 total
- pulse-slow CSS animation (2s ease-in-out infinite) added to globals.css

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ProgressStepper and ProgressStepperMini + pulse animation CSS** - `2fa9020` (feat)
2. **Task 2: Create StatusBanner component** - `13f3b81` (feat)
3. **Task 3: Write unit tests for ProgressStepper and StatusBanner** - `6867e64` (test)

## Files Created/Modified
- `src/components/kunden/progress-stepper.tsx` - ProgressStepper (full 5-phase stepper) and ProgressStepperMini (compact dots) client components
- `src/components/kunden/status-banner.tsx` - StatusBanner server component for special/terminal status banners
- `src/app/globals.css` - pulse-slow keyframe animation and utility class
- `tests/unit/test-progress-stepper.test.tsx` - 11 tests for ProgressStepper and ProgressStepperMini
- `tests/unit/test-status-banner.test.tsx` - 10 tests for StatusBanner variants and null returns

## Decisions Made
- ProgressStepper uses CSS `contents` class on wrapper fragments for flat DOM structure enabling connecting lines between step columns
- StatusBanner role is `alert` only for terminal statuses (storniert, abgelehnt), `status` for all non-terminal special statuses including zahlungsproblem
- Mini variant dots are `aria-hidden="true"` with descriptive `aria-label` on container only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both components are ready for integration into AnfrageDetail and AnfragenListe in Plan 02
- ProgressStepper accepts `CustomerPhase | null` and auto-hides for terminal statuses
- StatusBanner accepts raw `status: string` and determines variant internally
- No breaking changes to existing components

## Self-Check: PASSED

All 5 files verified present. All 3 task commits verified in git log.

---
*Phase: 21-kunden-dashboard-n8n*
*Completed: 2026-03-26*
