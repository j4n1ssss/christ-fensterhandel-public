---
phase: 26-pdf-infrastruktur
plan: 01
subsystem: pdf
tags: [react-pdf, pdf-generation, payload-collections, immutability, typescript]

# Dependency graph
requires:
  - phase: 24-geschaeftslogik
    provides: tax.ts, format-currency.ts, nummernkreise.ts, settings.ts
  - phase: 25-email-system
    provides: render-email.ts pattern (lazy-loaded template registry)
provides:
  - PDFDocumentType, ProduktLineItem, PDFSettings, KundenDaten type definitions
  - AngebotPDFProps, RechnungPDFProps, GutschriftPDFProps template prop interfaces
  - renderPDF() orchestrator with template registry and stream fallback
  - Rechnungen collection (immutable, rechnung + gutschrift types)
  - Angebote collection (versioniert, immutable after send)
  - PDFUploads collection (PDF-only MIME type upload)
  - Navigation links for Angebote + Rechnungen in Bestellungsverwaltung
affects: [26-02-PLAN, 26-03-PLAN, angebot-workflow, rechnung-workflow]

# Tech tracking
tech-stack:
  added: ["@react-pdf/renderer"]
  patterns: ["renderPDF orchestrator (lazy-loaded templates)", "immutable collection pattern (access + hook double-guard)", "serverExternalPackages for native Node modules"]

key-files:
  created:
    - src/lib/pdf/types.ts
    - src/lib/pdf/render-pdf.ts
    - src/collections/business/rechnungen.ts
    - src/collections/business/angebote.ts
    - src/collections/business/pdf-uploads.ts
  modified:
    - src/payload.config.ts
    - src/components/admin/custom-nav.tsx
    - next.config.mjs
    - package.json

key-decisions:
  - "Rechnungen collection combines rechnung + gutschrift as typ select (not separate collections)"
  - "Immutability enforced at two levels: access control (update/delete false) AND beforeChange hook throwing APIError"
  - "Angebote immutability is conditional: only blocks updates when status is not entwurf"
  - "renderPDF uses renderToBuffer primary with renderToStream fallback for resilience"
  - "PDFUploads collection allows server-side create (no user context) but blocks all updates"

patterns-established:
  - "Immutable collection pattern: access returns false + beforeChange hook throws APIError"
  - "PDF rendering follows same lazy-loading template registry as email rendering"
  - "serverExternalPackages config for native Node.js modules in Next.js"

requirements-completed: [PDF-01, PDF-05]

# Metrics
duration: 3min
completed: 2026-03-31
---

# Phase 26 Plan 01: PDF Infrastructure Foundation Summary

**@react-pdf/renderer installed with renderPDF() orchestrator, three immutable Payload collections (rechnungen/angebote/pdf_uploads), and admin navigation integration**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-31T07:49:08Z
- **Completed:** 2026-03-31T07:52:27Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Complete PDF type system with interfaces for all three document types (Angebot, Rechnung, Gutschrift)
- renderPDF() orchestrator with lazy-loaded template registry and renderToBuffer/renderToStream fallback
- Three Payload collections with immutability guards (double-layer: access control + beforeChange hooks)
- Navigation updated with Angebote and Rechnungen links in Bestellungsverwaltung dropdown

## Task Commits

Each task was committed atomically:

1. **Task 1: PDF Types + renderPDF Orchestrator + Infrastructure Config** - `1be5b3c` (feat)
2. **Task 2: Three Payload Collections + Config Registration + Navigation Update** - `5adf36a` (feat)

## Files Created/Modified
- `src/lib/pdf/types.ts` - PDFDocumentType, ProduktLineItem, PDFSettings, KundenDaten, template props, PDFRenderResult
- `src/lib/pdf/render-pdf.ts` - renderPDF() orchestrator with lazy-loaded template registry
- `src/collections/business/rechnungen.ts` - Rechnungen collection (immutable, rechnung + gutschrift types)
- `src/collections/business/angebote.ts` - Angebote collection (versioniert, immutable after send)
- `src/collections/business/pdf-uploads.ts` - PDFUploads collection (PDF-only MIME, immutable uploads)
- `src/payload.config.ts` - Registered Rechnungen, Angebote, PDFUploads collections
- `src/components/admin/custom-nav.tsx` - Added Angebote + Rechnungen to Bestellungsverwaltung dropdown
- `next.config.mjs` - Added serverExternalPackages for @react-pdf/renderer
- `package.json` - Added @react-pdf/renderer dependency

## Decisions Made
- Rechnungen collection combines both rechnung and gutschrift as a `typ` select field rather than separate collections (keeps code DRY, both share same immutability requirements)
- Immutability enforced at two levels: access control returns false AND beforeChange hook throws APIError (belt and suspenders)
- Angebote immutability is conditional: only blocks updates when `originalDoc.status !== 'entwurf'` (drafts can still be edited)
- renderPDF uses renderToBuffer as primary with renderToStream fallback for resilience across environments
- PDFUploads allows server-side create (no user context check) but blocks all update operations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- PDF type system ready for template development (Plan 02)
- renderPDF() orchestrator ready to receive template components
- Collections ready for API route integration (Plan 03)
- Template directory `src/lib/pdf/templates/` created and awaiting template files

---
*Phase: 26-pdf-infrastruktur*
*Completed: 2026-03-31*
