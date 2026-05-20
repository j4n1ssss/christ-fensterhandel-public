# Style Guide — Christ Fensterhandel

> Source of Truth fuer alle UI-Arbeit. Extrahiert aus Homepage, FAQ-Page und
> Marketing-Sections. Sub-Agents MUESSEN dieses Dokument als Briefing nutzen,
> bevor sie eine Page bauen.

---

## 1. Aesthetische DNA

**Editorial Industrial.** Die Site liest sich wie ein Architektur-Magazin
fuer Bauhandwerk: viel Whitespace, grosse Display-Typo, monospaced Mikro-
Labels, asymmetrische 12-Column-Grids, dunkle Atmosphaeren-Strips als
Kontrastpunkte. Brand-Farbe **`#E29D49` (Amber)** ist Akzent — niemals
flaechig auf hellen Pages.

**Verboten:** Inter / Roboto / Arial · Lila-auf-Weiss · Standard-Shadcn
ohne Anpassung · runde Hero-Photos · "Hero with three feature boxes"-Layout
· Centered Headlines mit grossem Body darunter (langweilig).

---

## 2. Design Tokens (aus `globals.css`)

Tailwind v4 mit `@theme` — keine `tailwind.config.ts`-Tokens. Single Source:
`src/app/globals.css`.

### Farben (Token → Verwendung)

| Token | Verwendung |
|---|---|
| `bg-white` / `bg-black-50` | Section-Wechsel (Page-Rhythmus) |
| `bg-black-950` | Atmosphaeren-Strips (Drutex-Section, Kontakt-CTA-Endstrip) |
| `bg-brand-500` | Konfigurator-CTA-Section, Brand-Highlight |
| `text-black-950` | Display-Headlines, Body-strong |
| `text-black-700` / `-600` | Body-Text |
| `text-black-500` | Mono-Labels muted |
| `text-brand-600` | Mono-Eyebrow auf hell |
| `text-brand-400` | Mono-Eyebrow auf dunkel + Highlight-Span |
| `text-white-100` | Headlines auf dunkel |
| `text-white-80` / `-60` | Body auf dunkel |
| `border-black-200` / `-100` | Card-Borders, Trennstriche |
| `border-white-10` / `-20` | Borders auf dunkel |

### Layout-Tokens

- Container: `<Container size="xl">` (1536px) ist Standard fuer Marketing-Pages
- Page-Padding: automatisch via Container, responsive (24/32/48 px)
- Container-Sizes: `xs`(640) `sm`(768) `md`(1024) `lg`(1280) `xl`(1536)

---

## 3. Typografie

```
Display H1 — Hero    font-heading text-5xl md:text-6xl lg:text-7xl xl:text-[88px]
                     font-medium leading-[1.02] tracking-tight text-black-950
Display H2 — Section font-heading text-4xl md:text-5xl lg:text-6xl
                     font-medium leading-[1.05] tracking-tight text-black-950
H3 — Card/Sub        font-heading text-2xl md:text-3xl
                     font-medium tracking-tight text-black-950
Eyebrow / Kicker     font-mono text-xs uppercase tracking-[0.25em] text-brand-600
Mini-Label           font-mono text-[11px] uppercase tracking-[0.2em] text-black-500
Body Lead            text-lg md:text-xl leading-relaxed text-black-700
Body                 text-base leading-relaxed text-black-600
Stat-Value           font-heading text-6xl md:text-7xl font-medium tabular-nums
```

**Highlight-Pattern in Headlines:** Brand-Wort-Span am Zeilenende:
```tsx
<h2>Wir bauen nicht irgendwas ein.<br/>
  <span className="text-brand-500">Wir bauen DRUTEX ein.</span>
</h2>
```

**Auto-Highlight in Mini-Tagline:**
```tsx
<span className="text-white-60">Wir sind am Apparat.</span>
```

---

## 4. Page-Architektur (Pflicht fuer alle neuen Pages)

```
[1] MarketingHero        ← Breadcrumb + 4/8-Editorial-Split (siehe Component)
[2..n] Content-Sektionen ← weiss/black-50 Wechsel, je SectionDivider oben
[n+1] ContactCtaStripe   ← Black-950 Endstrip mit invertiertem SectionDivider
```

