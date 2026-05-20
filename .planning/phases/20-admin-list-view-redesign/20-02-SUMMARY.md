---
phase: 20-admin-list-view-redesign
plan: 02
subsystem: ui
tags: [admin, list-view, filter-tabs, attention-score, pagination, 3-dot-menu, search, anfragen]

requires:
  - phase: 20-admin-list-view-redesign
    provides: list-view-helpers.ts (getAttentionScore, getScoreColor, formatRelativeTime, getSmartDefaultTab, getLetzeAktion), status-config.ts (STATUS_WEIGHT, LIST_TAB_FILTERS), custom.scss (Phase 20 BEM classes)
  - phase: 19-admin-detail-view-redesign
    provides: detail-view-helpers.ts (getWaitingDays, getUrgencyLevel, URGENCY_COLORS, isTerminalStatus, isCompletedStatus, getProduktZusammenfassung), status-config.ts (StatusKey, STATUS_COLORS, STATUS_LABELS, QUICK_ACTIONS), format-currency.ts, status-transitions.ts (COMMENT_REQUIRED)
provides:
  - AnfragenListView component (custom Payload list view with filter tabs, sortable table, search, pagination)
  - ListMenu component (3-dot action menu with quick-actions and detail link)
  - Anfragen collection config with registered custom list view
affects: [21-kunden-dashboard, admin-workflow]

tech-stack:
  added: []
  patterns: [custom-payload-list-view-registration, client-side-filter-tabs, url-param-state-persistence, attention-score-default-sort]

key-files:
  created:
    - src/components/admin/list-menu.tsx
    - src/components/admin/anfragen-list-view.tsx
  modified:
    - src/collections/business/anfragen.ts

key-decisions:
  - "Full client-side filtering with limit=0 fetch -- acceptable for < 500 Anfragen, avoids complex server-side pagination"
  - "URL parameter persistence for tab/page/sort state enables bookmarkable filtered views"
  - "Row click uses window.location.href (full navigation) instead of Next.js router.push for Payload admin compatibility"

patterns-established:
  - "Custom Payload list view: register via admin.components.views.list.Component path in collection config"
  - "ListMenu 3-dot pattern: stopPropagation on trigger, outside-click/Escape to close, COMMENT_REQUIRED redirects to detail view"
  - "Smart default tab selection: rueckfrage > offen > alle priority with URL override"

requirements-completed: [ADMN-07, ADMN-08, ADMN-09]

duration: ~15min
completed: 2026-03-25
---

# Phase 20 Plan 02: Anfragen List View UI Components Summary

**Custom Anfragen list view with 5 filter tabs, attention-score default sort, urgency-colored Wartezeit badges, Letzte Aktion column, 3-dot quick-action menu, search, and pagination replacing Payload's default list**

## Performance

- **Duration:** ~15 min (across checkpoint session)
- **Started:** 2026-03-25T15:40:00Z
- **Completed:** 2026-03-25T21:25:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- Built AnfragenListView component with 5 filter tabs (Alle/Offen/Rueckfrage/In Produktion/Abgeschlossen), count badges, and smart default tab selection
- Built ListMenu 3-dot dropdown with context-aware quick-actions, COMMENT_REQUIRED redirect, and outside-click/Escape handling
- Registered custom list view in Anfragen collection config replacing Payload's default list
- Implemented sortable table with 9 columns (Anfrage-Nr, Kunde, Status, Wartezeit, Produkte, Preis, Letzte Aktion, Erstellt, Aktion)
- URL parameter persistence for tab, page, and sort state
- Client-side search filtering by Anfrage-Nr, Nachname, and E-Mail
- Pagination at 25 items per page with Zurueck/Weiter navigation
- Default sort by attention-score descending (dringendste Anfragen oben)

## Task Commits

Each task was committed atomically:

1. **Task 1: ListMenu + AnfragenListView components** - `a7a5ab0` (feat)
2. **Task 2: Register custom list view in Anfragen collection config** - `a4815ff` (feat)
3. **Task 3: Visual checkpoint** - approved (no commit, visual verification only)

Post-checkpoint fixes:
- `38506c3` (fix) - Replace unicode escapes with real UTF-8 characters
- `940d2ca` (fix) - Prevent sort arrow line-break in header cells with white-space: nowrap

## Files Created/Modified
- `src/components/admin/list-menu.tsx` - 3-dot action menu dropdown with quick-actions, COMMENT_REQUIRED handling, outside-click/Escape close
- `src/components/admin/anfragen-list-view.tsx` - Full custom list view: filter tabs, sortable table, urgency badges, search, pagination, Letzte Aktion column
- `src/collections/business/anfragen.ts` - Added `list.Component` registration pointing to anfragen-list-view#default

## Decisions Made
- Full client-side filtering with `limit=0` fetch: loads all docs for instant tab switching and search. Acceptable for < 500 Anfragen volume.
- URL parameter persistence (`?tab=offen&page=2&sort=wartezeit`): enables bookmarkable filtered views and browser back/forward support
- Row click uses `window.location.href` instead of Next.js `router.push` for reliable navigation within Payload admin context
- Attention-score used for default sort but NOT rendered as visible column (per user decision in CONTEXT.md, replaced by Letzte Aktion column)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Unicode escapes replaced with real UTF-8 characters**
- **Found during:** Post-checkpoint review
- **Issue:** UI strings used JavaScript unicode escapes (`\u00f6`, `\u00fc`, `\u2014`) instead of real UTF-8 characters
- **Fix:** Replaced all unicode escapes with actual characters (oe, ue, em-dash)
- **Files modified:** src/components/admin/list-menu.tsx, src/components/admin/anfragen-list-view.tsx
- **Committed in:** 38506c3

**2. [Rule 1 - Bug] Sort arrow line-break in header cells**
- **Found during:** Post-checkpoint visual verification
- **Issue:** Sort arrow character could wrap to a new line in narrow header cells
- **Fix:** Added `white-space: nowrap` to sortable header cell styles
- **Files modified:** src/components/admin/anfragen-list-view.tsx
- **Committed in:** 940d2ca

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both minor visual/text fixes. No scope creep.

## Issues Encountered
- Dev server restart required after registering custom list view (Payload import map regeneration) -- expected per RESEARCH.md Pitfall 7

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 20 complete: Admin list view fully functional with filter tabs, sorting, search, urgency indicators
- Phase 21 (Kunden-Dashboard + N8N) can proceed -- no blockers
- Admin workflow chain complete: List view (Phase 20) -> Detail view (Phase 19) with bidirectional navigation

## Self-Check: PASSED

- All 3 created/modified files verified on disk
- All 4 task commits (a7a5ab0, a4815ff, 38506c3, 940d2ca) verified in git log

---
*Phase: 20-admin-list-view-redesign*
*Completed: 2026-03-25*
