---
phase: 29-kunden-self-service
plan: 03
subsystem: api, ui
tags: [payload, reklamation, file-upload, formdata, react, next.js]

# Dependency graph
requires:
  - phase: 29-01
    provides: Upload constants (MAX_REKLAMATION_FILES), status-config extensions
  - phase: 29-02
    provides: RueckfrageFormular pattern, antwort API route pattern, anfrage-detail component
provides:
  - Reklamationen Payload Collection with status offen/in_bearbeitung/geloest
  - POST /api/kunden/reklamation endpoint with photo upload and validation
  - ReklamationFormular client component with photo upload and inline expand
  - ReklamationAnzeige server component with color-coded status display
  - Guest route /reklamation/[anfrageId] for standalone complaint submission
  - Admin nav link to Reklamationen collection
affects: [admin-detail-view, email-templates, qa-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [reklamation-flow, foto-upload-formdata, status-colored-display]

key-files:
  created:
    - src/collections/business/reklamationen.ts
    - src/app/api/kunden/reklamation/route.ts
    - src/components/kunden/reklamation-formular.tsx
    - src/components/kunden/reklamation-anzeige.tsx
    - src/app/(frontend)/reklamation/[anfrageId]/page.tsx
  modified:
    - src/payload.config.ts
    - src/components/admin/custom-nav.tsx
    - src/components/kunden/anfrage-detail.tsx
    - src/app/(frontend)/kunden/dashboard/[id]/page.tsx

key-decisions:
  - "Admin nav file is custom-nav.tsx not navigation.tsx -- added Reklamationen to bestellungsverwaltung dropdown"
  - "ReklamationFormular follows RueckfrageFormular inline-expand pattern with image thumbnail previews"
  - "queueEmailEvent uses full EmailEventPayload shape (including produkte, gesamtbetragCents) for reklamation event"

patterns-established:
  - "Reklamation photo upload: FormData with fotos field, MAX_REKLAMATION_FILES=5, same media upload loop pattern"
  - "ReklamationAnzeige: STATUS_CONFIG object for color-coded status display (red/amber/green)"

requirements-completed: [KUND-03]

# Metrics
duration: 5min
completed: 2026-04-02
---

# Phase 29 Plan 03: Reklamation Feature Summary

**Reklamationen Collection with photo upload API, color-coded status display, guest route, and full AnfrageDetail wiring**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T22:12:04Z
- **Completed:** 2026-04-02T22:17:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Reklamationen Payload Collection with status lifecycle (offen -> in_bearbeitung -> geloest) and access control
- POST API route with FormData photo upload, Zod validation, rate limiting, status transition, and email queuing
- ReklamationFormular client component with image thumbnail previews, max 5 files, inline expand pattern
- ReklamationAnzeige server component with color-coded status (red/amber/green) and loesung display
- Guest route at /reklamation/[anfrageId] for standalone submission (geliefert/abgeschlossen only)
- Admin navigation updated with Reklamationen link in Bestellungsverwaltung section
- Dashboard page loads and passes reklamationen to AnfrageDetail

## Task Commits

Each task was committed atomically:

1. **Task 1: Reklamationen Collection + API Route + Registration** - `20587e6` (feat)
2. **Task 2: Reklamation Client Components + Guest Route + AnfrageDetail wiring** - `fa41347` (feat)

## Files Created/Modified
- `src/collections/business/reklamationen.ts` - Payload Collection with fields: anfrage, beschreibung, fotos, status, loesung, erstellt_von
- `src/app/api/kunden/reklamation/route.ts` - POST endpoint with FormData parsing, file validation, rate limiting, email queuing
- `src/components/kunden/reklamation-formular.tsx` - Client form with photo upload, thumbnail previews, collapsed/expanded/submitted states
- `src/components/kunden/reklamation-anzeige.tsx` - Server component with STATUS_CONFIG for color-coded display
- `src/app/(frontend)/reklamation/[anfrageId]/page.tsx` - Guest route with status check and ReklamationFormular
- `src/payload.config.ts` - Added Reklamationen import and collection registration
- `src/components/admin/custom-nav.tsx` - Added Reklamationen link to bestellungsverwaltung dropdown
- `src/components/kunden/anfrage-detail.tsx` - Extended props with reklamationen, added ReklamationFormular and ReklamationAnzeige
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` - Loads reklamationen via payload.find, passes to AnfrageDetail

## Decisions Made
- Admin nav file is custom-nav.tsx (not navigation.tsx as plan assumed) -- Reklamationen added to bestellungsverwaltung dropdown after Rechnungen
- ReklamationFormular follows RueckfrageFormular inline-expand pattern for consistency, with added image thumbnail previews
- queueEmailEvent uses full EmailEventPayload shape with produkte and gesamtbetragCents for maximum template flexibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Admin navigation file path correction**
- **Found during:** Task 1 (Navigation link)
- **Issue:** Plan referenced `src/components/admin/navigation.tsx` but file is `src/components/admin/custom-nav.tsx`
- **Fix:** Used correct file path, added Reklamationen to bestellungsverwaltung dropdown items array
- **Files modified:** src/components/admin/custom-nav.tsx
- **Verification:** grep confirms reklamation in custom-nav.tsx
- **Committed in:** 20587e6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Trivial filename correction. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Reklamation feature fully wired and operational
- Email templates for reklamation event type may need creation in future phases
- Admin can manage reklamationen in Payload admin at /admin/collections/reklamationen

## Self-Check: PASSED

All 5 created files verified on disk. Both commit hashes (20587e6, fa41347) found in git log.

---
*Phase: 29-kunden-self-service*
*Completed: 2026-04-02*
