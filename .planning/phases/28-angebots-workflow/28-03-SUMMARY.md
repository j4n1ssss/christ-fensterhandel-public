---
phase: 28-angebots-workflow
plan: 03
subsystem: frontend
tags: [angebot, kunden-dashboard, annahme, stripe, email, agb, public-route]

# Dependency graph
requires:
  - phase: 28-angebots-workflow/01
    provides: POST /api/angebot/annehmen, Stripe checkout flow, webhook expiry reset
provides:
  - Public /angebot/[anfrageId] page for guest Angebots-Ansicht
  - AngebotAnnahmeButton reusable component with confirm dialog
  - Kunden-Dashboard Angebots-Bereich with dynamic AGB link
  - Email template updates (angebot-versendet link, zahlung-bestaetigung next steps)
affects: [28-angebots-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline confirm section for legal disclosures, dynamic settings prop passing from server to client, IIFE pattern for conditional rendering with local variables]

key-files:
  created:
    - src/app/(frontend)/angebot/[anfrageId]/page.tsx
    - src/components/kunden/angebots-annahme.tsx
  modified:
    - src/components/kunden/anfrage-detail.tsx
    - src/app/(frontend)/kunden/dashboard/[id]/page.tsx
    - src/lib/email/render-email.ts
    - src/emails/templates/zahlung-bestaetigung.tsx

key-decisions:
  - "AngebotAnnahmeButton uses inline confirm section (not modal) for lighter single-page pattern"
  - "AGB link passed as prop from server component (dynamic from Settings), fallback /agb only when undefined"
  - "Public /angebot/[anfrageId] page uses Payload Local API with bypassed access control (UUID as auth)"
  - "Kunden-Dashboard uses IIFE pattern for conditional Angebots-Bereich rendering with local latestAngebot variable"

patterns-established:
  - "Server-to-client settings prop passing: server page loads getSettings(), extracts field, passes as prop"
  - "Public route pattern for customer-facing pages: no auth required, UUID-based, Payload Local API"

requirements-completed: [ANG-03, ANG-04]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 28 Plan 03: Customer-Facing Angebots-Annahme Flow Summary

**Public Angebots-Ansicht page with guest access, reusable AngebotAnnahmeButton with legal confirm dialog, dashboard integration with dynamic AGB link from Settings, and email template updates for correct routing and next steps content**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-01T09:16:58Z
- **Completed:** 2026-04-01T09:22:18Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 4

## Accomplishments

- Created public /angebot/[anfrageId] server page with product list, price summary, PDF download, expiry handling, and company footer
- Created AngebotAnnahmeButton client component with inline confirm section: Betrag summary, Widerrufs-Hinweis (Paragraph 312g), AGB checkbox with dynamic link, Stripe redirect
- Added Angebots-Bereich in Kunden-Dashboard AnfrageDetail component (green card, shown at angebot_versendet status)
- Extended DokumenteItem interface with betrag_brutto_cents, mwst_cents, mwst_satz, gueltig_bis fields
- Updated dashboard page to load Settings via getSettings() and pass agbLink to AnfrageDetail
- Extended dokumente mapping in dashboard page with pricing and gueltigkeit fields for angebote
- Updated angebot-versendet email template link to use /angebot/[anfrageId] public route (was dashboard URL)
- Added "Naechste Schritte" section to zahlung-bestaetigung email template with manufacturing order and contact info

## Task Commits

Each task was committed atomically:

1. **Task 1: Public /angebot/[anfrageId] page + AngebotAnnahmeButton component** - `c0ef869` (feat)
2. **Task 2: Kunden-Dashboard Angebots-Bereich + Email template updates** - `fad7752` (feat)

## Files Created/Modified

- `src/app/(frontend)/angebot/[anfrageId]/page.tsx` - Public Angebots-Ansicht server page (guest access via UUID)
- `src/components/kunden/angebots-annahme.tsx` - Reusable AngebotAnnahmeButton with confirm dialog, AGB, Widerrufshinweis
- `src/components/kunden/anfrage-detail.tsx` - Added Angebots-Bereich, extended interfaces, imported AngebotAnnahmeButton
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` - Added getSettings() call, agbLink prop, extended dokumente mapping
- `src/lib/email/render-email.ts` - Updated angebotUrl to /angebot/[anfrageId] for angebot-versendet event
- `src/emails/templates/zahlung-bestaetigung.tsx` - Added "Naechste Schritte" section with manufacturing info

## Decisions Made

- AngebotAnnahmeButton uses inline confirm section (not a Radix Dialog modal) for a lighter pattern on single-page flows
- AGB link is always passed as a prop from the server component that loads it from getSettings() -- the "/agb" string is only a fallback when the prop is undefined, not a hardcoded default
- Public /angebot/[anfrageId] page uses Payload Local API (bypasses access control) because the UUID in the URL serves as the authentication token
- IIFE pattern used in AnfrageDetail JSX to compute latestAngebot locally within the conditional rendering block

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Public Angebots-Ansicht and AngebotAnnahmeButton are fully functional and connected to the /api/angebot/annehmen backend from Plan 01
- Kunden-Dashboard integration complete with dynamic AGB link
- Email templates updated for correct routing and enhanced content
- All customer-facing flows (guest + logged-in) are ready for manual testing

## Self-Check: PASSED

- [x] src/app/(frontend)/angebot/[anfrageId]/page.tsx - FOUND
- [x] src/components/kunden/angebots-annahme.tsx - FOUND
- [x] src/components/kunden/anfrage-detail.tsx - FOUND (modified)
- [x] src/app/(frontend)/kunden/dashboard/[id]/page.tsx - FOUND (modified)
- [x] src/lib/email/render-email.ts - FOUND (modified)
- [x] src/emails/templates/zahlung-bestaetigung.tsx - FOUND (modified)
- [x] Commit c0ef869 - FOUND
- [x] Commit fad7752 - FOUND

---
*Phase: 28-angebots-workflow*
*Completed: 2026-04-01*
