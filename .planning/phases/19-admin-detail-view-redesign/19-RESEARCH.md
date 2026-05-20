# Phase 19: Admin Detail View Redesign - Research

**Researched:** 2026-03-25
**Domain:** Payload CMS Admin UI customization (custom views, CSS, inline styles, React components)
**Confidence:** HIGH

## Summary

Phase 19 redesigns the Anfrage detail view in the Payload CMS Admin Panel. All work happens within Payload's admin environment using inline styles and a new `admin-custom.css` (actually SCSS, via the existing `custom.scss` mechanism). No Tailwind, no Shadcn, no third-party UI libraries.

The codebase already has a working custom detail view (`anfrage-detail-view.tsx`, 540 lines) with a 3-column layout, inline styles, status workflow buttons, and all data loading logic. The redesign transforms this into: Attention Bar (top, full-width) + Splitbutton action zone + 2-column layout (products 60% / tab panel 40%). The existing `status-config.ts` (20 statuses, all metadata) and `status-transitions.ts` (VALID_TRANSITIONS, COMMENT_REQUIRED) provide the complete data layer. A detailed UI design contract (`19-UI-SPEC.md`) already defines every pixel-level detail.

**Primary recommendation:** Extend the existing `src/app/(payload)/custom.scss` with BEM-like structural classes. Refactor `anfrage-detail-view.tsx` into sub-components (AttentionBar, Splitbutton, ProductCard, TabPanel). Add QUICK_ACTIONS map to `status-config.ts`. Extract `formatCurrency` to a shared utility.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Splitbutton-Pattern: Primary action as large colored button left, chevron-dropdown right for secondary actions
- Primary Action = first entry in VALID_TRANSITIONS (forward action in linear flow)
- Button-Labels from a new QUICK_ACTIONS Map in status-config.ts (human-readable action texts from Todo 017), NOT from STATUS_LABELS
- Secondary actions in dropdown with status-color dot indicator
- Comment-Required: Inline panel expands below splitbutton (proven pattern from status-workflow.tsx) -- no modal
- Stornierung special rule: Additional window.confirm() BEFORE comment panel opens
- Terminal statuses (storniert, abgeschlossen without wieder_geoeffnet): Splitbutton disappears, replaced by gray info text
- Tab-Panel: 4 Tabs -- Kontakt / Timeline / Notizen / Details
- Kontakt-Tab: Name, email (mailto), phone, address, message, DSGVO-Anonymisieren-Button
- Timeline-Tab: Existing StatusTimeline component with refreshKey
- Notizen-Tab: Textarea + Save button for interne_notizen
- Details-Tab: ReadOnly display of Hersteller-Infos and Stornierung fields, each section with small "Bearbeiten" link to standard Payload view
- Details-Tab visibility: Only at relevant statuses. Hidden at early statuses (neu, in_bearbeitung, angebot_versendet)
- Default-Tab: Last active tab per sessionStorage, fallback Kontakt
- Attention Bar: Full width, top, with Anfrage-Nummer, colored Status-Badge, Wartezeit with color coding, Gesamtpreis, Produkt-Zusammenfassung
- Wartezeit: Uses last_status_change_at field. Thresholds: <1 day green, 1-3 days yellow (#eab308), 3-7 days orange (#f97316), >7 days red (#ef4444)
- Terminal statuses: No Wartezeit-Badge, show completion date instead
- Produkt-Zusammenfassung: Type breakdown ("2x Fenster, 1x Balkontuer") grouped by produkttyp
- Stueckzahl-Badge: 32x32px, bold, colored background, only shown when stueckzahl > 1
- Price display: "249,00 EUR x 2 = 498,00 EUR" as separate values. At stueckzahl === 1 only show Einzelpreis
- Product identity: Produkttyp + Material (larger font)
- Measures highlighted: font-size 15px, font-weight 600
- admin-custom.css: Central CSS file for structural admin styles, loaded via Payload Config
- BEM-like classes: .attention-bar, .splitbutton, .product-card, .tab-panel etc.
- Uses var(--theme-*) Payload CSS Variables for dark/light theme compatibility

### Claude's Discretion
- Exact Quick-Actions labels for all 20 statuses (basis: Todo 017 table, supplemented where needed)
- Tab-Panel implementation (state management, tab switching -- no animation)
- Product card spec-grid layout (color swatches only when hex code available)
- admin-custom.css class naming and structure
- Attention Bar exact layout (Flexbox vs Grid)
- Comment panel styling after Splitbutton click

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMN-01 | admin-custom.css for structural admin styles (replaces inline-style ceiling at 486+ lines) | Extend existing `src/app/(payload)/custom.scss` which is already loaded via Payload layout. All Payload CSS is in `@layer payload-default`, so custom classes outside layers auto-win specificity. BEM naming per UI-SPEC. |
| ADMN-02 | Attention Bar component (full width, Anfrage-Nr, Status-Badge, Wartezeit with color-coding, Gesamtpreis, Produkt-Zusammenfassung) | `last_status_change_at` field exists (Phase 18). STATUS_COLORS available for badge. Wartezeit thresholds locked in CONTEXT. formatCurrency already exists in detail-view. |
| ADMN-03 | Action bar with Splitbutton pattern (primary status action + dropdown for branches) | VALID_TRANSITIONS[currentStatus][0] = primary. getNextStatuses() already returns all targets. submitStatusChange() logic from status-workflow.tsx can be reused directly. COMMENT_REQUIRED check pattern exists. |
| ADMN-04 | 2-column layout with Products (60%) and Tab-Panel (40%) for Kontakt/Timeline/Notizen | Replace current 3-column grid. StatusTimeline component reusable with key={refreshKey}. sessionStorage for tab persistence (Phase 16 pattern). |
| ADMN-05 | Stueckzahl-Badge per product card (large, bold, colored) with Einzelpreis x Menge = Gesamtpreis display | Product data: stueckzahl (number, default 1), einzelpreis (number) available on each product in produkte array. |
| ADMN-06 | Anfrage-Detail-View completely rebuilt with Attention Bar + Action bar + 2-column tabs | Full rewrite of anfrage-detail-view.tsx. All data loading, notizen save, anonymize logic can be preserved. Sub-component extraction: AttentionBar, Splitbutton, ProductCard, TabPanel. |
| ADMN-10 | Context-dependent Quick-Actions per status (primary action + secondary actions based on Quick-Actions table from Todo 017) | QUICK_ACTIONS map structure defined in UI-SPEC with all 20 statuses. Each entry: { label, target }[]. First entry = primary. Dropdown outside-click + Escape to close. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | Admin panel framework | Project foundation, provides CSS variables and custom view system |
| @payloadcms/ui | 3.79.0 | Admin UI components | useDocumentInfo() hook for document ID |
| React | (bundled) | Component framework | Payload admin uses React |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | -- | -- | No new dependencies needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline styles + CSS classes | Radix Primitives for Tabs | Overkill -- simple useState tabs are sufficient, no accessibility requirements beyond keyboard for internal admin tool |
| vanilla dropdown | @floating-ui/react | Overkill for a single dropdown. Simple absolute positioning with outside-click handler is sufficient |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/(payload)/
    custom.scss          # EXTEND with admin-custom.css classes (already loaded)
  lib/
    status-config.ts     # ADD QUICK_ACTIONS export
    format-currency.ts   # EXTRACT from anfrage-detail-view.tsx (shared utility)
  components/admin/
    anfrage-detail-view.tsx   # REWRITE (main view, orchestrator)
    attention-bar.tsx         # NEW sub-component
    splitbutton.tsx           # NEW sub-component
    product-card.tsx          # NEW sub-component
    tab-panel.tsx             # NEW sub-component
    status-workflow.tsx       # KEEP (pattern reference, then DEPRECATE once splitbutton replaces it)
    status-timeline.tsx       # KEEP (reused in Timeline tab)
```

### Pattern 1: Payload Custom View Registration
**What:** Anfragen collection already registers a custom edit view
**When to use:** Already in place, no changes needed
**Example:**
```typescript
// src/collections/business/anfragen.ts (existing, line 76-83)
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: "@/components/admin/anfrage-detail-view#default",
        },
      },
    },
  },
},
```
Confidence: HIGH -- verified in current codebase.

### Pattern 2: Payload Custom SCSS Loading
**What:** Custom CSS is loaded through `src/app/(payload)/custom.scss`, imported in `src/app/(payload)/layout.tsx`
**When to use:** This is the ONLY mechanism for global admin CSS in Payload v3
**Key detail:** All Payload built-in CSS is wrapped in `@layer payload-default`. Custom CSS outside any @layer automatically has higher specificity. No need for `!important`.
**Example:**
```scss
// src/app/(payload)/custom.scss (existing file, line 10 of layout.tsx: import './custom.scss')
// Just add classes here -- they are globally available in all admin views

