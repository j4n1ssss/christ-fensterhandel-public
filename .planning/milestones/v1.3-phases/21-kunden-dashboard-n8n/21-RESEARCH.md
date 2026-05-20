# Phase 21: Kunden-Dashboard + N8N - Research

**Researched:** 2026-03-26
**Domain:** React Server/Client Components, Tailwind CSS Stepper UI, N8N Webhook Integration, Status Mapping
**Confidence:** HIGH

## Summary

Phase 21 upgrades the existing Kunden-Dashboard with a 5-phase progress stepper, customer-facing status texts, special-status banners, and verifies that the N8N webhook correctly includes `customer_facing`, `kunden_text`, and `kunden_phase` fields for email trigger filtering.

The foundation is exceptionally solid. All 20 status-to-customer-text mappings (`STATUS_CUSTOMER_TEXT`), all 20 phase mappings (`STATUS_CUSTOMER_PHASE`), the `CustomerPhase` type, and the `isCustomerFacing()` helper already exist in `src/lib/status-config.ts`. The webhook payload interface already includes `customer_facing`, `kunden_text`, `kunden_phase`. The afterChange hook in `anfragen.ts` already fires webhooks on every status change with correct field population. The implementation is primarily UI assembly and text replacement -- no new data models, no new APIs, no new hooks.

**Primary recommendation:** Build the ProgressStepper and StatusBanner as pure presentational components consuming existing data from `status-config.ts`, then surgically modify the three existing kunden components (anfrage-detail, anfragen-liste, status-timeline) to use customer-facing text and the new stepper.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fortschrittsbalken-Design: Punkte + Linie (klassisches Stepper-Pattern), 5 Kreise verbunden durch horizontale Linie
- Erledigte Schritte: gefuellter Kreis (emerald-500) + gruene Linie
- Aktueller Schritt: groesserer Kreis + subtile Puls-Animation (Tailwind keyframe)
- Kommende Schritte: leerer Kreis (gray-300) + graue Linie
- Labels unter jedem Punkt: Anfrage, Angebot, Zahlung, Produktion, Lieferung
- Farbschema: Gruen-Progression (emerald-500 erledigt, primary aktiv, gray-300 kommend)
- Zwei Varianten: Voll (Detail-View) mit Labels, Mini (Anfragen-Liste) nur Punkte
- Dashboard-Umbau: bestehendes Layout (2-Spalten Timeline + Produkte) beibehalten
- Fortschrittsbalken oben einfuegen (direkt unter Header, vor den Karten)
- Kunden-Text aus STATUS_CUSTOMER_TEXT als Hinweis-Satz unter dem Fortschrittsbalken
- Status-Timeline zeigt Kunden-Texte statt interner Labels
- Anfragen-Liste: Mini-Fortschrittsbalken STATT StatusBadge (StatusBadge entfaellt)
- Stripe-Zahlungsbutton bleibt bei Status bestaetigt
- Endstatus (storniert/abgelehnt): Roter Hinweis-Banner STATT Fortschrittsbalken
- Sonderstatus-Banner: rueckfrage (orange-50), hersteller_problem (orange-50), zahlungsproblem (red-50), reklamation (orange-50), storniert (red-50), abgelehnt (red-50)
- Kein CTA-Button in Bannern (Kunden-Antwort ist v2)
- Kunden-Text kommt direkt aus STATUS_CUSTOMER_TEXT -- kein Hardcoding
- N8N Webhook feuert bei JEDEM Status-Wechsel (nicht nur bei customer_facing: true)
- N8N filtert anhand customer_facing Flag
- Bestehende event_types reichen (status_aenderung) -- keine neuen Types
- N8N-Workflow-Dokumentation als Markdown mitliefern

### Claude's Discretion
- Exakte Tailwind-Klassen und Spacing fuer Fortschrittsbalken
- Puls-Animation Keyframe-Definition
- Breakpoint-Verhalten des Fortschrittsbalken auf Mobile
- Mini-Fortschrittsbalken Groesse und Spacing in der Anfragen-Liste
- N8N-Workflow-Doku Detailtiefe und Struktur
- Banner-Component API (Props, Varianten-Handling)

