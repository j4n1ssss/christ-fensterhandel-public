import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

interface PagePlaceholderProps {
  /** Page-Titel (H1). */
  title: string;
  /** Kurze Beschreibung unter dem Titel. */
  description?: string;
  /** Breadcrumb-Segmente, werden mit · verbunden. */
  breadcrumb?: readonly string[];
  /** Haupt-CTA. Default: Konfigurator. */
  cta?: { label: string; href: string };
}

/**
 * Minimales Platzhalter-Layout für neu angelegte Sitemap-Routes.
 * Zentriert, editorial, nutzt Design-Tokens (black/brand) und signalisiert
 * unten deutlich, dass die Seite noch im Aufbau ist.
 */
export function PagePlaceholder({
  title,
  description,
  breadcrumb,
  cta = { label: "Zum Konfigurator", href: "/konfigurator" },
}: PagePlaceholderProps) {
  return (
    <Container size="md">
      <div className="py-24 md:py-32 lg:py-40">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-black-500"
          >
            {breadcrumb.join(" · ")}
          </nav>
        )}

        <h1 className="text-5xl font-semibold tracking-tight text-black-950 md:text-6xl">
          {title}
        </h1>

        {description && (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-black-600">
            {description}
          </p>
        )}

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" asChild>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
          <Button variant="tertiary" asChild>
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>

        <div className="mt-20 inline-flex items-center gap-2.5 rounded-full border border-dashed border-black-300 bg-black-50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-black-600">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-pulse-slow rounded-full bg-brand-500"
          />
          In Entwicklung
        </div>
      </div>
    </Container>
  );
}
