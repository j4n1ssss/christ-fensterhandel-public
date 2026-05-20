---
phase: 01-fundament
verified: 2026-03-09T17:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Start dev server and verify Payload Admin Panel loads"
    expected: "npm run dev starts, http://localhost:3000/admin shows login/create-user"
    why_human: "Requires running server and browser interaction"
  - test: "Run seed script and verify data in admin"
    expected: "npx payload run src/seed/index.ts completes, all collections show correct data"
    why_human: "Requires database connection and visual inspection"
  - test: "Test Anfragen status workflow creates StatusHistorie"
    expected: "Create Anfrage, change status, see new entry in StatusHistorie"
    why_human: "Requires runtime hook execution and admin UI interaction"
---

# Phase 1: Fundament Verification Report

**Phase Goal:** Next.js + Payload CMS Projekt-Setup mit PostgreSQL, allen 19 CMS-Collections (7 Produkte + 8 Ausstattung + 4 Business) und Seed-Daten
**Verified:** 2026-03-09T17:00:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Next.js + Payload CMS project is set up with PostgreSQL | VERIFIED | `src/payload.config.ts` uses `postgresAdapter` with `idType: 'uuid'`, `.env` has `DATABASE_URL=postgresql://...` |
| 2 | All 7 Produkt-collections exist with correct fields and relationships | VERIFIED | 7 files in `src/collections/produkte/`, all imported in `payload.config.ts`, Profile has `technische_daten` + `masse` groups, Fensterformen has `erlaubte_fluegelanzahl` + `erlaubte_oeffnungsarten` |
| 3 | All 8 Ausstattung-collections exist with correct fields | VERIFIED | 8 files in `src/collections/ausstattung/`, Farben has `kategorie` select (4 options), `fuer_aussen`/`fuer_innen`, `erlaubte_materialien` relationship |
| 4 | All 4 Business-collections exist with correct fields | VERIFIED | 4 files in `src/collections/business/`, Anfragen has 7-step status select, StatusHistorie has immutable access control |
| 5 | Anfragen beforeChange hook creates StatusHistorie on status change | VERIFIED | `anfragen.ts` lines 15-36: hook checks `originalDoc.status !== data.status`, calls `req.payload.create` on `status_historie` |
| 6 | StatusHistorie is immutable (no update/delete) | VERIFIED | `status-historie.ts` lines 13-18: `update: () => false, delete: () => false` |
| 7 | Seed script exists with realistic Drutex data for all collections | VERIFIED | `src/seed/index.ts` (198 lines) imports 16 data files, phased seeding with dependency resolution. Profile data has 4 Drutex profiles (Iglo 5/Energy/Energy Classic/Light), Farben has 12 colors across 4 categories |
| 8 | TypeScript strict mode is configured | VERIFIED | `tsconfig.json` line 11: `"strict": true` |
| 9 | Tailwind CSS + Shadcn UI initialized | VERIFIED | `tailwind.config.ts` exists, `components.json` exists with proper aliases, `src/lib/utils.ts` provides `cn()` |
| 10 | All 21 collections registered in payload.config.ts | VERIFIED | 21 import statements counted, collections array has all 21 entries organized by group comments |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/payload.config.ts` | Payload config with PostgreSQL | VERIFIED | postgresAdapter, UUID IDs, 21 collections, lexicalEditor |
| `src/collections/system/users.ts` | Users with auth | VERIFIED | Exists, exported |
| `src/collections/system/media.ts` | Media with uploads | VERIFIED | Exists, exported |
| `src/collections/produkte/produkttypen.ts` | Produkttypen collection | VERIFIED | name, slug, erlaubte_materialien, admin.group: 'Produkte' |
| `src/collections/produkte/materialien.ts` | Materialien collection | VERIFIED | Exists with erlaubte_profile relationship |
| `src/collections/produkte/profile.ts` | Profile with tech data | VERIFIED | technische_daten group (uw_wert, kammern, bautiefe_mm, dichtungen), masse group (min/max breite/hoehe), material relationship |
| `src/collections/produkte/fluegelanzahl.ts` | Fluegelanzahl collection | VERIFIED | Exists with fuer_produkttypen relationship |
| `src/collections/produkte/zusatzlichter.ts` | Zusatzlichter collection | VERIFIED | Exists with kombinierbar_mit relationship |
| `src/collections/produkte/oeffnungsarten.ts` | Oeffnungsarten collection | VERIFIED | Exists with fuer_fenster/fuer_balkontuer |
| `src/collections/produkte/fensterformen.ts` | Fensterformen collection | VERIFIED | erlaubte_fluegelanzahl (hasMany) + erlaubte_oeffnungsarten (hasMany) |
| `src/collections/ausstattung/farben.ts` | Farben with categories | VERIFIED | kategorie select (standard/dekor/uni/ral_sonderfarbe), erlaubte_materialien, fuer_aussen/fuer_innen |
| `src/collections/ausstattung/dichtungsfarben.ts` | Dichtungsfarben | VERIFIED | Exists |
| `src/collections/ausstattung/verglasungen.ts` | Verglasungen with Ug-Wert | VERIFIED | Exists |
| `src/collections/ausstattung/schallschutz.ts` | Schallschutz | VERIFIED | Exists |
| `src/collections/ausstattung/sicherheitsglas.ts` | Sicherheitsglas | VERIFIED | Exists |
| `src/collections/ausstattung/glasdekore.ts` | Glasdekore | VERIFIED | Exists |
| `src/collections/ausstattung/sprossen.ts` | Sprossen | VERIFIED | Exists |
| `src/collections/ausstattung/extras.ts` | Extras (Griffe/Beschlaege) | VERIFIED | Exists with kategorie select |
| `src/collections/business/preisregeln.ts` | Preisregeln | VERIFIED | produkttyp/material/profil relationships, grundpreis_pro_m2 |
| `src/collections/business/rabattcodes.ts` | Rabattcodes | VERIFIED | Exists |
| `src/collections/business/anfragen.ts` | Anfragen with workflow | VERIFIED | 7-step status, beforeChange hook, produkte array, kontaktdaten group |
| `src/collections/business/status-historie.ts` | Immutable audit trail | VERIFIED | access: update false, delete false |
| `src/seed/index.ts` | Seed orchestrator | VERIFIED | 198 lines, 3-phase seeding, 16 data imports |
| `src/seed/data/profile.ts` | Drutex profiles | VERIFIED | 4 profiles: Iglo 5, Iglo Energy, Iglo Energy Classic, Iglo Light with correct tech specs |
| `.env` | Database URL | VERIFIED | DATABASE_URL points to PostgreSQL |
| `tailwind.config.ts` | Tailwind config | VERIFIED | Content paths configured |
| `components.json` | Shadcn UI config | VERIFIED | RSC enabled, CSS variables, correct aliases |
| `tsconfig.json` | TypeScript strict | VERIFIED | strict: true, @/* path alias |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `payload.config.ts` | PostgreSQL | `postgresAdapter` with `DATABASE_URL` | WIRED | Line 79: `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })` |
| `payload.config.ts` | `collections/system/users.ts` | import | WIRED | Line 9: `import { Users } from './collections/system/users'` |
| `payload.config.ts` | All 7 Produkt collections | imports | WIRED | Lines 13-19: all 7 imported and in collections array |
| `payload.config.ts` | All 8 Ausstattung collections | imports | WIRED | Lines 28-35: all 8 imported and in collections array |
| `payload.config.ts` | All 4 Business collections | imports | WIRED | Lines 22-25: all 4 imported and in collections array |
| `profile.ts` | `materialien` | relationship field | WIRED | Line 114: `relationTo: 'materialien'` |
| `fensterformen.ts` | `fluegelanzahl` | relationship field | WIRED | Line 45: `relationTo: 'fluegelanzahl', hasMany: true` |
| `fensterformen.ts` | `oeffnungsarten` | relationship field | WIRED | Line 52: `relationTo: 'oeffnungsarten', hasMany: true` |
| `farben.ts` | `materialien` | relationship field | WIRED | Line 74: `relationTo: 'materialien', hasMany: true` |
| `anfragen.ts` | `status_historie` | beforeChange hook | WIRED | Lines 23-31: `req.payload.create({ collection: 'status_historie', ... })` |
| `preisregeln.ts` | `produkttypen` | relationship | WIRED | Line 24: `relationTo: 'produkttypen'` |
| `seed/index.ts` | `seed/data/*.ts` | imports | WIRED | Lines 6-21: all 16 data files imported |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-----------|-------------|--------|----------|
| SETUP-01 | 01-01 | Next.js App Router + Payload CMS 3.0 + PostgreSQL | SATISFIED | payload.config.ts with postgresAdapter, .env with DATABASE_URL |
| SETUP-02 | 01-01 | Tailwind CSS + Shadcn UI | SATISFIED | tailwind.config.ts, components.json, globals.css |
| SETUP-03 | 01-01 | TypeScript strict, ESLint, Ordnerstruktur | SATISFIED | tsconfig.json strict:true, eslint.config.mjs exists, organized collections dirs |
| CMS-01 | 01-02 | Collection produkttypen | SATISFIED | src/collections/produkte/produkttypen.ts with slug, bild, erlaubte_materialien |
| CMS-02 | 01-02 | Collection materialien | SATISFIED | src/collections/produkte/materialien.ts with lieferzeit, garantie, erlaubte_profile |
| CMS-03 | 01-02 | Collection profile | SATISFIED | Profile with Uw-Wert, Kammern, Bautiefe, Min/Max Masse, material relationship |
| CMS-04 | 01-02 | Collection fluegelanzahl | SATISFIED | fluegelanzahl.ts with fuer_produkttypen relationship |
| CMS-05 | 01-02 | Collection zusatzlichter | SATISFIED | zusatzlichter.ts with kombinierbar_mit relationship |
| CMS-06 | 01-02 | Collection oeffnungsarten | SATISFIED | oeffnungsarten.ts with fuer_fenster/fuer_balkontuer checkboxes |
| CMS-07 | 01-02 | Collection fensterformen | SATISFIED | fensterformen.ts with erlaubte_fluegelanzahl/oeffnungsarten |
| CMS-08 | 01-03 | Collection farben | SATISFIED | farben.ts with kategorie, RAL-Code, fuer_aussen/innen, erlaubte_materialien |
| CMS-09 | 01-03 | Collection dichtungsfarben | SATISFIED | dichtungsfarben.ts exists |
| CMS-10 | 01-03 | Collection verglasungen | SATISFIED | verglasungen.ts with ug_wert, aufpreis |
| CMS-11 | 01-03 | Collections schallschutz, sicherheitsglas, glasdekore, sprossen, extras | SATISFIED | All 5 files exist with correct fields |
| CMS-12 | 01-04 | Collection preisregeln | SATISFIED | preisregeln.ts with produkttyp/material/profil + grundpreis_pro_m2 |
| CMS-13 | 01-04 | Collection rabattcodes | SATISFIED | rabattcodes.ts with code, typ, gueltigkeit, min_bestellwert |
| CMS-14 | 01-04 | Collection anfragen | SATISFIED | anfragen.ts with 7-step status, produkte array, kontaktdaten, snapshot |
| CMS-15 | 01-04 | Collection status_historie (immutable) | SATISFIED | status-historie.ts with update:false, delete:false |
| CMS-16 | 01-04 | Konditionale API-Filterung | SATISFIED | Relationship fields enable filtering (profile.material -> materialien), seed script resolves cross-references |
| CMS-17 | 01-04 | Seed-Script mit Drutex Testdaten | SATISFIED | src/seed/index.ts + 16 data files, 684 lines of seed data total |

**Orphaned requirements:** None. All 20 requirement IDs (SETUP-01..03, CMS-01..17) from REQUIREMENTS.md Phase 1 are claimed by plans and verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| - | - | No TODO/FIXME/PLACEHOLDER found | - | - |
| - | - | No empty implementations found | - | - |
| - | - | No stub patterns detected | - | - |

Zero anti-patterns detected across all source files.

### Human Verification Required

### 1. Dev Server and Admin Panel

**Test:** Run `npm run dev`, open http://localhost:3000/admin
**Expected:** Payload Admin Panel loads with user creation prompt or login. Sidebar shows 4 groups: Produkte (7), Ausstattung (8), Business (4), System (2)
**Why human:** Requires running server, database connection, and browser

### 2. Seed Script Execution

**Test:** Run `npx payload run src/seed/index.ts`
**Expected:** Script completes with exit code 0, all collections populated. Profile shows 4 Drutex profiles (Iglo 5, Iglo Energy, Iglo Energy Classic, Iglo Light). Farben shows 12 colors in 4 categories.
**Why human:** Requires database connection and runtime execution

### 3. Status Workflow Audit Trail

**Test:** Create an Anfrage in admin, change its status from "Neu" to "In Bearbeitung"
**Expected:** A new StatusHistorie entry is automatically created with von_status "neu", zu_status "in_bearbeitung", and current timestamp. StatusHistorie entries cannot be edited or deleted.
**Why human:** Requires runtime hook execution and admin UI interaction

### Gaps Summary

No gaps found. All 20 requirements are satisfied by implemented, substantive, and wired artifacts. The phase goal of "Next.js + Payload CMS Projekt-Setup mit PostgreSQL, allen 19 CMS-Collections (7 Produkte + 8 Ausstattung + 4 Business) und Seed-Daten" is fully achieved at the code level.

Note: The actual count is 21 collections (19 domain + 2 system: Users, Media), which matches the payload.config.ts registration. The phase goal stated "19 CMS-Collections" referring to the domain collections; the 2 system collections (Users, Media) were part of the base setup.

Human verification items remain for runtime behavior (server startup, seed execution, hook execution) which cannot be verified through static code analysis alone. Per SUMMARY 01-04, the user has already approved these items during the human-verify checkpoint.

---

_Verified: 2026-03-09T17:00:00Z_
_Verifier: Claude (gsd-verifier)_
