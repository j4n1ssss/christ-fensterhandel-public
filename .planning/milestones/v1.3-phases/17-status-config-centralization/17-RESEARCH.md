# Phase 17: Status-Config Centralization - Research

**Researched:** 2026-03-24
**Domain:** TypeScript module design -- centralizing duplicated status metadata across 6 component files into a single source of truth
**Confidence:** HIGH

## Summary

Phase 17 is a pure refactoring task: extract duplicated STATUS_COLORS and STATUS_LABELS definitions from 6 existing component files into a new `src/lib/status-config.ts` module, then rewire all imports. No new statuses are added (that is Phase 18), no UI redesign (that is Phase 19+), and no database changes. The scope is surgically narrow.

The current codebase has 6 files with local `STATUS_COLORS` and `STATUS_LABELS` definitions for the same 7 statuses. Four admin files use hex color strings for inline styles; two kunden files use Tailwind class strings. The new `status-config.ts` must export both formats (hex via `STATUS_COLORS`, Tailwind via `STATUS_TAILWIND`) plus new exports that Phase 18+ will consume: `STATUS_CUSTOMER_TEXT`, `STATUS_CUSTOMER_PHASE`, `STATUS_GROUP`, `EMAIL_TRIGGER_STATUSES`, and helper functions.

The risk is LOW. All 6 files do the same mechanical change: delete local definitions, add an import. The TypeScript compiler will catch any missed property access. The visual output must remain identical -- same colors, same labels, same fallback behavior.

**Primary recommendation:** Create `status-config.ts` with all exports first, then migrate all 6 consumer files in a single pass. Use `grep -r "STATUS_COLORS\|STATUS_LABELS" src/` as the verification gate -- the only matches must be in `status-config.ts` and import statements.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Kunden-Texte: persoenlich-warm, Siezen ("Sie/Ihre"), 7 konkrete Saetze fuer die 7 bestehenden Statuse
- Kunden-Phasen-Zuordnung: 5-Phasen-Modell (Anfrage, Angebot, Zahlung, Produktion, Lieferung) mit konkretem Mapping pro Status
- Migrations-Umfang: 6 Dateien (status-workflow.tsx, status-timeline.tsx, anfrage-detail-view.tsx, dashboard-overview.tsx, kunden/status-timeline.tsx, kunden/gast-tracking-form.tsx)
- E-Mail-Trigger: ALLE 7 aktuellen Statuse sind kundenrelevant (customer_facing: true)
- Zukunfts-Struktur: status-config.ts wird komplett vorbereitet mit allen Exports die v1.3 braucht (StatusKey, STATUS_COLORS, STATUS_LABELS, STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, STATUS_GROUP, EMAIL_TRIGGER_STATUSES, Helpers)
- Status-Gruppen: 5 Gruppen (offen, zahlung, produktion, lieferung, abgeschlossen) -- produktion und lieferung bleiben leer bis Phase 18

### Claude's Discretion
- Interne TypeScript-Typen-Struktur (z.B. StatusConfig Objekt vs separate Maps)
- Helper-Funktionen Signatur und Implementation
- Import-Pattern (named exports vs default export)
- Reihenfolge der Migration (welche Datei zuerst)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-01 | status-config.ts als Single Source of Truth fuer STATUS_COLORS (hex), STATUS_LABELS, STATUS_TAILWIND (Klassen), STATUS_CUSTOMER_TEXT | Direct code inspection confirms 6 files with local definitions. Architecture research specifies exact export signatures. All 7 current status values and their colors/labels documented below. |
| STAT-02 | Alle bestehenden Komponenten importieren Farben/Labels aus status-config.ts (keine lokale Duplikation) | All 6 duplication sites identified with exact line numbers. Migration is mechanical: delete local const, add import. Grep verification command specified. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 | Type-safe status key union, Record types for exhaustive mapping | Already installed, strict mode active |

