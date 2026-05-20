---
phase: 29-kunden-self-service
plan: 02
subsystem: api, ui
tags: [kunden-self-service, rueckfrage, stornierung, file-upload, formdata, guest-route, status-banner]

# Dependency graph
requires:
  - phase: 29-kunden-self-service
    provides: "24-status system with kundenantwort + stornierung_beantragt, upload-constants.ts"
  - phase: 28-angebots-workflow
    provides: "Angebots-Annahme inline confirm pattern, guest route pattern"
  - phase: 25-e-mail-system
    provides: "queueEmailEvent, EmailEventPayload"
provides:
  - "POST /api/kunden/antwort endpoint with FormData file upload and status transition"
  - "POST /api/kunden/storno endpoint with begruendung storage and status transition"
  - "RueckfrageFormular client component with inline expand, file upload, client validation"
  - "StornoDialog client component with discreet trigger and confirm section"
  - "StatusBanner extended with kundenantwort (cyan) and stornierung_beantragt (amber) colors"
  - "Guest route /rueckfrage/[anfrageId] for unauthenticated Rueckfrage answers"
  - "AnfrageDetail wired with conditional RueckfrageFormular and StornoDialog rendering"
affects: [kunden-dashboard, admin-detail-view, email-system]

# Tech tracking
tech-stack:
  added: []
  patterns: ["FormData API route with file upload to Media collection via Payload Local API", "Inline expand form pattern with collapsed/expanded/submitting/submitted states"]

key-files:
  created:
    - src/app/api/kunden/antwort/route.ts
    - src/app/api/kunden/storno/route.ts
    - src/components/kunden/rueckfrage-formular.tsx
    - src/components/kunden/storno-dialog.tsx
    - src/app/(frontend)/rueckfrage/[anfrageId]/page.tsx
  modified:
    - src/components/kunden/status-banner.tsx
    - src/components/kunden/anfrage-detail.tsx

key-decisions:
  - "Antwort route uses FormData (not JSON) to support multipart file uploads alongside text"
  - "Guest route geaendert_von set to undefined (StatusHistorie relationship field cannot store email string)"
  - "Kommentar prefixed with 'Kundenantwort von [email]:' for traceability without user relationship"
  - "StornoDialog triggers window.location.reload() on success to refresh StatusBanner state"

patterns-established:
  - "FormData API route pattern: parse formData -> validate text with Zod -> validate files against upload-constants -> rate limit -> Payload operations"
  - "Inline expand component pattern: collapsed (button/link) -> expanded (form) -> submitting (loading) -> submitted (success/null)"

requirements-completed: [KUND-01, KUND-02]

# Metrics
duration: 5min
completed: 2026-04-02
---

# Phase 29 Plan 02: Rueckfrage + Stornierung API/UI Summary

**Rueckfrage-Antwort flow with FormData file upload + Stornierung request flow with confirm dialog, both wired into AnfrageDetail with StatusBanner color extensions**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T22:03:06Z
- **Completed:** 2026-04-02T22:08:28Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Implemented POST /api/kunden/antwort with FormData handling, file upload to Media collection, status transition rueckfrage -> kundenantwort, and staff email queuing
- Implemented POST /api/kunden/storno with excluded status validation, stornierung_grund storage, status transition to stornierung_beantragt, and staff email queuing
- Created RueckfrageFormular client component with inline expand pattern, client-side file validation (size/type/count), and success/error states per UI-SPEC
- Created StornoDialog client component with discreet text link trigger, begruendung textarea, and page reload on success
- Extended StatusBanner with kundenantwort (cyan-50) and stornierung_beantragt (amber-50) color variants, changed font-semibold to font-bold per UI-SPEC
- Built /rueckfrage/[anfrageId] guest route showing admin question context and embedded RueckfrageFormular
- Wired both components into AnfrageDetail with correct conditional rendering (rueckfrage status for form, excluded statuses for storno)

## Task Commits

Each task was committed atomically:

1. **Task 1: API Routes + StatusBanner extension + Guest Route** - `dcb4a80` (feat)
2. **Task 2: Client Components (RueckfrageFormular + StornoDialog) + AnfrageDetail wiring** - `d6422da` (feat)

## Files Created/Modified
- `src/app/api/kunden/antwort/route.ts` - POST endpoint for Kundenantwort with FormData, file upload, rate limiting
- `src/app/api/kunden/storno/route.ts` - POST endpoint for Stornierungsanfrage with status validation, begruendung storage
- `src/components/kunden/rueckfrage-formular.tsx` - Inline expand form with file upload (max 3 files), client validation, success state
- `src/components/kunden/storno-dialog.tsx` - Discreet text link trigger with confirm section, textarea, page reload
- `src/app/(frontend)/rueckfrage/[anfrageId]/page.tsx` - Guest route showing admin question + RueckfrageFormular
- `src/components/kunden/status-banner.tsx` - Extended with kundenantwort (cyan) + stornierung_beantragt (amber) + font-bold
- `src/components/kunden/anfrage-detail.tsx` - Wired RueckfrageFormular + StornoDialog with conditional rendering

## Decisions Made
- Antwort API route uses FormData parsing (not JSON) because file uploads require multipart encoding
- StatusHistorie geaendert_von left as undefined for guest/customer submissions (relationship field cannot store email string); email included in kommentar text prefix instead
- StornoDialog triggers window.location.reload() when no onSuccess callback provided, ensuring StatusBanner shows updated state
- Removed rueckfrage-specific text append from StatusBanner ("Bitte pruefen Sie den Status-Verlauf...") since RueckfrageFormular now provides its own CTA

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Rueckfrage-Antwort and Stornierung flows complete end-to-end
- Plan 03 (Reklamation) can build on the same inline expand pattern established here
- Plan 04 (Passwort-Reset) is independent of these flows
- Both API routes follow the established rate-limited, Zod-validated pattern for future consistency

## Self-Check: PASSED

All 7 files verified present. Both task commits (dcb4a80, d6422da) verified in git log.

---
*Phase: 29-kunden-self-service*
*Completed: 2026-04-02*