.attention-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 24px;
  background: var(--theme-elevation-50);
  border: 1px solid var(--theme-elevation-200);
  border-radius: 8px;
}
.attention-bar--warn { border-left: 4px solid #eab308; }
.attention-bar--urgent { border-left: 4px solid #f97316; }
.attention-bar--critical { border-left: 4px solid #ef4444; }
```
Confidence: HIGH -- verified that `custom.scss` exists and is already imported in layout.tsx.

### Pattern 3: Data Loading via useDocumentInfo + Fetch
**What:** Custom views use `useDocumentInfo()` for document ID, then fetch data client-side
**When to use:** This is the established pattern in the existing detail view
**Example:**
```typescript
// Already implemented in anfrage-detail-view.tsx (lines 17-41)
const { id } = useDocumentInfo();
const [doc, setDoc] = useState(null);
const loadDoc = useCallback(async () => {
  const res = await fetch(`/api/anfragen/${id}?depth=1`, { credentials: "include" });
  if (res.ok) { const data = await res.json(); setDoc(data); }
}, [id]);
```
Confidence: HIGH -- existing working code.

### Pattern 4: sessionStorage for UI State Persistence
**What:** Store active tab in sessionStorage with a fixed key
**When to use:** Tab panel persistence across navigations within same session
**Example:**
```typescript
const STORAGE_KEY = "anfrage-detail-tab";
const [activeTab, setActiveTab] = useState(() => {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    // Validate stored tab still exists (Details may be hidden)
    if (stored && availableTabs.includes(stored)) return stored;
  }
  return "kontakt"; // fallback
});
const switchTab = (tab: string) => {
  setActiveTab(tab);
  sessionStorage.setItem(STORAGE_KEY, tab);
};
```
Confidence: HIGH -- Phase 16 established this pattern for dropdown persistence.

### Pattern 5: Outside-Click Handler for Dropdown
**What:** Close splitbutton dropdown on click outside or Escape key
**When to use:** Splitbutton chevron dropdown
**Example:**
```typescript
useEffect(() => {
  if (!dropdownOpen) return;
  const handleClick = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") setDropdownOpen(false);
  };
  document.addEventListener("mousedown", handleClick);
  document.addEventListener("keydown", handleEscape);
  return () => {
    document.removeEventListener("mousedown", handleClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, [dropdownOpen]);
```
Confidence: HIGH -- standard React pattern.

### Anti-Patterns to Avoid
- **Using Tailwind in admin components:** Payload Admin does not load Tailwind. All admin styling must use inline styles or CSS classes from custom.scss with Payload's `var(--theme-*)` variables.
- **Using Shadcn components in admin:** No Shadcn in admin panel. Vanilla React with inline styles.
- **Creating a separate CSS file and trying to import it in payload.config.ts via `admin.css`:** This property does NOT exist in Payload v3.79.0 Config type. The only mechanism is `src/app/(payload)/custom.scss`.
- **Using `!important` for specificity:** Payload CSS is in `@layer payload-default`. Custom CSS outside layers already wins. No `!important` needed.
- **Using Unicode escapes in UI strings:** Project decision: use real UTF-8 characters (umlauts, em-dash) everywhere.
- **Placing new CSS file elsewhere:** Must extend the existing `custom.scss`, not create a separate file, because the layout.tsx import is auto-generated and should not be modified.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status metadata | Custom status color/label maps | `STATUS_COLORS`, `STATUS_LABELS` from `src/lib/status-config.ts` | Single Source of Truth, 20 statuses already defined |
| Valid transitions | Custom transition logic | `getNextStatuses()`, `isValidTransition()`, `COMMENT_REQUIRED` from `src/lib/status-transitions.ts` | Server-side validation mirrors these, must stay in sync |
| Status change API | Custom endpoint | PATCH `/api/anfragen/{id}` with `{ status, _status_kommentar }` | Payload API with beforeChange hooks handles validation, history, webhooks |
| Currency formatting | String concatenation | `Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })` | Already used in existing code, handles locale correctly |
| Date formatting | Manual formatting | `new Date().toLocaleString("de-DE", {...})` | Already used in status-timeline.tsx |
| Customer anonymization | Custom endpoint | POST `/api/admin/anonymize-customer` | Already implemented in existing view |

**Key insight:** The data layer (status config, transitions, API) is complete from Phases 17-18. Phase 19 is purely a UI restructuring -- no new backend logic needed.

## Common Pitfalls

### Pitfall 1: Modifying layout.tsx
**What goes wrong:** Attempting to modify `src/app/(payload)/layout.tsx` to add CSS imports
**Why it happens:** The file header says "THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. DO NOT MODIFY IT"
**How to avoid:** Only extend `src/app/(payload)/custom.scss`. It's already imported. The import line (`import './custom.scss'`) is part of the generated layout.
**Warning signs:** Any edit to layout.tsx will be overwritten on next Payload regeneration.

### Pitfall 2: CSS Class Naming Conflicts with Payload
**What goes wrong:** Custom class names collide with Payload's BEM classes
**Why it happens:** Payload uses generic class names internally
**How to avoid:** Prefix all custom classes with component-specific names: `.attention-bar`, `.splitbutton`, `.product-card`, `.tab-panel`, `.detail-layout`. The UI-SPEC already defines these.
**Warning signs:** Unexpected styling on Payload built-in components.

### Pitfall 3: Forgetting refreshKey After Status Change
**What goes wrong:** Data shown in Attention Bar, Timeline, or product cards becomes stale after status transition
**Why it happens:** Status change modifies server state but UI doesn't re-fetch
**How to avoid:** The existing `handleStatusChanged` callback increments `refreshKey`, which triggers `useEffect` re-fetch in the parent. The new Splitbutton component MUST call this callback on successful status change.
**Warning signs:** Status badge in Attention Bar shows old status after transition.

### Pitfall 4: Dropdown Z-Index in Payload Admin
**What goes wrong:** Splitbutton dropdown renders behind Payload's sidebar or header
**Why it happens:** Payload admin has its own z-index stack
**How to avoid:** Use z-index: 10 for the dropdown (as specified in UI-SPEC). The detail view content area is below Payload's nav (z-index ~100), so 10 is sufficient for the dropdown within the content.
**Warning signs:** Dropdown is clipped or hidden behind other elements.

### Pitfall 5: SCSS vs CSS File Format
**What goes wrong:** Creating `admin-custom.css` as a plain CSS file and trying to import it
**Why it happens:** The CONTEXT.md mentions "admin-custom.css" but the Payload mechanism uses SCSS
**How to avoid:** Add all custom classes directly to the existing `src/app/(payload)/custom.scss`. The classes in the UI-SPEC use only standard CSS (no SCSS features needed), so they work fine in a .scss file. Alternatively, use `@import` within custom.scss to pull in a separate file.
**Warning signs:** CSS not loading, 404 errors.

### Pitfall 6: Stornierung Confirm Before Comment Panel
**What goes wrong:** Showing comment panel first, then confirming stornierung
**Why it happens:** Natural flow would be: click action -> show form -> submit. But stornierung needs an early exit via window.confirm().
**How to avoid:** When target is "storniert": first call window.confirm("Stornierung ist endgueltig. Fortfahren?"). Only if confirmed, THEN show the stornierung fields panel. If cancelled, do nothing.
**Warning signs:** User can start filling stornierung_grund before confirming they want to proceed.

### Pitfall 7: Details Tab Visibility Race Condition
**What goes wrong:** Details tab visible when it shouldn't be, or stored tab is "details" but tab no longer exists
**Why it happens:** sessionStorage stores "details" as active tab, but after status changes the Details tab may become hidden
**How to avoid:** On mount and after each doc refresh, compute available tabs based on current status. If stored tab is not in available tabs, fallback to "kontakt".
**Warning signs:** Empty tab content area, or tab bar shows "Details" at status "neu".

## Code Examples

### QUICK_ACTIONS Map (to add to status-config.ts)
```typescript
// Source: 19-UI-SPEC.md Quick-Actions Map + Todo 017
export const QUICK_ACTIONS: Record<StatusKey, { label: string; target: StatusKey }[]> = {
  neu: [{ label: "Anfrage annehmen", target: "in_bearbeitung" }],
  in_bearbeitung: [
    { label: "Angebot erstellen", target: "angebot_versendet" },
    { label: "Rueckfrage senden", target: "rueckfrage" },
    { label: "Anfrage ablehnen", target: "abgelehnt" },
  ],
  angebot_versendet: [
    { label: "Kunde hat bestaetigt", target: "bestaetigt" },
    { label: "Rueckfrage senden", target: "rueckfrage" },
  ],
  bestaetigt: [{ label: "Zahlungslink senden", target: "zahlungslink_versendet" }],
  zahlungslink_versendet: [{ label: "Zahlung eingegangen", target: "bezahlt" }],
  bezahlt: [
    { label: "An Hersteller weiterleiten", target: "an_hersteller" },
    { label: "Anfrage stornieren", target: "storniert" },
    { label: "Zahlungsproblem melden", target: "zahlungsproblem" },
  ],
  an_hersteller: [
    { label: "Hersteller hat bestaetigt", target: "hersteller_bestaetigt" },
    { label: "Bestaetigt mit Vorbehalt", target: "hersteller_bestaetigt_mit_vorbehalt" },
    { label: "Hersteller-Problem melden", target: "hersteller_problem" },
  ],
  hersteller_bestaetigt: [{ label: "Produktion starten", target: "in_produktion" }],
  hersteller_bestaetigt_mit_vorbehalt: [
    { label: "Produktion starten", target: "in_produktion" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  in_produktion: [{ label: "Versandbereit markieren", target: "versandbereit" }],
  versandbereit: [{ label: "Als geliefert markieren", target: "geliefert" }],
  geliefert: [
    { label: "Anfrage abschliessen", target: "abgeschlossen" },
    { label: "Reklamation melden", target: "reklamation" },
  ],
  abgeschlossen: [{ label: "Wieder oeffnen", target: "wieder_geoeffnet" }],
  rueckfrage: [{ label: "Zurueck zur Bearbeitung", target: "in_bearbeitung" }],
  abgelehnt: [{ label: "Erneut eroeffnen", target: "neu" }],
  wieder_geoeffnet: [{ label: "Zurueck zur Bearbeitung", target: "in_bearbeitung" }],
  hersteller_problem: [
    { label: "Zurueck zur Bearbeitung", target: "in_bearbeitung" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  zahlungsproblem: [
    { label: "Zahlung erhalten", target: "bezahlt" },
    { label: "Anfrage stornieren", target: "storniert" },
  ],
  reklamation: [
    { label: "Zurueck zur Bearbeitung", target: "in_bearbeitung" },
    { label: "Anfrage abschliessen", target: "abgeschlossen" },
  ],
  storniert: [], // Terminal -- no actions
};
```

### Wartezeit Computation Helper
```typescript
// Source: 19-CONTEXT.md Wartezeit decisions + 19-UI-SPEC.md
type UrgencyLevel = "normal" | "warn" | "urgent" | "critical";

function getWaitingDays(lastStatusChangeAt: string | null): number {
  if (!lastStatusChangeAt) return 0;
  return Math.floor((Date.now() - new Date(lastStatusChangeAt).getTime()) / 86_400_000);
}

function getUrgencyLevel(days: number): UrgencyLevel {
  if (days < 1) return "normal";
  if (days < 3) return "warn";
  if (days < 7) return "urgent";
  return "critical";
}

// CONTEXT specifies thresholds: <1=green, 1-3=yellow, 3-7=orange, >7=red
const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  normal: "", // no border
  warn: "#eab308",
  urgent: "#f97316",
  critical: "#ef4444",
};
```

### Produkt-Zusammenfassung Computation
```typescript
// Source: 19-CONTEXT.md Attention Bar decisions
function getProduktZusammenfassung(produkte: any[]): string {
  const grouped: Record<string, number> = {};
  for (const p of produkte) {
    const typ = p.produkttyp || "Produkt";
    grouped[typ] = (grouped[typ] || 0) + (p.stueckzahl || 1);
  }
  return Object.entries(grouped)
    .map(([typ, count]) => `${count}x ${typ}`)
    .join(", ");
}
```

### Terminal Status Detection
```typescript
// Source: 19-CONTEXT.md Terminal status decisions + status-transitions.ts
const TERMINAL_STATUSES = ["storniert"]; // storniert has no transitions
const COMPLETED_STATUS = "abgeschlossen"; // has wieder_geoeffnet as only transition

function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status);
}

function isCompleted(status: string): boolean {
  return status === COMPLETED_STATUS;
}
```

### Details Tab Visibility Logic
```typescript
// Source: 19-CONTEXT.md Details-Tab decisions
const HERSTELLER_STATUSES = [
  "bezahlt", "an_hersteller", "hersteller_bestaetigt",
  "hersteller_bestaetigt_mit_vorbehalt", "in_produktion",
  "hersteller_problem", "versandbereit", "geliefert", "abgeschlossen",
];

function shouldShowDetailsTab(status: string): boolean {
  return HERSTELLER_STATUSES.includes(status) || status === "storniert";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline styles only (`style={{...}}`) | Inline styles + admin-custom.css classes | Phase 19 | Reduces repetitive inline styles, enables theme-aware structural classes |
| 3-column layout (timeline/products/contact) | 2-column layout (products/tab-panel) + Attention Bar | Phase 19 | Better information hierarchy, action-before-information pattern |
| Flat status buttons (all equal) | Splitbutton (primary + dropdown) | Phase 19 | Scales to 20 statuses, clear primary action |
| STATUS_LABELS on buttons | QUICK_ACTIONS with human-readable action verbs | Phase 19 | "Angebot erstellen" instead of "Angebot versendet" |
| `x${stueckzahl}` appended to price | Dedicated quantity badge + separate price math | Phase 19 | Visual prominence, scannable at a glance |

**Deprecated/outdated:**
- `StatusWorkflow` component (`status-workflow.tsx`): Will be functionally replaced by the new Splitbutton component. The submitStatusChange() logic should be extracted/reused, but the flat-button rendering is obsolete.

## Open Questions

1. **SCSS @import for separate admin-custom file**
   - What we know: `custom.scss` is the entry point. We can either add classes directly there or use `@import` to pull in a separate file
   - What's unclear: Whether splitting into `custom.scss` (existing) + a separate `_admin-detail.scss` partial is worth the complexity
   - Recommendation: Add all new classes directly to `custom.scss` for simplicity. The file is small (12 lines currently). Even with all Phase 19 classes it will stay under 150 lines.

2. **formatCurrency extraction**
   - What we know: `formatCurrency()` is defined as a local function in `anfrage-detail-view.tsx` (line 9-14). It's needed in multiple new sub-components (AttentionBar, ProductCard).
   - What's unclear: Whether other components also use it
   - Recommendation: Extract to `src/lib/format-currency.ts` as a shared utility. Simple one-liner, no risk.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 with ts-jest |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern="test-name" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-01 | admin-custom.css classes defined in custom.scss | manual-only | Visual inspection in browser | N/A |
| ADMN-02 | Attention Bar: wartezeit computation, urgency levels, produkt-zusammenfassung | unit | `npx jest --testPathPattern="test-attention-bar" --no-coverage` | Wave 0 |
| ADMN-03 | Splitbutton: QUICK_ACTIONS mapping, primary/secondary split, terminal detection | unit | `npx jest --testPathPattern="test-splitbutton" --no-coverage` | Wave 0 |
| ADMN-04 | 2-column layout rendering | manual-only | Visual inspection in browser | N/A |
| ADMN-05 | Quantity badge visibility (>1 only), price math (einzelpreis x stueckzahl) | unit | `npx jest --testPathPattern="test-product-card" --no-coverage` | Wave 0 |
| ADMN-06 | Full detail view integration | manual-only | Visual inspection + click-through in browser | N/A |
| ADMN-10 | QUICK_ACTIONS completeness (all 20 statuses covered, targets match VALID_TRANSITIONS) | unit | `npx jest --testPathPattern="test-quick-actions" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="RELEVANT_TEST" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-quick-actions.test.ts` -- covers ADMN-10: validates QUICK_ACTIONS completeness, all targets in VALID_TRANSITIONS, label format (real umlauts)
- [ ] `tests/unit/test-attention-bar.test.ts` -- covers ADMN-02: getWaitingDays(), getUrgencyLevel(), getProduktZusammenfassung() pure functions
- [ ] `tests/unit/test-product-card.test.ts` -- covers ADMN-05: quantity badge visibility logic, price math (einzelpreis * stueckzahl)

## Sources

### Primary (HIGH confidence)
- `src/app/(payload)/custom.scss` -- existing custom CSS file, 12 lines, already imported in layout.tsx
- `src/app/(payload)/layout.tsx` -- auto-generated, imports `./custom.scss` at line 10
- `node_modules/@payloadcms/ui/dist/scss/colors.scss` -- Payload theme CSS variables (`--theme-elevation-*`, `--theme-bg`, `--theme-text`, `--theme-input-bg`)
- `node_modules/@payloadcms/ui/dist/scss/app.scss` -- `@layer payload-default` wrapping, `--gutter-h` variable
- `src/components/admin/anfrage-detail-view.tsx` -- existing 540-line detail view to be rewritten
- `src/components/admin/status-workflow.tsx` -- existing 218-line workflow with submitStatusChange() and comment-required pattern
- `src/components/admin/status-timeline.tsx` -- existing 194-line timeline component (reuse in tab)
- `src/lib/status-config.ts` -- all 20 statuses, STATUS_COLORS, STATUS_LABELS, helpers
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS, COMMENT_REQUIRED, getNextStatuses()
- `src/collections/business/anfragen.ts` -- collection fields including last_status_change_at, hersteller fields, stornierung fields, produkte array
- `.planning/phases/19-admin-detail-view-redesign/19-UI-SPEC.md` -- complete pixel-level UI design contract
- `.planning/phases/19-admin-detail-view-redesign/19-CONTEXT.md` -- all locked decisions

### Secondary (MEDIUM confidence)
- [Customizing CSS & SCSS | Payload Docs](https://payloadcms.com/docs/admin/customizing-css) -- confirms custom.scss mechanism and @layer specificity
- [How to Customize the Look and Feel of Payload with CSS](https://payloadcms.com/posts/blog/how-to-customize-the-look-and-feel-of-payload-with-css) -- confirms BEM naming convention approach

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all libraries already in use
- Architecture: HIGH -- extending existing patterns (custom view, inline styles + CSS classes, fetch-based data loading)
- Pitfalls: HIGH -- based on verified codebase analysis (layout.tsx auto-generation, @layer specificity, refreshKey pattern)
- CSS mechanism: HIGH -- verified by reading actual Payload source files and existing custom.scss

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- Payload v3 CSS mechanism unlikely to change in patch releases)
