---
phase: 02-konfigurator-pipeline
plan: 03
subsystem: ui
tags: [react, tailwind, svg, zustand, konfigurator, cms-filtering, option-cards]

requires:
  - phase: 02-konfigurator-pipeline
    provides: Zustand store, types, filters, step-config, CMS data loading
  - phase: 02-konfigurator-pipeline
    provides: KonfiguratorShell, OptionCard, BadgeGroup, PreviewPanel, WindowSVG
provides:
  - Steps 1-5 components (Produkttyp, Material, Profil, Fluegel, Oeffnungsart)
  - Composable SVG parts (Frame, Wing, Handle, OpeningIndicator)
  - Per-wing opening type selection with Griff-Seite toggle
  - SVG preview with wing count, opening indicators, Oberlicht/Unterlicht support
affects: [02-04-steps-6-10, 02-05-warenkorb]

tech-stack:
  added: []
  patterns: [composable-svg-parts, per-wing-selection, cms-filtered-option-cards, resolveImageUrl-helper]

key-files:
  created:
    - src/components/konfigurator/steps/step-produkttyp.tsx
    - src/components/konfigurator/steps/step-material.tsx
    - src/components/konfigurator/steps/step-profil.tsx
    - src/components/konfigurator/steps/step-fluegel.tsx
    - src/components/konfigurator/steps/step-oeffnungsart.tsx
    - src/components/konfigurator/preview/svg-parts/frame.tsx
    - src/components/konfigurator/preview/svg-parts/wing.tsx
    - src/components/konfigurator/preview/svg-parts/handle.tsx
    - src/components/konfigurator/preview/svg-parts/opening-indicator.tsx
  modified:
    - src/components/konfigurator/step-content.tsx
    - src/components/konfigurator/preview/window-svg.tsx
    - src/components/konfigurator/preview-panel.tsx

key-decisions:
  - "resolveImageUrl helper handles string ID, Media object, and null/undefined cases from Payload relationship fields"
  - "StepMaterial/StepProfil build full KonfiguratorSelections object explicitly for type safety (no Object.fromEntries cast)"
  - "SVG refactored into composable Frame/Wing/Handle/OpeningIndicator parts for reuse in later steps"
  - "PreviewPanel resolves wingCount from CMS fluegelanzahl.anzahl instead of parseInt on ID"
  - "OpeningIndicator uses slug-based matching (fest/kipp/dreh/dreh-kipp) for symbol rendering"

patterns-established:
  - "resolveImageUrl pattern: resolves Payload Media union type (string | Media | null) to URL string or undefined"
  - "Per-wing selection pattern: WingOpening[] array indexed by wingIndex for multi-wing configuration"
  - "Composable SVG pattern: Frame/Wing/Handle/OpeningIndicator accept positional props for flexible composition"

requirements-completed: [KONF-03, KONF-04, KONF-05, KONF-06, KONF-07]

duration: 5min
completed: 2026-03-09
---

# Phase 2 Plan 03: Steps 1-5 Summary

**5 configurator step components with CMS-filtered options, material/profil badges and specs, per-wing opening selection, and composable SVG preview with opening indicators**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T17:44:04Z
- **Completed:** 2026-03-09T17:49:51Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Steps 1-3: Produkttyp image cards, Material with Lieferzeit/Garantie/Beliebt badges, Profil with technical specs (Uw-Wert, Kammern, Bautiefe, Dichtungen)
- Steps 4-5: Fluegelanzahl with optional Zusatzlichter toggles, per-wing Oeffnungsart with Griff-Seite for Dreh/Dreh-Kipp
- SVG preview refactored into composable parts showing wing count, opening indicators (X for Fest, triangle for Kipp, curved line for Dreh), and Oberlicht/Unterlicht support
- All steps use CMS conditional filtering via getFilteredOptions and cascade-reset downstream steps on selection change

## Task Commits

Each task was committed atomically:

1. **Task 1: Steps 1-3 (Produkttyp, Material, Profil)** - `d571bd5` (feat)
2. **Task 2: Steps 4-5 (Fluegel, Oeffnungsart) + SVG Parts** - `022625d` (feat)

## Files Created/Modified
- `src/components/konfigurator/steps/step-produkttyp.tsx` - Step 1: Produkttyp image card grid with auto-advance
- `src/components/konfigurator/steps/step-material.tsx` - Step 2: Filtered materials with Lieferzeit/Garantie badges
- `src/components/konfigurator/steps/step-profil.tsx` - Step 3: Filtered profiles with Uw-Wert/Kammern/Bautiefe specs
- `src/components/konfigurator/steps/step-fluegel.tsx` - Step 4: Fluegelanzahl cards + optional Zusatzlichter toggles
- `src/components/konfigurator/steps/step-oeffnungsart.tsx` - Step 5: Per-wing opening type + Griff-Seite toggle
- `src/components/konfigurator/step-content.tsx` - Maps steps 1-5 to components, rest remain placeholders
- `src/components/konfigurator/preview/svg-parts/frame.tsx` - SVG outer frame (rechteck/rundbogen)
- `src/components/konfigurator/preview/svg-parts/wing.tsx` - SVG wing inner rectangle
- `src/components/konfigurator/preview/svg-parts/handle.tsx` - SVG handle positioned by griffSeite
- `src/components/konfigurator/preview/svg-parts/opening-indicator.tsx` - SVG opening type symbols
- `src/components/konfigurator/preview/window-svg.tsx` - Composed SVG from parts, supports wingOpenings/Oberlicht/Unterlicht
- `src/components/konfigurator/preview-panel.tsx` - Resolves wingCount from CMS, passes wingOpenings to SVG

## Decisions Made
- Used explicit KonfiguratorSelections object construction instead of Object.fromEntries to satisfy TypeScript strict type checking
- Refactored WindowSVG into composable SVG parts (Frame, Wing, Handle, OpeningIndicator) for maintainability
- PreviewPanel resolves wing count from CMS fluegelanzahl.anzahl field instead of parsing the UUID string
- OpeningIndicator uses slug-based matching for symbol rendering (fest=X, kipp=triangle, dreh=curved line, dreh-kipp=both)
- First material in filtered list gets "Beliebt" badge as a default recommendation indicator

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type assertion fix for selections object**
- **Found during:** Task 1 (Steps 1-3 implementation)
- **Issue:** Object.fromEntries returns `{ [k: string]: ... }` which cannot be cast to KonfiguratorSelections
- **Fix:** Changed to explicit object construction with all 18 selection keys
- **Files modified:** step-material.tsx, step-profil.tsx
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** d571bd5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type safety fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Steps 1-5 fully functional, ready for Steps 6-10 (Plan 02-04)
- SVG preview composable parts ready for extension (color, form shape updates)
- All step components follow same pattern: read store, filter options, render cards, cascade-reset on change

---
*Phase: 02-konfigurator-pipeline*
*Completed: 2026-03-09*

## Self-Check: PASSED
- All 12 created/modified files verified on disk
- Both task commits (d571bd5, 022625d) verified in git log
- 32/32 existing tests still passing
- TypeScript compiles with zero errors
