---
phase: 26-pdf-infrastruktur
plan: 03
subsystem: api, ui
tags: [react-pdf, pdf-generation, api-routes, nextjs, payload-hooks, n8n-attachments]

# Dependency graph
requires:
  - phase: 26-pdf-infrastruktur (plan 01)
    provides: PDF types, renderPDF orchestrator, collections (angebote, rechnungen, pdf_uploads)
  - phase: 26-pdf-infrastruktur (plan 02)
    provides: PDF templates (Angebot, Rechnung, Gutschrift), shared components, mock data
  - phase: 25-email-pipeline
    provides: Email queue, queueEmailEvent, processQueue, N8N webhook integration
  - phase: 24-bestellungsflow
    provides: Settings global, Nummernkreise, tax utils, Stripe integration
provides:
  - generateAndStorePDF() central helper for PDF pipeline
  - API routes for generate (POST) and download (GET) of all three PDF types
  - PDF preview route with mock data for staff
  - afterChange hooks for auto-PDF generation on status transitions
  - N8N webhook payload extension with Base64 PDF attachments
  - Admin DokumentePanel component for Anfrage detail view
  - Kunden "Ihre Dokumente" section with download links
affects: [email-pipeline, admin-ui, kunden-dashboard, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "generateAndStorePDF pattern: render -> upload -> create business doc in one atomic operation"
    - "PDF auto-trigger via afterChange hook with non-blocking try/catch"
    - "Base64 PDF attachment in email queue zusatzDaten for N8N forwarding"
    - "Admin DokumentePanel: fetch angebote+rechnungen, combine, sort, display with SCSS classes"

key-files:
  created:
    - src/lib/pdf/generate-and-store.ts
    - src/app/(payload)/api/pdf/angebot/[anfrageId]/route.ts
    - src/app/(payload)/api/pdf/rechnung/[anfrageId]/route.ts
    - src/app/(payload)/api/pdf/gutschrift/[anfrageId]/route.ts
    - src/app/(payload)/api/pdf-preview/[type]/route.ts
    - src/components/admin/dokumente-panel.tsx
  modified:
    - src/collections/business/anfragen.ts
    - src/lib/email/queue.ts
    - src/components/admin/anfrage-detail-view.tsx
    - src/components/kunden/anfrage-detail.tsx
    - src/app/(frontend)/kunden/dashboard/[id]/page.tsx
    - src/app/(payload)/custom.scss

key-decisions:
  - "Used calcTax from tax.ts instead of inline computation for consistency"
  - "PDF generation errors are non-blocking (try/catch with console.error) to not break status transitions"
  - "Admin DokumentePanel fetches from Payload REST API (angebote + rechnungen) with depth=1 for PDF filename"
  - "Kunden dokumente query filters angebote by status=versendet (draft angebote not shown)"

patterns-established:
  - "Auto-trigger pattern: afterChange hook generates PDF before email queuing, attaches buffer as Base64"
  - "API route dual-handler: POST generates + stores, GET downloads stored file from disk"
  - "Preview route pattern: staff-protected, mock data, inline Content-Disposition"

requirements-completed: [PDF-06, PDF-07]

# Metrics
duration: 11min
completed: 2026-03-31
---

# Phase 26 Plan 03: API Routes + Auto-Trigger Hooks + Admin/Kunden UI Summary

**Complete PDF pipeline: generateAndStorePDF helper, 3 API routes (POST/GET), preview route, afterChange auto-generation on status transitions, N8N Base64 attachments, admin DokumentePanel, kunden download section**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-31T08:03:39Z
- **Completed:** 2026-03-31T08:14:23Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- generateAndStorePDF helper renders PDF, uploads to pdf_uploads collection, creates angebote/rechnungen business document in one atomic operation
- Three API routes (angebot, rechnung, gutschrift) with POST (generate) and GET (download with Content-Disposition: attachment), plus staff-protected preview route with mock data
- afterChange hooks auto-generate Rechnung (bezahlt), Angebot (angebot_versendet), Gutschrift (rueckerstattung_abgeschlossen) and attach PDF as Base64 to email payload
- processQueue forwards attachments to N8N webhook POST body
- Admin DokumentePanel in Anfrage detail view shows all documents with download + "Angebot erstellen" button
- Kunden dashboard detail page shows "Ihre Dokumente" section with download links for own documents

## Task Commits

Each task was committed atomically:

1. **Task 1: generateAndStorePDF Helper + API Routes + Preview Route** - `1c20c92` (feat)
2. **Task 2: afterChange Hooks + N8N Attachment + Admin Dokumente Panel + Kunden Download** - `e5ed39c` (feat)

## Files Created/Modified
- `src/lib/pdf/generate-and-store.ts` - Central helper: render PDF, upload, create business doc
- `src/app/(payload)/api/pdf/angebot/[anfrageId]/route.ts` - POST generate + GET download Angebot
- `src/app/(payload)/api/pdf/rechnung/[anfrageId]/route.ts` - POST generate + GET download Rechnung
- `src/app/(payload)/api/pdf/gutschrift/[anfrageId]/route.ts` - POST generate + GET download Gutschrift
- `src/app/(payload)/api/pdf-preview/[type]/route.ts` - Staff-protected preview with mock data
- `src/components/admin/dokumente-panel.tsx` - Admin DokumentePanel component
- `src/collections/business/anfragen.ts` - afterChange hook with PDF auto-generation
- `src/lib/email/queue.ts` - processQueue attachment forwarding to N8N
- `src/components/admin/anfrage-detail-view.tsx` - DokumentePanel integration + useAuth
- `src/components/kunden/anfrage-detail.tsx` - "Ihre Dokumente" section with downloads
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` - Document queries passed to AnfrageDetail
- `src/app/(payload)/custom.scss` - Dokumente panel CSS classes

## Decisions Made
- Used `calcTax` from `tax.ts` for MwSt computation instead of inline `Math.round` for consistency across the codebase
- PDF generation errors in afterChange hooks are non-blocking (try/catch with console.error) to prevent status transition failures
- Kunden document query filters angebote by `status: 'versendet'` so draft angebote are not visible to customers
- Admin DokumentePanel fetches via Payload REST API with `depth=1` to access PDF upload filename for display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PDF pipeline is complete end-to-end: generation, storage, download, preview, auto-trigger, email attachment
- Ready for production deployment (Phase 07) and QA testing (Phase 12)
- N8N workflows need to handle the `attachments` array in the webhook POST body

## Self-Check: PASSED

All 6 created files verified. Both commits (1c20c92, e5ed39c) found in git history.

---
*Phase: 26-pdf-infrastruktur*
*Completed: 2026-03-31*
