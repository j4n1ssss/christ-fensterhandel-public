# Phase 11: Edit-History Hooks + UI - Research

**Researched:** 2026-03-19
**Domain:** Payload CMS 3 Collection Hooks, Diff Computation, Custom Admin Components
**Confidence:** HIGH

## Summary

Phase 11 implements automatic edit-history tracking for the Profile collection using Payload CMS 3 hooks (beforeChange + afterChange), a "last edited by" header line, and a History panel as a custom document view tab. The edit_history Collection already exists (Phase 7, HIST-01 complete), the Users collection already has vorname/nachname fields, and the project has proven patterns for both hook-based audit logging (status_historie in anfragen.ts) and custom admin components (profile-edit-toolbar, undo-redo-provider).

The core technical challenge is threefold: (1) computing meaningful diffs including relationship label resolution at save time, (2) preventing infinite loops when the afterChange hook creates history entries, and (3) integrating a lazy-loaded History panel as a document-level tab alongside the existing field-level tabs (Kombinationen/Ausstattung). All three have established solutions in the Payload CMS ecosystem and in this project's codebase.

**Primary recommendation:** Follow the status_historie pattern exactly -- beforeChange sets last_edited_by, afterChange creates edit_history entries with `overrideAccess: true` and `req.context.skipEditHistory` guard. History tab as a custom document view (not field-level tab) with lazy loading via REST API.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Volle Before/After Werte fuer ALLE Feldtypen (nicht nur Feldnamen)
- Einfache Felder: `{ field: "name_einfach", from: "Iglo 5", to: "Iglo 5 Classic" }`
- Relationship-Felder: IDs + aufgeloeste Namen zusammen speichern: `{ field: "erlaubte_farben", from: [{ id: "uuid1", label: "Weiss RAL 9016" }], to: [...] }`
- Relationship-Namen werden zum Zeitpunkt des Saves resolved und im Diff eingefroren (Snapshot)
- Eigener Tab "Historie" als dritter Tab neben "Kombinationen" und "Ausstattung"
- Kompakte Eintraege: Zeitstempel + Bearbeiter-Name + Liste geaenderter Feldnamen
- Expand/Collapse pro Eintrag: Klick zeigt Before/After Werte
- Lazy Loading: Daten werden erst beim Tab-Klick geladen (kein initialer API-Call)
- Limit: 50 Eintraege, sortiert nach Timestamp absteigend
- Bearbeiter-Anzeige: "Max Mueller (admin@christ-fensterhandel.de)" -- Vorname Nachname + E-Mail
- Header-Zeile unter dem Profil-Titel als Custom Component (beforeDocumentControls oder eigene Position)
- Zeigt: "Zuletzt bearbeitet von [Name] ([E-Mail]) am [Datum]"
- Datenquelle: `profile.last_edited_by` + `profile.updatedAt` (kein extra API-Call)
- KEIN Sidebar-Feld -- Header-Zeile ist prominenter und reicht
- last_edited_by Feld existiert im Schema, wird aber `admin.hidden` oder nicht in der Sidebar angezeigt
- JEDES Save wird geloggt, auch wenn nichts geaendert wurde (event: "save_no_changes" bei leerem Diff)
- Auch Create-Events werden geloggt (event: "create")
- Ausgeschlossene Felder aus dem Diff: `updatedAt`, `createdAt`, `id`, `last_edited_by`
- Infinite-Loop-Praevention: `req.context.skipEditHistory` Guard im afterChange Hook
- last_edited_by wird in beforeChange gesetzt (NICHT afterChange + update)
- edit_history Eintraege werden mit `overrideAccess: true` erstellt (Collection access create: false)
- Neue Felder `vorname` und `nachname` auf der Users-Collection -- BEREITS VORHANDEN (kein Aenderungsbedarf)
- Felder sind optional (Fallback auf E-Mail wenn kein Name gesetzt)

### Claude's Discretion
- Exakte Diff-Berechnung (deep comparison Algorithmus fuer verschachtelte Objekte/Groups)
- Name-Resolution fuer Relationship-Felder (wie Labels aus den referenzierten Collections geholt werden)
- CSS/Styling des History-Panels und der Header-Zeile (Payload-natives Styling)
- Expand/Collapse Animation und Interaktion
- Error-Handling wenn History-Fetch fehlschlaegt (graceful degradation)