### Supporting
No new dependencies needed. This phase uses only existing TypeScript features and the project's existing `@/lib/` import alias.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate `STATUS_COLORS` + `STATUS_TAILWIND` maps | Single unified config object per status | Separate maps are simpler for consumers -- admin components destructure hex, kunden components destructure Tailwind classes. A unified object adds an indirection layer without benefit at 7 statuses. |
| `as const satisfies` for type narrowing | Plain `Record<StatusKey, string>` | `as const satisfies` gives literal types but consumers don't need literal string types -- they pass values to `style` props and `className` props which accept `string`. Plain Record is sufficient and simpler. |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended File Structure
```
src/
+-- lib/
|   +-- status-config.ts          [NEW -- all status metadata]
|   +-- status-transitions.ts     [UNCHANGED -- transition logic stays separate]
+-- components/
    +-- admin/
    |   +-- status-workflow.tsx       [MODIFIED -- remove local defs, add import]
    |   +-- status-timeline.tsx       [MODIFIED -- remove local defs, add import]
    |   +-- anfrage-detail-view.tsx   [MODIFIED -- remove local defs, add import]
    |   +-- dashboard-overview.tsx    [MODIFIED -- remove local defs, add import]
    +-- kunden/
        +-- status-timeline.tsx       [MODIFIED -- remove local defs, add import]
        +-- gast-tracking-form.tsx    [MODIFIED -- remove local defs, add import]
```

### Pattern 1: Dual-Format Color Exports
**What:** Export hex colors for admin (inline styles) and Tailwind class objects for kunden (className props) from the same module.
**When to use:** When the same semantic data (status colors) needs two different representations for two rendering contexts.
**Example:**
```typescript
// src/lib/status-config.ts

export type StatusKey =
  | 'neu' | 'in_bearbeitung' | 'bestaetigt'
  | 'bezahlt' | 'abgeschlossen' | 'rueckfrage' | 'abgelehnt'

// Hex colors -- used by admin components in inline styles
export const STATUS_COLORS: Record<StatusKey, string> = {
  neu: '#3b82f6',
  in_bearbeitung: '#eab308',
  bestaetigt: '#22c55e',
  bezahlt: '#10b981',
  abgeschlossen: '#6b7280',
  rueckfrage: '#f97316',
  abgelehnt: '#ef4444',
}

// Tailwind classes -- used by kunden components in className props
export const STATUS_TAILWIND: Record<StatusKey, { bg: string; text: string; dot: string }> = {
  neu: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  // ...
}
```
**Source:** Direct code inspection of existing admin and kunden components.

### Pattern 2: Separate Maps with Shared Type Key
**What:** Each export is a separate `Record<StatusKey, T>` rather than a nested config object. Consumers import only what they need.
**When to use:** When different consumers need different subsets of the data and deep destructuring would add complexity.
**Example:**
```typescript
// Consumer: admin/status-workflow.tsx
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status-config'
// Only uses hex colors and labels -- does not need Tailwind or customer text

// Consumer: kunden/status-timeline.tsx
import { STATUS_TAILWIND, STATUS_LABELS } from '@/lib/status-config'
// Only uses Tailwind classes and labels -- does not need hex colors
```

### Pattern 3: Fallback-Safe Access
**What:** Existing components use fallback patterns like `STATUS_COLORS[status] || '#6b7280'` and `STATUS_COLORS[status] || STATUS_COLORS.neu`. These must be preserved during migration.
**When to use:** Always -- the `status` value comes from the database and could be a string not in the union type.
**Example:**
```typescript
// Helper function with built-in fallback
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as StatusKey] ?? '#6b7280'
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as StatusKey] ?? status
}
```

