# Phase 15: Core Navigation - Research

**Researched:** 2026-03-23
**Domain:** Payload CMS 3.x Admin Custom Nav Component + Shadcn UI + Tailwind
**Confidence:** HIGH

## Summary

Phase 15 replaces Payload CMS's default admin sidebar navigation with a fully custom `'use client'` component. The custom Nav must render fixed top-level links (Dashboard, Bestellungen, Produkte, Benutzer), four collapsible dropdown sections (Bestellungsverwaltung, Produktverwaltung, Website, System), subgroup headings in Produktverwaltung, an embedded WebhookFehlerBadge with error counts on two levels, and active link highlighting with a left accent bar plus subtle background.

The Payload CMS 3.79 `admin.components.Nav` config slot completely replaces the default sidebar. When a custom Nav is registered, the `afterNavLinks` slot is silently skipped -- the entire nav rendering responsibility shifts to the custom component. The custom component is rendered via `RenderServerComponent` which detects `'use client'` components and only passes `clientProps` (documentSubViewType, viewType, visibleEntities), NOT server props. All other data (config, auth, pathname) must be obtained via hooks.

**Primary recommendation:** Build a single `custom-nav.tsx` client component that uses `useConfig`, `useAuth`, `usePathname` from `@payloadcms/ui` and `useNav` for sidebar open/close state. Use Shadcn `Collapsible` for dropdown sections and Shadcn `Badge` for error counts. Manage dropdown open/close state locally with `useState`, initializing from URL matching via `usePathname()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- WebhookFehlerBadge: Doppelte Anzeige -- Error-Count `(n)` neben "System" Dropdown-Header UND neben "Webhook Fehler" Link. Beide nur sichtbar wenn Count > 0.
- Badge-Refactoring: Aktuelle Server Component (`getPayload()`) muss zu Client-Pattern werden (`useEffect` + `fetch('/api/globals/webhook_errors')`) da Custom Nav `'use client'` ist.
- Dropdown-Verhalten: Aktive Sektion automatisch offen beim Laden (URL-basiert via `usePathname()`). Alle anderen geschlossen. Doppel-Highlight gewollt (Breadcrumb-Effekt).
- Aktiver Link: Akzent-Strich links + subtiler Hintergrund. Gleicher Stil fuer direkte Links und Dropdown-Items. Inactive Links leicht gedimmt aber lesbar.
- Styling: Shadcn `Collapsible`, `Badge`, `Button` + Tailwind CSS. Keine Inline-Styles, kein CSS-Modules, kein Payload-eigenes CSS. Groessere Texte und Klickbereiche als Payload-Default. Keine Underline-Hover-Effekte. Keine Emojis.
- Prerequisite: `npx shadcn add collapsible badge button` vor Implementierung.
- Phase 16 legt sessionStorage-Persistenz als Layer darueber -- Phase 15 muss URL-basierte Logik als Fallback liefern.

### Claude's Discretion
- Interner Component-Aufbau (Unterkomponenten vs. monolithisch)
- Tailwind-Klassenauswahl fuer Active/Inactive Stile
- Exakte Farbtone fuer Active-Hintergrund und Akzent-Strich
- Logout-Button Platzierung und Rendering
- Fehlerbehandlung fuer WebhookFehlerBadge fetch

### Deferred Ideas (OUT OF SCOPE)
- NAV-P2-02: Animierte Dropdown-Uebergaenge (AnimateHeight)
- NAV-P2-03: Cross-Session Dropdown-Persistenz via usePreferences (DB-backed)
- Keyboard Navigation (Arrow Keys, Escape-Close)
- Benutzer-Trennung Team vs. Kunden in Navigation (Todo 011)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Admin sieht Custom Sidebar mit Dashboard, Bestellungen, Produkte, Benutzer als direkte Links oben | Custom Nav component with hardcoded top-level links using `formatAdminURL` for URL building |
| NAV-02 | Admin kann Bestellungsverwaltung aufklappen (Anfragen + Status-Historie) | Shadcn Collapsible section with two nav items |
| NAV-03 | Admin kann Produktverwaltung aufklappen mit Gruppierung (Hauptprodukte/Ausstattung/Konfiguration/Preise) | Shadcn Collapsible with gray subgroup headings rendered as non-clickable labels |
| NAV-04 | Admin kann Website aufklappen (Pages, Navigation, Footer, Puck Templates) | Shadcn Collapsible with mixed collection/global/route links |
| NAV-05 | Admin kann System aufklappen (Medien, Edit-History, Webhook Fehler) | Shadcn Collapsible with WebhookFehlerBadge embedded |
| NAV-06 | Produktverwaltung zeigt graue nicht-klickbare Untergruppen-Ueberschriften | Static `<span>` elements with muted Tailwind classes, no click handler |
| NAV-07 | Navigation enthaelt keine Emojis, nur Text-Labels | Hardcoded German text labels, no emoji characters |
| NAV-08 | Nav-Reihenfolge entspricht exakt dem Mockup | Hardcoded order in nav config data structure, not dynamic from Payload |
| UX-01 | Aktiver Nav-Link ist visuell hervorgehoben | `usePathname()` matching with left accent bar + background Tailwind classes |
| INT-01 | WebhookFehlerBadge in Custom Nav sichtbar (afterNavLinks ersetzt) | Client-side fetch to `/api/globals/webhook_errors` via `useEffect`, Shadcn Badge |
| INT-02 | Custom Nav in payload.config.ts registriert und importMap generiert | `admin.components.Nav: '@/components/admin/custom-nav#default'` + `payload generate:importmap` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @payloadcms/ui | 3.79.0 | `useConfig`, `useAuth`, `useNav`, `Logout`, `Link` hooks/components | Already installed, provides admin context |
| payload/shared | 3.79.0 | `formatAdminURL` utility | Builds correct admin panel URLs respecting routes config |
| next/navigation | 15.4.11 | `usePathname` hook | SSR-safe pathname detection for active link highlighting |
| @radix-ui/react-collapsible | (via shadcn) | Collapsible primitive | Installed by `npx shadcn add collapsible` |
| shadcn/ui components | latest | Collapsible, Badge, Button | Decided in CONTEXT.md, provides accessible primitives |
| Tailwind CSS | 4.2.1 | All styling | Already configured, project standard |
| lucide-react | 0.577.0 | ChevronDown icon for dropdown toggles | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | (installed) | `cn()` utility at `@/lib/utils` | Conditional class composition |
| class-variance-authority | 0.7.1 | Variant-based component styling | Optional for nav link variants (active/inactive/header) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shadcn Collapsible | @payloadcms/ui Collapsible | Payload's Collapsible uses SCSS and has different API (no Radix data attributes), harder to style with Tailwind |
| Shadcn Collapsible | @payloadcms/ui NavGroup | NavGroup is coupled to `usePreferences` (DB persistence), we want local state first (CONTEXT decision) |
| Custom fetch | SWR/React Query | Overkill for single badge poll; simple useEffect + fetch is sufficient |

**Installation (prerequisite):**
```bash
npx shadcn add collapsible badge button
```

This installs `@radix-ui/react-collapsible` and creates:
- `src/components/ui/collapsible.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`

Note: `src/lib/utils.ts` with `cn()` already exists.

## Architecture Patterns

### Recommended Project Structure
```
src/components/
├── admin/
│   ├── custom-nav.tsx          # Main nav component ('use client'), default export
│   ├── webhook-fehler-badge.tsx # REFACTORED: Server→Client, useEffect+fetch
│   └── ... (existing admin components)
├── ui/
│   ├── collapsible.tsx         # NEW via shadcn add
│   ├── badge.tsx               # NEW via shadcn add
│   └── button.tsx              # NEW via shadcn add
```

### Pattern 1: Custom Nav Registration
**What:** Register the custom Nav component via importMap path string in payload.config.ts
**When to use:** Always -- this is how Payload 3.x resolves admin components

```typescript
// src/payload.config.ts
export default buildConfig({
  admin: {
    components: {
      Nav: '@/components/admin/custom-nav#default',
      // REMOVE afterNavLinks -- badge is now embedded in custom nav
      // afterNavLinks: ['@/components/admin/webhook-fehler-badge#default'],
      // ... other components remain unchanged
    },
  },
})
```

After modifying config, run:
```bash
npx payload generate:importmap
```

### Pattern 2: Client Component with Payload Hooks
**What:** Use `'use client'` directive with Payload's client-exported hooks for context
**When to use:** Custom Nav is always a client component because it needs interactive state (dropdowns, URL watching)

```typescript
'use client'