### Deferred Ideas (OUT OF SCOPE)
- Before/After Value Diffs im History-Panel mit Syntax-Highlighting -- v1.2
- Undo/Redo fuer andere Collections (GLOB-01) -- v1.2
- last_published_by Tracking (PUBL-01) -- v1.2
- History fuer andere Collections als Profile -- eigene Phase
- Export/Download der History als CSV/JSON -- nicht geplant
- Pagination im History-Panel (ueber 50 Eintraege) -- v1.2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HIST-02 | beforeChange Hook setzt last_edited_by auf aktuellen User | Proven pattern: anfragen.ts beforeChange sets fields on req.user. Payload docs confirm originalDoc available on update, data on create. Use `req.user?.id`. |
| HIST-03 | afterChange Hook erstellt edit_history Eintrag mit Diff und Editor | Proven pattern: anfragen.ts afterChange creates status_historie with `req.payload.create()`. Diff computed via previousDoc vs doc comparison. Relationship labels resolved via `req.payload.find()` with depth:0 at save time. |
| HIST-04 | afterChange Hook nutzt req.context.skipEditHistory Guard | Official Payload docs confirm `req.context` passes data between hooks and to nested operations. Pass `context: { skipEditHistory: true }` to `req.payload.create()` for edit_history to prevent re-trigger (though edit_history has no afterChange hook itself, the guard is defensive). |
| HIST-05 | History-Panel im Profile Edit-View zeigt letzte 50 Aenderungen | Custom document view tab via `admin.components.views.edit.history` with REST API fetch to `/api/edit_history`. Lazy loading via tab click (component mounts on tab navigation). |
| HIST-06 | last_edited_by Anzeige im Profile Edit-View | Header-line component via `beforeDocumentControls` alongside existing ProfileEditToolbar. Reads `last_edited_by` from form data + resolves user name via REST. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.79.x | CMS framework, hooks API, admin components | Already in project |
| @payloadcms/ui | 3.79.x | Admin hooks (useDocumentInfo, useForm) | Already in project |
| react | 19.x | UI components | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (installed) | Icons for expand/collapse chevrons | Already in project (used by ProfileEditToolbar) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom diff | deep-diff npm | Custom is better here: we need relationship label resolution which no generic diff lib provides. Profile fields are flat/shallow enough that a simple Object.keys comparison with JSON.stringify suffices. |
| Document-level tab | Field-level tab | Field tabs are for form fields; History needs its own route/view to lazy-load external data without affecting the form state. Document view tab is correct. |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  collections/
    produkte/
      profile.ts              # Add hooks, last_edited_by field, history tab config
    system/
      users.ts                 # ALREADY has vorname/nachname -- no changes needed
      edit-history.ts          # ALREADY exists -- no changes needed
  hooks/
    profile-edit-history.ts    # NEW: beforeChange + afterChange hook functions
  lib/
    diff-utils.ts              # NEW: Diff computation + relationship label resolution
  components/
    admin/
      profile-edit-toolbar.tsx # EXISTING: Undo/Redo toolbar (no changes)
      profile-last-editor.tsx  # NEW: "Zuletzt bearbeitet von..." header line
      profile-history-panel.tsx # NEW: History tab view component