### Anti-Patterns to Avoid
- **Merging status-config.ts and status-transitions.ts:** They serve different purposes (display metadata vs transition logic). The transitions file is imported by server-side collection hooks; keeping it separate avoids accidental client-side dependencies in the server context.
- **Using a single nested object per status:** `{ neu: { color: '#3b82f6', label: 'Neu', tailwind: { bg: '...', text: '...', dot: '...' }, customerText: '...', customerPhase: 1, group: 'offen' } }` -- this forces every consumer to destructure deeply and imports the entire config even when only colors are needed. Separate flat maps are cleaner.
- **Exporting a default object:** Named exports enable tree-shaking and are the established pattern in this codebase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type-safe status key enforcement | Manual string checks at each usage site | `StatusKey` union type + `Record<StatusKey, T>` | TypeScript compiler catches missing keys at build time |
| Color format conversion (hex to Tailwind) | Runtime converter function | Two separate exports (STATUS_COLORS hex, STATUS_TAILWIND classes) | The mappings are static -- no runtime conversion needed. Admin and kunden are separate rendering contexts. |

**Key insight:** This phase is about eliminating duplication, not building new abstractions. The new module should be as boring and obvious as possible.

## Common Pitfalls

### Pitfall 1: Incomplete Migration -- One File Still Has Local Definitions
**What goes wrong:** After creating status-config.ts, one of the 6 files is missed during migration. The local definition still works, but when Phase 18 adds new statuses to status-config.ts, the missed file shows raw status keys for the new values.
**Why it happens:** The gast-tracking-form.tsx is easy to overlook because it uses a flat string format for STATUS_COLORS (not the `{ bg, text, dot }` object that kunden/status-timeline.tsx uses).
**How to avoid:** Use the verification grep: `grep -r "const STATUS_COLORS\|const STATUS_LABELS" src/` -- must return zero results outside status-config.ts. Run this as the final check.
**Warning signs:** grep returns more than one file defining these constants.

### Pitfall 2: Breaking the Fallback Pattern
**What goes wrong:** Existing code uses `STATUS_COLORS[status] || '#6b7280'` where `status` is typed as `string`. After migration, if the imported STATUS_COLORS is typed as `Record<StatusKey, string>`, TypeScript may error on `string` index access because `string` is not assignable to `StatusKey`.
**Why it happens:** The current local definitions use `Record<string, string>` which allows any string key. The centralized version should use `Record<StatusKey, string>` for type safety but consumers receive `status` as `string` from the API.
**How to avoid:** Either (a) keep consumer access patterns using `as StatusKey` cast, or (b) provide helper functions (`getStatusColor(status: string): string`) that handle the cast and fallback internally. Option (b) is cleaner but changes more lines per file. Recommendation: provide helpers AND keep the raw maps exported for cases where the consumer already knows the type.
**Warning signs:** TypeScript error "Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<StatusKey, string>'".

### Pitfall 3: Different STATUS_COLORS Shape in Kunden Files
**What goes wrong:** The two kunden files use STATUS_COLORS with different shapes. `kunden/status-timeline.tsx` uses `{ bg: string; text: string; dot: string }` objects. `kunden/gast-tracking-form.tsx` uses flat `'bg-blue-50 text-blue-700'` strings. Trying to use a single `STATUS_TAILWIND` export for both creates a type mismatch.
**Why it happens:** The two files were written at different times and chose different representations for the same data.
**How to avoid:** The centralized `STATUS_TAILWIND` should use the structured `{ bg, text, dot }` format (matches kunden/status-timeline.tsx). The gast-tracking-form.tsx needs to be adapted to use `${STATUS_TAILWIND[status].bg} ${STATUS_TAILWIND[status].text}` instead of the flat string. This is a minor change to the consumer.
**Warning signs:** gast-tracking-form.tsx still using `STATUS_COLORS[status]` as a flat string after migration.

### Pitfall 4: Server Component Import Compatibility
**What goes wrong:** dashboard-overview.tsx is a React Server Component (no 'use client' directive, uses `await getPayload()`). If status-config.ts accidentally includes a 'use client' directive or imports from a client-only module, the server component import fails.
**Why it happens:** Copy-paste from client component patterns.
**How to avoid:** status-config.ts must have NO 'use client' directive and NO framework imports. It is a pure TypeScript data module -- only `export const` and `export type`. Verify: the file should not import from `react`, `next`, or `@payloadcms`.
**Warning signs:** "You're importing a component that needs 'use client'" error when loading dashboard-overview.