import { useConfig, useAuth, useNav, Logout } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function CustomNav() {
  const { config } = useConfig()
  const { user } = useAuth()
  const { navOpen, navRef } = useNav()
  const pathname = usePathname()

  const adminRoute = config.routes?.admin ?? '/admin'

  // Build URLs using formatAdminURL or simple string concatenation
  // since adminRoute defaults to '/admin'
  const collectionUrl = (slug: string) =>
    formatAdminURL({ adminRoute, path: `/collections/${slug}` })
  const globalUrl = (slug: string) =>
    formatAdminURL({ adminRoute, path: `/globals/${slug}` })

  // ... render nav
}
```

**CRITICAL:** The client component receives `clientProps` from Payload's `RenderServerComponent`:
- `documentSubViewType`
- `viewType`
- `visibleEntities` (contains `collections: string[]` and `globals: string[]`)

These are passed as component props. The `visibleEntities` prop enables role-based filtering (Phase 16 UX-03, not Phase 15).

### Pattern 3: URL-Based Active Detection
**What:** Match current pathname against nav item URLs to determine active state
**When to use:** For active link highlighting and auto-expanding the correct dropdown

```typescript
const isActive = (href: string) => {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href) &&
    (pathname[href.length] === '/' || pathname[href.length] === undefined)
}
```

### Pattern 4: Dropdown State from URL
**What:** Initialize dropdown open/close state based on which section contains the active URL
**When to use:** On component mount and pathname changes

```typescript
const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

