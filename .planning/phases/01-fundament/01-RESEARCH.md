# Phase 1: Fundament - Research

**Researched:** 2026-03-09
**Domain:** Next.js + Payload CMS 3.0 + PostgreSQL -- CMS Collections, Relationships, Seed Script
**Confidence:** HIGH

## Summary

Phase 1 builds the complete data model foundation: a Next.js app with Payload CMS 3.0 embedded, connected to PostgreSQL, with 17+ CMS Collections for the window configurator domain (Produkttypen, Materialien, Profile, Farben, Verglasungen, etc.), conditional relationship filtering, and a seed script with realistic Drutex data.

Payload CMS 3.0 (latest: v3.79.0) runs natively inside Next.js App Router. Collections are defined as TypeScript config objects (~20-50 lines each). The `@payloadcms/db-postgres` adapter (latest: v3.78.0) uses Drizzle ORM under the hood with automatic schema push in development mode. Admin Panel sidebar organization uses `admin.group` per collection. Conditional filtering between collections (e.g., Material filters Profile) is implemented via `filterOptions` on relationship fields. Seeding uses `payload run src/seed.ts` with the Local API.

**Primary recommendation:** Use `create-payload-app` with the blank template (not website template), PostgreSQL adapter with `idType: 'uuid'`, organize 17+ collections into 4 admin groups (Produkte, Ausstattung, Business, System), implement conditional filtering via relationship `filterOptions`, and build a modular seed script using Payload Local API.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Echte Drutex-Daten verwenden (keine Platzhalter)
- 4 Kunststoff-Profile: Iglo 5 (Standard, 70mm, Uw 1.3), Iglo Energy (Premium, 82mm, Uw 0.95), Iglo Energy Classic (Top, 82mm, Uw 0.90), Iglo Light (Einstieg, 60mm, Uw 1.4)
- Nur Material "Kunststoff" im Seed befuellt -- Holz, Alu, Kunststoff-Alu als Collections angelegt aber leer
- Schaetzpreise reichen (z.B. Iglo 5: ~150 EUR/m2, Iglo Energy: ~220 EUR/m2) -- werden spaeter mit echten Preisen ueberschrieben
- ~10-15 Farben im Seed: Weiss, Cremweiss (Standard), Golden Oak, Nussbaum, Winchester, Mahagoni, Schokobraun (Dekor), Anthrazit RAL 7016, Basaltgrau RAL 7012, Silbergrau RAL 9006, Schwarzbraun RAL 8022 (Uni), plus RAL-Sonderfarbe als Kategorie
- 4 Verglasungen: 2-fach Standard (Ug 1.1), 3-fach Standard (Ug 0.7), 3-fach Schallschutz, 3-fach Sicherheitsglas
- Extras: Sprossen (Wiener, Helima, aufgesetzt), Glasdekore (Ornament, Milch, Chinchilla etc.), Griffe/Beschlaege (Standard, Sicherheit, abschliessbar)
- 4 Admin-Gruppen: Produkte, Ausstattung, Business, System
- Deutsche Labels im Admin Panel (nicht englisch)
- Jede Collection hat ein "aktiv" Boolean-Feld (Standard: true)
- "sortOrder" Number-Feld nur bei sichtbaren Collections (nicht bei Business-Collections)
- Preismodell: Grundpreis pro m2 + additive Aufpreise
- Aufpreise: Standard-Aufpreis direkt im Item + Preisregeln-Collection fuer materialabhaengige Ueberschreibungen
- Anzeige: "ab X Euro" als unverbindliche Vorschau, verbindlicher Preis erst nach Server-Berechnung
- Rabattcodes: Prozent-Rabatt, Festbetrag-Rabatt, Min-Bestellwert, Gueltigkeitszeitraum
- Farben Aussen und Innen unabhaengig waehlbar, mit "Gleich wie Aussen" als Default
- Dichtungsfarbe separat waehlbar
- Farb-Kategorien: Standard, Dekor, Uni-Farben, RAL-Sonderfarbe

### Claude's Discretion
- Exakte Payload Collection Slugs und Field Types
- Database-Adapter Konfiguration (drizzle vs. node-postgres)
- TypeScript Ordnerstruktur und Import-Patterns
- ESLint/Prettier Konfiguration
- Seed-Script Architektur (einzelnes Script vs. modulare Dateien)
- Exakte Schaetzpreise fuer Grundpreise und Aufpreise

