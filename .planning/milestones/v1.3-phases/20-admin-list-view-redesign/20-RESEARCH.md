# Phase 20: Admin List View Redesign - Research

**Researched:** 2026-03-25
**Domain:** Payload CMS Custom List Views, Admin UI, Client-Side Data Management
**Confidence:** HIGH

## Summary

Phase 20 replaces the default Payload CMS list view for the Anfragen collection with a fully custom client component. The project uses Payload 3.79.0 on Next.js 15.4.11 with React 19.2.4. Payload provides a clean extension point at `admin.components.views.list.Component` on the collection config to swap the entire list view with a custom React component. The existing codebase already has a custom edit view (`anfrage-detail-view.tsx`) and custom `beforeListTable` components (`profile-hub-status-filter.tsx`), both of which establish patterns for this phase.

The implementation is a single "use client" component that fetches all Anfragen via `/api/anfragen?depth=0&limit=0` (or paginated), applies client-side filtering (tabs), sorting (attention-score), and search. All urgency/wartezeit/score computation reuses existing pure helpers from `detail-view-helpers.ts` and `status-config.ts`. The 3-dot menu reuses the dropdown pattern from `splitbutton.tsx` (outside-click + Escape). CSS classes extend `custom.scss` following the BEM-like convention established in Phase 19.

**Primary recommendation:** Register a custom list view component at `admin.components.views.list.Component` on the Anfragen collection config and build a single "use client" component that fetches data via the REST API, computes attention-scores client-side, and renders the tabbed/sorted/searchable table with inline 3-dot menus.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 5 Tabs: Alle / Offen / Rueckfrage / In Produktion / Abgeschlossen
- Tab-Mapping (NICHT 1:1 mit STATUS_GROUP, sondern optimiert fuer Admin-Workflow):
  - **Alle** -- kein Filter
  - **Offen** -- neu, in_bearbeitung, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, wieder_geoeffnet
  - **Rueckfrage** -- rueckfrage, hersteller_problem, zahlungsproblem (alle Status die Admin-Aktion erfordern)
  - **In Produktion** -- an_hersteller, hersteller_bestaetigt, hersteller_bestaetigt_mit_vorbehalt, in_produktion, versandbereit, geliefert
  - **Abgeschlossen** -- abgeschlossen, abgelehnt, storniert
- Jeder Tab zeigt Anzahl-Badge mit Anzahl der Anfragen (z.B. "Rueckfrage (3)")
- Tab-Zustand per URL-Parameter persistiert (?tab=rueckfrage) -- teilbar, bookmarkbar, Browser-Zurueck funktioniert
- Smart Default: Wenn Rueckfrage > 0 startet dort, sonst Offen, sonst Alle
- Spalten pro Zeile: Anfrage-Nr, Kunde (Nachname), Status-Badge, Wartezeit-Badge, Produkt-Zusammenfassung, Gesamtpreis, Letzte Aktion, Erstelldatum, 3-Dot Menu
- Wartezeit-Darstellung: farbiger linker Rand an der gesamten Zeile (4px) UND farbiger Badge in der Wartezeit-Spalte
- Wartezeit-Schwellenwerte: <1d gruen (kein Badge/Rand), 1-3d gelb, 3-7d orange, >7d rot
- Suchleiste ueber der Tabelle -- durchsucht Anfrage-Nr, Nachname, E-Mail
- Pagination mit 25 Eintraegen pro Seite, Seitenzahl in URL (?tab=offen&page=2)
- Attention-Score Formel: Wartezeit (Tage) x Status-Gewicht = Attention-Score
- Dreistufige Gewichtung: 3 (Admin muss handeln), 2 (Admin sollte pruefen), 1 (Wartet auf Externe), 0 (Terminal)
- Score sichtbar als visueller Dringlichkeits-Balken
- Client-seitige Sortierung nach Laden (Payload hat keinen computed-field Sort)
- Default-Sortierung: Attention-Score (dringendste oben)
- Klickbare Spaltenueberschriften fuer alternative Sortierung
- Zeilen-Klick navigiert direkt zur Anfrage-Detail-View
- 3-Dot Menu mit primaerer Quick-Action, Trennlinie, "Details oeffnen" Link
- Nach Quick-Action: gesamte Liste neu laden (Reload, kein Optimistic Update)
- Bei COMMENT_REQUIRED Status: Detail-View oeffnen statt Inline-Kommentar

