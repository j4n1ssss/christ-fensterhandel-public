# Phase 10: Undo/Redo - Research

**Researched:** 2026-03-18
**Domain:** Payload CMS Admin Form API, Client-Side State Management
**Confidence:** HIGH

## Summary

Phase 10 implements undo/redo functionality for the Profile Edit-View in the Payload Admin Panel. This is a purely client-side feature that captures form state snapshots and restores them using Payload's internal Form API. The critical API surface is well-understood from inspecting the installed `@payloadcms/ui` 3.79.0 source code.

The core mechanism is: `form.getFields()` returns `FormState` (a `Record<string, FieldState>` where each key is a field path and each value contains `value`, `valid`, `initialValue`, etc.). `form.replaceState(state: FormState)` dispatches a `REPLACE_STATE` action to the field reducer, which replaces the entire form state. These two functions are type-compatible, confirming the CONTEXT.md decision to use `getFields()` (not `getData()`). A PoC must verify that relationship fields (specifically hasMany with `maxDepth: 0`, which stores string ID arrays) survive the round-trip.

**Primary recommendation:** Implement PoC first to verify `getFields()` + `dispatchFields({ type: 'REPLACE_STATE', state })` works with hasMany relationship fields. Use `dispatchFields` directly (not `form.replaceState()`) because `form.replaceState()` calls `setModified(false)` which is wrong for undo (form should remain dirty after undo).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- PoC ZUERST: form.getFields() + replaceState() mit Relationship-Feldern verifizieren BEVOR volle Implementierung
- getFields() verwenden, NICHT getData() (Type-Mismatch mit replaceState)
- Falls replaceState fuer Relationships fehlschlaegt: Fallback auf per-field dispatchFields
- Nur Icons (Pfeil-links / Pfeil-rechts), kein Text-Label, kein Zaehler
- Position: beforeDocumentControls im Profile Edit-View (links neben den Payload-Buttons)
- Buttons im Payload-nativen Stil (ghost/outline) -- kein visueller Stilbruch
- Disabled-State: Opacity reduziert (~40%) wenn kein Undo/Redo moeglich
- Tooltip bei Hover zeigt Aktion + Keyboard-Shortcut: "Rueckgaengig (Cmd+Z)" / "Wiederherstellen (Cmd+Shift+Z)"
- Doppeltes Feedback: Feld-Highlight UND Toast-Nachricht
- Feld-Highlight: Geaenderte Felder flashen kurz gelb (Warnung-Farbe, ~500ms)
- Toast: Kleine Benachrichtigung mit Aktion + Feldanzahl ("3 Felder rueckgaengig gemacht")
- Toast verschwindet nach 2 Sekunden
- Cmd+Z (Undo) und Cmd+Shift+Z (Redo) im Profile Edit-View
- Shortcuts nur aktiv wenn Profile Edit-View fokussiert (kein Conflict mit Browser/Payload-eigenen Shortcuts)
- Stack per collectionSlug:id isoliert (useDocumentInfo) -- kein Cross-Document Bleed
- Snapshots mit 300ms Debounce (natuerliches Editier-Verhalten: schnelle Klicks werden zusammengefasst)
- Stack-Limit: maximal 50 Snapshots pro Session
- Session-scoped: Stack wird bei Navigation (Dokument wechseln) verworfen
- Save als Checkpoint: Nach erfolgreichem Speichern bleibt der Stack bestehen, aber Undo geht maximal bis zum letzten Save-Zeitpunkt zurueck (Boden-Index Muster)
- Relationship-Aenderungen: Debounce regelt die Granularitaet (300ms erfasst natuerliches Editier-Verhalten)
- UndoRedoProvider als globaler Admin-Provider registriert (admin.components.providers)
- ProfileEditToolbar rendert nur im Profile Edit-View (beforeDocumentControls)
- Kein RHF reset() -- Payload Form-API (getFields/replaceState oder dispatchFields)

### Claude's Discretion
- Exakte PoC-Implementierung (wie getFields/replaceState getestet wird)
- Snapshot-Datenstruktur (welche Form-Fields in den Snapshot einfliessen)
- Toast-Implementierung (Payload-eigene Toast-API oder eigene Loesung)
- Feld-Highlight CSS-Implementierung (CSS Transition vs. requestAnimationFrame)
- Diff-Berechnung fuer Feld-Highlight (welche Felder sich zwischen Snapshots geaendert haben)