### Deferred Ideas (OUT OF SCOPE)
- Rolllaeden/Insektenschutz als Extras -- eigener Konfigurator in v2 (KONF-V2-02)
- Tueren-Konfigurator -- eigene Pipeline in v2 (KONF-V2-01)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETUP-01 | Next.js App Router + Payload CMS 3.0 embedded + PostgreSQL | create-payload-app setup, @payloadcms/db-postgres adapter config |
| SETUP-02 | Tailwind CSS + Shadcn UI Basis-Setup | Included in create-payload-app, shadcn init for component library |
| SETUP-03 | TypeScript strict, ESLint, saubere Ordnerstruktur, Git-ready | Payload ships with TS strict, ESLint config included |
| CMS-01 | Collection `produkttypen` | Payload collection config with relationship fields, admin.group |
| CMS-02 | Collection `materialien` | Collection with Multi-Ref to profile, erlaubte_profile relationship |
| CMS-03 | Collection `profile` | Collection with technical data fields (uw_wert, kammern, bautiefe), material relationship |
| CMS-04 | Collection `fluegelanzahl` | Collection with fuer_produkttypen relationship |
| CMS-05 | Collection `zusatzlichter` | Collection with kombinierbar_mit relationship |
| CMS-06 | Collection `oeffnungsarten` | Collection with fuer_fenster/fuer_balkontuer booleans |
| CMS-07 | Collection `fensterformen` | Collection with erlaubte_fluegelanzahl/oeffnungsarten relationships |
| CMS-08 | Collection `farben` | Collection with kategorie select, erlaubte_materialien relationship |
| CMS-09 | Collection `dichtungsfarben` | Simple collection with farb_code, aktiv |
| CMS-10 | Collection `verglasungen` | Collection with uw_wert, aufpreis number fields |
| CMS-11 | Collections `schallschutz`, `sicherheitsglas`, `glasdekore`, `sprossen`, `extras` | Multiple simple collections with aufpreis fields |
| CMS-12 | Collection `preisregeln` | Collection with produkttyp/material/profil relationships, grundpreis_pro_m2 |
| CMS-13 | Collection `rabattcodes` | Collection with code, typ select, gueltigkeit dates, min_bestellwert |
| CMS-14 | Collection `anfragen` | Collection with status select, produkte array, kontaktdaten group, snapshot JSON |
| CMS-15 | Collection `status_historie` | Audit trail collection, write-once via hooks |
| CMS-16 | Konditionale API-Filterung | Payload relationship filterOptions with siblingData |
| CMS-17 | Seed-Script mit realistischen Testdaten | payload run src/seed.ts using Local API |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.79.x | CMS framework embedded in Next.js | Official latest stable, code-first collections |
| next | 15.x | React meta-framework (App Router) | Required by Payload 3.x, ships with create-payload-app |
| @payloadcms/db-postgres | 3.78.x | PostgreSQL database adapter | Official Payload adapter, uses Drizzle ORM internally |
| @payloadcms/richtext-lexical | 3.78.x | Rich text editor | Default rich text editor in Payload 3 |
| react | 19.x | UI library | Ships with Next.js 15 |
| typescript | 5.x | Type safety | Required by Payload, strict mode |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | 4.x | Utility CSS | Styling (ships with create-payload-app) |
| @payloadcms/next | 3.78.x | Next.js integration plugin | Auto-included by create-payload-app |
| shadcn/ui | latest | Component library | SETUP-02: will be initialized but not heavily used in Phase 1 |
| sharp | latest | Image optimization | Required by Payload for media uploads |
| dotenv | latest | Environment variables | DATABASE_URL, PAYLOAD_SECRET |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @payloadcms/db-postgres | @payloadcms/db-vercel-postgres | Vercel-specific, not needed for Coolify deployment |
| idType: 'uuid' | idType: 'serial' | UUID is more portable and avoids ID collision in seed scripts |
| blank template | website template | Website template adds Pages/Posts/Media that conflict with custom collections |

