---
phase: 25-e-mail-system
plan: 02
subsystem: email
tags: [react-email, email-templates, jsx, html-rendering, typescript]

# Dependency graph
requires:
  - phase: 25-e-mail-system-01
    provides: EmailEventType, EventConfig, EVENT_MATRIX, renderSubject, email types
  - phase: 24-foundation
    provides: formatCents, status-config.ts (STATUS_LABELS, STATUS_COLORS, STATUS_CUSTOMER_TEXT)
provides:
  - 4 shared email components (BaseLayout, EmailButton, AnfrageCard, StatusBadge)
  - 9 customer email templates (anfrage-bestaetigung through rueckerstattung)
  - 2 staff email templates (neue-anfrage, status-benachrichtigung)
  - renderEmailForEvent orchestrator mapping event payloads to template rendering
  - TEMPLATE_SLUGS registry (11 entries)
  - Mock data module (MOCK_SETTINGS, MOCK_ANFRAGE, getMockDataForTemplate)
  - htmlToPlainText converter for email plain-text fallback
affects: [25-03-queue-worker, 25-04-preview-admin]

# Tech tracking
tech-stack:
  added: [@react-email/components@1.0.10, @react-email/render@2.0.4]
  patterns: [react-email-jsx-templates, inline-styles-email, renderToStaticMarkup-rendering, template-slug-registry]

key-files:
  created:
    - src/emails/components/base-layout.tsx
    - src/emails/components/email-button.tsx
    - src/emails/components/anfrage-card.tsx
    - src/emails/components/status-badge.tsx
    - src/emails/templates/anfrage-bestaetigung.tsx
    - src/emails/templates/status-update.tsx
    - src/emails/templates/angebot-versendet.tsx
    - src/emails/templates/zahlungslink.tsx
    - src/emails/templates/zahlung-bestaetigung.tsx
    - src/emails/templates/stornierung.tsx
    - src/emails/templates/rueckfrage.tsx
    - src/emails/templates/reklamation.tsx
    - src/emails/templates/rueckerstattung.tsx
    - src/emails/staff/neue-anfrage.tsx
    - src/emails/staff/status-benachrichtigung.tsx
    - src/lib/email/render-email.ts
    - src/lib/email/mock-data.ts
    - tests/unit/test-email-templates.test.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Used react-dom/server renderToStaticMarkup instead of @react-email/render for CJS/Jest compatibility"
  - "htmlToPlainText custom helper strips HTML tags for email plain-text fallback"
  - "Template registry uses dynamic imports for lazy loading, TEMPLATE_SLUGS as static key list"
  - "buildTemplateProps maps EmailEventPayload to each template's specific prop shape via switch"

patterns-established:
  - "Email template pattern: default export React component, props typed, wraps BaseLayout"
  - "Template rendering: renderEmailForEvent(slug, payload, recipient, settings) returns {html, plainText, subject}"
  - "Mock data pattern: getMockDataForTemplate(slug) returns template-specific props with _eventOverrides"
  - "Email components: inline styles only, no Tailwind, following UI-SPEC.md color/spacing contracts"

requirements-completed: [MAIL-02, MAIL-03]

# Metrics
duration: 7min
completed: 2026-03-29
---

# Phase 25 Plan 02: Email Templates Summary

**11 React Email templates (9 customer + 2 staff) with 4 shared components, renderEmailForEvent orchestrator, and 17 passing render tests**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-29T18:38:17Z
- **Completed:** 2026-03-29T18:45:49Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- 4 shared email components: BaseLayout (header/content/footer with Settings data), EmailButton (primary/staff variants), AnfrageCard (product list with formatCents), StatusBadge (color with 15% opacity background)
- 9 customer templates covering the complete order lifecycle: anfrage-bestaetigung, status-update, angebot-versendet, zahlungslink, zahlung-bestaetigung, stornierung, rueckfrage, reklamation, rueckerstattung
- 2 staff templates: neue-anfrage (with AnfrageCard), status-benachrichtigung (with status transition display)
- renderEmailForEvent orchestrator that maps event payloads to template props, renders HTML + plain text, and generates subject lines from EVENT_MATRIX
- 17 passing tests covering all 11 templates, TEMPLATE_SLUGS registry, footer content, and error handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Install React Email, create shared components and all 11 templates** - `5a704a6` (feat)
2. **Task 2: Create renderEmailForEvent orchestrator and mock data (TDD)**
   - `60de088` (test) -- RED: failing tests for email template rendering
   - `d9a3ad2` (feat) -- GREEN: implementation with all 17 tests passing