### Deferred Ideas (OUT OF SCOPE)
- Kunden-Antwort auf Rueckfrage (CTA-Button, Formular) -- v2/SELF-01
- Kunden-Stornierung einreichen -- v2/SELF-01
- Kunden-Reklamation mit Fotos einreichen -- v2/SELF-02
- N8N E-Mail-Templates als eigene CMS-Collection -- v2/AUTO-02
- Gast-Tracking (Anfrage-Status ohne Login) -- v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-05 | Admin-Status zu Kunden-Text Mapping mit 5-Phasen-Modell | STATUS_CUSTOMER_TEXT and STATUS_CUSTOMER_PHASE already exist in status-config.ts with all 20 mappings. Implementation is replacing getStatusLabel() calls with STATUS_CUSTOMER_TEXT lookups in kunden components. |
| KUND-01 | Kunden sehen vereinfachte Status-Texte statt interner Admin-Statuse | StatusTimeline uses getStatusLabel() (internal labels) -- must be replaced with STATUS_CUSTOMER_TEXT. StatusBadge in list must be replaced with ProgressStepperMini. AnfrageDetail header StatusBadge replaced with ProgressStepper. |
| KUND-02 | 5-Phasen Fortschrittsbalken (Anfrage -> Angebot -> Zahlung -> Produktion -> Lieferung) | New ProgressStepper component consuming STATUS_CUSTOMER_PHASE. Full variant for detail view, mini variant for list cards. Terminal statuses (null phase) show StatusBanner instead. |
| N8N-01 | E-Mail-Trigger bei 10+ kundenrelevanten Status-Aenderungen | afterChange hook already fires webhook on EVERY status change with customer_facing, kunden_text, kunden_phase correctly populated. EMAIL_TRIGGER_STATUSES has 14 entries. Verification needed that all fields are correct. N8N workflow documentation as Markdown deliverable. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | 15.x | Framework with Server/Client Components | Project foundation |
| Tailwind CSS | 4.x | Utility-first styling | Project standard, @theme config in globals.css |
| React | 19.x | UI rendering | Project foundation |
| lucide-react | installed | Icon library | Already used in all kunden components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| status-config.ts | local | All status metadata (20 statuses) | SOURCE OF TRUTH for all status data |
| n8n-webhook.ts | local | Webhook sender | Already wired into afterChange hook |
| format-currency.ts | local | EUR formatting | Already extracted (Phase 19) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom stepper | Shadcn Stepper | Shadcn has no built-in stepper component. Custom is the only option. |
| Tailwind animation | Framer Motion | Overkill for a single pulse animation. Tailwind keyframe is sufficient and zero-dependency. |

**Installation:**
```bash
# No new dependencies needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/kunden/
    progress-stepper.tsx      # NEW: ProgressStepper + ProgressStepperMini (client component)
    status-banner.tsx          # NEW: StatusBanner (server component, pure render)
    anfrage-detail.tsx         # MODIFY: add stepper, banner, customer texts
    anfragen-liste.tsx         # MODIFY: replace StatusBadge with mini stepper
    status-timeline.tsx        # MODIFY: customer text instead of internal labels
  app/globals.css              # MODIFY: add pulse-slow animation keyframe
docs/
  research/
    XXX_n8n-workflow-doku.md   # NEW: N8N workflow documentation
```

### Pattern 1: Server Components for Pages, Client Components for Interactive Elements
**What:** Dashboard pages are Server Components (auth check, data fetch). Interactive UI elements like the stepper with animation are Client Components.
**When to use:** Always -- this is the established project pattern.
**Example:**
```typescript
// Page (Server Component) -- src/app/(frontend)/kunden/dashboard/[id]/page.tsx
// Already fetches anfrage + statusHistorie, passes to components

// ProgressStepper (Client Component) -- needs "use client" for animation
"use client"
import { STATUS_CUSTOMER_PHASE, type CustomerPhase } from "@/lib/status-config"

// StatusBanner (Server Component) -- pure render, no interactivity
import { STATUS_CUSTOMER_TEXT } from "@/lib/status-config"
```

