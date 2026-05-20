# Phase 6: Website und Compliance - Research

**Researched:** 2026-03-10
**Domain:** Page Builder (Puck), Internationalization (i18n), DSGVO/Cookie Consent
**Confidence:** MEDIUM-HIGH

## Summary

Phase 6 integrates the Puck visual page builder into the existing Payload CMS admin via `@delmaredigital/payload-puck`, adds DE/EN localization for CMS-managed pages, and implements DSGVO basics (cookie banner, data deletion). The plugin handles most of the heavy lifting: it auto-generates a Pages collection with draft support, provides built-in block components (Section, Heading, Text, Button, etc.), and offers both `PageRenderer` for frontend rendering and an editor view at `/admin/puck-editor/:collection/:id`.

The i18n implementation uses Payload's native `localization` config for content fields (DE/EN tabs in admin) combined with a custom Next.js middleware for URL-prefix routing (`/de/...`, `/en/...`). Since only CMS/Puck pages need translation (not Konfigurator/Warenkorb), the scope is limited enough to use a lightweight custom middleware rather than a full i18n library like next-intl.

**Primary recommendation:** Use `@delmaredigital/payload-puck` with its built-in components as the base, extend with 5 custom block components matching the Style Guide, and add Payload localization config for field-level DE/EN support. Cookie banner is a custom Shadcn component storing consent in cookies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 5 Block-Components: Hero, TextBlock, FeatureGrid, CTA-Banner, Bild/Text Kombi
- Bilder aus Payload Media Collection (zentraler Media-Picker, keine eigenen Uploads pro Block)
- Homepage (/) ist eine Puck-Seite — Geschaeftsinhaber kann sie im Page Builder bearbeiten
- Routing: Catch-All /[...slug] fuer alle Puck-Seiten (frei waehlbare Slugs wie /ueber-uns, /kontakt)
- Datenschutzerklaerung und Impressum als editierbare Puck-Seiten (nicht hardcoded)
- Scope i18n: NUR CMS/Puck-Seiten werden uebersetzt — Konfigurator, Warenkorb, Dashboards bleiben Deutsch
- URL-Struktur: /de/... und /en/... mit Sprach-Prefix, Default ist /de/ (Deutsch)
- Sprachumschalter: Header-Navigation rechts (neben Warenkorb/Login), immer sichtbar als DE/EN Toggle
- Fallback: Wenn keine EN-Uebersetzung existiert, deutsche Version anzeigen (kein 404)
- Cookie-Banner: Granular mit 3 Kategorien (Notwendig, Statistik, Marketing) — zukunftssicher fuer Analytics
- Eigene Implementierung mit Shadcn UI (kein externes Library) — volle Design-Kontrolle nach Style Guide
- Consent wird in Cookie/LocalStorage gespeichert, Banner erscheint nur beim ersten Besuch
- Datenloeschung: Loesch-Button pro Kunde im Admin — anonymisiert Kontaktdaten, Konfigurationsdaten bleiben fuer Statistik
- Datenschutz-Checkbox bei Anfrage-Absenden bereits implementiert (Phase 3, DSGVO-01)
- Draft/Published Status fuer Puck-Seiten (Payload _status Feld mit versions: { drafts: true })
- Live Preview mit 3 umschaltbaren Breakpoints: Mobile (375px), Tablet (768px), Desktop (1280px)
- Navigation: Payload Global "Navigation" mit sortierbarer Liste von Seiten-Links
- Footer: Statischer Footer mit CMS-Daten als Payload Global (Adresse, Telefon, Links zu Impressum/Datenschutz) — kein Drag-and-Drop

### Claude's Discretion
- Puck Plugin Konfiguration und Integration (@delmaredigital/payload-puck Setup)
- Exakte Block-Component Prop-Definitionen und Styling
- Payload localization Config Details (locale codes, fallback chain)
- Next.js i18n Routing Middleware Implementation
- Cookie-Banner UI-Design und Animation
- Anonymisierungs-Logik (welche Felder geloescht/ueberschrieben werden)
- Preview iframe Implementation und Breakpoint-Toggle UI
- Pages Collection Schema (slug, title, puckData, status, locale)

