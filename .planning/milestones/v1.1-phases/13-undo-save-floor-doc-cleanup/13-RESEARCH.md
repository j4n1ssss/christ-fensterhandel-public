# Phase 13: Undo Save-Floor Fix + Doc Cleanup - Research

**Researched:** 2026-03-22
**Domain:** Payload CMS admin form lifecycle, undo/redo state management, documentation consistency
**Confidence:** HIGH

## Summary

Phase 13 is a gap closure phase that addresses three specific issues identified in the v1.1 milestone audit. The three gaps are well-scoped and independent: (1) the undo-redo floor does not advance after save because `markSaved()` is never called from the form lifecycle, (2) `erlaubte_produkttypen` is a valid Hub field on Profile but intentionally has no filter path in `filters.ts` -- this needs a code comment, and (3) the 11-02-SUMMARY.md frontmatter incorrectly references `initialData` when the actual code uses REST fetch.

All three issues are LOW severity, purely mechanical fixes. No new libraries, no architectural changes, no new features. The undo-redo floor fix is the only code change with behavioral impact -- the other two are documentation-only.

**Primary recommendation:** Use `useFormModified()` to detect the save completion event (modified transitions from true to false after successful save), then call `stack.markSaved()` to advance the undo floor. The other two items are straightforward text edits.

## Standard Stack

### Core (already installed, no additions needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @payloadcms/ui | 3.79.0 | Admin UI hooks (useForm, useFormModified, useFormProcessing) | Already in use for undo/redo |
| payload | (matched) | FormState types | Already in use |
| jest | 30.2.0 | Unit tests for UndoRedoStack | Already configured |
| ts-jest | 29.4.6 | TypeScript transform for Jest | Already configured |

### Supporting

No additional libraries needed.

### Alternatives Considered

None -- this phase uses only existing dependencies.

**Installation:**
```bash
# No installation needed
```

## Architecture Patterns

### Recommended Project Structure

No new files needed. Changes touch existing files only:

```
src/
  components/admin/
    use-undo-redo.ts          # ADD: markSaved() call on save detection
  lib/konfigurator/
    filters.ts                # ADD: inline comment for erlaubte_produkttypen
.planning/phases/11-*/
    11-02-SUMMARY.md          # FIX: frontmatter + key-decisions text
```

### Pattern 1: Save Detection via useFormModified()

**What:** Payload CMS sets `modified` to `false` after a successful form submission. By tracking the transition from `true` to `false`, we can detect a successful save and call `markSaved()` on the undo-redo stack.

**When to use:** Whenever you need to respond to a successful document save in a Payload admin component.

**How it works:**

The Payload form lifecycle during save:
1. User clicks Save -> `useFormProcessing()` returns `true`
2. Form submits to server
3. Server responds with success -> Payload internally calls `setModified(false)`
4. `useFormModified()` transitions from `true` to `false`
5. `useFormProcessing()` returns `false`

**Example:**
```typescript
// Source: Payload CMS @payloadcms/ui context.d.ts
import { useFormModified } from "@payloadcms/ui";

const modified = useFormModified();
const prevModifiedRef = useRef(modified);

useEffect(() => {
  // Detect save: modified went from true -> false
  if (prevModifiedRef.current === true && modified === false) {
    stack.markSaved();
    setCanUndo(stack.canUndo);
    setCanRedo(stack.canRedo);
  }
  prevModifiedRef.current = modified;
}, [modified, stack]);
```

**Confidence:** HIGH -- `useFormModified()` is a documented Payload hook exported from `@payloadcms/ui`. The boolean context `ModifiedContext` is set by `setModified(false)` after successful save, which is the standard Payload behavior.

**Why not other approaches:**
- `useFormSubmitted()` returns `true` after submit but does NOT distinguish success from failure
- `useFormProcessing()` indicates in-flight state but the `false` transition doesn't guarantee success
- Wrapping `form.submit()` is not viable because the Profile form is managed by Payload's default edit view, not our custom code
- The `modified: true -> false` transition is the most reliable signal because Payload only resets modified after the server confirms the save was successful

### Pattern 2: Inline Documentation Comment

**What:** Adding a code comment explaining why `erlaubte_produkttypen` has no Hub code path in `filters.ts`.

**When to use:** When an intentional omission in code might look like a bug to future developers.

