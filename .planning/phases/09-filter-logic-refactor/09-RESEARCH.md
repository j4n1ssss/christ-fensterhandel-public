# Phase 9: Filter Logic Refactor - Research

**Researched:** 2026-03-18
**Domain:** Client-side filter logic refactoring (TypeScript, Zustand store, Payload CMS REST API)
**Confidence:** HIGH

## Summary

Phase 9 replaces the distributed chain-filter logic in `filters.ts` with a centralized Hub pattern where the selected Profile document is the sole source of truth for Steps 4-6 and 8-9. The Hub fields (`erlaubte_*`) already exist on the Profile collection (Phase 7), and `erlaubte_farben` was backfilled in Phase 8. The refactor is a pure TypeScript code change in two files (`filters.ts` and `store.ts`) plus a new validation script -- no database migrations, no schema changes, no UI layout changes.

The main technical risk is regression in any of the 10 configurator steps. The USE_HUB feature flag provides a clean rollback mechanism. The code change itself is a simplification: the current `filters.ts` is 157 lines with per-step chain logic; the Hub version will be ~100 lines with a single `getHubField()` helper reused across all Hub-filtered steps.

**Primary recommendation:** Implement in three waves: (1) getHubField helper + store.ts changes, (2) refactor all step cases behind USE_HUB flag, (3) validation script. Each wave independently testable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hub ERSETZT Ketten-Filter komplett (kein Fallback, keine Schnittmenge, kein Mischbetrieb)
- Hub-Feld leer (null/undefined/[]) = Kategorie wird NICHT im Konfigurator angezeigt
- Admin MUSS alle Pflicht-Hub-Felder befuellen bevor USE_HUB=true gesetzt wird
- Steps 1-3 + 7 behalten Ketten-Logik unveraendert (Produkttyp->Material->Profil->Masse)
- Steps 4-6 + 8-9 nutzen ausschliesslich Hub-Felder vom gewaehlten Profil
- Step 6 (Fensterform): Hub-Feld erlaubte_fensterformen ersetzt BEIDE alten Checks (erlaubte_fluegelanzahl + erlaubte_oeffnungsarten der Fensterform)
- getHubField() Signatur: getHubField(profil, field, cmsData, collection) -> Item[] | null
- Profil-Objekt wird aus cmsData.profile gelesen (kein separater Store-State)
- Intersection: Hub-IDs ∩ cmsData-Items (cmsData enthaelt nur aktive Items)
- null-Return = Hub-Feld leer = Kategorie nicht anzeigen
- aktiv-Check server-seitig beim Laden: where[aktiv][equals]=true als API-Query-Parameter in store.ts loadCMSData()
- Collections ohne aktiv-Feld (z.B. preisregeln) ohne Filter laden
- Profile auch aktiv-gefiltert
- Kein separater aktiv-Check in filters.ts noetig -- cmsData enthaelt nur aktive Items
- Step 8 Return erweitert: { aussen: Farben[], innen: Farben[], dichtungsfarben: Dichtungsfarben[] }
- Dichtungsfarben Hub-gefiltert via profil.erlaubte_dichtungsfarben
- Farben: Hub liefert erlaubte_farben (alle), Split nach fuer_aussen/fuer_innen NACH dem Hub-Filter
- fuer_aussen/fuer_innen sind Farb-Eigenschaften, keine Filter-Kette
- Step 9 alle 6 Kategorien gleichbehandelt: Hub-gefiltert
- Hub-Feld leer = Kategorie komplett ausblenden (kein "Nicht verfuegbar"-Hinweis)
- Step 9 Return: jede Kategorie als Item[] | null (null = ausblenden)
- Pflicht-Hub-Felder: erlaubte_fluegelanzahl, erlaubte_oeffnungsarten, erlaubte_fensterformen, erlaubte_farben, erlaubte_verglasungen
- Optionale Hub-Felder: erlaubte_zusatzlichter, erlaubte_dichtungsfarben, erlaubte_schallschutz, erlaubte_sicherheitsglas, erlaubte_glasdekore, erlaubte_sprossen, erlaubte_extras, erlaubte_produkttypen
- Feature-Flag USE_HUB: Einzelner Boolean in filters.ts -- kein Mischbetrieb
- Validation Script: npm run validate:hub-fields, prueft alle aktiven Profile, unterscheidet Pflicht/optional, Exit-Code 0 nur wenn alle Pflicht-Felder befuellt

