# Phase 6: Website und Compliance - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Puck Page Builder im Payload Admin integrieren mit 5 Block-Components, Catch-All Routing fuer CMS-Seiten, Live Preview mit 3 Breakpoints und Draft/Published Workflow. Mehrsprachigkeit DE/EN fuer CMS/Puck-Seiten (nicht Konfigurator/Warenkorb). DSGVO-Basics: Cookie-Banner mit granularen Kategorien, Datenloeschung im Admin. Navigation und Footer als editierbare Payload Globals.

</domain>

<decisions>
## Implementation Decisions

### Puck Page Builder Components
- 5 Block-Components: Hero, TextBlock, FeatureGrid, CTA-Banner, Bild/Text Kombi
- Bilder aus Payload Media Collection (zentraler Media-Picker, keine eigenen Uploads pro Block)
- Homepage (/) ist eine Puck-Seite — Geschaeftsinhaber kann sie im Page Builder bearbeiten
- Routing: Catch-All /[...slug] fuer alle Puck-Seiten (frei waehlbare Slugs wie /ueber-uns, /kontakt)
- Datenschutzerklaerung und Impressum als editierbare Puck-Seiten (nicht hardcoded)

### Mehrsprachigkeit DE/EN
- Scope: NUR CMS/Puck-Seiten werden uebersetzt — Konfigurator, Warenkorb, Dashboards bleiben Deutsch
- URL-Struktur: /de/... und /en/... mit Sprach-Prefix, Default ist /de/ (Deutsch)
- Sprachumschalter: Header-Navigation rechts (neben Warenkorb/Login), immer sichtbar als DE/EN Toggle
- Fallback: Wenn keine EN-Uebersetzung existiert, deutsche Version anzeigen (kein 404)
- Payload localization Config fuer DE + EN mit lokalisiertem title, content etc. in CMS-Feldern

### DSGVO & Cookie-Banner
- Cookie-Banner: Granular mit 3 Kategorien (Notwendig, Statistik, Marketing) — zukunftssicher fuer Analytics
- Eigene Implementierung mit Shadcn UI (kein externes Library) — volle Design-Kontrolle nach Style Guide
- Consent wird in Cookie/LocalStorage gespeichert, Banner erscheint nur beim ersten Besuch
- Datenloeschung: Loesch-Button pro Kunde im Admin — anonymisiert Kontaktdaten, Konfigurationsdaten bleiben fuer Statistik
- Datenschutz-Checkbox bei Anfrage-Absenden bereits implementiert (Phase 3, DSGVO-01)

### Draft Mode & Live Preview
- Draft/Published Status fuer Puck-Seiten (Payload _status Feld mit versions: { drafts: true })
- Admin speichert Aenderungen als Entwurf, klickt dann "Veroeffentlichen" — Entwurf nicht im Frontend sichtbar
- Live Preview mit 3 umschaltbaren Breakpoints: Mobile (375px), Tablet (768px), Desktop (1280px)
- Navigation: Payload Global "Navigation" mit sortierbarer Liste von Seiten-Links — Geschaeftsinhaber pflegt Header-Menue selbst
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

</decisions>

<specifics>
## Specific Ideas

- Homepage soll vom Geschaeftsinhaber komplett selbst gestaltet werden koennen (Hero + Blocks)
- Cookie-Banner mit 3 Kategorien: Aktuell keine Tracking-Cookies, aber vorbereitet fuer Google Analytics / Marketing Pixels
- Datenschutz + Impressum als Puck-Seiten: Anwalt liefert Text, Geschaeftsinhaber kann ihn selbst einpflegen
- Navigation-Global ermoeglicht dem Geschaeftsinhaber neue Seiten ins Menue aufzunehmen ohne Developer
- Footer zeigt Firmen-Kontaktdaten + Links zu Legal-Seiten — editierbar aber strukturiert (kein freies Layout)
- Sprach-Prefix /de/ und /en/ fuer SEO-optimierte mehrsprachige URLs
- Bei fehlender EN-Uebersetzung lieber deutschen Inhalt zeigen als leere Seite

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `payload.config.ts`: plugins: [] Array bereit fuer Puck Plugin, admin.components bereits genutzt (Custom Dashboard, Webhook Badge)
- `Media` Collection (src/collections/system/media.ts): Zentrale Bildverwaltung fuer Puck-Bloecke
- `cn()` Utility (src/lib/utils.ts): Tailwind class merging fuer alle Block-Components
- Shadcn UI Components (Button, Card, etc.): Fuer Cookie-Banner und Block-Styling
- Tailwind CSS 4 mit @theme Config: Design Tokens fuer konsistentes Block-Styling
- Frontend Layout (src/app/(frontend)/layout.tsx): Navigation Header mit Auth-Links und CartBadge — Sprachumschalter kommt hier rein

### Established Patterns
- Payload CMS 3.79 embedded in Next.js App Router
- Payload Globals Pattern (WebhookErrors): Fuer Navigation-Global und Footer-Global wiederverwendbar
- Custom Admin Components via import paths (@/components/admin/...)
- UUID als IDs (PostgreSQL Adapter)
- Lexical Editor bereits konfiguriert (fuer Rich Text in TextBlock)
- `<html lang="de">` im Layout — muss dynamisch werden fuer DE/EN

### Integration Points
- payload.config.ts: Puck Plugin in plugins[] Array, localization Config, neue Pages Collection
- src/app/(frontend)/[...slug]/page.tsx: Neue Catch-All Route fuer Puck-Seiten
- src/app/(frontend)/layout.tsx: Sprach-Prefix Routing, Sprachumschalter, dynamisches lang-Attribut
- Neue Payload Globals: Navigation (sortierbare Links), Footer (Kontaktdaten)
- Neue Collection: Pages (slug, title, puckData, _status, lokalisierte Felder)
- middleware.ts: i18n Routing (Redirect /ueber-uns → /de/ueber-uns)

</code_context>

<deferred>
## Deferred Ideas

- SEO-Optimierung (Meta Tags, Open Graph, Sitemap) — eigene Phase oder v2
- Blog/News-Bereich als Puck-Collection — v2
- Google Analytics / Tracking-Integration — v2 (Cookie-Kategorien sind vorbereitet)
- E-Mail-Footer Branding an Style Guide anpassen — v2
- Weitere Puck-Blocks (Testimonials, FAQ, Accordion, Video) — nach Bedarf erweiterbar

</deferred>

---

*Phase: 06-website-und-compliance*
*Context gathered: 2026-03-10*
