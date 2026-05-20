# Phase 8: Migration & Backfill - Research

**Researched:** 2026-03-18
**Domain:** Payload CMS Local API, standalone migration scripts, data backfill
**Confidence:** HIGH

## Summary

Phase 8 is a focused data migration phase: a standalone TypeScript script that backfills the `erlaubte_farben` hub field on all existing Profile documents. The derivation logic is straightforward -- for each profile, find all Farben whose `erlaubte_materialien` contains the profile's `material` ID, then write those Farben IDs to the profile's `erlaubte_farben` field.

The technical risk is low. The project already has an established pattern for standalone Payload Local API scripts (`src/seed/index.ts`), the data model is well-defined (Phase 7 complete), and the derivation logic is unambiguous. The critical implementation decisions are locked in CONTEXT.md: tsx runner, pagination with PAGE_SIZE 100, depth=0 queries, idempotency via skip-if-already-set, console-only logging, and --dry-run support.

**Primary recommendation:** Load all Farben once upfront (with depth=0), then paginate through profiles matching each profile's material ID against the Farben's `erlaubte_materialien` array in-memory. This avoids reliance on the Payload `contains` query operator for relationship fields (which has known edge cases in PostgreSQL) and is more performant for the small dataset size (12 Farben, 4 Profiles in seed data).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Standalone TypeScript-Script mit Payload Local API (`getPayload({ config })`)
- Pfad: `src/migrations/backfill-erlaubte-farben.ts`
- npm-Script in package.json: `"migrate:farben": "tsx src/migrations/backfill-erlaubte-farben.ts"`
- Aufruf: `npm run migrate:farben` oder `npm run migrate:farben -- --dry-run`
- `--dry-run` Flag: zeigt was geaendert wuerde, ohne zu schreiben (update-Call ueberspringen)
- Script beendet sich mit `process.exit(0)` bei Erfolg, `process.exit(1)` bei Fehler
- Datenprobleme (skip + warn): Profil ohne Material oder Material mit 0 passenden Farben wird als SKIPPED/WARN geloggt, Migration laeuft weiter
- Technische Fehler (abbruch): Bei DB-Fehlern, Payload-API-Fehlern oder Netzwerkproblemen sofort abbrechen -- Idempotenz erlaubt sicheren Neustart
- Kein leeres Array setzen bei 0 Matches -- Profil bleibt bei null, Legacy-Fallback greift spaeter (Phase 9)
- Idempotenz: `erlaubte_farben === null || erlaubte_farben === undefined || erlaubte_farben.length === 0` -> befuellen; bereits befuellte (length > 0) werden uebersprungen
- Nur Console-Output (kein Logfile)
- Pro Seite: Header mit Seitennummer und Profilanzahl
- Pro Profil eine Zeile: `[UPDATED]` / `[SKIPPED]` / `[WARN]` mit Profilname und Anzahl Farben
- Summary am Ende: Gesamt, Befuellt, Uebersprungen (bereits gesetzt), Warnungen, Seiten
- Bei --dry-run: `[DRY-RUN]` Prefix in allen Zeilen

### Claude's Discretion
- Exakte Paginierungs-Implementierung (PAGE_SIZE 100 ist vorgegeben)
- Query-Strategie: alle Farben vorab laden vs. pro Profil abfragen
- Reihenfolge der Farben-Zuordnung (z.B. nach sortOrder)
- process.argv Parsing fuer --dry-run (minimalistisch, kein Library noetig)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIG-01 | Migration-Script befuellt erlaubte_farben automatisch aus farben.erlaubte_materialien + profile.material Abgleich | Seed script pattern for getPayload + Local API; in-memory matching of Farben.erlaubte_materialien against Profile.material; extractId helper pattern from filters.ts |
| MIG-02 | Migration ist idempotent (ueberschreibt nur leere Felder, laesst bereits gesetzte unberuehrt) | Check `erlaubte_farben === null/undefined/length===0` before writing; skip profiles with existing values |
| MIG-03 | Migration laeuft paginiert (PAGE_SIZE 100) und loggt pro Profil was aktualisiert wurde | Payload `find()` with `limit` and `page` params; `hasNextPage` from response for pagination control |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.79.0 | Local API for DB operations | Already installed; `getPayload({ config })` for standalone scripts |
| tsx | 4.21.0 | TypeScript script runner | Transitive dep from payload; available via `npx tsx`; handles ESM + path aliases |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @payload-config | (path alias) | Payload config import | tsconfig paths maps to `./src/payload.config.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsx direct | `npx payload run` | Payload CLI handles env loading automatically, but user locked tsx approach; both work |
| In-memory Farben matching | `where: { erlaubte_materialien: { contains: materialId } }` | Server-side filtering has known edge cases with hasMany relationship queries on PostgreSQL; in-memory is safer and faster for small datasets |

**Installation:**
No new packages needed. tsx is available as transitive dependency from payload.

## Architecture Patterns

### Recommended Project Structure
```
src/
  migrations/
    backfill-erlaubte-farben.ts   # The migration script (this phase)
  seed/
    index.ts                      # Existing pattern reference
    utils.ts                      # Existing helpers (findBySlug, etc.)
