---
phase: 04-dashboards-und-rollen
plan: 02
subsystem: ui
tags: [payload-admin, custom-views, dashboard, status-workflow, react-server-components]

requires:
  - phase: 04-dashboards-und-rollen
    provides: "Access control policies, status transitions, StatusHistorie collection"
provides:
  - "Custom Payload Admin Dashboard landing with stat cards and recent Anfragen"
  - "Custom Anfrage detail view with 3-column layout (timeline, products, contact)"
  - "Status workflow buttons with comment modal for transition validation"
  - "Status timeline component showing chronological StatusHistorie entries"
affects: [04-dashboards-und-rollen, 05-externe-integrationen]

tech-stack:
  added: [lucide-react]
  patterns: [payload-custom-admin-views, rsc-dashboard, client-status-workflow]

key-files:
  created:
    - src/components/admin/dashboard-overview.tsx
    - src/components/admin/anfrage-detail-view.tsx
    - src/components/admin/status-workflow.tsx
    - src/components/admin/status-timeline.tsx
  modified:
    - src/payload.config.ts
    - src/collections/business/anfragen.ts

key-decisions:
  - "Dashboard overview is React Server Component using Payload Local API for stats queries"
  - "Anfrage detail view is client component using useDocumentInfo from @payloadcms/ui"
  - "Status workflow PATCH requests use credentials:include for Payload cookie auth"
  - "RSC dashboard table rows use plain anchor links (no onClick handlers in RSC)"

patterns-established:
  - "Payload custom views: RSC for read-only dashboards, client components for interactive views"
  - "Status transitions: client-side getNextStatuses() + server PATCH with validation"
  - "Admin component registration: string import paths with hash exports in payload.config.ts"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03]

duration: 8min
completed: 2026-03-10
---

# Phase 4 Plan 02: Admin Dashboard Summary

**Custom Payload Admin Dashboard with stat cards, status-badge overview, recent Anfragen list, and 3-column Anfrage detail view with status workflow buttons and timeline**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-10T07:00:00Z
- **Completed:** 2026-03-10T07:08:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Custom Admin Dashboard landing page with 4 stat cards (neue heute, offene gesamt, bestaetigte Monat, Umsatz), status distribution badges, and recent 10 Anfragen table
- Custom Anfrage detail view with 3-column layout: Status-Timeline (left), Produktliste (center), Kontaktdaten + Notizen + Preis (right)
- Status workflow buttons showing only valid next statuses with comment modal for RUECKFRAGE/ABGELEHNT
- Status timeline displaying chronological StatusHistorie entries with colored dots and transition info

## Task Commits

Each task was committed atomically:

1. **Task 1: Custom Admin Dashboard landing + Anfrage detail view** - `94fb8ac` (feat)
2. **Task 2: Verify Admin Dashboard and Anfrage Detail View** - checkpoint:human-verify (approved)

**Bug fixes during verification (separate commits):**
- `26b25d4` - fix(04-02): remove onClick handler from RSC dashboard table row
- `4a22e8c` - fix(konfigurator): fix price 403 and edit-mode restore dialog

## Files Created/Modified
- `src/components/admin/dashboard-overview.tsx` - Custom Payload Admin Dashboard landing page with stat cards and Anfragen table
- `src/components/admin/anfrage-detail-view.tsx` - 3-column Anfrage detail view replacing default edit view
- `src/components/admin/status-workflow.tsx` - Status transition buttons with comment modal
- `src/components/admin/status-timeline.tsx` - Chronological status history timeline
- `src/payload.config.ts` - Registered custom dashboard and Anfrage edit view components
- `src/collections/business/anfragen.ts` - Added admin component view configuration

## Decisions Made
- Dashboard overview implemented as React Server Component using Payload Local API for direct DB queries (no REST overhead)
- Anfrage detail view uses client component with useDocumentInfo for interactive status buttons
- RSC table rows cannot have onClick handlers -- fixed during verification by removing onClick and using plain anchor links
- Preisregeln 403 was a pre-existing access control issue fixed separately (read restricted to staff, but client-side price calc attempted REST API)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] RSC onClick handler removed from dashboard table row**
- **Found during:** Task 2 (human verification)
- **Issue:** Dashboard overview RSC had onClick handlers on table rows, which is invalid in React Server Components
- **Fix:** Removed onClick handlers, table rows link via anchor tags instead
- **Files modified:** src/components/admin/dashboard-overview.tsx
- **Verification:** Build succeeds, dashboard renders correctly
- **Committed in:** 26b25d4

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor RSC compatibility fix. No scope creep.

## Issues Encountered
- Preisregeln 403 error discovered during verification -- pre-existing access control issue from plan 04-01 (Preisregeln read restricted to staff but client-side price calculation used REST API). Fixed in separate commit, out of scope for this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin Dashboard and detail view are complete, ready for Kunden-Dashboard (Plan 04-03)
- Status workflow chain is fully operational: status buttons -> PATCH -> afterChange hook -> StatusHistorie
- Kunden auth components were partially scaffolded in the same commit (login/register forms, layout)

## Self-Check: PASSED

All 4 created files verified on disk. Commit 94fb8ac verified in git log.

---
*Phase: 04-dashboards-und-rollen*
*Completed: 2026-03-10*
