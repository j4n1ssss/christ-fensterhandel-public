# Phase 2: Konfigurator-Pipeline - Research

**Researched:** 2026-03-09
**Domain:** Multi-step configurator with conditional filtering, URL state, SVG preview
**Confidence:** HIGH

## Summary

Phase 2 builds a 10-step window configurator (Fenster-Konfigurator) on top of the Payload CMS collections created in Phase 1. The core challenge is a conditional chain-logic where each step's options are filtered by previous selections (Material filters Profile, Produkttyp filters Fluegelanzahl, Profil determines min/max Masse, etc.), all driven by CMS relationship data. The data model is already complete with bidirectional relationships (`erlaubte_profile`, `fuer_produkttypen`, `erlaubte_materialien`, etc.).

The architecture decision from CONTEXT.md is clear: load all CMS data upfront via a single API call, then filter client-side. State management uses Zustand for configurator state with URL sync via nuqs, React Hook Form + Zod for form validation, and LocalStorage for persistence. The 3-column layout (sidebar/content/preview) with an SVG window drawing and text summary creates a rich, interactive experience.

**Primary recommendation:** Use Zustand as the central configurator store with nuqs for URL state synchronization, React Hook Form + Zod for the measurement step (Step 7), and a composable SVG component system for the live preview. All CMS data loaded once on mount, filtered client-side through derived selectors.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- 3-Spalten Layout: Links Step-Sidebar, Mitte Step-Inhalt, Rechts Live-Vorschau
- Sidebar IST die Fortschrittsanzeige (kein separater Balken oben) -- Checkmarks fuer erledigte Steps, Pfeil fuer aktiven Step, ausgegraut fuer offene
- Navigation nur zurueck: Steps sind nur klickbar wenn bereits ausgefuellt. Vorwaerts-Springen nicht moeglich
- Auswahl-Optionen als Bild-Karten mit Badges (Titel, Beschreibung, Bild, Badges wie Lieferzeit/Garantie/Beliebt)
- Ausgewaehlte Karte wird visuell hervorgehoben (Border/Schatten)
- Weiter/Zurueck Buttons unter dem Step-Inhalt
- Rechtes Panel zeigt SVG-Fensterzeichnung OBEN + Text-Zusammenfassung UNTEN
- SVG ab Step 1 sichtbar -- startet als generische Fenster-Silhouette, verfeinert sich mit jeder Auswahl
- Schematisch-clean Stil: Klare 2D-Linien, Fluegel als Rechtecke, Oeffnungsart-Symbole (Dreh-Pfeil, Kipp-Dreieck), Griff als Strich, Sprossen als Linien
- SVG zeigt live die gewaehlte Rahmenfarbe (Farb-Code aus CMS als Fuellfarbe)
- Masse werden als Beschriftung angezeigt (Breite x Hoehe), Flaeche berechnet
- Text-Zusammenfassung listet alle bisherigen Auswahlen mit Checkmarks
- Mobile: Sidebar klappt zusammen zu Dropdown-Header oben ("Step 3/10 -- Profil"), Klick oeffnet Step-Liste als Overlay
- Mobile: Step-Inhalt darunter, Vorschau (SVG + Text) darunter
- Mobile: Keine Swipe-Gesten -- Navigation nur ueber Buttons
- Mobile: Weiter/Zurueck Buttons als Sticky Footer am unteren Bildschirmrand fixiert
- Alle CMS-Optionen beim Start laden (ein API-Call, alles lokal verfuegbar)
- Konditionale Filterung client-seitig aus vorgeladenen Daten (kein API-Call beim Step-Wechsel)
- Loading-State: Skeleton-Karten mit Shimmer-Effekt (Shadcn Skeleton Component)
- Konfigurator-Zustand URL-basiert (/konfigurator/fenster?step=3&material=kunststoff) -- Link-Sharing, Browser-Zurueck, Bookmark moeglich
- LocalStorage-Persistenz: Konfiguration wird gespeichert, beim naechsten Besuch "Moechten Sie Ihre letzte Konfiguration fortsetzen?" Dialog

