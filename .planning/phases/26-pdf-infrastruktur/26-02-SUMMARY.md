---
phase: 26-pdf-infrastruktur
plan: 02
subsystem: pdf
tags: [react-pdf, pdf-templates, angebot, rechnung, gutschrift, ustg, mock-data]

# Dependency graph
requires:
  - phase: 26-pdf-infrastruktur
    provides: types.ts (PDFSettings, ProduktLineItem, KundenDaten, template props), render-pdf.ts (lazy template registry)
  - phase: 24-geschaeftslogik
    provides: format-currency.ts (formatCents)
provides:
  - PDFHeader shared component (Logo + Firmendaten)
  - PDFFooter shared component (3-column Bank/Steuer/Kontakt + Seitenzahl)
  - ProduktBlock shared component (table with multi-line config details)
  - MwStBlock shared component (Netto/MwSt/Brutto summary)
  - AngebotPDF template (with Widerrufsbelehrung)
  - RechnungPDF template (10 UStG Pflichtangaben + Zahlungsvermerk)
  - GutschriftPDF template (original Rechnung reference + negative amounts)
  - Mock data for all 3 document types (MOCK_ANGEBOT_PROPS, MOCK_RECHNUNG_PROPS, MOCK_GUTSCHRIFT_PROPS)
affects: [26-03-PLAN, pdf-preview-route, pdf-download-api, email-attachment-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Shared PDF components (header/footer/table/summary) consumed by 3 templates", "MwStBlock with optional label overrides for Gutschrift Erstattung display", "Negative cent values for Gutschrift refund amounts in MwStBlock"]

key-files:
  created:
    - src/lib/pdf/components/pdf-header.tsx
    - src/lib/pdf/components/pdf-footer.tsx
    - src/lib/pdf/components/produkt-block.tsx
    - src/lib/pdf/components/mwst-block.tsx
    - src/lib/pdf/templates/angebot-pdf.tsx
    - src/lib/pdf/templates/rechnung-pdf.tsx
    - src/lib/pdf/templates/gutschrift-pdf.tsx
    - src/lib/pdf/mock-data.ts
  modified: []

key-decisions:
  - "MwStBlock accepts optional labels prop for Gutschrift Erstattung overrides (avoids separate component)"
  - "Gutschrift passes negative cent values to MwStBlock for correct minus display via formatCents"
  - "Rechnung includes static Entgeltminderung note (UStG requirement 10) below MwSt block"

patterns-established:
  - "Shared PDF component pattern: Header/Footer/ProduktBlock/MwStBlock reused across all templates"
  - "PDF template default export pattern: each template is a default export function consumed by renderPDF() lazy loader"

requirements-completed: [PDF-02, PDF-03, PDF-04]

# Metrics
duration: 4min
completed: 2026-03-31
---

# Phase 26 Plan 02: PDF Templates & Components Summary

**Three @react-pdf templates (Angebot with Widerrufsbelehrung, Rechnung with 10 UStG Pflichtangaben, Gutschrift with Rechnung-Referenz) built on 4 shared components plus mock data for preview**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-31T07:55:28Z
- **Completed:** 2026-03-31T07:59:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Four shared PDF components (PDFHeader, PDFFooter, ProduktBlock, MwStBlock) with exact UI-SPEC layout contract
- Rechnung template with all 10 Pflichtangaben nach Paragraph 14 UStG including Leistungsdatum and Zahlungsvermerk
- Gutschrift template with original Rechnung reference (italic), negative Erstattung amounts, and GS-Nummer
- Complete mock data set with realistic Fenster products (cent-based pricing) for PDF preview route in Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared PDF Components (Header, Footer, ProduktBlock, MwStBlock)** - `d0ba40e` (feat)
2. **Task 2: Three PDF Templates + Mock Data** - `64ed53f` (feat)

## Files Created/Modified
- `src/lib/pdf/components/pdf-header.tsx` - Shared header with Logo (max 120pt) + Firmendaten (right-aligned) + separator
- `src/lib/pdf/components/pdf-footer.tsx` - Fixed 3-column footer (Bank/Steuer/Kontakt + Seitenzahl) on every page
- `src/lib/pdf/components/produkt-block.tsx` - Product table with multi-line config details per product (wrap=false)
- `src/lib/pdf/components/mwst-block.tsx` - Right-aligned Netto/MwSt/Brutto summary with optional label overrides
- `src/lib/pdf/templates/angebot-pdf.tsx` - Complete Angebot PDF with Empfaenger, ANG-Nummer, Gueltig bis, Widerrufsbelehrung
- `src/lib/pdf/templates/rechnung-pdf.tsx` - Complete Rechnung PDF with 10 UStG Pflichtangaben + Zahlungsvermerk block
- `src/lib/pdf/templates/gutschrift-pdf.tsx` - Complete Gutschrift PDF with Rechnung reference + negative Erstattung amounts
- `src/lib/pdf/mock-data.ts` - MOCK_ANGEBOT_PROPS, MOCK_RECHNUNG_PROPS, MOCK_GUTSCHRIFT_PROPS with 2 Fenster products

## Decisions Made
- MwStBlock accepts optional `labels` prop to override default "Nettobetrag"/"Bruttobetrag" with "Erstattung Nettobetrag"/"Erstattungsbetrag" for Gutschrift -- avoids duplicating the component
- Gutschrift passes negative cent values (-erstattungNettoCents etc.) to MwStBlock so formatCents renders the minus sign naturally
- Rechnung includes static "Skonti und Rabatte sind bereits beruecksichtigt." text to satisfy UStG requirement 10 (Entgeltminderungen)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three PDF templates are default exports, ready for renderPDF() lazy loading
- Mock data ready for PDF preview route (/api/pdf-preview/[type]) in Plan 03
- Components directory established for future shared PDF building blocks
- Templates follow exact UI-SPEC layout contract (A4, Helvetica, 40pt margins)

## Self-Check: PASSED

All 8 created files verified on disk. Both task commits (d0ba40e, 64ed53f) verified in git log.

---
*Phase: 26-pdf-infrastruktur*
*Completed: 2026-03-31*
