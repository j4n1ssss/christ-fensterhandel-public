---
phase: 02-konfigurator-pipeline
plan: 02
subsystem: ui
tags: [react, tailwind, zustand, responsive-layout, svg, konfigurator, lucide-react]

requires:
  - phase: 02-konfigurator-pipeline
    provides: Zustand store, types, step-config, URL state sync, persistence helpers
provides:
  - Landing page with 3 configurator cards (Fenster, Tueren, Rolllaeden)
  - KonfiguratorShell with responsive 3-column layout (sidebar/content/preview)
  - StepSidebar with completed/active/future step states
  - StepContent placeholder for all 10 steps
  - OptionCard, BadgeGroup reusable UI components
  - StepNavigation (Zurueck/Weiter) with step completion logic
  - MobileStepHeader with dropdown step overlay
  - PreviewPanel with WindowSVG silhouette and SelectionSummary
  - Fenster page with CMS data loading, URL sync, restore dialog
affects: [02-03-steps-1-5, 02-04-steps-6-10, 02-05-warenkorb]

tech-stack:
  added: [lucide-react]
  patterns: [responsive-3-column-shell, sticky-footer-navigation, svg-window-preview, cms-uuid-resolution]

key-files:
  created:
    - src/app/(frontend)/konfigurator/fenster/page.tsx
    - src/app/(frontend)/konfigurator/tueren/page.tsx
    - src/app/(frontend)/konfigurator/rolllaeden/page.tsx
    - src/components/konfigurator/konfigurator-shell.tsx
    - src/components/konfigurator/step-sidebar.tsx
    - src/components/konfigurator/step-content.tsx
    - src/components/konfigurator/preview-panel.tsx
    - src/components/konfigurator/ui/option-card.tsx
    - src/components/konfigurator/ui/badge-group.tsx
    - src/components/konfigurator/ui/step-navigation.tsx
    - src/components/konfigurator/ui/mobile-step-header.tsx
    - src/components/konfigurator/preview/selection-summary.tsx
    - src/components/konfigurator/preview/window-svg.tsx
  modified:
    - src/app/(frontend)/page.tsx
    - package.json

key-decisions:
  - "KonfiguratorShell uses lg breakpoint for 3-column switch: desktop=sidebar+content+preview, tablet=content+preview stacked, mobile=header+content+preview+sticky-footer"
  - "StepNavigation checks step isComplete function before enabling Weiter button"
  - "WindowSVG uses SVG viewBox with preserveAspectRatio for responsive scaling"
  - "SelectionSummary resolves CMS UUIDs to display names by searching collection arrays"

patterns-established:
  - "Shell pattern: KonfiguratorShell contains StepSidebar/StepContent/PreviewPanel as composable children"
  - "Mobile navigation: MobileStepHeader replaces sidebar below lg, StepNavigation becomes sticky footer"
  - "Preview pattern: PreviewPanel reads store selections, derives SVG props from selection state"
  - "Option card pattern: OptionCard with selected ring-2 ring-primary, BadgeGroup for metadata pills"

requirements-completed: [KONF-02, KONF-15]

duration: 4min
completed: 2026-03-09
---

# Phase 2 Plan 02: Konfigurator UI Shell Summary

**Responsive 3-column configurator shell with landing page, step sidebar, preview panel with SVG window silhouette, and reusable OptionCard/BadgeGroup/StepNavigation components**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-09T17:36:53Z
- **Completed:** 2026-03-09T17:41:04Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Landing page with 3 configurator cards navigating to correct routes
- Responsive 3-column layout: sidebar/content/preview on desktop, stacked on mobile
- Step sidebar with completed (checkmark), active (highlighted), future (greyed) states
- All reusable UI components ready: OptionCard, BadgeGroup, StepNavigation, MobileStepHeader
- SVG window preview with configurable wing count, form, and dimensions
- Selection summary resolves CMS UUIDs to display names

## Task Commits

Each task was committed atomically:

1. **Task 1: Landing Page + Routing + Konfigurator Shell** - `ae37961` (feat)
2. **Task 2: UI Components + Preview Panel + Mobile Navigation** - `4448f4b` (feat)

## Files Created/Modified
- `src/app/(frontend)/page.tsx` - Landing page with 3 configurator cards
- `src/app/(frontend)/konfigurator/fenster/page.tsx` - Fenster konfigurator with CMS loading, URL sync, restore dialog
- `src/app/(frontend)/konfigurator/tueren/page.tsx` - Placeholder "Bald verfuegbar" page
- `src/app/(frontend)/konfigurator/rolllaeden/page.tsx` - Placeholder "Bald verfuegbar" page
- `src/components/konfigurator/konfigurator-shell.tsx` - 3-column responsive shell
- `src/components/konfigurator/step-sidebar.tsx` - Desktop sidebar with 10 step states
- `src/components/konfigurator/step-content.tsx` - Step content renderer with placeholders
- `src/components/konfigurator/preview-panel.tsx` - Right-side preview with SVG + summary
- `src/components/konfigurator/ui/option-card.tsx` - Reusable selection card
- `src/components/konfigurator/ui/badge-group.tsx` - Badge pills with variants
- `src/components/konfigurator/ui/step-navigation.tsx` - Zurueck/Weiter with completion logic
- `src/components/konfigurator/ui/mobile-step-header.tsx` - Mobile step dropdown overlay
- `src/components/konfigurator/preview/window-svg.tsx` - SVG window silhouette
- `src/components/konfigurator/preview/selection-summary.tsx` - Completed steps summary
- `package.json` - Added lucide-react

## Decisions Made
- KonfiguratorShell uses `lg` breakpoint for 3-column switch (desktop=row, tablet/mobile=column)
- StepNavigation reads selections from store and checks stepConfig.isComplete() before enabling Weiter
- WindowSVG uses SVG viewBox for responsive scaling, supports wingCount/form/dimensions props
- SelectionSummary resolves CMS UUIDs by searching collection arrays with string ID comparison
- Installed lucide-react for consistent iconography (Check, ChevronRight, ArrowLeft, ArrowRight, X, ChevronDown)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed lucide-react for icons**
- **Found during:** Task 1 (Landing Page)
- **Issue:** Plan references icons (checkmarks, arrows, chevrons) but lucide-react was not installed
- **Fix:** Ran `npm install lucide-react`
- **Files modified:** package.json, package-lock.json
- **Verification:** All icon imports resolve, TypeScript compiles cleanly
- **Committed in:** ae37961 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor dependency addition. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All UI shell components ready for step implementations
- Plans 02-03, 02-04, 02-05 can plug step components into StepContent
- OptionCard and BadgeGroup ready for use in individual step UIs
- PreviewPanel will update automatically as store selections change

---
*Phase: 02-konfigurator-pipeline*
*Completed: 2026-03-09*

## Self-Check: PASSED
- All 14 created files verified on disk
- Both task commits (ae37961, 4448f4b) verified in git log
- 32/32 existing tests still passing
- TypeScript compiles with zero errors