### Claude's Discretion
- State Management Architektur (React Context, Zustand, URL-State Sync)
- Genauer SVG-Aufbau und Rendering-Technik
- Skeleton-Layout Details
- Step-Transition Animationen (falls sinnvoll)
- Responsive Breakpoints fuer Karten-Spalten (1-spaltig auf Smartphone, 2-spaltig auf Tablet)
- LocalStorage Key-Schema und Cleanup-Strategie

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KONF-01 | Landing Page mit 3 Konfigurator-Karten (Fenster/Balkontuer, Tueren, Rolllaeden) | Landing page component with 3 cards, routing to /konfigurator/{type} |
| KONF-02 | Konfigurator-Routing: /konfigurator/fenster, /konfigurator/tueren, /konfigurator/rolllaeden | Next.js App Router nested routes with dynamic segments |
| KONF-03 | Step 1 -- Produkttyp-Auswahl (Fenster/Balkontuer) mit Bild und Beschreibung | OptionCard component, fetch from produkttypen collection |
| KONF-04 | Step 2 -- Material-Auswahl mit Badges (Lieferzeit, Garantie, Beliebtheit) | OptionCard with Badge sub-components, filter by produkttyp.erlaubte_materialien |
| KONF-05 | Step 3 -- Profil-Auswahl (gefiltert nach Material) mit technischen Daten | Filter profile by material.erlaubte_profile, show technische_daten group |
| KONF-06 | Step 4 -- Fluegel-Auswahl + optionales Ober-/Unterlicht | Filter fluegelanzahl by fuer_produkttypen, zusatzlichter by kombinierbar_mit |
| KONF-07 | Step 5 -- Oeffnungsart pro Fluegel, Griff-Seite bei Dreh/Dreh-Kipp | Per-wing selection array, filter by fuer_fenster/fuer_balkontuer |
| KONF-08 | Step 6 -- Fensterform-Auswahl mit konditionalen Einschraenkungen | Filter fensterformen by erlaubte_fluegelanzahl, erlaubte_oeffnungsarten |
| KONF-09 | Step 7 -- Masseingabe mit Min/Max-Validierung vom Profil, Live-Vorschau | React Hook Form + Zod with dynamic min/max from profile.masse |
| KONF-10 | Step 8 -- Farben (Aussen/Innen/Dichtung) mit "Gleich wie Aussen"-Option | Filter farben by erlaubte_materialien + fuer_aussen/fuer_innen |
| KONF-11 | Step 9 -- Verglasung, Schallschutz, Sicherheitsglas, Glasdekor, Sprossen, Extras | Multi-section step with multiple independent selections |
| KONF-12 | Step 10 -- Zusammenfassung mit Konfigurations-Uebersicht und Preisvorschau | Summary view rendering all selections, client-side price calculation |
| KONF-13 | Zurueck-Reset-Logik (Material aendern -> Profil wird zurueckgesetzt) | Dependency graph in Zustand store, cascade reset on change |
| KONF-14 | Fortschrittsanzeige (StepIndicator) zeigt aktuellen Step | Sidebar component with step states (complete/active/pending) |
| KONF-15 | React Hook Form + Zod fuer alle Formular-Steps | Zod schemas per step, zodResolver with React Hook Form |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.x | Configurator state management | Minimal API, excellent performance, URL sync support, no Provider needed |
| nuqs | 2.8.x | URL search params state sync | Type-safe, built for Next.js App Router, used by Vercel/Sentry/Supabase |
| react-hook-form | 7.71.x | Form validation (Step 7 Masse, Step 8 Farben) | Uncontrolled inputs, minimal re-renders, zodResolver integration |
| zod | 3.x | Schema validation for form steps | Stable, proven with @hookform/resolvers. Zod 4 exists but resolver compatibility has had issues -- use 3.x for stability |
| @hookform/resolvers | 5.x | Bridges Zod schemas to React Hook Form | Official resolver package |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Skeleton | (built-in) | Loading shimmer for cards | Initial data fetch loading state |
| cn() utility | (exists) | Tailwind class merging | Every component -- already in src/lib/utils.ts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context | Context causes re-renders on every state change; Zustand has selector-based subscriptions |
| nuqs | Manual URLSearchParams | nuqs handles throttling, type parsing, Next.js integration automatically |
| Zod 3.x | Zod 4.x | Zod 4 is faster but @hookform/resolvers had compatibility issues as recently as early 2026; 3.x is battle-tested |

