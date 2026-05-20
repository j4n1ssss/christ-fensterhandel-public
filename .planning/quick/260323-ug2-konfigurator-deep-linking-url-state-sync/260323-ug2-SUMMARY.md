---
phase: quick
plan: 260323-ug2
subsystem: ui
tags: [nuqs, zustand, url-state, deep-linking, konfigurator]

# Dependency graph
requires:
  - phase: 05-konfigurator-engine
    provides: "Zustand store with KonfiguratorSelections, CMS data loading, step navigation"
provides:
  - "Full bidirectional URL-state sync for all 18+ konfigurator selection fields"
  - "Slug-to-ID and ID-to-slug resolution helpers for CMS collections"
  - "Custom oeffnungsarten URL parser (pipe+colon WingOpening[] serialization)"
  - "Deep-link URL detection that bypasses localStorage restore dialog"
affects: [konfigurator, sharing, bookmarks]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Two-phase URL sync (Store->URL continuous, URL->Store once after CMS)", "Custom nuqs createParser for complex array types", "isUrlSeeding ref for infinite-loop prevention"]

key-files:
  created: []
  modified:
    - src/lib/konfigurator/url-state.ts
    - src/app/(frontend)/konfigurator/fenster/page.tsx

key-decisions:
  - "URL uses human-readable slugs (not UUIDs) for shareability"
  - "Pipe+colon encoding for oeffnungsarten WingOpening[] (dreh-kipp:links|kipp:rechts)"
  - "gleichWieAussen=false omitted from URL to keep URLs clean"
  - "Deep-linked URLs skip restore dialog -- URL intent overrides localStorage"

patterns-established:
  - "Two-phase URL sync: Phase A (Store->URL) runs on every store change, Phase B (URL->Store) runs once after CMS data loads"
  - "Custom nuqs parser with createParser for complex types that need custom serialize/parse"
  - "SLUG_FIELDS and SLUG_ARRAY_FIELDS mapping tables for extensible field configuration"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-23
---

# Quick Task 260323-ug2: Konfigurator Deep Linking / URL State Sync Summary

**Full bidirectional URL-state sync for all 18+ konfigurator selections using nuqs slug parsers with CMS-data-aware timing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-23T21:00:07Z
- **Completed:** 2026-03-23T21:03:19Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- All KonfiguratorSelections fields (produkttyp, material, profil, fluegelanzahl, zusatzlichter, oeffnungsarten, fensterform, masse, farben, dichtungsfarbe, gleichWieAussen, verglasung, schallschutz, sicherheitsglas, glasdekor, sprossen, extras) are represented in URL query parameters using human-readable slugs
- Two-phase sync ensures Store->URL updates on every selection change and URL->Store seeds store on mount after CMS data loads
- Deep-linked URLs with selection params skip the localStorage restore dialog and load CMS data immediately
- Custom oeffnungsarten parser handles complex WingOpening[] serialization (pipe-separated wings, colon-separated art:griff)

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand URL parsers and implement slug-ID resolution utilities** - `09e0c93` (feat)
2. **Task 2: Fix page integration timing -- deep-linked URLs skip restore dialog** - `9e91103` (feat)

## Files Created/Modified
- `src/lib/konfigurator/url-state.ts` - Complete rewrite: 20+ URL parsers, slugToId/idToSlug helpers, SLUG_FIELDS mapping, two-phase bidirectional sync hook with infinite-loop protection
- `src/app/(frontend)/konfigurator/fenster/page.tsx` - Added URL selection detection to skip restore dialog for deep-linked URLs

## Decisions Made
- URL uses human-readable slugs (not UUIDs) for shareability and readability
- Pipe+colon encoding for oeffnungsarten WingOpening[]: `dreh-kipp:links|kipp:rechts|fest` format
- gleichWieAussen=false is omitted from URL (only `true` is set) to keep URLs clean
- Deep-linked URLs always override localStorage restore dialog -- URL intent is explicit

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- URL deep-linking is fully operational for the fenster konfigurator
- Sharing URLs and browser back/forward will preserve complete configuration state
- The pattern (SLUG_FIELDS, SLUG_ARRAY_FIELDS) is extensible for future konfigurator types (Tueren, Rolllaeden)

## Self-Check: PASSED

- [x] src/lib/konfigurator/url-state.ts exists (402 lines, min_lines: 100 satisfied)
- [x] src/app/(frontend)/konfigurator/fenster/page.tsx exists
- [x] Commit 09e0c93 exists (Task 1)
- [x] Commit 9e91103 exists (Task 2)
- [x] TypeScript compiles without errors in modified files
- [x] konfiguratorParsers covers all 20+ URL params
- [x] slugToId and idToSlug helpers implemented
- [x] Two-phase sync with isUrlSeeding infinite-loop protection
- [x] Deep-linked URLs skip restore dialog

---
*Quick Task: 260323-ug2*
*Completed: 2026-03-23*
