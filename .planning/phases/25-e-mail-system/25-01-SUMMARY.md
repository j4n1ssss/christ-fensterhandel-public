---
phase: 25-e-mail-system
plan: 01
subsystem: email
tags: [typescript, payload-cms, event-matrix, email-queue, templates]

# Dependency graph
requires:
  - phase: 24-foundation
    provides: Settings Global with email fields, getSettings() helper, status-config.ts pattern
provides:
  - EmailEventType union (20 members) and EventConfig interface
  - EVENT_MATRIX mapping all 20 events to empfaenger/templates/betreff
  - renderSubject helper for subject template placeholders
  - email_queue Payload Collection with idempotency, retry, status lifecycle
  - Settings benachrichtigungs_emails and email_event_toggles fields
  - QueueEntry, EmailEventPayload, QueueStatus, Recipient types
affects: [25-02-templates, 25-03-queue-worker, 25-04-preview-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [event-matrix-config-pattern, email-type-system, queue-collection-pattern]

key-files:
  created:
    - src/lib/email/types.ts
    - src/lib/email/event-matrix.ts
    - src/lib/email/render-subject.ts
    - src/collections/system/email-queue.ts
    - tests/unit/test-event-matrix.test.ts
    - tests/unit/test-render-subject.test.ts
  modified:
    - src/payload-globals/settings.ts
    - src/payload.config.ts
    - .env.example

key-decisions:
  - "Event-Matrix follows status-config.ts TypeScript config pattern (Record<EmailEventType, EventConfig>)"
  - "All 20 events default enabled_default: true -- Admin disables via event toggles in Settings"
  - "email_queue create access returns true (server-side queuing has no user context)"

patterns-established:
  - "Email event configuration: EVENT_MATRIX as typed Record mapping events to recipients/templates/subjects"
  - "Subject templates: #{variable} placeholder syntax with renderSubject() helper"
  - "Queue Collection: email_queue with idempotency_key unique constraint and 6-state lifecycle"

requirements-completed: [MAIL-01, MAIL-05, MAIL-07, MAIL-08]

# Metrics
duration: 4min
completed: 2026-03-29
---

# Phase 25 Plan 01: Email Foundation Summary

**Email type system with 20-event matrix, email_queue Collection with idempotency and retry fields, and Settings notification configuration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-29T18:31:00Z
- **Completed:** 2026-03-29T18:35:13Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- EmailEventType union with 20 members (18 business status events + 2 future/utility slots) mapped in EVENT_MATRIX
- email_queue Payload Collection with unique idempotency_key, 6-state status lifecycle, exponential backoff retry fields
- Settings Global extended with benachrichtigungs_emails (staff distribution list) and email_event_toggles (per-event on/off)
- renderSubject helper replacing #{variable} placeholders in email subject templates
- 34 unit tests covering all event types and subject rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create email type system, event-matrix, and render-subject helper (TDD)**
   - `bd721df` (test) -- RED: failing tests for event-matrix and render-subject
   - `3f0158e` (feat) -- GREEN: implementation passing all 34 tests
2. **Task 2: Create email_queue Collection, extend Settings Global, register in Payload config** - `e70e9d9` (feat)

## Files Created/Modified
- `src/lib/email/types.ts` - EmailEventType, EmailEventPayload, EventConfig, QueueEntry, QueueStatus, Recipient types
- `src/lib/email/event-matrix.ts` - EVENT_MATRIX with 20 event configs, getEventConfig() helper
- `src/lib/email/render-subject.ts` - renderSubject() with #{variable} replacement
- `src/collections/system/email-queue.ts` - email_queue Collection (idempotency_key unique, status select, retry fields)
- `src/payload-globals/settings.ts` - Added benachrichtigungs_emails (textarea) and email_event_toggles (json) fields
- `src/payload.config.ts` - EmailQueue imported and registered in collections array
- `.env.example` - N8N_EMAIL_WEBHOOK_URL documented
- `tests/unit/test-event-matrix.test.ts` - 28 tests for EVENT_MATRIX completeness and correctness
- `tests/unit/test-render-subject.test.ts` - 6 tests for renderSubject placeholder replacement

## Decisions Made
- Event-Matrix follows the status-config.ts TypeScript config pattern (Record<EmailEventType, EventConfig>) as specified in CONTEXT.md
- All 20 events have enabled_default: true -- Admin can disable specific events via the email_event_toggles JSON field in Settings
- email_queue create access returns true because server-side queuing (afterChange hooks) runs without user context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required. N8N_EMAIL_WEBHOOK_URL is documented in .env.example but will be configured when the queue worker is built in Plan 03.

## Next Phase Readiness
- Type contracts and event-matrix ready for Plan 02 (React Email template rendering)
- email_queue Collection ready for Plan 03 (queue worker with exponential backoff)
- Settings fields ready for Plan 04 (admin UI with event toggles)

## Self-Check: PASSED

All 6 created files verified on disk. All 3 task commits (bd721df, 3f0158e, e70e9d9) verified in git log.

---
*Phase: 25-e-mail-system*
*Completed: 2026-03-29*