### Pattern 2: Status Data Always From status-config.ts
**What:** Every status-related display (text, color, phase, banner variant) derives from the centralized config maps.
**When to use:** Any time a status value needs to be displayed to the customer.
**Example:**
```typescript
// CORRECT: Derive from config
const customerText = STATUS_CUSTOMER_TEXT[status as StatusKey] ?? ""
const customerPhase = STATUS_CUSTOMER_PHASE[status as StatusKey]

// WRONG: Hardcode customer-facing text
const text = status === "neu" ? "Anfrage eingegangen" : "..."
```

### Pattern 3: Existing Fallback Pattern
**What:** All status lookups use `as StatusKey` cast with `?? fallback` for unknown statuses.
**When to use:** Every status-config lookup.
**Example:**
```typescript
// Established pattern from existing code:
const colors = STATUS_TAILWIND[status as keyof typeof STATUS_TAILWIND] || STATUS_TAILWIND.neu
```

### Anti-Patterns to Avoid
- **Exposing internal status keys to customers:** Never render raw status keys (e.g., "in_bearbeitung") in the kunden UI. Always use STATUS_CUSTOMER_TEXT.
- **Hardcoding customer text in components:** All text comes from STATUS_CUSTOMER_TEXT. The StatusBanner must NOT contain hardcoded strings.
- **Adding new dependencies for the stepper:** The stepper is simple dots + lines -- pure Tailwind, no library needed.
- **Making StatusBanner a client component:** It has no interactive state; it should be a server component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status-to-phase mapping | Custom phase logic | STATUS_CUSTOMER_PHASE[status] | Already covers all 20 statuses including edge cases |
| Customer-facing text | Hardcoded text per status | STATUS_CUSTOMER_TEXT[status] | Single source of truth, already has warm Siezen tone |
| customer_facing check | Manual list of statuses | isCustomerFacing(status) | Helper already exists, backed by EMAIL_TRIGGER_STATUSES |
| Currency formatting | Inline Intl.NumberFormat | formatCurrency() from format-currency.ts | Already extracted in Phase 19, used by admin + kunden |

**Key insight:** The data layer for this phase is 100% complete. STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, CustomerPhase type, isCustomerFacing(), EMAIL_TRIGGER_STATUSES -- all already exist. The work is purely UI assembly.

## Common Pitfalls

### Pitfall 1: Leaking Internal Status Keys to Customer View
**What goes wrong:** Using `getStatusLabel()` instead of `STATUS_CUSTOMER_TEXT` in the kunden timeline shows internal German labels like "In Bearbeitung" instead of customer-friendly "Ihre Anfrage wird gerade von unserem Team bearbeitet."
**Why it happens:** `getStatusLabel()` returns `STATUS_LABELS` which are admin-facing. Easy to miss because both are German.
**How to avoid:** Search-and-replace all `getStatusLabel()` calls in `src/components/kunden/` with `STATUS_CUSTOMER_TEXT` lookups.
**Warning signs:** Any StatusKey string visible in rendered Kunden HTML.

### Pitfall 2: Forgetting Terminal Status Null-Phase Handling
**What goes wrong:** ProgressStepper crashes or renders incorrectly when `STATUS_CUSTOMER_PHASE[status]` returns `null` (storniert, abgelehnt).
**Why it happens:** The stepper assumes a non-null CustomerPhase to determine which dot is active.
**How to avoid:** Check for `currentPhase === null` BEFORE rendering the stepper. Render StatusBanner instead for terminal statuses.
**Warning signs:** Stepper renders with no active dot, or throws on `.indexOf(null)`.

### Pitfall 3: Rueckfrage Banner Hardcoded Instead of Dynamic
**What goes wrong:** The existing anfrage-detail.tsx has a hardcoded rueckfrage block (lines 67-76) that duplicates text. This must be replaced by the generic StatusBanner component.
**Why it happens:** It was built before the banner pattern was established.
**How to avoid:** Remove the hardcoded rueckfrage block and let StatusBanner handle all special statuses uniformly.
**Warning signs:** Two different rueckfrage messages showing (old hardcoded + new banner).