### Deferred Ideas (OUT OF SCOPE)
- Undo/Redo fuer andere Collections (nicht nur Profile) -- v1.2 GLOB-01
- Undo-History persistieren ueber Sessions hinweg -- nicht geplant
- Undo nach Navigation (zurueck zum vorherigen Dokument) -- bewusst nicht implementiert
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UNDO-01 | PoC: form.getFields() + replaceState() funktioniert mit Relationship-Feldern | FormState type analysis confirms getFields() returns FormState, replaceState accepts FormState. Relationship hasMany fields with maxDepth:0 store string ID arrays in FieldState.value. PoC must verify round-trip. |
| UNDO-02 | UndoRedoProvider als globaler Admin-Provider registriert | admin.components.providers accepts string array of component paths. Pattern: `'@/components/admin/undo-redo-provider#UndoRedoProvider'` |
| UNDO-03 | ProfileEditToolbar mit Undo/Redo Buttons im Profile Edit-View | beforeDocumentControls is an officially supported slot on collection config. Renders inside DocumentControls wrapper, left of save buttons. |
| UNDO-04 | Keyboard-Shortcuts Cmd+Z und Cmd+Shift+Z funktionieren | Payload exports `useHotkey` from `@payloadcms/ui` with `cmdCtrlKey` and `editDepth` support. Also exports `useEditDepth`. |
| UNDO-05 | Undo/Redo Stack ist Session-scoped und per Dokument isoliert | useDocumentInfo provides `id` and `collectionSlug` (via docConfig). Stack keyed by `collectionSlug:id`. |
| UNDO-06 | Snapshots werden debounced bei Formular-Aenderungen erstellt | useAllFormFields returns [FormState, dispatch] tuple. State changes trigger re-render. Combined with useRef-based debounce. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @payloadcms/ui | 3.79.0 | Form API hooks (useForm, useAllFormFields, useDocumentInfo) | Already installed, provides all needed form state management |
| sonner | (bundled via @payloadcms/ui) | Toast notifications | Payload re-exports `toast` from sonner -- native to the admin panel |
| payload | 3.79.0 | FormState types, FieldState types | Type definitions for form state snapshots |
| react | 19.1.x | Hooks, Context, refs | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | All dependencies are already available in the project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom toast | sonner (via Payload) | No alternative needed -- Payload already bundles sonner, use `toast` from `@payloadcms/ui` |
| Custom keyboard handler | useHotkey from @payloadcms/ui | useHotkey handles editDepth correctly, preventing conflicts with drawers. Custom handler would need to re-implement this logic. |
| Zustand/Redux for undo stack | React Context + useRef | Simpler, no extra dependency, session-scoped by design. Zustand is overkill for in-memory stack. |

**Installation:**
```bash
# No additional packages needed -- everything is already available
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/admin/
  undo-redo-provider.tsx     # Global provider (registered in payload.config.ts)
  profile-edit-toolbar.tsx   # Toolbar component (registered in profile.ts beforeDocumentControls)
  use-undo-redo.ts           # Hook: stack logic, snapshot management, keybindings
```

### Pattern 1: Global Provider + Collection-Specific Toolbar
**What:** UndoRedoProvider wraps all admin views (via admin.components.providers). ProfileEditToolbar renders only in the Profile Edit-View (via beforeDocumentControls). The toolbar uses the provider's context.
**When to use:** When state management needs to be available across component boundaries but UI is collection-specific.
**Example:**
```typescript
// payload.config.ts -- Provider registration
admin: {
  components: {
    providers: ['@/components/admin/undo-redo-provider#UndoRedoProvider'],
  },
}

// collections/produkte/profile.ts -- Toolbar registration
admin: {
  components: {
    edit: {
      beforeDocumentControls: [
        '@/components/admin/profile-edit-toolbar#ProfileEditToolbar'
      ],
    },
  },
}
```

