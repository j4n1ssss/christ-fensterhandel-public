---
phase: 05-externe-integrationen
plan: 02
subsystem: automation
tags: [n8n, webhooks, docker, email-automation, stripe-checkout]

requires:
  - phase: 05-externe-integrationen/01
    provides: "Stripe createCheckoutSession function for bestaetigt status"
  - phase: 01-fundament
    provides: "Anfragen collection with afterChange hook placeholder"
provides:
  - "sendN8NWebhook utility with typed WebhookPayload and x-webhook-secret auth"
  - "afterChange hook on Anfragen for neue_anfrage and status_aenderung events"
  - "Stripe Checkout URL generation on bestaetigt status included in webhook payload"
  - "WebhookErrors Payload Global for error tracking (last 50 errors)"
  - "WebhookFehlerBadge admin component showing recent errors"
  - "N8N Docker Compose for local development"
affects: [06-website-und-compliance, 07-deployment]

tech-stack:
  added: [n8n, docker-compose]
  patterns: [non-blocking-webhooks, error-tracking-global, admin-rsc-badge]

key-files:
  created:
    - src/lib/n8n-webhook.ts
    - src/payload-globals/webhook-errors.ts
    - src/components/admin/webhook-fehler-badge.tsx
    - docker-compose.n8n.yml
    - tests/unit/test-n8n-webhook.test.ts
  modified:
    - src/collections/business/anfragen.ts
    - src/payload.config.ts
    - .env.example

key-decisions:
  - "Non-blocking webhooks: all sendN8NWebhook calls wrapped in try/catch, errors logged but never thrown"
  - "WebhookErrors Global uses JSON field for flexible error array (not separate collection)"
  - "Admin badge is RSC using afterNavLinks slot for sidebar visibility"
  - "Payload Local API uses 'any' cast for webhook_errors slug until types regenerated"

patterns-established:
  - "Non-blocking external calls: try/catch wrapper pattern for all webhook/API calls in hooks"
  - "Error tracking Global: JSON array field with last-N retention for operational monitoring"
  - "Admin RSC badge: Server Component in afterNavLinks for real-time status display"

requirements-completed: [N8N-01, N8N-02, N8N-03, N8N-04, N8N-05]

duration: 4min
completed: 2026-03-10
---

# Phase 5 Plan 02: N8N Webhook Integration Summary

**N8N webhook sender with typed payloads, afterChange hook for neue_anfrage/status_aenderung events, Stripe Checkout URL on bestaetigt, error tracking Global, and Docker setup**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-10T09:30:14Z
- **Completed:** 2026-03-10T09:34:21Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- sendN8NWebhook utility sends typed payloads with x-webhook-secret header authentication
- afterChange hook fires neue_anfrage on create, status_aenderung on status change with old/new status
- bestaetigt status generates Stripe Checkout Session URL and includes it in webhook payload
- WebhookErrors Global tracks last 50 errors, visible in admin sidebar via red badge
- N8N Docker Compose ready for local development (port 5678)
- 7 unit tests covering all webhook sender behaviors

## Task Commits

Each task was committed atomically:

1. **Task 0: Create Wave 0 test stubs** - `6df1fd3` (test)
2. **Task 1: N8N Webhook Utility + afterChange Hook + Fehler-Tracking** - `0b5855c` (feat)
3. **Task 2: N8N Docker Setup + Admin Fehler-Badge + Env Config** - `5568c53` (feat)

## Files Created/Modified
- `src/lib/n8n-webhook.ts` - Webhook sender utility with WebhookPayload interface and trackWebhookError
- `src/payload-globals/webhook-errors.ts` - Payload Global config for webhook error tracking
- `src/components/admin/webhook-fehler-badge.tsx` - RSC badge showing recent webhook errors in admin
- `docker-compose.n8n.yml` - N8N Docker setup for local development
- `tests/unit/test-n8n-webhook.test.ts` - 7 unit tests for webhook sender
- `src/collections/business/anfragen.ts` - afterChange hook with N8N webhook calls and Stripe Checkout
- `src/payload.config.ts` - WebhookErrors Global and afterNavLinks badge registered
- `.env.example` - N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET added

## Decisions Made
- Non-blocking webhooks: all sendN8NWebhook calls wrapped in try/catch, errors logged but never thrown to avoid blocking Payload operations
- WebhookErrors Global uses JSON field for flexible error array rather than a separate collection
- Admin badge is an RSC using afterNavLinks slot for sidebar visibility
- Payload Local API uses `any` cast for webhook_errors slug until payload-types.ts is regenerated with running DB

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript compilation error with Payload Global slug types**
- **Found during:** Task 1 (N8N Webhook Utility)
- **Issue:** Payload generated types don't include the new webhook_errors Global yet, causing TS2322 errors with `slug: 'webhook_errors'`
- **Fix:** Used `(payload as any)` cast for findGlobal/updateGlobal calls with eslint-disable comment explaining rationale
- **Files modified:** src/lib/n8n-webhook.ts
- **Verification:** TypeScript compiles cleanly, all tests pass
- **Committed in:** 0b5855c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary workaround until payload-types.ts is regenerated. No scope creep.

## Issues Encountered
None beyond the type casting noted above.

## User Setup Required

**External services require manual configuration:**
- **N8N_WEBHOOK_URL**: Start N8N with `docker compose -f docker-compose.n8n.yml up`, create a workflow with Webhook trigger, copy the webhook URL
- **N8N_WEBHOOK_SECRET**: Generate with `openssl rand -hex 32`, add to .env and configure in N8N Workflow IF-Node
- **N8N Workflow**: Create workflow at http://localhost:5678 with Webhook-Trigger, Switch-Node on event_type, Email-Nodes for notifications

## Next Phase Readiness
- Phase 5 (Externe Integrationen) complete — both Stripe and N8N integrations functional
- Ready for Phase 6 (Website und Compliance) or Phase 7 (Deployment)
- N8N workflows need manual configuration in the N8N UI (visual, no-code)

## Self-Check: PASSED

All 5 created files verified on disk. All 3 task commits verified in git log.

---
*Phase: 05-externe-integrationen*
*Completed: 2026-03-10*
