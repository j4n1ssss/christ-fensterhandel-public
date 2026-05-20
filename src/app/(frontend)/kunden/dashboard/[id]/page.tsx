import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AnfrageDetail } from "@/components/kunden/anfrage-detail";
import { ArrowLeft } from "lucide-react";
import type { StatusHistorie } from "@/payload-types";

export const metadata = {
  title: "Anfrage Details | Muster Fenster",
  description: "Details zu Ihrer Anfrage.",
};

/** Force dynamic rendering — auth-dependent page */
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnfrageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.rolle !== "kunde") {
    redirect("/kunden/login");
  }

  const payload = await getPayload({ config });

  // Fetch Anfrage by ID via Local API
  let anfrage;
  try {
    anfrage = await payload.findByID({
      collection: "anfragen",
      id,
    });
  } catch {
    notFound();
  }

  if (!anfrage) {
    notFound();
  }

  // Ownership check: verify kontaktdaten.email matches user.email
  if (anfrage.kontaktdaten?.email !== user.email) {
    redirect("/kunden/dashboard");
  }

  // Fetch StatusHistorie for this Anfrage
  const { docs: statusHistorie } = await payload.find({
    collection: "status_historie",
    where: {
      anfrage: { equals: anfrage.id },
    },
    sort: "zeitpunkt",
    limit: 200,
  });

  // Filter out geaendert_von from entries (do not expose who changed status)
  const safeHistorie: StatusHistorie[] = statusHistorie.map((entry) => ({
    ...entry,
    geaendert_von: undefined,
  }));

  // Load Settings for dynamic AGB link
  const settings = await getSettings();
  const agbLink = (settings as any).agb_link || "/agb";

  // Fetch documents (Angebote + Rechnungen/Gutschriften) for this Anfrage
  const { docs: angebote } = await payload.find({
    collection: "angebote" as any,
    where: { anfrage: { equals: anfrage.id }, status: { equals: "versendet" } },
    sort: "-createdAt",
    limit: 50,
  });
  const { docs: rechnungen } = await payload.find({
    collection: "rechnungen" as any,
    where: { anfrage: { equals: anfrage.id } },
    sort: "-createdAt",
    limit: 50,
  });

  // Fetch Reklamationen for this Anfrage
  const reklamationenResult = await payload.find({
    collection: "reklamationen" as any,
    where: { anfrage: { equals: id } },
    sort: "-createdAt",
    depth: 1, // Include fotos media
  });
  const reklamationen = reklamationenResult.docs.map((rek: any) => ({
    id: rek.id,
    beschreibung: rek.beschreibung,
    status: rek.status,
    loesung: rek.loesung,
    fotos: Array.isArray(rek.fotos)
      ? rek.fotos.map((f: any) => ({
          id: typeof f === "string" ? f : f.id,
          url: typeof f === "string" ? undefined : f.url,
          filename: typeof f === "string" ? undefined : f.filename,
        }))
      : [],
  }));

  const dokumente = [
    ...angebote.map((a: any) => ({
      id: a.id,
      typ: "angebot" as const,
      nummer: a.nummer,
      version: a.version,
      createdAt: a.createdAt,
      betrag_brutto_cents: a.betrag_brutto_cents,
      mwst_cents: a.mwst_cents,
      mwst_satz: a.mwst_satz,
      gueltig_bis: a.gueltig_bis,
    })),
    ...rechnungen.map((r: any) => ({
      id: r.id,
      typ: r.typ as "rechnung" | "gutschrift",
      nummer: r.nummer,
      createdAt: r.createdAt,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/kunden/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Link>

      <AnfrageDetail
        anfrage={anfrage}
        statusHistorie={safeHistorie}
        dokumente={dokumente}
        agbLink={agbLink}
        reklamationen={reklamationen}
      />
    </div>
  );
}
