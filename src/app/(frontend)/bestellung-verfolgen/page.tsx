import Link from "next/link";
import { Container } from "@/components/layout/container";
import { TrackingForm } from "@/components/tracking/tracking-form";

export const metadata = {
  title: "Bestellung verfolgen · Muster Fenster",
  description:
    "Status deiner Bestellung per Anfrage-Nummer und E-Mail — auch ohne Kundenkonto.",
};

export const dynamic = "force-dynamic";

export default function BestellungVerfolgenPage() {
  return (
    <Container size="xl">
      <div className="grid grid-cols-1 gap-16 py-20 md:py-28 lg:grid-cols-12 lg:gap-20 lg:py-32">
        {/* Links: Editorial Intro */}
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
            Service
          </p>
          <h1 className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl">
            Bestellung
            <br />
            verfolgen.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-black-600">
            Gib deine Anfrage-Nummer und die E-Mail-Adresse ein, mit der du die
            Anfrage gestellt hast. Ohne Login, ohne Kundenkonto.
          </p>

          <div className="mt-12 border-t border-black-200 pt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
              Du hast ein Konto?
            </p>
            <Link
              href="/anmelden"
              className="group mt-3 inline-flex items-baseline gap-2 font-heading text-xl tracking-tight text-black-950 transition-colors hover:text-brand-700 md:text-2xl"
            >
              <span>Im Kundenbereich ansehen</span>
              <span
                aria-hidden
                className="translate-y-[-2px] font-mono text-xs text-black-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600 group-hover:opacity-100"
              >
                →
              </span>
            </Link>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-4 font-mono text-sm">
            <dt className="text-black-500">01</dt>
            <dd className="text-black-800">Aktueller Status der Anfrage</dd>
            <dt className="text-black-500">02</dt>
            <dd className="text-black-800">Kompletter Verlauf mit Zeitstempel</dd>
            <dt className="text-black-500">03</dt>
            <dd className="text-black-800">Produkte und Gesamtpreis</dd>
          </dl>
        </div>

        {/* Rechts: Tracking-Form */}
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="mx-auto max-w-xl lg:mx-0">
            <TrackingForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