**Installation:**
```bash
npx create-payload-app@latest christ-fensterhandel --template blank
cd christ-fensterhandel
npm install sharp
npx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (frontend)/         # Future frontend routes (Phase 2+)
│   ├── (payload)/          # Payload admin routes (auto-generated)
│   │   └── admin/
│   └── layout.tsx
├── collections/
│   ├── produkte/           # Admin group: Produkte
│   │   ├── produkttypen.ts
│   │   ├── materialien.ts
│   │   ├── profile.ts
│   │   ├── fluegelanzahl.ts
│   │   ├── oeffnungsarten.ts
│   │   ├── fensterformen.ts
│   │   └── zusatzlichter.ts
│   ├── ausstattung/        # Admin group: Ausstattung
│   │   ├── farben.ts
│   │   ├── dichtungsfarben.ts
│   │   ├── verglasungen.ts
│   │   ├── schallschutz.ts
│   │   ├── sicherheitsglas.ts
│   │   ├── glasdekore.ts
│   │   ├── sprossen.ts
│   │   └── extras.ts
│   ├── business/           # Admin group: Business
│   │   ├── anfragen.ts
│   │   ├── preisregeln.ts
│   │   ├── rabattcodes.ts
│   │   └── status-historie.ts
│   └── system/             # Admin group: System
│       └── users.ts
├── seed/
│   ├── index.ts            # Main seed orchestrator (phased: independent first, then dependent)
│   ├── data/
│   │   ├── produkttypen.ts
│   │   ├── materialien.ts
│   │   ├── profile.ts
│   │   ├── farben.ts
│   │   ├── verglasungen.ts
│   │   └── ...
│   └── utils.ts            # Helpers (lookup by slug, etc.)
├── payload.config.ts
└── payload-types.ts        # Auto-generated types
```

### Pattern 1: Collection Config with Admin Group
**What:** Every collection specifies its admin group for sidebar organization
**When to use:** All 17+ collections

```typescript
// src/collections/produkte/produkttypen.ts
import type { CollectionConfig } from 'payload'

export const Produkttypen: CollectionConfig = {
  slug: 'produkttypen',
  labels: {
    singular: 'Produkttyp',
    plural: 'Produkttypen',
  },
  admin: {
    group: 'Produkte',
    useAsTitle: 'name',
    defaultColumns: ['name', 'aktiv', 'sortOrder', 'updatedAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug',
      admin: { position: 'sidebar' } },
    { name: 'beschreibung', type: 'textarea', label: 'Beschreibung' },
    { name: 'bild', type: 'upload', relationTo: 'media', label: 'Bild' },
    {
      name: 'erlaubte_materialien',
      type: 'relationship',
      relationTo: 'materialien',
      hasMany: true,
      label: 'Erlaubte Materialien',
    },
    { name: 'aktiv', type: 'checkbox', defaultValue: true, label: 'Aktiv',
      admin: { position: 'sidebar' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Sortierung',
      admin: { position: 'sidebar' } },
  ],
}
```

### Pattern 2: Conditional Relationship Filtering (filterOptions)
**What:** Relationship fields that dynamically filter based on other field values
**When to use:** CMS-16 -- Material->Profile, Produkttyp->Fluegel, etc.

The `filterOptions` approach works for admin panel dropdowns. For API-level filtering (which is what the configurator frontend will use), the filtering happens through query parameters on the REST/Local API.

For Phase 1, the primary conditional filtering is:
1. **Material -> Profile**: `profile` collection has a `material` relationship field pointing to `materialien`. Query: `GET /api/profile?where[material][equals]=<materialId>`
2. **Produkttyp -> Fluegelanzahl**: `fluegelanzahl` has boolean fields `fuer_fenster` / `fuer_balkontuer`. Query filtered by these booleans.
3. **Fensterform -> Fluegelanzahl/Oeffnungsarten**: Multi-ref relationships `erlaubte_fluegelanzahl` and `erlaubte_oeffnungsarten`

```typescript
// In admin panel: filterOptions on a relationship field
{
  name: 'profil',
  type: 'relationship',
  relationTo: 'profile',
  filterOptions: ({ siblingData }) => {
    if (siblingData?.material) {
      return { material: { equals: siblingData.material } }
    }
    return {}
  },
}
```