### Deferred Ideas (OUT OF SCOPE)
- SEO-Optimierung (Meta Tags, Open Graph, Sitemap) — eigene Phase oder v2
- Blog/News-Bereich als Puck-Collection — v2
- Google Analytics / Tracking-Integration — v2 (Cookie-Kategorien sind vorbereitet)
- E-Mail-Footer Branding an Style Guide anpassen — v2
- Weitere Puck-Blocks (Testimonials, FAQ, Accordion, Video) — nach Bedarf erweiterbar
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEB-01 | Puck Editor Plugin installiert und im Admin integriert | `@delmaredigital/payload-puck` v0.6.15 with `createPuckPlugin()` in plugins array, auto-generates Pages collection with puckData field |
| WEB-02 | Mindestens 3 Puck Components (Hero, TextBlock, FeatureGrid) | 5 custom components using Puck ComponentConfig pattern with fields/render, extending plugin's baseConfig via extendConfig |
| WEB-03 | Live Preview im Admin mit Breakpoints (Mobile/Tablet/Desktop) | Plugin provides editor iframe; custom breakpoint toggle via CSS width control on preview container |
| WEB-04 | Draft Mode (Entwurf vs. veroeffentlicht) | Plugin auto-enables `versions: { drafts: true }` on pages collection, adds _status field, Save/Publish/Unpublish in editor |
| I18N-01 | Payload i18n konfiguriert fuer DE + EN | Payload `localization` config with `locales: [{label:'Deutsch', code:'de'}, {label:'English', code:'en'}]`, `defaultLocale: 'de'`, `fallback: true` |
| I18N-02 | Lokalisierte Felder in CMS Collections (DE/EN Tabs) | Field-level `localized: true` on title, content fields in Pages collection; admin shows DE/EN tabs |
| I18N-03 | Frontend-Sprachumschalter wechselt DE/EN | Custom middleware for /de/ and /en/ prefix routing, toggle component in header nav |
| DSGVO-01 | Datenschutz-Checkbox ist Pflichtfeld bei Anfrage-Absenden | Already implemented in Phase 3 (ContactForm). Verify checkbox still present and functional. |
| DSGVO-02 | Cookie-Banner erscheint beim ersten Besuch | Custom Shadcn component with 3 categories, consent stored in cookie, conditionally rendered based on cookie existence |
| DSGVO-03 | Datenloeschung im Admin moeglich | Admin endpoint/action to anonymize Kunde kontaktdaten (overwrite name/email/phone/address with "GELOESCHT"), keep Anfrage/Konfiguration data for statistics |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @delmaredigital/payload-puck | 0.6.15 | Puck visual editor integration for Payload CMS | Only maintained Payload 3 + Puck integration plugin; handles editor view, collection, drafts, rendering |
| @puckeditor/core | >=0.21.0 | Core Puck editor engine | Required peer dependency for payload-puck |
| @tailwindcss/typography | >=0.5.0 | Prose styling for rich text blocks | Required peer dependency for payload-puck RichText component |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| payload (existing) | 3.79.0 | CMS with localization config | Already installed; add `localization` to buildConfig |
| next (existing) | 15.4.11 | App Router with middleware | Already installed; add middleware.ts for i18n routing |
| js-cookie | ^3.0.5 | Cookie read/write for consent banner | Lightweight cookie helper for client-side consent storage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom i18n middleware | next-intl | next-intl is overkill since only CMS pages need translation, not the full app |
| Custom cookie banner | Cookiebot/CookieYes | External services add GDPR compliance but lose design control; user explicitly wants custom Shadcn |
| @delmaredigital/payload-puck | Manual Puck + Payload | Plugin saves weeks of integration work (editor view, draft system, collection, rendering) |