**Installation:**
```bash
npm install zustand nuqs react-hook-form zod @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/(frontend)/
    page.tsx                          # Landing Page (KONF-01)
    konfigurator/
      fenster/
        page.tsx                      # Fenster Konfigurator entry (client component)
      tueren/
        page.tsx                      # Placeholder "Bald verfuegbar"
      rolllaeden/
        page.tsx                      # Placeholder "Bald verfuegbar"
  components/
    konfigurator/
      konfigurator-shell.tsx          # 3-column layout container
      step-sidebar.tsx                # Left: Step navigation/progress
      step-content.tsx                # Center: Dynamic step rendering
      preview-panel.tsx               # Right: SVG + text summary
      steps/
        step-produkttyp.tsx           # Step 1
        step-material.tsx             # Step 2
        step-profil.tsx               # Step 3
        step-fluegel.tsx              # Step 4
        step-oeffnungsart.tsx         # Step 5
        step-form.tsx                 # Step 6
        step-masse.tsx                # Step 7
        step-farben.tsx               # Step 8
        step-verglasung-extras.tsx    # Step 9
        step-zusammenfassung.tsx      # Step 10
      ui/
        option-card.tsx               # Reusable image card with badges
        badge-group.tsx               # Badge display (Lieferzeit, Garantie, etc.)
        step-navigation.tsx           # Weiter/Zurueck buttons
        mobile-step-header.tsx        # Collapsed step header for mobile
      preview/
        window-svg.tsx                # SVG window drawing component
        svg-parts/
          frame.tsx                   # Window frame SVG
          wing.tsx                    # Single wing SVG element
          handle.tsx                  # Handle SVG
          opening-indicator.tsx       # Opening type symbols
          dimensions-label.tsx        # Width x Height labels
        selection-summary.tsx         # Text summary with checkmarks
  lib/
    konfigurator/
      store.ts                        # Zustand store
      types.ts                        # TypeScript types for config state
      url-state.ts                    # nuqs parsers and URL sync
      filters.ts                      # Client-side conditional filtering logic
      price-calculator.ts             # Client-side price preview
      persistence.ts                  # LocalStorage save/restore
      step-config.ts                  # Step definitions, titles, dependency graph
      schemas.ts                      # Zod schemas per step
```

### Pattern 1: Zustand Store with URL Sync

**What:** Central Zustand store holds all configurator state. nuqs syncs selected params to URL for sharing/bookmarking.
**When to use:** Throughout the configurator -- every step reads/writes to this store.

```typescript
// src/lib/konfigurator/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface KonfiguratorState {
  // CMS data (loaded once)
  cmsData: CMSData | null
  isLoading: boolean

  // Step navigation
  currentStep: number
  completedSteps: Set<number>

  // Selections (one per step)
  produkttyp: string | null        // UUID
  material: string | null          // UUID
  profil: string | null            // UUID
  fluegelanzahl: string | null     // UUID
  zusatzlichter: string[]          // UUIDs
  oeffnungsarten: WingOpening[]    // per-wing selections
  fensterform: string | null       // UUID
  masse: { breite: number; hoehe: number } | null
  farbeAussen: string | null       // UUID
  farbeInnen: string | null        // UUID
  dichtungsfarbe: string | null    // UUID
  gleichWieAussen: boolean
  verglasung: string | null        // UUID
  schallschutz: string | null
  sicherheitsglas: string | null
  glasdekor: string | null
  sprossen: string | null
  extras: string[]                 // UUIDs

  // Actions
  setStep: (step: number) => void
  setSelection: (key: string, value: unknown) => void
  goToStep: (step: number) => void
  resetDependentSteps: (fromStep: number) => void
  loadCMSData: () => Promise<void>
}
```