### Claude's Discretion
- Exakte getHubField() Implementierung (Type-Guards, Edge Cases)
- store.ts depth-Aenderung (FILT-05): depth=1 fuer Profile vs. globale Aenderung
- Wie alte Ketten-Code-Pfade im Feature-Flag-Block strukturiert werden
- Validation Script Details (Standalone-Script oder in migrations/)

### Deferred Ideas (OUT OF SCOPE)
- Legacy-Ketten-Felder entfernen (fuer_produkttypen, fuer_fenster/balkontuer, etc.) -- v1.2 LEGC-01
- USE_HUB Feature-Flag und alten Code loeschen -- v1.2 FLAG-01
- Incomplete Profile Badge (HUB-05) -- Phase 12
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FILT-01 | filters.ts nutzt Hub-Felder als primaere und einzige Quelle fuer Steps 4-6, 8-9 | getHubField() helper + per-step Hub code behind USE_HUB flag. Existing extractId() reused. |
| FILT-02 | Hub-Feld leer = Kategorie nicht angezeigt, kein Legacy-Fallback | getHubField() returns null for empty/missing arrays; UI components already handle empty arrays, Step 9 needs null-check for category hiding |
| FILT-03 | Feature-Flag USE_HUB schaltet zwischen altem und neuem Code | Single boolean constant at top of filters.ts; ternary/if-else per step case; old code preserved in else-branch |
| FILT-04 | Alle 10 Steps funktionieren mit USE_HUB=true und USE_HUB=false | Steps 1-3, 7, 10 unchanged; Steps 4-6, 8-9 dual code paths; manual QA through all steps required |
| FILT-05 | store.ts Profile-Fetch depth=2 -> depth=1 | Per-collection depth map in loadCMSData(); profile gets depth=1 (Hub fields are maxDepth:0 = IDs only, but material needs depth=1) |
| FILT-06 | Validation Script validate:hub-fields | Standalone tsx script following backfill-erlaubte-farben.ts pattern; npm script in package.json |
| DEBT-01 | Step 9 filtert ueber Hub-Felder statt ungefiltert | 6 getHubField() calls, each returning Item[] or null; return type changes to { [category]: Item[] or null } |
| DEBT-02 | aktiv-Check ueberall via server-seitigen API-Filter | where[aktiv][equals]=true in store.ts loadCMSData() query params; per-collection check for aktiv field existence |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5.7.3 | Type-safe filter refactoring | Already in project, strict mode |
| Zustand | ^5.0.11 | Konfigurator state + CMS data store | Already manages all konfigurator state |
| Payload CMS | 3.79.0 | REST API, generated types | Hub fields already defined on Profile collection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | (devDep) | Running validation script | `npm run validate:hub-fields` via tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single USE_HUB boolean | Environment variable | Boolean is simpler, code-level switch is sufficient for this use case. Env var adds deployment complexity for a temporary flag. |
| Per-collection depth override | Global depth change | Per-collection is safer: profile needs depth=1 (material relation), other collections may need depth=2 for existing chain filters when USE_HUB=false |

## Architecture Patterns

### Recommended Project Structure
```
src/lib/konfigurator/
├── filters.ts          # MAIN REFACTOR: getHubField() + USE_HUB flag + per-step logic
├── store.ts            # loadCMSData() aktiv-filter + depth change
├── types.ts            # No changes (CMSData interface already correct)
└── step-config.ts      # STEP_DEPENDENCIES may need update (Steps 4-6, 8-9 now depend on Step 3)

src/migrations/
└── backfill-erlaubte-farben.ts  # Existing pattern to follow

scripts/
└── validate-hub-fields.ts       # OR src/migrations/validate-hub-fields.ts — validation script
```

