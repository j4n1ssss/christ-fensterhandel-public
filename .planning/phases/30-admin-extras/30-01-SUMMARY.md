---
phase: 30-admin-extras
plan: 01
subsystem: api
tags: [email, react-email, payload, queue, admin-api, zod, rate-limiting]

# Dependency graph
requires:
  - phase: 25-email-system
    provides: email_queue collection, render-email registry, BaseLayout, queueEmailEvent
provides:
  - Extended email_queue schema with anfrage and sent_by relationship fields
  - FreitextEmail template registered in render-email registry
  - POST /api/admin/email-preview route for rendering templates with real anfrage data
  - POST /api/admin/send-email route for creating queue entries with StatusHistorie logging
  - WebhookFehlerBadge migrated from webhook_errors Global to email_queue dead count
  - 90-day cleanup retention for sent email_queue entries
affects: [30-02-admin-extras, 30-03-admin-extras]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin API route with CSRF + auth + Zod validation + rate limiting]

key-files:
  created:
    - src/emails/templates/freitext.tsx
    - src/app/(payload)/api/admin/email-preview/route.ts
    - src/app/(payload)/api/admin/send-email/route.ts
  modified:
    - src/collections/system/email-queue.ts
    - src/lib/email/queue.ts
    - src/lib/email/render-email.ts
    - src/components/admin/webhook-fehler-badge.tsx
    - src/components/admin/custom-nav.tsx

key-decisions:
  - "event_type for manual sends is manuell_[templateSlug] (plain text, not in EmailEventType union)"
  - "Queue entries created directly via Payload API (not queueEmailEvent since EVENT_MATRIX does not know manual events)"
  - "StatusHistorie kommentar prefix [E-Mail gesendet] for manual email tracking (no schema change)"
  - "send-email rate limit 10/min per user (higher than preview 5/min to allow batch sends)"
  - "WebhookFehlerBadge fetches email_queue dead count (no time window, shows all dead entries)"

patterns-established:
  - "Admin API route pattern: CSRF check -> Payload auth -> role check -> Zod validation -> business logic"
  - "globalThis cleanup key pattern for preventing duplicate setInterval in hot reload"

requirements-completed: [ADMN-03]

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 30 Plan 01: Admin Extras Foundation Summary

**Extended email_queue with anfrage/sent_by fields, FreitextEmail template, admin email-preview/send-email API routes, badge migration to email_queue dead count**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T15:18:37Z
- **Completed:** 2026-04-03T15:22:49Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Extended email_queue collection with anfrage (indexed, for Webhook Tab filtering) and sent_by (manual sender tracking) relationship fields
- Created FreitextEmail React Email template with BaseLayout, greeting, pre-wrap freitext body, anfrage reference, and CTA button
- Built POST /api/admin/email-preview route that renders templates with real anfrage data for iframe preview
- Built POST /api/admin/send-email route with rate limiting (10/min), queue entry creation with anfrage/sent_by, and StatusHistorie logging
- Migrated WebhookFehlerBadge from webhook_errors Global to email_queue dead count query
- Updated cleanup retention from 30 to 90 days

## Task Commits

Each task was committed atomically:

1. **Task 1: email_queue schema extension + retention update + FreitextEmail template + render-email registry** - `a003449` (feat)
2. **Task 2: WebhookFehlerBadge migration + nav label update** - `f2fd2a6` (feat)
3. **Task 3: API routes for email preview and send** - `ab81d3b` (feat)

## Files Created/Modified
- `src/collections/system/email-queue.ts` - Added anfrage and sent_by relationship fields
- `src/lib/email/queue.ts` - Changed cleanupSentEvents retention default from 30 to 90 days
- `src/emails/templates/freitext.tsx` - New FreitextEmail React Email template
- `src/lib/email/render-email.ts` - Added freitext to TEMPLATE_COMPONENTS and buildTemplateProps
- `src/components/admin/webhook-fehler-badge.tsx` - Migrated from webhook_errors to email_queue dead count
- `src/components/admin/custom-nav.tsx` - Imported WebhookFehlerBadge, passed as badge to System dropdown
- `src/app/(payload)/api/admin/email-preview/route.ts` - New admin API route for template preview
- `src/app/(payload)/api/admin/send-email/route.ts` - New admin API route for manual email sending

## Decisions Made
- event_type for manual sends uses `manuell_[templateSlug]` format (plain text field, not constrained to EmailEventType union)
- Queue entries created directly via Payload API rather than queueEmailEvent (EVENT_MATRIX does not know manual events)
- StatusHistorie uses kommentar with `[E-Mail gesendet]` prefix (no schema change needed)
- send-email rate limit set to 10/min per user (higher than preview 5/min to allow batch operations)
- WebhookFehlerBadge shows all dead entries (no time window filter, unlike previous 24h window)
- globalThis cleanup key pattern used for rate limiter setInterval deduplication in hot reload

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 30-02 (Webhook Tab + Email Send Modal UI) can proceed: schema extensions, API routes, and template are ready
- Plan 30-03 depends on 30-02 completion
- All 8 success criteria verified and passing

## Self-Check: PASSED

All 8 created/modified files verified present on disk. All 3 task commits (a003449, f2fd2a6, ab81d3b) verified in git history.

---
*Phase: 30-admin-extras*
*Completed: 2026-04-03*