**Why this specific field is excluded:**
- `erlaubte_produkttypen` is Hub field #14 on Profile (in OPTIONAL_HUB_FIELDS)
- Step 1 (Produkttyp selection) runs BEFORE a Profile is selected (Profile is chosen in Step 3)
- Therefore, there is no selected Profile to read `erlaubte_produkttypen` from at Step 1
- The chain filter for Step 1 returns `cmsData.produkttypen` unfiltered -- this is correct behavior

### Anti-Patterns to Avoid

- **Polling or setTimeout for save detection:** Do not use timers to detect save completion. Use React state/context transitions.
- **Modifying the stack's markSaved from outside the hook:** The `markSaved()` call must happen inside `useUndoRedo()` where the stack reference is held. Do not expose markSaved to ProfileEditToolbar.
- **Calling markSaved during form processing:** Must wait until processing is complete and modified has reset. Calling during processing could set the floor to a pre-save state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Save event detection | Custom event system or form wrapper | `useFormModified()` from @payloadcms/ui | Already exists, battle-tested, exact signal needed |
| Form state tracking | Manual MutationObserver or polling | Payload's context hooks | Framework provides the signal |

**Key insight:** The entire markSaved wiring is 10-15 lines of code using an existing Payload hook. The complexity is zero -- the only challenge was identifying the right signal.

## Common Pitfalls

### Pitfall 1: Using useFormSubmitted Instead of useFormModified
**What goes wrong:** `useFormSubmitted()` becomes `true` when the form is submitted, but it stays `true` even if the save FAILS (validation error, network error). This would advance the undo floor even on failed saves.
**Why it happens:** The name sounds right but the semantics are wrong for this use case.
**How to avoid:** Use `useFormModified()` which transitions to `false` only on SUCCESSFUL save.
**Warning signs:** Floor advances but form still shows validation errors.