```

### Pattern 1: Hook-based Audit Logging (Proven in Project)
**What:** beforeChange mutates data fields, afterChange creates audit log entries
**When to use:** Any time you need to track changes to a collection
**Example:**
```typescript
// Source: src/collections/business/anfragen.ts (existing pattern)
hooks: {
  beforeChange: [
    async ({ data, originalDoc, req, operation }) => {
      if (operation === 'update') {
        return { ...data, last_edited_by: req.user?.id }
      }
      if (operation === 'create') {
        return { ...data, last_edited_by: req.user?.id }
      }
      return data
    }
  ],
  afterChange: [
    async ({ doc, previousDoc, req, operation, context }) => {
      // Guard: skip if this is a system operation
      if (context.skipEditHistory) return

      try {
        await req.payload.create({
          collection: 'edit_history',
          data: { /* ... */ },
          overrideAccess: true,
          context: { skipEditHistory: true },
        })
      } catch (err) {
        console.error('[Profile afterChange] History error (non-blocking):', err)
      }
    }
  ],
}
```

### Pattern 2: Custom Document View Tab
**What:** Add a custom tab to the edit view of a collection that renders its own component
**When to use:** When you need a separate view with its own data loading, not part of the form
**Example:**
```typescript
// Source: Payload CMS 3 docs - Document Views
// In profile.ts collection config:
admin: {
  components: {
    views: {
      edit: {
        history: {
          Component: '@/components/admin/profile-history-panel#ProfileHistoryPanel',
          path: '/history',
          tab: {
            label: 'Historie',
            href: '/history',
          },
        },
      },
    },
    edit: {
      beforeDocumentControls: [
        '@/components/admin/profile-edit-toolbar#ProfileEditToolbar',
        '@/components/admin/profile-last-editor#ProfileLastEditor',
      ],
    },
  },
},
```

### Pattern 3: req.context for Infinite Loop Prevention
**What:** Pass context flags through the Payload Local API to prevent recursive hook triggers
**When to use:** When an afterChange hook creates/updates documents that could re-trigger hooks
**Example:**
```typescript
// Source: Payload CMS docs - Context
// https://payloadcms.com/docs/hooks/context
afterChange: [
  async ({ context, doc, req }) => {
    if (context.skipEditHistory) return  // Guard

    await req.payload.create({
      collection: 'edit_history',
      data: { /* ... */ },
      overrideAccess: true,
      context: { skipEditHistory: true },  // Pass guard to nested operation
    })
  }
]
```

### Anti-Patterns to Avoid
- **Setting last_edited_by in afterChange + update:** Creates infinite loop (update triggers afterChange which triggers update). ALWAYS set in beforeChange by mutating data.
- **Using depth > 0 on edit_history queries for the panel:** Resolving editor relationship deeply is unnecessary -- fetch user details separately with select fields for performance.
- **Storing live-resolved relationship labels:** Labels must be snapshot-frozen at save time, not re-resolved when viewing history. If a "Farbe" is renamed later, the history should show the old name.
- **Computing diff on client side:** The diff must be computed server-side in the afterChange hook using previousDoc vs doc. Client components only display the stored diff.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Infinite loop prevention | Custom tracking variable | `req.context.skipEditHistory` | Official Payload pattern, works across async boundaries |
| Relationship label resolution | Client-side resolution | Server-side `req.payload.find()` at save time | Labels must be frozen snapshots, not live data |
| History data loading | Custom fetch wrapper | Standard `fetch('/api/edit_history?...')` with Payload REST API | Payload REST auto-handles auth, pagination, filtering |
| Date formatting | Manual string formatting | `Intl.DateTimeFormat('de-DE', ...)` | Consistent locale-aware formatting, already used in project |

**Key insight:** The edit_history Collection already exists with create: false access control. The overrideAccess: true pattern in hooks is the Payload-blessed way to write system entries that users cannot create directly.

## Common Pitfalls

### Pitfall 1: Infinite Loop via afterChange + update
**What goes wrong:** afterChange hook updates the same document (to set last_edited_by), which triggers another afterChange, creating endless recursion
**Why it happens:** Payload re-runs all hooks on every update operation
**How to avoid:** Set last_edited_by in beforeChange (mutate data, not a separate update call). The afterChange hook only creates NEW edit_history entries, never updates the profile itself.
**Warning signs:** Server logs showing rapidly increasing edit_history entries, CPU spike, eventual stack overflow

### Pitfall 2: Relationship IDs Without Labels
**What goes wrong:** Diff stores only UUIDs like `["abc-123", "def-456"]` which are meaningless in the UI
**Why it happens:** Profile Hub fields use maxDepth: 0, so previousDoc and doc contain string IDs only
**How to avoid:** In the afterChange hook, detect which fields are relationship fields and resolve their labels via `req.payload.find()` with select: { name: true } (most collections use useAsTitle: "name"). Freeze the resolved labels into the diff at save time.
**Warning signs:** History panel showing raw UUIDs instead of human-readable names

### Pitfall 3: beforeChange data is Partial
**What goes wrong:** Diff computation fails because beforeChange `data` only contains changed fields, not the full document
**Why it happens:** Payload's beforeChange `data` arg is `Partial<T>` -- it contains only the fields being modified
**How to avoid:** Use `originalDoc` (full document before changes) in beforeChange for reading previous state. In afterChange, use `previousDoc` (full before state) and `doc` (full after state) for diff computation.
**Warning signs:** Missing fields in diff output, incomplete change detection

### Pitfall 4: Nested Group Fields in Diff
**What goes wrong:** Group fields like `technische_daten` or `masse` appear as single changed object instead of individual sub-fields
**Why it happens:** Top-level JSON.stringify comparison treats the entire group as one value
**How to avoid:** For group fields, compare individual sub-fields (e.g., `technische_daten.uw_wert`) and report them with dot-path notation in the diff. Or compare at group level and show the group name with before/after values for the changed sub-fields.
**Warning signs:** Diff showing "technische_daten changed" without specifying which sub-field

### Pitfall 5: History Tab vs Field Tab Confusion
**What goes wrong:** Adding "Historie" as a field-level tab (type: 'tabs') puts it inside the form, which is wrong for external data display
**Why it happens:** Profile already uses field-level tabs for Kombinationen/Ausstattung
**How to avoid:** Use document-level view tabs (`admin.components.views.edit.history`) for the History panel. This creates a separate route (`/profile/{id}/history`) that loads independently.
**Warning signs:** History component trying to interact with form state, or form state being affected by history data

## Code Examples

### Diff Computation with Relationship Label Resolution
```typescript
// src/lib/diff-utils.ts
// Recommended approach for diff computation

