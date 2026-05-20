---
phase: 01-fundament
plan: 04
subsystem: database
tags: [payload-cms, postgres, seed-data, collections, drutex, business-logic]

# Dependency graph
requires:
  - phase: 01-fundament (01-02)
    provides: Produkt-Collections (produkttypen, materialien, profile, fluegelanzahl, oeffnungsarten, fensterformen, zusatzlichter)
  - phase: 01-fundament (01-03)
    provides: Ausstattungs-Collections (farben, dichtungsfarben, verglasungen, schallschutz, sicherheitsglas, glasdekore, sprossen, extras)
provides:
  - 4 Business collections (Preisregeln, Rabattcodes, Anfragen, StatusHistorie)
  - Anfragen status workflow with immutable audit trail
  - Complete seed script populating all 15+ collections with Drutex data
  - Conditional filtering via relationship fields
affects: [phase-2-konfigurator, phase-3-kauffluss, phase-4-dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns: [beforeChange-hook-for-audit-trail, immutable-collection-access-control, phased-seed-with-dependency-resolution, top-level-await-for-payload-run]

key-files:
  created:
    - src/collections/business/preisregeln.ts
    - src/collections/business/rabattcodes.ts
    - src/collections/business/anfragen.ts
    - src/collections/business/status-historie.ts
    - src/seed/index.ts
    - src/seed/utils.ts
    - src/seed/data/produkttypen.ts
    - src/seed/data/materialien.ts
    - src/seed/data/profile.ts
    - src/seed/data/fluegelanzahl.ts
    - src/seed/data/oeffnungsarten.ts
    - src/seed/data/fensterformen.ts
    - src/seed/data/zusatzlichter.ts
    - src/seed/data/farben.ts
    - src/seed/data/dichtungsfarben.ts
    - src/seed/data/verglasungen.ts
    - src/seed/data/schallschutz.ts
    - src/seed/data/sicherheitsglas.ts
    - src/seed/data/glasdekore.ts
    - src/seed/data/sprossen.ts
    - src/seed/data/extras.ts
    - src/seed/data/preisregeln.ts
  modified:
    - src/payload.config.ts
    - src/payload-types.ts

key-decisions:
  - "StatusHistorie uses immutable access control (update: false, delete: false)"
  - "Seed script uses phased seeding (3 phases) to resolve inter-collection dependencies"
  - "Preisregeln links produkttyp + material + profil for Grundpreis pro m2"

patterns-established:
  - "beforeChange hook pattern: Anfragen hook creates StatusHistorie entry on status change"
  - "Seed utility pattern: findBySlug resolves slugs to IDs, clearCollection handles cleanup"
  - "Top-level await required for npx payload run scripts"

requirements-completed: [CMS-12, CMS-13, CMS-14, CMS-15, CMS-16, CMS-17]

# Metrics
duration: 15min
completed: 2026-03-09
---

# Phase 1 Plan 4: Business-Collections + Seed-Script Summary

**4 Business collections (Preisregeln, Rabattcodes, Anfragen with status workflow, immutable StatusHistorie) plus complete seed script with realistic Drutex data for all 15+ collections**

## Performance

- **Duration:** ~15 min (across checkpoint pause)
- **Started:** 2026-03-09T15:50:00Z
- **Completed:** 2026-03-09T16:17:00Z
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files created/modified:** 24

## Accomplishments
- 4 Business collections created: Preisregeln (price rules by produkttyp/material/profil), Rabattcodes (discount codes with validity), Anfragen (requests with 7-step status workflow), StatusHistorie (immutable audit trail)
- Anfragen beforeChange hook automatically creates StatusHistorie entry when status changes
- Complete seed script with 16 data files covering all collections with realistic Drutex data (Iglo profiles, RAL colors, prices)
- All 21 CMS collections now registered in payload.config.ts across 4 admin groups (Produkte, Ausstattung, Business, System)
- User verified all collections, seed data, and status workflow in Payload Admin Panel

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Business collections** - `a84964c` (feat)
2. **Task 2: Build seed script with Drutex data** - `3e6a864` (feat)
3. **Task 3: Verify complete CMS data model** - No commit (human-verify checkpoint, approved)

**Fix commit:** `ae8bfa4` (fix: top-level await for payload run compatibility)

## Files Created/Modified
- `src/collections/business/preisregeln.ts` - Price rules collection with produkttyp/material/profil relationships
- `src/collections/business/rabattcodes.ts` - Discount codes with validity dates and usage tracking
- `src/collections/business/anfragen.ts` - Request collection with 7-step status workflow and beforeChange hook
- `src/collections/business/status-historie.ts` - Immutable audit trail (update/delete disabled)
- `src/seed/index.ts` - Main seed orchestrator with 3-phase dependency resolution
- `src/seed/utils.ts` - Helpers: findBySlug, clearCollection, clearAllCollections
- `src/seed/data/*.ts` - 16 data files with realistic Drutex seed data
- `src/payload.config.ts` - Registered all 4 Business collections
- `src/payload-types.ts` - Regenerated types

## Decisions Made
- StatusHistorie is fully immutable (access control: update false, delete false) for audit compliance
- Seed script uses 3-phase approach to handle inter-collection dependencies (independent first, then dependent, then cross-dependent)
- Preisregeln stores Grundpreis pro m2 linked to produkttyp + material + profil combination, with optional aufpreis override

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed seed script top-level await for payload run**
- **Found during:** Task 2 verification (seed script execution)
- **Issue:** Seed script wrapped logic in async function with manual call, but `npx payload run` requires top-level await pattern
- **Fix:** Refactored to use top-level await directly instead of wrapping in named function
- **Files modified:** src/seed/index.ts
- **Verification:** `npx payload run src/seed/index.ts` completes successfully
- **Committed in:** ae8bfa4

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for seed script to work with Payload's script runner. No scope creep.

## Issues Encountered
None beyond the seed script top-level await fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 21 CMS collections are complete with relationships, conditional filtering, and realistic seed data
- Phase 1 (Fundament) is fully complete -- ready for Phase 2 (Konfigurator-Pipeline)
- The seed data provides a realistic test environment for building the 10-step configurator
- Preisregeln data enables price calculation in Phase 3

## Self-Check: PASSED

- All key files exist on disk
- All commit hashes verified in git log (a84964c, 3e6a864, ae8bfa4)

---
*Phase: 01-fundament*
*Completed: 2026-03-09*