For API queries (used by configurator frontend in Phase 2):
```typescript
// Fetch profiles filtered by material
const profiles = await payload.find({
  collection: 'profile',
  where: {
    material: { equals: materialId },
    aktiv: { equals: true },
  },
  sort: 'sortOrder',
})
```

### Pattern 3: Anfragen Collection with Status Workflow + History
**What:** Request collection with status field and immutable audit trail
**When to use:** CMS-14, CMS-15

```typescript
// src/collections/business/anfragen.ts
export const Anfragen: CollectionConfig = {
  slug: 'anfragen',
  labels: { singular: 'Anfrage', plural: 'Anfragen' },
  admin: {
    group: 'Business',
    useAsTitle: 'anfrage_nummer',
    defaultColumns: ['anfrage_nummer', 'status', 'kunde_name', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        // On status change, create status_historie entry
        if (operation === 'update' && originalDoc?.status !== data?.status) {
          await req.payload.create({
            collection: 'status_historie',
            data: {
              anfrage: originalDoc.id,
              von_status: originalDoc.status,
              zu_status: data.status,
              geaendert_von: req.user?.id,
              zeitpunkt: new Date().toISOString(),
            },
          })
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'anfrage_nummer', type: 'text', required: true, unique: true, label: 'Anfrage-Nr.' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'neu',
      options: [
        { label: 'Neu', value: 'neu' },
        { label: 'In Bearbeitung', value: 'in_bearbeitung' },
        { label: 'Bestaetigt', value: 'bestaetigt' },
        { label: 'Bezahlt', value: 'bezahlt' },
        { label: 'Abgeschlossen', value: 'abgeschlossen' },
        { label: 'Rueckfrage', value: 'rueckfrage' },
        { label: 'Abgelehnt', value: 'abgelehnt' },
      ],
      label: 'Status',
    },
    {
      name: 'produkte',
      type: 'array',
      label: 'Konfigurierte Produkte',
      fields: [
        { name: 'konfiguration_snapshot', type: 'json', label: 'Konfigurations-Snapshot' },
        { name: 'stueckzahl', type: 'number', defaultValue: 1, label: 'Stueckzahl' },
        { name: 'einzelpreis', type: 'number', label: 'Einzelpreis (EUR)' },
      ],
    },
    {
      name: 'kontaktdaten',
      type: 'group',
      label: 'Kontaktdaten',
      fields: [
        { name: 'vorname', type: 'text', required: true, label: 'Vorname' },
        { name: 'nachname', type: 'text', required: true, label: 'Nachname' },
        { name: 'email', type: 'email', required: true, label: 'E-Mail' },
        { name: 'telefon', type: 'text', label: 'Telefon' },
        { name: 'strasse', type: 'text', label: 'Strasse + Nr.' },
        { name: 'plz', type: 'text', label: 'PLZ' },
        { name: 'ort', type: 'text', label: 'Ort' },
        { name: 'nachricht', type: 'textarea', label: 'Nachricht' },
      ],
    },
    { name: 'gesamtpreis', type: 'number', label: 'Gesamtpreis (EUR)' },
    { name: 'rabattcode', type: 'relationship', relationTo: 'rabattcodes', label: 'Rabattcode' },
  ],
}
```

### Pattern 4: Immutable Status History (Write-Only Collection)
**What:** Audit trail that can only be created, never edited or deleted
**When to use:** CMS-15

```typescript
// src/collections/business/status-historie.ts
export const StatusHistorie: CollectionConfig = {
  slug: 'status_historie',
  labels: { singular: 'Status-Aenderung', plural: 'Status-Historie' },
  admin: {
    group: 'Business',
    defaultColumns: ['anfrage', 'von_status', 'zu_status', 'zeitpunkt'],
  },
  access: {
    create: () => true,      // Created by hooks
    read: () => true,        // Anyone authenticated can read
    update: () => false,     // NEVER updatable
    delete: () => false,     // NEVER deletable
  },
  fields: [
    { name: 'anfrage', type: 'relationship', relationTo: 'anfragen', required: true, label: 'Anfrage' },
    { name: 'von_status', type: 'text', required: true, label: 'Von Status' },
    { name: 'zu_status', type: 'text', required: true, label: 'Zu Status' },
    { name: 'geaendert_von', type: 'relationship', relationTo: 'users', label: 'Geaendert von' },
    { name: 'zeitpunkt', type: 'date', required: true, label: 'Zeitpunkt',
      admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'kommentar', type: 'textarea', label: 'Kommentar' },
  ],
}
```

