import { redirect } from "next/navigation";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { DashboardAnfragenList } from "@/components/dashboard/anfragen-list";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard · Muster Fenster",
  description:
    "Dein Kundenbereich. Bestellungen, gespeicherte Konfigurationen und Profil-Einstellungen auf einen Blick.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.rolle !== "kunde") {
    redirect("/anmelden");
  }

  const payload = await getPayload({ config });
  const { docs: anfragen } = await payload.find({
    collection: "anfragen",
    where: {
      "kontaktdaten.email": { equals: user.email },
    },
    sort: "-createdAt",
    limit: 100,
  });

  const name = user.vorname || user.email.split("@")[0];
  const offene = anfragen.filter(
    (a) =>
      a.status !== "abgeschlossen" &&
      a.status !== "geliefert" &&
      a.status !== "storniert" &&
      a.status !== "abgelehnt",
  ).length;

  return (
    <Container size="xl">
      <div className="py-20 md:py-24 lg:py-28">
        {/* Header-Zeile */}
        <div className="flex flex-col gap-6 border-b border-black-200 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">
              Kundenbereich
            </p>
            <h1 className="mt-4 font-heading text-4xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-5xl lg:text-6xl">
              Hallo, {name}.
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* Stat-Zeile */}
        <dl className="mt-10 grid grid-cols-2 gap-8 border-b border-black-100 pb-10 sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
              Anfragen gesamt
            </dt>
            <dd className="mt-3 font-heading text-4xl font-medium tabular-nums text-black-950 md:text-5xl">
              {anfragen.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
              Offen
            </dt>
            <dd className="mt-3 font-heading text-4xl font-medium tabular-nums text-black-950 md:text-5xl">
              {offene}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
              Neue Anfrage
            </dt>
            <dd className="mt-3">
              <Link
                href="/konfigurator"
                className={cn(
                  buttonVariants({ variant: "primary", size: "normal" }),
                )}
              >
                Konfigurator starten
                <ArrowRight aria-hidden />
              </Link>
            </dd>
          </div>
        </dl>

        {/* Anfragen-Liste */}
        <section aria-labelledby="anfragen-heading" className="mt-14">
          <div className="mb-6 flex items-baseline justify-between">
            <h2
              id="anfragen-heading"
              className="font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl"
            >
              Deine Anfragen
            </h2>
            {anfragen.length > 0 && (
              <span className="font-mono text-xs text-black-500">
                Sortiert nach neuesten zuerst
              </span>
            )}
          </div>

          <DashboardAnfragenList anfragen={anfragen} />
        </section>

        {/* Footer-Links */}
        <div className="mt-16 grid gap-6 border-t border-black-200 pt-10 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/bestellung-verfolgen"
            className="group block border border-black-200 p-6 transition-colors hover:bg-black-50"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
              Service
            </p>
            <p className="mt-3 font-heading text-lg tracking-tight text-black-950 transition-colors group-hover:text-brand-700">
              Bestellung verfolgen
            </p>
            <p className="mt-1.5 text-xs text-black-500">
              Ohne Login, per Anfrage-Nummer
            </p>
          </Link>
          <Link
            href="/warenkorb"
            className="group block border border-black-200 p-6 transition-colors hover:bg-black-50"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
              Warenkorb
            </p>
            <p className="mt-3 font-heading text-lg tracking-tight text-black-950 transition-colors group-hover:text-brand-700">
              Aktuelle Konfigurationen
            </p>
            <p className="mt-1.5 text-xs text-black-500">
              Konfigurierte Produkte einsehen
            </p>
          </Link>
          <Link
            href="/kontakt"
            className="group block border border-black-200 p-6 transition-colors hover:bg-black-50"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
              Hilfe
            </p>
            <p className="mt-3 font-heading text-lg tracking-tight text-black-950 transition-colors group-hover:text-brand-700">
              Kontakt aufnehmen
            </p>
            <p className="mt-1.5 text-xs text-black-500">
              Showroom, Telefon, E-Mail
            </p>
          </Link>
        </div>
      </div>
    </Container>
  );
}
