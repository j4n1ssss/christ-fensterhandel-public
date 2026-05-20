---
phase: 29-kunden-self-service
plan: 01
subsystem: database
tags: [status-system, transitions, email-events, payload-cms, upload]

# Dependency graph
requires:
  - phase: 18-statuses-transitions-collection-felder
    provides: "22-status system with all maps and transition graph"
  - phase: 25-email-system
    provides: "Email event matrix and EmailEventType union"
provides:
  - "24-status configuration with kundenantwort + stornierung_beantragt in all 10+ maps"
  - "Extended transition graph with stornierung_beantragt reachable from 17 non-excluded statuses"
  - "StatusHistorie anhaenge upload field for file attachments"
  - "Shared upload-constants.ts module (MAX_FILE_SIZE, ALLOWED_FILE_TYPES)"
  - "stornierung_beantragt email event config with staff recipient"
  - "Comment requirement for stornierung_beantragt -> in_bearbeitung rejection"
affects: [29-kunden-self-service, admin-detail-view, kunden-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Source-specific comment requirement via beforeChange hook (not COMMENT_REQUIRED array)"]

key-files:
  created:
    - src/lib/upload-constants.ts
  modified:
    - src/lib/status-config.ts
    - src/lib/status-transitions.ts
    - src/lib/email/event-matrix.ts
    - src/lib/email/types.ts
    - src/collections/business/anfragen.ts
    - src/collections/business/status-historie.ts
    - tests/unit/test-status-config.test.ts
    - tests/unit/test-status-transitions.test.ts
    - tests/unit/test-event-matrix.test.ts

key-decisions:
  - "stornierung_beantragt -> in_bearbeitung comment check is source-specific in anfragen.ts beforeChange hook (not in COMMENT_REQUIRED array, which only checks target status)"
  - "geliefert and abgeschlossen excluded from stornierung_beantragt transitions (too late in lifecycle)"
  - "kundenantwort uses CustomerPhase 'Anfrage', stornierung_beantragt uses null (can come from any phase)"

patterns-established:
  - "Source-specific comment requirement: check both originalDoc.status AND data.status in beforeChange hook for transition-specific rules"

requirements-completed: [KUND-01, KUND-02]

# Metrics
duration: 10min
completed: 2026-04-02
---

# Phase 29 Plan 01: Status System Extension Summary

**Extended status system from 22 to 24 statuses (kundenantwort + stornierung_beantragt) across all 17 integration points with 220 passing tests**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-02T21:48:27Z
- **Completed:** 2026-04-02T21:59:25Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Added kundenantwort + stornierung_beantragt to StatusKey type and all 10 status maps (colors, labels, tailwind, customer text, customer phase, group, email triggers, quick actions, weight, tab filters)
- Extended transition graph: stornierung_beantragt reachable from 17 non-excluded statuses, kundenantwort bidirectional with rueckfrage/in_bearbeitung
- Added anhaenge upload field to StatusHistorie collection and created shared upload-constants.ts module
- Updated all 3 test suites (220 tests passing) with new count assertions and explicit transition/event tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend status system with kundenantwort + stornierung_beantragt (all 17 integration points)** - `914dcf7` (feat)
2. **Task 2: Update existing tests to expect 24 statuses and new transitions** - `333477e` (test)

## Files Created/Modified
- `src/lib/status-config.ts` - Added kundenantwort + stornierung_beantragt to StatusKey type and all 10 maps (24 total statuses)
- `src/lib/status-transitions.ts` - Extended transition graph with both new statuses, stornierung_beantragt from 17 sources
- `src/lib/email/event-matrix.ts` - Added stornierung_beantragt event config with staff recipient
- `src/lib/email/types.ts` - Added stornierung_beantragt to EmailEventType union (now 23 types)
- `src/collections/business/anfragen.ts` - Added status select options + stornierung_beantragt -> in_bearbeitung comment requirement
- `src/collections/business/status-historie.ts` - Added anhaenge upload field (hasMany, relationTo media)
- `src/lib/upload-constants.ts` - New file: MAX_FILE_SIZE, ALLOWED_FILE_TYPES, MAX_RUECKFRAGE_FILES, MAX_REKLAMATION_FILES
- `tests/unit/test-status-config.test.ts` - Updated counts to 24, added explicit kundenantwort/stornierung_beantragt tests
- `tests/unit/test-status-transitions.test.ts` - Updated counts to 24, added 11 new transition tests
- `tests/unit/test-event-matrix.test.ts` - Updated counts to 23, added stornierung_beantragt config test

## Decisions Made
- stornierung_beantragt -> in_bearbeitung comment requirement implemented as source-specific check in anfragen.ts beforeChange hook rather than adding to COMMENT_REQUIRED array (which only checks target status and would break other -> in_bearbeitung transitions)
- geliefert and abgeschlossen excluded from stornierung_beantragt transitions (too late in lifecycle for cancellation request)
- kundenantwort mapped to CustomerPhase "Anfrage" (per CONTEXT.md), stornierung_beantragt mapped to null (can originate from any phase)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Status system foundation complete for all Phase 29 downstream plans
- Plan 02 (Rueckfrage-Antwort API + UI) can now use kundenantwort status and anhaenge field
- Plan 03 (Stornierung-Anfrage) can now use stornierung_beantragt status and transitions
- Plan 04 (Reklamation) can now use upload-constants.ts for file validation
- All maps are exhaustive (Record<StatusKey, ...>) so TypeScript will enforce completeness

## Self-Check: PASSED

All 11 files verified present. Both task commits (914dcf7, 333477e) verified in git log.

---
*Phase: 29-kunden-self-service*
*Completed: 2026-04-02*