### Pattern 2: getFields() Snapshot + dispatchFields REPLACE_STATE
**What:** Capture form state via `form.getFields()` (returns `FormState`), store deep clone in stack, restore via `dispatchFields({ type: 'REPLACE_STATE', state: snapshot })`.
**When to use:** When you need to capture and restore the complete form state including relationship fields, validation state, and row metadata.
**Critical Detail:** Use `dispatchFields` directly instead of `form.replaceState()`. The `form.replaceState()` wrapper calls `setModified(false)` which marks the form as unmodified -- wrong for undo (user expects form to be dirty after undo so they can save). After dispatching REPLACE_STATE, call `form.setModified(true)` to ensure the save button stays enabled.
**Example:**
```typescript
// Source: @payloadcms/ui 3.79.0 Form/types.d.ts (verified from installed package)
import type { FormState } from 'payload'

// Capture snapshot
const snapshot: FormState = structuredClone(form.getFields())

// Restore snapshot
const [, dispatchFields] = useAllFormFields()
dispatchFields({ type: 'REPLACE_STATE', state: snapshot })
form.setModified(true) // Keep form dirty after undo
```

### Pattern 3: Document-Scoped Stack with Boden-Index
**What:** Stack is keyed by `${collectionSlug}:${id}`. A `floorIndex` tracks the last save point. `undo()` returns null when it reaches the floor. After save, floorIndex advances to current position.
**When to use:** When undo should not go past the last saved state, and stacks must be isolated per document.
**Example:**
```typescript
interface UndoStack {
  snapshots: FormState[]
  currentIndex: number
  floorIndex: number  // Set to currentIndex after save
  maxSize: number     // 50
}
```

### Pattern 4: useHotkey for Keyboard Shortcuts
**What:** Payload provides `useHotkey` that handles Cmd/Ctrl correctly and respects `editDepth` (prevents firing inside drawers).
**When to use:** Always for admin keyboard shortcuts to avoid conflicts.
**Example:**
```typescript
// Source: @payloadcms/ui hooks/useHotkey.d.ts (verified)
import { useHotkey, useEditDepth } from '@payloadcms/ui'

const editDepth = useEditDepth()

// Undo: Cmd+Z
useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['z'] }, (e) => {
  // Only fire if Shift is NOT pressed (otherwise it's Redo)
  if (!e.shiftKey) {
    e.preventDefault()
    handleUndo()
  }
})

// Redo: Cmd+Shift+Z
useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['z'] }, (e) => {
  if (e.shiftKey) {
    e.preventDefault()
    handleRedo()
  }
})
```

### Pattern 5: Toast via Payload's sonner
**What:** Payload re-exports `toast` from sonner. Use it for undo/redo feedback.
**Example:**
```typescript
import { toast } from '@payloadcms/ui'

toast.info(`${changedFieldCount} Felder rueckgaengig gemacht`, {
  duration: 2000,
})
```

### Anti-Patterns to Avoid
- **Using getData() for snapshots:** `getData()` calls `reduceFieldsToValues()` which strips FieldState metadata (valid, initialValue, rows, etc.). The result is `Data` (plain values), NOT `FormState`. Passing it to `replaceState()` would cause type errors and lose validation state.
- **Using form.replaceState() directly for undo:** This wrapper calls `setModified(false)`, marking the form as unmodified. After an undo, the form SHOULD be dirty so the user can save. Use `dispatchFields({ type: 'REPLACE_STATE', state })` + `form.setModified(true)` instead.
- **Using RHF reset():** Payload wraps React Hook Form internally but the admin form API is the correct interface. Using RHF directly bypasses Payload's state management and will cause sync issues.
- **Storing snapshots as JSON strings:** `JSON.stringify` + `JSON.parse` for deep clone works but loses any non-serializable data. Use `structuredClone()` which handles all JS types correctly and is available in all modern browsers + Node 17+.
- **Global keyboard listener (document.addEventListener):** This bypasses Payload's editDepth system and will fire inside drawers (e.g., when adding a new relationship item). Use `useHotkey` instead.
- **Watching useAllFormFields for change detection:** `useAllFormFields()` returns a new tuple on every state change, which triggers component re-renders. Use `useFormFields` with a selector for targeted watching, or use `useEffect` with `form.getFields()` in a ref to debounce.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast component | `toast` from `@payloadcms/ui` (sonner) | Already integrated in Payload admin, matches styling, handles stacking |
| Keyboard shortcuts | `document.addEventListener('keydown')` | `useHotkey` from `@payloadcms/ui` | Handles Cmd vs Ctrl, respects editDepth (drawer nesting), prevents conflicts |
| Form state capture | Custom field traversal | `form.getFields()` | Returns complete FormState including relationship fields, validation, rows |
| Form state restore | Per-field setValue loops | `dispatchFields({ type: 'REPLACE_STATE', state })` | Atomic state replacement, handles all field types including relationships |
| Deep clone | `JSON.parse(JSON.stringify())` | `structuredClone()` | Handles all JS types, no serialization edge cases, native API |

