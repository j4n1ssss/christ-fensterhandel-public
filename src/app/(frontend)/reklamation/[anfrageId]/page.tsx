import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { ReklamationFormular } from "@/components/kunden/reklamation-formular";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reklamation einreichen | Muster Fenster",
};

/**
 * Guest route for submitting a Reklamation.
 *
 * Public page (UUID is auth) that shows the complaint form with photo upload.
 * Only accessible when anfrage status is "geliefert" or "abgeschlossen".
 */
export default async function ReklamationGuestPage({
  params,
}: {
  params: Promise<{ anfrageId: string }>;
}) {
  const { anfrageId } = await params;
  const payload = await getPayload({ config });

  let anfrage: any;
  try {
    anfrage = await payload.findByID({
      collection: "anfragen",
      id: anfrageId,
      depth: 0,
    });
  } catch {
    notFound();
  }

  if (!anfrage) notFound();

  // Must be geliefert or abgeschlossen for reklamation
  if (anfrage.status !== "geliefert" && anfrage.status !== "abgeschlossen") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <span className="text-lg font-bold text-foreground">
            Muster Fenster
          </span>
        </header>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Reklamation kann nur für gelieferte oder abgeschlossene Anfragen
            eingereicht werden.
          </p>
        </div>
      </main>
    );
  }

  const anfrageNummer = anfrage.anfrage_nummer || anfrage.id;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <span className="text-lg font-bold text-foreground">
          Muster Fenster
        </span>
      </header>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Reklamation einreichen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reklamation einreichen für Anfrage {anfrageNummer}
        </p>
        <div className="mt-6">
          <ReklamationFormular anfrageId={anfrageId} isGuest={true} />
        </div>
      </div>
    </main>
  );
}
