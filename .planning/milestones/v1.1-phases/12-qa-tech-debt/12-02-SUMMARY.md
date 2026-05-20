---
phase: 12-qa-tech-debt
plan: 02
subsystem: ui
tags: [payload-admin, custom-cell, badge, tooltip, hub-status, react]

# Dependency graph
requires:
  - phase: 07-data-model-foundation
    provides: "Profile Hub schema with 13 hasMany relationship fields"
  - phase: 09-filter-logic-refactor
    provides: "REQUIRED_HUB_FIELDS constant and validate-hub-fields script"
provides:
  - "ProfileHubStatusCell -- colored badge showing Hub field completeness per Profile"
  - "ProfileHubStatusFilter -- toggle to show only incomplete Profiles"
  - "Reusable admin Tooltip component for Payload Admin Panel"
  - "hub-fields.ts shared constants module (client-safe)"
affects: [12-03-plan, admin-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client-safe shared constants extracted from server-only scripts"
    - "Custom Payload CMS Cell component with inline styles"
    - "Reusable Tooltip with fixed positioning to escape table overflow"
    - "URL search params for client-side list filtering in Payload Admin"

key-files:
  created:
    - src/components/admin/profile-hub-status-cell.tsx
    - src/components/admin/profile-hub-status-filter.tsx
    - src/components/admin/tooltip.tsx
    - src/lib/hub-fields.ts
  modified:
    - src/collections/produkte/profile.ts
    - src/scripts/validate-hub-fields.ts

key-decisions:
  - "Extracted REQUIRED_HUB_FIELDS to src/lib/hub-fields.ts (client-safe) to avoid fs import in browser bundle"
  - "Custom Tooltip component with fixed positioning instead of native title attribute (user request, better UX)"
  - "Tooltip uses fixed positioning to escape Payload table overflow:hidden constraints"

patterns-established:
  - "Admin shared constants in src/lib/ for client/server reuse, re-exported from scripts"
  - "Reusable Tooltip component pattern for Payload Admin custom cells"

requirements-completed: [HUB-05]

# Metrics
duration: 12min
completed: 2026-03-22
---

# Phase 12 Plan 02: Hub-Status Badge Summary

**Hub-Status badge column in Profile list view with green/orange completeness indicator, reusable Tooltip, and filter toggle for incomplete profiles**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-22 (continuation after checkpoint approval)
- **Completed:** 2026-03-22
- **Tasks:** 2 (1 auto + 1 checkpoint)
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- ProfileHubStatusCell renders green "Vollstaendig" or orange "Unvollstaendig" badge based on 5 required Hub fields
- ProfileHubStatusFilter adds URL-param-based toggle to show only incomplete profiles in list view
- Reusable admin Tooltip component with dark mode support, fixed positioning, and word wrap
- Shared hub-fields.ts module decouples client components from server-only validate-hub-fields.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ProfileHubStatusCell, ProfileHubStatusFilter, register in profile.ts** - `a0f2e3a` (feat)
2. **Task 2: Visual QA of Hub-Status Badge and Filter in Admin Panel** - checkpoint (approved)

**Post-checkpoint fixes:**
- `3fea8f5` (fix) -- Extract hub-fields constants to avoid client-side fs import
- `20fc225` (feat) -- Add reusable admin Tooltip, replace native title
- `be08714` (fix) -- Use fixed positioning for tooltip to escape table overflow
- `059e0ec` (fix) -- Tooltip dark mode colors and max-width with word wrap

## Files Created/Modified

- `src/components/admin/profile-hub-status-cell.tsx` -- Custom Cell component rendering Hub-Status badge with color coding
- `src/components/admin/profile-hub-status-filter.tsx` -- Toggle filter for showing only incomplete profiles via URL params
- `src/components/admin/tooltip.tsx` -- Reusable Tooltip component with fixed positioning and dark mode
- `src/lib/hub-fields.ts` -- Shared REQUIRED_HUB_FIELDS constant and HUB_FIELD_LABELS (client-safe)
- `src/collections/produkte/profile.ts` -- Added hub_status ui field with Cell component + defaultColumns
- `src/scripts/validate-hub-fields.ts` -- Refactored to re-export from hub-fields.ts instead of defining constants

## Decisions Made

- **hub-fields.ts extraction:** The original plan imported REQUIRED_HUB_FIELDS from validate-hub-fields.ts which uses Node fs module. Since Cell components run client-side, this caused a bundler error. Extracted constants to src/lib/hub-fields.ts (client-safe) and had validate-hub-fields.ts re-export from there.
- **Custom Tooltip over native title:** User requested a proper tooltip component instead of the native HTML title attribute for better visual consistency and dark mode support.
- **Fixed positioning for Tooltip:** Payload Admin table cells have overflow:hidden, so absolute-positioned tooltips get clipped. Used fixed positioning with getBoundingClientRect() to render tooltips above the viewport flow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted hub-fields constants to client-safe module**
- **Found during:** Task 1 (after initial implementation)
- **Issue:** profile-hub-status-cell.tsx imported REQUIRED_HUB_FIELDS from validate-hub-fields.ts which imports Node's `fs` module -- breaks client-side bundling
- **Fix:** Created src/lib/hub-fields.ts with client-safe exports, made validate-hub-fields.ts re-export from it
- **Files modified:** src/lib/hub-fields.ts (new), src/scripts/validate-hub-fields.ts, src/components/admin/profile-hub-status-cell.tsx, src/components/admin/profile-hub-status-filter.tsx
- **Verification:** Build succeeds without fs import errors
- **Committed in:** `3fea8f5`

**2. [User Request] Added reusable admin Tooltip component**
- **Found during:** Task 2 checkpoint (user feedback)
- **Issue:** Native HTML title attribute was insufficient -- user wanted styled tooltip with dark mode support
- **Fix:** Created src/components/admin/tooltip.tsx with hover trigger, fixed positioning, dark mode colors, word wrap
- **Files modified:** src/components/admin/tooltip.tsx (new), src/components/admin/profile-hub-status-cell.tsx
- **Verification:** Visual QA approved by user
- **Committed in:** `20fc225`, `be08714`, `059e0ec`

---

**Total deviations:** 2 (1 auto-fixed blocking issue, 1 user-requested enhancement)
**Impact on plan:** Both changes improve the deliverable. No scope creep -- tooltip was explicitly requested during checkpoint review.

## Issues Encountered

- Payload Admin table cells use overflow:hidden which clips absolutely-positioned tooltips. Solved with fixed positioning and getBoundingClientRect() calculations.
- Dark mode required explicit color overrides since the tooltip uses inline styles outside Tailwind's theme system.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HUB-05 requirement complete -- Admin sees Hub-Status badge on every profile
- Plan 12-03 (final plan) can proceed: versions decision ADR + DEBT-04/DEBT-05 verification + final build
- Tooltip component is reusable for future admin custom cells

## Self-Check: PASSED

All 6 files verified present. All 5 commits verified in git log.

---
*Phase: 12-qa-tech-debt*
*Completed: 2026-03-22*