### Claude's Discretion
- Exaktes Balken-Design fuer Attention-Score Visualisierung (Laenge, Farbe, Position)
- Pagination-Component Styling
- "Letzte Aktion" Berechnung (letzter Status-Wechsel als Text-Zusammenfassung)
- Suchleisten-Implementierung (Payload Pattern vs custom)
- 3-Dot Menu Dropdown-Implementierung (Radix Primitives)
- Produkt-Zusammenfassung Formatierung in der Zeile
- Empty-State wenn keine Anfragen im aktiven Tab

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMN-07 | Anfragen-Liste mit Filter-Tabs (Alle/Offen/Rueckfrage/In Produktion/Abgeschlossen) | Payload `admin.components.views.list.Component` replaces the entire list view. Client-side filtering via `LIST_TAB_FILTERS` constant. URL params via `useSearchParams()` from next/navigation. |
| ADMN-08 | Wartezeit-Spalte in Anfragen-Liste mit Farb-Codierung (gruen/gelb/orange/rot) | Existing `getWaitingDays()`, `getUrgencyLevel()`, `URGENCY_COLORS` from `detail-view-helpers.ts` compute everything. Row border-left + urgency badge pattern from Phase 19. |
| ADMN-09 | Attention-Score Sortierung (Wartezeit x Status-Gewicht, dringendste oben) | New `STATUS_WEIGHT` constant in `status-config.ts`. Score computed client-side per row. Proportional bar visualization with color thresholds. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | CMS framework, collection list view extension point | Project foundation, custom view API verified in types |
| @payloadcms/ui | 3.79.0 | Admin UI hooks (useDocumentInfo, useListQuery) | Required for admin component integration |
| Next.js | 15.4.11 | App Router, client/server components, navigation | Project framework |
| React | 19.2.4 | UI rendering | Project framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (installed) | Icons (MoreHorizontal for 3-dot menu, ChevronUp/Down for sort) | Already used in dashboard-overview.tsx |
| status-config.ts | local | STATUS_COLORS, STATUS_LABELS, QUICK_ACTIONS, STATUS_GROUP | All status-related rendering |
| detail-view-helpers.ts | local | getWaitingDays, getUrgencyLevel, URGENCY_COLORS, getProduktZusammenfassung, isTerminalStatus, isCompletedStatus | All urgency/wartezeit computation |
| format-currency.ts | local | formatCurrency() | Price column formatting |
| status-transitions.ts | local | COMMENT_REQUIRED | 3-dot menu redirect-to-detail behavior |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Full custom list view | Payload's beforeListTable injection | Cannot control table columns, sorting, row styling -- too limited for the requirements |
| Client-side fetch + filter | Server component with Payload Local API | Cannot do client-side tab switching, sorting, search without full page reload -- bad UX |
| Radix DropdownMenu for 3-dot | Plain div + outside-click | Plain div matches existing splitbutton pattern, no new dependency needed |
| @tanstack/react-table | Plain HTML table | Overkill for single collection with < 1000 rows, adds 15KB+ bundle |

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/admin/
    anfragen-list-view.tsx     # Main custom list view (registered in collection config)
    list-menu.tsx              # 3-dot dropdown menu component (extracted for reuse/testing)
  lib/
    status-config.ts           # Add STATUS_WEIGHT, LIST_TAB_FILTERS constants
    detail-view-helpers.ts     # Existing -- getWaitingDays, getUrgencyLevel, etc.
    format-currency.ts         # Existing -- formatCurrency()
    list-view-helpers.ts       # getAttentionScore(), getScoreColor(), getLetzeAktion(), formatRelativeTime()
  collections/business/
    anfragen.ts                # Updated: admin.components.views.list.Component added
  app/(payload)/
    custom.scss                # Extended: Phase 20 list view CSS classes
