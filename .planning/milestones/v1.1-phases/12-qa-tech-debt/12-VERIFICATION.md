---
phase: 12-qa-tech-debt
verified: 2026-03-22T14:00:00Z
status: human_needed
score: 11/12 must-haves verified
re_verification: false
human_verification:
  - test: "Open http://localhost:3000/admin/collections/profile after running npm run dev"
    expected: "A 'Hub-Status' column is visible in the Profile list table. Profiles with all 5 required Hub fields populated show a green badge labeled 'Vollstaendig'. Profiles with any missing field show an orange badge labeled 'Unvollstaendig'. Hovering over the orange badge shows a tooltip listing the missing field names (e.g. 'Fehlend: erlaubte_farben'). A toggle button 'Nur unvollstaendige anzeigen' is visible above or near the list table and filters the list when activated."
    why_human: "Payload Admin custom Cell and filter components only render when the Payload import map is built and the dev server serves the admin bundle. The UI registration path strings and component file both exist but correct rendering requires a live browser session."
---

# Phase 12: QA Tech Debt Verification Report

**Phase Goal:** QA sweep and tech debt cleanup -- fix TypeScript type generation typos, add Hub-Status badge to Profile list view, document versions:drafts decision, verify DEBT-04/DEBT-05 completeness.
**Verified:** 2026-03-22T14:00:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `generate:types` produces `Fensterform` and `Sicherheitsglas` interface names (no truncated names) | VERIFIED | `src/collections/produkte/fensterformen.ts` line 10-12: `typescript: { interface: "Fensterform" }`. `src/collections/ausstattung/sicherheitsglas.ts` line 10-12: `typescript: { interface: "Sicherheitsglas" }`. `src/payload-types.ts` line 363: `export interface Fensterform`, line 494: `export interface Sicherheitsglas`. |
| 2 | No truncated type names remain in `src/payload-types.ts` (full audit) | VERIFIED | `grep` for `Fensterforman` and `Sicherheitsgla[^s]` in payload-types.ts returns zero matches. Summary states 28+ interfaces audited; no additional truncated names found. |
| 3 | All consuming files import renamed types (`Fensterform`, `Sicherheitsglas`) | VERIFIED | `src/lib/konfigurator/types.ts` lines 8,13: imports `Fensterform`, `Sicherheitsglas`. `src/lib/konfigurator/filters.ts` lines 6,11: same. `step-form.tsx` and `step-verglasung-extras.tsx` updated. Tests updated. Zero occurrences of `Fensterforman` or `Sicherheitsgla[^s]` found across `src/` and `tests/`. |
| 4 | Admin sees Hub-Status badge column in Profile list view (green/orange) | NEEDS HUMAN | All code artifacts exist and are wired. Visual rendering requires live admin session. |
| 5 | `ProfileHubStatusCell` uses `REQUIRED_HUB_FIELDS` from `hub-fields.ts` (client-safe single source of truth) | VERIFIED | `src/components/admin/profile-hub-status-cell.tsx` line 3: `import { REQUIRED_HUB_FIELDS } from "@/lib/hub-fields"`. `src/lib/hub-fields.ts` exports the 5 required fields as `const`. |
| 6 | Hub-Status `ui` field is registered in `profile.ts` with Cell component and included in `defaultColumns` | VERIFIED | `profile.ts` line 382-388: field `hub_status` type `ui` with `Cell: "@/components/admin/profile-hub-status-cell#ProfileHubStatusCell"`. Line 36: `defaultColumns: ["name_technisch", "material", "hub_status", "aktiv"]`. |
| 7 | Filter component (`ProfileHubStatusFilter`) is registered in `profile.ts` admin config | VERIFIED | `profile.ts` line 39: `"@/components/admin/profile-hub-status-filter#ProfileHubStatusFilter"` in `admin.components`. |
| 8 | ADR documents why `versions:drafts` is NOT enabled in v1.1 | VERIFIED | `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` exists, contains sections: Kontext, Entscheidung, Begruendung, Konsequenzen, Alternativen betrachtet. Status: Accepted. |
| 9 | Inline comment in `profile.ts` references the versions decision | VERIFIED | `profile.ts` line 2: `* ENTSCHEIDUNG: Kein versions:drafts in v1.1` with reference to the ADR path. |
| 10 | `REQUIREMENTS.md` Out-of-Scope entry has expanded reasoning with ADR reference | VERIFIED | Line 244 in REQUIREMENTS.md: `ADR: docs/entscheidungen/001. Deferred to v1.2 (VRSN-01 mit Pre-Migration).` |
| 11 | DEBT-04 verified: `dichtungsfarben` filtered via Hub in `filters.ts` | VERIFIED | `src/lib/konfigurator/filters.ts` lines 204-206: `getHubField<Dichtungsfarben>(selectedProfil, "erlaubte_dichtungsfarben", ...)`. |
| 12 | DEBT-05 verified: all 13 Hub fields have `filterOptions: { aktiv: { equals: true } }` | VERIFIED | `grep -c "filterOptions: { aktiv: { equals: true } }" src/collections/produkte/profile.ts` returns 13. |