**Key insight:** The entire undo/redo system is built on two Payload API calls (`getFields` and `REPLACE_STATE` dispatch) plus standard React patterns. No external libraries are needed.

## Common Pitfalls

### Pitfall 1: replaceState sets modified to false
**What goes wrong:** After undo, the form appears unmodified and the save button is disabled. User cannot save the undone state.
**Why it happens:** `form.replaceState()` internally calls `setModified(false)` (verified in @payloadcms/ui 3.79.0 Form/index.js line 520).
**How to avoid:** Use `dispatchFields({ type: 'REPLACE_STATE', state })` directly, then call `form.setModified(true)`.
**Warning signs:** Save button becomes disabled after undo.

### Pitfall 2: Snapshot captures stale state via closure
**What goes wrong:** Debounced snapshot captures outdated state because `form.getFields()` was called inside a closure that closed over stale variables.
**Why it happens:** `getFields()` reads from `contextRef.current.fields` which is always current (verified from source), BUT if you capture the return value in a variable and use it later, it's already stale.
**How to avoid:** Always call `form.getFields()` at the moment of snapshot, inside the debounce callback, not before it.
**Warning signs:** Undo restores to wrong state, especially after rapid edits.

### Pitfall 3: useAllFormFields triggers excessive re-renders
**What goes wrong:** Component re-renders on every form field change (typing in any field), causing performance issues.
**Why it happens:** `useAllFormFields()` returns `[FormState, Dispatch]` and the FormState reference changes on every field update.
**How to avoid:** Use `useFormFields` with a targeted selector for specific fields, or use `useEffect` with a ref-based comparison for the debounced snapshot logic. The toolbar buttons themselves should derive their enabled/disabled state from the undo/redo stack (stored in refs), not from form state.
**Warning signs:** Laggy typing in the Profile edit form after adding undo/redo.

### Pitfall 4: Keyboard shortcut fires inside relationship drawers
**What goes wrong:** Cmd+Z triggers undo while user is editing inside a relationship drawer (e.g., creating a new Farbe).
**Why it happens:** Global keyboard listeners don't respect Payload's drawer nesting (editDepth).
**How to avoid:** Use `useHotkey` with `editDepth` from `useEditDepth()`. This ensures the hotkey only fires at the correct nesting level.
**Warning signs:** Unexpected form state changes when using drawers.

### Pitfall 5: Cross-document state bleed
**What goes wrong:** Undo stack from Profile A is applied when navigating to Profile B.
**Why it happens:** Provider persists across route changes if not properly keyed.
**How to avoid:** Key the stack by `${docConfig?.slug}:${id}` from `useDocumentInfo()`. Reset stack when key changes. The provider should use a `Map<string, UndoStack>` or reset on key change.
**Warning signs:** Fields change unexpectedly after navigating between profiles.

### Pitfall 6: customComponents in FormState cause issues
**What goes wrong:** `structuredClone()` fails or produces huge snapshots because FormState entries contain React elements in `customComponents`.
**Why it happens:** `FieldState` has a `customComponents` property containing rendered React nodes (JSX), which are not cloneable.
**How to avoid:** Strip `customComponents` from each field before storing the snapshot. Only store `value`, `initialValue`, `valid`, `rows`, and other serializable properties. On restore, the existing customComponents in the live form state will be preserved by the REPLACE_STATE reducer's optimize logic.
**Warning signs:** `structuredClone()` throws DOMException, or snapshots are several MB in size.

### Pitfall 7: REPLACE_STATE optimize mode skips unchanged fields
**What goes wrong:** After REPLACE_STATE, some fields don't update visually even though the snapshot has different values.
**Why it happens:** The fieldReducer's REPLACE_STATE with `optimize !== false` (default) uses `dequal` to compare old and new fields. If the comparison fails (e.g., due to object identity issues), fields may not update.
**How to avoid:** When dispatching REPLACE_STATE for undo, pass `optimize: false` to force a complete state replacement: `dispatchFields({ type: 'REPLACE_STATE', state: snapshot, optimize: false })`.
**Warning signs:** Some fields don't revert visually after undo, especially relationship fields.