useEffect(() => {
  // Find which section contains a link matching current pathname
  const newOpen: Record<string, boolean> = {}
  for (const [sectionKey, items] of Object.entries(NAV_SECTIONS)) {
    const hasActiveItem = items.some(item => isActive(item.href))
    newOpen[sectionKey] = hasActiveItem
  }
  setOpenSections(newOpen)
}, [pathname])
```

### Pattern 5: WebhookFehlerBadge Client Refactoring
**What:** Convert server-side `getPayload()` call to client-side `fetch` with `useEffect`
**When to use:** Required because custom Nav is `'use client'`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function WebhookFehlerBadge() {
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch('/api/globals/webhook_errors')
        if (!res.ok) return
        const data = await res.json()
        const errors = Array.isArray(data.errors) ? data.errors : []
        const twentyFourHoursAgo = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString()
        const recent = errors.filter(
          (e: { timestamp?: string }) => e.timestamp && e.timestamp > twentyFourHoursAgo
        )
        setErrorCount(recent.length)
      } catch {
        // Silently fail
      }
    }
    fetchErrors()
    // Optional: poll every 60s
    const interval = setInterval(fetchErrors, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (errorCount === 0) return null
  return <Badge variant="destructive">{errorCount}</Badge>
}
```

### Pattern 6: Sidebar Wrapper with useNav
**What:** Wrap nav content in an `<aside>` that respects Payload's nav open/close state
**When to use:** Required for the custom nav to work with Payload's hamburger toggle on mobile/collapsed states

```typescript
const { navOpen, navRef } = useNav()

return (
  <aside
    className={cn(
      'nav',
      navOpen && 'nav--nav-open',
      'nav--nav-hydrated'
    )}
  >
    <div className="nav__scroll" ref={navRef}>
      {/* nav content */}
    </div>
  </aside>
)
```

