---
phase: 02-konfigurator-pipeline
verified: 2026-03-09T20:00:00Z
status: human_needed
score: 5/5 must-haves verified
human_verification:
  - test: "Start dev server and navigate complete 10-step flow"
    expected: "All 10 steps render, selections persist, conditional filtering works visually"
    why_human: "Cannot verify visual rendering, layout responsiveness, or browser behavior programmatically"
  - test: "Change Material in Step 2 after reaching Step 7 — verify Profil and Masse reset"
    expected: "Profil selection clears, Masse clears, user must re-select"
    why_human: "Cascade reset logic is tested in unit tests, but visual feedback needs human confirmation"
  - test: "Mobile view (375px) — verify sidebar as dropdown, sticky footer navigation"
    expected: "MobileStepHeader visible, sidebar hidden, StepNavigation fixed at bottom"
    why_human: "Responsive layout cannot be verified without browser"
  - test: "Step 10 price preview plausibility"
    expected: "Price shows base (area * grundpreis) + itemized aufpreise = correct total"
    why_human: "Needs real CMS data loaded to verify actual numbers"
---

# Phase 2: Konfigurator-Pipeline Verification Report

**Phase Goal:** Ein Kunde kann einen kompletten 10-Step Fenster-Konfigurator durchlaufen -- jede Auswahl filtert die naechsten Optionen intelligent
**Verified:** 2026-03-09T20:00:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Landing Page zeigt 3 Konfigurator-Karten, Klick auf Fenster oeffnet /konfigurator/fenster | VERIFIED | `src/app/(frontend)/page.tsx` renders 3 cards (Fenster/Tueren/Rolllaeden) with correct hrefs. Fenster links to `/konfigurator/fenster`, others marked "Bald verfuegbar" |
| 2 | Alle 10 Steps durchlaufbar: Produkttyp, Material, Profil, Fluegel, Oeffnungsart, Form, Masse, Farben, Verglasung/Extras, Zusammenfassung | VERIFIED | `step-content.tsx` maps all 10 step IDs to real components (no placeholders remain). All 10 step components exist with substantive implementations (2111-13138 bytes each) |
| 3 | Konditionale Ketten-Logik: Material filtert Profile, Produkttyp filtert Fluegel, Profil bestimmt Min/Max Masse | VERIFIED | `filters.ts` implements getFilteredOptions for steps 2-8 using CMS relationship fields. Steps 2-8 all call `getFilteredOptions()`. Step 7 reads profil masse constraints for dynamic Zod validation. 14 unit tests verify filtering logic |
| 4 | Zurueck-Navigation setzt abhaengige Felder zurueck, Fortschrittsanzeige zeigt aktuellen Step | VERIFIED | `store.ts` resetDependentSteps uses findDependentSteps (BFS traversal). `step-config.ts` STEP_DEPENDENCIES graph + findDependentSteps tested with 6 unit tests. `step-sidebar.tsx` shows completed/active/greyed states. `step-navigation.tsx` wires Zurueck/Weiter with completeStep+setStep |
| 5 | Zusammenfassung (Step 10) zeigt alle gewaehlten Optionen mit Preisvorschau | VERIFIED | `step-zusammenfassung.tsx` (396 lines) resolves all 18 selection fields to CMS display names, shows color swatches, calculates base price + itemized aufpreise, calls `calculatePreviewPrice()`. "In den Warenkorb" button disabled with Phase 3 tooltip |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/konfigurator/types.ts` | TypeScript types (CMSData, KonfiguratorSelections, WingOpening, StepConfig) | VERIFIED | 93 lines, exports all 4 interfaces with correct fields |
| `src/lib/konfigurator/store.ts` | Zustand store with persist, cascade reset, CMS loading | VERIFIED | 218 lines, exports useKonfiguratorStore, fetch all 16 collections in parallel, resetDependentSteps, skipHydration:true |
| `src/lib/konfigurator/filters.ts` | Client-side conditional filtering steps 2-8 | VERIFIED | 159 lines, getFilteredOptions handles steps 1-10, extractId normalizes string/object relationships |
| `src/lib/konfigurator/step-config.ts` | Step definitions + dependency graph | VERIFIED | 117 lines, STEPS array (10 entries), STEP_DEPENDENCIES, findDependentSteps with BFS |
| `src/lib/konfigurator/schemas.ts` | Zod validation schemas per step | VERIFIED | 106 lines, getStepSchema for all 10 steps, Step 7 has dynamic min/max from profile context |
| `src/lib/konfigurator/price-calculator.ts` | Price calculation (area * grundpreis + aufpreise) | VERIFIED | 82 lines, calculatePreviewPrice matches preisregeln by produkttyp/material/profil, sums aufpreise |
| `src/lib/konfigurator/url-state.ts` | URL state sync via nuqs | VERIFIED | 1262 bytes, exports useKonfiguratorUrlState |
| `src/lib/konfigurator/persistence.ts` | LocalStorage restore dialog helpers | VERIFIED | 894 bytes, exports showRestoreDialog, clearSavedConfig |
| `jest.config.ts` | Test framework configuration | VERIFIED | Exists |
| `src/app/(frontend)/page.tsx` | Landing page with 3 configurator cards | VERIFIED | 119 lines, 3 cards with SVG icons, responsive grid |
| `src/app/(frontend)/konfigurator/fenster/page.tsx` | Fenster konfigurator page | VERIFIED | 95 lines, client component, loadCMSData on mount, restore dialog, hydration handling |
| `src/components/konfigurator/konfigurator-shell.tsx` | 3-column responsive layout | VERIFIED | 39 lines, imports Sidebar/Content/Preview/MobileHeader/Navigation |
| `src/components/konfigurator/step-content.tsx` | Step router mapping all 10 steps | VERIFIED | All 10 steps imported and mapped to real components |
| `src/components/konfigurator/steps/step-produkttyp.tsx` | Step 1 | VERIFIED | 2111 bytes |
| `src/components/konfigurator/steps/step-material.tsx` | Step 2 with filtering + badges | VERIFIED | 3303 bytes, uses getFilteredOptions(2), shows Lieferzeit/Garantie badges |
| `src/components/konfigurator/steps/step-profil.tsx` | Step 3 with filtering + tech specs | VERIFIED | 5011 bytes, uses getFilteredOptions(3) |
| `src/components/konfigurator/steps/step-fluegel.tsx` | Step 4 with filtering + zusatzlichter | VERIFIED | 4686 bytes, uses getFilteredOptions(4) |
| `src/components/konfigurator/steps/step-oeffnungsart.tsx` | Step 5 per-wing + griff-seite | VERIFIED | 7100 bytes, uses getFilteredOptions(5) |
| `src/components/konfigurator/steps/step-form.tsx` | Step 6 filtered fensterformen | VERIFIED | 3484 bytes, uses getFilteredOptions(6) |
| `src/components/konfigurator/steps/step-masse.tsx` | Step 7 RHF/Zod + dynamic min/max | VERIFIED | 5953 bytes, uses useForm with zodResolver, dynamic constraints from profil |
| `src/components/konfigurator/steps/step-farben.tsx` | Step 8 aussen/innen/dichtung + gleichWieAussen | VERIFIED | 8531 bytes, uses getFilteredOptions(8) |
| `src/components/konfigurator/steps/step-verglasung-extras.tsx` | Step 9 multi-section | VERIFIED | 10134 bytes, uses getFilteredOptions(9) |
| `src/components/konfigurator/steps/step-zusammenfassung.tsx` | Step 10 summary + price | VERIFIED | 13138 bytes, calls calculatePreviewPrice, resolves all CMS names |
| `src/components/konfigurator/ui/option-card.tsx` | Reusable option card | VERIFIED | 1810 bytes |
| `src/components/konfigurator/ui/badge-group.tsx` | Badge component | VERIFIED | 1039 bytes |
| `src/components/konfigurator/ui/step-navigation.tsx` | Zurueck/Weiter buttons | VERIFIED | 3396 bytes, wires completeStep + setStep |
| `src/components/konfigurator/ui/mobile-step-header.tsx` | Mobile step dropdown | VERIFIED | 4358 bytes |
| `src/components/konfigurator/preview/window-svg.tsx` | SVG window preview | VERIFIED | 5856 bytes |
| `src/components/konfigurator/preview/selection-summary.tsx` | Selection summary in preview | VERIFIED | 4540 bytes |
| `src/components/konfigurator/preview/svg-parts/*.tsx` | SVG part components (frame, wing, handle, opening-indicator, dimensions-label, sprossen-overlay) | VERIFIED | 6 files exist (600-3938 bytes each) |
| `tests/unit/test-cascade-reset.test.ts` | Cascade reset tests | VERIFIED | 1737 bytes |
| `tests/unit/test-filters.test.ts` | Filter tests | VERIFIED | 11417 bytes |
| `tests/unit/test-schemas.test.ts` | Schema validation tests | VERIFIED | 2205 bytes |
| `tests/unit/test-price-calculator.test.ts` | Price calculation tests | VERIFIED | 5075 bytes |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| konfigurator-shell.tsx | store.ts | useKonfiguratorStore | WIRED | Shell imports and children use store extensively (64 occurrences across 16 files) |
| fenster/page.tsx | store.ts | loadCMSData on mount | WIRED | useEffect calls loadCMSData after hydration |
| step-navigation.tsx | store.ts | completeStep + setStep | WIRED | handleNext calls completeStep(currentStep) + setStep(currentStep+1) |
| step-material.tsx | filters.ts | getFilteredOptions(2) | WIRED | Imports and calls getFilteredOptions(2, cmsData, selections) |
| step-profil.tsx | filters.ts | getFilteredOptions(3) | WIRED | Imports and calls getFilteredOptions(3, cmsData, selections) |
| step-fluegel.tsx | filters.ts | getFilteredOptions(4) | WIRED | Imports and calls getFilteredOptions(4, cmsData, selections) |
| step-oeffnungsart.tsx | filters.ts | getFilteredOptions(5) | WIRED | Imports and calls getFilteredOptions(5, cmsData, selections) |
| step-form.tsx | filters.ts | getFilteredOptions(6) | WIRED | Imports and calls getFilteredOptions(6, cmsData, selections) |
| step-farben.tsx | filters.ts | getFilteredOptions(8) | WIRED | Imports and calls getFilteredOptions(8, cmsData, selections) |
| step-masse.tsx | schemas.ts | getStepSchema | PARTIAL | Step 7 inlines Zod schema with zodResolver instead of calling getStepSchema. Functionally equivalent -- same dynamic min/max from profil. Not a blocker. |
| step-zusammenfassung.tsx | price-calculator.ts | calculatePreviewPrice | WIRED | Imports and calls calculatePreviewPrice(selections, cms) for total price |
| store.ts | filters.ts | STEP_DEPENDENCIES via resetDependentSteps | WIRED | Imports findDependentSteps from step-config.ts, uses in resetDependentSteps |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| KONF-01 | 02-01 | Landing Page mit 3 Konfigurator-Karten | SATISFIED | page.tsx renders 3 cards with Fenster/Tueren/Rolllaeden |
| KONF-02 | 02-02 | Konfigurator-Routing /konfigurator/fenster etc. | SATISFIED | Routes exist: fenster/page.tsx, tueren/page.tsx, rolllaeden/page.tsx |
| KONF-03 | 02-03 | Step 1 Produkttyp-Auswahl mit Bild | SATISFIED | step-produkttyp.tsx renders OptionCards from CMS produkttypen |
| KONF-04 | 02-03 | Step 2 Material mit Badges | SATISFIED | step-material.tsx shows Lieferzeit/Garantie/Beliebt badges |
| KONF-05 | 02-03 | Step 3 Profil gefiltert nach Material mit tech Daten | SATISFIED | step-profil.tsx calls getFilteredOptions(3), shows Uw-Wert/Kammern/Bautiefe |
| KONF-06 | 02-03 | Step 4 Fluegel gefiltert + Zusatzlichter | SATISFIED | step-fluegel.tsx calls getFilteredOptions(4), shows Zusatzlichter toggles |
| KONF-07 | 02-03 | Step 5 Oeffnungsart pro Fluegel + Griff-Seite | SATISFIED | step-oeffnungsart.tsx renders per-wing with griffSeite toggle for Dreh/Dreh-Kipp |
| KONF-08 | 02-04 | Step 6 Fensterform mit konditionalen Einschraenkungen | SATISFIED | step-form.tsx calls getFilteredOptions(6) filtering by fluegelanzahl + oeffnungsarten |
| KONF-09 | 02-04 | Step 7 Masseingabe mit Min/Max-Validierung | SATISFIED | step-masse.tsx uses RHF + Zod with dynamic min/max from selected profil |
| KONF-10 | 02-04 | Step 8 Farben Aussen/Innen/Dichtung + Gleich-wie-Aussen | SATISFIED | step-farben.tsx has 3 sections with gleichWieAussen checkbox |
| KONF-11 | 02-04 | Step 9 Verglasung + Schallschutz + Sicherheitsglas + Glasdekor + Sprossen + Extras | SATISFIED | step-verglasung-extras.tsx has 6 sub-sections, verglasung required, rest optional |
| KONF-12 | 02-05 | Step 10 Zusammenfassung mit Preisvorschau | SATISFIED | step-zusammenfassung.tsx resolves all names, shows base + aufpreise + total |
| KONF-13 | 02-01 | Zurueck-Reset-Logik (cascade reset) | SATISFIED | store.ts resetDependentSteps + step-config.ts findDependentSteps + 6 unit tests |
| KONF-14 | 02-01 | Fortschrittsanzeige (StepIndicator) | SATISFIED | step-sidebar.tsx shows checkmark/active/greyed for all 10 steps |
| KONF-15 | 02-02 | React Hook Form + Zod fuer Formular-Steps | SATISFIED | step-masse.tsx uses RHF + zodResolver; schemas.ts provides Zod schemas for all steps |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| step-content.tsx | 36,66 | Dead placeholder fallback code for unmapped steps | Info | All 10 steps are mapped; fallback is unreachable. Not a blocker. |
| step-masse.tsx | - | Inlines Zod schema instead of using getStepSchema from lib | Info | Functionally identical validation. Minor duplication. |

### Human Verification Required

### 1. Complete 10-Step Flow Walkthrough

**Test:** Start `npm run dev`, navigate to http://localhost:3000, click Fenster card, walk through all 10 steps making selections
**Expected:** All steps render with CMS data, selections persist between steps, conditional filtering visibly reduces options
**Why human:** Cannot verify visual rendering, CMS data loading, or browser behavior programmatically

### 2. Cascade Reset Behavior

**Test:** Complete steps 1-7, go back to Step 2 and change Material
**Expected:** Profil (Step 3), Masse (Step 7), and Farben (Step 8) reset; user must re-select
**Why human:** Unit tests verify logic but visual feedback (cleared selections, sidebar update) needs human confirmation

### 3. Mobile Responsiveness

**Test:** Open browser DevTools at 375px width
**Expected:** MobileStepHeader visible as dropdown, sidebar hidden, StepNavigation sticky at bottom with iOS safe area
**Why human:** Responsive layout requires browser to verify

### 4. Price Preview Plausibility

**Test:** Complete all 10 steps and verify price on summary page
**Expected:** Grundpreis = area * rate, aufpreise itemized, total matches sum
**Why human:** Requires actual CMS seed data loaded to produce real numbers

### Gaps Summary

No gaps found. All 15 requirements (KONF-01 through KONF-15) are satisfied with substantive implementations. All key artifacts exist, are substantive (no stubs), and are properly wired. The codebase contains:

- **8 lib modules** providing types, store, filters, schemas, price calculator, persistence, URL state, and step config
- **10 step components** (2111-13138 bytes each) all using real CMS data and conditional filtering
- **7 UI/preview components** for the shell, sidebar, cards, navigation, SVG preview, and selection summary
- **6 SVG part components** for the composable window preview
- **4 test suites** with 32 unit tests covering filters, cascade reset, schemas, and price calculation
- **3 route pages** for fenster (functional), tueren and rolllaeden (placeholder -- correct per scope)

The only item requiring human verification is the visual/runtime behavior of the complete flow in a browser with actual CMS data.

---

_Verified: 2026-03-09T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