```

### Pattern 1: Custom List View Registration (Collection-Level)
**What:** Replace the default Payload list view for a single collection using the type-safe collection config.
**When to use:** When the default Payload table does not meet UX requirements (custom columns, filtering, sorting).
**Example:**
```typescript
// Source: Payload 3.79.0 types -- CollectionConfig.admin.components.views.list
// Verified in: node_modules/payload/dist/collections/config/types.d.ts line 325
export const Anfragen: CollectionConfig = {
  slug: "anfragen",
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: "@/components/admin/anfrage-detail-view#default",
          },
        },
        list: {
          Component: "@/components/admin/anfragen-list-view#default",
        },
      },
    },
  },
  // ... rest of config
};
```

### Pattern 2: Client-Side Data Fetch + Compute
**What:** Fetch all relevant Anfragen via REST API, compute derived fields (attention-score, urgency) client-side, then render.
**When to use:** When Payload's built-in sorting/filtering does not support computed fields.
**Example:**
```typescript
// Source: Established project pattern from anfrage-detail-view.tsx
"use client";

// Fetch all Anfragen (paginated by Payload, but we need all for client-side sort)
const res = await fetch(
  `/api/anfragen?depth=0&limit=0&sort=-createdAt`,
  { credentials: "include" }
);
const data = await res.json();
// data.docs contains all Anfragen with flat fields (depth=0 keeps it lightweight)