## Code Examples

### Complete status-config.ts Structure (Verified Against Existing Code)

The following values are extracted directly from the 6 existing files. All 6 files use identical values for the 7 statuses.

```typescript
// src/lib/status-config.ts
// Pure data module -- NO 'use client', NO framework imports

// --- Types ---

export type StatusKey =
  | 'neu'
  | 'in_bearbeitung'
  | 'bestaetigt'
  | 'bezahlt'
  | 'abgeschlossen'
  | 'rueckfrage'
  | 'abgelehnt'

export type StatusGroup = 'offen' | 'zahlung' | 'produktion' | 'lieferung' | 'abgeschlossen'

export type CustomerPhase = 'Anfrage' | 'Angebot' | 'Zahlung' | 'Produktion' | 'Lieferung'

// --- Hex colors (admin inline styles) ---

export const STATUS_COLORS: Record<StatusKey, string> = {
  neu: '#3b82f6',
  in_bearbeitung: '#eab308',
  bestaetigt: '#22c55e',
  bezahlt: '#10b981',
  abgeschlossen: '#6b7280',
  rueckfrage: '#f97316',
  abgelehnt: '#ef4444',
}

// --- German display labels ---

export const STATUS_LABELS: Record<StatusKey, string> = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  bestaetigt: 'Bestaetigt',   // Note: use real umlaut in actual code
  bezahlt: 'Bezahlt',
  abgeschlossen: 'Abgeschlossen',
  rueckfrage: 'Rueckfrage',   // Note: use real umlaut in actual code
  abgelehnt: 'Abgelehnt',
}

// --- Tailwind classes (kunden components) ---

export const STATUS_TAILWIND: Record<StatusKey, { bg: string; text: string; dot: string }> = {
  neu: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_bearbeitung: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  bestaetigt: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  bezahlt: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  abgeschlossen: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  rueckfrage: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  abgelehnt: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

// --- Customer-facing text (warm, Siezen) ---

export const STATUS_CUSTOMER_TEXT: Record<StatusKey, string> = {
  neu: 'Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.',
  in_bearbeitung: 'Ihre Anfrage wird gerade von unserem Team bearbeitet.',
  bestaetigt: 'Ihr Angebot ist fertig -- Sie koennen es jetzt einsehen.',
  bezahlt: 'Danke, Ihre Zahlung ist bei uns eingegangen.',
  abgeschlossen: 'Ihre Bestellung ist erfolgreich abgeschlossen.',
  rueckfrage: 'Wir haben eine Rueckfrage zu Ihrer Anfrage.',
  abgelehnt: 'Ihre Anfrage konnte leider nicht beruecksichtigt werden.',
}

// --- Customer phase mapping (5-Phasen-Modell) ---

export const STATUS_CUSTOMER_PHASE: Record<StatusKey, CustomerPhase | null> = {
  neu: 'Anfrage',
  in_bearbeitung: 'Anfrage',
  bestaetigt: 'Angebot',
  bezahlt: 'Zahlung',
  abgeschlossen: 'Lieferung',
  rueckfrage: 'Anfrage',
  abgelehnt: null,  // Endstatus without progress bar
}

// --- Status groups (for filter tabs in Phase 20) ---

export const STATUS_GROUP: Record<StatusKey, StatusGroup> = {
  neu: 'offen',
  in_bearbeitung: 'offen',
  bestaetigt: 'zahlung',
  bezahlt: 'zahlung',
  abgeschlossen: 'abgeschlossen',
  rueckfrage: 'offen',
  abgelehnt: 'abgeschlossen',
}

// --- Email triggers (all 7 are customer-facing in current scope) ---

export const EMAIL_TRIGGER_STATUSES: StatusKey[] = [
  'neu', 'in_bearbeitung', 'bestaetigt', 'bezahlt',
  'abgeschlossen', 'rueckfrage', 'abgelehnt',
]

// --- Helper functions ---

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as StatusKey] ?? '#6b7280'
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as StatusKey] ?? status
}

export function isCustomerFacing(status: string): boolean {
  return EMAIL_TRIGGER_STATUSES.includes(status as StatusKey)
}
```