### Pattern 1: getHubField() Helper
**What:** Central abstraction for Hub-filtered field access
**When to use:** Every Hub-filtered step (4, 5, 6, 8, 9 + Zusatzlichter in Step 4)
**Example:**
```typescript
// Based on CONTEXT.md locked decision + payload-types.ts Profile interface
function getHubField<T extends { id: string }>(
  profil: Profile | undefined,
  field: keyof Profile,
  cmsData: CMSData,
  collection: keyof CMSData,
): T[] | null {
  if (!profil) return null
  const hubValue = profil[field]
  if (!Array.isArray(hubValue) || hubValue.length === 0) return null
  // Hub fields have maxDepth: 0, so values are string IDs
  const hubIds = new Set(hubValue.map((v: string | { id: string }) =>
    typeof v === 'string' ? v : v.id
  ))
  // Intersection: Hub IDs ∩ cmsData items (cmsData already aktiv-filtered)
  const items = cmsData[collection] as unknown as T[]
  return items.filter((item) => hubIds.has(item.id))
}
```

### Pattern 2: Feature Flag Structure
**What:** USE_HUB boolean controls entire filter path
**When to use:** Every Hub-affected step case in the switch statement
**Example:**
```typescript
const USE_HUB = false // Toggle: false = legacy chain code, true = Hub code

export function getFilteredOptions(step, cmsData, selections) {
  // Resolve selected profile once (used by all Hub steps)
  const selectedProfil = cmsData.profile.find(p => p.id === selections.profil)

  switch (step) {
    case 1: // Unchanged
    case 2: // Unchanged
    case 3: // Unchanged

    case 4: {
      if (USE_HUB) {
        // Hub: profil.erlaubte_fluegelanzahl
        return getHubField(selectedProfil, 'erlaubte_fluegelanzahl', cmsData, 'fluegelanzahl') ?? []
      }
      // Legacy chain code (preserved for rollback)
      if (!selections.produkttyp) return cmsData.fluegelanzahl
      return cmsData.fluegelanzahl.filter(f => ...)
    }
    // ... same pattern for 5, 6, 8, 9
  }
}
```

### Pattern 3: aktiv-Filter in API Queries
**What:** Server-side filtering of inactive items via Payload REST API where clause
**When to use:** In store.ts loadCMSData() for every collection that has an `aktiv` field
**Example:**
```typescript
// Collections that have an aktiv field
const COLLECTIONS_WITH_AKTIV = new Set([
  'produkttypen', 'materialien', 'profile', 'fluegelanzahl',
  'zusatzlichter', 'oeffnungsarten', 'fensterformen', 'farben',
  'dichtungsfarben', 'verglasungen', 'schallschutz', 'sicherheitsglas',
  'glasdekore', 'sprossen', 'extras',
])

// In loadCMSData():
const params = new URLSearchParams()
params.set('limit', '100')
params.set('sort', 'sortOrder')
if (slug === 'profile') {
  params.set('depth', '1') // FILT-05: reduced from 2
} else {
  params.set('depth', '2')
}
if (COLLECTIONS_WITH_AKTIV.has(slug)) {
  params.set('where[aktiv][equals]', 'true')
}
const res = await fetch(`/api/${slug}?${params.toString()}`)
```

### Pattern 4: Validation Script (following backfill pattern)
**What:** Standalone script that validates Hub field completeness across all profiles
**When to use:** Before switching USE_HUB to true; as npm script
**Example pattern from existing backfill-erlaubte-farben.ts:**
```typescript
// Pure functions exported at top (for testing)
export const REQUIRED_HUB_FIELDS = [...]
export const OPTIONAL_HUB_FIELDS = [...]
export function validateProfile(profile, requiredFields, optionalFields) { ... }

// Script body with dynamic imports below
async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  // ...paginate profiles, validate each, print report, exit code
}
```