## Code Examples

Verified patterns from installed package source:

### Accessing Form API
```typescript
// Source: @payloadcms/ui 3.79.0 forms/Form/context.d.ts
import { useForm, useAllFormFields, useEditDepth } from '@payloadcms/ui'
import { useDocumentInfo } from '@payloadcms/ui'

// useForm returns Context with: getFields, getData, dispatchFields, replaceState, setModified, submit, etc.
const form = useForm()

// useAllFormFields returns [FormState, Dispatch<FieldAction>]
const [fields, dispatchFields] = useAllFormFields()

// useDocumentInfo returns DocumentInfoContext with: id, collectionSlug (via docConfig), etc.
const { id, docConfig } = useDocumentInfo()
const collectionSlug = docConfig?.slug // 'profile'
```

### FormState Structure (for relationship fields)
```typescript
// Source: payload 3.79.0 admin/forms/Form.d.ts
// FormState = Record<string, FieldState>
// FieldState has: value, initialValue, valid, rows, customComponents, etc.

// Example FormState for a profile with hasMany relationship:
// {
//   'name_technisch': { value: 'Iglo 5', valid: true, initialValue: 'Iglo 5', ... },
//   'erlaubte_farben': { value: ['uuid-1', 'uuid-2'], valid: true, rows: [...], ... },
//   'erlaubte_farben.0': { value: 'uuid-1', ... },
//   'erlaubte_farben.1': { value: 'uuid-2', ... },
//   'technische_daten.uw_wert': { value: 1.3, valid: true, ... },
//   ...
// }
```

### REPLACE_STATE Action Type
```typescript
// Source: @payloadcms/ui 3.79.0 forms/Form/types.d.ts
type REPLACE_STATE = {
  optimize?: boolean    // default true: only update changed fields via dequal
  sanitize?: boolean    // default false: set valid=true for fields without valid
  state: FormState
  type: 'REPLACE_STATE'
}
```

### Stripping customComponents for Snapshot Storage
```typescript
// customComponents contains React nodes (not cloneable)
function createCleanSnapshot(formState: FormState): FormState {
  const clean: FormState = {}
  for (const [path, field] of Object.entries(formState)) {
    const { customComponents, ...rest } = field
    clean[path] = { ...rest }
  }
  return structuredClone(clean)
}
```

### Toast API
```typescript
// Source: @payloadcms/ui re-exports sonner's toast
import { toast } from '@payloadcms/ui'

// Simple info toast with 2s duration
toast.info('3 Felder rueckgaengig gemacht', { duration: 2000 })
toast.info('2 Felder wiederhergestellt', { duration: 2000 })
```

### useHotkey API
```typescript
// Source: @payloadcms/ui hooks/useHotkey.d.ts
import { useHotkey, useEditDepth } from '@payloadcms/ui'

const editDepth = useEditDepth()

// keyCodes use Event.code without 'Key' prefix, lowercased
// 'z' matches KeyZ
useHotkey(
  { cmdCtrlKey: true, editDepth, keyCodes: ['z'] },
  (e: KeyboardEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      handleRedo()
    } else {
      e.preventDefault()
      handleUndo()
    }
  }
)
```