### Migration Example: Admin Component (hex colors)

```typescript
// BEFORE (status-workflow.tsx, lines 6-24):
const STATUS_COLORS: Record<string, string> = {
  neu: '#3b82f6',
  // ... 7 entries
}
const STATUS_LABELS: Record<string, string> = {
  neu: 'Neu',
  // ... 7 entries
}

// AFTER:
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status-config'
// Delete the two local const blocks (lines 6-24)
// All usage sites (STATUS_COLORS[status], STATUS_LABELS[status]) remain unchanged
```

### Migration Example: Kunden Component (Tailwind classes -- structured)

```typescript
// BEFORE (kunden/status-timeline.tsx, lines 4-23):
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  neu: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  // ...
}
const STATUS_LABELS: Record<string, string> = { ... }

// AFTER:
import { STATUS_TAILWIND, STATUS_LABELS } from '@/lib/status-config'
// Rename all STATUS_COLORS references to STATUS_TAILWIND
// e.g., const colors = STATUS_TAILWIND[entry.zu_status] || STATUS_TAILWIND.neu
```

### Migration Example: Kunden Component (Tailwind classes -- flat string)

```typescript
// BEFORE (kunden/gast-tracking-form.tsx, lines 44-52):
const STATUS_COLORS: Record<string, string> = {
  neu: 'bg-blue-50 text-blue-700',
  // ... flat combined strings
}

// AFTER:
import { STATUS_TAILWIND, STATUS_LABELS } from '@/lib/status-config'
// Replace flat string usage with:
// `${STATUS_TAILWIND[status].bg} ${STATUS_TAILWIND[status].text}`
// The dot timeline circles need: STATUS_TAILWIND[status].dot
```

## Exact Duplication Sites (Line-Level Reference)

| File | STATUS_COLORS Lines | STATUS_LABELS Lines | Color Format | Fallback Pattern |
|------|--------------------|--------------------|-------------|-----------------|
| `src/components/admin/status-workflow.tsx` | 6-14 | 16-24 | hex string | `\|\| '#6b7280'` |
| `src/components/admin/status-timeline.tsx` | 5-13 | 15-23 | hex string | `\|\| '#6b7280'` |
| `src/components/admin/anfrage-detail-view.tsx` | 8-16 | 18-26 | hex string | `\|\| '#6b7280'` |
| `src/components/admin/dashboard-overview.tsx` | 6-14 | 16-24 | hex string | `\|\| '#6b7280'` (some), `\|\| "#6b7280"` (others) |
| `src/components/kunden/status-timeline.tsx` | 4-12 | 15-23 | `{ bg, text, dot }` Tailwind objects | `\|\| STATUS_COLORS.neu` |
| `src/components/kunden/gast-tracking-form.tsx` | 44-52 | 34-42 | flat Tailwind string | `\|\| 'bg-gray-50 text-gray-700'` |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Local const per file | Centralized config module | Phase 17 (now) | Single place to add/modify status metadata |
| `Record<string, string>` | `Record<StatusKey, string>` with union type | Phase 17 (now) | TypeScript catches missing statuses at build time |
| No customer text mapping | STATUS_CUSTOMER_TEXT export | Phase 17 (now) | Phase 21 (Kunden-Dashboard) can consume immediately |

## Open Questions

1. **Umlaut encoding in STATUS_LABELS and STATUS_CUSTOMER_TEXT**
   - What we know: The codebase uses real UTF-8 umlauts (memory: feedback_unicode_escapes.md confirms no JS Unicode escapes). Existing files have `'Bestätigt'` and `'Rückfrage'` with real umlauts.
   - What's unclear: Nothing -- use real umlauts. The code examples above use ASCII for markdown compatibility, but the actual file MUST use real UTF-8 characters.
   - Recommendation: Use `'Bestätigt'`, `'Rückfrage'` etc. in the actual code.