### Anti-Patterns to Avoid
- **Mixing Hub and Legacy in same step:** USE_HUB flag MUST switch ALL Hub-affected steps together. No "Hub for Step 4 but Legacy for Step 8".
- **Fallback to legacy when Hub is empty:** CONTEXT.md explicitly forbids this. Hub empty = return null/[]. No fallback.
- **Filtering by aktiv in filters.ts:** The aktiv-check is server-side in store.ts. Do NOT add `.filter(item => item.aktiv)` in filters.ts -- cmsData already contains only active items.
- **Using depth > 0 for Hub fields:** Profile Hub fields have maxDepth: 0 in the collection config. The API returns string IDs, not populated objects. getHubField() must handle `string | { id: string }` union but will mostly see strings.
- **Changing UI components in this phase:** Only filters.ts and store.ts change. The Step 8 component already reads `dichtungsfarben` directly from `store.cmsData.dichtungsfarben` -- the only change is that filters.ts Step 8 now returns `{ aussen, innen, dichtungsfarben }` and the Step 8 component switches from `store.cmsData.dichtungsfarben` to `filtered.dichtungsfarben`. Step 9 component needs conditional rendering for null categories.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ID extraction from Payload relations | New extractId function | Existing `extractId()` at line 15 of filters.ts | Already handles string and { id: string } union |
| Payload type definitions | Manual interfaces | Generated types from `@/payload-types` | Profile, Farben, etc. already correctly typed with all Hub fields |
| CMS data loading | Second fetch for profile | `cmsData.profile` from existing store | Profile data already loaded by loadCMSData(), no extra fetch needed |
| aktiv filtering | Client-side `.filter(x => x.aktiv)` | Server-side `where[aktiv][equals]=true` | Single source of truth, no redundant checks |

**Key insight:** This refactor removes complexity rather than adding it. The current chain logic (5-20 lines per step) becomes a single getHubField() call per step. The hardest part is not the new code -- it is preserving the old code correctly behind the feature flag for rollback.

## Common Pitfalls

### Pitfall 1: Step 8 Return Type Breaking Change
**What goes wrong:** Step 8 currently returns `{ aussen: Farben[], innen: Farben[] }`. The Hub version adds `dichtungsfarben: Dichtungsfarben[]`. The step-farben.tsx component currently casts the return as `{ aussen: Farben[], innen: Farben[] }` and reads dichtungsfarben separately from `store.cmsData.dichtungsfarben`.
**Why it happens:** The return type change means the component must be updated to read dichtungsfarben from the filtered result.
**How to avoid:** When USE_HUB=true, return `{ aussen, innen, dichtungsfarben }`. When USE_HUB=false, return `{ aussen, innen, dichtungsfarben: cmsData.dichtungsfarben }` (unfiltered, matching current behavior). Update step-farben.tsx to always read dichtungsfarben from the filter result. This way the component works with both flag states.
**Warning signs:** TypeScript type assertion error or runtime undefined when accessing `filtered.dichtungsfarben`.

### Pitfall 2: Step 9 Null Categories Breaking UI Rendering
**What goes wrong:** Step 9 currently returns `{ verglasungen: [...], schallschutz: [...], ... }` -- all arrays, never null. The Hub version returns null for empty Hub fields. The step-verglasung-extras.tsx component iterates `.map()` on these arrays without null checks.
**Why it happens:** `.map()` on null throws TypeError.
**How to avoid:** Return `[]` for backwards compatibility when USE_HUB=false. When USE_HUB=true, return `null` for empty Hub fields AND update the component to check for null before rendering each category section. Alternatively, use `?? []` coalescing in the component.
**Warning signs:** Runtime "Cannot read properties of null (reading 'map')" error.

### Pitfall 3: Profile Not Found When USE_HUB=true
**What goes wrong:** If `selections.profil` is null or the profile is not in cmsData (edge case: deleted/deactivated profile), `getHubField()` gets undefined profil and returns null for everything.
**Why it happens:** Steps 4-9 are after Step 3 (profile selection), so profil should always be set. But cascade-reset or direct URL navigation could lead to a state where profil is null.
**How to avoid:** getHubField() must handle undefined profil gracefully (return null). Steps 4-9 should return empty arrays `[]` when profil is not selected, not crash.
**Warning signs:** Blank configurator steps after navigating back and forth.