// Compute attention score per row
const enriched = data.docs.map((doc: any) => {
  const days = getWaitingDays(doc.last_status_change_at || doc.createdAt);
  const weight = STATUS_WEIGHT[doc.status as StatusKey] ?? 0;
  return { ...doc, waitingDays: days, attentionScore: days * weight };
});
```

### Pattern 3: URL-Parameter State Management
**What:** Persist tab, page, and sort state in URL search params for shareability and browser-back support.
**When to use:** When UI state should survive page reload and be shareable.
**Example:**
```typescript
// Source: Next.js 15 App Router pattern
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function useListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get("tab") || null; // smart default handled elsewhere
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "attention_score";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "page") params.delete("page"); // reset page on tab/sort change
    router.replace(`${pathname}?${params.toString()}`);
  }

  return { tab, page, sort, setParam };
}
```

### Pattern 4: Reusable Dropdown (Outside-Click + Escape)
**What:** Plain div with position:absolute + event listeners for outside-click and Escape key.
**When to use:** Simple dropdowns in admin context where Radix/Shadcn are not used.
**Example:**
```typescript
// Source: Established project pattern from splitbutton.tsx
useEffect(() => {
  if (!open) return;
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };
  document.addEventListener("mousedown", handleClick);
  document.addEventListener("keydown", handleEscape);
  return () => {
    document.removeEventListener("mousedown", handleClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, [open]);
```

### Anti-Patterns to Avoid
- **Using Payload's built-in list with hacks:** Do not try to inject custom columns/sorting into Payload's default table via beforeListTable -- it does not expose row rendering. Replace the whole view.
- **Server-side computed sort:** Payload does not support sorting by virtual/computed fields. Do not try to add a computed column to the collection config. Client-side sort is the correct approach.
- **Optimistic updates on status change:** CONTEXT.md explicitly says "gesamte Liste neu laden (Reload, kein Optimistic Update)" -- do not try to update a single row in-place after a 3-dot menu action.
- **Using Tailwind in admin:** The admin panel uses Payload theme variables and custom.scss. No Tailwind classes.
- **Using Shadcn in admin:** No Shadcn components. Use plain HTML elements styled with BEM classes and inline styles.
- **Depth > 0 for list fetch:** The list only needs flat fields (anfrage_nummer, status, kontaktdaten.nachname, gesamtpreis, createdAt, last_status_change_at, produkte). Use `depth=0` to keep response lightweight. The `kontaktdaten` group is embedded (not a relation), so it is returned at depth=0.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wartezeit calculation | Custom date diff | `getWaitingDays()` from `detail-view-helpers.ts` | Already handles null, computes floor(days), tested |
| Urgency level thresholds | Custom threshold logic | `getUrgencyLevel()` from `detail-view-helpers.ts` | Thresholds match Phase 19 design spec exactly |
| Urgency colors | Inline hex values | `URGENCY_COLORS` from `detail-view-helpers.ts` | Single source of truth, matches Phase 19 |
| Status badge rendering | Custom badge component | Pattern from `attention-bar.tsx` + `custom.scss .status-badge` | Consistent with detail view |
| Status labels/colors | Hardcoded maps | `STATUS_LABELS`, `STATUS_COLORS`, `getStatusColor()`, `getStatusLabel()` from `status-config.ts` | Single source of truth |
| Quick actions | New action map | `QUICK_ACTIONS` from `status-config.ts` | Already maps status -> action labels/targets |
| Comment-required check | Custom check | `COMMENT_REQUIRED` from `status-transitions.ts` | Validated against VALID_TRANSITIONS in tests |
| Terminal/completed detection | status === "storniert" checks | `isTerminalStatus()`, `isCompletedStatus()` from `detail-view-helpers.ts` | Centralized logic |
| Product summary | Custom grouping | `getProduktZusammenfassung()` from `detail-view-helpers.ts` | Groups by produkttyp with count |
| Currency formatting | Inline Intl.NumberFormat | `formatCurrency()` from `format-currency.ts` | Consistent de-DE EUR format |
| Status change submission | New fetch logic | Pattern from `splitbutton.tsx submitStatusChange()` | Handles stornierung, comment, error display |
| Outside-click dropdown | Radix/headless-ui | Pattern from `splitbutton.tsx` useEffect handler | Already established, tested, zero deps |

**Key insight:** Phase 19 built a comprehensive set of pure helper functions and CSS classes specifically designed for reuse in Phase 20. Nearly every computation and visual pattern has an existing, tested implementation.

## Common Pitfalls

### Pitfall 1: depth=0 vs embedded groups
**What goes wrong:** Assuming `kontaktdaten.nachname` requires `depth=1` because it looks like a relation.
**Why it happens:** Payload's depth parameter only affects actual `relationship` and `upload` fields. `kontaktdaten` is a `group` field, not a relationship.
**How to avoid:** Use `depth=0`. Group fields like `kontaktdaten` and array fields like `produkte` are always returned inline regardless of depth.
**Warning signs:** Unnecessarily large API responses if using depth=1 when relationships exist on the collection.

### Pitfall 2: limit=0 returns ALL documents
**What goes wrong:** Using `limit=0` in Payload REST API returns all documents in one response, which could be slow with thousands of Anfragen.
**Why it happens:** The client-side sort/filter approach needs all data upfront to compute attention scores and tab counts.
**How to avoid:** For the initial implementation with < 500 Anfragen, `limit=0` is acceptable. Add a comment noting that server-side pagination should be considered if the collection grows beyond ~500 docs. Alternatively, paginate server-side and accept that tab counts may only reflect the loaded page.
**Warning signs:** Page load > 2 seconds, large JSON payload > 500KB.

### Pitfall 3: URL param hydration mismatch
**What goes wrong:** Server-rendered HTML does not match client-rendered HTML because `useSearchParams()` returns null during SSR in Next.js App Router.
**Why it happens:** Search params are only available on the client in a "use client" component.
**How to avoid:** Wrap `useSearchParams()` in a Suspense boundary or handle the null case gracefully. Show a loading skeleton until params resolve.
**Warning signs:** React hydration error warnings in console.

### Pitfall 4: Event propagation on row click vs 3-dot menu
**What goes wrong:** Clicking the 3-dot menu also triggers row navigation.
**Why it happens:** The `<tr>` has an onClick handler for navigation, and the button click bubbles up.
**How to avoid:** Call `e.stopPropagation()` on the 3-dot menu button's onClick handler. The UI-SPEC already specifies this.
**Warning signs:** User clicks "Details oeffnen" in menu and gets double navigation.

### Pitfall 5: Stale attention-score after status change
**What goes wrong:** After a quick-action via 3-dot menu, the attention-score and tab counts are stale.
**Why it happens:** The score is computed from cached data, and optimistic updates were explicitly rejected.
**How to avoid:** Full re-fetch of all data after any status change (CONTEXT.md requirement: "gesamte Liste neu laden"). Call the same `loadData()` function used on initial mount.
**Warning signs:** Row stays in wrong tab after status change.

### Pitfall 6: Smart default tab conflicts with URL param
**What goes wrong:** User bookmarks `?tab=rueckfrage`, but when they visit the URL with 0 Rueckfrage items, the tab shows empty.
**Why it happens:** The URL param should override the smart default -- bookmarked URLs are intentional.
**How to avoid:** Smart default ONLY applies when there is NO `?tab=` param in the URL. If the param exists, respect it even if the tab is empty.
**Warning signs:** User always lands on "Offen" even though they bookmarked a specific tab.

### Pitfall 7: Payload importMap regeneration
**What goes wrong:** Adding a new custom component path in the collection config may require regenerating Payload's import map.
**Why it happens:** Payload 3.x uses auto-generated import maps for component resolution. New component paths need to be picked up.
**How to avoid:** After modifying the collection config, restart the dev server (`next dev`). Payload will regenerate the import map automatically.
**Warning signs:** "Component not found" errors in the admin panel.

## Code Examples

### New Constants (status-config.ts additions)
```typescript
// Source: CONTEXT.md locked decisions -- attention-score weights
export const STATUS_WEIGHT: Record<StatusKey, number> = {
  neu: 3,
  in_bearbeitung: 3,
  rueckfrage: 3,
  hersteller_problem: 3,
  zahlungsproblem: 3,
  wieder_geoeffnet: 3,
  angebot_versendet: 2,
  bestaetigt: 2,
  zahlungslink_versendet: 2,
  hersteller_bestaetigt_mit_vorbehalt: 2,
  bezahlt: 1,
  an_hersteller: 1,
  hersteller_bestaetigt: 1,
  in_produktion: 1,
  versandbereit: 1,
  geliefert: 1,
  reklamation: 1,
  abgeschlossen: 0,
  abgelehnt: 0,
  storniert: 0,
};

// Source: CONTEXT.md locked decisions -- tab filter mapping
export const LIST_TAB_FILTERS: Record<string, StatusKey[]> = {
  alle: [], // no filter
  offen: ["neu", "in_bearbeitung", "angebot_versendet", "bestaetigt", "zahlungslink_versendet", "bezahlt", "wieder_geoeffnet"],
  rueckfrage: ["rueckfrage", "hersteller_problem", "zahlungsproblem"],
  in_produktion: ["an_hersteller", "hersteller_bestaetigt", "hersteller_bestaetigt_mit_vorbehalt", "in_produktion", "versandbereit", "geliefert"],
  abgeschlossen: ["abgeschlossen", "abgelehnt", "storniert"],
};
```

### Attention-Score Computation Helper
```typescript
// Source: New helper for list-view-helpers.ts
import { getWaitingDays } from "@/lib/detail-view-helpers";
import { STATUS_WEIGHT, type StatusKey } from "@/lib/status-config";

export function getAttentionScore(
  lastStatusChangeAt: string | null,
  createdAt: string,
  status: string,
): number {
  const days = getWaitingDays(lastStatusChangeAt || createdAt);
  const weight = STATUS_WEIGHT[status as StatusKey] ?? 0;
  return days * weight;
}

export function getScoreColor(score: number): string {
  if (score <= 0) return "";
  if (score <= 5) return "#22c55e";  // green
  if (score <= 15) return "#eab308"; // yellow
  if (score <= 30) return "#f97316"; // orange
  return "#ef4444";                  // red
}
```

### Collection Config Registration
```typescript
// Source: Payload 3.79.0 -- verified in types.d.ts line 315-328
export const Anfragen: CollectionConfig = {
  slug: "anfragen",
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: "@/components/admin/anfrage-detail-view#default",
          },
        },
        list: {
          Component: "@/components/admin/anfragen-list-view#default",
        },
      },
    },
  },
  // ...
};
```

### "Letzte Aktion" Helper
```typescript
// Source: New helper for list-view-helpers.ts
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours}h`;
  if (diffDays === 1) return "vor 1 Tag";
  return `vor ${diffDays} Tagen`;
}
```