**Section-Padding:** `py-24 md:py-32` (Standard) · `py-24 md:py-32 lg:py-40`
(Hero und Closer)

**Section-Rhythmus:** Erste Section nach Hero immer `bg-white`. Dann
abwechselnd `bg-black-50` ↔ `bg-white`. Atmosphaeren-Strips (Drutex, CTA)
brechen den Rhythmus bewusst.

---

## 5. Component-Vokabular (PFLICHT verwenden)

### Vorhanden (NIEMALS dupli­zieren!)
- `Container` — `<Container size="xl">` Standard fuer Marketing
- `SectionDivider` (`invert` fuer dunkle Sections) — oben auf jeder Section
- `Button` + `buttonVariants({ variant, size })` — primary / secondary / alternate / alternate-inverse / tertiary / link
- `PillButton` — Signature-CTA fuer grosse Action-Momente (variant: primary / secondary / alternate / tertiary, size: sm/md/lg/xl)
- `SectionKicker` — Mono-Eyebrow (tone: muted / brand / onDark)
- `FlowHeader` — fuer Flow-Pages (Warenkorb/Anfrage), NICHT fuer Marketing
- `Badge`, `Modal`, `Input`, `Collapsible`, `ErrorAlert`

### Neu in dieser Session (`src/components/marketing/`)
- `MarketingHero` — Editorial 4/8-Split Hero mit Breadcrumb + Marginalia-Stats
- `ContactCtaStripe` — Black-950 Endstrip mit Telefon/E-Mail/CTA
- `FeatureGrid` — 3-Col Card-Grid mit Icon + Title + Body
- `SpecList` — Mono-Definition-List mit tabular-nums
- `MaterialOptions` — Card-Grid analog `products-section.tsx` Pattern
- `EditorialSplit` — wiederverwendbares 4/8 Header (Eyebrow + H2 + Body)

---

## 6. Card-Pattern (Standard)

```tsx
<Link className="group relative flex flex-col overflow-hidden rounded-2xl
                 border border-black-200 bg-white transition-all duration-300
                 hover:-translate-y-1 hover:border-brand-500
                 hover:shadow-[0_24px_48px_-16px_rgba(226,157,73,0.25)]">
  {/* Image-Slot 4:3 mit Index-Mono-Label + ArrowUpRight-Badge top-right */}
  {/* Text-Slot: H3 + Tagline + Chip-Liste mit border-top */}
</Link>
```

Index-Mono-Label: `font-mono text-[11px] uppercase tracking-[0.25em] text-white-95`

ArrowBadge: `size-10 rounded-full bg-white-95` → hover `bg-brand-500`

Chip: `rounded-full bg-black-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-black-600`

---

## 7. Breadcrumb-Pattern

```tsx
<nav aria-label="Breadcrumb"
     className="mb-10 font-mono text-[11px] uppercase tracking-[0.2em]
                text-black-500 md:mb-14 md:text-xs">
  <Link href="/" className="transition-colors hover:text-brand-700">Start</Link>
  <span aria-hidden className="mx-2 text-black-300">·</span>
  <span className="text-black-400">Service</span>
  <span aria-hidden className="mx-2 text-black-300">·</span>
  <span className="text-black-950">Aktuelle Seite</span>
</nav>
```

---

## 8. Editorial Header (4/8-Split, Pflicht in jeder Section)

```tsx
<div className="mb-14 grid grid-cols-1 gap-8 md:mb-20 md:grid-cols-12 md:gap-12">
  <div className="md:col-span-4">
    <SectionKicker tone="brand">Eyebrow Label</SectionKicker>
  </div>
  <div className="md:col-span-8">
    <h2 className="font-heading text-4xl font-medium leading-[1.05] tracking-tight
                   text-black-950 md:text-5xl lg:text-6xl">
      Headline mit
      <br/>
      Zeilenbruch.
    </h2>
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-black-600">
      Body-Lead.
    </p>
  </div>
</div>
```

---

## 9. Atmosphaeren-Effekte (sparsam einsetzen)

**Brand-Glow auf dunkel** (Drutex-Section, Kontakt-Endstrip):
```tsx
<div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40
     h-[32rem] w-[32rem] rounded-full bg-brand-500/10 blur-3xl" />
```