### Pitfall 4: depth Change Breaks Legacy Code When USE_HUB=false
**What goes wrong:** Reducing profile depth from 2 to 1 might break existing chain filters that expect populated relationships on profile. However, examining the current code: Steps 1-3 and 7 use `cmsData.produkttypen`, `cmsData.materialien`, and `profil.masse` -- none need populated Hub fields. Step 4 legacy uses `fluegelanzahl.fuer_produkttypen` (from fluegelanzahl collection, not profile). Step 8 legacy uses `farben.erlaubte_materialien` (from farben collection). So depth=1 on profile should be safe even for legacy.
**Why it happens:** Assumption that something reads populated sub-relations on profile.
**How to avoid:** Verify that no existing filter logic reads populated relations ON the profile document beyond `profile.material` (which needs depth=1) and `profile.masse` (a group, not a relation). The existing code confirms this is safe.
**Warning signs:** Undefined values when accessing properties of profile.material.

### Pitfall 5: Zusatzlichter in Step 4 Easily Forgotten
**What goes wrong:** Step 4 returns fluegelanzahl items, but Zusatzlichter are also part of Step 4 (selections: `fluegelanzahl` + `zusatzlichter`). The current code does not filter Zusatzlichter in filters.ts. Hub adds `profil.erlaubte_zusatzlichter`.
**Why it happens:** Zusatzlichter filtering is not in the current Step 4 case -- it may be loaded unfiltered or filtered in the component.
**How to avoid:** Add Zusatzlichter Hub-filtering to Step 4's return value. Return `{ fluegelanzahl: [...], zusatzlichter: [...] | null }` or handle Zusatzlichter as a separate sub-call within Step 4. Check how step-fluegel.tsx currently consumes Zusatzlichter.
**Warning signs:** Zusatzlichter appearing for profiles that should not have them.

### Pitfall 6: STEP_DEPENDENCIES Graph Now Stale
**What goes wrong:** The current `STEP_DEPENDENCIES` in step-config.ts has Step 4 depending on `[1]`, Step 5 on `[1, 4]`, Step 6 on `[4, 5]`, Step 8 on `[2]`, and Step 9 on `[]`. With Hub filtering, all these steps now depend on the Profile (Step 3). If the user changes their profile selection, Steps 4-9 should be reset.
**Why it happens:** The dependency graph was written for chain filters that depended on produkttyp and material. Hub changes the dependency to profile.
**How to avoid:** Update STEP_DEPENDENCIES to add Step 3 as a dependency for Steps 4, 5, 6, 8, and 9. This ensures changing the profile cascades resets correctly. Note: Step 4 should depend on `[3]` (not `[1]` anymore when USE_HUB=true), but since Step 3 already depends on Step 2 which depends on Step 1, the transitive closure still works. The safest change is to ADD 3 to existing dependencies: Step 4 `[1, 3]`, Step 5 `[1, 3, 4]`, Step 6 `[3, 4, 5]`, Step 8 `[2, 3]`, Step 9 `[3]`. This is correct for both USE_HUB=true and USE_HUB=false.
**Warning signs:** Changing profile does not reset Step 4-9 selections, leading to stale/invalid configurator state.

## Code Examples

### Current filters.ts Structure (for reference)
```typescript
// Line 15: existing extractId helper (reuse in getHubField)
function extractId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

// Line 26: main entry point
export function getFilteredOptions(
  step: number,
  cmsData: CMSData,
  selections: KonfiguratorSelections
): unknown {
  switch (step) {
    case 1: return cmsData.produkttypen          // UNCHANGED
    case 2: { /* produkttyp chain filter */ }     // UNCHANGED
    case 3: { /* material chain filter */ }       // UNCHANGED
    case 4: { /* fuer_produkttypen chain */ }     // REPLACE with Hub
    case 5: { /* fuer_fenster/balkontuer */ }     // REPLACE with Hub
    case 6: { /* double cross-reference */ }      // REPLACE with Hub (biggest win)
    case 7: { /* profil.masse */ }                // UNCHANGED
    case 8: { /* erlaubte_materialien chain */ }  // REPLACE with Hub + add dichtungsfarben
    case 9: { /* no filtering */ }                // ADD Hub filtering (was unfiltered)
    case 10: return null                          // UNCHANGED
  }
}
```