### Pattern 5: Seed Script with Phased Execution
**What:** Modular seed script that creates data in dependency order
**When to use:** CMS-17

```typescript
// src/seed/index.ts
import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding Phase 1: Independent collections...')
  // Collections without relationships first
  await seedProdukttypen(payload)
  await seedMaterialien(payload)
  await seedDichtungsfarben(payload)

  console.log('Seeding Phase 2: Dependent collections...')
  // Collections that reference Phase 1 data
  await seedProfile(payload)     // depends on materialien
  await seedFarben(payload)      // depends on materialien
  await seedFluegelanzahl(payload)
  await seedOeffnungsarten(payload)
  await seedFensterformen(payload) // depends on fluegelanzahl, oeffnungsarten
  await seedZusatzlichter(payload)
  await seedVerglasungen(payload)
  await seedSchallschutz(payload)
  await seedSicherheitsglas(payload)
  await seedGlasdekore(payload)
  await seedSprossen(payload)
  await seedExtras(payload)

  console.log('Seeding Phase 3: Business collections...')
  await seedPreisregeln(payload) // depends on produkttypen, materialien, profile

  console.log('Seeding complete!')
  process.exit(0)
}

seed()
```

Run with: `npx payload run src/seed/index.ts`

### Anti-Patterns to Avoid
- **Hardcoding collection data in frontend**: All configurator options MUST come from CMS. No switch/case with product names in React components.
- **Using SQLite for development**: Project requires PostgreSQL from day one (per CLAUDE.md). No `@payloadcms/db-sqlite`.
- **Bidirectional relationships without purpose**: Payload auto-generates reverse relationships. Only define the forward direction; avoid circular reference confusion.
- **Skipping `aktiv` field in queries**: Every frontend query must filter `aktiv: { equals: true }`. Build a helper function.
- **German field names in code**: Use `snake_case` English for slugs/field names, German only for `label`. E.g., slug `fensterformen` but field name `erlaubte_fluegelanzahl`, label `Erlaubte Fluegelanzahl`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database schema management | Custom SQL migrations | Payload auto-push (dev) + `payload migrate` (prod) | Drizzle ORM handles DDL automatically |
| Admin CRUD interface | Custom React admin | Payload Admin Panel | Auto-generated from collection configs |
| REST API for collections | Express/Fastify routes | Payload REST API (auto-generated) | `GET/POST/PUT/DELETE /api/{slug}` out of the box |
| Relationship data fetching | Custom JOIN queries | Payload `depth` parameter on queries | `depth: 1` auto-populates relationships |
| Authentication | Custom JWT/session | Payload Auth (Users collection) | Built-in session management |
| Image optimization | Custom sharp pipeline | Payload Upload + sharp | Auto-resizes on upload |
| Type generation | Manual TS interfaces | `payload generate:types` | Auto-generates `payload-types.ts` from collections |

**Key insight:** Payload CMS generates 80% of what Phase 1 needs (CRUD, API, admin UI, types) from collection config files. The custom work is defining the right fields, relationships, and writing the seed script.

## Common Pitfalls

### Pitfall 1: Circular Relationship Dependencies in Seed Script
**What goes wrong:** Seed script tries to create a `produkttyp` that references `materialien` which references `profile` which references `materialien`. Chicken-and-egg.
**Why it happens:** Collections have bidirectional relationships.
**How to avoid:** Seed in phases. Create entities first WITHOUT relationship fields, then update them with relationships in a second pass using `payload.update()`.
**Warning signs:** "Document not found" errors during seeding.

### Pitfall 2: Admin Panel Performance with 17+ Collections
**What goes wrong:** Sidebar becomes cluttered and navigation slow.
**Why it happens:** Payload renders all collections in the sidebar by default.
**How to avoid:** Use `admin.group` on every collection (4 groups: Produkte, Ausstattung, Business, System). Use `admin.hidden` for internal-only collections if needed.
**Warning signs:** Users complain about finding things in the admin.