**Score:** 11/12 truths verified (1 needs human visual confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/collections/produkte/fensterformen.ts` | `typescript.interface: "Fensterform"` override | VERIFIED | Lines 10-12 present |
| `src/collections/ausstattung/sicherheitsglas.ts` | `typescript.interface: "Sicherheitsglas"` override | VERIFIED | Lines 10-12 present |
| `src/payload-types.ts` | Clean interface names | VERIFIED | `export interface Fensterform` at line 363, `export interface Sicherheitsglas` at line 494 |
| `src/components/admin/profile-hub-status-cell.tsx` | ProfileHubStatusCell with green/orange badge | VERIFIED | 40 lines, `"use client"`, imports `REQUIRED_HUB_FIELDS` from `hub-fields`, renders badge with tooltip |
| `src/components/admin/profile-hub-status-filter.tsx` | ProfileHubStatusFilter toggle | VERIFIED | 55 lines, `"use client"`, uses `useListQuery` from `@payloadcms/ui`, builds `OR` where-clause |
| `src/lib/hub-fields.ts` | Client-safe REQUIRED_HUB_FIELDS constant | VERIFIED | 23 lines, exports 5 required + 8 optional fields, no server-only imports |
| `src/components/admin/tooltip.tsx` | Reusable Tooltip component | VERIFIED | File exists (created as deviation from plan, per user request during checkpoint) |
| `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` | ADR for versions:drafts decision | VERIFIED | Full ADR with all required sections, Status: Accepted |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/konfigurator/types.ts` | `src/payload-types.ts` | `import type { Fensterform }` | WIRED | Line 8: `Fensterform,` -- not `Fensterforman` |
| `src/lib/konfigurator/filters.ts` | `src/payload-types.ts` | `import type { Fensterform }` | WIRED | Line 6: `Fensterform,` -- not `Fensterforman` |
| `src/collections/produkte/profile.ts` | `src/components/admin/profile-hub-status-cell.tsx` | Payload string-path `Cell` registration | WIRED | Line 387: `"@/components/admin/profile-hub-status-cell#ProfileHubStatusCell"` |
| `src/components/admin/profile-hub-status-cell.tsx` | `src/lib/hub-fields.ts` | `import REQUIRED_HUB_FIELDS` | WIRED | Line 3: `import { REQUIRED_HUB_FIELDS } from "@/lib/hub-fields"` (not validate-hub-fields -- client-safe) |
| `src/collections/produkte/profile.ts` | `src/components/admin/profile-hub-status-filter.tsx` | Payload admin.components registration | WIRED | Line 39: `"@/components/admin/profile-hub-status-filter#ProfileHubStatusFilter"` |
| `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` | `.planning/REQUIREMENTS.md` | Cross-reference via `VRSN-01` | WIRED | REQUIREMENTS.md Out-of-Scope row references `docs/entscheidungen/001` and `VRSN-01` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DEBT-03 | 12-01-PLAN.md | Fix truncated Fensterforman/Sicherheitsgla type names via typescript.interface override | SATISFIED | `fensterformen.ts` and `sicherheitsglas.ts` have overrides; `payload-types.ts` contains clean interface names; zero old names in codebase |
| HUB-05 | 12-02-PLAN.md | Admin sees warning/badge when Hub fields of a Profile are empty | SATISFIED (code) / NEEDS HUMAN (visual) | `ProfileHubStatusCell` wired to `profile.ts` hub_status ui field; visual render needs browser confirmation |
| DEBT-04 | 12-03-PLAN.md | dichtungsfarben filtered via `erlaubte_dichtungsfarben` Hub field | SATISFIED | `filters.ts` line 204-206: `getHubField<Dichtungsfarben>(..., "erlaubte_dichtungsfarben", ...)` |
| DEBT-05 | 12-03-PLAN.md | All 13 Hub fields have `filterOptions: { aktiv: { equals: true } }` | SATISFIED | `grep -c` returns exactly 13 in `profile.ts` |
| DEBT-06 | 12-03-PLAN.md | versions:drafts decision documented | SATISFIED | ADR exists, inline comment in profile.ts, REQUIREMENTS.md updated |

No orphaned requirements found. All 5 Phase 12 requirement IDs (HUB-05, DEBT-03, DEBT-04, DEBT-05, DEBT-06) are claimed by plans 12-01, 12-02, and 12-03 respectively, and all are marked `[x]` Complete in REQUIREMENTS.md with traceability entries showing Phase 12.

### Anti-Patterns Found

No anti-patterns detected in Phase 12 modified files. No TODO/FIXME/placeholder comments. No empty return stubs. No console-log-only implementations.

One notable deviation from the original plan (not an anti-pattern): `profile-hub-status-cell.tsx` imports from `@/lib/hub-fields` instead of `@/scripts/validate-hub-fields` as originally specified. This is a correct improvement -- `validate-hub-fields.ts` uses the Node `fs` module which would break client-side bundling. The cell correctly imports from the extracted client-safe `hub-fields.ts`.

### Human Verification Required

#### 1. Hub-Status Badge and Filter Visual QA

**Test:** Run `npm run dev`, open http://localhost:3000/admin/collections/profile in a browser.

**Expected:**
- A "Hub-Status" column appears in the Profile list table
- Profiles with all 5 required Hub fields (`erlaubte_fluegelanzahl`, `erlaubte_oeffnungsarten`, `erlaubte_fensterformen`, `erlaubte_farben`, `erlaubte_verglasungen`) populated show a green badge labeled "Vollstaendig"
- Profiles with any empty required Hub field show an orange badge labeled "Unvollstaendig"
- Hovering over an orange badge shows a styled tooltip with text "Fehlend: {field names}"
- A button "Nur unvollstaendige anzeigen" is visible near the list table; clicking it filters the list to only incomplete profiles; clicking again restores all profiles
- If the column is not visible, use the column visibility toggle (gear icon) to enable "hub_status"

**Why human:** Payload Admin custom Cell and filter components are resolved at runtime through Payload's import map. The component file, string-path registration, and import map generation have all been executed, but correct rendering in the browser bundle (including Payload's client-side React tree, CSS isolation, and table rendering) can only be confirmed visually.

### Gaps Summary

No gaps found for automated checks. Phase 12 goal is substantively achieved:

- DEBT-03: Type generation typos fixed at source (`typescript.interface` overrides in collection configs), cascaded through all 6 consuming files, zero old names remain in codebase, commits `28e93da` and `63f70e1` verified in git history.
- HUB-05: All code for the badge feature is present, substantive, and wired. One truth (visual rendering) requires human confirmation in the running admin panel.
- DEBT-04: dichtungsfarben Hub-filtering confirmed present in `filters.ts` (Phase 9 work verified).
- DEBT-05: Exactly 13 Hub relationship fields have `filterOptions: { aktiv: { equals: true } }` in `profile.ts`.
- DEBT-06: ADR at `docs/entscheidungen/001_2026-03-20_keine-versions-drafts-v11.md` is complete and cross-referenced in both `profile.ts` and `REQUIREMENTS.md`.

---

_Verified: 2026-03-22T14:00:00Z_
_Verifier: Claude (gsd-verifier)_