**Installation:**
```bash
npm install @delmaredigital/payload-puck @puckeditor/core @tailwindcss/typography js-cookie
npm install -D @types/js-cookie
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (frontend)/
│   │   ├── [locale]/              # NEW: Locale-prefixed routes
│   │   │   └── [...slug]/
│   │   │       └── page.tsx       # Catch-all Puck page renderer
│   │   ├── layout.tsx             # Updated: dynamic lang, language toggle
│   │   └── page.tsx               # Redirect / → /de/
│   └── (payload)/                 # Unchanged
├── collections/
│   └── website/
│       └── pages.ts               # Pages collection (if not auto-generated)
├── components/
│   ├── puck-blocks/               # NEW: 5 custom Puck block components
│   │   ├── hero-block.tsx
│   │   ├── text-block.tsx
│   │   ├── feature-grid-block.tsx
│   │   ├── cta-banner-block.tsx
│   │   └── image-text-block.tsx
│   ├── cookie-banner/             # NEW: DSGVO cookie consent
│   │   └── cookie-banner.tsx
│   └── i18n/                      # NEW: Language toggle
│       └── language-toggle.tsx
├── lib/
│   ├── puck-config.ts             # NEW: Puck component config (extends baseConfig)
│   └── i18n.ts                    # NEW: Locale helpers
├── payload-globals/
│   ├── navigation.ts              # NEW: Header navigation global
│   ├── footer.ts                  # NEW: Footer global
│   └── webhook-errors.ts          # Existing
└── middleware.ts                   # NEW: i18n locale routing
```