### Pitfall 3: Missing `aktiv` Filter on Queries
**What goes wrong:** Deactivated products/options still appear in the configurator.
**Why it happens:** Forgetting to add `where: { aktiv: { equals: true } }` to queries.
**How to avoid:** Create a shared query helper: `buildActiveQuery(additionalWhere)` that always includes the aktiv filter.
**Warning signs:** Disabled items appearing in frontend.

### Pitfall 4: PostgreSQL Connection String Mismatch
**What goes wrong:** App fails to connect to database on startup.
**Why it happens:** DATABASE_URL format wrong, or PostgreSQL not running.
**How to avoid:** Use standard format: `postgresql://user:password@localhost:5432/christ_fensterhandel`. Test connection before starting app.
**Warning signs:** `ECONNREFUSED` or `authentication failed` errors.

### Pitfall 5: Type Safety Lost Between Payload Types and Frontend
**What goes wrong:** TypeScript types don't match actual CMS data structure after changes.
**Why it happens:** Forgetting to regenerate types after collection changes.
**How to avoid:** Run `npx payload generate:types` after ANY collection config change. Add it to dev script or pre-build.
**Warning signs:** TypeScript errors or runtime undefined errors on field access.

### Pitfall 6: Relationship Field `hasMany` Confusion
**What goes wrong:** Expecting an array but getting a single object, or vice versa.
**Why it happens:** `hasMany: true` returns array, `hasMany: false` (default) returns single doc.
**How to avoid:** Always explicitly set `hasMany` based on cardinality. Multi-Ref fields (erlaubte_materialien, erlaubte_profile) need `hasMany: true`.
**Warning signs:** `.map is not a function` or accessing `.id` on an array.

## Code Examples

### payload.config.ts (Complete Setup)
```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Import all collections
import { Produkttypen } from './collections/produkte/produkttypen'
import { Materialien } from './collections/produkte/materialien'
import { Profile } from './collections/produkte/profile'
import { Fluegelanzahl } from './collections/produkte/fluegelanzahl'
import { Oeffnungsarten } from './collections/produkte/oeffnungsarten'
import { Fensterformen } from './collections/produkte/fensterformen'
import { Zusatzlichter } from './collections/produkte/zusatzlichter'
import { Farben } from './collections/ausstattung/farben'
import { Dichtungsfarben } from './collections/ausstattung/dichtungsfarben'
import { Verglasungen } from './collections/ausstattung/verglasungen'
import { Schallschutz } from './collections/ausstattung/schallschutz'
import { Sicherheitsglas } from './collections/ausstattung/sicherheitsglas'
import { Glasdekore } from './collections/ausstattung/glasdekore'
import { Sprossen } from './collections/ausstattung/sprossen'
import { Extras } from './collections/ausstattung/extras'
import { Anfragen } from './collections/business/anfragen'
import { Preisregeln } from './collections/business/preisregeln'
import { Rabattcodes } from './collections/business/rabattcodes'
import { StatusHistorie } from './collections/business/status-historie'
import { Users } from './collections/system/users'
import { Media } from './collections/system/media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    idType: 'uuid',
  }),
  collections: [
    // Produkte
    Produkttypen, Materialien, Profile, Fluegelanzahl,
    Oeffnungsarten, Fensterformen, Zusatzlichter,
    // Ausstattung
    Farben, Dichtungsfarben, Verglasungen, Schallschutz,
    Sicherheitsglas, Glasdekore, Sprossen, Extras,
    // Business
    Anfragen, Preisregeln, Rabattcodes, StatusHistorie,
    // System
    Users, Media,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
```

