# Phase 7: Data Model Foundation - Research

**Researched:** 2026-03-18
**Domain:** Payload CMS 3.79 Collection Configuration (Relationships, Tabs, Access Control)
**Confidence:** HIGH

## Summary

Phase 7 extends the existing `profile.ts` collection with 13 hasMany relationship fields organized in two tabs ("Kombinationen" and "Ausstattung"), and creates a new `edit_history` collection for audit logging. This is a pure data-model phase -- no hooks, no filter changes, no migration scripts.

The research confirms all required Payload CMS APIs are well-documented and stable in version 3.79: `type: 'tabs'` field, `hasMany` relationships with `filterOptions`, `maxDepth`, and `admin.allowCreate`. All 13 target collections have an `aktiv` checkbox field, so the `filterOptions: { aktiv: { equals: true } }` constraint is safe across the board. The existing `status_historie.ts` provides a proven audit-collection pattern that maps directly to `edit_history`.

**Primary recommendation:** Implement profile.ts changes first (tabs + 13 fields), then create edit_history collection, then register in payload.config.ts, then run `generate:types` + `generate:importmap`. Server restart with `push: true` handles schema migration automatically.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Bestehende Felder (name_technisch, name_einfach, beschreibung, bild, qualitaetsstufe, technische_daten, masse, material) bleiben oben wie bisher -- kein Umbau
- Darunter die zwei neuen Tabs: "Kombinationen" (5 Felder) und "Ausstattung" (8 Felder)
- Sidebar-Felder (slug, aktiv, sortOrder) bleiben in der Sidebar
- Kein "Stammdaten"-Tab -- bestehende Felder werden NICHT in Tabs gepackt
- Alle 13 Felder: hasMany, maxDepth: 0, admin.allowCreate: true
- filterOptions: { aktiv: { equals: true } } auf allen 13 Feldern (HUB-02)
- Tab "Kombinationen": erlaubte_produkttypen, erlaubte_fensterformen, erlaubte_fluegelanzahl, erlaubte_oeffnungsarten, erlaubte_zusatzlichter
- Tab "Ausstattung": erlaubte_farben, erlaubte_dichtungsfarben, erlaubte_verglasungen, erlaubte_schallschutz, erlaubte_sicherheitsglas, erlaubte_glasdekore, erlaubte_sprossen, erlaubte_extras
- Bestehendes Einzel-Feld `material` (single relation) bleibt unveraendert (HUB-04)
- Alle 13 Hub-Felder bekommen kurze admin.description Hilfetexte
- edit_history Pattern: identisch zu status_historie (bewiesenes Audit-Pattern im Projekt)
- Access: create via overrideAccess (nur Hooks), read: admin+mitarbeiter, update: false, delete: admin
- Felder: collection (text), doc_id (text), event (text), diff (json), editor (relationship users), timestamp (date dayAndTime)
- Admin-Gruppe: "System"
- KEINE Hooks in Phase 7 -- nur die Collection anlegen (Hooks kommen in Phase 11)