### store.ts loadCMSData Current Pattern
```typescript
// Line 148-151: current fetch pattern (ALL collections use depth=2)
const res = await fetch(
  `/api/${slug}?depth=2&limit=100&sort=sortOrder`,
)
```

### Profile Type (from payload-types.ts, confirmed)
```typescript
export interface Profile {
  id: string;
  // ... other fields
  material: string | Materialien;
  erlaubte_produkttypen?: (string | Produkttypen)[] | null;
  erlaubte_fensterformen?: (string | Fensterforman)[] | null;
  erlaubte_fluegelanzahl?: (string | Fluegelanzahl)[] | null;
  erlaubte_oeffnungsarten?: (string | Oeffnungsarten)[] | null;
  erlaubte_zusatzlichter?: (string | Zusatzlichter)[] | null;
  erlaubte_farben?: (string | Farben)[] | null;
  erlaubte_dichtungsfarben?: (string | Dichtungsfarben)[] | null;
  erlaubte_verglasungen?: (string | Verglasungen)[] | null;
  erlaubte_schallschutz?: (string | Schallschutz)[] | null;
  erlaubte_sicherheitsglas?: (string | Sicherheitsgla)[] | null;
  erlaubte_glasdekore?: (string | Glasdekore)[] | null;
  erlaubte_sprossen?: (string | Sprossen)[] | null;
  erlaubte_extras?: (string | Extra)[] | null;
  aktiv?: boolean | null;
}
```
Note: Hub fields are `maxDepth: 0` in the collection config, so the API returns string IDs. The union type `(string | X)[]` handles both populated and unpopulated cases, but at runtime with depth=1 on profile, Hub fields will be `string[]`.

### Step 8 Component Current Consumption (critical)
```typescript
// step-farben.tsx lines 114-119
const filtered = getFilteredOptions(8, store.cmsData, selections) as {
  aussen: Farben[]
  innen: Farben[]
}
const dichtungsfarben = store.cmsData.dichtungsfarben  // <-- reads directly from store, NOT from filter result
```
After refactor: component reads `filtered.dichtungsfarben` instead.

### Step 9 Component Current Consumption (critical)
```typescript
// step-verglasung-extras.tsx lines 108-114
const data = getFilteredOptions(9, store.cmsData, selections) as {
  verglasungen: Verglasungen[]
  schallschutz: Schallschutz[]
  sicherheitsglas: Sicherheitsgla[]
  glasdekore: Glasdekore[]
  sprossen: Sprossen[]
  extras: Extra[]
}
```
After refactor: type changes to `Item[] | null` per category, component must handle null.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Chain filters (distributed relations) | Hub filters (centralized on Profile) | Phase 7 (data model) + Phase 9 (logic) | 7 chain-filter code paths become 1 helper call each |
| No aktiv check in konfigurator | Server-side aktiv=true in API queries | Phase 9 | Inactive CMS items no longer shown to users |
| depth=2 for all collections | depth=1 for profile, depth=2 for rest | Phase 9 | Prevents response explosion with 13 Hub relations |
| Step 9 unfiltered | Step 9 Hub-filtered per category | Phase 9 | Each category can be hidden per profile |
| Dichtungsfarben unfiltered | Hub-filtered via erlaubte_dichtungsfarben | Phase 9 | Profile-specific dichtungsfarben |

## Open Questions

1. **Zusatzlichter Return Type for Step 4**
   - What we know: Step 4 currently returns `Fluegelanzahl[]`. Zusatzlichter are also selected in Step 4 but loaded from `cmsData.zusatzlichter` directly in the component.
   - What's unclear: Should Step 4 return `{ fluegelanzahl: Fluegelanzahl[], zusatzlichter: Zusatzlichter[] | null }` or should the component call getHubField separately?
   - Recommendation: Include in Step 4 return for consistency. Step 4 return type changes to an object. Legacy path returns `{ fluegelanzahl: [...], zusatzlichter: cmsData.zusatzlichter }`.