**Important:** The custom nav MUST use the CSS class `nav` for the `<aside>` element because Payload's existing CSS and the `NavToggler` component reference it for sidebar positioning and animation. If a different class is used, the sidebar toggle behavior will break.

### Anti-Patterns to Avoid
- **Don't use NavGroup from @payloadcms/ui:** NavGroup is coupled to `usePreferences` (DB-backed persistence) which conflicts with the Phase 15/16 design of local state first, sessionStorage second.
- **Don't import from `@payloadcms/ui` Collapsible:** It has a different API than Shadcn Collapsible and uses SCSS. Use `@/components/ui/collapsible` instead.
- **Don't use `getPayload()` in client components:** This is a server-only function. Use REST API via `fetch` instead.
- **Don't dynamically generate nav items from config:** The nav structure is hardcoded per the CONTEXT decisions. Dynamic generation would make ordering (NAV-08) harder to guarantee.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible/Expandable sections | Custom CSS transitions + state | Shadcn Collapsible (Radix) | ARIA attributes, keyboard support, data-state attributes for styling |
| Admin URL construction | String concatenation `'/admin/collections/' + slug` | `formatAdminURL({ adminRoute, path })` | Handles custom basePath, custom adminRoute, serverURL correctly |
| Badge/pill component | Custom styled `<span>` | Shadcn Badge | Consistent theming, variant system, proper semantics |
| Sidebar open/close state | Custom state + body class | `useNav()` from @payloadcms/ui | Integrates with Payload's existing NavToggler, hamburger menu, and sidebar animations |
| Current user context | Custom fetch to /api/users/me | `useAuth()` from @payloadcms/ui | Already provided by Payload's AuthProvider, includes permissions |
| Config access | Hardcoded admin route strings | `useConfig()` from @payloadcms/ui | Respects routes config, handles basePath changes |

**Key insight:** Payload provides client-side hooks that are essential for the custom nav to integrate with the existing admin shell. The sidebar positioning, toggling, and animation are all controlled by Payload's CSS and the `useNav` context.

## Common Pitfalls

### Pitfall 1: afterNavLinks Silently Disappears
**What goes wrong:** When `admin.components.Nav` is set, the `afterNavLinks` slot is no longer rendered. The WebhookFehlerBadge registered there will silently vanish.
**Why it happens:** The default Nav component reads `afterNavLinks` from config and renders it. A custom Nav replaces the entire default Nav, including the slot rendering logic.
**How to avoid:** In the same config change that adds `Nav`, REMOVE the `afterNavLinks` entry and embed the badge directly in the custom nav component.
**Warning signs:** Badge disappears after adding custom Nav without any error messages.

### Pitfall 2: importMap Path Format
**What goes wrong:** Component not found, blank sidebar, or build errors.
**Why it happens:** The importMap path must follow exact format: `'@/path/to/file#exportName'`. Missing `#default` for default exports, wrong path separator, or missing `@/` prefix.
**How to avoid:** Use `'@/components/admin/custom-nav#default'` and run `npx payload generate:importmap` after changes.
**Warning signs:** Build succeeds but sidebar is empty. Check `src/app/(payload)/admin/importMap.js` to verify the component is listed.

### Pitfall 3: CSS Class `nav` is Required
**What goes wrong:** Sidebar toggle stops working, sidebar overlaps content or doesn't position correctly.
**Why it happens:** Payload's existing CSS (`template-default` layout) and `NavToggler` component target the `.nav` class for positioning. The `NavWrapper` from `@payloadcms/next` also adds classes like `nav--nav-open`, `nav--nav-hydrated`.
**How to avoid:** The custom nav's root `<aside>` element MUST have className `nav`. Additional Tailwind classes can be added alongside.
**Warning signs:** Hamburger toggle does nothing, sidebar is always visible or always hidden.