### Claude's Discretion
- Exakte Hilfetext-Formulierungen pro Feld
- filterOptions-Syntax falls Collections kein aktiv-Feld haben (ggf. weglassen)
- Reihenfolge der Felder innerhalb der Tabs
- admin.useAsTitle und defaultColumns fuer edit_history

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HUB-01 | Admin kann in profile.ts 13 hasMany-Relationship-Felder (erlaubte_*) in zwei Tabs (Kombinationen / Ausstattung) pflegen | Tabs field type confirmed: unnamed tabs are presentational-only, can coexist with top-level fields. hasMany relationship fields are standard Payload API. |
| HUB-02 | Alle 13 Relationship-Felder haben filterOptions ({ aktiv: { equals: true } }) und admin.allowCreate: true | filterOptions accepts static Where query objects. All 13 target collections verified to have `aktiv` checkbox field. admin.allowCreate: true is documented property. |
| HUB-03 | Alle 13 neuen Felder haben maxDepth: 0 um Response-Explosion zu verhindern | maxDepth on relationship fields restricts population depth regardless of query-level depth. maxDepth: 0 returns only IDs. |
| HUB-04 | Bestehendes Einzel-Feld `material` (single relation) bleibt unveraendert | Existing field is at line 119-125 in profile.ts -- simply do not modify it. |
| HIST-01 | Neue edit_history Collection mit Feldern: collection, doc_id, event, diff (JSON), editor (User-Relation), timestamp | status_historie.ts provides proven pattern. Access control helpers (isAdmin, isAdminOrMitarbeiter) are reusable. Collection registration in payload.config.ts is straightforward. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | Headless CMS with embedded config | Already installed, project foundation |
| @payloadcms/db-postgres | (bundled) | PostgreSQL adapter with push:true | Already configured, auto-schema sync |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @/access/is-admin | local | Access control for admin-only ops | edit_history delete access |
| @/access/is-admin-or-mitarbeiter | local | Access control for staff read | edit_history read access |
| @/access/role-checks (hasRole) | local | Role checking utility | Inline access functions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static filterOptions object | filterOptions function | Function needed only for dynamic filtering (sibling data). Static object is simpler and sufficient for `aktiv: { equals: true }` |
| Named tabs | Unnamed tabs | Named tabs nest data under tab name in DB. Unnamed tabs are presentational-only. Use UNNAMED to keep fields flat at collection root level. |

**Installation:**
```bash
# No new packages needed -- all APIs are built into Payload CMS 3.79
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── collections/
│   ├── produkte/
│   │   └── profile.ts           # MODIFY: add tabs + 13 relationship fields
│   ├── system/
│   │   ├── users.ts
│   │   ├── media.ts
│   │   └── edit-history.ts      # NEW: audit logging collection
│   ├── ausstattung/             # UNCHANGED (8 collections)
│   └── business/                # UNCHANGED (4 collections)
├── access/                      # UNCHANGED (reuse existing helpers)
└── payload.config.ts            # MODIFY: register EditHistory
```

### Pattern 1: Tabs Field Alongside Top-Level Fields
**What:** Payload CMS `type: 'tabs'` field can appear anywhere in a collection's `fields` array. When placed after other fields, those fields render above the tabs in the Admin UI. Unnamed tabs (no `name` property) are purely presentational and do NOT nest data in the database -- fields inside unnamed tabs remain at the collection root level.

**When to use:** When you want visual organization in the Admin UI without changing the data structure.

**Important caveat:** If the `type: 'tabs'` field is NOT the first field in the array, Payload does NOT auto-create a "Content" tab. The non-tab fields simply render above the tabs area. This is exactly the desired behavior for this phase.

**Example:**
```typescript
// Source: Payload CMS docs + verified against project patterns
fields: [
  // These render as normal fields above the tabs
  { name: 'name_technisch', type: 'text', required: true },
  { name: 'name_einfach', type: 'text', required: true },
  // ... more top-level fields ...

  // This renders as a tabbed section below the fields above
  {
    type: 'tabs',
    tabs: [
      {
        label: 'Kombinationen',  // No 'name' = unnamed tab = flat data
        fields: [
          { name: 'erlaubte_produkttypen', type: 'relationship', /* ... */ },
        ],
      },
      {
        label: 'Ausstattung',    // No 'name' = unnamed tab = flat data
        fields: [
          { name: 'erlaubte_farben', type: 'relationship', /* ... */ },
        ],
      },
    ],
  },

  // Sidebar fields still work as expected
  { name: 'aktiv', type: 'checkbox', admin: { position: 'sidebar' } },
]
```

### Pattern 2: hasMany Relationship with filterOptions + maxDepth
**What:** Relationship fields with `hasMany: true`, `maxDepth: 0`, static `filterOptions`, and `admin.allowCreate: true`.

**When to use:** For every one of the 13 new Hub fields on Profile.

**Example:**
```typescript
// Source: Payload CMS relationship docs
{
  name: 'erlaubte_farben',
  type: 'relationship',
  label: 'Erlaubte Farben',
  relationTo: 'farben',
  hasMany: true,
  maxDepth: 0,
  filterOptions: {
    aktiv: { equals: true },
  },
  admin: {
    allowCreate: true,
    description: 'Welche Farben sind fuer dieses Profil erlaubt? Leer = Fallback auf Material-Filter.',
  },
}
```

