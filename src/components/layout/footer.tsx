import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";

/**
 * Footer-Navigation nach Sitemap.
 * Hardcoded — bewusst nicht aus Payload, um Struktur und Code synchron zu
 * halten. Firmenangaben sind Dummy-Daten (Demo-Setup).
 */

const PRODUCT_LINKS = [
  { label: "Kunststoff-Fenster", href: "/produkte/fenster" },
  { label: "Aluminium-Fenster", href: "/produkte/aluminium-fenster" },
  { label: "Holz-Fenster", href: "/produkte/holz-fenster" },
  { label: "Haustüren", href: "/produkte/haustueren" },
  { label: "Balkontüren", href: "/produkte/balkontueren" },
  { label: "Schiebetüren", href: "/produkte/schiebetueren" },
  { label: "Rollläden", href: "/produkte/rolllaeden" },
  { label: "Zubehör", href: "/produkte/zubehoer" },
] as const;

const SERVICE_LINKS = [
  { label: "Kontakt", href: "/kontakt" },
  { label: "Versand & Lieferung", href: "/versand-lieferung" },
  { label: "FAQ", href: "/faq" },
  { label: "Bestellung verfolgen", href: "/bestellung-verfolgen" },
  { label: "Warenkorb", href: "/warenkorb" },
  { label: "Galerie", href: "/galerie" },
] as const;

const COMPANY_LINKS = [
  { label: "Über uns", href: "/ueber-uns" },
  { label: "DRUTEX Partnerschaft", href: "/ueber-uns/drutex" },
  { label: "Konfigurator", href: "/konfigurator" },
] as const;

const LEGAL_LINKS = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Widerruf", href: "/widerruf" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-black-950 text-white-80"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <Container size="xl">
        <div className="py-16 md:py-20">
          {/* ── Hauptbereich ──────────────────────────────── */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand & Kontakt */}
            <div className="lg:col-span-4">
              <Link
                href="/"
                aria-label="Muster Fenster · Startseite"
                className="inline-block transition-opacity hover:opacity-80"
              >
                <span className="font-heading text-xl font-semibold tracking-tight text-white-100">
                  Muster Fenster
                </span>
              </Link>

              <address className="mt-8 not-italic text-sm leading-relaxed text-white-60">
                Muster Fenster
                <br />
                Musterstraße 1
                <br />
                12345 Musterstadt
              </address>

              <dl className="mt-6 space-y-2 font-mono text-xs text-white-60">
                <div className="flex gap-3">
                  <dt className="w-12 text-white-40">Tel</dt>
                  <dd>
                    <a
                      href="tel:+4930000000000"
                      className="transition-colors hover:text-brand-400"
                    >
                      030 000 000 00
                    </a>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 text-white-40">Mail</dt>
                  <dd>
                    <a
                      href="mailto:info@example.com"
                      className="transition-colors hover:text-brand-400"
                    >
                      info@example.com
                    </a>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 text-white-40">Zeit</dt>
                  <dd>Mo–Fr · 09–17 Uhr</dd>
                </div>
              </dl>
            </div>

            {/* Produkte */}
            <FooterColumn title="Produkte" links={PRODUCT_LINKS} className="lg:col-span-3" />

            {/* Service */}
            <FooterColumn title="Service" links={SERVICE_LINKS} className="lg:col-span-3" />

            {/* Unternehmen */}
            <FooterColumn title="Unternehmen" links={COMPANY_LINKS} className="lg:col-span-2" />
          </div>

          {/* ── Bottom-Leiste ─────────────────────────────── */}
          <div className="mt-16 flex flex-col gap-6 border-t border-white-10 pt-8 md:flex-row md:items-center md:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white-40">
              © {currentYear} Muster Fenster · Alle Rechte vorbehalten
            </p>
            <nav
              aria-label="Rechtliches"
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-white-60 transition-colors hover:text-brand-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white-95">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white-60 transition-colors hover:text-brand-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