### 3-Dot Menu Quick Action with Status Change
```typescript
// Source: Pattern adapted from splitbutton.tsx submitStatusChange()
async function handleQuickAction(anfrageId: string, targetStatus: string) {
  // COMMENT_REQUIRED statuses redirect to detail view
  if (COMMENT_REQUIRED.includes(targetStatus)) {
    window.location.href = `/admin/collections/anfragen/${anfrageId}`;
    return;
  }

  try {
    const res = await fetch(`/api/anfragen/${anfrageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: targetStatus }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.errors?.[0]?.message || data.message || "Fehler beim Statuswechsel.");
      return;
    }

    // Full reload per CONTEXT.md requirement
    await loadData();
  } catch {
    alert("Netzwerkfehler -- bitte Seite neu laden.");
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload default list + beforeListTable | Full custom list view via `views.list.Component` | Payload 3.x | Complete control over columns, sorting, row rendering |
| useListQuery hook for filtering | Direct REST API fetch for full custom views | Payload 3.x | useListQuery only works within Payload's default list context |
| Inline styles only | BEM CSS classes in custom.scss + inline for dynamic values | Phase 19 | Maintainable, theme-compatible styling |

**Important note on useListQuery:** The `useListQuery` hook from `@payloadcms/ui` works within Payload's default list view context. When replacing the entire list view, this hook may NOT be available. The custom component should use direct `fetch()` calls against the REST API instead, which is the established pattern in `anfrage-detail-view.tsx`.

## Open Questions

1. **Performance at scale with limit=0**
   - What we know: Client-side sort requires all data. Current Anfragen count is low (< 100).
   - What's unclear: At what point does loading all Anfragen become too slow? 500? 1000?
   - Recommendation: Implement with limit=0 now, add a comment for future server-side pagination. Monitor load time.

2. **Payload importMap auto-regeneration reliability**
   - What we know: Adding new component paths requires import map update. Dev server restart usually handles it.
   - What's unclear: Whether hot-reload picks up new view.list.Component paths without restart.
   - Recommendation: Plan for a dev server restart after registering the new component path.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jsdom) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern="test-list" -x` |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-07 | LIST_TAB_FILTERS maps tabs to correct statuses | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 |
| ADMN-07 | Smart default tab logic selects correct tab | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 |
| ADMN-08 | Wartezeit computation reuses existing helpers | unit | `npx jest tests/unit/test-detail-view-helpers.test.ts -x` | Yes (existing) |
| ADMN-09 | getAttentionScore computes weight x days correctly | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 |
| ADMN-09 | getScoreColor returns correct color for score ranges | unit | `npx jest tests/unit/test-list-view-helpers.test.ts -x` | No -- Wave 0 |
| ADMN-09 | STATUS_WEIGHT covers all 20 StatusKeys | unit | `npx jest tests/unit/test-status-config.test.ts -x` | Yes (extend existing) |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="test-list|test-status-config" -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-list-view-helpers.test.ts` -- covers ADMN-07 (tab filters, smart default), ADMN-09 (attention score, score color)
- [ ] Extend `tests/unit/test-status-config.test.ts` -- verify STATUS_WEIGHT covers all StatusKeys, LIST_TAB_FILTERS covers all non-terminal statuses

