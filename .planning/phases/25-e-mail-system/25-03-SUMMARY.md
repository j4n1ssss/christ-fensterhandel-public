---
phase: 25-e-mail-system
plan: 03
subsystem: email
tags: [email-queue, exponential-backoff, instrumentation, webhook-migration, retry]

# Dependency graph
requires:
  - phase: 25-e-mail-system-01
    provides: EmailEventType, EventConfig, EVENT_MATRIX, email_queue Collection, Settings toggles
  - phase: 25-e-mail-system-02
    provides: renderEmailForEvent orchestrator, TEMPLATE_SLUGS, React Email templates
provides:
  - queueEmailEvent function (creates queue entries with rendered HTML per recipient)
  - processQueue function (processes pending/failed entries via N8N with exponential backoff)
  - cleanupSentEvents function (removes sent entries older than retention period)
  - instrumentation.ts queue worker (60s processing, 1h cleanup intervals)
  - EmailQueueRetryButton component for dead queue entry re-queuing
  - Migrated anfragen afterChange hook (queueEmailEvent instead of sendN8NWebhook)
affects: [25-04-preview-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [queue-engine-pattern, instrumentation-worker-pattern, exponential-backoff-retry]

key-files:
  created:
    - src/lib/email/queue.ts
    - src/instrumentation.ts
    - src/components/admin/email-queue-retry.tsx
    - tests/unit/test-email-queue.test.ts
  modified:
    - src/collections/business/anfragen.ts
    - src/payload.config.ts
    - src/components/admin/custom-nav.tsx
  deleted:
    - src/lib/n8n-webhook.ts
    - src/payload-globals/webhook-errors.ts
    - src/components/admin/webhook-fehler-badge.tsx
    - tests/unit/test-n8n-webhook.test.ts
    - tests/unit/test-webhook-badge.test.tsx

key-decisions:
  - "Dynamic Payload imports inside function body to avoid initialization issues in hooks and workers"
  - "Exponential backoff: Math.pow(2, attempts-1) * 60_000 ms (1,2,4,8 min), dead after 5 attempts"
  - "Queue entries use 'as never' type assertions on collection slug until payload-types.ts is regenerated"

patterns-established:
  - "Queue engine: queueEmailEvent renders HTML at queue-time, processQueue delivers via N8N POST"
  - "Instrumentation worker: setInterval in register() with workerStarted guard for HMR safety"
  - "Retry button: PATCH to Payload REST API to reset dead entries to pending"

requirements-completed: [MAIL-05, MAIL-07, MAIL-08]

# Metrics
duration: 7min
completed: 2026-03-29
---

# Phase 25 Plan 03: Queue Engine Summary

**Queue engine with queueEmailEvent/processQueue/cleanup, instrumentation.ts worker at 60s interval, migrated afterChange hook from webhook to queue, all old webhook code deleted**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-29T18:48:56Z
- **Completed:** 2026-03-29T18:56:16Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Queue engine with 3 exports: queueEmailEvent (renders HTML at queue-time, validates emails, respects toggles), processQueue (N8N POST with exponential backoff retry), cleanupSentEvents (30-day retention)
- instrumentation.ts queue worker starts on server boot with 60s processing interval and hourly cleanup
- anfragen afterChange hook fully migrated from sendN8NWebhook to queueEmailEvent with EmailEventPayload
- Complete old webhook system deletion: n8n-webhook.ts, webhook-errors.ts, WebhookFehlerBadge, and their tests
- Admin nav updated with E-Mail Queue and E-Mail Preview links; EmailQueueRetryButton for dead entries
- 10 passing unit tests covering queuing, toggle skip, email validation, backoff schedule, cleanup

## Task Commits

Each task was committed atomically:

1. **Task 1: Create queue engine (TDD)**
   - `c724962` (test) -- RED: failing tests for email queue engine
   - `8626256` (feat) -- GREEN: implement email queue engine with retry and backoff
2. **Task 2: Create instrumentation.ts worker, migrate afterChange hook, delete old webhook code** - `43c1109` (feat)
3. **Task 3: Update admin navigation and create retry button component** - `3dbe929` (feat)

## Files Created/Modified
- `src/lib/email/queue.ts` - Queue engine: queueEmailEvent, processQueue, cleanupSentEvents
- `src/instrumentation.ts` - Next.js instrumentation hook with 60s queue worker and hourly cleanup
- `src/components/admin/email-queue-retry.tsx` - Retry button for dead queue entries via Payload REST API
- `tests/unit/test-email-queue.test.ts` - 10 tests: queuing, toggles, validation, backoff, cleanup
- `src/collections/business/anfragen.ts` - afterChange hook migrated from sendN8NWebhook to queueEmailEvent
- `src/payload.config.ts` - WebhookErrors global removed from globals array
- `src/components/admin/custom-nav.tsx` - Nav updated: E-Mail Queue + Preview links, WebhookFehlerBadge removed
- `src/lib/n8n-webhook.ts` - DELETED (replaced by queue.ts)
- `src/payload-globals/webhook-errors.ts` - DELETED (replaced by email_queue Collection)
- `src/components/admin/webhook-fehler-badge.tsx` - DELETED (no longer needed)
- `tests/unit/test-n8n-webhook.test.ts` - DELETED (replaced by test-email-queue.test.ts)
- `tests/unit/test-webhook-badge.test.tsx` - DELETED (component deleted)

## Decisions Made
- Dynamic Payload imports (`await import('payload')`) used inside function bodies to avoid initialization order issues when queue functions are called from hooks or workers
- Exponential backoff formula: `Math.pow(2, attempts - 1) * 60_000` gives 1, 2, 4, 8 minute delays. After 5 failed attempts, entry becomes 'dead'
- Type assertions (`as never`) on collection slugs since payload-types.ts hasn't been regenerated to include email_queue yet

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused status-config imports from anfragen.ts**
- **Found during:** Task 2
- **Issue:** After removing sendN8NWebhook and WebhookPayload, the imports `isCustomerFacing`, `STATUS_CUSTOMER_TEXT`, `STATUS_CUSTOMER_PHASE`, and `StatusKey` from status-config were no longer used in the file
- **Fix:** Removed the unused import statement
- **Files modified:** `src/collections/business/anfragen.ts`
- **Committed in:** `43c1109`

**2. [Rule 1 - Bug] Deleted orphaned test files for removed modules**
- **Found during:** Task 3
- **Issue:** `tests/unit/test-n8n-webhook.test.ts` and `tests/unit/test-webhook-badge.test.tsx` would fail because their source modules were deleted
- **Fix:** Deleted both test files (test-n8n-webhook replaced by test-email-queue)
- **Files modified:** `tests/unit/test-n8n-webhook.test.ts`, `tests/unit/test-webhook-badge.test.tsx`
- **Committed in:** `3dbe929`

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both necessary cleanup. Plan already mentioned deleting test-n8n-webhook in Task 3 Step 3; test-webhook-badge deletion was additionally required.

## Issues Encountered
None.

## User Setup Required
None - N8N_EMAIL_WEBHOOK_URL is documented in .env.example from Plan 01. Queue worker starts automatically via instrumentation.ts.

## Next Phase Readiness
- Queue engine ready for Plan 04 (preview route test-send goes through queue with event_type='test_preview')
- All email infrastructure complete: types, templates, queue, worker
- Admin nav links ready for E-Mail Queue collection view and E-Mail Preview route

## Self-Check: PASSED

All created files verified. All 4 task commits verified in git log.

---
*Phase: 25-e-mail-system*
*Completed: 2026-03-29*