### Pattern 1: Puck Plugin Integration
**What:** Register `createPuckPlugin()` in payload.config.ts, wrap admin layout with `PuckConfigProvider`
**When to use:** Initial setup of the page builder
**Example:**
```typescript
// payload.config.ts
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

export default buildConfig({
  // ...existing config
  localization: {
    locales: [
      { label: 'Deutsch', code: 'de' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'de',
    fallback: true,
  },
  plugins: [
    createPuckPlugin({
      pagesCollection: 'pages',
      autoGenerateCollection: true,
      editorStylesheet: './src/app/(frontend)/styles.css',
    }),
  ],
})
```
Source: [npm @delmaredigital/payload-puck](https://www.npmjs.com/package/@delmaredigital/payload-puck), [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com/delmaredigital/payload-puck)

### Pattern 2: Custom Puck Block Components
**What:** Define 5 block components with Puck ComponentConfig pattern (fields + render + defaultProps)
**When to use:** Building the page builder blocks
**Example:**
```typescript
// src/components/puck-blocks/hero-block.tsx
import type { ComponentConfig } from '@puckeditor/core'

export const HeroBlock: ComponentConfig<{
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
}> = {
  label: 'Hero',
  fields: {
    title: { type: 'text', label: 'Titel' },
    subtitle: { type: 'textarea', label: 'Untertitel' },
    ctaText: { type: 'text', label: 'Button Text' },
    ctaLink: { type: 'text', label: 'Button Link' },
    backgroundImage: { type: 'text', label: 'Hintergrundbild URL' },
  },
  defaultProps: {
    title: 'Willkommen bei Christ Fensterhandel',
    subtitle: 'Qualitaetsfenster nach Mass',
    ctaText: 'Jetzt konfigurieren',
    ctaLink: '/konfigurator',
    backgroundImage: '',
  },
  render: ({ title, subtitle, ctaText, ctaLink }) => (
    <section className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-xl">{subtitle}</p>
        <a href={ctaLink} className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-white">
          {ctaText}
        </a>
      </div>
    </section>
  ),
}
```
Source: [Puck ComponentConfig docs](https://puckeditor.com/docs/integrating-puck/component-configuration)

### Pattern 3: Puck Config Extension
**What:** Extend the plugin's baseConfig with custom components for rendering and editorConfig for editing
**When to use:** Registering custom blocks with the Puck editor
**Example:**
```typescript
// src/lib/puck-config.ts
import { extendConfig } from '@delmaredigital/payload-puck/config/editor'
import { HeroBlock } from '@/components/puck-blocks/hero-block'
import { TextBlock } from '@/components/puck-blocks/text-block'
import { FeatureGridBlock } from '@/components/puck-blocks/feature-grid-block'
import { CTABannerBlock } from '@/components/puck-blocks/cta-banner-block'
import { ImageTextBlock } from '@/components/puck-blocks/image-text-block'

export const puckConfig = extendConfig({
  components: {
    HeroBlock,
    TextBlock,
    FeatureGridBlock,
    CTABannerBlock,
    ImageTextBlock,
  },
  categories: {
    layout: { title: 'Layout', components: ['HeroBlock', 'CTABannerBlock'] },
    content: { title: 'Inhalt', components: ['TextBlock', 'FeatureGridBlock', 'ImageTextBlock'] },
  },
})
```

### Pattern 4: Frontend Page Rendering with Locale
**What:** Catch-all route that fetches Puck page data by slug and locale, renders via PageRenderer
**When to use:** Serving CMS-managed pages on the frontend
**Example:**
```typescript
// src/app/(frontend)/[locale]/[...slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { notFound } from 'next/navigation'

export default async function CmsPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params
  const fullSlug = slug?.join('/') || 'home'
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: fullSlug }, _status: { equals: 'published' } },
    locale: locale as 'de' | 'en',
    fallbackLocale: 'de',
    limit: 1,
  })

  if (!result.docs[0]) return notFound()
  const page = result.docs[0]

  return <PageRenderer config={baseConfig} data={page.puckData} />
}
```

### Pattern 5: i18n Middleware
**What:** Custom Next.js middleware that handles locale prefix routing
**When to use:** Redirecting requests without locale prefix to /de/, passing locale to pages
**Example:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['de', 'en']
const DEFAULT_LOCALE = 'de'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip admin, api, konfigurator, warenkorb, kunden, anfrage, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/konfigurator') ||
    pathname.startsWith('/warenkorb') ||
    pathname.startsWith('/kunden') ||
    pathname.startsWith('/anfrage') ||
    pathname.startsWith('/status-pruefen') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if locale prefix exists
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect to default locale
  const url = request.nextUrl.clone()
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|admin|api|konfigurator|warenkorb|kunden|anfrage|status-pruefen).*)'],
}
```

### Pattern 6: Payload Globals for Navigation/Footer
**What:** Payload GlobalConfig with sortable link arrays for Navigation and structured data for Footer
**When to use:** Editable site-wide navigation and footer content
**Example:**
```typescript
// src/payload-globals/navigation.ts
import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => ['admin', 'mitarbeiter'].includes(req.user?.rolle || ''),
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Navigationspunkte',
      admin: { initCollapsed: false },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
        { name: 'newTab', type: 'checkbox', label: 'In neuem Tab oeffnen', defaultValue: false },
      ],
    },
  ],
}
```

### Anti-Patterns to Avoid
- **Building Puck integration from scratch:** The plugin handles editor view registration, API endpoints, draft system, and rendering. Do not re-implement these.
- **Using next-intl for limited i18n scope:** Adding next-intl's full routing system when only CMS pages need translation adds unnecessary complexity.
- **Storing cookie consent in localStorage only:** Cookies are readable server-side (for middleware/SSR), localStorage is not. Use a cookie for the consent state.
- **Hardcoding Impressum/Datenschutz pages:** These must be editable Puck pages, not static React components.
- **Making the puckData field localized:** The entire page content is stored in puckData JSON. If localized:true is set on puckData itself, the user edits separate Puck layouts per locale. Instead, use localized:true on the simpler fields (title, slug) and let the Puck content be the same structure with localized text fields within the blocks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page builder editor UI | Custom drag-and-drop editor | @delmaredigital/payload-puck | Editor view, component sidebar, field editing, preview are all handled |
| Draft/publish workflow | Custom _status field + versioning | payload-puck auto-enables drafts | Native Payload versions with Save/Publish/Unpublish buttons |
| Puck page rendering | Custom JSON-to-React renderer | PageRenderer from payload-puck/render | Handles component resolution, nested layouts, data mapping |
| Editor CSS in iframe | Manual CSS injection | editorStylesheet option | Plugin compiles and serves CSS for the editor iframe |

**Key insight:** The payload-puck plugin is a comprehensive solution that handles 80% of the page builder requirements out of the box. The custom work is limited to: defining 5 block component configs, i18n middleware, cookie banner, and data deletion logic.

## Common Pitfalls

### Pitfall 1: Plugin Order in payload.config.ts
**What goes wrong:** If using page-tree plugin alongside payload-puck, the puck plugin must run BEFORE page-tree.
**Why it happens:** Page-tree validates collections during init; needs to see the auto-generated pages collection.
**How to avoid:** Put `createPuckPlugin()` first in the plugins array.
**Warning signs:** Error about missing "pages" collection during Payload init.

### Pitfall 2: Editor Iframe CSS Missing
**What goes wrong:** Puck editor shows unstyled components because the iframe lacks frontend CSS.
**Why it happens:** Editor runs in an iframe that doesn't inherit the main page's CSS.
**How to avoid:** Set `editorStylesheet` option pointing to your CSS entry file. For production, use `editorStylesheetCompiled` or `withPuckCSS()`.
**Warning signs:** Components look correct on frontend but unstyled in admin editor.

### Pitfall 3: Localization on puckData Field
**What goes wrong:** If you set `localized: true` on the puckData JSON field, each locale gets a completely separate page layout.
**Why it happens:** Payload's localization stores separate values per locale for localized fields.
**How to avoid:** Only localize simple fields (title, slug, meta description). For block content, either accept same content for all locales OR build locale-aware text fields within Puck blocks.
**Warning signs:** Editor shows empty page when switching to EN locale because no EN puckData exists.

### Pitfall 4: Middleware Conflicting with Existing Routes
**What goes wrong:** i18n middleware redirects /konfigurator to /de/konfigurator, breaking the existing app.
**Why it happens:** Middleware matcher is too broad, catches routes that should not have locale prefix.
**How to avoid:** Explicitly exclude all non-CMS routes (/konfigurator, /warenkorb, /kunden, /anfrage, /admin, /api) in the middleware matcher.
**Warning signs:** Existing pages start redirecting or showing 404.

### Pitfall 5: Homepage Routing Conflict
**What goes wrong:** Homepage at `/` conflicts with locale prefix routing (`/de/`).
**Why it happens:** The catch-all route and the root layout both try to handle `/`.
**How to avoid:** Root `/` page.tsx redirects to `/de/`. The Puck homepage has slug "home" or empty string, served at `/de/`.
**Warning signs:** Infinite redirect loop or 404 on homepage.

### Pitfall 6: Cookie Consent Not Persisting
**What goes wrong:** Cookie banner reappears on every page load.
**Why it happens:** Cookie path not set to `/`, or cookie domain mismatch, or using sessionStorage instead of persistent cookie.
**How to avoid:** Set cookie with `path: '/'`, `maxAge: 365 * 24 * 60 * 60` (1 year), `sameSite: 'lax'`.
**Warning signs:** Banner appears on every page visit despite accepting cookies.

## Code Examples

### Cookie Banner Component
```typescript
// src/components/cookie-banner/cookie-banner.tsx
'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'

