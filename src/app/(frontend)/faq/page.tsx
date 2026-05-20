import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { SectionDivider } from "@/components/marketing/section-divider";
import { PillButton } from "@/components/ui/pill-button";
import { FaqExplorer } from "@/components/faq/faq-explorer";
import { getFaqStats } from "@/components/faq/faq-data";

export const metadata: Metadata = {
  title: "Häufige Fragen · Muster Fenster",
  description:
    "Antworten zu Konfigurator, Bestellung, Lieferung, Montage und Garantie — Fenster und Türen aus Musterstadt.",
};

/**
 * /faq — Wissensbibliothek der Website.
 *
 * Struktur (Homepage-Rhythmus):
 *   1. Editorial Hero (weiss) — 4/8-Grid, Eyebrow + H1 + Metadata
 *   2. FAQ-Explorer (weiss) — Command-Bar + Accordion-Gruppen
 *   3. Kontakt-CTA (black-950) — Signature-End-Stripe mit invertierter
 *      SectionDivider, Telefon/Email/Link.
 */
export default function FaqPage() {
  const stats = getFaqStats();
  const lastUpdated = "22. April 2026";

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <MarketingHero
        breadcrumb={[
          { label: "Start", href: "/" },
          { label: "Service" },
          { label: "FAQ" },
        ]}
        eyebrow="Wissensbibliothek"
        headline={
          <>
            Häufige
            <br />
            Fragen —
          </>
        }
        headlineHighlight="klare Antworten."
        body="Von der ersten Konfiguration bis zum Ersatzteil nach zehn Jahren — hier steht, was Kunden uns am häufigsten fragen. Nichts passendes dabei? Dann einfach direkt melden."
        stats={[
          {
            label: "Fragen",
            value: stats.totalQuestions.toString().padStart(2, "0"),
          },
          {
            label: "Kategorien",
            value: stats.totalCategories.toString().padStart(2, "0"),
          },
          { label: "Stand", value: lastUpdated },
        ]}
      />

      {/* ═══════ EXPLORER ═══════ */}
      <section className="relative bg-white pb-24 md:pb-32 lg:pb-40">
        <Container size="xl">
          <FaqExplorer />
        </Container>
      </section>

      {/* ═══════ KONTAKT-CTA ═══════ */}
      <section className="relative overflow-hidden bg-black-950 py-24 md:py-32 lg:py-40">
        <SectionDivider invert />

        {/* Dezente Brand-Atmosphäre — grosser weicher Blob unten links */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-500/10 blur-3xl md:-bottom-56 md:-left-56 md:h-[48rem] md:w-[48rem]"
        />

        <Container size="xl" className="relative">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
                Direkter Draht
              </p>
              <h2 className="mt-6 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-white-100 md:mt-8 md:text-5xl lg:text-6xl">
                Frage nicht dabei?
                <br />
                <span className="text-white-60">Wir sind am Apparat.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white-80 md:mt-8 md:text-lg">
                Persönliche Beratung, unverbindlich, auf Deutsch oder Polnisch.
                Wir antworten auf E-Mails am selben Werktag — in dringenden
                Fällen greif einfach zum Telefon.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
                <PillButton href="/kontakt" variant="secondary" size="lg">
                  Kontaktformular öffnen
                </PillButton>
                <Link
                  href="tel:+4933816000"
                  className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white-80 transition-colors hover:text-brand-400"
                >
                  Oder direkt anrufen
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="divide-y divide-white-10 border-y border-white-10">
                <ContactRow
                  icon={<Phone className="size-4" aria-hidden />}
                  label="Telefon"
                  primary="+49 (0)3381 6000"
                  meta="Mo–Fr · 8 – 17 Uhr"
                  href="tel:+4933816000"
                />
                <ContactRow
                  icon={<Mail className="size-4" aria-hidden />}
                  label="E-Mail"
                  primary="info@example.com"
                  meta="Antwort am selben Werktag"
                  href="mailto:info@example.com"
                />
                <ContactRow
                  icon={<ArrowRight className="size-4" aria-hidden />}
                  label="Showroom"
                  primary="Musterstadt"
                  meta="Nach Terminvereinbarung"
                  href="/kontakt"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ──────────── Editorial Mini-Components ──────────── */

function ContactRow({
  icon,
  label,
  primary,
  meta,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  meta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 py-6 transition-colors hover:bg-white-5 md:py-7"
    >
      <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white-20 text-white-60 transition-colors group-hover:border-brand-400 group-hover:text-brand-400">
        {icon}
      </span>
      <div className="flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white-40">
          {label}
        </p>
        <p className="mt-1.5 font-heading text-lg font-medium leading-tight tracking-tight text-white-100 transition-colors group-hover:text-brand-400 md:text-xl">
          {primary}
        </p>
        <p className="mt-1 text-sm text-white-60">{meta}</p>
      </div>
      <ArrowRight
        className="size-4 shrink-0 translate-y-1 text-white-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-400"
        aria-hidden
      />
    </Link>
  );
}