interface DiffEntry {
  field: string
  from: unknown
  to: unknown
}

// Fields to exclude from diff
const EXCLUDED_FIELDS = new Set([
  'updatedAt', 'createdAt', 'id', 'last_edited_by',
])

// Relationship fields on Profile that need label resolution
const RELATIONSHIP_FIELDS: Record<string, { collection: string; titleField: string }> = {
  material: { collection: 'materialien', titleField: 'name' },
  erlaubte_produkttypen: { collection: 'produkttypen', titleField: 'name' },
  erlaubte_fensterformen: { collection: 'fensterformen', titleField: 'name' },
  erlaubte_fluegelanzahl: { collection: 'fluegelanzahl', titleField: 'name' },
  erlaubte_oeffnungsarten: { collection: 'oeffnungsarten', titleField: 'name' },
  erlaubte_zusatzlichter: { collection: 'zusatzlichter', titleField: 'name' },
  erlaubte_farben: { collection: 'farben', titleField: 'name' },
  erlaubte_dichtungsfarben: { collection: 'dichtungsfarben', titleField: 'name' },
  erlaubte_verglasungen: { collection: 'verglasungen', titleField: 'name' },
  erlaubte_schallschutz: { collection: 'schallschutz', titleField: 'name' },
  erlaubte_sicherheitsglas: { collection: 'sicherheitsglas', titleField: 'name' },
  erlaubte_glasdekore: { collection: 'glasdekore', titleField: 'name' },
  erlaubte_sprossen: { collection: 'sprossen', titleField: 'name' },
  erlaubte_extras: { collection: 'extras', titleField: 'name' },
}