### Pattern 2: Conditional Chain Filtering

**What:** Each step filters its options based on CMS relationship data from previous selections.
**When to use:** Every step that depends on a previous selection.

```typescript
// src/lib/konfigurator/filters.ts

// The dependency chain:
// Step 1 (Produkttyp) -> filters Step 2 (Material via erlaubte_materialien)
// Step 2 (Material) -> filters Step 3 (Profil via erlaubte_profile)
// Step 1 (Produkttyp) -> filters Step 4 (Fluegel via fuer_produkttypen)
// Step 1 (Produkttyp) -> filters Step 5 (Oeffnung via fuer_fenster/fuer_balkontuer)
// Step 4+5 (Fluegel+Oeffnung) -> filters Step 6 (Form via erlaubte_fluegelanzahl/erlaubte_oeffnungsarten)
// Step 3 (Profil) -> constrains Step 7 (Masse via masse.min/max)
// Step 2 (Material) -> filters Step 8 (Farben via erlaubte_materialien)

const STEP_DEPENDENCIES: Record<number, number[]> = {
  1: [],          // Produkttyp: no dependencies
  2: [1],         // Material depends on Produkttyp
  3: [2],         // Profil depends on Material
  4: [1],         // Fluegel depends on Produkttyp
  5: [1, 4],      // Oeffnungsart depends on Produkttyp + Fluegel count
  6: [4, 5],      // Form depends on Fluegel + Oeffnungsart
  7: [3],         // Masse depends on Profil (min/max)
  8: [2],         // Farben depends on Material
  9: [],          // Verglasung/Extras: no conditional filtering
  10: [],         // Summary: no filtering
}

function getFilteredOptions(step: number, cmsData: CMSData, selections: Selections) {
  switch (step) {
    case 2: // Material filtered by Produkttyp
      const produkttyp = cmsData.produkttypen.find(p => p.id === selections.produkttyp)
      const erlaubteMaterialIds = (produkttyp?.erlaubte_materialien || []).map(m =>
        typeof m === 'string' ? m : m.id
      )
      return cmsData.materialien.filter(m => erlaubteMaterialIds.includes(m.id))

    case 3: // Profile filtered by Material
      const material = cmsData.materialien.find(m => m.id === selections.material)
      const erlaubteProfileIds = (material?.erlaubte_profile || []).map(p =>
        typeof p === 'string' ? p : p.id
      )
      return cmsData.profile.filter(p => erlaubteProfileIds.includes(p.id))

    // ... etc for each step
  }
}
```

### Pattern 3: Cascade Reset on Back-Navigation

**What:** When a user changes a previous selection, all dependent downstream steps are reset.
**When to use:** KONF-13 requirement -- changing Material resets Profil, changing Produkttyp resets Fluegel, etc.

```typescript
// In the Zustand store:
resetDependentSteps: (changedStep: number) => {
  // Find all steps that transitively depend on changedStep
  const stepsToReset = findDependentSteps(changedStep, STEP_DEPENDENCIES)

  set((state) => {
    const newState = { ...state }
    for (const step of stepsToReset) {
      // Reset selection for this step
      resetStepSelection(newState, step)
      // Remove from completedSteps
      newState.completedSteps = new Set(
        [...newState.completedSteps].filter(s => s !== step)
      )
    }
    return newState
  })
}
```

### Pattern 4: nuqs URL State Sync

**What:** Sync key configurator params to URL for link sharing.
**When to use:** Step number + key selections in URL.

```typescript
// src/lib/konfigurator/url-state.ts
import { parseAsInteger, parseAsString, createSearchParamsCache } from 'nuqs/server'

export const konfiguatorParsers = {
  step: parseAsInteger.withDefault(1),
  produkttyp: parseAsString,
  material: parseAsString,
  profil: parseAsString,
}

// Use slugs in URL, not UUIDs (for readability):
// /konfigurator/fenster?step=3&material=kunststoff&produkttyp=fenster
```

### Pattern 5: SVG Window Preview

**What:** Composable SVG components that render a schematic window drawing.
**When to use:** Preview panel, updated with each selection.