2. **STEP_DEPENDENCIES Update Scope**
   - What we know: Steps 4-6, 8-9 now logically depend on Step 3 (profile). Current graph does not reflect this.
   - What's unclear: Should this be updated immediately or deferred? Both USE_HUB paths benefit from the dependency fix.
   - Recommendation: Update STEP_DEPENDENCIES in this phase. It is a one-line-per-step change and prevents stale selections. Minimal risk.

3. **Collections Without aktiv Field**
   - What we know: preisregeln does not have an aktiv field. The aktiv query param on a collection without the field may cause a Payload error or be silently ignored.
   - What's unclear: Payload REST API behavior when querying `where[aktiv][equals]=true` on a collection without an `aktiv` field.
   - Recommendation: Maintain a whitelist of collections WITH aktiv field and only add the filter for those. preisregeln is excluded.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 with ts-jest 29.4.6 |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=filters` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILT-01 | getHubField returns filtered items from Hub | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | No -- Wave 0 |
| FILT-02 | getHubField returns null for empty Hub fields | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | No -- Wave 0 |
| FILT-03 | USE_HUB=false returns legacy results, USE_HUB=true returns Hub results | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | No -- Wave 0 |
| FILT-04 | All 10 steps produce valid output | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | No -- Wave 0 |
| FILT-05 | Profile depth reduced | manual | Visual check of network tab / store.ts code review | N/A (code review) |
| FILT-06 | Validation script reports correct status | unit | `npx jest tests/unit/test-validate-hub.test.ts -x` | No -- Wave 0 |
| DEBT-01 | Step 9 returns Hub-filtered categories | unit | `npx jest tests/unit/test-filters-hub.test.ts -x` | No -- Wave 0 |
| DEBT-02 | loadCMSData adds aktiv filter | manual | Code review of store.ts query params | N/A (code review) |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=filters-hub`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-filters-hub.test.ts` -- covers FILT-01, FILT-02, FILT-03, FILT-04, DEBT-01
- [ ] `tests/unit/test-validate-hub.test.ts` -- covers FILT-06 (pure validation functions)
- [ ] No framework install needed -- Jest already configured and working

**Test approach:** Following the established pattern from `backfill-erlaubte-farben.ts` and `test-cascade-reset.test.ts`: export pure functions (getHubField, validateProfile) and test them with mock data objects. No Payload/database dependency for unit tests.

## Sources

### Primary (HIGH confidence)
- `src/lib/konfigurator/filters.ts` -- current 157-line filter logic, line-by-line analysis
- `src/lib/konfigurator/store.ts` -- current loadCMSData with depth=2, line 150
- `src/lib/konfigurator/types.ts` -- CMSData, KonfiguratorSelections interfaces
- `src/payload-types.ts` -- Generated Profile interface with all 13 Hub fields (lines 280-357)
- `src/collections/produkte/profile.ts` -- Hub field definitions with maxDepth: 0
- `src/lib/konfigurator/step-config.ts` -- STEP_DEPENDENCIES graph
- `src/components/konfigurator/steps/step-farben.tsx` -- Step 8 filter result consumption
- `src/components/konfigurator/steps/step-verglasung-extras.tsx` -- Step 9 filter result consumption
- `src/migrations/backfill-erlaubte-farben.ts` -- Script pattern (pure functions + dynamic imports)
- `docs/todos/009_2026-03-18_hub-ersetzt-ketten-mapping.md` -- Complete step-by-step mapping spec
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` -- Implementation plan sections 3, 8

### Secondary (MEDIUM confidence)
- `jest.config.ts` -- Test framework configuration verified
- `tests/unit/test-cascade-reset.test.ts` -- Existing test pattern reference

### Tertiary (LOW confidence)
- None -- all findings based on direct code analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, no new dependencies
- Architecture: HIGH -- CONTEXT.md provides exact decisions, code analysis confirms feasibility
- Pitfalls: HIGH -- identified from direct code reading (type casts in components, dependency graph gap)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable domain, no external API changes expected)
