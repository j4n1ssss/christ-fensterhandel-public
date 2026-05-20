---
phase: 21-kunden-dashboard-n8n
plan: 02
subsystem: ui
tags: [react, tailwind, progress-stepper, status-banner, customer-dashboard, timeline, n8n, webhook, documentation]

# Dependency graph
requires:
  - phase: 21-kunden-dashboard-n8n
    plan: 01
    provides: ProgressStepper, ProgressStepperMini, StatusBanner components, pulse-slow CSS animation
  - phase: 18-statuses-transitions-collection-felder
    provides: STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, CustomerPhase type, isCustomerFacing(), WebhookPayload
provides:
  - AnfrageDetail with ProgressStepper integration (5-phase visual stepper) and StatusBanner for special/terminal statuses
  - AnfragenListe with ProgressStepperMini replacing StatusBadge
  - StatusTimeline with customer-facing text from STATUS_CUSTOMER_TEXT (no internal labels)
  - N8N workflow documentation with payload spec and recommended workflow structure
  - 8 unit tests for timeline customer text rendering
affects: [kunden-dashboard, gast-tracking-form]

# Tech tracking
tech-stack:
  added: []
  patterns: [customer-text-over-internal-labels, progress-stepper-integration, terminal-status-text-fallback]

key-files:
  created:
    - tests/unit/test-kunden-timeline.test.tsx
    - docs/research/024_2026-03-26_n8n-workflow-dokumentation.md
  modified:
    - src/components/kunden/anfrage-detail.tsx
    - src/components/kunden/anfragen-liste.tsx
    - src/components/kunden/status-timeline.tsx

key-decisions:
  - "Terminal statuses in list view show text label (Storniert/Abgelehnt) instead of mini stepper since there is no phase to display"
  - "StatusBadge export retained in status-timeline.tsx for backward compatibility but now shows customer text"
  - "gast-tracking-form.tsx left out of scope -- still uses getStatusLabel (deferred item)"

patterns-established:
  - "Customer-text-first: All kunden-facing views use STATUS_CUSTOMER_TEXT with ?? fallback, never getStatusLabel"
  - "Terminal status fallback: null phase triggers text label instead of stepper component"

requirements-completed: [KUND-01, KUND-02, N8N-01, STAT-05]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 21 Plan 02: Dashboard Integration + N8N Documentation Summary

**ProgressStepper and StatusBanner integrated into all 3 kunden components, internal labels replaced with STATUS_CUSTOMER_TEXT, N8N webhook verified and documented with full payload spec**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T11:06:11Z
- **Completed:** 2026-03-26T11:11:59Z
- **Tasks:** 3 (automated) + 1 (checkpoint pending)
- **Files modified:** 5

## Accomplishments
- AnfrageDetail now shows ProgressStepper for normal statuses and StatusBanner for special/terminal statuses, with customer text hint below
- AnfragenListe replaced StatusBadge with ProgressStepperMini (compact dots), with text fallback for terminal statuses
- StatusTimeline replaced all getStatusLabel() calls with STATUS_CUSTOMER_TEXT lookups -- no internal status key visible to customers
- N8N webhook afterChange hook verified: customer_facing, kunden_text, kunden_phase correctly populated for all 20 statuses
- N8N workflow documentation created with complete payload spec, recommended 4-step workflow, all 14 trigger statuses, and env vars
- 8 new unit tests for timeline customer text, empty state, unknown status fallback, and StatusBadge customer text

## Task Commits

Each task was committed atomically:

1. **Task 1: Integrate ProgressStepper and StatusBanner into AnfrageDetail** - `336008b` (feat)
2. **Task 2: Replace StatusBadge with ProgressStepperMini in list + customer text in timeline + tests** - `fc8b110` (feat)
3. **Task 3: Verify N8N webhook wiring + create workflow documentation** - `6f6e217` (docs)

## Files Created/Modified
- `src/components/kunden/anfrage-detail.tsx` - Integrated ProgressStepper, StatusBanner, customer text; removed StatusBadge and hardcoded rueckfrage block
- `src/components/kunden/anfragen-liste.tsx` - Replaced StatusBadge import/usage with ProgressStepperMini; added terminal status text fallback
- `src/components/kunden/status-timeline.tsx` - Replaced getStatusLabel with STATUS_CUSTOMER_TEXT lookups in badge, transition text, and StatusBadge export
- `tests/unit/test-kunden-timeline.test.tsx` - 8 tests covering customer text rendering, internal label exclusion, empty state, unknown status fallback, kommentar
- `docs/research/024_2026-03-26_n8n-workflow-dokumentation.md` - Full N8N workflow documentation with payload spec, workflow steps, trigger statuses, env vars

## Decisions Made
- Terminal statuses (storniert/abgelehnt) in the list view show a red text label instead of ProgressStepperMini, since currentPhase is null and there is no progress to display
- StatusBadge export retained in status-timeline.tsx but updated to use customer text -- maintains backward compatibility for any remaining consumers
- gast-tracking-form.tsx was intentionally left out of scope -- it still uses getStatusLabel and is a separate feature (guest tracking without login)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed timeline transition test using getByText with multiple matches**
- **Found during:** Task 2 (timeline test)
- **Issue:** Test used getByText with includes matcher which found multiple elements (badge and transition both contain the status text)
- **Fix:** Changed to match specifically on `<p>` tag containing both von and zu customer texts
- **Files modified:** tests/unit/test-kunden-timeline.test.tsx
- **Verification:** All 8 tests pass
- **Committed in:** fc8b110 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test adjustment, no scope creep.

## Deferred Items
- `src/components/kunden/gast-tracking-form.tsx` still uses `getStatusLabel()` -- should be updated to use STATUS_CUSTOMER_TEXT in a future plan

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All kunden dashboard components are upgraded with progress stepper and customer-facing text
- Checkpoint pending: visual verification by user (Task 4)
- Phase 21 is complete after visual checkpoint approval
- No blockers for future phases

---
*Phase: 21-kunden-dashboard-n8n*
*Completed: 2026-03-26*
