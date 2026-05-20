---
phase: 28-angebots-workflow
plan: 02
subsystem: admin-ui
tags: [angebot, modal, dual-price, dokumente-panel, splitbutton, versioning, admin]

# Dependency graph
requires:
  - phase: 28-angebots-workflow/01
    provides: POST /api/angebot/erstellen, custom pricing, status transitions
provides:
  - AngebotsModal component with dual-price mode (Gesamtpreis + Einzelpreise)
  - Enhanced DokumentePanel with version display, betrag, status badge
  - Splitbutton modal integration (opens modal instead of direct status change)
  - AnfrageDetailView orchestration of modal lifecycle
  - Versioning unit tests (7 tests)
affects: [28-angebots-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [BEM modal pattern matching RefundModal, dual-price last-edit-wins, angebotInfo pre-fill from API]

key-files:
  created:
    - src/components/admin/angebots-modal.tsx
  modified:
    - src/app/(payload)/custom.scss
    - src/components/admin/dokumente-panel.tsx
    - src/components/admin/splitbutton.tsx
    - src/components/admin/anfrage-detail-view.tsx
    - tests/unit/test-angebot-versioning.test.ts

key-decisions:
  - "CSS file is src/app/(payload)/custom.scss not src/styles/custom.scss (plan referenced wrong path)"
  - "DokumentePanel uses local ANGEBOT_STATUS_COLORS for angebot-specific status display (entwurf/versendet)"
  - "AnfrageDetailView loads angebotInfo (lastBrutto, nextVersion) via /api/angebote query on refreshKey change"
  - "Focus trap implemented manually (no external library) matching Payload admin patterns"

patterns-established:
  - "AngebotsModal follows same overlay+dialog pattern as RefundModal"
  - "onOpenAngebotsModal callback threaded through Splitbutton and DokumentePanel to parent"

requirements-completed: [ANG-01, ANG-02]

# Metrics
duration: 7min
completed: 2026-04-01
---

# Phase 28 Plan 02: Admin UI for Angebots-Erstellung Summary

**AngebotsModal with dual-price mode (Gesamt + Einzelpreise), enhanced DokumentePanel with version history and status badges, Splitbutton modal integration replacing direct status change**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-01T09:16:42Z
- **Completed:** 2026-04-01T09:23:27Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created AngebotsModal component (548 lines) with all IC-01 sections: Positionen (read-only), Gesamtpreis (brutto editable with live Netto/MwSt), collapsible Einzelpreise, conditional Begruendung, Gueltigkeit dropdown, Freitext
- Implemented dual-price mode with "last edit wins" logic: Einzelpreise change recalculates Gesamt, manual Gesamt takes precedence
- V2+ pre-fill from last Angebot betrag_brutto_cents, version label in modal header
- Added focus trap, Escape key close, aria-modal accessibility, overlay click-to-close
- Enhanced DokumentePanel: betrag_brutto_cents display, status badge (Entwurf/Versendet) per angebot row
- Replaced old handleCreateAngebot (direct POST) with onOpenAngebotsModal callback pattern
- Added "+ Neues Angebot erstellen" button below document list (always visible for staff)
- Updated Splitbutton to intercept angebot_versendet target and open modal instead
- Wired AnfrageDetailView: showAngebotsModal state, angebotInfo loading, modal render
- Added BEM CSS classes for AngebotsModal matching existing admin panel patterns
- Implemented 7 versioning unit tests covering version increment, latest query, sort, edge cases

## Task Commits

Each task was committed atomically:

1. **Task 1: AngebotsModal component + custom.scss styles** - `8c9a5fe` (feat)
2. **Task 2: DokumentePanel + Splitbutton + AnfrageDetailView + versioning tests** - `aca54a4` (feat)

## Files Created/Modified

- `src/components/admin/angebots-modal.tsx` - New: AngebotsModal with dual-price mode, Settings fetch, API submission
- `src/app/(payload)/custom.scss` - Added AngebotsModal BEM CSS classes (overlay, dialog, header, body, footer, sections)
- `src/components/admin/dokumente-panel.tsx` - Enhanced: betrag display, status badge, onOpenAngebotsModal, "+ Neues Angebot" button
- `src/components/admin/splitbutton.tsx` - Added onOpenAngebotsModal prop, intercept angebot_versendet action
- `src/components/admin/anfrage-detail-view.tsx` - Added AngebotsModal render, angebotInfo state, modal lifecycle
- `tests/unit/test-angebot-versioning.test.ts` - Replaced todo stubs with 7 passing tests

## Decisions Made

- CSS file is at `src/app/(payload)/custom.scss` (plan referenced `src/styles/custom.scss` which does not exist)
- DokumentePanel uses local ANGEBOT_STATUS_COLORS map for angebot-specific display (not reusing STATUS_COLORS which maps anfrage statuses)
- AnfrageDetailView fetches latest angebot version info on every refreshKey change (ensures modal pre-fill is current)
- Focus trap implemented with manual DOM query (no external library) to match existing Payload admin patterns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CSS file path correction**
- **Found during:** Task 1
- **Issue:** Plan referenced `src/styles/custom.scss` which does not exist; actual admin CSS file is `src/app/(payload)/custom.scss`
- **Fix:** Added CSS to the correct file
- **Files modified:** `src/app/(payload)/custom.scss`

**2. [Rule 2 - Missing] Removed unused imports in DokumentePanel**
- **Found during:** Task 2
- **Issue:** STATUS_COLORS, STATUS_LABELS, StatusKey imported but not used (replaced by local ANGEBOT_STATUS_COLORS)
- **Fix:** Removed unused imports to prevent linter warnings
- **Files modified:** `src/components/admin/dokumente-panel.tsx`

## Issues Encountered

None -- all tasks executed cleanly. Pre-existing TypeScript errors in other files (pdf-preview route, annehmen zod schema) are out of scope.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- AngebotsModal fully wired and ready for end-to-end testing
- Plan 28-03 (Kunden Frontend) can build on the modal + API foundation
- Plan 28-04 already completed (AGB-Checkbox, Preishinweis)

## Self-Check: PASSED

- [x] src/components/admin/angebots-modal.tsx - FOUND
- [x] src/app/(payload)/custom.scss - FOUND
- [x] src/components/admin/dokumente-panel.tsx - FOUND
- [x] src/components/admin/splitbutton.tsx - FOUND
- [x] src/components/admin/anfrage-detail-view.tsx - FOUND
- [x] tests/unit/test-angebot-versioning.test.ts - FOUND
- [x] Commit 8c9a5fe - FOUND
- [x] Commit aca54a4 - FOUND

---
*Phase: 28-angebots-workflow*
*Completed: 2026-04-01*