**Data behavior with maxDepth: 0:**
- API response returns array of UUIDs: `["uuid1", "uuid2", "uuid3"]`
- NOT nested objects: `[{ id: "uuid1", name: "Weiss", ... }]`
- This prevents response explosion when Profile has 13 relationship fields

### Pattern 3: Audit Collection (status_historie pattern)
**What:** Immutable audit trail collection with restricted access.

**When to use:** For `edit_history` -- follows the proven `status_historie.ts` pattern.

**Key differences from status_historie:**
| Aspect | status_historie | edit_history |
|--------|-----------------|--------------|
| Purpose | Anfrage status changes | Document edit tracking |
| create access | isAdminOrMitarbeiter | () => false (only via overrideAccess in hooks, Phase 11) |
| read access | isAdminOrMitarbeiter | isAdminOrMitarbeiter |
| update access | () => false | () => false |
| delete access | () => false | isAdmin (admin can clean up) |
| Admin group | Business | System |

**Example:**
```typescript
// Source: src/collections/business/status-historie.ts (project pattern)
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/is-admin'
import { isAdminOrMitarbeiter } from '@/access/is-admin-or-mitarbeiter'

export const EditHistory: CollectionConfig = {
  slug: 'edit_history',
  labels: { singular: 'History-Eintrag', plural: 'Edit-History' },
  admin: {
    group: 'System',
    useAsTitle: 'event',
    defaultColumns: ['collection', 'doc_id', 'event', 'editor', 'timestamp'],
  },
  access: {
    create: () => false,  // Only via overrideAccess in hooks (Phase 11)
    read: isAdminOrMitarbeiter,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'collection', type: 'text', required: true, label: 'Collection' },
    { name: 'doc_id', type: 'text', required: true, label: 'Dokument-ID' },
    { name: 'event', type: 'text', required: true, label: 'Event' },
    { name: 'diff', type: 'json', label: 'Aenderungen' },
    { name: 'editor', type: 'relationship', relationTo: 'users', label: 'Bearbeiter' },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      label: 'Zeitpunkt',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
```

### Pattern 4: Collection Registration in payload.config.ts
**What:** Adding new collection to the config's collections array.

**Example:**
```typescript
// src/payload.config.ts
import { EditHistory } from './collections/system/edit-history'

export default buildConfig({
  collections: [
    // System
    Users,
    Media,
    EditHistory,  // NEW -- add in System group
    // ... rest unchanged
  ],
})
```

### Anti-Patterns to Avoid
- **Named tabs when flat data is needed:** Using `name` on tabs causes data nesting (`tab.field` instead of `field`). Use unnamed tabs (label only) to keep data flat.
- **Missing maxDepth on hasMany relationships:** Without `maxDepth: 0`, Profile API responses could explode to 500KB+ when 13 relationships are populated with full objects at default depth.
- **Using `create: () => true` on edit_history:** The CONTEXT.md explicitly specifies `create` via `overrideAccess` only. Using `() => true` would allow anyone to create history entries via API.
- **Modifying the existing `material` field:** HUB-04 requires it stays as-is. Do not add `hasMany`, `maxDepth`, `filterOptions`, or `admin.allowCreate` to it.
- **Wrapping existing fields in a "Stammdaten" tab:** CONTEXT.md explicitly says NO -- existing fields stay as top-level fields, no tab wrapping.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema migration | Manual SQL ALTER TABLE | Payload `push: true` on postgres adapter | Auto-syncs schema on server restart |
| Type generation | Manual TypeScript interfaces | `npm run generate:types` | Generates from collection config |
| Import map updates | Manual component registration | `npm run generate:importmap` | Required after changing admin components |
| Access control | Inline role checks | Existing `isAdmin`, `isAdminOrMitarbeiter` helpers | DRY, tested, consistent |
| Dropdown filtering | Frontend JS filter on options | `filterOptions` on relationship field | Server-side, faster, fewer items loaded |