// All collections use useAsTitle: "name" except:
// - users: useAsTitle: "email" (but we format as "Vorname Nachname (email)")
// - profile: useAsTitle: "name_technisch"
// For Hub relationship fields, all target collections use "name" as title.
```

### Resolving Relationship Labels at Save Time
```typescript
// Inside afterChange hook
async function resolveRelationshipLabels(
  ids: string[],
  collection: string,
  titleField: string,
  payload: any, // Payload instance
): Promise<Array<{ id: string; label: string }>> {
  if (!ids.length) return []

  const { docs } = await payload.find({
    collection,
    where: { id: { in: ids } },
    select: { [titleField]: true },
    limit: ids.length,
    depth: 0,
    pagination: false,
  })

  return ids.map(id => {
    const doc = docs.find((d: any) => d.id === id)
    return { id, label: doc?.[titleField] ?? id }
  })
}
```

### History Panel REST Query
```typescript
// Inside ProfileHistoryPanel component
const params = new URLSearchParams()
params.set('where[collection][equals]', 'profile')
params.set('where[doc_id][equals]', docId)
params.set('limit', '50')
params.set('sort', '-timestamp')
params.set('depth', '1') // resolve editor relationship
const res = await fetch(`/api/edit_history?${params}`, { credentials: 'include' })
```

### Editor Name Formatting
```typescript
// Format editor display name
function formatEditorName(editor: { vorname?: string; nachname?: string; email: string }): string {
  const parts = [editor.vorname, editor.nachname].filter(Boolean)
  const name = parts.join(' ')
  return name ? `${name} (${editor.email})` : editor.email
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload 2 hooks API | Payload 3 hooks with req.context | Payload 3.0 release | context object is now official, no need for workarounds |
| Custom admin views via plugin | String-based component paths | Payload 3.0 | Use `"@/path#export"` format for all admin components |
| Field-level tabs only | Document-level view tabs | Payload 3.0 | `admin.components.views.edit.{key}` adds tabs with custom routes |

**Deprecated/outdated:**
- `form.replaceState()` -- not a real Payload API; use `dispatchFields({ type: 'REPLACE_STATE' })` instead (Phase 10 decision)
- `versions: { drafts: true }` on Profile -- explicitly deferred (VRSN-01, v1.2), no _status field

## Codebase Integration Details

### Existing Assets (No Changes Needed)
- `src/collections/system/edit-history.ts` -- Collection complete with correct access control
- `src/collections/system/users.ts` -- Already has vorname + nachname fields
- `src/payload.config.ts` -- edit_history already registered in collections array
- `src/components/admin/undo-redo-provider.tsx` -- UndoRedoProvider already registered as global provider

### Files to Modify
- `src/collections/produkte/profile.ts` -- Add: last_edited_by field (hidden), hooks array, history tab view config, beforeDocumentControls for last-editor component
- Import map regeneration: `npm run generate:importmap` after adding new components
- Type regeneration: `npm run generate:types` after schema changes to profile.ts

### Key Integration Constraint
The `beforeDocumentControls` array currently has ProfileEditToolbar. The ProfileLastEditor component must be added to this array as a second entry. Both components render in the same area (before the document save/publish controls).

### Hook Ordering
Existing hooks: Profile currently has NO hooks. The new hooks will be the first ones added.
Pattern: Follow anfragen.ts -- beforeChange hooks first (data mutation), afterChange hooks second (side effects), each wrapped in try/catch for non-blocking behavior.

## Open Questions

1. **Document View Tab vs Field Tab Rendering Position**
   - What we know: Document view tabs create separate routes. Field tabs are part of the form.
   - What's unclear: Whether document-level "Historie" tab will visually render at the same level as the field-level "Kombinationen"/"Ausstattung" tabs, or at a different navigation level (top of edit view vs within form).
   - Recommendation: Use document view tab. If it renders at a different visual level, this is actually better (separates data entry from history viewing). Test during implementation and adjust if the visual hierarchy feels wrong.

2. **Relationship Label Resolution Performance**
   - What we know: Profile has 14 relationship fields (1 single + 13 hasMany). Worst case: all 14 changed, each needing a find() query.
   - What's unclear: Whether batching all ID lookups into fewer queries is necessary for performance.
   - Recommendation: Only resolve labels for fields that actually changed (in the diff). Use `select` to fetch only the title field. Most saves change 1-3 fields, so performance is not a concern. For rare bulk changes, the queries are still fast with indexed ID lookups.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jsdom) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=test-name -x` |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HIST-02 | beforeChange sets last_edited_by | unit | `npx jest --testPathPattern=test-profile-hooks -x` | No -- Wave 0 |
| HIST-03 | afterChange creates edit_history with diff | unit | `npx jest --testPathPattern=test-profile-hooks -x` | No -- Wave 0 |
| HIST-04 | req.context.skipEditHistory prevents loop | unit | `npx jest --testPathPattern=test-profile-hooks -x` | No -- Wave 0 |
| HIST-05 | History panel renders entries | manual-only | Manual: open profile edit, click Historie tab | N/A (React component in Payload admin) |
| HIST-06 | last_edited_by header shows editor info | manual-only | Manual: save profile, check header line | N/A (React component in Payload admin) |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=test-profile-hooks -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-profile-hooks.test.ts` -- covers HIST-02, HIST-03, HIST-04 (hook logic, diff computation, context guard)
- [ ] `tests/unit/test-diff-utils.test.ts` -- covers diff computation pure functions (if extracted to lib/diff-utils.ts)
- Note: HIST-05 and HIST-06 are UI components rendered inside Payload Admin -- not unit-testable without full Payload integration test setup. Manual QA required.

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/collections/business/anfragen.ts` -- proven hook pattern with beforeChange + afterChange + req.payload.create
- Project codebase: `src/collections/system/edit-history.ts` -- existing collection with correct access control
- Project codebase: `src/collections/system/users.ts` -- already has vorname/nachname fields
- Project codebase: `src/components/admin/profile-edit-toolbar.tsx` -- established beforeDocumentControls pattern
- [Payload CMS Collection Hooks docs](https://payloadcms.com/docs/hooks/collections) -- beforeChange/afterChange argument shapes
- [Payload CMS Context docs](https://payloadcms.com/docs/hooks/context) -- req.context pattern for inter-hook communication

### Secondary (MEDIUM confidence)
- [Payload CMS Document Views docs](https://payloadcms.com/docs/custom-components/document-views) -- custom tab configuration for edit view
- [Payload CMS Tabs Field docs](https://payloadcms.com/docs/fields/tabs) -- field-level tabs (for understanding distinction)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, no new dependencies
- Architecture: HIGH -- patterns proven in codebase (anfragen.ts hooks, status_historie audit log, ProfileEditToolbar beforeDocumentControls)
- Pitfalls: HIGH -- infinite loop prevention is well-documented in Payload docs, data partial issue confirmed in official docs
- Diff computation: MEDIUM -- relationship label resolution approach is sound but exact performance characteristics depend on number of changed relationship fields per save
- Document view tab: MEDIUM -- configuration syntax verified via official docs, but visual rendering position relative to field-level tabs needs implementation verification

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- Payload 3.79.x, no breaking changes expected)
