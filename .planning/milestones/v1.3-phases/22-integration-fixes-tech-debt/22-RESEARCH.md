# Phase 22: Integration Fixes + Tech Debt Cleanup - Research

**Researched:** 2026-03-27
**Domain:** Code hygiene -- import deduplication, customer-facing label consistency, dead CSS removal, date accuracy fix
**Confidence:** HIGH

## Summary

Phase 22 addresses 5 concrete tech-debt and integration-gap items identified by the v1.3 Milestone Audit. All issues are surgical, well-scoped fixes in existing files with no new libraries, no schema changes, and no new UI patterns required.

The fixes fall into three categories: (1) shared utility adoption -- `dashboard-overview.tsx` must import `formatCurrency` from `@/lib/format-currency` instead of defining its own copy, and `tab-panel.tsx` must import `HERSTELLER_STATUSES` from `detail-view-helpers.ts` instead of redeclaring it; (2) customer-facing label correctness -- `gast-tracking-form.tsx` must use `STATUS_CUSTOMER_TEXT` instead of `getStatusLabel()` since this is a customer-facing component; (3) cleanup -- the Splitbutton must show the real stornierung date (from `last_status_change_at`), and dead CSS class `.link-standard-view` must be removed from `custom.scss`.

**Primary recommendation:** Execute all 5 fixes in a single plan. Each fix is a 1-3 line change in a known file with no cascading effects. No new dependencies, no migrations, no API changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-02 | Alle Komponenten importieren Farben/Labels aus status-config.ts (keine lokale Duplikation) | Fixes 1 (formatCurrency dedup), 4 (HERSTELLER_STATUSES dedup) enforce single-source-of-truth pattern. Fix 2 (gast-tracking STATUS_CUSTOMER_TEXT) ensures status-config.ts is used for customer labels. |
| KUND-01 | Kunden sehen vereinfachte Status-Texte statt interner Admin-Statuse | Fix 2 directly: gast-tracking-form.tsx currently shows internal admin labels via `getStatusLabel()`, must switch to `STATUS_CUSTOMER_TEXT` for all 5 call sites. |
</phase_requirements>

## Standard Stack

No new libraries required. All fixes use existing project code.

### Core (already in project)
| Library | Version | Purpose | Relevant to Phase |
|---------|---------|---------|-------------------|
| React | 19.x | Component framework | Splitbutton prop addition |
| Payload CMS | 3.x | Admin panel, collection types | last_status_change_at field available on Anfragen |
| TypeScript | 5.x | Type safety | Export type of HERSTELLER_STATUSES array |

### Supporting
None needed.

### Alternatives Considered
None -- all fixes are refactoring existing code, not introducing new patterns.

## Architecture Patterns

### Pattern 1: Shared Utility Import (formatCurrency)

**What:** Replace local function definition with import from shared module.
**When to use:** When a utility already exists in `@/lib/` and is duplicated locally.
**Current state (dashboard-overview.tsx line 20):**
```typescript
// BAD: Local copy
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
```
**Target state:**
```typescript
// GOOD: Import from shared module
import { formatCurrency } from "@/lib/format-currency";
```
**Files:** `src/components/admin/dashboard-overview.tsx`
**Impact:** Remove lines 20-25, add import at line 1-4 block. The function signature and behavior are identical.

### Pattern 2: Customer-Facing Labels (STATUS_CUSTOMER_TEXT)

**What:** Customer-facing components must use `STATUS_CUSTOMER_TEXT` (warm, Siezen text) instead of `getStatusLabel()` (internal admin labels).
**Decision source:** STATE.md: "StatusBadge export retained for backward compatibility but now shows customer text" + "gast-tracking-form.tsx left out of scope -- still uses getStatusLabel (deferred)"
**Current state (gast-tracking-form.tsx):**
```typescript
import { STATUS_TAILWIND, getStatusLabel } from "@/lib/status-config";
// ...
{getStatusLabel(result.status || "")}      // line 186
{getStatusLabel(entry.zu_status)}          // line 219
{getStatusLabel(entry.von_status)}         // line 226
{getStatusLabel(entry.zu_status)}          // line 228
```
**Target state:**
```typescript
import { STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, type StatusKey } from "@/lib/status-config";
// ...
{STATUS_CUSTOMER_TEXT[result.status as StatusKey] ?? result.status}
{STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ?? entry.zu_status}
{STATUS_CUSTOMER_TEXT[entry.von_status as StatusKey] ?? entry.von_status}
{STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ?? entry.zu_status}
```
**Note on line 186:** This shows a status badge label. The customer text from `STATUS_CUSTOMER_TEXT` is a full sentence (e.g. "Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.") which is too long for a badge. For the badge, use a short customer-friendly version. Check how `status-banner.tsx` handles this -- it uses the full text in a banner context. For the badge label in the status overview, a short label may be more appropriate. The timeline entries (lines 219, 226, 228) should show the customer text.

