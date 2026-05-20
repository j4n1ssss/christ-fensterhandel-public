# Phase 12: QA & Tech-Debt - Research

**Researched:** 2026-03-20
**Domain:** Payload CMS 3 Admin Customization, TypeScript Type Generation, QA Validation
**Confidence:** HIGH

## Summary

Phase 12 is the final phase of the v1.1 milestone. It consists of four distinct work streams: (1) implementing an Incomplete-Badge for the Profile list view in the Payload Admin Panel, (2) fixing TypeScript type generation typos caused by Payload's singular-label-to-interface-name derivation, (3) documenting the "no versions/drafts" architecture decision, and (4) a comprehensive QA validation pass across all 32 v1.1 requirements.

The CONTEXT.md confirms that DEBT-04 (dichtungsfarben Hub-filter) and DEBT-05 (filterOptions consistency) are already completed in Phase 9, reducing actual implementation work. The primary technical challenges are the Payload Admin custom Cell component for the Badge (which needs a `ui` field with custom Cell component) and the type rename cascade after fixing collection labels.

**Primary recommendation:** Use Payload's `typescript.interface` property on the fensterformen and sicherheitsglas collections to override generated type names, then use a `ui` field with custom Cell component for the Incomplete-Badge in the Profile list view.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Badge als farbiger Tag in eigener Spalte "Hub-Status" in der Profil-Liste (Admin-Uebersicht)
- Nur Pflicht-Hub-Felder zaehlen als "incomplete" (konsistent mit validate:hub-fields Script aus Phase 9): erlaubte_fluegelanzahl, erlaubte_oeffnungsarten, erlaubte_fensterformen, erlaubte_farben, erlaubte_verglasungen
- Visuell: Gruener Tag "Vollstaendig" vs. oranger/roter Tag "Unvollstaendig"
- Tooltip bei Hover auf "Unvollstaendig" zeigt welche Pflicht-Felder noch leer sind
- Filter-Option in der Profil-Liste: "Nur unvollstaendige anzeigen" (Dropdown oder Toggle)
- KEIN Badge im Edit-View (redundant -- leere Felder direkt sichtbar)
- Collection-Labels anpassen, damit Payload saubere Type-Namen generiert
- ALLE Collections systematisch pruefen, nicht nur die 2 bekannten Typos
- Nach Label-Aenderung: `npm run generate:types` + alle Imports aktualisieren
- Dreifache Dokumentation der "Kein versions:drafts in v1.1" Entscheidung: ADR + Inline-Kommentar + REQUIREMENTS.md
- Voller QA-Check inkl. Regressions-Pruefung mit sofortiger Fehlerbehebung
- DEBT-04 (dichtungsfarben Hub-Filter): Bereits in Phase 9 implementiert -- KEIN Handlungsbedarf
- DEBT-05 (filterOptions konsistent): Bereits auf allen 13 Hub-Feldern gesetzt -- KEIN Handlungsbedarf

### Claude's Discretion
- Payload Admin List-Component Implementierung fuer das Incomplete-Badge (Custom Cell Component)
- Exakte Label-Aenderungen fuer saubere Type-Generierung (Payload Singular/Plural Logik)
- ADR-Format und Detaillierungsgrad
- QA-Bericht Struktur und Checklisten-Format
- Reihenfolge der QA-Pruefungen (Build first, dann funktional)

### Deferred Ideas (OUT OF SCOPE)
- Detailliertes Badge mit Zaehler "3/5 Pflichtfelder" statt binaer -- BADG-01 (v1.2)
- Incomplete-Badge fuer den Edit-View als Banner
- Automatische Hub-Feld-Vorschlaege basierend auf Material/Produkttyp
- PDF-Export des QA-Berichts
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HUB-05 | Admin sieht Warnung/Badge wenn Hub-Felder eines Profils noch leer sind (Incomplete Profile) | UI field with custom Cell component pattern; REQUIRED_HUB_FIELDS from validate-hub-fields.ts reusable; admin.defaultColumns config |
| DEBT-03 | Bei generate:types pruefen ob Fensterforman/Sicherheitsgla Typos korrigiert sind, ggf. Collection Labels anpassen | `typescript.interface` property on CollectionConfig; full import cascade in filters.ts, types.ts, payload-types.ts |
| DEBT-04 | dichtungsfarben Collection wird ueber Hub-Feld erlaubte_dichtungsfarben gefiltert | ALREADY COMPLETE in Phase 9 (filters.ts line 204-213). QA verification only. |
| DEBT-05 | filterOptions { aktiv: { equals: true } } auf allen Hub-Relationship-Feldern konsistent | ALREADY COMPLETE -- all 13 Hub fields verified with filterOptions in profile.ts. QA verification only. |
| DEBT-06 | Versions-Config Entscheidung dokumentieren: KEIN versions:drafts in v1.1 | ADR template + inline comment + REQUIREMENTS.md update |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | CMS with Admin Panel | Existing project stack |
| Next.js | 15.4.11 | App Router framework | Existing project stack |
| React | 19.1.0 | UI framework | Existing project stack |
| @payloadcms/ui | 3.79.0 | Admin Panel hooks and components | Required for custom Cell components |
| lucide-react | 0.577.0 | Icons | Already used in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | (devDep) | TypeScript execution | Running validate:hub-fields, generate:types |
| jest + ts-jest | (devDep) | Test runner | Existing test infrastructure |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| UI field for badge | Virtual field (afterRead hook) | UI field is simpler for display-only computed data; no DB schema change needed |
| typescript.interface | Changing singular labels | typescript.interface is targeted, labels control only type names, no admin UI side effects |

