---
phase: 18-statuses-transitions-collection-felder
plan: 03
subsystem: database
tags: [payload-cms, postgresql, status-system, webhook, collection-fields, hooks]

# Dependency graph
requires:
  - phase: 18-statuses-transitions-collection-felder
    plan: 01
    provides: "StatusKey union type, STATUS_LABELS, STATUS_COLORS, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, isCustomerFacing helper"
  - phase: 18-statuses-transitions-collection-felder
    plan: 02
    provides: "VALID_TRANSITIONS 20-status map, COMMENT_REQUIRED array, WebhookPayload interface with customer_facing fields"
provides:
  - "20-status select field on Anfragen collection"
  - "Hersteller-Informationen collapsible group with conditional visibility and access control"
  - "Stornierung collapsible group with conditional visibility and validation"
  - "last_status_change_at readOnly date field with auto-update"
  - "Enriched WebhookPayload with customer_facing, kunden_text, kunden_phase in both create and status_aenderung hooks"
  - "validateStornierung helper with conditional refund field validation"
affects: [19-status-ui-admin, 20-anfragen-liste, 21-kunden-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Collapsible field groups with admin.condition for status-dependent visibility"
    - "Extracted hook validation helper (validateStornierung) for maintainability"
    - "Dual kommentar source in status_historie (stornierung_grund vs _status_kommentar)"

key-files:
  created: []
  modified:
    - "src/collections/business/anfragen.ts"

key-decisions:
  - "Extracted validateStornierung as standalone helper to keep beforeChange hook under 50 lines"
  - "stornierung_grund replaces _status_kommentar for storniert transitions in status_historie"
  - "Stripe Checkout trigger stays on bestaetigt (not moved to zahlungslink_versendet)"

patterns-established:
  - "Collapsible group conditional visibility via admin.condition on wrapper field"
  - "Field-level access control pattern: isStaff for read, hasRole admin/mitarbeiter for update"
  - "Hook helper extraction pattern for complex validation logic"

requirements-completed: [STAT-03, STAT-06, FELD-01, FELD-02]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 18 Plan 03: Anfragen Collection Fields + Hooks Summary

**20-status select field, Hersteller/Stornierung collapsible groups with conditional visibility, last_status_change_at auto-update, and enriched WebhookPayload with customer_facing + kunden_text + kunden_phase**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T09:07:18Z
- **Completed:** 2026-03-25T09:12:32Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Extended anfragen.ts status select from 7 to 20 options matching all StatusKey values
- Added Hersteller-Informationen collapsible group (4 fields, visible from bezahlt onwards) and Stornierung collapsible group (3 fields, visible only at storniert) with field-level access control
- Added last_status_change_at readOnly date field with automatic update in beforeChange hook
- Extended beforeChange hook with stornierung validation (stornierung_grund required, conditional refund fields for paid statuses)
- Extended afterChange hook to send customer_facing, kunden_text, kunden_phase in both create and status_aenderung webhook payloads
- All 178 status/webhook tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend anfragen.ts select options and add new fields** - `bb2428c` (feat)
2. **Task 2: Extend beforeChange and afterChange hooks** - `1a42cef` (feat)

## Files Created/Modified
- `src/collections/business/anfragen.ts` - Extended with 20 status options, 3 new field groups (last_status_change_at, Hersteller-Informationen collapsible, Stornierung collapsible), validateStornierung helper, enriched webhook payloads

## Decisions Made
- Extracted validateStornierung as a standalone helper function outside the collection config to keep the beforeChange hook body manageable (prevents exceeding 50-line limit per Pitfall 4)
- stornierung_grund is used as the kommentar source in status_historie when transitioning to storniert, while _status_kommentar is used for all other transitions
- Stripe Checkout trigger remains on bestaetigt status (not moved to zahlungslink_versendet) per research recommendation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The 20-status system is now fully wired into the Anfragen collection (select field, hooks, webhook payloads)
- Phase 18 is complete -- all 3 plans delivered status-config, transitions, and collection integration
- Phases 19-21 can consume STATUS_COLORS, STATUS_LABELS, customer_facing flag, and conditional field groups for admin UI, list views, and kunden dashboard

---
## Self-Check: PASSED

- [x] src/collections/business/anfragen.ts exists
- [x] 18-03-SUMMARY.md exists
- [x] Commit bb2428c (Task 1) found
- [x] Commit 1a42cef (Task 2) found

---
*Phase: 18-statuses-transitions-collection-felder*
*Completed: 2026-03-25*