### Pitfall 4: Tailwind `.table` Utility Class Collision
**What goes wrong:** Payload's collection list tables break or render incorrectly.
**Why it happens:** Tailwind 4 generates a `.table` utility class. If Payload's SCSS references `.table` for its list views, Tailwind's definition can override it.
**How to avoid:** After implementing the nav, test all collection list views manually. If tables break, add a Tailwind `@layer` or `@theme` override.
**Warning signs:** Collection list pages show misaligned or broken table layouts.

### Pitfall 5: Server Component to Client Migration for Badge
**What goes wrong:** `getPayload()` call in a `'use client'` component causes a build error or runtime crash.
**Why it happens:** `getPayload()` requires server-side Node.js APIs. Client components run in the browser.
**How to avoid:** Replace `getPayload()` with `fetch('/api/globals/webhook_errors')`. The Payload REST API is already available at this path (auto-generated catch-all route).
**Warning signs:** Build error mentioning "Module not found: Can't resolve 'fs'" or similar Node.js-only module errors.

### Pitfall 6: Hydration Mismatch with sessionStorage
**What goes wrong:** React hydration error because server render disagrees with client render.
**Why it happens:** Reading sessionStorage during render (not in useEffect) produces different values on server vs client.
**How to avoid:** Phase 15 uses URL-based initial state only (no sessionStorage). Phase 16 adds sessionStorage in `useEffect` only. Never read sessionStorage during the render pass.
**Warning signs:** React hydration mismatch console errors in dev mode.

### Pitfall 7: usePathname Initial Value
**What goes wrong:** Active link not highlighted on first render, or wrong section open.
**Why it happens:** `usePathname()` returns the current path immediately but the component may render before navigation completes on client-side transitions.
**How to avoid:** `usePathname` from `next/navigation` is stable and returns the current pathname synchronously. Use it directly in render (not in useEffect for active state detection). Re-derive dropdown open state in a `useEffect` that depends on pathname.
**Warning signs:** Brief flash of wrong active state on page load.

## Code Examples

### Nav Item Data Structure (Hardcoded)
```typescript
// Source: CONTEXT.md collection-slug mapping
type NavItem = {
  label: string
  href: string
}

type NavSubgroup = {
  heading: string
  items: NavItem[]
}

type NavSection = {
  label: string
  items?: NavItem[]
  subgroups?: NavSubgroup[]
}

const DIRECT_LINKS: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Bestellungen', href: '/admin/collections/anfragen' },
  { label: 'Produkte', href: '/admin/collections/profile' },
  { label: 'Benutzer', href: '/admin/collections/users' },
]

const DROPDOWN_SECTIONS: NavSection[] = [
  {
    label: 'Bestellungsverwaltung',
    items: [
      { label: 'Anfragen', href: '/admin/collections/anfragen' },
      { label: 'Status-Historie', href: '/admin/collections/status_historie' },
    ],
  },
  {
    label: 'Produktverwaltung',
    subgroups: [
      {
        heading: 'HAUPTPRODUKTE',
        items: [
          { label: 'Profile', href: '/admin/collections/profile' },
          { label: 'Produkttypen', href: '/admin/collections/produkttypen' },
          { label: 'Materialien', href: '/admin/collections/materialien' },
        ],
      },
      {
        heading: 'AUSSTATTUNG',
        items: [
          { label: 'Farben', href: '/admin/collections/farben' },
          { label: 'Dichtungsfarben', href: '/admin/collections/dichtungsfarben' },
          { label: 'Verglasungen', href: '/admin/collections/verglasungen' },
          { label: 'Schallschutz', href: '/admin/collections/schallschutz' },
          { label: 'Sicherheitsglas', href: '/admin/collections/sicherheitsglas' },
          { label: 'Glasdekore', href: '/admin/collections/glasdekore' },
          { label: 'Sprossen', href: '/admin/collections/sprossen' },
          { label: 'Extras', href: '/admin/collections/extras' },
        ],
      },
      {
        heading: 'KONFIGURATION',
        items: [
          { label: 'Fluegelanzahl', href: '/admin/collections/fluegelanzahl' },
          { label: 'Oeffnungsarten', href: '/admin/collections/oeffnungsarten' },
          { label: 'Fensterformen', href: '/admin/collections/fensterformen' },
          { label: 'Zusatzlichter', href: '/admin/collections/zusatzlichter' },
        ],
      },
      {
        heading: 'PREISE',
        items: [
          { label: 'Preisregeln', href: '/admin/collections/preisregeln' },
          { label: 'Rabattcodes', href: '/admin/collections/rabattcodes' },
        ],
      },
    ],
  },
  {
    label: 'Website',
    items: [
      { label: 'Pages', href: '/admin/collections/pages' },
      { label: 'Navigation', href: '/admin/globals/navigation' },
      { label: 'Footer', href: '/admin/globals/footer' },
      { label: 'Puck Templates', href: '/admin/puck-editor' },
    ],
  },
  // System section handled separately due to badge
]
```

