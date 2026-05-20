import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getSettings } from "@/lib/settings";
import { formatCents } from "@/lib/format-currency";
import { AngebotAnnahmeButton } from "@/components/kunden/angebots-annahme";
import { FileDown } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ihr Angebot | Muster Fenster",
};

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Public Angebots-Ansicht page (IC-02 from UI-SPEC).
 *
 * Server component that:
 * 1. Loads the Anfrage via Payload Local API (bypasses access control, UUID is auth)
 * 2. Finds the latest versendet Angebot
 * 3. Loads Settings for agb_link, firmenname, telefon, email
 * 4. Checks expiry (gültig_bis with end-of-day comparison)
 * 5. Renders product list, price summary, PDF download, AngebotAnnahmeButton
 * 6. Shows amber notice for expired Angebote
 */
export default async function AngebotPublicPage({
  params,
}: {
  params: Promise<{ anfrageId: string }>;
}) {
  const { anfrageId } = await params;
  const payload = await getPayload({ config });

  // Load anfrage
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

  if (!anfrage) {
    notFound();
  }

  // Find latest versendet Angebot
  const angeboteResult = await payload.find({
    collection: "angebote" as any,
    where: {
      anfrage: { equals: anfrage.id },
      status: { equals: "versendet" },
    },
    sort: "-version",
    limit: 1,
  });

  const angebot = angeboteResult.docs[0] as any | undefined;

  if (!angebot) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="text-xl font-semibold text-foreground">Ihr Angebot</h1>
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Kein aktives Angebot gefunden. Bitte kontaktieren Sie uns für
            weitere Informationen.
          </p>
        </div>
      </div>
    );
  }

  // Load settings for agb_link, company info
  const settings = await getSettings();
  const agbLink = (settings as any).agb_link || "/agb";
  const firmenname = (settings as any).firmenname || "Muster Fenster";
  const telefon = (settings as any).telefon || "";
  const email = (settings as any).email || "";

  // Check expiry (end-of-day comparison)
  let isExpired = false;
  if (angebot.gueltig_bis) {
    const gueltigBis = new Date(angebot.gueltig_bis);
    gueltigBis.setHours(23, 59, 59, 999);
    isExpired = new Date() > gueltigBis;
  }

  // Check if anfrage status allows acceptance
  const canAccept = anfrage.status === "angebot_versendet" && !isExpired;

  // Product list from Anfrage
  const produkte = anfrage.produkte ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <h1 className="text-xl font-semibold text-foreground">Ihr Angebot</h1>

      {/* Angebots-Zusammenfassung Card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        {/* Anfrage-Nummer */}
        <p className="text-sm text-muted-foreground">
          Anfrage: {anfrage.anfrage_nummer || anfrage.id}
        </p>

        {/* Produkt-Liste */}
        {produkte.length > 0 && (
          <div className="mt-4 space-y-2">
            {produkte.map((produkt: any, index: number) => (
              <div
                key={produkt.id || index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">
                  {produkt.produkttyp || "Produkt"}{" "}
                  <span className="text-muted-foreground">
                    x{produkt.stueckzahl || 1}
                  </span>
                </span>
                {produkt.einzelpreis != null && (
                  <span className="text-foreground">
                    {formatCents(produkt.einzelpreis)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gesamtpreis */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">
              Gesamtpreis
            </span>
            <span className="text-lg font-semibold text-foreground">
              {formatCents(angebot.betrag_brutto_cents)}
            </span>
          </div>
          {angebot.mwst_cents != null && (
            <p className="mt-1 text-sm text-muted-foreground">
              inkl. {angebot.mwst_satz || 19}% MwSt (
              {formatCents(angebot.mwst_cents)})
            </p>
          )}
        </div>

        {/* Gültig bis */}
        {angebot.gueltig_bis && (
          <p className="mt-2 text-sm text-muted-foreground">
            Gültig bis: {formatDate(angebot.gueltig_bis)}
          </p>
        )}
      </div>

      {/* PDF Download */}
      <a
        href={`/api/pdf/angebot/${anfrage.id}?id=${angebot.id}`}
        download
        aria-label="Angebot als PDF herunterladen"
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
      >
        <FileDown className="h-4 w-4" />
        Angebot als PDF herunterladen
      </a>

      {/* Annahme-Bereich */}
      {isExpired ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Angebot abgelaufen
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Dieses Angebot ist am {formatDate(angebot.gueltig_bis)} abgelaufen.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            Bitte kontaktieren Sie uns für ein neues Angebot.
            {telefon && <> Tel: {telefon}</>}
            {email && (
              <>
                {" "}
                | E-Mail:{" "}
                <a
                  href={`mailto:${email}`}
                  className="underline hover:text-amber-900"
                >
                  {email}
                </a>
              </>
            )}
          </p>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-400 px-6 py-2 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Angebot annehmen und zahlen
          </button>
        </div>
      ) : canAccept ? (
        <AngebotAnnahmeButton
          anfrageId={anfrage.id}
          betragBruttoCents={angebot.betrag_brutto_cents}
          mwstCents={angebot.mwst_cents || 0}
          mwstSatz={angebot.mwst_satz || 19}
          agbLink={agbLink}
        />
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Dieses Angebot kann derzeit nicht angenommen werden. Bitte
            kontaktieren Sie uns für weitere Informationen.
          </p>
        </div>
      )}

      {/* Footer: Company info */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>{firmenname}</p>
        {telefon && <p className="mt-1">Tel: {telefon}</p>}
        {email && (
          <p className="mt-1">
            <a href={`mailto:${email}`} className="hover:text-foreground">
              {email}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
