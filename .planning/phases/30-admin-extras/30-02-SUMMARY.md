---
phase: 30-admin-extras
plan: 02
subsystem: ui
tags: [payload-admin, webhook-tab, email-modal, status-timeline, bem-css]

requires:
  - phase: 30-01
    provides: email-preview API, send-email API, email_queue collection with anfrage relationship

provides:
  - WebhookTab component with stats bar, expandable queue rows, retry button
  - EmailSendModal component with template selection, subject auto-fill, recipient modes, preview iframe
  - TabPanel 5th Webhooks tab (admin-only visibility)
  - StatusTimeline email entry rendering with blue border and Mail icon
  - BEM CSS classes for webhook-tab__ and email-modal__

affects: [admin-detail-view, email-queue]

tech-stack:
  added: []
  patterns: [EVENT_MATRIX reverse-lookup for subject auto-fill, accordion expand pattern, focus-trap modal]

key-files:
  created:
    - src/components/admin/webhook-tab.tsx
    - src/components/admin/email-send-modal.tsx
  modified:
    - src/components/admin/tab-panel.tsx
    - src/components/admin/anfrage-detail-view.tsx
    - src/components/admin/status-timeline.tsx
    - src/app/(payload)/custom.scss

key-decisions:
  - "EVENT_MATRIX reverse-lookup iterates entries to find kunde template matching slug (keys use underscores, slugs use hyphens)"
  - "Recipient mode radio group always visible (not hidden behind toggle) for discoverability"
  - "Email entries in timeline detected by [E-Mail gesendet] prefix in kommentar field"

patterns-established:
  - "BEM CSS pattern for admin modals: overlay/dialog/header/body/footer with sticky header+footer"
  - "Accordion expand pattern: expandedId state, single open at a time, ChevronRight rotation"

requirements-completed: [ADMN-01, ADMN-02]

duration: 5min
completed: 2026-04-03
---

# Phase 30 Plan 02: Webhook Tab + Email Send Modal UI Summary

**WebhookTab with stats/expand/retry and EmailSendModal with template selection/preview integrated into Anfrage-Detail-View**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T15:28:51Z
- **Completed:** 2026-04-03T15:34:05Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- WebhookTab component renders email queue entries with stats bar (sent/failed/dead), accordion expand/collapse, detail view (betreff, empfaenger, attempts, idempotency key, error log), and retry button for failed/dead entries
- EmailSendModal component provides template dropdown (10 customer-facing templates), subject auto-fill from EVENT_MATRIX, freitext, recipient mode (default/replace/additional), preview iframe via email-preview API, and send via send-email API
- TabPanel extended with 5th Webhooks tab visible only for admin role, KontaktTab gets E-Mail senden button for admin/mitarbeiter
- StatusTimeline distinguishes manual email entries with blue dot, blue left border, and Mail icon

## Task Commits

Each task was committed atomically:

1. **Task 1: WebhookTab component + EmailSendModal component + CSS** - `34be306` (feat)
2. **Task 2: TabPanel extension + DetailView integration + StatusTimeline email rendering** - `5ce096a` (feat)

## Files Created/Modified
- `src/components/admin/webhook-tab.tsx` - WebhookTab: stats bar, expandable queue rows, retry button
- `src/components/admin/email-send-modal.tsx` - EmailSendModal: template dropdown, auto-fill subject, recipient modes, preview, send
- `src/components/admin/tab-panel.tsx` - 5th Webhooks tab, userRole/onEmailSent props, E-Mail senden button in KontaktTab
- `src/components/admin/anfrage-detail-view.tsx` - Passes userRole and onEmailSent to TabPanel
- `src/components/admin/status-timeline.tsx` - Mail icon + blue border for email_gesendet entries
- `src/app/(payload)/custom.scss` - BEM classes: webhook-tab__ and email-modal__

## Decisions Made
- EVENT_MATRIX reverse-lookup: iterates all entries to find the one whose templates.kunde matches the selected template slug, since keys use underscores but slugs use hyphens
- Recipient mode radio group always visible for discoverability
- Email timeline entries detected by [E-Mail gesendet] prefix in the kommentar field

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All ADMN-01 (Webhook Tab) and ADMN-02 (Manual Email Send) UI components are complete
- Components consume Plan 30-01 API routes (email-preview, send-email)
- Ready for Plan 30-03 (Dashboard Stats + Pagination) and Plan 30-04 remaining work

## Self-Check: PASSED

All 6 files verified present. Both task commits (34be306, 5ce096a) found in git history.

---
*Phase: 30-admin-extras*
*Completed: 2026-04-03*