## Files Created/Modified
- `src/emails/components/base-layout.tsx` - BaseLayout with header (logo), content slot, footer (Firmendaten from Settings, Impressum/Datenschutz links)
- `src/emails/components/email-button.tsx` - EmailButton with primary (#1a1a1a bg) and staff (#f0f0f0 bg) variants
- `src/emails/components/anfrage-card.tsx` - AnfrageCard product list with formatCents from @/lib/format-currency
- `src/emails/components/status-badge.tsx` - StatusBadge with color + 15% opacity background
- `src/emails/templates/anfrage-bestaetigung.tsx` - Customer confirmation with AnfrageCard and "Anfrage ansehen" CTA
- `src/emails/templates/status-update.tsx` - Status change with StatusBadge and customer-facing text
- `src/emails/templates/angebot-versendet.tsx` - Offer with AnfrageCard, validity date, "Angebot ansehen" CTA
- `src/emails/templates/zahlungslink.tsx` - Payment link with amount and "Jetzt bezahlen" CTA
- `src/emails/templates/zahlung-bestaetigung.tsx` - Payment confirmation with AnfrageCard
- `src/emails/templates/stornierung.tsx` - Cancellation with optional reason and refund info (destructive red heading)
- `src/emails/templates/rueckfrage.tsx` - Question with blockquote styling and "Jetzt antworten" CTA
- `src/emails/templates/reklamation.tsx` - Complaint acknowledgement with next-steps
- `src/emails/templates/rueckerstattung.tsx` - Refund with amount, method, processing time
- `src/emails/staff/neue-anfrage.tsx` - Staff notification with AnfrageCard and "Im Admin oeffnen" CTA (staff variant)
- `src/emails/staff/status-benachrichtigung.tsx` - Staff status change with transition display and admin link
- `src/lib/email/render-email.ts` - renderEmailForEvent orchestrator, TEMPLATE_SLUGS registry, buildTemplateProps, htmlToPlainText
- `src/lib/email/mock-data.ts` - MOCK_SETTINGS, MOCK_ANFRAGE, getMockDataForTemplate for all 11 templates
- `tests/unit/test-email-templates.test.ts` - 17 tests covering all templates, registry, footer, error case

## Decisions Made
- Used `react-dom/server` `renderToStaticMarkup` instead of `@react-email/render`'s `render()` because the latter requires ESM (`--experimental-vm-modules`) which is incompatible with the project's CJS Jest setup. The production rendering path is identical (React Email components are standard React JSX).
- Custom `htmlToPlainText` helper strips HTML tags for plain-text email fallback instead of relying on `@react-email/render`'s `{ plainText: true }` option (same ESM issue).
- Template registry uses dynamic `import()` for lazy loading in production but resolves synchronously in Jest/ts-jest.
- `buildTemplateProps` switch maps the generic `EmailEventPayload` to each template's specific prop shape, using `STATUS_LABELS`, `STATUS_COLORS`, and `STATUS_CUSTOMER_TEXT` from status-config.ts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched from @react-email/render to react-dom/server**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** `@react-email/render` v2 `render()` uses ESM-only dynamic imports (`renderToReadableStream`), failing with `--experimental-vm-modules` error in Jest CJS environment
- **Fix:** Replaced `render()` with `renderToStaticMarkup()` from `react-dom/server` (which is what React Email uses internally). Added DOCTYPE prefix and custom `htmlToPlainText` helper.
- **Files modified:** `src/lib/email/render-email.ts`
- **Verification:** All 17 tests pass, TypeScript compiles without errors
- **Committed in:** `d9a3ad2`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Rendering approach functionally identical. `@react-email/render` remains as dependency for potential future use in Next.js SSR context (where ESM works).

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 11 templates ready for queue engine consumption (Plan 03)
- renderEmailForEvent ready for afterChange hook integration (Plan 03)
- Mock data module ready for preview route (Plan 04)
- TEMPLATE_SLUGS registry ready for preview template index (Plan 04)

## Self-Check: PASSED

All 18 created files verified on disk. All 3 task commits (5a704a6, 60de088, d9a3ad2) verified in git log.

---
*Phase: 25-e-mail-system*
*Completed: 2026-03-29*