*(Existing `test-detail-view-helpers.test.ts` already covers getWaitingDays, getUrgencyLevel for ADMN-08)*

## Sources

### Primary (HIGH confidence)
- Payload 3.79.0 TypeScript types (`node_modules/payload/dist/collections/config/types.d.ts` lines 315-328) -- verified `admin.components.views.list.Component` API
- Existing codebase: `anfrage-detail-view.tsx`, `splitbutton.tsx`, `attention-bar.tsx`, `custom.scss` -- established patterns for admin custom components
- Existing codebase: `status-config.ts`, `detail-view-helpers.ts`, `status-transitions.ts`, `format-currency.ts` -- all reusable helpers verified in source
- `20-CONTEXT.md` -- locked decisions for tab mapping, score weights, column layout
- `20-UI-SPEC.md` -- visual contract with CSS class names, column widths, interaction states

### Secondary (MEDIUM confidence)
- [Payload CMS List View docs](https://payloadcms.com/docs/custom-components/list-view) -- official documentation on custom list views
- [Payload CMS Custom Views docs](https://payloadcms.com/docs/custom-components/custom-views) -- collection-level view customization
- [Payload GitHub docs source](https://github.com/payloadcms/payload/blob/main/docs/custom-components/list-view.mdx) -- raw documentation for list view components

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used in the project, versions verified
- Architecture: HIGH - Custom list view API verified in Payload types, patterns established in Phase 19
- Pitfalls: HIGH - Based on actual project experience (Phase 19 detail view, splitbutton dropdown) and Payload 3.x behavior

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- Payload types unlikely to change for minor versions)