### Component Registration Pattern (project-established)
```typescript
// Source: existing project pattern in payload.config.ts
// String-based component registration with hash for named export
'@/components/admin/undo-redo-provider#UndoRedoProvider'
'@/components/admin/profile-edit-toolbar#ProfileEditToolbar'

// After adding new components, run:
// npm run generate:importmap
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| RHF reset() for form restore | Payload Form API (getFields/replaceState) | Payload 3.x | Payload wraps RHF internally; direct RHF access bypasses state sync |
| Custom toast components | sonner via @payloadcms/ui | Payload 3.x | toast imported directly from @payloadcms/ui, no setup needed |
| document.addEventListener for shortcuts | useHotkey from @payloadcms/ui | Payload 3.x | Handles editDepth, Cmd/Ctrl, prevents drawer conflicts |
| JSON.parse(JSON.stringify()) for clone | structuredClone() | Browser baseline 2022+ | Native, handles more types, no serialization edge cases |

**Deprecated/outdated:**
- `form.getData()` for snapshot purposes: Returns `Data` not `FormState`, incompatible with `replaceState`
- `useWatchForm()`: Exists but less suitable than `useAllFormFields` for change detection
- Manual `REPLACE_STATE` with `sanitize: true`: Marked as TODO for removal in Payload 4.0

## Open Questions

1. **Does structuredClone handle all FieldState properties correctly?**
   - What we know: FieldState contains `value`, `valid`, `rows`, `initialValue`, `customComponents` (React nodes). We strip customComponents before cloning.
   - What's unclear: Whether `rows` (which contain React nodes in `customComponents.RowLabel`) needs similar stripping.
   - Recommendation: In the PoC, test with a Profile that has populated hasMany relationships (which have rows). Strip `customComponents` from both FieldState and Row entries before cloning.

2. **How does REPLACE_STATE interact with Payload's autosave/onChange?**
   - What we know: Payload Form has `onChange` callbacks that fire on state changes. REPLACE_STATE will trigger these.
   - What's unclear: Whether the onChange callback will cause a server round-trip that overwrites the restored state.
   - Recommendation: Monitor PoC behavior. If onChange triggers unwanted server calls, use a ref-based guard (`isUndoRedoInProgress`) that the onChange handler checks.

3. **Will the PoC need an actual running Payload instance?**
   - What we know: The form hooks only work inside a Payload admin context (they read from React contexts).
   - What's unclear: Whether a unit test can mock these contexts sufficiently.
   - Recommendation: PoC should be a live test in the running admin panel, not a unit test. The PoC component can be a temporary addition to beforeDocumentControls that logs getFields() output and tests replaceState.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2 + ts-jest + jsdom |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=undo --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UNDO-01 | getFields/replaceState round-trip with relationships | manual (live admin) | N/A -- requires Payload admin context | N/A -- PoC is the test |
| UNDO-02 | UndoRedoProvider renders without errors | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | Wave 0 |
| UNDO-03 | Toolbar buttons enable/disable based on stack | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | Wave 0 |
| UNDO-04 | Keyboard shortcuts (Cmd+Z / Cmd+Shift+Z) | manual (live admin) | N/A -- requires useHotkey context | N/A |
| UNDO-05 | Stack isolation per document (key by slug:id) | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | Wave 0 |
| UNDO-06 | Debounced snapshots (300ms, max 50, floor index) | unit | `npx jest tests/unit/test-undo-redo.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-undo-redo.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green + manual QA in running admin panel

### Wave 0 Gaps
- [ ] `tests/unit/test-undo-redo.test.ts` -- covers UNDO-02, UNDO-03, UNDO-05, UNDO-06 (stack logic is pure functions, testable without Payload context)
- [ ] Stack logic should be extracted into a pure function/class (no React hooks) for testability

## Sources

### Primary (HIGH confidence)
- `@payloadcms/ui` 3.79.0 installed source code -- Form/types.d.ts, Form/context.d.ts, Form/index.js, Form/fieldReducer.js
- `payload` 3.79.0 installed source code -- admin/forms/Form.d.ts (FormState, FieldState types)
- `@payloadcms/next` 3.79.0 installed source code -- views/Document/renderDocumentSlots.js (beforeDocumentControls rendering)
- `@payloadcms/ui` hooks/useHotkey.d.ts -- keyboard shortcut API
- `@payloadcms/ui` providers/DocumentInfo/types.d.ts -- useDocumentInfo API
- `@payloadcms/ui` exports/client/index.d.ts -- toast (sonner) re-export, useEditDepth export

### Secondary (MEDIUM confidence)
- `docs/todos/008_2026-03-15_admin-panel-umbau-plan.md` -- Feature B sections B.1-B.4 (implementation plan, code skeletons)
- Existing project patterns in `src/components/admin/` (status-workflow.tsx, webhook-fehler-badge.tsx)

### Tertiary (LOW confidence)
- None -- all findings verified from installed source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all APIs verified from installed 3.79.0 source code
- Architecture: HIGH -- beforeDocumentControls, providers, Form API all confirmed in source
- Pitfalls: HIGH -- replaceState/setModified behavior verified line-by-line in Form/index.js
- PoC approach: MEDIUM -- getFields/REPLACE_STATE are type-compatible per types, but runtime behavior with hasMany relationships needs live verification (hence the PoC requirement)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (Payload 3.79.0 is stable release, APIs unlikely to change in patch versions)