**Diagonal-Streifen-Pattern** (Konfigurator-CTA-Section):
```tsx
<div aria-hidden className="absolute inset-0 opacity-[0.08]"
     style={{ backgroundImage: "repeating-linear-gradient(135deg,
              var(--color-black-950) 0 1px, transparent 1px 14px)" }} />
```

**Hover-Image-Zoom:** `transition-transform duration-700 group-hover:scale-[1.05]`

---

## 10. Firmen-Daten (offiziell, IMMER diese Werte verwenden)

| Feld | Wert |
|---|---|
| Firma | Fensterhandel-Christ |
| Inhaber | Kersten Christ |
| Adresse | Fohrder Landstrasse 13, 14772 Brandenburg an der Havel |
| Telefon | +49 3381 2148373 (`tel:+4933812148373`) |
| WhatsApp | +49 1717263776 (nur Nachrichten, **keine Anrufe**) |
| E-Mail | info@baustoffchrist.de |
| Oeffnungszeiten regulaer | **NUR FREITAGS** 10:00–17:00 Uhr (bis 20:00 mit Voranmeldung) |
| Service | 24/7 erreichbar per Telefon und E-Mail |
| Sonderschliessungen 2026 | 23.03.–22.04. · 01.08.–31.08. · ab 11.12. Winterpause bis April 2027 |
| Hauptpartner | DRUTEX (Polen) — exklusiv |
| Aluminium-Profile | Aluprof (MB-45, MB-70, MB-86 N SI) |
| Profilserien | IGLO 5 Classic, Energy, Edge, Light, EXT, Energy Alucover |

### Ansprechpartner (4)

| Person | Zustaendigkeit | Mobil |
|---|---|---|
| Frau Christ | Technische Fragen, Neubestellungen | 0170 7263776 |
| Herr Beck | Transport, Lieferung Lagerware | 01577 3373052 |
| Herr Richter | Verfuegbarer Lagerbestand | 0171 7263776 |
| Herr Budick | Einbau, Montage | 0160 96041677 |

---

## 11. Ton & Stimme

- **Direkt:** "Wir bauen DRUTEX ein." statt "Wir verkaufen Fenster".
- **Handwerklich:** "Massgefertigt", "vermessen vor Ort", "Familienbetrieb".
- **Kein Marketing-Speak:** Niemals "innovativ", "ganzheitlich", "synergetisch".
- **Du-Form** im Marketing (Konfigurator, Hero, CTA).
- **Sie-Form** in formalen Kontexten (Datenschutz, Impressum, AGB).
- **Polnisch-Hinweis** beim Service: "Beratung auf Deutsch oder Polnisch."

---

## 12. Aria & A11y

- Jede `<section>` braucht `aria-labelledby="…-heading"` mit `id` auf der H2/H1
- Decorative Elements `aria-hidden`
- Breadcrumb: `<nav aria-label="Breadcrumb">`
- Tel-Links: `tel:+4933812148373`, Mail: `mailto:info@baustoffchrist.de`
- Bilder: deutsche Alt-Texte, Material/Farbe/Kontext beschreibend
- Heading-Hierarchie: H1 nur einmal pro Page (im Hero)

---

## 13. Page-Closer (Pflicht)

Jede Marketing-Page (ausser Hub-Pages, die direkt in Listings uebergehen)
endet mit `<ContactCtaStripe />` als letzte Section vor dem Footer. Variante
ist optional: standard (Apparat) | konfigurator (Brand-Stripe statt Black).

---

## Anti-Patterns (NIEMALS)

❌ Centered Hero mit Body unter H1
❌ Drei-Boxen-Feature-Section ohne 4/8-Header
❌ Default Shadcn `Card` ohne Brand-Hover-Shadow
❌ `border` ohne Token (immer `border-black-200` o.aE.)
❌ `text-gray-*` (es gibt nur `black-*`)
❌ Hex-Codes in Markup (immer Tokens)
❌ Mehr als 1 H1 pro Page
❌ `font-bold` (es gibt nur `font-medium` fuer Display)
❌ Inline-Styles ausser fuer dynamic CSS-Vars (Effekte)