### Active Link Matching Logic
```typescript
// Source: Payload default Nav client component pattern (verified from node_modules)
function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    // Dashboard: exact match only
    return pathname === '/admin' || pathname === '/admin/'
  }
  // Other links: prefix match with boundary check
  return pathname.startsWith(href) &&
    (pathname.length === href.length || pathname[href.length] === '/')
}
```

### payload.config.ts Modification
```typescript
// Source: Verified from codebase + Payload docs
admin: {
  components: {
    Nav: '@/components/admin/custom-nav#default',
    // afterNavLinks REMOVED -- badge now embedded in custom Nav
    graphics: {
      Logo: '@/components/admin/logo#default',
      Icon: '@/components/admin/logo-icon#default',
    },
    providers: ['@/components/admin/undo-redo-provider#UndoRedoProvider'],
    views: { /* ... unchanged ... */ },
  },
},
```

### Wrapper Pattern (Required CSS Classes)
```typescript
// Source: Verified from @payloadcms/next/dist/elements/Nav/NavWrapper
// The <aside> MUST use className 'nav' for Payload's layout CSS to work
<aside className={cn('nav', navOpen && 'nav--nav-open', 'nav--nav-hydrated')}>
  <div className="nav__scroll" ref={navRef}>
    <nav className="nav__wrap">
      {/* Custom nav content with Tailwind classes */}
    </nav>
  </div>
</aside>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload `NavGroup` + `usePreferences` | Custom Collapsible + local state | Phase 15 decision | Full control over nav structure and styling |
| `afterNavLinks` slot for badge | Embedded in custom Nav | Phase 15 decision | Badge location and visibility controlled by us |
| Server Component badge with `getPayload()` | Client component with `useEffect` + `fetch` | Phase 15 requirement | Works in `'use client'` context |

**Deprecated/outdated:**
- Payload's `afterNavLinks` slot: Still works but becomes irrelevant when custom Nav is set (the slot is NOT rendered by the custom component)
- `getPayload()` in admin components: Only works in Server Components; custom Nav forces client-side data fetching

## Open Questions

1. **Logout Component Placement**
   - What we know: Payload's default Nav renders a `Logout` button at the bottom. The custom nav should include it.
   - What's unclear: Whether to import and render `Logout` from `@payloadcms/ui` directly or build a custom logout button.
   - Recommendation: Import `Logout` from `@payloadcms/ui` and render it at the bottom of the nav. Verified it is exported from the client bundle.

2. **Puck Editor Route Link**
   - What we know: CONTEXT.md maps "Puck Templates" to route `/admin/puck-editor`. This is a custom view route, not a collection or global.
   - What's unclear: Whether the exact path is `/admin/puck-editor` or includes a different prefix.
   - Recommendation: Verify from `payload.config.ts` custom views. The config shows `path: '/puck-editor/:segments*'` which maps to `/admin/puck-editor`. Use this path directly.

3. **Pages Collection (Puck-generated)**
   - What we know: The `pages` collection is auto-generated by `createPuckPlugin({ pagesCollection: 'pages', autoGenerateCollection: true })`.
   - What's unclear: Whether the `pages` slug is always present in `visibleEntities.collections`.
   - Recommendation: It should be -- Puck auto-generates the collection. Link to `/admin/collections/pages`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=custom-nav --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Direct links rendered (Dashboard, Bestellungen, Produkte, Benutzer) | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "direct links" -x` | No -- Wave 0 |