```typescript
// src/components/konfigurator/preview/window-svg.tsx
// Composable: Frame wraps Wings, Wings contain Handles and Opening indicators
// Props driven from Zustand store selections
// Frame color from farb_code, dimensions from masse, wing count from fluegelanzahl

interface WindowSVGProps {
  wingCount: number
  openings: WingOpening[]
  form: string          // 'rechteck' | 'rundbogen' | etc.
  frameColor: string    // HEX from CMS farb_code
  width?: number        // mm, for dimension labels
  height?: number       // mm, for dimension labels
  hasOberlicht: boolean
  hasUnterlicht: boolean
}
```

### Anti-Patterns to Avoid

- **Fetching CMS data per step:** Decision is to load ALL data on mount. Do NOT add API calls on step transitions.
- **Using React state for step selections:** Use Zustand store, not per-component useState. This prevents prop drilling and enables URL/localStorage sync.
- **Hardcoding filter logic:** All conditional filtering MUST use CMS relationship data. Do not hardcode "Kunststoff allows Iglo 5" -- read from `erlaubte_profile`.
- **Storing UUIDs in URL:** Use slugs for URL readability. Map slug->UUID internally.
- **Monolithic step component:** Each step should be its own component. Do not put all 10 steps in one file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL search params parsing | Custom useSearchParams wrapper | nuqs | Handles throttling, type safety, Next.js App Router integration, browser rate-limit protection |
| Form validation | Manual onChange + error tracking | React Hook Form + Zod | Uncontrolled inputs, minimal re-renders, built-in error states |
| State persistence to LocalStorage | Manual JSON.stringify/parse with useEffect | Zustand `persist` middleware | Handles serialization, hydration mismatch, versioning |
| Loading skeletons | Custom animated divs | Shadcn Skeleton component | Already styled for Tailwind, consistent with design system |
| Class merging | Manual template literals | cn() utility (already exists) | Handles Tailwind class conflicts correctly |

**Key insight:** The CMS data is already structured with relationship fields. The filtering logic reads these relationships -- it does NOT implement business rules in code.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with LocalStorage
**What goes wrong:** SSR renders default state, client hydrates with LocalStorage data, causing React hydration mismatch error.
**Why it happens:** Zustand persist middleware loads from LocalStorage on client only.
**How to avoid:** Use `skipHydration: true` in persist config, then call `useStore.persist.rehydrate()` in a useEffect. Or use the `onRehydrateStorage` callback. The configurator page should be a client component (`'use client'`).
**Warning signs:** Console hydration warnings, flash of default content.

### Pitfall 2: Payload REST API Depth Parameter
**What goes wrong:** Relationship fields return UUIDs instead of populated objects.
**Why it happens:** Payload REST API defaults to depth=1. Nested relationships need depth=2+.
**How to avoid:** Use `?depth=2` when fetching CMS data to get populated relationship objects. Example: `/api/materialien?depth=2` returns `erlaubte_profile` as full profile objects, not just IDs.
**Warning signs:** Cannot access `material.erlaubte_profile[0].name` -- getting string UUID instead.

### Pitfall 3: Stale Filtered Options After Back-Navigation
**What goes wrong:** User goes back, changes Material, but Step 3 still shows old Profile options.
**Why it happens:** Filtered options computed once and cached, not recomputed when dependencies change.
**How to avoid:** Use Zustand selectors that derive filtered options on every render based on current selections. Never cache filtered results independently.
**Warning signs:** Options that should be hidden are still visible after going back.

### Pitfall 4: Per-Wing Opening Selection Data Model
**What goes wrong:** Step 5 (Oeffnungsart) needs per-wing selection. A simple `oeffnungsart: UUID` is insufficient.
**Why it happens:** Multi-wing windows need separate opening type + handle side per wing.
**How to avoid:** Model as array: `oeffnungsarten: Array<{ wingIndex: number, oeffnungsart: UUID, griffSeite: 'links' | 'rechts' | null }>`. Array length matches `fluegelanzahl.anzahl`.
**Warning signs:** Can only select one opening type for the whole window.

