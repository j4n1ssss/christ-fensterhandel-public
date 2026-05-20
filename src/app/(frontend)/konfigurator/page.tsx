import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";

type KonfiguratorCard = {
  title: string;
  description: string;
  href: string;
  available: boolean;
  icon: React.ReactNode;
};

const KONFIGURATOR_CARDS: KonfiguratorCard[] = [
  {
    title: "Fenster",
    description:
      "Material, Verglasung, Farben, Maße und Extras — Schritt für Schritt zum Wunschfenster.",
    href: "/konfigurator/fenster",
    available: true,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="64" height="64" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <line x1="40" y1="8" x2="40" y2="72" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="40" x2="72" y2="40" stroke="currentColor" strokeWidth="2" />
        <circle cx="36" cy="44" r="2" fill="currentColor" />
        <circle cx="44" cy="44" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Türen",
    description:
      "Haustür, Balkontür oder Nebeneingangstür — individuell konfiguriert nach deinen Anforderungen.",
    href: "/konfigurator/tueren",
    available: false,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16"
        aria-hidden="true"
      >
        <rect x="16" y="4" width="48" height="72" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="52" cy="42" r="2.5" fill="currentColor" />
        <rect x="24" y="12" width="32" height="24" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Rollläden",
    description:
      "Aufsatz-, Unterputz- oder Vorsatzrollläden für optimalen Sonnen- und Sichtschutz.",
    href: "/konfigurator/rolllaeden",
    available: false,
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-16 w-16"
        aria-hidden="true"
      >
        <rect x="8" y="16" width="64" height="56" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="8" y="8" width="64" height="12" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <line x1="12" y1="28" x2="68" y2="28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="36" x2="68" y2="36" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="44" x2="68" y2="44" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function KonfiguratorLandingPage() {
  return (
    <Container size="lg">
      <div className="pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Hero */}
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-black-500">
            Konfigurator
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-black-950 md:text-6xl">
            Was möchtest du konfigurieren?
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-black-600">
            Wähle eine Produktkategorie. Du wirst durch alle Optionen geführt —
            Material, Maße, Verglasung, Farben, Beschläge und Extras. Die
            Konfiguration kannst du jederzeit speichern und später fortsetzen.
          </p>
        </div>

        {/* Auswahl-Karten */}
        <section
          aria-labelledby="auswahl-heading"
          className="mt-16 md:mt-20"
        >
          <h2 id="auswahl-heading" className="sr-only">
            Produkt-Auswahl
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {KONFIGURATOR_CARDS.map((card) => (
              <ConfiguratorCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* Unterstützende Info unten */}
        <div className="mt-16 grid grid-cols-1 gap-6 rounded-xl border border-black-200 bg-black-50 p-8 md:grid-cols-3 md:p-10">
          <InfoBlock
            kicker="01"
            title="Kostenlos unverbindlich"
            body="Konfiguriere ohne Anmeldung. Preisangaben sind unverbindlich, finale Kalkulation erfolgt durch uns."
          />
          <InfoBlock
            kicker="02"
            title="Anfrage oder Kauf"
            body="Am Ende entscheidest du: Angebot anfordern, direkt beauftragen oder später fortsetzen."
          />
          <InfoBlock
            kicker="03"
            title="Fachberatung jederzeit"
            body={
              <>
                Unsicher bei der Auswahl? Wir beraten gerne —{" "}
                <Link
                  href="/kontakt"
                  className="underline underline-offset-4 transition-colors hover:text-brand-700"
                >
                  Kontakt aufnehmen
                </Link>
                .
              </>
            }
          />
        </div>
      </div>
    </Container>
  );
}

/* ─────────────────────────────────────────────────────────────
   Presentational Components
   ───────────────────────────────────────────────────────────── */

function ConfiguratorCard({ card }: { card: KonfiguratorCard }) {
  const isAvailable = card.available;

  const content = (
    <div
      className={`group relative flex h-full flex-col rounded-xl border bg-white p-8 transition-all ${
        isAvailable
          ? "border-black-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_16px_40px_-12px_rgba(226,157,73,0.25)]"
          : "cursor-not-allowed border-dashed border-black-200 opacity-60"
      }`}
    >
      {/* Badge oben rechts */}
      {!isAvailable && (
        <span className="absolute right-5 top-5 rounded-full bg-black-100 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-black-600">
          Bald verfügbar
        </span>
      )}

      {/* Icon in einem Kasten, Brand-tönung bei available */}
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-lg transition-colors ${
          isAvailable
            ? "bg-brand-50 text-black-900 group-hover:bg-brand-100"
            : "bg-black-100 text-black-400"
        }`}
      >
        {card.icon}
      </div>

      <h3 className="text-2xl font-semibold tracking-tight text-black-950">
        {card.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-black-600">
        {card.description}
      </p>

      {isAvailable && (
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition-all group-hover:gap-3">
          Konfiguration starten
          <ArrowRight className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );

  return isAvailable ? (
    <Link href={card.href} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}

function InfoBlock({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div>
      <span className="font-mono text-[11px] tabular-nums uppercase tracking-[0.2em] text-brand-600">
        {kicker}
      </span>
      <h3 className="mt-3 text-base font-semibold text-black-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-black-600">{body}</p>
    </div>
  );
}