### Pitfall 4: StatusBadge Import Still Used After Removal
**What goes wrong:** `StatusBadge` import left in anfragen-liste.tsx after replacing with ProgressStepperMini causes unused import lint errors.
**Why it happens:** Only the JSX was changed but not the import statement.
**How to avoid:** Remove the `StatusBadge` import from anfragen-liste.tsx. Keep it in status-timeline.tsx only if still used there (it will not be -- timeline uses inline badges).
**Warning signs:** TypeScript/lint warnings about unused imports.

### Pitfall 5: Duplicate formatPrice/formatDate Functions
**What goes wrong:** anfrage-detail.tsx and anfragen-liste.tsx both define their own `formatPrice()` and `formatDate()` locally. Adding more components compounds the duplication.
**Why it happens:** These were written before `formatCurrency()` was extracted.
**How to avoid:** For this phase, the existing local functions are acceptable (refactoring is not in scope). But new components should import `formatCurrency()` from `src/lib/format-currency.ts`.
**Warning signs:** N/A -- not blocking, just tech debt.

### Pitfall 6: animate-pulse-slow Not Added to globals.css
**What goes wrong:** The active step shows no pulse animation because the CSS keyframe was never defined.
**Why it happens:** Tailwind 4 uses `@theme` directive; custom keyframes need to be added via `@layer utilities` or `@keyframes` block.
**How to avoid:** Add the `pulse-slow` keyframe to `src/app/globals.css` alongside the existing `@layer base` block.
**Warning signs:** Active dot appears static instead of subtly pulsing.

### Pitfall 7: StatusTimeline "von -> zu" Pattern With Customer Text
**What goes wrong:** The timeline currently shows `getStatusLabel(entry.von_status) -> getStatusLabel(entry.zu_status)` which is fine for admin labels but too verbose with full customer sentences.
**Why it happens:** STATUS_CUSTOMER_TEXT entries are full sentences ("Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.") -- showing two sentences separated by an arrow is awkward.
**How to avoid:** For the timeline transition description, use a shortened form. The badge shows `STATUS_CUSTOMER_TEXT[zu_status]` as the primary label. The "von -> zu" description line can either be removed or simplified to show just the phase transition like "Anfrage -> Angebot".
**Warning signs:** Very long timeline entries with two full sentences joined by " -> ".

## Code Examples

### ProgressStepper Component Structure
```typescript
// Source: Derived from UI-SPEC.md and status-config.ts types
"use client"

import { type CustomerPhase } from "@/lib/status-config"

const PHASES: CustomerPhase[] = ["Anfrage", "Angebot", "Zahlung", "Produktion", "Lieferung"]

interface ProgressStepperProps {
  currentPhase: CustomerPhase | null
  mini?: boolean
}

export function ProgressStepper({ currentPhase, mini = false }: ProgressStepperProps) {
  if (currentPhase === null) return null  // Terminal status -- caller shows banner instead

  const currentIndex = PHASES.indexOf(currentPhase)

  // For each phase, determine: completed (index < currentIndex), active (index === currentIndex), upcoming (index > currentIndex)
  // Render dots + lines + labels (full) or dots only (mini)
}

export function ProgressStepperMini({ currentPhase }: { currentPhase: CustomerPhase | null }) {
  return <ProgressStepper currentPhase={currentPhase} mini />
}
```

### StatusBanner Component Structure
```typescript
// Source: Derived from CONTEXT.md decisions
import { STATUS_CUSTOMER_TEXT } from "@/lib/status-config"

const TERMINAL_STATUSES = ["storniert", "abgelehnt"]
const WARNING_STATUSES = ["rueckfrage", "hersteller_problem", "reklamation"]
const ERROR_STATUSES = ["zahlungsproblem"]

// Banner variants: "error" (red-50) or "warning" (orange-50)
// storniert/abgelehnt/zahlungsproblem -> error
// rueckfrage/hersteller_problem/reklamation -> warning

export function StatusBanner({ status }: { status: string }) {
  const isTerminal = TERMINAL_STATUSES.includes(status)
  const isWarning = WARNING_STATUSES.includes(status)
  const isError = ERROR_STATUSES.includes(status) || isTerminal

  if (!isTerminal && !isWarning && !isError) return null

  const variant = isError ? "error" : "warning"
  const text = STATUS_CUSTOMER_TEXT[status as keyof typeof STATUS_CUSTOMER_TEXT] ?? ""

  // Render colored banner with text
}
```