```

### Pattern 1: Standalone Payload Script (from seed/index.ts)
**What:** Top-level await script using `getPayload({ config })` to get a Payload instance, then calling Local API methods
**When to use:** Any standalone script needing database access (migrations, seeds, one-off data fixes)
**Example:**
```typescript
// Source: src/seed/index.ts (existing project pattern)
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Use payload.find(), payload.update(), etc.
// ...

process.exit(0)
```

### Pattern 2: Paginated Find with hasNextPage
**What:** Payload find() returns `{ docs, hasNextPage, totalDocs, totalPages, page }` -- use for pagination loop
**When to use:** When processing collections that could have >100 documents
**Example:**
```typescript
// Source: Payload Local API docs
const PAGE_SIZE = 100
let page = 1
let hasMore = true

while (hasMore) {
  const result = await payload.find({
    collection: 'profile',
    limit: PAGE_SIZE,
    page,
    depth: 0, // IDs only, no population
  })

  for (const doc of result.docs) {
    // process each document
  }

  hasMore = result.hasNextPage
  page++
}
```

### Pattern 3: Extract ID from Relationship Field
**What:** Payload relationship fields return either a string ID or populated object depending on `depth`
**When to use:** Whenever reading relationship field values
**Example:**
```typescript
// Source: src/lib/konfigurator/filters.ts line 15
function extractId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}
```

### Pattern 4: In-Memory Farben Matching (Recommended for this migration)
**What:** Load all Farben once, then for each Profile extract its material ID and filter Farben in-memory
**When to use:** When the "lookup" collection is small (Farben has 12 items in seed) and server-side query operators for hasMany relationships have edge cases
**Example:**
```typescript
// Load all farben once (aktiv only)
const { docs: allFarben } = await payload.find({
  collection: 'farben',
  where: { aktiv: { equals: true } },
  limit: 500,
  depth: 0, // erlaubte_materialien returns ID arrays
})

