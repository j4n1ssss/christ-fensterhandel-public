---
phase: 30-admin-extras
plan: "03"
subsystem: api, ui
tags: [payload, pagination, server-side-sort, admin-dashboard, api-routes]

requires:
  - phase: 30-admin-extras
    provides: "30-00 scaffolding (list-view-helpers, detail-view-helpers, status-config, custom.scss BEM classes)"
provides:
  - "Server-side paginated Anfragen-List API route (/api/admin/anfragen-list)"
  - "Dashboard Stats API route (/api/admin/dashboard-stats) with parallel queries"
  - "Refactored AnfragenListView consuming API with pagination, tabs, search, sort"
  - "Client-side DashboardOverview with 5 stat cards including Dringend"
affects: [admin-panel, anfragen-management, performance]

tech-stack:
  added: []
  patterns:
    - "Server-side API route pattern for admin data with Payload auth"
    - "Paginated iteration for aggregation (umsatz) instead of limit=0"
    - "Server-side date query for computed counts (dringend)"
    - "URL state preservation with server-side pagination"

key-files:
  created:
    - "src/app/(payload)/api/admin/anfragen-list/route.ts"
    - "src/app/(payload)/api/admin/dashboard-stats/route.ts"
  modified:
    - "src/components/admin/anfragen-list-view.tsx"
    - "src/components/admin/dashboard-overview.tsx"

key-decisions:
  - "Attention sort requires fetching all matching docs server-side (limit=0 in API route only), computing scores, sorting in JS, then paginating the slice"
  - "Tab counts include search filter so counts reflect current search context"
  - "Umsatz uses paginated iteration (100 per batch) instead of limit=0 in dashboard-stats"
  - "Dringend count uses server-side Payload date query (last_status_change_at less_than sevenDaysAgo)"
  - "Where type fixed with explicit Where | undefined annotation for Payload compatibility"

patterns-established:
  - "Admin API route auth pattern: payload.auth({ headers }) + rolle check for staff roles"
  - "Page number pagination with ellipsis for >7 pages (renderPagination helper)"
  - "Server-side search with client debounce triggering URL param update"

requirements-completed: [ADMN-04]

duration: 5min
completed: 2026-04-03
---

# Phase 30 Plan 03: Server-Side Pagination Summary

**Server-side paginated API routes for Anfragen-Liste and Dashboard, eliminating all limit=0 client-side data loading**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T15:19:09Z
- **Completed:** 2026-04-03T15:24:42Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created /api/admin/anfragen-list API route with pagination, tab filtering, attention-score sort, and search
- Created /api/admin/dashboard-stats API route with parallel stat queries, paginated umsatz aggregation, and server-side dringend count
- Refactored AnfragenListView to fetch from API route with server-side data (zero limit=0 queries)
- Converted DashboardOverview from server component to client component with 5th Dringend stat card
- Added page number buttons with ellipsis pagination and "Seite X von Y" info text

## Task Commits

Each task was committed atomically:

1. **Task 1: Server-side Anfragen-List API route + Dashboard Stats API route** - `395850b` (feat)
2. **Task 2: Refactor anfragen-list-view.tsx + dashboard-overview.tsx to use API routes** - `72fc59e` (feat)

## Files Created/Modified
- `src/app/(payload)/api/admin/anfragen-list/route.ts` - Server-side paginated Anfragen API with tab counts, search, attention sort
- `src/app/(payload)/api/admin/dashboard-stats/route.ts` - Dashboard stats API with parallel queries including dringend count
- `src/components/admin/anfragen-list-view.tsx` - Refactored list view consuming API route instead of limit=0
- `src/components/admin/dashboard-overview.tsx` - Client component fetching from API route with 5 stat cards

## Decisions Made
- Attention sort is the only sort that requires fetching all matching docs (computed value, not a DB field). All other sorts use Payload native pagination.
- Tab counts include search filter to show accurate counts for the current search context.
- Umsatz calculation uses paginated iteration (100 per batch loop) instead of limit=0 to avoid loading all docs into memory.
- Dringend count uses a server-side Payload date query with `last_status_change_at less_than sevenDaysAgo` OR fallback to `createdAt less_than sevenDaysAgo` when last_status_change_at is null -- no JS filtering needed.
- Where type uses explicit `Where | undefined` annotation instead of empty object `{}` to satisfy Payload's strict typing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Payload Where type annotations**
- **Found during:** Task 2 (after writing API route code)
- **Issue:** TypeScript error: empty `{}` object not assignable to Payload `Where` type when no conditions exist
- **Fix:** Changed `where` variable to `Where | undefined` type with `undefined` as fallback instead of `{}`; added `as Where` cast for count queries
- **Files modified:** src/app/(payload)/api/admin/anfragen-list/route.ts
- **Verification:** `npx tsc --noEmit` shows no errors in modified files
- **Committed in:** 72fc59e (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ADMN-04 (Server-side Pagination) fully completed
- All admin list and dashboard components now use server-side API routes
- No limit=0 queries remain in client-side components

## Self-Check: PASSED

All 5 files verified present. Both commit hashes (395850b, 72fc59e) confirmed in git log.