**Important consideration:** The badge at line 186 shows a rounded-full pill with status text. Using the full `STATUS_CUSTOMER_TEXT` sentence would be far too long for a badge. Two options:
1. Use `STATUS_CUSTOMER_TEXT` for the badge too (consistent but long text in small badge)
2. Use `STATUS_LABELS` (short labels like "Neu", "In Bearbeitung") which are the same for admin and customer

Looking at how the Kunden components handle this: `status-banner.tsx` uses `STATUS_CUSTOMER_TEXT` for the banner text (full sentence). `anfrage-detail.tsx` also uses `STATUS_CUSTOMER_TEXT`. The ProgressStepper shows phase names. None use a short badge label from `STATUS_CUSTOMER_TEXT`. The success criteria says to use `STATUS_CUSTOMER_TEXT` for "Kunden-Anzeige" -- but the planner should decide if the badge gets the full sentence or if `STATUS_LABELS` (which are German human-readable labels, not internal codes) is acceptable for the pill.

### Pattern 3: Export Shared Constants (HERSTELLER_STATUSES)

**What:** Export the constant from its canonical location and import in consumers.
**Current state:** `HERSTELLER_STATUSES` is defined identically in two files:
- `src/lib/detail-view-helpers.ts` (lines 63-73) -- NOT exported, used internally by `shouldShowDetailsTab()`
- `src/components/admin/tab-panel.tsx` (lines 17-27) -- local copy, used for `showHersteller` check at line 241

**Target state:**
```typescript
// detail-view-helpers.ts: add export keyword
export const HERSTELLER_STATUSES = [ ... ];

// tab-panel.tsx: import instead of declare
import { shouldShowDetailsTab, HERSTELLER_STATUSES } from "@/lib/detail-view-helpers";
// Remove lines 17-27 (local declaration)
```

**Alternative:** tab-panel.tsx already imports `shouldShowDetailsTab` from `detail-view-helpers.ts`. Instead of importing the raw array, it could use `shouldShowDetailsTab(status)` directly. But the success criteria explicitly says "HERSTELLER_STATUSES Array existiert nur einmal (in detail-view-helpers.ts), tab-panel.tsx importiert es" -- so the export + import approach is required.

### Pattern 4: Real Date from Data (Splitbutton Stornierungsdatum)

**What:** Show actual stornierung date instead of `new Date()`.
**Current state (splitbutton.tsx line 140):**
```typescript
Storniert am {new Date().toLocaleDateString("de-DE")}
```
This always shows TODAY's date, not when the Anfrage was actually storniert.

**Target state:**
```typescript
// Add lastStatusChangeAt prop to SplitbuttonProps
interface SplitbuttonProps {
  anfrageId: string;
  currentStatus: string;
  onStatusChanged: () => void;
  lastStatusChangeAt?: string | null;  // NEW
}

// In terminal status render:
Storniert am {lastStatusChangeAt
  ? new Date(lastStatusChangeAt).toLocaleDateString("de-DE")
  : new Date().toLocaleDateString("de-DE")}
```

**Caller update (anfrage-detail-view.tsx line 122-126):**
```typescript
<Splitbutton
  anfrageId={String(id)}
  currentStatus={doc.status}
  onStatusChanged={handleStatusChanged}
  lastStatusChangeAt={doc.last_status_change_at}  // NEW
/>
```

**Data availability:** `last_status_change_at` is already on the Anfragen collection (field defined in anfragen.ts line 293), auto-set via beforeChange hook (line 124), available in payload-types.ts (line 626), and already fetched by the detail view (it fetches the full doc via `/api/anfragen/${id}?depth=1`). The field is already passed to AttentionBar at line 115. No API changes needed.

### Pattern 5: Dead CSS Removal

**What:** Remove unused `.link-standard-view` class from custom.scss.
**Current state:** Class defined at custom.scss lines 348-353. No component references it (grep confirms single match in SCSS only).
**Target state:** Delete lines 348-353 (the comment and the class block). Check if the preceding comment "Standard view link (top right corner)" on line 348 also needs removal.

**Lines to remove from custom.scss:**
```scss
/* Standard view link (top right corner) */
.link-standard-view {
  font-size: 12px;
  color: var(--theme-elevation-500);
  text-decoration: underline;
}
```