2. **StatusKey as `type` vs `enum`**
   - What we know: The project uses no TypeScript enums anywhere (union types are the established pattern). The CONTEXT.md specifies `StatusKey` as a union type.
   - What's unclear: Nothing.
   - Recommendation: Use `type StatusKey = 'neu' | 'in_bearbeitung' | ...` (union type, not enum).

3. **Whether status-transitions.ts should import StatusKey from status-config.ts**
   - What we know: CONTEXT.md says status-transitions.ts stays separate and is NOT changed in Phase 17. It currently uses plain `string` types.
   - What's unclear: Whether to add a StatusKey import to status-transitions.ts now for consistency.
   - Recommendation: Do NOT modify status-transitions.ts in Phase 17. Phase 18 will extend it with new statuses and can adopt the StatusKey type then. This keeps Phase 17 scope minimal.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jsdom environment) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern status-config` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | status-config.ts exports all required maps with correct types and values | unit | `npx jest --testPathPattern status-config -x` | -- Wave 0 |
| STAT-01 | All 7 StatusKey values covered in every exported map | unit | `npx jest --testPathPattern status-config -x` | -- Wave 0 |
| STAT-01 | Helper functions return correct values and handle unknown status keys | unit | `npx jest --testPathPattern status-config -x` | -- Wave 0 |
| STAT-02 | No local STATUS_COLORS/STATUS_LABELS definitions outside status-config.ts | smoke (grep) | `grep -r "const STATUS_COLORS\|const STATUS_LABELS" src/ \| grep -v status-config.ts \| wc -l` (must be 0) | Manual verification |
| STAT-02 | Admin components render with correct colors after migration | manual | Visual check in browser | Manual |
| STAT-02 | Kunden components render with correct Tailwind classes after migration | manual | Visual check in browser | Manual |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern status-config -x`
- **Per wave merge:** `npx jest` (full suite)
- **Phase gate:** Full suite green + grep verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/status-config.test.ts` -- covers STAT-01 (all exports, all 7 keys, helper functions)
- [ ] Framework install: none needed -- Jest already configured and working (340 existing tests)

## Sources

### Primary (HIGH confidence)
- Direct code inspection of all 6 duplication sites (verified line numbers against actual files)
- `src/components/admin/status-workflow.tsx` -- lines 6-24
- `src/components/admin/status-timeline.tsx` -- lines 5-23
- `src/components/admin/anfrage-detail-view.tsx` -- lines 8-26
- `src/components/admin/dashboard-overview.tsx` -- lines 6-24
- `src/components/kunden/status-timeline.tsx` -- lines 4-23
- `src/components/kunden/gast-tracking-form.tsx` -- lines 34-52
- `src/lib/status-transitions.ts` -- existing transition logic (NOT modified)
- `.planning/research/ARCHITECTURE.md` -- status-config.ts export signature, build order
- `.planning/research/PITFALLS.md` -- Pitfall 1 (centralization done last), Pitfall 8 (customer mapping layer)
- `.planning/phases/17-status-config-centralization/17-CONTEXT.md` -- all locked decisions

### Secondary (MEDIUM confidence)
- `.planning/PROJECT.md` -- Key Decisions table confirming inline styles for admin, Tailwind for kunden

### Tertiary (LOW confidence)
None -- all findings verified by direct code inspection.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, pure TypeScript module design
- Architecture: HIGH -- all 6 duplication sites inspected, export shape derived from actual usage
- Pitfalls: HIGH -- all pitfalls identified from direct code patterns (fallback handling, server/client boundary, shape mismatch)

**Research date:** 2026-03-24
**Valid until:** Indefinite -- this research describes existing code patterns that will not change until Phase 17 implementation begins