### Profile Collection (Complex Example with Technical Data)
```typescript
// src/collections/produkte/profile.ts
import type { CollectionConfig } from 'payload'

export const Profile: CollectionConfig = {
  slug: 'profile',
  labels: { singular: 'Profil', plural: 'Profile' },
  admin: {
    group: 'Produkte',
    useAsTitle: 'name_technisch',
    defaultColumns: ['name_technisch', 'name_einfach', 'material', 'uw_wert', 'aktiv'],
  },
  fields: [
    { name: 'name_technisch', type: 'text', required: true, label: 'Technischer Name' },
    { name: 'name_einfach', type: 'text', required: true, label: 'Einfacher Name' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug',
      admin: { position: 'sidebar' } },
    { name: 'beschreibung', type: 'textarea', label: 'Beschreibung' },
    { name: 'bild', type: 'upload', relationTo: 'media', label: 'Profilbild' },
    {
      name: 'qualitaetsstufe',
      type: 'select',
      options: [
        { label: 'Einstieg', value: 'einstieg' },
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'Top', value: 'top' },
      ],
      label: 'Qualitaetsstufe',
    },
    {
      name: 'technische_daten',
      type: 'group',
      label: 'Technische Daten',
      fields: [
        { name: 'uw_wert', type: 'number', label: 'Uw-Wert (W/m2K)' },
        { name: 'kammern', type: 'number', label: 'Kammern' },
        { name: 'bautiefe_mm', type: 'number', label: 'Bautiefe (mm)' },
        { name: 'dichtungen', type: 'number', label: 'Dichtungen' },
      ],
    },
    {
      name: 'masse',
      type: 'group',
      label: 'Erlaubte Masse',
      fields: [
        { name: 'min_breite_mm', type: 'number', label: 'Min. Breite (mm)' },
        { name: 'max_breite_mm', type: 'number', label: 'Max. Breite (mm)' },
        { name: 'min_hoehe_mm', type: 'number', label: 'Min. Hoehe (mm)' },
        { name: 'max_hoehe_mm', type: 'number', label: 'Max. Hoehe (mm)' },
      ],
    },
    {
      name: 'material',
      type: 'relationship',
      relationTo: 'materialien',
      required: true,
      label: 'Material',
    },
    { name: 'aktiv', type: 'checkbox', defaultValue: true, label: 'Aktiv',
      admin: { position: 'sidebar' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Sortierung',
      admin: { position: 'sidebar' } },
  ],
}
```

### Seed Data Example (Drutex Profile)
```typescript
// src/seed/data/profile.ts
export const profileSeedData = [
  {
    name_technisch: 'Iglo 5',
    name_einfach: 'Standard',
    slug: 'iglo-5',
    beschreibung: 'Solide Grundausstattung mit guter Waermedaemmung. Das beste Preis-Leistungs-Verhaeltnis.',
    qualitaetsstufe: 'standard',
    technische_daten: {
      uw_wert: 1.3,
      kammern: 5,
      bautiefe_mm: 70,
      dichtungen: 2,
    },
    masse: {
      min_breite_mm: 400,
      max_breite_mm: 2600,
      min_hoehe_mm: 400,
      max_hoehe_mm: 2400,
    },
    material_slug: 'kunststoff', // resolved to ID during seeding
    aktiv: true,
    sortOrder: 1,
  },
  {
    name_technisch: 'Iglo Energy',
    name_einfach: 'Premium',
    slug: 'iglo-energy',
    beschreibung: 'Verbesserte Waermedaemmung fuer energiebewusste Bauherren.',
    qualitaetsstufe: 'premium',
    technische_daten: {
      uw_wert: 0.95,
      kammern: 7,
      bautiefe_mm: 82,
      dichtungen: 3,
    },
    masse: {
      min_breite_mm: 400,
      max_breite_mm: 2600,
      min_hoehe_mm: 400,
      max_hoehe_mm: 2400,
    },
    material_slug: 'kunststoff',
    aktiv: true,
    sortOrder: 2,
  },
  // ... Iglo Energy Classic, Iglo Light
]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload 2.x (Express) | Payload 3.x (Next.js native) | 2024 Q4 | Single codebase, no separate Express server |
| MongoDB default | PostgreSQL/SQLite support | Payload 2.0+ | Relational data model for this use case |
| Mongoose adapter | Drizzle ORM adapter | Payload 3.0 | Type-safe SQL, better migration support |
| Manual REST API | Auto-generated REST + GraphQL + Local API | Payload 3.0 | Zero API code needed for CRUD |

**Deprecated/outdated:**
- Payload 2.x patterns (Express server, Mongoose) -- do not use
- `@payloadcms/db-mongodb` for this project -- PostgreSQL is the fixed choice
- Website template as starting point -- too much boilerplate to remove for a custom app

## Open Questions

1. **Media Collection for Seed Images**
   - What we know: Collections reference images (bild fields) via upload to Media collection
   - What's unclear: Should seed script include placeholder images, or leave image fields empty?
   - Recommendation: Leave image fields empty in seed. They are optional for Phase 1 (admin-only). Real images uploaded manually later.

2. **Profiltyp Field (Flaechenversetzt/Flaechenbuendig)**
   - What we know: Docs mention this as a property of profiles
   - What's unclear: Whether this affects configurator logic or is display-only
   - Recommendation: Include as select field on profile collection. Display-only for now, may become conditional in Phase 2.

3. **Admin Panel Localization (DE Labels)**
   - What we know: User wants German labels in admin panel
   - What's unclear: Whether Payload admin i18n needs explicit config or if field labels suffice
   - Recommendation: Use German `label` properties on all fields. Payload admin UI itself stays English (changing it requires i18n plugin). Field labels being German is sufficient for Christ-Mitarbeiter usability.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet installed -- Phase 1 seed validation is manual (admin panel inspection) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx payload run src/seed/index.ts` (seed) + manual admin check |