**Key insight:** Payload's `push: true` with PostgreSQL handles all DDL (CREATE TABLE, ALTER TABLE ADD COLUMN) automatically when the server starts. No migration files are needed for Phase 7's schema changes.

## Common Pitfalls

### Pitfall 1: Named Tabs Create Nested Data
**What goes wrong:** Using `name: 'kombinationen'` on a tab causes all fields inside to be stored as `kombinationen.erlaubte_produkttypen` instead of `erlaubte_produkttypen`.
**Why it happens:** Payload CMS uses the tab name to namespace the data structure.
**How to avoid:** Use unnamed tabs with only a `label` property. This makes tabs purely presentational.
**Warning signs:** After schema push, check the database -- columns should be `erlaubte_produkttypen` on the `profile` table, NOT nested under a `kombinationen` JSONB column.

### Pitfall 2: filterOptions on Collections Without aktiv Field
**What goes wrong:** `filterOptions: { aktiv: { equals: true } }` on a relationship to a collection without an `aktiv` field would show no results or throw errors.
**Why it happens:** The Where clause references a non-existent field.
**How to avoid:** Verified: ALL 13 target collections (produkttypen, fensterformen, fluegelanzahl, oeffnungsarten, zusatzlichter, farben, dichtungsfarben, verglasungen, schallschutz, sicherheitsglas, glasdekore, sprossen, extras) have an `aktiv` checkbox field. Safe to apply uniformly.
**Warning signs:** Relationship dropdown in Admin UI shows empty when data exists.

### Pitfall 3: Forgetting generate:types After Schema Change
**What goes wrong:** TypeScript types don't include new fields. Code that references `profile.erlaubte_farben` gets type errors.
**Why it happens:** Payload generates types from collection config, but only when explicitly run.
**How to avoid:** After any collection config change, run: `npm run generate:types && npm run generate:importmap`
**Warning signs:** IDE shows red underlines on new field names.

### Pitfall 4: push:true Without DB Backup
**What goes wrong:** Schema push on PostgreSQL is additive (adds columns/tables) but cannot undo if something goes wrong.
**Why it happens:** `push: true` auto-applies DDL on server start. No rollback mechanism.
**How to avoid:** Create a DB dump before starting the server after schema changes: `pg_dump > backup.sql`
**Warning signs:** Server logs show "pushing schema changes" on startup.

### Pitfall 5: Test Mocks Don't Include New Fields
**What goes wrong:** Existing test file `tests/unit/test-filters.test.ts` has `mockProfile()` function that creates Profile objects. After adding 13 new fields, the mock may need updating for future phases.
**Why it happens:** TypeScript strict mode + generated types will flag missing fields.
**How to avoid:** For Phase 7 (data model only, no filter changes), this is not blocking. But note: `mockProfile()` in test-filters.test.ts will need updating when Phase 9 (Filter Logic Refactor) begins.
**Warning signs:** `npx jest` fails with type errors on Profile mocks after `generate:types`.

## Code Examples

### Complete Profile.ts Hub Fields (All 13 Fields)