### Timeline Customer Text Replacement
```typescript
// BEFORE (current code in status-timeline.tsx):
<span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
  {getStatusLabel(entry.zu_status)}
</span>

// AFTER:
<span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
  {STATUS_CUSTOMER_TEXT[entry.zu_status as keyof typeof STATUS_CUSTOMER_TEXT] ?? entry.zu_status}
</span>
```

### Detail View Integration
```typescript
// In anfrage-detail.tsx, the rendering order:
// 1. Header (Anfrage-Nr + Datum) -- KEEP
// 2. StatusBanner (conditional) -- NEW
// 3. ProgressStepper (conditional, hidden for terminal) -- NEW
// 4. Customer text hint -- NEW
// 5. Stripe PayButton (at bestaetigt) -- KEEP
// 6. 2-column grid (Timeline + Produkte) -- KEEP

const phase = STATUS_CUSTOMER_PHASE[anfrage.status as StatusKey]
const customerText = STATUS_CUSTOMER_TEXT[anfrage.status as StatusKey]

// Remove: <StatusBadge status={anfrage.status || 'neu'} /> from header
// Remove: hardcoded rueckfrage block (lines 67-76)
// Add: <StatusBanner status={anfrage.status} /> (handles all special statuses)
// Add: {phase !== null && <ProgressStepper currentPhase={phase} />}
// Add: <p className="text-sm text-muted-foreground">{customerText}</p>
```

### Pulse Animation CSS
```css
/* Add to src/app/globals.css */
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@layer utilities {
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getStatusLabel() in kunden views | STATUS_CUSTOMER_TEXT for customer views | Phase 17 (data ready), Phase 21 (UI wiring) | No internal status keys visible to customers |
| StatusBadge in list cards | ProgressStepperMini | Phase 21 | Visual progress indicator instead of text badge |
| Hardcoded rueckfrage banner | Generic StatusBanner component | Phase 21 | All 6 special statuses handled uniformly |

**Deprecated/outdated:**
- `StatusBadge` in `anfragen-liste.tsx`: Replaced by `ProgressStepperMini` in Phase 21. The `StatusBadge` component itself remains in `status-timeline.tsx` for potential future use but is no longer imported by the list.

## Open Questions

1. **Timeline "von -> zu" display with customer text**
   - What we know: Current timeline shows `getStatusLabel(von_status) -> getStatusLabel(zu_status)` which works for short admin labels.
   - What's unclear: With full customer sentences (40+ chars each), the "von -> zu" line becomes very long and awkward.
   - Recommendation: Remove the "von -> zu" description line entirely from the kunden timeline. The badge with STATUS_CUSTOMER_TEXT[zu_status] is sufficient context. Alternatively, show phase names instead: "Anfrage -> Angebot".

2. **Mini stepper for terminal statuses in list**
   - What we know: UI-SPEC says "Show a compact text label instead" for storniert/abgelehnt where currentPhase is null.
   - What's unclear: Exact styling of the fallback text label.
   - Recommendation: Use `<span className="text-xs font-semibold text-red-700">STATUS_CUSTOMER_TEXT[status]</span>` but truncated -- or just show "Storniert"/"Abgelehnt" as short label since the full customer text is too long for inline display.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2 + ts-jest + @testing-library/react |
| Config file | jest.config.ts |
| Quick run command | `npx jest --testPathPattern="tests/unit/test-progress-stepper" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-05 | STATUS_CUSTOMER_TEXT has all 20 entries with correct mapping | unit | `npx jest tests/unit/test-status-config.test.ts -x --no-coverage` | Yes (existing) |
| STAT-05 | STATUS_CUSTOMER_PHASE maps all 20 statuses to correct phase or null | unit | `npx jest tests/unit/test-status-config.test.ts -x --no-coverage` | Yes (existing) |
| KUND-01 | StatusTimeline renders customer text instead of internal labels | unit | `npx jest tests/unit/test-kunden-timeline.test.tsx -x --no-coverage` | No -- Wave 0 |
| KUND-02 | ProgressStepper renders correct dots/lines for each phase | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | No -- Wave 0 |
| KUND-02 | ProgressStepper returns null when currentPhase is null | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | No -- Wave 0 |
| KUND-02 | ProgressStepperMini renders 5 dots with correct states | unit | `npx jest tests/unit/test-progress-stepper.test.tsx -x --no-coverage` | No -- Wave 0 |
| KUND-02 | StatusBanner renders correct variant for each special status | unit | `npx jest tests/unit/test-status-banner.test.tsx -x --no-coverage` | No -- Wave 0 |
| KUND-02 | StatusBanner returns null for non-special statuses | unit | `npx jest tests/unit/test-status-banner.test.tsx -x --no-coverage` | No -- Wave 0 |
| N8N-01 | afterChange hook sends webhook with customer_facing=true for customer-facing statuses | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x --no-coverage` | Yes (existing, covers payload structure) |
| N8N-01 | afterChange hook sends webhook with customer_facing=false for internal statuses | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x --no-coverage` | Yes (existing) |
| N8N-01 | WebhookPayload includes kunden_text and kunden_phase fields | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x --no-coverage` | Yes (existing, tests these fields) |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="tests/unit/test-(progress-stepper|status-banner|kunden-timeline)" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-progress-stepper.test.tsx` -- covers KUND-02 (stepper rendering, phase states, null handling, mini variant)
- [ ] `tests/unit/test-status-banner.test.tsx` -- covers KUND-02 (banner variant selection, text from STATUS_CUSTOMER_TEXT, null return for normal statuses)
- [ ] `tests/unit/test-kunden-timeline.test.tsx` -- covers KUND-01 (customer text rendering instead of internal labels)