| Full suite command | TBD (no test framework in Phase 1) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETUP-01 | App starts with Payload + PostgreSQL | smoke | `npm run dev` (manual verify) | n/a |
| SETUP-02 | Tailwind + Shadcn initialized | smoke | Check tailwind.config.ts exists | n/a |
| SETUP-03 | TypeScript strict, ESLint configured | smoke | `npx tsc --noEmit` | n/a |
| CMS-01..CMS-15 | Collections visible in admin, fields editable | manual | Admin panel inspection | n/a |
| CMS-16 | Conditional filtering works | manual | Admin panel: select Material, verify Profile dropdown filters | n/a |
| CMS-17 | Seed script populates data | smoke | `npx payload run src/seed/index.ts` exits 0 | n/a |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit && npm run dev` (type-check + dev server starts)
- **Per wave merge:** Full seed script run + admin panel verification
- **Phase gate:** All collections visible, seed data present, conditional filtering demo

### Wave 0 Gaps
- [ ] No test framework installed yet -- acceptable for Phase 1 (data model only, no business logic to unit test)
- [ ] Manual admin panel verification is the primary validation method
- [ ] Seed script exit code 0 serves as automated smoke test

## Sources

### Primary (HIGH confidence)
- [Payload CMS Official Docs - Collections](https://payloadcms.com/docs/configuration/collections) - Collection config structure, admin.group, hooks
- [Payload CMS Official Docs - Postgres](https://payloadcms.com/docs/database/postgres) - PostgreSQL adapter setup
- [Payload CMS Official Docs - Fields](https://payloadcms.com/docs/fields/overview) - All field types
- [Payload CMS Official Docs - Relationship](https://payloadcms.com/docs/fields/relationship) - filterOptions, hasMany
- [Payload CMS Official Docs - Hooks](https://payloadcms.com/docs/hooks/collections) - beforeChange, afterChange
- [@payloadcms/db-postgres npm](https://www.npmjs.com/package/@payloadcms/db-postgres) - v3.78.0
- [payload npm](https://www.npmjs.com/package/payload) - v3.79.0
- [DeepWiki - Payload Database Adapters](https://deepwiki.com/payloadcms/payload/3.1-database-adapters) - Adapter config details

### Secondary (MEDIUM confidence)
- [Build with Matija - Dynamic Relationship Filtering](https://www.buildwithmatija.com/blog/payload-dynamic-relationship-filtering-array-fields) - filterOptions with siblingData patterns
- [Build with Matija - Seed with CSV](https://www.buildwithmatija.com/blog/seed-payload-cms-csv-files) - Phased seeding approach
- [Payload Community Help - Sidebar Dropdowns](https://payloadcms.com/community-help/discord/sidebar-dropdowns) - Admin group ordering

### Tertiary (LOW confidence)
- None -- all findings verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Versions verified on npm (3.79.0 / 3.78.0), official docs confirm API
- Architecture: HIGH - Collection patterns, admin groups, hooks well-documented in official docs
- Pitfalls: HIGH - Based on official docs warnings + community discussions about common issues

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (Payload releases frequently but collection API is stable)
