---
phase: 24-foundation
plan: 01
subsystem: database
tags: [payload-global, settings, admin-page, custom-view, getSettings]

# Dependency graph
requires: []
provides:
  - "Settings Global (slug: 'settings') with Firmendaten, Steuer, Stripe, Dokumente, E-Mail, Meta field groups"
  - "getSettings() helper in lib/settings.ts (no-cache, reads from DB every call)"
  - "Custom Admin Page at /admin/einstellungen with 4-tab form UI"
  - "Navigation link in System dropdown"
affects: [24-02, 25-email, 26-pdf, 27-stripe, 28-angebots-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payload Global with hidden admin + Custom Admin Page for full UI control"
    - "getSettings() no-cache helper pattern (every call reads fresh from DB)"
    - "sessionStorage tab persistence (settings-tab key)"

key-files:
  created:
    - src/payload-globals/settings.ts
    - src/lib/settings.ts
    - src/components/admin/settings-page.tsx
    - tests/unit/test-settings.test.ts
  modified:
    - src/payload.config.ts
    - src/components/admin/custom-nav.tsx

key-decisions:
  - "Settings Global hidden in Payload admin (admin.hidden: true) because Custom Admin Page provides the UI"
  - "getSettings() uses 'as any' type cast until payload-types.ts is regenerated to include settings slug"
  - "Upload fields (agb_pdf, pdf_logo) shown as read-only links to media collection rather than custom upload widget"

patterns-established:
  - "Settings Global as single source of truth for all company/tax/payment/document configuration"
  - "Custom Admin Page pattern: fetch from /api/globals/{slug}, POST to save, toast for feedback"

requirements-completed: [BASE-01]

# Metrics
duration: 9min
completed: 2026-03-28
---

# Phase 24 Plan 01: Settings Global + Admin Page Summary

**Payload Settings Global with 26 fields across 6 groups, getSettings() no-cache helper with 3 unit tests, and Custom Admin Page with 4 tabs (Firmendaten/Steuer/Stripe/Dokumente)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-28T21:57:47Z
- **Completed:** 2026-03-28T22:07:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Settings Global registered in Payload with all field groups: Firmendaten (12 fields), Steuer (2), Stripe (2), Dokumente (5), E-Mail (3), Meta (2)
- getSettings() helper with unit test proving no-cache behavior (3 tests, all passing)
- Custom Admin Page at /admin/einstellungen with 4-tab form, save flow, toast feedback, read-only mode for non-admins
- Navigation link added to System dropdown in custom-nav.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Settings Global + getSettings helper + unit test + config + nav (TDD RED)** - `f8c74c6` (test)
2. **Task 1: Settings Global + getSettings helper + config + nav (TDD GREEN)** - `5e82cb2` (feat)
3. **Task 2: Settings Custom Admin Page with 4 tabs** - `dfedf16` (feat)

_Note: Task 1 was TDD with RED (failing test) then GREEN (implementation) commits._

## Files Created/Modified
- `src/payload-globals/settings.ts` - Settings GlobalConfig with 26 fields, access control, beforeChange hook
- `src/lib/settings.ts` - getSettings() helper reads from DB without caching
- `src/components/admin/settings-page.tsx` - Custom Admin Page with 4 tabs, form fields, save flow, read-only mode
- `tests/unit/test-settings.test.ts` - 3 unit tests for getSettings() behavior
- `src/payload.config.ts` - Added Settings import, globals registration, einstellungen view
- `src/components/admin/custom-nav.tsx` - Added Einstellungen link to System dropdown

## Decisions Made
- Settings Global set to `admin.hidden: true` because the Custom Admin Page at /admin/einstellungen provides the full UI (the built-in Payload Global editor is not needed)
- Used `as any` type cast in getSettings() for the slug parameter because payload-types.ts has not been regenerated yet to include the new 'settings' slug (will auto-resolve on next `npm run dev`)
- Upload fields (agb_pdf, pdf_logo) displayed as read-only links to media items with guidance to use Medien-Verwaltung, since the full Payload upload widget is not available in custom pages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript error for settings slug type**
- **Found during:** Task 1 (getSettings helper)
- **Issue:** `payload.findGlobal({ slug: 'settings' })` caused TS error because payload-types.ts only knows about existing globals (webhook_errors, navigation, footer)
- **Fix:** Added `as any` type cast with explanatory comment; will resolve when types are regenerated
- **Files modified:** src/lib/settings.ts
- **Verification:** `npx tsc --noEmit` no longer shows settings.ts errors
- **Committed in:** 5e82cb2 (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal type workaround, no scope creep. Auto-resolves on next dev server start.

## Issues Encountered
- Jest 30 CLI flag change: `--testPathPattern` replaced by `--testPathPatterns`, and `-x` replaced by `--bail`. Adjusted commands accordingly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Settings Global is live and registered -- downstream plans (tax.ts, PDF, E-Mail, Stripe) can use `getSettings()` to read company data, tax rate, and document settings
- Next plan (24-02) can build lib/tax.ts that reads MwSt-Satz from this Settings Global
- Custom Admin Page is functional -- admin can start entering company data immediately after DB migration

## Self-Check: PASSED

All 4 created files verified on disk. All 3 commit hashes (f8c74c6, 5e82cb2, dfedf16) verified in git log.

---
*Phase: 24-foundation*
*Completed: 2026-03-28*
