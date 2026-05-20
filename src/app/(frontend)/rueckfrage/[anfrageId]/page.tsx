import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { RueckfrageFormular } from "@/components/kunden/rueckfrage-formular";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rückfrage beantworten | Muster Fenster",
};

/**
 * Guest route for answering a Rueckfrage.
 *
 * Public page (UUID is auth) that shows the admin's question from StatusHistorie
 * and an inline answer form with file upload.
 * Only accessible when anfrage status is "rueckfrage".
 */
export default async function RueckfrageGuestPage({
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
      depth: 1,
    });
  } catch {
    notFound();
  }

  if (!anfrage) notFound();

  // Must be in rueckfrage status
  if (anfrage.status !== "rueckfrage") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <span className="text-lg font-bold text-foreground">
            Muster Fenster
          </span>
        </header>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Diese Anfrage erwartet derzeit keine Antwort.
          </p>
        </div>
      </main>
    );
  }

  // Find latest rueckfrage message from StatusHistorie
  const historieResult = await payload.find({
    collection: "status_historie" as any,
    where: {
      anfrage: { equals: anfrageId },
      zu_status: { equals: "rueckfrage" },
    },
    sort: "-zeitpunkt",
    limit: 1,
  });
  const lastRueckfrage = historieResult.docs[0] as any;
  const adminMessage = lastRueckfrage?.kommentar || "";

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
          Rückfrage beantworten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ihre Anfrage {anfrageNummer} wartet auf Ihre Antwort zur folgenden
          Frage:
        </p>
        {adminMessage && (
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm text-orange-800">{adminMessage}</p>
          </div>
        )}
        <div className="mt-6">
          <RueckfrageFormular anfrageId={anfrageId} isGuest={true} />
        </div>
      </div>
    </main>
  );
}