## Architecture Patterns

### Recommended Project Structure (Phase 12 additions)
```
src/
  components/admin/
    profile-hub-status-cell.tsx   # NEW: Custom Cell for Hub-Status column
  collections/
    produkte/fensterformen.ts     # MODIFIED: add typescript.interface
    ausstattung/sicherheitsglas.ts # MODIFIED: add typescript.interface
    produkte/profile.ts           # MODIFIED: add ui field + defaultColumns
  lib/konfigurator/
    filters.ts                    # MODIFIED: update type imports after rename
    types.ts                      # MODIFIED: update type imports after rename
  payload-types.ts                # REGENERATED: clean type names
docs/
  entscheidungen/
    001_2026-03-20_keine-versions-drafts-v11.md  # NEW: ADR
  audits/
    004_2026-03-20_v11-qa-validierung.md         # NEW: QA report
```

### Pattern 1: Payload UI Field with Custom Cell Component (for Hub-Status Badge)

**What:** A `ui` type field in the Profile collection that renders a custom Cell component in the list view. The Cell component reads `rowData` to check which required Hub fields are empty and displays a colored badge.

**When to use:** When you need a computed/virtual column in the admin list view that is not persisted to the database.

**Example:**
```typescript
// In profile.ts collection fields array:
{
  name: "hub_status",
  type: "ui",
  admin: {
    components: {
      // Cell renders in the list view table
      Cell: "@/components/admin/profile-hub-status-cell#ProfileHubStatusCell",
      // Field renders in the edit view (hidden since decision says no badge in edit)
      Field: () => null, // or omit
    },
  },
},

// In profile.ts collection admin config:
admin: {
  // ...existing config
  defaultColumns: ["name_technisch", "material", "hub_status", "aktiv"],
},
```

**Cell Component pattern:**
```typescript
// src/components/admin/profile-hub-status-cell.tsx
"use client";

import type { CellComponentProps } from "payload";

const REQUIRED_HUB_FIELDS = [
  "erlaubte_fluegelanzahl",
  "erlaubte_oeffnungsarten",
  "erlaubte_fensterformen",
  "erlaubte_farben",
  "erlaubte_verglasungen",
] as const;

export function ProfileHubStatusCell({ rowData }: CellComponentProps) {
  const missingFields = REQUIRED_HUB_FIELDS.filter((field) => {
    const value = rowData?.[field];
    return !Array.isArray(value) || value.length === 0;
  });

  const isComplete = missingFields.length === 0;

  return (
    <span
      title={isComplete ? "Alle Pflicht-Hub-Felder befuellt" : `Fehlend: ${missingFields.join(", ")}`}
      style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: isComplete ? "#dcfce7" : "#fed7aa",
        color: isComplete ? "#166534" : "#9a3412",
      }}
    >
      {isComplete ? "Vollstaendig" : "Unvollstaendig"}
    </span>
  );
}
```

**Confidence:** MEDIUM -- The `ui` field approach is well-documented in Payload 3, but `CellComponentProps` specifics for accessing `rowData` (full document data in list view) need validation. The alternative is using `cellData` + fetching, but `rowData` should contain the full document when `enableListViewSelectAPI` is not stripping fields.

### Pattern 2: Payload typescript.interface for Type Name Override

**What:** Payload CMS 3 collections have a `typescript.interface` property that overrides the auto-generated TypeScript interface name. By default, Payload derives the interface name from the singular label, which produces truncated/incorrect names for German words.

