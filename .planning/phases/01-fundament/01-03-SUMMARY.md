---
phase: 01-fundament
plan: 03
subsystem: database
tags: [payload-cms, collections, ausstattung, farben, verglasungen, extras]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js + Payload CMS + PostgreSQL running with Users and Media collections"
provides:
  - "8 Ausstattung-group collections: Farben, Dichtungsfarben, Verglasungen, Schallschutz, Sicherheitsglas, Glasdekore, Sprossen, Extras"
  - "Farben collection with kategorie select, fuer_aussen/fuer_innen booleans, erlaubte_materialien relationship"
  - "Extras collection covering Griffe/Beschlaege/Sonstiges as single collection"
affects: [01-04, 02-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [ausstattung-collection-config, select-field-categories, material-relationship-filtering]

key-files:
  created:
    - src/collections/ausstattung/farben.ts
    - src/collections/ausstattung/dichtungsfarben.ts
    - src/collections/ausstattung/verglasungen.ts
    - src/collections/ausstattung/schallschutz.ts
    - src/collections/ausstattung/sicherheitsglas.ts
    - src/collections/ausstattung/glasdekore.ts
    - src/collections/ausstattung/sprossen.ts
    - src/collections/ausstattung/extras.ts
  modified:
    - src/payload.config.ts

key-decisions:
  - "Extras collection covers Griffe, Beschlaege, and Sonstiges via kategorie select (not separate collections)"
  - "Farben uses fuer_aussen/fuer_innen booleans for independent inside/outside color selection in configurator"

patterns-established:
  - "Ausstattung collections follow same pattern: name, slug, beschreibung, aufpreis, aktiv, sortOrder"
  - "Select fields use German labels with snake_case values"

requirements-completed: [CMS-08, CMS-09, CMS-10, CMS-11]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 1 Plan 03: Ausstattungs-Collections Summary

**8 Ausstattung CMS collections for configurator equipment options: Farben with category filtering and material relationships, Verglasungen with Ug-Wert, Extras covering Griffe/Beschlaege**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T13:54:08Z
- **Completed:** 2026-03-09T13:56:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Farben collection with 4-category select (standard/dekor/uni/ral_sonderfarbe), fuer_aussen/fuer_innen booleans, and erlaubte_materialien relationship to filter by material
- 7 additional Ausstattung collections: Dichtungsfarben, Verglasungen (with ug_wert), Schallschutz (with dB class), Sicherheitsglas (with VSG typ select), Glasdekore (with image upload), Sprossen (with typ select), Extras (with kategorie for griffe/beschlaege/sonstiges)
- All 8 collections registered in payload.config.ts under Ausstattung admin group
- TypeScript compiles without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Farben, Dichtungsfarben, and Verglasungen collections** - `e9601b9` (feat)
2. **Task 2: Create Schallschutz, Sicherheitsglas, Glasdekore, Sprossen, Extras and register all** - `2cc72ec` (feat)

## Files Created/Modified
- `src/collections/ausstattung/farben.ts` - Farben with categories, material filtering, aussen/innen booleans
- `src/collections/ausstattung/dichtungsfarben.ts` - Simple dichtungsfarben with farb_code
- `src/collections/ausstattung/verglasungen.ts` - Verglasungen with ug_wert and aufpreis
- `src/collections/ausstattung/schallschutz.ts` - Schallschutz with dB class and aufpreis
- `src/collections/ausstattung/sicherheitsglas.ts` - Sicherheitsglas with VSG typ select
- `src/collections/ausstattung/glasdekore.ts` - Glasdekore with image upload
- `src/collections/ausstattung/sprossen.ts` - Sprossen with typ select (wiener/helima/aufgesetzt)
- `src/collections/ausstattung/extras.ts` - Extras covering griffe/beschlaege/sonstiges
- `src/payload.config.ts` - Added all 8 Ausstattung collection imports and registrations

## Decisions Made
- Extras collection covers Griffe, Beschlaege, and Sonstiges via kategorie select field, as specified by user decision (not separate collections)
- Farben uses fuer_aussen/fuer_innen booleans to independently control which colors appear in aussen vs innen configurator dropdowns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 Ausstattung collections ready for configurator steps 8-9 (Farben, Verglasung/Extras)
- Ready for Plan 01-04 (Business-Collections + Seed-Script)
- Farben.erlaubte_materialien relationship connects to Materialien collection (from 01-02)

## Self-Check: PASSED

All 8 collection files verified present. Both task commits (e9601b9, 2cc72ec) verified in git log.

---
*Phase: 01-fundament*
*Completed: 2026-03-09*
