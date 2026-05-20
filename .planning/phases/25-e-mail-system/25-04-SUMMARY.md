---
phase: 25-e-mail-system
plan: 04
subsystem: api, ui
tags: [email, preview, settings, admin, n8n, documentation]

# Dependency graph
requires:
  - phase: 25-e-mail-system (plans 01, 02)
    provides: TEMPLATE_SLUGS, renderEmailForEvent, getMockDataForTemplate, EVENT_MATRIX, EmailEventPayload types
provides:
  - Email preview routes (index + template preview with test-send)
  - Settings E-Mail tab with event toggles matrix
  - N8N setup documentation
affects: [25-e-mail-system plan 03 queue worker, deployment, admin UI]

# Tech tracking
tech-stack:
  added: []
  patterns: [in-memory rate limiter for test-send, server-rendered HTML preview pages, event toggles matrix UI]

key-files:
  created:
    - src/app/(payload)/api/email-preview/route.ts
    - src/app/(payload)/api/email-preview/[template]/route.ts
    - docs/wissen/n8n-email-setup.md
  modified:
    - src/components/admin/settings-page.tsx

key-decisions:
  - "Staff auth check uses ['admin', 'mitarbeiter'].includes(user.rolle) for preview routes"
  - "Rate limiter uses in-memory Map with 5/min per user, periodic cleanup every 5min"
  - "Preview renders server-side HTML with inline JS for toggle/test-send (no React client components)"
  - "Email fields moved from Dokumente tab to dedicated 5th E-Mail tab"
  - "Event toggles default to enabled (true) unless explicitly set to false"
  - "test_preview events excluded from toggles matrix (utility event, always enabled)"

patterns-established:
  - "Server-rendered HTML preview route with auth guard for admin tools"
  - "Event toggles matrix pattern: record of '{eventType}_{recipient}' boolean keys"

requirements-completed: [MAIL-04, MAIL-06]

# Metrics
duration: 6min
completed: 2026-03-29
---

# Phase 25 Plan 04: Email Preview, Settings Tab, N8N Docs Summary

**Staff-protected email preview routes with test-send, Settings E-Mail tab with event toggles matrix, and N8N deployment documentation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-29T18:49:02Z
- **Completed:** 2026-03-29T18:55:35Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Email preview index route lists all 11 templates with links
- Individual template preview renders email with mock data, includes test-send and plain-text toggle
- Settings page extended with 5th E-Mail tab containing email config fields and event toggles matrix
- N8N setup documentation covers workflow creation, testing checklist, troubleshooting, and DNS records

## Task Commits

Each task was committed atomically:

1. **Task 1: Create email preview routes (index + template preview with test-send)** - `80d559e` (feat)
2. **Task 2: Add 5th E-Mail tab to Settings page and write N8N setup documentation** - `0da4ce6` (feat)

## Files Created/Modified
- `src/app/(payload)/api/email-preview/route.ts` - Template index page listing all 11 templates (GET, staff-protected)
- `src/app/(payload)/api/email-preview/[template]/route.ts` - Individual template preview with test-send (GET + POST, staff-protected, rate limited)
- `src/components/admin/settings-page.tsx` - Extended with 5th E-Mail tab, event toggles matrix, moved email fields from Dokumente
- `docs/wissen/n8n-email-setup.md` - N8N workflow setup, SMTP config, testing checklist, troubleshooting, DNS records

## Decisions Made
- Staff auth check uses `['admin', 'mitarbeiter'].includes(user.rolle)` for all preview routes (matching CONTEXT.md "Admin-geschuetzt" which means admin panel staff)
- Rate limiter uses in-memory Map with 5/min per user and 5-minute cleanup interval (consistent with Phase 24 rate limiting pattern)
- Preview pages are server-rendered HTML with inline vanilla JS (no React hydration needed for simple admin tool pages)
- Email fields (absender, reply-to, signatur) moved from Dokumente tab to dedicated E-Mail tab
- Event toggles default to enabled (true) unless explicitly set to false, per CONTEXT.md decision
- test_preview event excluded from toggles matrix display since it's a utility event

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed XSS via escapeHtml in preview route**
- **Found during:** Task 1 (template preview route)
- **Issue:** Template slug and email values injected directly into HTML without escaping
- **Fix:** Added escapeHtml() utility function, applied to all dynamic values in HTML output
- **Files modified:** src/app/(payload)/api/email-preview/[template]/route.ts
- **Verification:** All dynamic content properly escaped
- **Committed in:** 80d559e (Task 1 commit)

**2. [Rule 1 - Bug] Used safe DOM methods instead of innerHTML for client-side messages**
- **Found during:** Task 1 (template preview route)
- **Issue:** Initial implementation used innerHTML for success/error messages
- **Fix:** Replaced with createElement + textContent for safe DOM manipulation
- **Files modified:** src/app/(payload)/api/email-preview/[template]/route.ts
- **Verification:** No innerHTML usage for dynamic content
- **Committed in:** 80d559e (Task 1 commit)

**3. [Rule 3 - Blocking] Fixed EmailEventType import path**
- **Found during:** Task 2 (settings page)
- **Issue:** event-matrix.ts imports but does not re-export EmailEventType
- **Fix:** Imported EmailEventType from '@/lib/email/types' instead of '@/lib/email/event-matrix'
- **Files modified:** src/components/admin/settings-page.tsx
- **Verification:** TypeScript compiles without errors
- **Committed in:** 0da4ce6 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for security and correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. N8N setup is documented but happens during deployment phase.

## Next Phase Readiness
- Plan 25-03 (queue worker) is the remaining incomplete plan
- All email infrastructure is ready: types, templates, rendering, preview, settings
- Queue worker implementation will complete the email pipeline

## Self-Check: PASSED

All 4 created/modified files verified on disk. Both task commits (80d559e, 0da4ce6) verified in git log.

---
*Phase: 25-e-mail-system*
*Completed: 2026-03-29*
