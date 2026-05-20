---
phase: 19-admin-detail-view-redesign
plan: 04
subsystem: ui
tags: [css, scss, react, inline-styles, admin-panel, payload-cms]

# Dependency graph
requires:
  - phase: 19-admin-detail-view-redesign (plans 01-03)
    provides: 5 React components with CSS class scaffolding and inline styles
provides:
  - Complete CSS class system in custom.scss covering typography, forms, buttons, links, layout utilities
  - 5 refactored React components with minimal inline styles (only dynamic values remain)
  - admin-content wrapper class reuse in detail view matching dashboard page pattern
affects: [future admin components, admin theming, dark mode support]

# Tech tracking
tech-stack:
  added: []
  patterns: [BEM-like CSS classes in admin-custom.scss, dynamic-only inline styles]

key-files:
  created: []
  modified:
    - src/app/(payload)/custom.scss
    - src/components/admin/attention-bar.tsx
    - src/components/admin/splitbutton.tsx
    - src/components/admin/product-card.tsx
    - src/components/admin/tab-panel.tsx
    - src/components/admin/anfrage-detail-view.tsx

key-decisions:
  - "CSS classes use Payload theme variables (--theme-elevation-*) for dark mode compatibility"
  - "Only truly dynamic values (status colors, disabled opacity) remain as inline styles"
  - "btn-anonymize/btn-save use CSS :disabled pseudo-class for cursor, dynamic opacity stays inline"

patterns-established:
  - "BEM-like naming for admin CSS: .component__element--modifier"
  - "Typography scale classes: text-display (20px), text-heading (14px), text-body (13px), text-caption (12px), text-label (12px bold)"
  - "Form element classes: form-textarea, form-input, form-select with consistent padding/border/font"
  - "Button classes: btn-ghost, btn-primary, btn-destructive, btn-save, btn-anonymize with :disabled states"

requirements-completed: [ADMN-01]

# Metrics
duration: 7min
completed: 2026-03-25
---

# Phase 19 Plan 04: Gap Closure -- Extract Inline Styles to CSS Classes Summary

**~60 new CSS classes in custom.scss replacing static inline styles across 5 admin React components, with only dynamic status colors retained as inline styles**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-25T13:28:25Z
- **Completed:** 2026-03-25T13:35:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Extended custom.scss from 251 lines to 631 lines with comprehensive CSS class system
- Reduced total inline style count from ~50+ across 5 files to 11 (all dynamic/computed values)
- product-card.tsx and anfrage-detail-view.tsx now have ZERO inline styles
- Wrapper in anfrage-detail-view.tsx uses className="admin-content" matching dashboard page pattern
- Removed JavaScript hover handlers (onMouseEnter/onMouseLeave) in favor of CSS :hover

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend custom.scss with missing CSS classes** - `79199ae` (feat)
2. **Task 2: Refactor all 5 React components to use CSS classes** - `1a7cf3f` (refactor)

## Files Created/Modified
- `src/app/(payload)/custom.scss` - Extended with ~60 CSS classes for typography, forms, buttons, links, layout utilities
- `src/components/admin/attention-bar.tsx` - Replaced 8 inline styles with CSS classes, 2 dynamic retained
- `src/components/admin/splitbutton.tsx` - Replaced 15+ inline styles with CSS classes, 7 dynamic retained
- `src/components/admin/product-card.tsx` - Replaced all 6 inline styles with CSS classes, 0 retained
- `src/components/admin/tab-panel.tsx` - Replaced 12+ inline styles with CSS classes, 2 dynamic retained
- `src/components/admin/anfrage-detail-view.tsx` - Replaced all 5 inline styles with CSS classes, 0 retained

## Inline Style Audit (Final State)

| File | Inline styles | Dynamic reason |
|------|:---:|---|
| anfrage-detail-view.tsx | 0 | n/a |
| product-card.tsx | 0 | n/a |
| attention-bar.tsx | 2 | status-badge colors (statusColor), urgency-badge colors (urgencyColor) |
| tab-panel.tsx | 2 | tab trigger borderBottomColor (statusColor), btn-save opacity (savingNotizen) |
| splitbutton.tsx | 7 | primary btn background, chevron background+filter, dropdown-dot color, comment-panel border, btn-primary bg+opacity, stornierung border, btn-destructive opacity |

## Decisions Made
- CSS classes use Payload theme variables (--theme-elevation-*) for dark mode compatibility
- Only truly dynamic values (status colors, disabled opacity) remain as inline styles
- link-standard-view CSS class created but not used (standard view link was removed in plan 03)
- Changed "GELOESCHT" string check from unicode to ASCII match in tab-panel kontakt anonymize guard

## Deviations from Plan

None - plan executed exactly as written. The link-standard-view class was created in CSS as planned, but the referencing element (standard view link) was already removed by Plan 03 checkpoint review changes, so the className is unused in anfrage-detail-view.tsx.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 gap closure complete -- all static inline styles extracted to CSS classes
- Phase 19 Success Criterion 1 fully satisfied: "admin-custom.css ist via Payload Config eingebunden und strukturelle Admin-Styles als CSS-Klassen definiert statt als Inline-Styles"
- Ready for Phase 20 or next milestone

---
*Phase: 19-admin-detail-view-redesign*
*Completed: 2026-03-25*