**When to use:** When the auto-generated type name from `labels.singular` produces an undesirable TypeScript interface name.

**Example:**
```typescript
// fensterformen.ts -- BEFORE: generates "Fensterforman" from singular "Fensterform"
export const Fensterformen: CollectionConfig = {
  slug: "fensterformen",
  labels: { singular: "Fensterform", plural: "Fensterformen" },
  typescript: {
    interface: "Fensterform",  // Explicit clean name
  },
  // ...
};

// sicherheitsglas.ts -- BEFORE: generates "Sicherheitsgla" from singular "Sicherheitsglas"
export const Sicherheitsglas: CollectionConfig = {
  slug: "sicherheitsglas",
  labels: { singular: "Sicherheitsglas", plural: "Sicherheitsglas" },
  typescript: {
    interface: "Sicherheitsglas",  // Explicit clean name
  },
  // ...
};
```

**Confidence:** HIGH -- Verified via Payload CMS 3 source code at `packages/payload/src/collections/config/types.ts`. The `typescript.interface` property is a string that directly controls the generated interface name.

### Pattern 3: ADR (Architecture Decision Record) Format

**What:** Standard ADR format for documenting the versions/drafts decision.

**When to use:** For significant architecture decisions that need context preservation.

**Example:**
```markdown
# ADR-001: Kein versions:drafts in v1.1

**Status:** Accepted
**Datum:** 2026-03-20
**Kontext:** [Situation description]
**Entscheidung:** [What was decided]
**Begruendung:** [Why]
**Konsequenzen:** [Positive and negative impacts]
**Alternativen betrachtet:** [What else was considered]
```

**Confidence:** HIGH -- Standard pattern, no technical risk.

### Anti-Patterns to Avoid

- **Changing labels.singular to fix types:** Do NOT change "Fensterform" to "Fensterformen" just to fix the type name. The singular label is used throughout the admin UI (e.g., "Create new Fensterform"). Use `typescript.interface` instead.
- **Virtual field with afterRead hook for badge:** Adds complexity and potential performance impact on all reads. A `ui` field with Cell component is purely presentation-layer.
- **Hardcoding field names in badge component:** Import `REQUIRED_HUB_FIELDS` from `validate-hub-fields.ts` to maintain a single source of truth.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type name fix | Custom post-processing of payload-types.ts | `typescript.interface` on collection config | Built-in Payload feature, survives regeneration |
| Hub completeness check | New validation logic in badge component | Import `REQUIRED_HUB_FIELDS` from validate-hub-fields.ts | Already defined, tested, and used by validation script |
| Admin list column | Overriding entire list view | `ui` field + custom Cell component + `defaultColumns` | Payload's built-in mechanism for custom columns |
| ADR format | Custom documentation structure | Standard ADR template | Widely recognized, self-documenting |

**Key insight:** Phase 12 is about connecting existing pieces and verifying correctness -- most building blocks (Hub fields, validation logic, admin component patterns) already exist from Phases 7-11.

## Common Pitfalls

### Pitfall 1: Import Cascade After Type Rename
**What goes wrong:** After adding `typescript.interface` and regenerating types, all files importing the old type names (`Fensterforman`, `Sicherheitsgla`) break with compile errors.
**Why it happens:** The generated `payload-types.ts` will use the new interface names, but existing code still imports the old names.
**How to avoid:** After `npm run generate:types`, immediately run `npx tsc --noEmit` to find all broken imports. Update systematically: `filters.ts`, `types.ts`, any Step components that import these types, and test files.
**Warning signs:** TypeScript errors mentioning "Cannot find name 'Fensterforman'" or "Cannot find name 'Sicherheitsgla'".

### Pitfall 2: Payload selectsSelect Interface Names Also Change
**What goes wrong:** The `*Select` interfaces in payload-types.ts (e.g., `FensterformenSelect`) may also change when `typescript.interface` is set. Code using select types breaks.
**Why it happens:** Payload generates both the main interface and the Select interface from the same name source.
**How to avoid:** After regeneration, check the full payload-types.ts diff. The `collectionsSelect` map keys stay slug-based, but the interface names themselves may change. Verify with grep.
**Warning signs:** Compile errors in select-based API calls.

### Pitfall 3: defaultColumns Ignored Due to User Preferences
**What goes wrong:** Setting `admin.defaultColumns` in the collection config has no visible effect.
**Why it happens:** Payload stores per-user column preferences in `payload-preferences`. Once a user has customized columns, `defaultColumns` is overridden by their saved preference.
**How to avoid:** Clear payload-preferences for the profile collection after deploying, or instruct admin to reset column preferences via the column toggle UI.
**Warning signs:** Badge column not visible even though code is correct. Check browser DevTools > Network > preferences API calls.