### Anti-Patterns to Avoid
- **Do not add new STATUS_CUSTOMER_TEXT_SHORT or similar maps.** The existing status-config.ts already has STATUS_LABELS for short labels and STATUS_CUSTOMER_TEXT for customer sentences. Use what exists.
- **Do not refactor Splitbutton beyond the date fix.** The component works correctly otherwise.
- **Do not touch the status_historie collection.** The `last_status_change_at` field on the Anfragen document is sufficient for the date display.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Local function | `@/lib/format-currency` | Already extracted in Phase 19, exact same implementation |
| Customer text lookup | New mapping function | `STATUS_CUSTOMER_TEXT[key]` | Already exists with all 20 statuses in status-config.ts |
| Hersteller status check | Local array copy | `HERSTELLER_STATUSES` from detail-view-helpers.ts | Already exists, just needs export keyword |

## Common Pitfalls

### Pitfall 1: STATUS_CUSTOMER_TEXT in Badge Context
**What goes wrong:** Using full customer sentences ("Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.") inside a small rounded-full badge makes it unreadable.
**Why it happens:** STATUS_CUSTOMER_TEXT contains full German sentences meant for banner/detail display, not for compact badges.
**How to avoid:** For the status badge pill in gast-tracking-form.tsx line 186, consider whether the full sentence or just `STATUS_LABELS[status]` is more appropriate. The success criteria says "STATUS_CUSTOMER_TEXT statt getStatusLabel() fuer Kunden-Anzeige" -- this may mean the timeline entries specifically, or the planner may need to decide on badge vs. text context.
**Warning signs:** If the badge text wraps or overflows, the full sentence is too long for that UI context.

### Pitfall 2: Forgetting Fallback on STATUS_CUSTOMER_TEXT Lookup
**What goes wrong:** `STATUS_CUSTOMER_TEXT[status as StatusKey]` returns `undefined` for unknown statuses.
**Why it happens:** TypeScript `as StatusKey` cast doesn't guarantee the value is actually a valid key.
**How to avoid:** Always use nullish coalescing: `STATUS_CUSTOMER_TEXT[status as StatusKey] ?? status`. This pattern is already used in `status-banner.tsx` and `anfrage-detail.tsx`.
**Warning signs:** Blank text where status should appear.

### Pitfall 3: Breaking Export of HERSTELLER_STATUSES
**What goes wrong:** Adding `export` to `const HERSTELLER_STATUSES` in detail-view-helpers.ts could affect the test file if tests mock or assert the module shape.
**Why it happens:** The existing `test-detail-view-helpers.test.ts` does NOT import HERSTELLER_STATUSES (only tests `shouldShowDetailsTab`).
**How to avoid:** Just add `export` keyword. No test changes needed for this specific export addition.

### Pitfall 4: Splitbutton lastStatusChangeAt Prop Optional
**What goes wrong:** Making the prop required would break existing callers or force unnecessary changes.
**Why it happens:** The prop should be optional with fallback to `new Date()`.
**How to avoid:** Use `lastStatusChangeAt?: string | null` in the interface. Fallback: `lastStatusChangeAt ? new Date(lastStatusChangeAt).toLocaleDateString("de-DE") : "unbekannt"`.

### Pitfall 5: Removing getStatusLabel Import Without Checking All Usages
**What goes wrong:** gast-tracking-form.tsx currently imports `getStatusLabel`. After switching to `STATUS_CUSTOMER_TEXT`, the `getStatusLabel` import must be removed to avoid unused import lint warnings.
**Why it happens:** Partial find-and-replace.
**How to avoid:** Check that `getStatusLabel` is not used elsewhere in the file after replacing all 4 call sites (lines 186, 219, 226, 228). Confirmed: it is NOT used elsewhere in the file.

## Code Examples

All examples are from the existing codebase (verified via grep/read).

### Existing Pattern: STATUS_CUSTOMER_TEXT Usage in Kunden Components
```typescript
// Source: src/components/kunden/status-banner.tsx
import { STATUS_CUSTOMER_TEXT, type StatusKey } from "@/lib/status-config";
let text = STATUS_CUSTOMER_TEXT[status as StatusKey] ?? "";
```

### Existing Pattern: STATUS_CUSTOMER_TEXT in Kunden Timeline
```typescript
// Source: src/components/kunden/status-timeline.tsx
import { STATUS_CUSTOMER_TEXT, type StatusKey } from "@/lib/status-config";
{STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ?? entry.zu_status}
```

### Existing Pattern: formatCurrency Import
```typescript
// Source: src/components/admin/attention-bar.tsx
import { formatCurrency } from "@/lib/format-currency";
{gesamtpreis ? formatCurrency(gesamtpreis) : "\u2014"}
```

### Existing Pattern: lastStatusChangeAt Prop Passing
```typescript
// Source: src/components/admin/anfrage-detail-view.tsx line 115
// Already passes last_status_change_at to AttentionBar -- same pattern for Splitbutton
lastStatusChangeAt={doc.last_status_change_at || null}
```

## State of the Art