| NAV-02 | Bestellungsverwaltung dropdown renders Anfragen + Status-Historie | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "bestellungsverwaltung" -x` | No -- Wave 0 |
| NAV-03 | Produktverwaltung dropdown renders all grouped items | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "produktverwaltung" -x` | No -- Wave 0 |
| NAV-04 | Website dropdown renders Pages, Navigation, Footer, Puck Templates | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "website" -x` | No -- Wave 0 |
| NAV-05 | System dropdown renders Medien, Edit-History, Webhook Fehler | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "system" -x` | No -- Wave 0 |
| NAV-06 | Subgroup headings in Produktverwaltung are non-clickable | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "subgroup headings" -x` | No -- Wave 0 |
| NAV-07 | No emoji characters in rendered output | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "no emojis" -x` | No -- Wave 0 |
| NAV-08 | Nav order matches specification | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "nav order" -x` | No -- Wave 0 |
| UX-01 | Active link has accent bar + background class | unit | `npx jest tests/unit/test-custom-nav.test.tsx -t "active link" -x` | No -- Wave 0 |
| INT-01 | WebhookFehlerBadge fetches and renders error count | unit | `npx jest tests/unit/test-webhook-badge.test.tsx -x` | No -- Wave 0 |
| INT-02 | payload.config.ts has Nav component registered | unit | `npx jest tests/unit/test-nav-config.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-custom-nav.test.tsx --no-coverage -x`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-custom-nav.test.tsx` -- covers NAV-01 through NAV-08, UX-01
- [ ] `tests/unit/test-webhook-badge.test.tsx` -- covers INT-01 (client-side badge)
- [ ] `tests/unit/test-nav-config.test.ts` -- covers INT-02 (config registration)
- [ ] Test mocks for `@payloadcms/ui` hooks (`useConfig`, `useAuth`, `useNav`, `usePathname`)
- [ ] Test mock for `fetch` (webhook errors API)

Note: Testing React client components with Payload hooks requires mocking `@payloadcms/ui`. The existing `jest.config.ts` already has jsdom environment and module name mapper for `@/`.

## Sources

### Primary (HIGH confidence)
- **Payload 3.79.0 source code** (node_modules) -- Nav component architecture, RenderServerComponent behavior, hook types, importMap format
- **Codebase inspection** -- payload.config.ts, webhook-fehler-badge.tsx, components.json, existing admin components
- **Payload types** (node_modules/payload/dist/config/types.d.ts) -- `Nav?: CustomComponent` config slot

### Secondary (MEDIUM confidence)
- [Payload Root Components Documentation](https://payloadcms.com/docs/custom-components/root-components) -- Nav property documentation
- [Payload Admin Components Documentation](https://payloadcms.com/docs/admin/components) -- importMap path format
- [Shadcn Collapsible Documentation](https://ui.shadcn.com/docs/components/radix/collapsible) -- Collapsible API and usage

### Tertiary (LOW confidence)
- [GitHub Discussion #9339](https://github.com/payloadcms/payload/discussions/9339) -- Custom nav items community discussion
- [Payload CMS Custom Admin UI Guide](https://www.buildwithmatija.com/blog/payload-cms-custom-admin-ui-components-guide) -- Third-party tutorial on custom components

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified from installed node_modules and existing codebase
- Architecture: HIGH -- verified by reading Payload source code for RenderServerComponent, DefaultNav, NavWrapper, DefaultNavClient
- Pitfalls: HIGH -- verified by reading actual source code (afterNavLinks skipped, CSS class requirements, server/client boundary)
- Code examples: HIGH -- derived from actual Payload source and CONTEXT.md slug mapping

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (Payload 3.x stable, patterns unlikely to change within 30 days)