### Pitfall 5: SVG Viewport Scaling
**What goes wrong:** SVG window drawing doesn't scale properly across screen sizes.
**Why it happens:** Fixed pixel dimensions instead of viewBox-based scaling.
**How to avoid:** Use SVG `viewBox` attribute with proportional coordinates. Let the container CSS control actual display size. Use `preserveAspectRatio="xMidYMid meet"`.
**Warning signs:** SVG overflows container or appears too small on mobile.

### Pitfall 6: Mobile Sticky Footer Overlap
**What goes wrong:** Sticky Weiter/Zurueck footer overlaps last card content.
**Why it happens:** No padding-bottom on scroll container to account for sticky footer height.
**How to avoid:** Add `pb-20` (or appropriate height) to the step content container on mobile.
**Warning signs:** Last option card partially hidden behind navigation buttons.

## Code Examples

### CMS Data Fetching (Single Upfront Load)

```typescript
// src/lib/konfigurator/store.ts
// Fetch all collections in parallel on mount
async function fetchAllCMSData(): Promise<CMSData> {
  const collections = [
    'produkttypen', 'materialien', 'profile', 'fluegelanzahl',
    'zusatzlichter', 'oeffnungsarten', 'fensterformen', 'farben',
    'dichtungsfarben', 'verglasungen', 'schallschutz', 'sicherheitsglas',
    'glasdekore', 'sprossen', 'extras', 'preisregeln'
  ] as const

  const responses = await Promise.all(
    collections.map(slug =>
      fetch(`/api/${slug}?depth=2&limit=100&where[aktiv][equals]=true&sort=sortOrder`)
        .then(r => r.json())
    )
  )

  return Object.fromEntries(
    collections.map((slug, i) => [slug, responses[i].docs])
  ) as CMSData
}
```

### Option Card Component

```typescript
// src/components/konfigurator/ui/option-card.tsx
interface OptionCardProps {
  title: string
  description?: string
  imageUrl?: string
  badges?: Array<{ text: string; variant?: 'default' | 'success' | 'info' }>
  selected: boolean
  onClick: () => void
}

// Card with image on top, title + description, badges row
// Selected state: ring-2 ring-primary shadow-lg
// Unselected: border border-border hover:border-primary/50
```

### Client-Side Price Preview (Step 10)

```typescript
// src/lib/konfigurator/price-calculator.ts
function calculatePreviewPrice(selections: Selections, cmsData: CMSData): number {
  // 1. Find matching Preisregel (produkttyp + material + profil)
  const regel = cmsData.preisregeln.find(r =>
    matchId(r.produkttyp, selections.produkttyp) &&
    matchId(r.material, selections.material) &&
    matchId(r.profil, selections.profil)
  )
  if (!regel) return 0

  // 2. Calculate area in m2
  const flaeche = (selections.masse.breite * selections.masse.hoehe) / 1_000_000

  // 3. Base price
  let preis = flaeche * regel.grundpreis_pro_m2

  // 4. Add Aufpreise (Verglasung, Farben, Extras)
  // ... sum up aufpreis fields from selected options

  return Math.round(preis * 100) / 100
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for wizard forms | Zustand + URL state | 2024+ | 90% less boilerplate, no Provider wrapping |
| Controlled inputs for every form | React Hook Form (uncontrolled) | Stable since 2022 | Fewer re-renders, better performance |
| Custom URL serialization | nuqs type-safe parsers | 2024-2025 | No manual parsing, built-in throttling |
| Alpine.js in Webflow (old arch) | React components in Next.js | This project migration | Full type safety, SSR, component reuse |

**Deprecated/outdated:**
- The original project docs reference Alpine.js + Webflow + Supabase architecture. This has been completely replaced by Next.js + Payload CMS + PostgreSQL.
- Zod 4 is available but avoid for this project due to resolver stability concerns.

## Open Questions

1. **SVG Complexity for Special Forms**
   - What we know: Rechteck is straightforward to draw. Rundbogen, Dreieck, Trapez, Rund require SVG path calculations.
   - What's unclear: Exact SVG rendering for 6 different window forms with variable wing counts.
   - Recommendation: Start with Rechteck only (most common). Add special forms as a follow-up within this phase. The SVG component should accept a `form` prop and render the appropriate shape.

2. **Oberlicht/Unterlicht in SVG**
   - What we know: These are additional fixed panes above/below the main window.
   - What's unclear: Exact proportions and how they affect dimension labels.
   - Recommendation: Treat as additional SVG rows above/below the main wing area. Fixed height proportion (e.g., 25% of total height).

3. **nuqs + Zustand Sync Direction**
   - What we know: Both nuqs and Zustand can hold state. Need clear ownership.
   - Recommendation: Zustand is the source of truth. nuqs reads from Zustand and syncs to URL. On page load, nuqs reads URL params and seeds Zustand. Use `useEffect` to sync Zustand changes -> nuqs updates.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Not yet installed (no test framework in package.json) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx jest --passWithNoTests` (after setup) |