No version changes or deprecated patterns. All fixes use existing project code from v1.3.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Local formatCurrency copies | Shared `@/lib/format-currency` | Phase 19 (2026-03-25) | dashboard-overview.tsx is the last holdout |
| `getStatusLabel()` for all displays | `STATUS_CUSTOMER_TEXT` for kunden, `getStatusLabel()` for admin | Phase 21 (2026-03-27) | gast-tracking-form.tsx is the last holdout |
| Inline status arrays | Centralized in detail-view-helpers.ts | Phase 19 (2026-03-25) | tab-panel.tsx still has a local copy |

## Open Questions

1. **STATUS_CUSTOMER_TEXT in badge context (gast-tracking-form.tsx line 186)**
   - What we know: STATUS_CUSTOMER_TEXT contains full sentences. The badge is a small rounded pill. Other kunden components use STATUS_CUSTOMER_TEXT in banner/detail context where space is not constrained.
   - What's unclear: Whether the success criteria intends the badge to show the full customer sentence or just the timeline entries.
   - Recommendation: For the badge (line 186), use `STATUS_LABELS[status as StatusKey]` (short human-readable labels like "Neu", "In Bearbeitung") since these are already customer-friendly German labels. For the timeline entries (lines 219, 226, 228), use `STATUS_CUSTOMER_TEXT`. However, if the success criteria is strict about all 4 sites, use STATUS_CUSTOMER_TEXT everywhere and accept the long badge text. **The planner should decide.**

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest tests/unit/test-detail-view-helpers.test.ts --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-02 | formatCurrency imported not duplicated | unit (import check) | `npx jest tests/unit/test-detail-view-helpers.test.ts --no-coverage` | Yes (tests formatCurrency import) |
| STAT-02 | HERSTELLER_STATUSES exported and importable | unit | `npx jest tests/unit/test-detail-view-helpers.test.ts --no-coverage` | Yes (tests shouldShowDetailsTab which uses it) |
| KUND-01 | gast-tracking uses customer text | grep/manual | `grep -c "STATUS_CUSTOMER_TEXT" src/components/kunden/gast-tracking-form.tsx` | N/A (static analysis) |
| STAT-02 | Splitbutton shows real date | manual | Visual verification in browser | N/A (requires running app) |
| STAT-02 | Dead CSS removed | grep/manual | `grep -c "link-standard-view" src/app/\(payload\)/custom.scss` | N/A (static analysis) |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-detail-view-helpers.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-hersteller-statuses-export.test.ts` -- verify HERSTELLER_STATUSES is exported and importable from detail-view-helpers (optional, can be covered by existing shouldShowDetailsTab tests + grep verification)

*(Existing test infrastructure covers all phase requirements. The test-detail-view-helpers.test.ts already imports from `@/lib/detail-view-helpers` and `@/lib/format-currency`. Adding `HERSTELLER_STATUSES` to its import and asserting its length would be sufficient.)*

## File Change Summary

| File | Change | Lines Affected |
|------|--------|---------------|
| `src/components/admin/dashboard-overview.tsx` | Replace local `formatCurrency` with import | Remove lines 20-25, add import |
| `src/components/kunden/gast-tracking-form.tsx` | Replace `getStatusLabel` with `STATUS_CUSTOMER_TEXT` | Lines 8, 186, 219, 226, 228 |
| `src/components/admin/splitbutton.tsx` | Add `lastStatusChangeAt` prop, use real date | Lines 13-17 (interface), line 140 |
| `src/components/admin/anfrage-detail-view.tsx` | Pass `lastStatusChangeAt` to Splitbutton | Line 122-126 |
| `src/app/(payload)/custom.scss` | Remove dead `.link-standard-view` class | Lines 348-353 |
| `src/lib/detail-view-helpers.ts` | Add `export` to `HERSTELLER_STATUSES` | Line 63 |
| `src/components/admin/tab-panel.tsx` | Import `HERSTELLER_STATUSES`, remove local copy | Lines 5, 17-27 |

**Total: 7 files, all surgical edits.**

## Sources

### Primary (HIGH confidence)
- Codebase grep/read of all 7 affected files -- exact line numbers verified
- `.planning/v1.3-MILESTONE-AUDIT.md` -- all 5 issues sourced from audit findings
- `.planning/REQUIREMENTS.md` -- STAT-02, KUND-01 requirement definitions
- `.planning/STATE.md` -- architectural decisions on admin vs. kunden styling

### Secondary (MEDIUM confidence)
- None needed -- all fixes are internal refactoring with no external dependencies

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all changes use existing code
- Architecture: HIGH -- patterns are already established in other files (status-banner.tsx, attention-bar.tsx, anfrage-detail.tsx)
- Pitfalls: HIGH -- all issues are well-scoped with clear before/after states

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- internal refactoring, no external API changes)
