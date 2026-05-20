---
phase: 18-statuses-transitions-collection-felder
plan: 02
subsystem: api
tags: [status-transitions, n8n-webhook, typescript, state-machine]

# Dependency graph
requires:
  - phase: 17-status-config-centralization
    provides: "status-config.ts flat maps pattern, status-transitions.ts with 7-status map"
provides:
  - "20-status VALID_TRANSITIONS map with linear main flow + 8 branch paths"
  - "5-entry COMMENT_REQUIRED (excluding storniert which uses stornierung_grund)"
  - "WebhookPayload interface with customer_facing, kunden_text, kunden_phase fields"
affects: [18-03-anfragen-collection-hooks, 19-admin-status-ui, 20-kunden-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: ["20-status state machine with terminal storniert status", "WebhookPayload enrichment for N8N email filtering"]

key-files:
  created: []
  modified:
    - src/lib/status-transitions.ts
    - src/lib/n8n-webhook.ts
    - tests/unit/test-status-transitions.test.ts
    - tests/unit/test-n8n-webhook.test.ts

key-decisions:
  - "storniert excluded from COMMENT_REQUIRED -- uses dedicated stornierung_grund field instead of generic _status_kommentar"
  - "angebot_versendet can branch to rueckfrage (customer questions about offer)"

patterns-established:
  - "Terminal status pattern: storniert has empty transitions array, getNextStatuses returns []"
  - "WebhookPayload carries pre-computed customer data so N8N needs no reverse lookups"

requirements-completed: [STAT-04, FELD-03]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 18 Plan 02: Status Transitions + Webhook Payload Summary

**20-status transition map with linear main flow, 8 branch paths, terminal storniert, and enriched WebhookPayload with customer_facing/kunden_text/kunden_phase fields**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T08:58:02Z
- **Completed:** 2026-03-25T09:01:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended VALID_TRANSITIONS from 7 to 20 statuses covering full order lifecycle (neu through abgeschlossen) with production chain and branch paths
- Expanded COMMENT_REQUIRED from 2 to 5 entries (hersteller_problem, reklamation, wieder_geoeffnet added; storniert deliberately excluded)
- Added customer_facing, kunden_text, kunden_phase to WebhookPayload interface for N8N email automation
- 67 tests passing green (48 status-transitions + 9 webhook + 10 structural)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update tests for status-transitions and n8n-webhook (TDD RED)** - `f3d7163` (test)
2. **Task 2: Extend status-transitions.ts and n8n-webhook.ts (GREEN)** - `2db1062` (feat)

## Files Created/Modified
- `src/lib/status-transitions.ts` - 20-status VALID_TRANSITIONS map + 5-entry COMMENT_REQUIRED
- `src/lib/n8n-webhook.ts` - WebhookPayload interface extended with customer_facing, kunden_text, kunden_phase
- `tests/unit/test-status-transitions.test.ts` - Full test suite for 20 statuses, all transitions, terminal storniert, removed old transitions
- `tests/unit/test-n8n-webhook.test.ts` - Extended with customer_facing field tests and null kunden_phase handling

## Decisions Made
- storniert excluded from COMMENT_REQUIRED array -- per CONTEXT.md decision, stornierung_grund field serves as the comment for storniert transitions, avoiding dual input fields
- angebot_versendet allows branching to rueckfrage (customer may have questions after receiving the offer)
- isValidTransition and getNextStatuses functions kept unchanged -- they work generically with the Record type

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- status-transitions.ts ready for import by anfragen.ts beforeChange hook (Plan 03)
- WebhookPayload interface ready for enriched payload construction in anfragen.ts afterChange hook (Plan 03)
- COMMENT_REQUIRED ready for hook validation with storniert special-case handling

## Self-Check: PASSED

All 4 modified files exist on disk. Both task commits (f3d7163, 2db1062) verified in git log.

---
*Phase: 18-statuses-transitions-collection-felder*
*Completed: 2026-03-25*