| Full suite command | `npx jest` (after setup) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KONF-01 | Landing page renders 3 configurator cards | unit | `npx jest tests/unit/test-landing-page.test.tsx -x` | Wave 0 |
| KONF-03-12 | Each step renders correct filtered options | unit | `npx jest tests/unit/test-step-*.test.tsx -x` | Wave 0 |
| KONF-13 | Back-navigation resets dependent steps | unit | `npx jest tests/unit/test-cascade-reset.test.ts -x` | Wave 0 |
| KONF-15 | Zod validation rejects invalid Masse | unit | `npx jest tests/unit/test-schemas.test.ts -x` | Wave 0 |
| FILTERS | Conditional filtering returns correct options | unit | `npx jest tests/unit/test-filters.test.ts -x` | Wave 0 |
| PRICE | Price calculation matches expected formula | unit | `npx jest tests/unit/test-price-calculator.test.ts -x` | Wave 0 |

### Sampling Rate

- **Per task commit:** Quick run on changed files
- **Per wave merge:** Full suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Install test framework: `npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest jest-environment-jsdom @types/jest`
- [ ] Create `jest.config.ts` with Next.js/JSX support
- [ ] `tests/unit/test-filters.test.ts` -- covers KONF-03 through KONF-11 (filtering logic)
- [ ] `tests/unit/test-cascade-reset.test.ts` -- covers KONF-13
- [ ] `tests/unit/test-schemas.test.ts` -- covers KONF-15
- [ ] `tests/unit/test-price-calculator.test.ts` -- covers KONF-12

## Sources

### Primary (HIGH confidence)
- Existing codebase: All 17 Payload CMS collections examined -- relationship fields confirmed (erlaubte_profile, fuer_produkttypen, erlaubte_materialien, etc.)
- Payload CMS 3.79.0 REST API: depth parameter, where queries, sorting
- Project docs: `docs/konfigurator/steps/004_2026-02-22_hauptkonfigurator.md` -- complete 10-step flow with CMS structure and conditional logic

### Secondary (MEDIUM confidence)
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.11, URL sync guide verified
- [nuqs](https://nuqs.dev/) - v2.8.8, Next.js App Router support confirmed
- [React Hook Form](https://react-hook-form.com/) - v7.71.2, multi-step wizard patterns
- [@hookform/resolvers Zod 4 issues](https://github.com/react-hook-form/react-hook-form/issues/12829) - Zod 4 resolver compatibility issues reported
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/radix/skeleton) - Shimmer component available

### Tertiary (LOW confidence)
- SVG window rendering approach -- based on general SVG composability patterns, no specific window configurator SVG library found. Custom implementation recommended.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are well-established, versions verified on npm
- Architecture: HIGH - Patterns derived from locked decisions in CONTEXT.md + actual CMS data model
- Pitfalls: HIGH - Based on known Next.js hydration issues, Payload API behavior, and multi-step form patterns
- SVG Preview: MEDIUM - No established library for window SVG; custom implementation based on SVG primitives
- Test setup: MEDIUM - No test framework currently installed; standard Jest + RTL setup recommended

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain, libraries mature)