```typescript
// Source: CONTEXT.md decisions + Payload CMS relationship docs
// Placement: After existing fields, before sidebar fields in profile.ts

{
  type: 'tabs',
  tabs: [
    {
      label: 'Kombinationen',
      description: 'Welche Produkt-Kombinationen sind fuer dieses Profil erlaubt?',
      fields: [
        {
          name: 'erlaubte_produkttypen',
          type: 'relationship',
          label: 'Erlaubte Produkttypen',
          relationTo: 'produkttypen',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Produkttypen koennen mit diesem Profil konfiguriert werden? Leer = keine Einschraenkung.',
          },
        },
        {
          name: 'erlaubte_fensterformen',
          type: 'relationship',
          label: 'Erlaubte Fensterformen',
          relationTo: 'fensterformen',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Fensterformen sind fuer dieses Profil verfuegbar? Leer = alle aktiven Formen.',
          },
        },
        {
          name: 'erlaubte_fluegelanzahl',
          type: 'relationship',
          label: 'Erlaubte Fluegelanzahl',
          relationTo: 'fluegelanzahl',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Fluegelanzahlen sind moeglich? Leer = alle aktiven Optionen.',
          },
        },
        {
          name: 'erlaubte_oeffnungsarten',
          type: 'relationship',
          label: 'Erlaubte Oeffnungsarten',
          relationTo: 'oeffnungsarten',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Oeffnungsarten unterstuetzt dieses Profil? Leer = alle aktiven Arten.',
          },
        },
        {
          name: 'erlaubte_zusatzlichter',
          type: 'relationship',
          label: 'Erlaubte Zusatzlichter',
          relationTo: 'zusatzlichter',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Zusatzlichter (Ober-/Unterlicht) sind moeglich? Leer = alle aktiven Optionen.',
          },
        },
      ],
    },
    {
      label: 'Ausstattung',
      description: 'Welche Ausstattungsoptionen sind fuer dieses Profil erlaubt?',
      fields: [
        {
          name: 'erlaubte_farben',
          type: 'relationship',
          label: 'Erlaubte Farben',
          relationTo: 'farben',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Farben sind fuer dieses Profil erlaubt? Leer = Fallback auf Material-Filter.',
          },
        },
        {
          name: 'erlaubte_dichtungsfarben',
          type: 'relationship',
          label: 'Erlaubte Dichtungsfarben',
          relationTo: 'dichtungsfarben',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Dichtungsfarben stehen zur Auswahl? Leer = alle aktiven Dichtungsfarben.',
          },
        },
        {
          name: 'erlaubte_verglasungen',
          type: 'relationship',
          label: 'Erlaubte Verglasungen',
          relationTo: 'verglasungen',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Verglasungsoptionen sind verfuegbar? Leer = alle aktiven Verglasungen.',
          },
        },
        {
          name: 'erlaubte_schallschutz',
          type: 'relationship',
          label: 'Erlaubter Schallschutz',
          relationTo: 'schallschutz',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Schallschutz-Optionen bietet dieses Profil? Leer = alle aktiven Optionen.',
          },
        },
        {
          name: 'erlaubte_sicherheitsglas',
          type: 'relationship',
          label: 'Erlaubtes Sicherheitsglas',
          relationTo: 'sicherheitsglas',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welches Sicherheitsglas ist verfuegbar? Leer = alle aktiven Optionen.',
          },
        },
        {
          name: 'erlaubte_glasdekore',
          type: 'relationship',
          label: 'Erlaubte Glasdekore',
          relationTo: 'glasdekore',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Glasdekore koennen gewaehlt werden? Leer = alle aktiven Dekore.',
          },
        },
        {
          name: 'erlaubte_sprossen',
          type: 'relationship',
          label: 'Erlaubte Sprossen',
          relationTo: 'sprossen',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Sprossentypen sind moeglich? Leer = alle aktiven Sprossen.',
          },
        },
        {
          name: 'erlaubte_extras',
          type: 'relationship',
          label: 'Erlaubte Extras',
          relationTo: 'extras',
          hasMany: true,
          maxDepth: 0,
          filterOptions: { aktiv: { equals: true } },
          admin: {
            allowCreate: true,
            description: 'Welche Extras (Griffe, Beschlaege) sind verfuegbar? Leer = alle aktiven Extras.',
          },
        },
      ],
    },
  ],
}
```

### edit_history Collection Registration

```typescript
// src/payload.config.ts -- add import and registration
import { EditHistory } from './collections/system/edit-history'

// In collections array, add after Media in the System group:
collections: [
  // System
  Users,
  Media,
  EditHistory,  // NEW
  // ... rest stays identical
],
```

### Post-Change Commands

