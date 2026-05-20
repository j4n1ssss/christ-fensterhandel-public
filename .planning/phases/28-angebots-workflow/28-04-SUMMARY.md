---
phase: 28-angebots-workflow
plan: "04"
subsystem: anfrage-form, konfigurator, legal
tags: [agb, preishinweis, legal-compliance, form-validation]
dependency_graph:
  requires: [28-00]
  provides: [agb-checkbox, preishinweis, agb-page, agb-timestamp]
  affects: [anfrage-submit, konfigurator-zusammenfassung, kontakt-form]
tech_stack:
  added: []
  patterns: [server-component-wrapper-for-dynamic-props, z-literal-checkbox-validation]
key_files:
  created:
    - src/app/(frontend)/anfrage/anfrage-page-client.tsx
    - src/app/(frontend)/agb/page.tsx
  modified:
    - src/lib/anfrage/schemas.ts
    - src/components/anfrage/contact-form.tsx
    - src/app/api/anfrage/submit/route.ts
    - src/app/(frontend)/anfrage/page.tsx
    - src/components/konfigurator/steps/step-zusammenfassung.tsx
    - src/components/anfrage/anfrage-summary.tsx
    - tests/unit/test-angebot-agb.test.ts
    - tests/unit/test-anfrage-schemas.test.ts
decisions:
  - "Server component wrapper pattern for dynamic Settings props in client pages"
  - "AGB link uses <a> tag (not Next Link) with target=_blank for external URL compatibility"
metrics:
  duration: "10m 13s"
  completed: "2026-04-01T09:03:11Z"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 28 Plan 04: AGB-Checkbox, Preishinweis, AGB-Placeholder Summary

AGB checkbox with z.literal(true) validation and server-side timestamp storage on anfrage, Preishinweis in Konfigurator and Anfrage-Formular, /agb placeholder page with dynamic link from Settings Global.

## Task Completion

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | AGB-Checkbox on ContactForm + submit route agb_akzeptiert_am + tests + server wrapper | 1f07e45 | schemas.ts, contact-form.tsx, submit/route.ts, anfrage/page.tsx, anfrage-page-client.tsx, test-angebot-agb.test.ts |
| 2 | Preishinweis texts + AGB placeholder page | 10f54f1 | step-zusammenfassung.tsx, anfrage-summary.tsx, agb/page.tsx |

## Changes Made

### Task 1: AGB-Checkbox + Server Timestamp + Server Wrapper

**Schema (schemas.ts):** Added `agb: z.literal(true)` field to `kontaktSchema`, matching the existing `datenschutz` pattern. Both client-side inline schema and server-side schema updated.

**ContactForm (contact-form.tsx):** Added `agbLink` prop (default "/agb"). Added AGB checkbox directly below datenschutz checkbox with identical visual pattern (gap-3, mt-0.5, text-sm text-muted-foreground). AGB link uses `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"` for external URL compatibility. Added Preishinweis text before navigation buttons.

**Anfrage Page Restructuring (anfrage/page.tsx + anfrage-page-client.tsx):** The page was a `'use client'` component that could not call `getSettings()`. Restructured: extracted all client logic (useCartStore, useRouter, useState, useEffect) into `AnfragePageClient` component. Made `page.tsx` a server component that calls `getSettings()`, extracts `agb_link`, and passes it as prop. This ensures the AGB link is dynamically loaded from Settings Global on every page load.

**Submit Route (submit/route.ts):** Updated destructuring to also strip `agb` from kontaktdaten before CMS save. Added `agb_akzeptiert_am: new Date().toISOString()` server-side timestamp to the anfrage create call. The timestamp is never client-provided.

**Tests:** Replaced 6 `.todo()` stubs in `test-angebot-agb.test.ts` with 9 real tests covering: acceptance, rejection (false, missing, undefined, string), combined validation with datenschutz. Updated all `test-anfrage-schemas.test.ts` test data to include `agb: true`. All 21 tests pass.

### Task 2: Preishinweis + AGB Placeholder

**Konfigurator Zusammenfassung (step-zusammenfassung.tsx):** Replaced the existing verbose preisvorschau note with the standardized text: "Preise sind unverbindlich. Der endgueltige Preis steht im Angebot." Updated from `text-xs` to `text-sm` and `mt-3` to `mt-2` per UI-SPEC IC-06.

**Anfrage-Formular Summary (anfrage-summary.tsx):** Added Preishinweis text above the navigation/submit buttons section.

**AGB Page (agb/page.tsx):** Created placeholder page at /agb with metadata. Uses standard frontend layout (max-w-2xl, rounded-xl border card). Content indicates AGB will be added later.

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Server component wrapper pattern:** Used a separate `anfrage-page-client.tsx` file (in the route directory, not components/) to keep the route structure clean. The server `page.tsx` fetches Settings and passes agbLink down.

2. **AGB link as `<a>` tag:** Used native `<a>` instead of Next.js `<Link>` for the AGB link in ContactForm, since the agb_link from Settings could be an external URL (PDF, etc.) and `target="_blank"` behavior is more predictable with native anchors.

## Verification

- All 21 tests pass (test-angebot-agb: 9, test-anfrage-schemas: 12)
- No TypeScript errors in modified files
- AGB page exists at /agb route
- Preishinweis text present in both Konfigurator Zusammenfassung and Anfrage-Summary
- agb_akzeptiert_am stored server-side in submit route
- agb field stripped from kontaktdaten before CMS save
- Dynamic agbLink loaded from Settings Global via server component

## Self-Check: PASSED

All 10 files verified present. Both commits (1f07e45, 10f54f1) verified in git log.