// For each profile:
const materialId = extractId(profile.material)
const matchingFarben = allFarben.filter((farbe) => {
  const matIds = farbe.erlaubte_materialien
  if (!Array.isArray(matIds) || matIds.length === 0) return false
  return matIds.some((m) => extractId(m) === materialId)
})
const farbenIds = matchingFarben.map((f) => f.id)
```

### Anti-Patterns to Avoid
- **Using `depth: 1` or higher in migration queries:** Unnecessary data population slows down the script and wastes memory. Use `depth: 0` to get raw IDs.
- **Querying Farben per Profile in a loop:** N+1 query problem. Load all Farben once and filter in-memory.
- **Using `contains` operator for hasMany relationship queries on PostgreSQL:** Known edge cases (see GitHub issue #14204). In-memory filtering is more reliable.
- **Setting empty arrays on profiles with 0 matching Farben:** CONTEXT.md explicitly says to leave these as null -- legacy fallback in Phase 9 handles this.
- **Wrapping in a transaction:** Payload Local API updates are atomic per-document. Idempotency handles failures better than transactions for this use case.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript execution | Custom Node.js ESM loader | tsx (already available) | Handles ESM, path aliases, TypeScript natively |
| CLI argument parsing | yargs/commander library | `process.argv.includes('--dry-run')` | Only one flag needed, minimalistic per CONTEXT.md |
| Pagination | Manual offset calculation | Payload `find({ page, limit })` with `hasNextPage` | Built-in, handles edge cases |
| ID extraction from relationships | Manual type checks | `extractId()` helper (existing pattern) | Already proven in filters.ts |

**Key insight:** This migration is simple enough that no external libraries are needed beyond what's already in the project.

## Common Pitfalls

### Pitfall 1: depth Parameter on Farben Query
**What goes wrong:** Using `depth: 0` on Farben query means `erlaubte_materialien` returns string IDs, but the exact format depends on whether the field has single or multiple `relationTo`.
**Why it happens:** Farben.erlaubte_materialien is `hasMany: true` with single `relationTo: 'materialien'`. With depth=0, it returns `string[]` (array of ID strings). With depth=1+, it returns `Materialien[]` (populated objects).
**How to avoid:** Always use `depth: 0` and expect `string[]`. The `extractId()` helper handles both cases defensively.
**Warning signs:** TypeScript type `(string | Materialien)[] | null` -- always check for null and handle both union members.

### Pitfall 2: Profile.material Can Be Populated or ID
**What goes wrong:** With depth=0, `profile.material` is a string ID. With depth=1+, it's a populated Materialien object.
**Why it happens:** The `material` field is `type: 'relationship', required: true` -- it's always set, but its runtime shape depends on depth.
**How to avoid:** Use `depth: 0` consistently in the migration. `extractId(profile.material)` handles both cases.
**Warning signs:** TypeError when calling `.id` on a string or using a string as an object.

### Pitfall 3: erlaubte_farben Idempotency Check
**What goes wrong:** Checking only `=== null` misses `undefined` and empty arrays `[]`.
**Why it happens:** Payload fields can be null (never set), undefined (missing from response), or empty array (explicitly cleared).
**How to avoid:** Use the triple check from CONTEXT.md: `erlaubte_farben === null || erlaubte_farben === undefined || erlaubte_farben.length === 0`
**Warning signs:** Already-set profiles getting overwritten on re-run.

### Pitfall 4: ESM Import of @payload-config with tsx
**What goes wrong:** Path alias `@payload-config` might not resolve if tsx doesn't pick up tsconfig.json.
**Why it happens:** tsx needs to be run from the project root where tsconfig.json is located.
**How to avoid:** The npm script `"migrate:farben": "tsx src/migrations/backfill-erlaubte-farben.ts"` runs from project root automatically. The seed script uses the same pattern and works.
**Warning signs:** Module not found error for `@payload-config`.

### Pitfall 5: process.exit() Prevents Cleanup
**What goes wrong:** `process.exit(0)` kills the process immediately, potentially before async operations complete (like Payload's database connection cleanup).
**Why it happens:** Node.js event loop is still running when process.exit() is called.
**How to avoid:** The seed script uses `process.exit(0)` and it works fine in this project. Keep the same pattern. Payload's connection pool handles cleanup.
**Warning signs:** Occasional "connection terminated unexpectedly" warnings in logs (harmless).

## Code Examples

Verified patterns from the existing codebase:

### Payload Local API Initialization (from seed/index.ts)
```typescript
// Source: src/seed/index.ts lines 1-3, 38
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
```

### Paginated Find (Payload API)
```typescript
// Source: Payload docs + seed/utils.ts pattern
const { docs, hasNextPage, totalDocs } = await payload.find({
  collection: 'profile',
  limit: 100,
  page: 1,
  depth: 0,
})
```

### Single Document Update (from seed/index.ts)
```typescript
// Source: src/seed/index.ts line 65-69
await payload.update({
  collection: 'profile',
  id: profileId,
  data: { erlaubte_farben: farbenIds },
})
```

### extractId Helper (from filters.ts)
```typescript
// Source: src/lib/konfigurator/filters.ts line 15-17
function extractId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}
```

### Minimal CLI Argument Parsing
```typescript
// No library needed -- CONTEXT.md specifies minimalistic approach
const isDryRun = process.argv.includes('--dry-run')
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npx payload run script.ts` | Both `npx payload run` and `tsx` work | Payload 3.x | tsx is locked per CONTEXT.md decision |
| `depth: 1` to populate relations for matching | `depth: 0` + in-memory matching | Phase 7 decision (maxDepth: 0) | Consistent with project's depth:0 philosophy |
| `where: { field: { contains: id } }` for hasMany | In-memory array filtering | 2025 (PostgreSQL edge cases discovered) | More reliable, no operator issues |

**Deprecated/outdated:**
- Migration skeleton in docs/todos/008 uses `depth: 1` and `contains` operator -- CONTEXT.md overrides this with depth=0 and in-memory approach

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=test-name -x` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIG-01 | erlaubte_farben correctly derived from farben.erlaubte_materialien + profile.material | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 |
| MIG-02 | Idempotent: already-set profiles not overwritten | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 |
| MIG-03 | Paginated processing + logging output | unit | `npx jest --testPathPattern=test-backfill-farben -x` | -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=test-backfill-farben -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-backfill-farben.test.ts` -- covers MIG-01, MIG-02, MIG-03 (test the derivation logic and idempotency in isolation by extracting the matching logic into a testable pure function)

**Note:** The migration script itself uses Payload Local API which requires a running database. Unit tests should test the pure derivation logic (given profiles + farben data, produce correct erlaubte_farben mappings) and the idempotency check logic, NOT the full Payload integration. Integration testing is manual: run the script, verify in Admin UI.

## Open Questions

1. **Farben sortOrder in erlaubte_farben array**
   - What we know: The Farben seed data has `sortOrder` values. When writing IDs to `erlaubte_farben`, the order of IDs in the array could matter for Admin UI display.
   - What's unclear: Whether Payload preserves array order for hasMany relationship fields in PostgreSQL.
   - Recommendation: Sort matching Farben by `sortOrder` before extracting IDs. Low cost, potential UX benefit.

2. **tsx path alias resolution reliability**
   - What we know: The seed script uses `@payload-config` and runs via `npx payload run`. The migration will use `tsx` directly.
   - What's unclear: Whether tsx 4.21.0 resolves `@payload-config` from tsconfig paths without issues.
   - Recommendation: Test manually after implementation. If path resolution fails, fall back to relative import `../../payload.config` as a workaround.

## Sources

### Primary (HIGH confidence)
- `src/seed/index.ts` -- Existing Payload Local API standalone script pattern (project code)
- `src/collections/produkte/profile.ts` -- Profile collection with all 13 hub fields (project code)
- `src/collections/ausstattung/farben.ts` -- Farben collection with erlaubte_materialien (project code)
- `src/lib/konfigurator/filters.ts` -- extractId helper pattern (project code)
- `src/payload-types.ts` -- Generated types confirming field shapes (project code)
- `src/seed/data/farben.ts` -- Seed data: 12 Farben, all with `erlaubte_materialien_slugs: ['kunststoff']`
- `src/seed/data/profile.ts` -- Seed data: 4 Profiles, all with `material_slug: 'kunststoff'`
- [Payload docs: Using Payload outside Next.js](https://github.com/payloadcms/payload/blob/main/docs/local-api/outside-nextjs.mdx) -- `payload run` and standalone script execution
- [Payload docs: Query operators](https://github.com/payloadcms/payload/blob/main/docs/queries/overview.mdx) -- Available query operators

### Secondary (MEDIUM confidence)
- [Payload GitHub Issue #14204](https://github.com/payloadcms/payload/issues/14204) -- Relationship field filter issues with hasMany on PostgreSQL, confirms in-memory approach is safer
- [Payload GitHub Discussion #187](https://github.com/payloadcms/payload/discussions/187) -- Query syntax for relationship fields

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- uses only existing project dependencies (payload, tsx), no new installs
- Architecture: HIGH -- follows established seed/index.ts pattern exactly, all decisions locked in CONTEXT.md
- Pitfalls: HIGH -- verified against project code and Payload documentation, edge cases well-understood
- Derivation logic: HIGH -- data model is clear (Farben.erlaubte_materialien -> Profile.material), seed data confirms all 12 Farben map to kunststoff material which is used by all 4 profiles

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- no external dependencies or fast-moving APIs)