### Pitfall 2: Guard Timing Conflict with markSaved
**What goes wrong:** The `isUndoRedoInProgress` guard (400ms) could interfere with the save detection useEffect if a user does undo then immediately saves.
**Why it happens:** The guard prevents debounced snapshot re-capture during undo/redo operations. If markSaved fires while the guard is active, the floor position is still correct (stack.markSaved() only sets floorIndex, it doesn't interact with the guard).
**How to avoid:** `markSaved()` is a pure index operation on the stack -- it does not push snapshots or interact with form state. No timing conflict exists. Just call it.
**Warning signs:** None expected.

### Pitfall 3: Stale Closure Over stack Reference
**What goes wrong:** The `useEffect` for save detection captures `stack` in its closure. If the docKey changes (user navigates to different profile), the stack reference would be stale.
**Why it happens:** React closure semantics.
**How to avoid:** Include `stack` in the useEffect dependency array. The stack reference changes when docKey changes (via getStack), so the effect re-runs correctly.
**Warning signs:** Wrong profile's undo floor advances.

### Pitfall 4: Incorrect SUMMARY Edits
**What goes wrong:** Editing 11-02-SUMMARY.md frontmatter without understanding which patterns are correct vs incorrect.
**Why it happens:** The SUMMARY was written before the fix in commit 6bf074a changed the data source from initialData to REST fetch.
**How to avoid:** The correction is:
- Remove `initialData-for-resolved-relationships` from `patterns:` list
- Change `key-decisions` from "useDocumentInfo().initialData" to "REST fetch /api/profile/{id}?depth=1"
- The `document-view-tab-with-rest-fetch` pattern is already CORRECT in the patterns list
- The `patterns-established` section referencing initialData should also be corrected

## Code Examples

### Save Detection in use-undo-redo.ts

```typescript
// Source: direct analysis of @payloadcms/ui/dist/forms/Form/context.d.ts
// and existing use-undo-redo.ts implementation

// Add import:
import { useFormModified } from "@payloadcms/ui";

// Inside useUndoRedo():
const modified = useFormModified();
const prevModifiedRef = useRef(modified);

// Add useEffect for save detection:
useEffect(() => {
  if (prevModifiedRef.current === true && modified === false) {
    stack.markSaved();
    setCanUndo(stack.canUndo);
    setCanRedo(stack.canRedo);
  }
  prevModifiedRef.current = modified;
}, [modified, stack]);
```

### erlaubte_produkttypen Comment in filters.ts

```typescript
// In the switch(step) block, at case 1:
case 1:
  // Produkttyp: no filtering — erlaubte_produkttypen Hub field exists on Profile
  // but is NOT used here because Step 1 runs BEFORE profile selection (Step 3).
  // The field serves admin organization purposes only.
  // See: .planning/v1.1-MILESTONE-AUDIT.md (INT-01)
  return cmsData.produkttypen;
```

### 11-02-SUMMARY.md Corrections

Lines to change in the frontmatter:
```yaml
# BEFORE (incorrect):
patterns: [initialData-for-resolved-relationships, beforeDocumentControls-client-component, document-view-tab-with-rest-fetch]
key-decisions:
  - "useDocumentInfo().initialData for resolved relationship data (form state only stores IDs as strings)"
patterns-established:
  - "initialData pattern: use useDocumentInfo().initialData for accessing resolved relationship objects (form state via useAllFormFields stores only IDs)"

# AFTER (correct):
patterns: [rest-fetch-for-resolved-relationships, beforeDocumentControls-client-component, document-view-tab-with-rest-fetch]
key-decisions:
  - "REST fetch /api/profile/{id}?depth=1 for resolved relationship data (form state only stores IDs as strings, useDocumentInfo().initialData not available in Payload v3)"
patterns-established:
  - "REST fetch pattern: use fetch('/api/profile/{id}?depth=1') for accessing resolved relationship objects (form state via useAllFormFields stores only IDs, useDocumentInfo().initialData unavailable)"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useDocumentInfo().initialData | REST fetch /api/profile/{id}?depth=1 | Phase 11 commit 6bf074a | initialData not available in Payload v3; REST fetch works reliably |
| No save-floor detection | useFormModified() transition detection | Phase 13 (this phase) | Undo cannot go past save point |

**Deprecated/outdated:**
- `useDocumentInfo().initialData` is not available in Payload CMS v3. The 11-02-SUMMARY.md documented the initially planned approach, but the implementation was corrected during execution.

## Open Questions

None. All three gaps are well-understood with clear solutions.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | jest.config.ts |
| Quick run command | `npx jest --testPathPattern=test-undo-redo` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map

This phase has no formal requirement IDs (gap closure only). Testing maps to the three success criteria:

| Criterion | Behavior | Test Type | Automated Command | File Exists? |
|-----------|----------|-----------|-------------------|-------------|
| SC-1 | markSaved advances floor after save | unit | `npx jest --testPathPattern=test-undo-redo -x` | Existing tests cover markSaved behavior (Tests 7, 8, 8b) |
| SC-2 | filters.ts comment for erlaubte_produkttypen | manual-only | N/A (code comment, no behavioral change) | N/A |
| SC-3 | 11-02-SUMMARY.md text correction | manual-only | N/A (documentation, no behavioral change) | N/A |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=test-undo-redo -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
None -- existing test infrastructure covers the markSaved() behavior. The unit tests for UndoRedoStack already verify markSaved semantics (Tests 7, 8, 8b). The new code in `use-undo-redo.ts` wires the already-tested markSaved() to a React lifecycle event, which is a hook-level integration concern tested via manual QA (not unit-testable without a full Payload admin environment).

## Sources

### Primary (HIGH confidence)
- `@payloadcms/ui/dist/forms/Form/context.d.ts` -- useFormModified, useFormSubmitted, useFormProcessing type definitions
- `@payloadcms/ui/dist/forms/Form/types.d.ts` -- FormContext type with setModified, submit
- `src/components/admin/use-undo-redo.ts` -- existing hook implementation
- `src/components/admin/undo-redo-stack.ts` -- markSaved() implementation
- `src/lib/konfigurator/filters.ts` -- existing filter logic with Step 1 unfiltered
- `.planning/v1.1-MILESTONE-AUDIT.md` -- gap definitions (FLOW-01, INT-01, doc inconsistency)
- `src/components/admin/profile-last-editor.tsx` -- confirms REST fetch pattern (not initialData)
- `src/components/admin/profile-history-panel.tsx` -- confirms REST fetch pattern
- `tests/unit/test-undo-redo.test.ts` -- existing markSaved tests

### Secondary (MEDIUM confidence)
None needed -- all findings from direct source code analysis.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing
- Architecture: HIGH - markSaved() already works (tested), save detection uses documented Payload hook
- Pitfalls: HIGH - analysis of @payloadcms/ui types confirms useFormModified is the right signal

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable, no moving parts)
