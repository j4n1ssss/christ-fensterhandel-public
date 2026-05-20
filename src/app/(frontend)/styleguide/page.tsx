import type { Metadata } from "next";
import { ArrowRight, Plus, Download, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/ui/pill-button";
import { Container, type ContainerSize } from "@/components/layout/container";
import { PagePadding } from "@/components/layout/page-padding";

export const metadata: Metadata = {
  title: "Styleguide · Muster Fenster",
  description:
    "Design-Tokens, Typografie und Components des Frontend-Design-Systems.",
};

/* ─────────────────────────────────────────────────────────────
   FARBPALETTEN — spiegeln @theme in globals.css
   Werte werden per CSS-Variable gerendert, nicht hardcoded,
   damit Änderungen in globals.css automatisch durchschlagen.
   ───────────────────────────────────────────────────────────── */

type PaletteStop = {
  weight: string;
  cssVar: string;
  value: string; // HSL / rgba / hex — zur Anzeige
  dark?: boolean; // weisse Beschriftung nötig
};

const BLACK_SCALE: PaletteStop[] = [
  { weight: "50", cssVar: "--color-black-50", value: "hsl(0 0% 98%)" },
  { weight: "100", cssVar: "--color-black-100", value: "hsl(0 0% 96%)" },
  { weight: "200", cssVar: "--color-black-200", value: "hsl(0 0% 90%)" },
  { weight: "300", cssVar: "--color-black-300", value: "hsl(0 0% 82%)" },
  { weight: "400", cssVar: "--color-black-400", value: "hsl(0 0% 64%)", dark: true },
  { weight: "500", cssVar: "--color-black-500", value: "hsl(0 0% 45%)", dark: true },
  { weight: "600", cssVar: "--color-black-600", value: "hsl(0 0% 32%)", dark: true },
  { weight: "700", cssVar: "--color-black-700", value: "hsl(0 0% 22%)", dark: true },
  { weight: "800", cssVar: "--color-black-800", value: "hsl(0 0% 13%)", dark: true },
  { weight: "900", cssVar: "--color-black-900", value: "hsl(0 0% 7%)", dark: true },
  { weight: "950", cssVar: "--color-black-950", value: "hsl(0 0% 3%)", dark: true },
];

const WHITE_SCALE: PaletteStop[] = [
  { weight: "5", cssVar: "--color-white-5", value: "rgba(255,255,255,0.05)" },
  { weight: "10", cssVar: "--color-white-10", value: "rgba(255,255,255,0.10)" },
  { weight: "20", cssVar: "--color-white-20", value: "rgba(255,255,255,0.20)" },
  { weight: "40", cssVar: "--color-white-40", value: "rgba(255,255,255,0.40)" },
  { weight: "60", cssVar: "--color-white-60", value: "rgba(255,255,255,0.60)" },
  { weight: "80", cssVar: "--color-white-80", value: "rgba(255,255,255,0.80)" },
  { weight: "95", cssVar: "--color-white-95", value: "rgba(255,255,255,0.95)" },
  { weight: "100", cssVar: "--color-white-100", value: "rgba(255,255,255,1.00)" },
];

const BRAND_SCALE: PaletteStop[] = [
  { weight: "50", cssVar: "--color-brand-50", value: "hsl(33 80% 97%)" },
  { weight: "100", cssVar: "--color-brand-100", value: "hsl(33 78% 92%)" },
  { weight: "200", cssVar: "--color-brand-200", value: "hsl(33 76% 85%)" },
  { weight: "300", cssVar: "--color-brand-300", value: "hsl(33 74% 75%)" },
  { weight: "400", cssVar: "--color-brand-400", value: "hsl(33 73% 66%)" },
  { weight: "500", cssVar: "--color-brand-500", value: "#E29D49", dark: true },
  { weight: "600", cssVar: "--color-brand-600", value: "hsl(33 70% 50%)", dark: true },
  { weight: "700", cssVar: "--color-brand-700", value: "hsl(33 72% 40%)", dark: true },
  { weight: "800", cssVar: "--color-brand-800", value: "hsl(33 75% 30%)", dark: true },
  { weight: "900", cssVar: "--color-brand-900", value: "hsl(33 78% 22%)", dark: true },
  { weight: "950", cssVar: "--color-brand-950", value: "hsl(33 82% 13%)", dark: true },
];

/* ─────────────────────────────────────────────────────────────
   SEMANTIC COLORS (shadcn) — aus @theme
   ───────────────────────────────────────────────────────────── */

const COLOR_TOKENS: Array<{
  name: string;
  cssVar: string;
  hsl: string;
  tailwind: string;
  onDark?: boolean;
}> = [
  { name: "background", cssVar: "--color-background", hsl: "hsl(0 0% 100%)", tailwind: "bg-background" },
  { name: "foreground", cssVar: "--color-foreground", hsl: "hsl(0 0% 3.9%)", tailwind: "text-foreground", onDark: true },
  { name: "card", cssVar: "--color-card", hsl: "hsl(0 0% 100%)", tailwind: "bg-card" },
  { name: "card-foreground", cssVar: "--color-card-foreground", hsl: "hsl(0 0% 3.9%)", tailwind: "text-card-foreground", onDark: true },
  { name: "popover", cssVar: "--color-popover", hsl: "hsl(0 0% 100%)", tailwind: "bg-popover" },
  { name: "popover-foreground", cssVar: "--color-popover-foreground", hsl: "hsl(0 0% 3.9%)", tailwind: "text-popover-foreground", onDark: true },
  { name: "primary", cssVar: "--color-primary", hsl: "hsl(0 0% 9%)", tailwind: "bg-primary", onDark: true },
  { name: "primary-foreground", cssVar: "--color-primary-foreground", hsl: "hsl(0 0% 98%)", tailwind: "text-primary-foreground" },
  { name: "secondary", cssVar: "--color-secondary", hsl: "hsl(0 0% 96.1%)", tailwind: "bg-secondary" },
  { name: "secondary-foreground", cssVar: "--color-secondary-foreground", hsl: "hsl(0 0% 9%)", tailwind: "text-secondary-foreground", onDark: true },
  { name: "muted", cssVar: "--color-muted", hsl: "hsl(0 0% 96.1%)", tailwind: "bg-muted" },
  { name: "muted-foreground", cssVar: "--color-muted-foreground", hsl: "hsl(0 0% 45.1%)", tailwind: "text-muted-foreground" },
  { name: "accent", cssVar: "--color-accent", hsl: "hsl(0 0% 96.1%)", tailwind: "bg-accent" },
  { name: "accent-foreground", cssVar: "--color-accent-foreground", hsl: "hsl(0 0% 9%)", tailwind: "text-accent-foreground", onDark: true },
  { name: "destructive", cssVar: "--color-destructive", hsl: "hsl(0 84.2% 60.2%)", tailwind: "bg-destructive", onDark: true },
  { name: "destructive-foreground", cssVar: "--color-destructive-foreground", hsl: "hsl(0 0% 98%)", tailwind: "text-destructive-foreground" },
  { name: "border", cssVar: "--color-border", hsl: "hsl(0 0% 89.8%)", tailwind: "border-border" },
  { name: "input", cssVar: "--color-input", hsl: "hsl(0 0% 89.8%)", tailwind: "border-input" },
  { name: "ring", cssVar: "--color-ring", hsl: "hsl(0 0% 3.9%)", tailwind: "ring-ring", onDark: true },
];

const SPACING_SCALE = [
  { token: "0.5", rem: "0.125rem", px: "2px" },
  { token: "1", rem: "0.25rem", px: "4px" },
  { token: "2", rem: "0.5rem", px: "8px" },
  { token: "3", rem: "0.75rem", px: "12px" },
  { token: "4", rem: "1rem", px: "16px" },
  { token: "6", rem: "1.5rem", px: "24px" },
  { token: "8", rem: "2rem", px: "32px" },
  { token: "12", rem: "3rem", px: "48px" },
  { token: "16", rem: "4rem", px: "64px" },
  { token: "24", rem: "6rem", px: "96px" },
];

const SHADOW_SCALE = [
  { token: "shadow-sm", className: "shadow-sm" },
  { token: "shadow", className: "shadow" },
  { token: "shadow-md", className: "shadow-md" },
  { token: "shadow-lg", className: "shadow-lg" },
  { token: "shadow-xl", className: "shadow-xl" },
  { token: "shadow-2xl", className: "shadow-2xl" },
];

const BUTTON_VARIANTS = [
  { name: "primary", description: "Haupt-CTA · Brand-Fill" },
  { name: "secondary", description: "Starke neutrale Aktion · Black-Fill" },
  { name: "alternate", description: 'Outline · für „nebenan"-Aktionen' },
  { name: "tertiary", description: "Ghost · minimale Präsenz" },
  { name: "link", description: "Text-only · Inline-Link" },
] as const;

const BUTTON_SIZES = ["small", "normal"] as const;

const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline"] as const;

const PILL_BUTTON_SIZES = [
  { size: "sm", label: "small", hint: "Inline-CTAs, Card-Footers", specs: "py-1.5 · pl-5 pr-1.5 · badge-7" },
  { size: "md", label: "medium", hint: "Standard-CTA", specs: "py-2.5 · pl-6 pr-2.5 · badge-9" },
  { size: "lg", label: "large", hint: "Prominenter Section-CTA", specs: "py-3.5 · pl-7 pr-3.5 · badge-11" },
  { size: "xl", label: "xl", hint: "Hero / End-Section Signature-CTA", specs: "py-5 · pl-8 pr-5 · badge-12" },
] as const;

const PILL_BUTTON_VARIANTS = [
  { variant: "primary", hint: "Haupt-CTA · schwarz-fill + brand-badge" },
  { variant: "secondary", hint: "Inverted · brand-fill + schwarz-badge" },
  { variant: "alternate", hint: "Outline · border + brand-badge" },
  { variant: "tertiary", hint: "Ghost · transparent + brand-badge" },
] as const;

/* ─────────────────────────────────────────────────────────────
   LAYOUT-TOKENS — spiegeln @theme in globals.css
   ───────────────────────────────────────────────────────────── */

const LAYOUT_SIZES: Array<{
  name: ContainerSize;
  cssVar: string;
  rem: string;
  px: string;
  hint: string;
}> = [
  { name: "xs", cssVar: "--layout-xs", rem: "40rem", px: "640 px", hint: "Reading-Column, Artikel" },
  { name: "sm", cssVar: "--layout-sm", rem: "48rem", px: "768 px", hint: "Schmaler Content" },
  { name: "md", cssVar: "--layout-md", rem: "64rem", px: "1024 px", hint: "Standard-Content" },
  { name: "lg", cssVar: "--layout-lg", rem: "80rem", px: "1280 px", hint: "Breite Layouts, 3-Spalter" },
  { name: "xl", cssVar: "--layout-xl", rem: "96rem", px: "1536 px", hint: "Full-Width" },
];

const MAXW_SIZES: Array<{
  name: string;
  cssVar: string;
  utility: string;
  rem: string;
  px: string;
  hint: string;
}> = [
  { name: "xxs", cssVar: "--container-xxs", utility: "max-w-xxs", rem: "16rem", px: "256 px", hint: "Inline-Widgets" },
  { name: "xs",  cssVar: "--container-xs",  utility: "max-w-xs",  rem: "20rem", px: "320 px", hint: "Form-Inputs" },
  { name: "sm",  cssVar: "--container-sm",  utility: "max-w-sm",  rem: "24rem", px: "384 px", hint: "Kleine Cards" },
  { name: "md",  cssVar: "--container-md",  utility: "max-w-md",  rem: "32rem", px: "512 px", hint: "Cards mittel" },
  { name: "lg",  cssVar: "--container-lg",  utility: "max-w-lg",  rem: "40rem", px: "640 px", hint: "Textblöcke" },
  { name: "xl",  cssVar: "--container-xl",  utility: "max-w-xl",  rem: "48rem", px: "768 px", hint: "Breite Textblöcke" },
  { name: "xxl", cssVar: "--container-xxl", utility: "max-w-xxl", rem: "56rem", px: "896 px", hint: "Maximale Element-Breite" },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="mb-20 border-b border-border pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Frontend · Design System · v0.2
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
          Styleguide.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Lebende Referenz aller Design-Tokens, die aktuell im Frontend
          definiert sind. Quelle der Wahrheit:&nbsp;
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            src/app/globals.css
          </code>
          &nbsp;und&nbsp;
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            src/app/(frontend)/styles.css
          </code>
          .
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-4">
          <MetaItem label="CSS Framework" value="Tailwind CSS 4" />
          <MetaItem label="Component Lib" value="shadcn/ui" />
          <MetaItem label="Brand Color" value="#E29D49" />
          <MetaItem label="Mode" value="Light only" />
        </dl>
      </header>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav aria-label="Abschnitte" className="mb-20">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
          {[
            ["01", "Farbpaletten", "#paletten"],
            ["02", "Semantic Colors", "#semantic"],
            ["03", "Typografie", "#typografie"],
            ["04", "Radius", "#radius"],
            ["05", "Spacing", "#spacing"],
            ["06", "Page Padding", "#page-padding"],
            ["07", "Container", "#container"],
            ["08", "Max-Width", "#max-width"],
            ["09", "Shadows", "#shadows"],
            ["10", "Animationen", "#animationen"],
            ["11", "Components", "#components"],
            ["12", "Gap-Analyse", "#gaps"],
          ].map(([num, label, href]) => (
            <li key={href}>
              <a
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="tabular-nums">{num}</span>
                &nbsp;&nbsp;{label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── 01 Farbpaletten ────────────────────────────────── */}
      <Section id="paletten" number="01" title="Farbpaletten">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Drei Paletten mit unterschiedlicher Semantik.&nbsp;
          <strong className="text-foreground">Black</strong> für
          solide Flächen auf hellem Grund,&nbsp;
          <strong className="text-foreground">White</strong> für
          transparente Overlays auf Farb-/Bildflächen,&nbsp;
          <strong className="text-foreground">Brand</strong> als Akzent
          (Basis: #E29D49).
        </p>

        {/* Black */}
        <PaletteBlock
          name="Black"
          description="Solide HSL-Graustufen. 11 Stufen, 50 (fast weiß) bis 950 (fast schwarz)."
          utilityPrefix="bg-black-"
          stops={BLACK_SCALE}
        />

        {/* White — auf dunklem Hintergrund gerendert, damit sichtbar */}
        <PaletteBlock
          name="White"
          description="Alpha-Overlays auf Weiss-Basis. Deckkraft steuert die Weights. Preview auf dunklem Grund, damit die transparenten Stufen sichtbar werden."
          utilityPrefix="bg-white-"
          stops={WHITE_SCALE}
          previewBg="var(--color-black-900)"
          forceLightLabels
        />

        {/* Brand */}
        <PaletteBlock
          name="Brand (Amber)"
          description="Voll gewichtete Brand-Skala. brand-500 ist die Kernfarbe #E29D49."
          utilityPrefix="bg-brand-"
          stops={BRAND_SCALE}
          highlightWeight="500"
        />

        <p className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Tailwind-Nutzung:</strong>
          &nbsp;Sobald ein Token in{" "}
          <code className="font-mono">@theme</code> steht, generiert
          Tailwind v4 automatisch die passenden Utilities — z. B.&nbsp;
          <code className="font-mono">bg-brand-500</code>,{" "}
          <code className="font-mono">text-brand-700</code>,{" "}
          <code className="font-mono">border-black-200</code>.
        </p>
      </Section>

      {/* ── 02 Semantic Colors (shadcn) ────────────────────── */}
      <Section id="semantic" number="02" title="Semantic Colors">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          shadcn/ui-Tokens. Aktuell noch auf Default-Neutral (Graustufen).
          Später sollten <code className="font-mono text-sm">--color-primary</code>
          &nbsp;und <code className="font-mono text-sm">--color-accent</code>
          &nbsp;auf die Brand-Palette zeigen.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </div>
      </Section>

      {/* ── 03 Typografie ──────────────────────────────────── */}
      <Section id="typografie" number="03" title="Typografie">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <TokenRow label="Body Font">
            <code className="font-mono text-sm">
              system-ui, -apple-system, sans-serif
            </code>
          </TokenRow>
          <TokenRow label="Mono Font">
            <code className="font-mono text-sm">Roboto Mono, monospace</code>
          </TokenRow>
          <TokenRow label="Base Size">
            <code className="font-mono text-sm">18px</code>
          </TokenRow>
          <TokenRow label="Base Line-Height">
            <code className="font-mono text-sm">32px</code>
          </TokenRow>
        </div>

        <div className="space-y-8 rounded-lg border border-border bg-card p-8">
          <TypeSpecimen label="h1 · text-6xl" className="text-6xl font-semibold tracking-tight">
            Premium Fenster aus Meisterhand.
          </TypeSpecimen>
          <TypeSpecimen label="h2 · text-4xl" className="text-4xl font-semibold tracking-tight">
            Konfigurieren Sie Ihr Fenster.
          </TypeSpecimen>
          <TypeSpecimen label="h3 · text-2xl" className="text-2xl font-semibold">
            Unsere Produktwelt
          </TypeSpecimen>
          <TypeSpecimen label="h4 · text-xl" className="text-xl font-medium">
            Qualität, die bleibt
          </TypeSpecimen>
          <TypeSpecimen label="body · text-base" className="text-base">
            Seit über 30 Jahren fertigen wir Fenster und Türen auf Mass.
            Jedes Stück wird individuell konfiguriert, gemessen und
            eingebaut — von einem Team, das sein Handwerk versteht.
          </TypeSpecimen>
          <TypeSpecimen label="small · text-sm text-muted-foreground" className="text-sm text-muted-foreground">
            Kleingedrucktes, Hinweise und Metadaten.
          </TypeSpecimen>
          <TypeSpecimen label="mono · font-mono" className="font-mono text-sm">
            const fensterBreite = 1200; // mm
          </TypeSpecimen>
        </div>
      </Section>

      {/* ── 04 Radius ──────────────────────────────────────── */}
      <Section id="radius" number="04" title="Radius">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Ein einziger Basis-Radius&nbsp;
          <code className="font-mono text-sm">--radius: 0.5rem</code>. Tailwind
          leitet daraus&nbsp;
          <code className="font-mono text-sm">rounded-sm/md/lg/xl</code>&nbsp;ab.
        </p>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "rounded-sm", className: "rounded-sm" },
            { label: "rounded-md", className: "rounded-md" },
            { label: "rounded-lg", className: "rounded-lg" },
            { label: "rounded-full", className: "rounded-full" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-3">
              <div
                className={`h-24 w-24 border border-border bg-secondary ${r.className}`}
              />
              <code className="font-mono text-xs text-muted-foreground">
                {r.label}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 05 Spacing ─────────────────────────────────────── */}
      <Section id="spacing" number="05" title="Spacing">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Tailwind-Default-Skala, 4&nbsp;px Grundeinheit. Auswahl der
          gebräuchlichsten Werte:
        </p>
        <div className="space-y-3">
          {SPACING_SCALE.map((s) => (
            <div key={s.token} className="flex items-center gap-6">
              <code className="w-12 font-mono text-sm tabular-nums text-muted-foreground">
                {s.token}
              </code>
              <div
                className="h-3 bg-foreground"
                style={{ width: s.rem }}
                aria-hidden
              />
              <code className="font-mono text-xs text-muted-foreground">
                {s.rem} · {s.px}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 06 Page Padding ────────────────────────────────── */}
      <Section id="page-padding" number="06" title="Page Padding">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Horizontaler Viewport-Inset als <em>ein</em> Token —&nbsp;
          <code className="font-mono text-sm">--page-padding-inline</code>.
          Responsiv in drei Stufen, alle Components übernehmen das
          automatisch.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PaddingStep breakpoint="Mobile" query="&lt; 768 px" value="1.5rem · 24 px" />
          <PaddingStep breakpoint="Tablet" query="≥ 768 px" value="2rem · 32 px" />
          <PaddingStep breakpoint="Desktop" query="≥ 1280 px" value="3rem · 48 px" />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/40 px-4 py-2">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Preview · Padding hervorgehoben
            </span>
          </div>
          <div className="relative overflow-hidden">
            {/* Linke Padding-Zone */}
            <div
              className="absolute inset-y-0 left-0 border-r border-dashed"
              style={{
                width: "var(--page-padding-inline)",
                background: "var(--color-brand-100)",
                borderColor: "var(--color-brand-400)",
              }}
              aria-hidden
            />
            {/* Rechte Padding-Zone */}
            <div
              className="absolute inset-y-0 right-0 border-l border-dashed"
              style={{
                width: "var(--page-padding-inline)",
                background: "var(--color-brand-100)",
                borderColor: "var(--color-brand-400)",
              }}
              aria-hidden
            />
            <div
              className="py-12 font-mono text-sm"
              style={{ paddingInline: "var(--page-padding-inline)" }}
            >
              Content-Bereich · links und rechts je&nbsp;
              <span style={{ color: "var(--color-brand-700)" }}>
                var(--page-padding-inline)
              </span>
              &nbsp;abstand
            </div>
          </div>
        </div>

        <pre className="mt-8 overflow-x-auto rounded-lg border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed">
{`// Nutzung als Utility
<div className="px-[var(--page-padding-inline)]">…</div>

// Oder als Component
<PagePadding as="section">…</PagePadding>

// Container wendet es bereits automatisch an
<Container size="lg">…</Container>`}
        </pre>
      </Section>

      {/* ── 07 Container ───────────────────────────────────── */}
      <Section id="container" number="07" title="Container">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Page-Layout-Wrapper. Zentriert Content, setzt Max-Breite und
          wendet Page-Padding an. Fünf Grössen für unterschiedliche
          Seitentypen. Genutzt via&nbsp;
          <code className="font-mono text-sm">&lt;Container size="lg"&gt;</code>
          &nbsp;oder&nbsp;
          <code className="font-mono text-sm">max-w-[var(--layout-lg)]</code>.
        </p>

        {/* Visuelle Demo: alle 5 Container-Grössen untereinander */}
        <div className="mb-10 space-y-4 rounded-lg border border-dashed border-border bg-muted/30 p-6">
          {LAYOUT_SIZES.map((l) => (
            <div key={l.name}>
              <div className="mb-1 flex items-baseline justify-between font-mono text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">container-{l.name}</strong>
                  &nbsp;· {l.hint}
                </span>
                <span>
                  {l.rem} · {l.px}
                </span>
              </div>
              <div
                className="mx-auto h-10 rounded-md border"
                style={{
                  maxWidth: `var(${l.cssVar})`,
                  background: "var(--color-brand-100)",
                  borderColor: "var(--color-brand-400)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Token-Tabelle */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full font-mono text-xs">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">CSS Variable</th>
                <th className="px-4 py-2 font-medium">Component</th>
                <th className="px-4 py-2 font-medium">Wert</th>
                <th className="px-4 py-2 font-medium">Nutzung</th>
              </tr>
            </thead>
            <tbody>
              {LAYOUT_SIZES.map((l) => (
                <tr key={l.name} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{l.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{l.cssVar}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    &lt;Container size=&quot;{l.name}&quot;&gt;
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {l.rem} · {l.px}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{l.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <pre className="mt-8 overflow-x-auto rounded-lg border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed">
{`// Standard — Seiten-Hauptwrapper
<Container size="lg" as="section">
  <h1>Überschrift</h1>
</Container>

// Enger Reading-Container für Artikel
<Container size="xs">
  <article>…</article>
</Container>

// Ohne Padding (z. B. wenn Parent es setzt)
<Container size="md" noPadding>…</Container>`}
        </pre>

        {/* Live-Demo mit echter Komponente */}
        <div className="mt-8">
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Live · echter &lt;Container size=&quot;sm&quot;&gt; mit PagePadding
          </h3>
          <div className="-mx-6 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 py-6">
            <Container size="sm">
              <div className="rounded-md border border-border bg-card p-6 text-sm">
                Dieses Element liegt in einem echten&nbsp;
                <code className="font-mono text-xs">&lt;Container size=&quot;sm&quot;&gt;</code>
                &nbsp;(max 48 rem breit, automatisch zentriert, mit responsivem
                Page-Padding). Verkleinere den Viewport — das Padding ändert
                sich an den Breakpoints 768 px und 1280 px.
              </div>
            </Container>
            <PagePadding>
              <p className="mt-4 text-xs text-muted-foreground">
                Dieser Satz nutzt ausserhalb des Containers nur&nbsp;
                <code className="font-mono">&lt;PagePadding&gt;</code>&nbsp;—
                volle Breite, aber Abstand zum Viewport-Rand.
              </p>
            </PagePadding>
          </div>
        </div>
      </Section>

      {/* ── 08 Max-Width ───────────────────────────────────── */}
      <Section id="max-width" number="08" title="Max-Width">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Constraint-Tokens für <em>einzelne Elemente</em> — nicht für
          Page-Wrapper. Als Tailwind-Utility direkt verfügbar:&nbsp;
          <code className="font-mono text-sm">max-w-xxs</code> bis&nbsp;
          <code className="font-mono text-sm">max-w-xxl</code>.
        </p>

        {/* Visuelle Demo: aufsteigende Breiten */}
        <div className="mb-10 space-y-2.5 rounded-lg border border-dashed border-border bg-muted/30 p-6">
          {MAXW_SIZES.map((m) => (
            <div key={m.name}>
              <div className="mb-1 flex items-baseline justify-between font-mono text-[11px] text-muted-foreground">
                <span>
                  <strong className="text-foreground">{m.utility}</strong>
                  &nbsp;· {m.hint}
                </span>
                <span>
                  {m.rem} · {m.px}
                </span>
              </div>
              <div
                className="h-6 rounded-sm"
                style={{
                  width: `var(${m.cssVar})`,
                  maxWidth: "100%",
                  background: "var(--color-brand-500)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Token-Tabelle */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full font-mono text-xs">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Size</th>
                <th className="px-4 py-2 font-medium">CSS Variable</th>
                <th className="px-4 py-2 font-medium">Tailwind</th>
                <th className="px-4 py-2 font-medium">Wert</th>
                <th className="px-4 py-2 font-medium">Typischer Einsatz</th>
              </tr>
            </thead>
            <tbody>
              {MAXW_SIZES.map((m) => (
                <tr key={m.name} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.cssVar}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.utility}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {m.rem} · {m.px}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{m.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <pre className="mt-8 overflow-x-auto rounded-lg border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed">
{`// Textblock auf Lesbarkeits-Breite begrenzen
<p className="max-w-lg">…</p>

// Form auf typische Input-Breite
<form className="max-w-xs">…</form>

// Innerhalb eines Containers
<Container size="lg">
  <h2>Überschrift</h2>
  <p className="max-w-md">Unterzeile nur halb so breit.</p>
</Container>`}
        </pre>
      </Section>

      {/* ── 09 Shadows ─────────────────────────────────────── */}
      <Section id="shadows" number="09" title="Shadows">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {SHADOW_SCALE.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-4">
              <div
                className={`h-24 w-full rounded-lg bg-card ${s.className}`}
              />
              <code className="font-mono text-xs text-muted-foreground">
                {s.token}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 10 Animationen ─────────────────────────────────── */}
      <Section id="animationen" number="10" title="Animationen">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Custom-Keyframes aus&nbsp;
          <code className="font-mono text-sm">globals.css</code>.
        </p>
        <div className="flex flex-wrap items-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-20 w-20 animate-pulse-slow rounded-full"
              style={{ background: "var(--color-brand-500)" }}
            />
            <code className="font-mono text-xs text-muted-foreground">
              animate-pulse-slow
            </code>
            <span className="text-xs text-muted-foreground">
              2s ease-in-out infinite
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 animate-pulse rounded-full bg-muted-foreground/40" />
            <code className="font-mono text-xs text-muted-foreground">
              animate-pulse
            </code>
            <span className="text-xs text-muted-foreground">Tailwind default</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-border border-t-foreground" />
            <code className="font-mono text-xs text-muted-foreground">
              animate-spin
            </code>
            <span className="text-xs text-muted-foreground">Tailwind default</span>
          </div>
        </div>
      </Section>

      {/* ── 11 Components ──────────────────────────────────── */}
      <Section id="components" number="11" title="Components">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Aktuell installierte shadcn/ui-Components. Weitere können per&nbsp;
          <code className="font-mono text-sm">npx shadcn@latest add &lt;name&gt;</code>&nbsp;
          ergänzt werden.
        </p>

        <SubSection title="Button · Matrix (5 Varianten × 2 Sizes × 3 Icon-Modi)">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted/50">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-10 border-b border-border bg-muted/50 px-5 py-3 text-left align-bottom"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Variant
                    </span>
                  </th>
                  {BUTTON_SIZES.map((size) => (
                    <th
                      key={size}
                      colSpan={3}
                      className="border-b border-l border-border px-5 py-3 text-center"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {size}
                      </span>
                    </th>
                  ))}
                </tr>
                <tr className="bg-muted/30">
                  {BUTTON_SIZES.map((size) =>
                    (["ohne", "leading", "trailing"] as const).map((mode, i) => (
                      <th
                        key={`${size}-${mode}`}
                        className={`border-b border-border px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground ${
                          i === 0 ? "border-l" : ""
                        }`}
                      >
                        {mode}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {BUTTON_VARIANTS.map((v) => (
                  <tr key={v.name} className="border-t border-border">
                    <td className="sticky left-0 z-10 border-b border-border bg-card px-5 py-5 align-middle">
                      <div className="font-mono text-sm font-medium">
                        {v.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {v.description}
                      </div>
                    </td>
                    {BUTTON_SIZES.map((size) =>
                      (["ohne", "leading", "trailing"] as const).map(
                        (mode, i) => (
                          <td
                            key={`${v.name}-${size}-${mode}`}
                            className={`border-b border-border px-3 py-5 text-center align-middle ${
                              i === 0 ? "border-l" : ""
                            }`}
                          >
                            <Button
                              variant={v.name}
                              size={size}
                              leadingIcon={
                                mode === "leading" ? <Plus /> : undefined
                              }
                              trailingIcon={
                                mode === "trailing" ? <ArrowRight /> : undefined
                              }
                            >
                              {v.name === "link" ? "Mehr erfahren" : "Aktion"}
                            </Button>
                          </td>
                        ),
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection title="Button · States">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StateCell label="Default">
              <Button leadingIcon={<Download />}>Herunterladen</Button>
            </StateCell>
            <StateCell label="Disabled">
              <Button leadingIcon={<Download />} disabled>
                Herunterladen
              </Button>
            </StateCell>
            <StateCell label="Destructive (via trailing)">
              <Button variant="alternate" trailingIcon={<Trash2 />}>
                Löschen
              </Button>
            </StateCell>
          </div>
        </SubSection>

        <SubSection title="Button · Link-Variante inline">
          <p className="max-w-2xl text-base text-muted-foreground">
            Wenn du im Fließtext auf eine Unterseite verweisen willst, nutz
            die Link-Variante. Sie rendert ohne Padding/Height und verhält
            sich wie ein normaler Text-Link —&nbsp;
            <Button variant="link" trailingIcon={<ArrowRight />}>
              zu den Referenzprojekten
            </Button>
            &nbsp;— mitten im Satz.
          </p>
        </SubSection>

        <SubSection title="Button · Code-Beispiele">
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed text-foreground">
{`// Primary CTA mit Trailing-Icon
<Button variant="primary" trailingIcon={<ArrowRight />}>
  Jetzt konfigurieren
</Button>

// Kleiner Secondary-Button mit Leading-Icon
<Button variant="secondary" size="small" leadingIcon={<Plus />}>
  Neue Anfrage
</Button>

// Outline / Alternate
<Button variant="alternate">Abbrechen</Button>

// Ghost / Tertiary
<Button variant="tertiary" size="small">Zurück</Button>

// Inline-Link
<Button variant="link" trailingIcon={<ArrowRight />}>
  Mehr erfahren
</Button>`}
          </pre>
        </SubSection>


        <SubSection title="Pill Button · Variants × Sizes">
          <p className="mb-8 max-w-2xl text-base text-muted-foreground">
            Der &bdquo;fette&ldquo; Signature-Button der Seite. Vier Varianten,
            vier Sizes &mdash; die brand-farbene Badge ist die visuelle
            Signatur und bleibt bei drei Varianten erhalten. Nur{" "}
            <code className="font-mono text-xs">secondary</code> kehrt sie um
            (brand-Pill + schwarzer Badge), weil der Pill sonst mit sich selbst
            konkurrieren würde.
          </p>

          {/* Matrix 1: Variants × Sizes (alles trailing) */}
          <div className="mb-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 border-b border-border bg-muted/50 px-5 py-3 text-left">
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Variant
                    </span>
                  </th>
                  {PILL_BUTTON_SIZES.map((s) => (
                    <th
                      key={s.size}
                      className="border-b border-l border-border px-5 py-3 text-center"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {s.size}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PILL_BUTTON_VARIANTS.map((v) => (
                  <tr key={v.variant} className="border-t border-border">
                    <td className="sticky left-0 z-10 border-b border-border bg-card px-5 py-7 align-middle">
                      <div className="font-mono text-sm font-medium">
                        {v.variant}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {v.hint}
                      </div>
                    </td>
                    {PILL_BUTTON_SIZES.map((s) => (
                      <td
                        key={`${v.variant}-${s.size}`}
                        className="border-b border-l border-border px-5 py-7 text-center align-middle"
                      >
                        <PillButton
                          href="#"
                          variant={v.variant}
                          size={s.size}
                        >
                          Starten
                        </PillButton>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Variant-Token-Tabelle */}
          <div className="mb-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full font-mono text-xs">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Variant</th>
                  <th className="px-4 py-2 font-medium">Pill</th>
                  <th className="px-4 py-2 font-medium">Label</th>
                  <th className="px-4 py-2 font-medium">Badge</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">primary</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-black-950
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    text-white-100
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-brand-500 / text-black-950
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">secondary</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-brand-500
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    text-black-950
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-black-950 / text-brand-500
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">alternate</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    transparent + border-black-950 · hover: bg-black-950
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    text-black-950 → white
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-brand-500 / text-black-950
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">tertiary</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    transparent · hover: bg-black-100
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    text-black-950
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    bg-brand-500 / text-black-950
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Size-Token-Tabelle */}
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Size-Specs
          </h3>
          <div className="mb-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full font-mono text-xs">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Size</th>
                  <th className="px-4 py-2 font-medium">Label</th>
                  <th className="px-4 py-2 font-medium">Einsatz</th>
                  <th className="px-4 py-2 font-medium">Spec (trailing)</th>
                </tr>
              </thead>
              <tbody>
                {PILL_BUTTON_SIZES.map((s) => (
                  <tr key={s.size} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{s.size}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {s.label}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{s.hint}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {s.specs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection title="Pill Button · Icon-Positionen (Sizes × trailing / leading / none)">
          <p className="mb-8 max-w-2xl text-base text-muted-foreground">
            Badge-Position und Padding sind gekoppelt. Beim Hover macht der
            Pfeil einen kleinen Ruck in Leserichtung &mdash; nach rechts bei{" "}
            <code className="font-mono text-xs">trailing</code>, nach links bei{" "}
            <code className="font-mono text-xs">leading</code>. Matrix auf
            Brand-Flaeche (Production-Kontext).
          </p>

          {/* Matrix 2: Sizes × IconPosition (nur primary) */}
          <div
            className="relative mb-8 overflow-hidden rounded-xl border border-border"
            style={{ background: "var(--color-brand-500)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--color-black-950) 0px, var(--color-black-950) 1px, transparent 1px, transparent 14px)",
              }}
            />
            <div className="relative overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-brand-500/95 px-5 py-4 text-left backdrop-blur-sm">
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-950/60">
                        Size
                      </span>
                    </th>
                    {(["trailing", "leading", "none"] as const).map((pos) => (
                      <th key={pos} className="px-5 py-4 text-center">
                        <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-950/60">
                          {pos}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PILL_BUTTON_SIZES.map((s) => (
                    <tr key={s.size}>
                      <td className="sticky left-0 z-10 bg-brand-500/95 px-5 py-6 align-middle backdrop-blur-sm">
                        <div className="font-mono text-sm font-medium text-black-950">
                          {s.size}
                        </div>
                      </td>
                      {(["trailing", "leading", "none"] as const).map((pos) => (
                        <td
                          key={`${s.size}-${pos}`}
                          className="px-5 py-6 text-center align-middle"
                        >
                          <PillButton
                            href="#"
                            size={s.size}
                            iconPosition={pos}
                          >
                            Konfigurator starten
                          </PillButton>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom-Icon-Demo */}
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Custom Icon (Badge akzeptiert jedes lucide-react Icon)
          </h3>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <StateCell label="Default (ArrowRight)">
              <PillButton href="#" size="lg">
                Jetzt starten
              </PillButton>
            </StateCell>
            <StateCell label="Custom (Sparkles)">
              <PillButton href="#" size="lg" icon={<Sparkles />}>
                Neu entdecken
              </PillButton>
            </StateCell>
          </div>

          {/* Code-Beispiele */}
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-5 font-mono text-xs leading-relaxed text-foreground">
{`// Standard (primary + trailing): als Next.js Link
<PillButton href="/konfigurator" size="xl">
  Konfigurator starten
</PillButton>

// Secondary: inverted für helle Flächen
<PillButton variant="secondary" href="/kontakt" size="lg">
  Termin vereinbaren
</PillButton>

// Alternate: outline für "nebenan"-Actions
<PillButton variant="alternate" href="/agb" size="md">
  Details lesen
</PillButton>

// Tertiary: ghost für minimale Präsenz in dichten Layouts
<PillButton variant="tertiary" href="/faq" size="sm">
  Mehr Fragen
</PillButton>

// Badge links (z. B. "zurück zu ...")
<PillButton href="/uebersicht" size="md" iconPosition="leading" icon={<ArrowLeft />}>
  Zur Übersicht
</PillButton>

// Ohne Badge (reiner Text-Pill)
<PillButton href="/kontakt" size="sm" iconPosition="none">
  Anfragen
</PillButton>

// Custom Icon statt Default-ArrowRight
import { Sparkles } from "lucide-react";
<PillButton href="/neu" size="lg" icon={<Sparkles />}>
  Neu entdecken
</PillButton>

// Als <button> mit onClick (kein href)
<PillButton size="md" onClick={() => openModal()}>
  Termin vereinbaren
</PillButton>`}
          </pre>
        </SubSection>

        <SubSection title="Badge · Varianten">
          <div className="flex flex-wrap gap-3">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
        </SubSection>

        <SubSection title="Form (noch nicht als shadcn-Component installiert)">
          <div className="space-y-3 rounded-lg border border-dashed border-border p-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Eingabefeld (nativ + Tailwind)
              </span>
              <input
                type="text"
                placeholder="z. B. Breite in mm"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              TODO: <code className="font-mono">npx shadcn@latest add input label select textarea</code>
            </p>
          </div>
        </SubSection>
      </Section>

      {/* ── 12 Gap-Analyse ─────────────────────────────────── */}
      <Section id="gaps" number="12" title="Gap-Analyse">
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Was noch offen ist, bevor aus dem Setup ein vollständiges
          Brand-Design wird:
        </p>
        <ul className="space-y-4">
          {[
            {
              label: "Brand-Palette an Semantic-Tokens koppeln",
              detail:
                "Aktuell zeigt --color-primary noch auf Default-Schwarz. Sollte auf --color-brand-500 (oder brand-900, je nach Gewicht) verweisen, damit shadcn-Components die Brand-Farbe nutzen.",
            },
            {
              label: "Display-Font",
              detail:
                "Body läuft auf system-ui. Für Headings fehlt eine eigenständige Display-Schrift (z. B. Serif für Luxus-Vibe oder eine markante Sans).",
            },
            {
              label: "Dark Mode",
              detail:
                "Keine .dark-Variante in globals.css. Die White-Scale ist aber bereits dafür vorbereitet.",
            },
            {
              label: "Typografie-Skala",
              detail:
                "Nur Tailwind-Defaults. Ein definierter Modular-Scale (z. B. 1.25er) würde Hierarchie stabiler machen.",
            },
            {
              label: "Fehlende shadcn-Components",
              detail:
                "Input, Label, Select, Dialog, Card, Tabs, Tooltip, Toast — für Konfigurator und Kundenbereich relevant.",
            },
            {
              label: "Icon-System",
              detail:
                "lucide-react ist installiert; Konventionen für Grössen/Stroke sollten hier dokumentiert werden.",
            },
          ].map((g) => (
            <li
              key={g.label}
              className="flex gap-4 rounded-lg border border-border bg-card p-5"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: "var(--color-brand-500)" }}
                aria-hidden
              />
              <div>
                <strong className="block text-base font-semibold">
                  {g.label}
                </strong>
                <span className="text-sm text-muted-foreground">
                  {g.detail}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <footer className="mt-24 border-t border-border pt-8 font-mono text-xs text-muted-foreground">
        Generiert aus den aktuellen Token-Definitionen in&nbsp;
        <code>globals.css</code>&nbsp;—&nbsp;
        ändere dort, die Styleguide aktualisiert sich automatisch.
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   Presentational helpers
   ───────────────────────────────────────────────────────────── */

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-24 scroll-mt-8">
      <div className="mb-10 flex items-baseline gap-6 border-b border-border pb-4">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {number}
        </span>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* Palette-Row: visualisiert eine komplette Skala inklusive Labels */
function PaletteBlock({
  name,
  description,
  utilityPrefix,
  stops,
  previewBg,
  forceLightLabels,
  highlightWeight,
}: {
  name: string;
  description: string;
  utilityPrefix: string;
  stops: PaletteStop[];
  previewBg?: string; // Hintergrund hinter transparenten Stufen
  forceLightLabels?: boolean; // für White-Overlay Preview
  highlightWeight?: string;
}) {
  return (
    <div className="mb-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
        <code className="font-mono text-xs text-muted-foreground">
          {utilityPrefix}
          {"{weight}"}
        </code>
      </div>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        {description}
      </p>

      {/* Horizontale Farbstreifen-Leiste */}
      <div
        className="flex overflow-hidden rounded-lg border border-border"
        style={previewBg ? { background: previewBg } : undefined}
      >
        {stops.map((s) => {
          const isHighlight = highlightWeight === s.weight;
          return (
            <div
              key={s.weight}
              className="group relative flex-1"
              style={{ background: `var(${s.cssVar})` }}
              title={`${utilityPrefix}${s.weight} · ${s.value}`}
            >
              <div
                className={`flex h-20 flex-col justify-between p-2 font-mono text-[10px] ${
                  s.dark || forceLightLabels
                    ? "text-white/90"
                    : "text-black/70"
                }`}
              >
                <span className="tabular-nums">{s.weight}</span>
                {isHighlight && (
                  <span className="self-start rounded bg-white/20 px-1 py-0.5 text-[9px] uppercase tracking-wider">
                    Base
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Token-Tabelle darunter */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full font-mono text-xs">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Weight</th>
              <th className="px-4 py-2 font-medium">CSS Variable</th>
              <th className="px-4 py-2 font-medium">Tailwind</th>
              <th className="px-4 py-2 font-medium">Wert</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s) => (
              <tr key={s.weight} className="border-t border-border">
                <td className="px-4 py-2 font-medium tabular-nums">
                  {s.weight}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{s.cssVar}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {utilityPrefix}
                  {s.weight}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  cssVar,
  hsl,
  tailwind,
  onDark,
}: {
  name: string;
  cssVar: string;
  hsl: string;
  tailwind: string;
  onDark?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="flex h-24 items-end justify-end p-3"
        style={{ background: `var(${cssVar})` }}
      >
        <code
          className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
            onDark
              ? "bg-white/15 text-white"
              : "bg-black/5 text-foreground/70"
          }`}
        >
          {hsl}
        </code>
      </div>
      <div className="space-y-1 p-4">
        <div className="font-mono text-sm font-medium">{name}</div>
        <div className="font-mono text-xs text-muted-foreground">{cssVar}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {tailwind}
        </div>
      </div>
    </div>
  );
}

function TokenRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function TypeSpecimen({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function StateCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6">
      {children}
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function PaddingStep({
  breakpoint,
  query,
  value,
}: {
  breakpoint: string;
  query: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {breakpoint}
      </div>
      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
        {query}
      </div>
      <div className="mt-3 font-mono text-base font-medium tabular-nums">
        {value}
      </div>
    </div>
  );
}