const CONSENT_COOKIE = 'christ-cookie-consent'

type ConsentCategories = {
  necessary: boolean
  statistics: boolean
  marketing: boolean
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [consent, setConsent] = useState<ConsentCategories>({
    necessary: true,  // always true, not toggleable
    statistics: false,
    marketing: false,
  })

  useEffect(() => {
    const existing = Cookies.get(CONSENT_COOKIE)
    if (!existing) setVisible(true)
  }, [])

  const saveConsent = (categories: ConsentCategories) => {
    Cookies.set(CONSENT_COOKIE, JSON.stringify(categories), {
      path: '/',
      expires: 365,
      sameSite: 'lax',
    })
    setVisible(false)
  }

  const acceptAll = () => saveConsent({ necessary: true, statistics: true, marketing: true })
  const acceptNecessary = () => saveConsent({ necessary: true, statistics: false, marketing: false })
  const acceptSelected = () => saveConsent(consent)

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      {/* Banner UI with category toggles */}
    </div>
  )
}
```

### Payload Global: Footer
```typescript
// src/payload-globals/footer.ts
import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => ['admin', 'mitarbeiter'].includes(req.user?.rolle || ''),
  },
  fields: [
    { name: 'firmenname', type: 'text', defaultValue: 'Christ Fensterhandel' },
    { name: 'adresse', type: 'textarea', localized: true },
    { name: 'telefon', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'legal_links',
      type: 'array',
      label: 'Rechtliche Links',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
```

### Data Anonymization Endpoint
```typescript
// src/app/(payload)/api/admin/anonymize-customer/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.rolle !== 'admin') {
    return Response.json({ error: 'Nicht autorisiert' }, { status: 403 })
  }

  const { customerId } = await request.json()

  // Anonymize the Users (kunde) record
  await payload.update({
    collection: 'users',
    id: customerId,
    data: {
      email: `geloescht-${customerId}@anonymisiert.local`,
      vorname: 'GELOESCHT',
      nachname: 'GELOESCHT',
      telefon: '',
      // Keep rolle and timestamps for audit
    },
  })

  // Anonymize kontaktdaten in related Anfragen
  const anfragen = await payload.find({
    collection: 'anfragen',
    where: { kunde: { equals: customerId } },
    limit: 100,
  })

  for (const anfrage of anfragen.docs) {
    await payload.update({
      collection: 'anfragen',
      id: anfrage.id,
      data: {
        kontaktdaten: {
          vorname: 'GELOESCHT',
          nachname: 'GELOESCHT',
          email: 'geloescht@anonymisiert.local',
          telefon: '',
          adresse: 'GELOESCHT',
          nachricht: '',
          // Keep produkte/snapshot/preise for statistics
        },
      },
    })
  }

  return Response.json({ success: true })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual Puck + Payload integration | @delmaredigital/payload-puck plugin | 2025 | Eliminates custom editor view, API endpoints, rendering |
| next-intl for all i18n | Payload localization + custom middleware | N/A (project-specific) | Simpler for CMS-only translation scope |
| Third-party cookie consent (Cookiebot) | Custom Shadcn cookie banner | N/A (project decision) | Full design control, no external dependency |
| Pages Router i18n config | App Router middleware-based i18n | Next.js 13+ | No built-in i18n in App Router; middleware replaces it |

**Deprecated/outdated:**
- Next.js Pages Router `i18n` config in `next.config.js`: Does NOT work with App Router
- Puck `@measured/puck`: Package was renamed to `@puckeditor/core` (check correct import name)

## Open Questions

1. **puckData localization strategy**
   - What we know: Payload field-level localization stores separate values per locale. Setting `localized: true` on the puckData JSON means entirely separate page layouts per language.
   - What's unclear: Should the Puck page content (puckData) be localized (separate layouts per language) or shared (same layout, localized text via CMS fields)?
   - Recommendation: Make puckData itself NOT localized. Instead, make the page title and meta fields localized. For text content within blocks, the business owner enters text directly in the Puck editor and creates one page layout. If they want EN content, they can use the Payload locale selector before editing in Puck. This keeps it simple for v1.

2. **@puckeditor/core vs @measured/puck naming**
   - What we know: Puck was originally published as `@measured/puck`. Some docs reference the old name.
   - What's unclear: Whether `@delmaredigital/payload-puck` v0.6.15 requires `@puckeditor/core` or `@measured/puck` as peer dependency.
   - Recommendation: Check the plugin's package.json peer dependencies during installation. The ecosyste.ms data lists `@puckeditor/core >= 0.21.0`.

3. **Existing route restructuring for locale prefix**
   - What we know: Current routes are at `/(frontend)/page.tsx`, `/(frontend)/konfigurator/...`, etc.
   - What's unclear: Whether adding `[locale]` segment requires moving existing non-localized routes.
   - Recommendation: Keep non-localized routes (konfigurator, warenkorb, kunden, anfrage) where they are. Only CMS pages get the `[locale]/[...slug]` pattern. The middleware skips non-CMS routes entirely.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + @testing-library/react 16 |
| Config file | `jest.config.ts` (exists) |
| Quick run command | `npx jest --testPathPattern=tests/unit --bail` |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEB-01 | Puck plugin registers in Payload config | integration | Manual verification (Payload startup + admin visit) | N/A - manual |
| WEB-02 | Puck block components render correctly | unit | `npx jest tests/unit/test-puck-blocks.test.ts -x` | Wave 0 |
| WEB-03 | Live preview breakpoints toggle | manual-only | Manual: verify in admin UI | N/A - manual |
| WEB-04 | Draft pages not visible on frontend, published visible | integration | Manual: create draft, check frontend 404, publish, check frontend 200 | N/A - manual |
| I18N-01 | Payload localization config has de+en | unit | `npx jest tests/unit/test-i18n-config.test.ts -x` | Wave 0 |
| I18N-02 | Localized fields return correct locale data | integration | Manual: set DE/EN content, query with locale param | N/A - manual |
| I18N-03 | Middleware redirects / to /de/, passes /en/ through | unit | `npx jest tests/unit/test-i18n-middleware.test.ts -x` | Wave 0 |
| DSGVO-01 | Datenschutz checkbox present in contact form | unit | Already covered by Phase 3 tests | Existing |
| DSGVO-02 | Cookie banner renders when no consent cookie | unit | `npx jest tests/unit/test-cookie-banner.test.ts -x` | Wave 0 |
| DSGVO-03 | Anonymization overwrites kontaktdaten | unit | `npx jest tests/unit/test-anonymization.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=tests/unit --bail`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-puck-blocks.test.ts` -- covers WEB-02 (block render output)
- [ ] `tests/unit/test-i18n-middleware.test.ts` -- covers I18N-03 (middleware routing logic)
- [ ] `tests/unit/test-cookie-banner.test.ts` -- covers DSGVO-02 (banner visibility logic)
- [ ] `tests/unit/test-anonymization.test.ts` -- covers DSGVO-03 (data anonymization logic)
- [ ] `tests/unit/test-i18n-config.test.ts` -- covers I18N-01 (localization config validation)

## Sources

### Primary (HIGH confidence)
- [@delmaredigital/payload-puck on ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com/delmaredigital/payload-puck) - Comprehensive plugin API, fields, rendering, configuration
- [Puck ComponentConfig docs](https://puckeditor.com/docs/integrating-puck/component-configuration) - Component definition pattern
- [Payload CMS Localization docs](https://payloadcms.com/docs/configuration/localization) - Field-level localization, locale config
- [Payload CMS Drafts docs](https://payloadcms.com/docs/versions/drafts) - Versions/drafts system

### Secondary (MEDIUM confidence)
- [npm @delmaredigital/payload-puck](https://www.npmjs.com/package/@delmaredigital/payload-puck) - Version 0.6.15, peer deps
- [dd-starter GitHub](https://github.com/delmaredigital/dd-starter) - Reference implementation patterns
- [Next.js i18n docs](https://nextjs.org/docs/pages/guides/internationalization) - Middleware-based routing for App Router

### Tertiary (LOW confidence)
- Puck package naming (@puckeditor/core vs @measured/puck) - needs validation during install
- Editor stylesheet production compilation (withPuckCSS) - needs verification with actual build

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - payload-puck plugin is well-documented, Payload localization is official feature
- Architecture: MEDIUM-HIGH - patterns from dd-starter reference impl and Puck docs, but i18n routing is custom
- Pitfalls: MEDIUM - based on general Payload/Next.js experience and plugin docs, some edge cases untested
- Cookie/DSGVO: HIGH - straightforward custom implementation with known patterns

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (30 days - payload-puck is actively developed, check for breaking changes)