### Pitfall 4: Cell Component Not Receiving Full Document Data
**What goes wrong:** The Cell component's `rowData` may not contain Hub field values if `enableListViewSelectAPI` is active and only selects visible columns.
**Why it happens:** Performance optimization that limits which fields are fetched for list views.
**How to avoid:** Ensure the ui field or collection config does not enable `enableListViewSelectAPI`, OR ensure all required Hub fields are included in the select. In this project, `enableListViewSelectAPI` is not currently set (defaults to false), so full documents are returned.
**Warning signs:** All profiles show as "Unvollstaendig" even when Hub fields are filled.

### Pitfall 5: generate:importmap Forgotten After Adding New Admin Component
**What goes wrong:** New Cell component registered but Payload cannot resolve it.
**Why it happens:** Payload 3 uses an import map for admin components. New string-path components must be in the import map.
**How to avoid:** After adding the Cell component, run `npm run generate:importmap` before `npm run dev`.
**Warning signs:** Runtime error "Cannot resolve component @/components/admin/profile-hub-status-cell".

## Code Examples

### Current Typo Evidence in payload-types.ts

The generated `payload-types.ts` currently contains:
```typescript
// Line 79: fensterformen slug maps to "Fensterforman" interface
fensterformen: Fensterforman;  // Should be "Fensterform"

// Line 84: sicherheitsglas slug maps to "Sicherheitsgla" interface
sicherheitsglas: Sicherheitsgla;  // Should be "Sicherheitsglas"

// Line 363: Interface declaration
export interface Fensterforman {  // Typo: truncated name
// Line 494:
export interface Sicherheitsgla {  // Typo: truncated name
```

### Files Requiring Import Updates After Type Rename

1. **`src/lib/konfigurator/filters.ts`** (lines 6, 11):
   - `Fensterforman` -> `Fensterform`
   - `Sicherheitsgla` -> `Sicherheitsglas`

2. **`src/lib/konfigurator/types.ts`** (lines 8, 13):
   - `Fensterforman` -> `Fensterform`
   - `Sicherheitsgla` -> `Sicherheitsglas`

3. **`src/payload-types.ts`** -- regenerated automatically, no manual edit

4. **Any test files** importing these types -- check `tests/unit/test-filters*.test.ts`

### Profile Collection Hub Fields Verification (for DEBT-04 and DEBT-05)

All 13 Hub fields confirmed in `src/collections/produkte/profile.ts`:
```
1.  erlaubte_produkttypen    -> filterOptions: { aktiv: { equals: true } }  OK
2.  erlaubte_fensterformen   -> filterOptions: { aktiv: { equals: true } }  OK
3.  erlaubte_fluegelanzahl   -> filterOptions: { aktiv: { equals: true } }  OK
4.  erlaubte_oeffnungsarten  -> filterOptions: { aktiv: { equals: true } }  OK
5.  erlaubte_zusatzlichter   -> filterOptions: { aktiv: { equals: true } }  OK
6.  erlaubte_farben          -> filterOptions: { aktiv: { equals: true } }  OK
7.  erlaubte_dichtungsfarben -> filterOptions: { aktiv: { equals: true } }  OK
8.  erlaubte_verglasungen    -> filterOptions: { aktiv: { equals: true } }  OK
9.  erlaubte_schallschutz    -> filterOptions: { aktiv: { equals: true } }  OK
10. erlaubte_sicherheitsglas -> filterOptions: { aktiv: { equals: true } }  OK
11. erlaubte_glasdekore      -> filterOptions: { aktiv: { equals: true } }  OK
12. erlaubte_sprossen        -> filterOptions: { aktiv: { equals: true } }  OK
13. erlaubte_extras          -> filterOptions: { aktiv: { equals: true } }  OK
```

DEBT-05 is verified complete. All 13 fields have `filterOptions: { aktiv: { equals: true } }` and `maxDepth: 0`.

### Dichtungsfarben Hub-Filter Verification (DEBT-04)

In `filters.ts` lines 204-213 (Step 8, USE_HUB branch):
```typescript
const hubDichtung = getHubField<Dichtungsfarben>(
  selectedProfil,
  "erlaubte_dichtungsfarben",
  cmsData,
  "dichtungsfarben",
);
return {
  aussen: hubFarben.filter((f) => f.fuer_aussen),
  innen: hubFarben.filter((f) => f.fuer_innen),
  dichtungsfarben: hubDichtung ?? [],
};
```

