---
phase: 03-kauffluss
plan: 03
subsystem: ui, api
tags: [react-hook-form, zod, discount, anfrage, sessionStorage, payload-cms]

requires:
  - phase: 03-kauffluss-01
    provides: "Cart Zustand store, CartSummary, CartItemCard, CartEmpty components"
  - phase: 03-kauffluss-02
    provides: "kontaktSchema, calculateServerPrice, generateAnfrageNummer, validateDiscountCode, API routes"
provides:
  - "DiscountInput component with code validation and German error messages"
  - "ContactForm with RHF + Zod validation and sessionStorage persistence"
  - "AnfrageSummary with product list, prices, contact data, and submit handler"
  - "Submit API route creating Anfrage in CMS with server-side price recalculation"
  - "DankeContent showing Anfrage number and next steps"
  - "Complete 3-step flow: Warenkorb -> Kontakt -> Zusammenfassung -> Danke"
affects: [04-auth, 05-admin-dashboard, n8n-automation]

tech-stack:
  added: []
  patterns: [sessionStorage-for-multi-step-form, inline-zod-schema-for-zodResolver-v4, suspense-wrapping-for-useSearchParams]

key-files:
  created:
    - src/components/cart/discount-input.tsx
    - src/components/anfrage/contact-form.tsx
    - src/components/anfrage/anfrage-summary.tsx
    - src/components/anfrage/danke-content.tsx
    - src/app/(frontend)/anfrage/page.tsx
    - src/app/(frontend)/anfrage/zusammenfassung/page.tsx
    - src/app/(frontend)/anfrage/danke/page.tsx
    - src/app/api/anfrage/submit/route.ts
  modified:
    - src/app/(frontend)/warenkorb/page.tsx

key-decisions:
  - "Inline Zod schema in ContactForm for zodResolver Zod v4 compatibility (same pattern as StepMasse)"
  - "SessionStorage for multi-step form data persistence (not URL params, not Zustand)"
  - "Danke page wrapped in Suspense boundary for useSearchParams SSG compatibility"
  - "Submit API silently ignores invalid discount codes rather than blocking submission"
  - "Datenschutz checkbox stripped from kontaktdaten before CMS storage (form-only consent)"

patterns-established:
  - "Multi-step form: sessionStorage for inter-page data, Zustand for cart state"
  - "Suspense boundary required for pages using useSearchParams in Next.js"

requirements-completed: [SEND-01, SEND-02, SEND-03, SEND-04]

duration: 5min
completed: 2026-03-09
---

# Phase 3 Plan 3: Anfrage Flow Summary

**Complete 3-step Anfrage submission flow with discount validation, contact form, server-side price recalculation, and CMS Anfrage creation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T19:30:51Z
- **Completed:** 2026-03-09T19:35:55Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Discount code input in cart with specific German error messages (ungueltig, abgelaufen, aufgebraucht, min_bestellwert)
- Contact form with full Zod validation, sessionStorage persistence, and step-back navigation
- Summary page showing products, discount, MwSt, brutto total, and contact data
- Submit API creates Anfrage in CMS with frozen snapshot, server-recalculated prices, and generated ANF-YYYY-NNN number
- Danke page with Anfrage number display and cleanup of sessionStorage/cart

## Task Commits

Each task was committed atomically:

1. **Task 1: Discount input + Contact form + Summary pages** - `dfb778e` (feat)
2. **Task 2: Submit API route + Danke page + cart cleanup** - `a5e7196` (feat)

## Files Created/Modified
- `src/components/cart/discount-input.tsx` - Discount code input with validation and error display
- `src/components/anfrage/contact-form.tsx` - RHF + Zod contact form with sessionStorage
- `src/components/anfrage/anfrage-summary.tsx` - Full summary with submit handler
- `src/components/anfrage/danke-content.tsx` - Thank you page content
- `src/app/(frontend)/anfrage/page.tsx` - Contact form page (Step 2)
- `src/app/(frontend)/anfrage/zusammenfassung/page.tsx` - Summary page (Step 3)
- `src/app/(frontend)/anfrage/danke/page.tsx` - Thank you page with Suspense
- `src/app/api/anfrage/submit/route.ts` - POST endpoint creating Anfrage in CMS
- `src/app/(frontend)/warenkorb/page.tsx` - Updated with DiscountInput component

## Decisions Made
- Inline Zod schema in ContactForm (same as StepMasse) to satisfy zodResolver type constraints with Zod v4
- SessionStorage for multi-step form data — lightweight, no serialization issues, auto-cleared on tab close
- Danke page uses Suspense boundary around DankeContent since useSearchParams requires it for static generation
- Submit API silently ignores invalid discount codes (still creates Anfrage at full price) rather than blocking
- Datenschutz field stripped before CMS storage since Anfragen collection has no datenschutz field (form-only consent)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build error on /konfigurator/fenster (useSearchParams without Suspense boundary from Phase 2) — not caused by this plan's changes, TypeScript compilation passes clean. Logged as out-of-scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete Kauffluss (Phase 3) is done: Warenkorb + Server Logic + Anfrage Flow
- Ready for Phase 4 (Auth) or Phase 5 (Admin Dashboard)
- Anfragen appear in Payload Admin Panel with status "neu" and full snapshot data

## Self-Check: PASSED

All 8 created files verified on disk. Both task commits (dfb778e, a5e7196) verified in git log.

---
*Phase: 03-kauffluss*
*Completed: 2026-03-09*