Note: The existing `test-status-config.test.ts` already covers all STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, and isCustomerFacing() tests. The existing `test-n8n-webhook.test.ts` already covers webhook payload structure including customer_facing, kunden_text, kunden_phase fields. No new tests needed for STAT-05 or N8N-01 data layer.

## Sources

### Primary (HIGH confidence)
- `src/lib/status-config.ts` -- All 20 status mappings verified: STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, CustomerPhase type, isCustomerFacing(), EMAIL_TRIGGER_STATUSES
- `src/lib/n8n-webhook.ts` -- WebhookPayload interface with customer_facing, kunden_text, kunden_phase verified
- `src/collections/business/anfragen.ts` -- afterChange hook verified: fires webhook on every status change, correctly populates customer_facing/kunden_text/kunden_phase
- `src/components/kunden/anfrage-detail.tsx` -- Current detail view structure verified (header, rueckfrage block, 2-col grid)
- `src/components/kunden/anfragen-liste.tsx` -- Current list view structure verified (StatusBadge position identified for replacement)
- `src/components/kunden/status-timeline.tsx` -- Current timeline verified (uses getStatusLabel() which must be replaced)
- `.planning/phases/21-kunden-dashboard-n8n/21-UI-SPEC.md` -- UI design contract with exact specifications for stepper/banner
- `.planning/phases/21-kunden-dashboard-n8n/21-CONTEXT.md` -- All user decisions and canonical refs
- `src/app/globals.css` -- Current Tailwind 4 @theme config verified (need to add pulse-slow keyframe)
- `tests/unit/test-status-config.test.ts` -- Existing tests for all data maps verified
- `tests/unit/test-n8n-webhook.test.ts` -- Existing tests for webhook payload structure verified

### Secondary (MEDIUM confidence)
- None needed -- all sources are direct code inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, everything is already installed and in use
- Architecture: HIGH -- follows exact patterns established in Phases 17-20, all integration points identified in code
- Pitfalls: HIGH -- identified through direct code reading of all 7 affected files
- Validation: HIGH -- existing test infrastructure with Jest 30 + @testing-library/react, existing tests cover data layer

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable -- no external dependencies changing)