DEBT-04 is verified complete. The Hub path filters dichtungsfarben through `erlaubte_dichtungsfarben` on the Profile.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Labels-only type generation | `typescript.interface` override | Payload 3.x | Clean control over generated type names without changing UI labels |
| Manual list view columns | `ui` field + custom Cell + `defaultColumns` | Payload 3.x | Standard way to add computed columns to admin list view |
| Payload 2 component imports | String-path component registration | Payload 3.0 | Components registered as `"@/path#ExportName"` strings |

**Deprecated/outdated:**
- Direct React component imports in collection config (Payload 2 pattern) -- use string paths in Payload 3

## Open Questions

1. **CellComponentProps exact signature in Payload 3.79**
   - What we know: Cell components receive props including `cellData` and `rowData`. The `rowData` should contain the full document.
   - What's unclear: Whether `rowData` contains relationship field arrays (Hub fields stored as ID arrays with maxDepth:0 would be string arrays).
   - Recommendation: Since Hub fields have `maxDepth: 0`, they are stored as string arrays. In list view, `rowData` should contain these arrays. The badge only needs `Array.isArray(value) && value.length > 0` -- it does not need resolved objects. Test after implementation.

2. **Systematic Label Audit for All Collections**
   - What we know: fensterformen and sicherheitsglas have confirmed typos. The extras collection generates `Extra` (singular) which is correct.
   - What's unclear: Whether any other collections have subtle type name issues.
   - Recommendation: After adding `typescript.interface` to the two known collections, run `npm run generate:types` and diff the full payload-types.ts to check all interface names systematically.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jsdom) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=test-validate-hub` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HUB-05 | Badge shows for profiles with empty required Hub fields | manual-only | N/A (Admin UI component, requires Payload running) | N/A |
| DEBT-03 | generate:types produces clean type names | build | `npm run generate:types && npx tsc --noEmit` | N/A (build check) |
| DEBT-04 | dichtungsfarben filtered via Hub field | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | Exists |
| DEBT-05 | filterOptions consistent on all 13 fields | unit | `npx jest tests/unit/test-profile-hub.test.ts -x` | Exists |
| DEBT-06 | Versions decision documented | manual-only | N/A (documentation task) | N/A |

### Sampling Rate
- **Per task commit:** `npm run generate:types && npx tsc --noEmit` (type safety) + `npx jest` (full suite)
- **Per wave merge:** `npm run build` (full Next.js build)
- **Phase gate:** Full suite green + `npm run build` clean + manual QA checklist complete

### Wave 0 Gaps
None -- existing test infrastructure covers all automatable phase requirements. HUB-05 and DEBT-06 are inherently manual (Admin UI visual check and documentation review).

## Sources

### Primary (HIGH confidence)
- Payload CMS 3 source code: `packages/payload/src/collections/config/types.ts` -- confirmed `typescript.interface` property
- Project code analysis: `src/collections/produkte/profile.ts`, `src/lib/konfigurator/filters.ts`, `src/payload-types.ts`
- Project code: `src/scripts/validate-hub-fields.ts` -- REQUIRED_HUB_FIELDS definition

### Secondary (MEDIUM confidence)
- [Payload CMS List View docs](https://payloadcms.com/docs/custom-components/list-view) -- custom Cell components in list view
- [Payload CMS Fields Overview](https://payloadcms.com/docs/fields/overview) -- admin.components.Cell property
- [Payload CMS UI Field docs](https://payloadcms.com/docs/fields/ui) -- ui field type for non-persisted display fields
- [Payload CMS Collection Configs](https://payloadcms.com/docs/configuration/collections) -- defaultColumns, listSearchableFields
- [Payload CMS Type Generation](https://payloadcms.com/docs/typescript/generating-types) -- interfaceName / typescript.interface
- [Payload CMS Blog: interfaceName](https://payloadcms.com/posts/blog/interfacename-generating-composable-graphql-and-typescript-types) -- composable type generation

### Tertiary (LOW confidence)
- [GitHub Discussion: defaultColumns issues](https://github.com/payloadcms/payload/issues/6458) -- known issues with defaultColumns being ignored by user preferences

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture (Badge): MEDIUM -- ui field + Cell pattern is documented but exact props API in 3.79 needs implementation validation
- Architecture (Type fix): HIGH -- `typescript.interface` verified in Payload source code
- Pitfalls: HIGH -- based on actual code inspection and known Payload behaviors
- QA scope: HIGH -- all code paths already exist, verification is straightforward

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- no fast-moving dependencies)
