---
phase: quick
plan: 260318-uog
subsystem: i18n/text
tags: [umlaut, i18n, text-correction, german]
dependency_graph:
  requires: []
  provides: [correct-german-umlauts]
  affects: [all-ui-text, anonymization-sentinel]
tech_stack:
  added: []
  patterns: [sed-batch-replacement]
key_files:
  created: []
  modified:
    - src/collections/business/anfragen.ts
    - src/collections/business/rabattcodes.ts
    - src/collections/business/status-historie.ts
    - src/collections/produkte/profile.ts
    - src/collections/produkte/fensterformen.ts
    - src/collections/produkte/fluegelanzahl.ts
    - src/collections/produkte/oeffnungsarten.ts
    - src/collections/ausstattung/extras.ts
    - src/collections/ausstattung/farben.ts
    - src/collections/ausstattung/sicherheitsglas.ts
    - src/collections/system/edit-history.ts
    - src/components/konfigurator/steps/*.tsx (10 files)
    - src/components/konfigurator/step-content.tsx
    - src/components/konfigurator/ui/step-navigation.tsx
    - src/components/konfigurator/ui/mobile-step-header.tsx
    - src/components/konfigurator/preview/window-svg.tsx
    - src/components/konfigurator/preview/selection-summary.tsx
    - src/components/konfigurator/preview-panel.tsx
    - src/components/cart/*.tsx (4 files)
    - src/components/anfrage/*.tsx (3 files)
    - src/components/admin/*.tsx (5 files)
    - src/components/kunden/*.tsx (6 files)
    - src/components/puck-blocks/*.tsx (5 files)
    - src/components/cookie-banner/cookie-banner.tsx
    - src/lib/konfigurator/schemas.ts
    - src/lib/konfigurator/step-config.ts
    - src/lib/konfigurator/persistence.ts
    - src/lib/anfrage/schemas.ts
    - src/app/(frontend)/**/*.tsx (9 files)
    - src/app/api/**/*.ts (5 files)
    - src/app/(payload)/api/admin/anonymize-customer/route.ts
    - src/migrations/backfill-erlaubte-farben.ts
    - src/payload-globals/navigation.ts
    - src/seed/data/*.ts (15 files)
    - tests/unit/test-cascade-reset.test.ts
    - tests/unit/test-schemas.test.ts
    - tests/unit/test-filters.test.ts
    - tests/unit/test-cart-store.test.ts
    - tests/unit/test-snapshot.test.ts
decisions:
  - "Used sed for batch replacements to avoid linter interference with Edit tool"
  - "GELOESCHT sentinel changed atomically in both anonymize-customer/route.ts and anfrage-detail-view.tsx"
  - "payload-types.ts restored to original state (auto-generated file, changes will propagate on next generate:types)"
metrics:
  duration: 15min
  completed: 2026-03-18
  tasks_completed: 2
  tasks_total: 2
  files_modified: 91
---

# Quick Task 260318-uog: Umlaut-Korrektur Summary

Replace all ASCII-encoded German umlauts (ae/oe/ue/ss) with real Unicode umlauts across ~297 locations in ~91 files.

## One-liner

All user-facing German text now uses real umlauts (ae->a, oe->o, ue->u, ss->ss) across 91 files with consistent GELOSCHT sentinel.

## What Was Done

### Task 1: Apply all umlaut corrections across src/ files (1f3624e + cbb9c77)

Applied ~270+ text corrections across 87 source files:

- **Collections (11 files):** Labels, descriptions, error messages in Payload CMS collection configs
- **Components (39 files):** All UI-facing strings in konfigurator steps, cart, anfrage, admin, kunden, puck-blocks, cookie-banner
- **Lib (4 files):** Zod validation messages, step config names, persistence dialog text
- **Seed data (15 files):** Display names and descriptions for all seed data
- **App pages (9 files):** Page titles, meta descriptions, headings, button text
- **API routes (6 files):** Error messages
- **Migrations (1 file):** Console log messages
- **Globals (1 file):** Navigation label

**CRITICAL fix:** GELOESCHT sentinel changed to GELOSCHT in both:
- `src/app/(payload)/api/admin/anonymize-customer/route.ts` (21 instances)
- `src/components/admin/anfrage-detail-view.tsx` (2 instances: confirm dialog + comparison)

### Task 2: Fix test mock data and verify tests pass (d50ed77)

Updated 5 test files with corrected display values:
- Mock data: `2-fluegelig` -> `2-flugelig`, `Weiss` -> `Weiss`, `Balkontuer` -> `Balkontur`
- Describe/it strings: Updated to use real umlauts
- Preserved all ASCII property names (`fuer_fenster`, `fuer_balkontuer`, etc.)
- Fixed accidental `fuer_fenster` -> `fur_fenster` property rename (Rule 1 auto-fix)

**Result:** 232 tests pass across 20 test suites.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed accidental property name change in test-filters.test.ts**
- **Found during:** Task 2
- **Issue:** sed command `s/fuer_fenster/fur_fenster/g` accidentally changed the property name `fuer_fenster` to `fur_fenster` in mock data objects (not just in describe/it strings)
- **Fix:** Restored `fuer_fenster` property names while keeping `fur_fenster` only in describe/it description strings
- **Files modified:** tests/unit/test-filters.test.ts
- **Commit:** d50ed77

**2. [Rule 1 - Bug] Missed Zurueck button text in step-navigation.tsx**
- **Found during:** Final verification
- **Issue:** sed pattern `>Zurueck<` didn't match the actual format with whitespace around the text
- **Fix:** Applied targeted sed to fix the remaining instance
- **Files modified:** src/components/konfigurator/ui/step-navigation.tsx
- **Commit:** cbb9c77

## Verification Results

1. **ASCII umlaut scan:** CLEAN - no remaining UI-facing ASCII umlauts in src/ or tests/
2. **GELOSCHT consistency:** Confirmed in exactly 2 files (anonymize-customer + anfrage-detail-view), GELOESCHT returns 0 matches
3. **Tests:** 232 passed, 0 failed across 20 test suites
4. **payload-types.ts:** NOT modified (restored to original state)
5. **No variable names, field names, slugs, or DB columns changed**

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 1f3624e | Replace ASCII umlauts across ~85 src files |
| 1b | cbb9c77 | Fix remaining Zurueck button text |
| 2 | d50ed77 | Update test mock data with real umlauts |

## Self-Check: PASSED
