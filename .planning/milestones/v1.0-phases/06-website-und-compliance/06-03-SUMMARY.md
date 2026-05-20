---
phase: 06-website-und-compliance
plan: 03
subsystem: ui
tags: [puck, viewports, i18n, locale, next.js, payload-cms]

requires:
  - phase: 06-website-und-compliance
    provides: "Puck Editor plugin, i18n routing, Navigation/Footer globals"
provides:
  - "Puck Editor with viewport breakpoint toggle (Mobile/Tablet/Desktop)"
  - "Dynamic html lang attribute based on URL locale"
  - "Locale-aware Navigation and Footer global queries"
affects: []

tech-stack:
  added: []
  patterns:
    - "Custom admin view RSC overrides plugin views at same path"
    - "Middleware x-pathname header for locale detection in layouts"
    - "findGlobal with locale + fallbackLocale for localized globals"

key-files:
  created:
    - src/components/admin/puck-editor-wrapper.tsx
  modified:
    - src/payload.config.ts
    - src/middleware.ts
    - src/app/(frontend)/layout.tsx
    - src/lib/puck-config.ts

key-decisions:
  - "Custom RSC view wrapper instead of patch-package for enableViewports"
  - "Inlined mapPayloadFieldsToRootProps since plugin does not publicly export it"
  - "x-pathname header set on ALL middleware paths (not just locale routes) for consistency"

patterns-established:
  - "Admin view override: register at same path in config.admin.components.views to override plugin views"
  - "Locale detection: middleware sets x-pathname, layout reads via headers() and regex match"

requirements-completed: [WEB-03, I18N-02, I18N-03]

duration: 3min
completed: 2026-03-10
---

# Phase 6 Plan 3: Gap Closure Summary

**Puck Editor viewport breakpoints wired via custom RSC view override, dynamic html lang from URL locale, and locale-aware Navigation/Footer global queries**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T10:57:58Z
- **Completed:** 2026-03-10T11:01:21Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Puck Editor now shows Mobile/Tablet/Desktop breakpoint toggle via enableViewports={true}
- html lang attribute dynamically set based on URL locale (/de/ = "de", /en/ = "en")
- Navigation and Footer globals return locale-specific content matching URL language
- Removed orphaned puckViewports export from puck-config.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Puck Editor viewport breakpoints (WEB-03 BLOCKER)** - `e5f4d65` (feat)
2. **Task 2: Dynamic html lang and locale-aware global queries** - `47ab20f` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/components/admin/puck-editor-wrapper.tsx` - Custom RSC view wrapping PuckEditor with enableViewports={true}
- `src/payload.config.ts` - Registered puckEditorWithViewports view at /puck-editor/:segments*
- `src/middleware.ts` - All code paths now set x-pathname header for locale detection
- `src/app/(frontend)/layout.tsx` - Dynamic lang={locale}, locale-aware findGlobal calls
- `src/lib/puck-config.ts` - Removed orphaned puckViewports export

## Decisions Made
- Used custom RSC admin view wrapper instead of patch-package to add enableViewports. Cleaner, survives npm updates, follows Payload's view override pattern.
- Inlined mapPayloadFieldsToRootProps function because the plugin does not export it from a public entry point. Only maps core fields (title, slug, isHomepage, etc.).
- Set x-pathname header on ALL middleware code paths (static files, skip-prefix routes, locale routes) for consistent locale detection in layout.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] mapPayloadFieldsToRootProps not publicly exported**
- **Found during:** Task 1 (Puck Editor wrapper)
- **Issue:** Import `@delmaredigital/payload-puck/api/utils/mapRootProps` fails because it is not in the package exports map
- **Fix:** Inlined the essential logic with a simplified field mapping array
- **Files modified:** src/components/admin/puck-editor-wrapper.tsx
- **Verification:** File compiles without import errors
- **Committed in:** e5f4d65

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix was necessary to avoid broken import. Inlined function is equivalent to the original for this project's use case. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 verification gaps are now fully closed (all 3 gaps addressed)
- All 16/16 truths should now verify as VERIFIED
- Ready for Phase 7 or final verification

---
*Phase: 06-website-und-compliance*
*Completed: 2026-03-10*