```bash
# After modifying profile.ts and creating edit-history.ts:
npm run generate:importmap && npm run generate:types

# Then restart dev server (push:true will auto-create DB columns/tables):
npm run dev
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Distributed relations (material->profile, farbe->material) | Centralized hub (profile->everything) | v1.1 Phase 7 | Profile becomes single source of truth for allowed combinations |
| No audit trail for edits | edit_history collection | v1.1 Phase 7 (collection), Phase 11 (hooks) | Foundation for full edit tracking |
| No maxDepth on relationships | maxDepth: 0 on all hub fields | v1.1 Phase 7 | Prevents 500KB+ API responses |

**Deprecated/outdated:**
- None in this phase. Existing patterns and APIs are current for Payload 3.79.

## Open Questions

1. **Tab rendering order with existing sidebar fields**
   - What we know: Sidebar fields (slug, aktiv, sortOrder) use `admin: { position: 'sidebar' }` which positions them in the right sidebar regardless of their position in the fields array.
   - What's unclear: Whether the tabs field's position relative to sidebar fields matters for rendering order.
   - Recommendation: Place tabs field BEFORE sidebar fields in the array. Sidebar fields always render in the sidebar regardless of array position, so this is safe.

2. **edit_history useAsTitle field**
   - What we know: CONTEXT.md leaves this to Claude's discretion.
   - What's unclear: Whether `event` alone is descriptive enough as title.
   - Recommendation: Use `event` as useAsTitle -- it's the most descriptive single field. Combined with defaultColumns showing collection, doc_id, event, editor, timestamp, the list view will be informative.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest with ts-jest (jsdom environment) |
| Config file | jest.config.ts |
| Quick run command | `npx jest --testPathPattern="test-name" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HUB-01 | 13 hasMany fields exist in profile config with correct tabs structure | unit (config validation) | `npx jest tests/unit/test-profile-hub.test.ts -x` | No -- Wave 0 |
| HUB-02 | All 13 fields have filterOptions and allowCreate | unit (config validation) | `npx jest tests/unit/test-profile-hub.test.ts -x` | No -- Wave 0 |
| HUB-03 | All 13 fields have maxDepth: 0 | unit (config validation) | `npx jest tests/unit/test-profile-hub.test.ts -x` | No -- Wave 0 |
| HUB-04 | material field unchanged (single, no maxDepth, no filterOptions) | unit (config validation) | `npx jest tests/unit/test-profile-hub.test.ts -x` | No -- Wave 0 |
| HIST-01 | edit_history collection has correct fields and access | unit (config validation) | `npx jest tests/unit/test-edit-history.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-profile-hub.test.ts tests/unit/test-edit-history.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-profile-hub.test.ts` -- covers HUB-01, HUB-02, HUB-03, HUB-04 (validate profile collection config structure)
- [ ] `tests/unit/test-edit-history.test.ts` -- covers HIST-01 (validate edit_history collection config structure)

*(Note: These tests validate the collection config objects programmatically -- they import the collection config and assert on field properties, access functions, and structure. No database or running server needed.)*

## Sources

### Primary (HIGH confidence)
- Payload CMS official docs: [Tabs Field](https://payloadcms.com/docs/fields/tabs) -- tab types, named vs unnamed, data structure impact
- Payload CMS official docs: [Relationship Field](https://payloadcms.com/docs/fields/relationship) -- filterOptions, maxDepth, admin.allowCreate, hasMany behavior
- Payload CMS GitHub: [tabs.mdx](https://github.com/payloadcms/payload/blob/main/docs/fields/tabs.mdx) -- raw docs source
- Payload CMS GitHub: [relationship.mdx](https://github.com/payloadcms/payload/blob/main/docs/fields/relationship.mdx) -- raw docs source
- Project source: `src/collections/business/status-historie.ts` -- proven audit collection pattern
- Project source: `src/collections/produkte/profile.ts` -- current profile config (145 lines)
- Project source: `src/payload.config.ts` -- collection registration pattern
- Project source: `src/access/*.ts` -- access control helpers

### Secondary (MEDIUM confidence)
- Project doc: `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` -- detailed implementation plan with code snippets

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or project source code.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Payload 3.79 is installed and all APIs used are documented
- Architecture: HIGH -- tabs, relationships, and access control patterns verified in official docs and existing project code
- Pitfalls: HIGH -- verified all 13 target collections have `aktiv` field; named vs unnamed tabs behavior confirmed in docs

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (Payload 3.x API is stable; no breaking changes expected in minor versions)
