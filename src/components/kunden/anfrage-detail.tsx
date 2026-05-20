import type { Anfragen, StatusHistorie } from "@/payload-types";
import { StatusTimeline } from "./status-timeline";
import { ProgressStepper } from "./progress-stepper";
import { StatusBanner } from "./status-banner";
import {
  STATUS_CUSTOMER_TEXT,
  STATUS_CUSTOMER_PHASE,
  type StatusKey,
} from "@/lib/status-config";
import { StripePayButton } from "./stripe-pay-button";
import { AngebotAnnahmeButton } from "./angebots-annahme";
import { RueckfrageFormular } from "./rueckfrage-formular";
import { ReklamationFormular } from "./reklamation-formular";
import { ReklamationAnzeige } from "./reklamation-anzeige";
import { StornoDialog } from "./storno-dialog";
import { Package, Ruler, Palette, FileDown } from "lucide-react";
import { formatCents } from "@/lib/format-currency";

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

interface DokumenteItem {
  id: string;
  typ: "angebot" | "rechnung" | "gutschrift";
  nummer: string;
  version?: number;
  createdAt: string;
  betrag_brutto_cents?: number;
  mwst_cents?: number;
  mwst_satz?: number;
  gueltig_bis?: string;
}

interface ReklamationItem {
  id: string;
  beschreibung: string;
  status: "offen" | "in_bearbeitung" | "geloest";
  loesung?: string | null;
  fotos?: Array<{ id: string; url?: string; filename?: string }>;
}

interface AnfrageDetailProps {
  anfrage: Anfragen;
  statusHistorie: StatusHistorie[];
  dokumente?: DokumenteItem[];
  agbLink?: string;
  reklamationen?: ReklamationItem[];
}

/**
 * Displays full details of a single Anfrage:
 * - ProgressStepper (5-phase progress bar)
 * - StatusBanner (special/terminal statuses)
 * - Customer-facing status text
 * - Status-Timeline
 * - Product list with configuration details
 * - Gesamtpreis
 * Does NOT show: interne_notizen, geaendert_von
 */
export function AnfrageDetail({
  anfrage,
  statusHistorie,
  dokumente,
  agbLink,
  reklamationen,
}: AnfrageDetailProps) {
  const produkte = anfrage.produkte ?? [];
  const currentPhase =
    STATUS_CUSTOMER_PHASE[anfrage.status as StatusKey] ?? null;
  const isCompleted =
    anfrage.status === "geliefert" || anfrage.status === "abgeschlossen";
  const customerText = STATUS_CUSTOMER_TEXT[anfrage.status as StatusKey] ?? "";

  return (
    <div className="space-y-6">
      {/* Header: Anfrage-Nr + Datum */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Anfrage {anfrage.anfrage_nummer}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Erstellt am {formatDate(anfrage.createdAt)}
          </p>
        </div>
      </div>

      {/* Status Banner (special/terminal statuses) */}
      <StatusBanner status={anfrage.status || "neu"} />

      {/* Progress Stepper (hidden for terminal statuses) */}
      {currentPhase !== null && (
        <ProgressStepper currentPhase={currentPhase} completed={isCompleted} />
      )}

      {/* Customer-facing status text */}
      {customerText && (
        <p className="text-sm text-muted-foreground">{customerText}</p>
      )}

      {/* Rueckfrage-Antwort Formular (visible only at status rueckfrage) */}
      {anfrage.status === "rueckfrage" && (
        <RueckfrageFormular anfrageId={anfrage.id} />
      )}

      {/* Reklamation melden -- nur bei geliefert/abgeschlossen und noch keine offene Reklamation */}
      {(anfrage.status === "geliefert" || anfrage.status === "abgeschlossen") &&
        !(reklamationen && reklamationen.length > 0) && (
          <ReklamationFormular anfrageId={anfrage.id} />
        )}

      {/* Bestehende Reklamationen anzeigen */}
      {reklamationen &&
        reklamationen.length > 0 &&
        reklamationen.map((rek) => (
          <ReklamationAnzeige key={rek.id} reklamation={rek} />
        ))}

      {/* Payment button / status display (component handles its own visibility) */}
      <StripePayButton
        anfrageId={anfrage.id}
        gesamtpreis={anfrage.gesamtpreis}
        status={anfrage.status || ""}
        stripePaymentStatus={anfrage.stripe_payment_status}
        stripeExpiresAt={anfrage.stripe_expires_at}
        stripeRefundedAmountCents={anfrage.stripe_refunded_amount_cents}
        gutschriftUrl={
          dokumente?.find((d) => d.typ === "gutschrift")
            ? `/api/pdf/gutschrift/${anfrage.id}?id=${dokumente.find((d) => d.typ === "gutschrift")!.id}`
            : null
        }
      />

      {/* Angebots-Bereich: shown when status is angebot_versendet and latest angebot has pricing */}
      {(() => {
        const latestAngebot = dokumente?.find(
          (d) => d.typ === "angebot" && d.betrag_brutto_cents,
        );
        if (
          anfrage.status !== "angebot_versendet" ||
          !latestAngebot ||
          !latestAngebot.betrag_brutto_cents
        ) {
          return null;
        }
        return (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              Ihr Angebot liegt vor
            </p>
            <p className="mt-1 text-sm text-green-800">
              Angebotsbetrag: {formatCents(latestAngebot.betrag_brutto_cents)}
            </p>
            {latestAngebot.gueltig_bis && (
              <p className="text-sm text-green-700">
                Gültig bis: {formatDate(latestAngebot.gueltig_bis)}
              </p>
            )}
            <a
              href={`/api/pdf/angebot/${anfrage.id}?id=${latestAngebot.id}`}
              download
              className="mt-2 inline-block text-sm font-semibold text-green-800 underline"
            >
              Angebot als PDF herunterladen
            </a>
            <div className="mt-4">
              <AngebotAnnahmeButton
                anfrageId={anfrage.id}
                betragBruttoCents={latestAngebot.betrag_brutto_cents}
                mwstCents={latestAngebot.mwst_cents || 0}
                mwstSatz={latestAngebot.mwst_satz || 19}
                agbLink={agbLink || "/agb"}
              />
            </div>
          </div>
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status-Timeline */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Status-Verlauf
          </h2>
          <StatusTimeline entries={statusHistorie} />
        </div>

        {/* Produkte */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Konfigurierte Produkte
          </h2>

          {produkte.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Produkte vorhanden.
            </p>
          ) : (
            <div className="space-y-3">
              {produkte.map((produkt, index) => (
                <div
                  key={produkt.id || index}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {produkt.produkttyp || "Produkt"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {produkt.stueckzahl || 1}x{" "}
                      {formatCents(produkt.einzelpreis ?? 0)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {produkt.material && (
                      <span>Material: {produkt.material}</span>
                    )}
                    {produkt.profil && <span>Profil: {produkt.profil}</span>}
                    {(produkt.masse_breite || produkt.masse_hoehe) && (
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {produkt.masse_breite}x{produkt.masse_hoehe} mm
                      </span>
                    )}
                    {produkt.fluegelanzahl && (
                      <span>Flügel: {produkt.fluegelanzahl}</span>
                    )}
                    {(produkt.farbe_aussen || produkt.farbe_innen) && (
                      <span className="col-span-2 inline-flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        {produkt.farbe_aussen &&
                          `Außen: ${produkt.farbe_aussen}`}
                        {produkt.farbe_aussen && produkt.farbe_innen && " / "}
                        {produkt.farbe_innen && `Innen: ${produkt.farbe_innen}`}
                      </span>
                    )}
                    {produkt.verglasung && (
                      <span>Verglasung: {produkt.verglasung}</span>
                    )}
                    {produkt.weitere_optionen && (
                      <span className="col-span-2">
                        Optionen: {produkt.weitere_optionen}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gesamtpreis */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium text-foreground">
              Gesamtpreis
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCents(anfrage.gesamtpreis ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Ihre Dokumente */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Ihre Dokumente
        </h2>
        {!dokumente || dokumente.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Noch keine Dokumente verfügbar.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sobald Ihr Angebot oder Ihre Rechnung bereitsteht, erscheint es
              hier zum Download.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dokumente.map((item) => (
              <div
                key={`${item.typ}-${item.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileDown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {item.typ === "angebot"
                        ? `Angebot V${item.version || 1}`
                        : item.typ === "gutschrift"
                          ? "Gutschrift"
                          : "Rechnung"}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.nummer}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                  <a
                    href={`/api/pdf/${item.typ}/${anfrage.id}?id=${item.id}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    PDF herunterladen
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storno-Button: visible for all statuses except excluded */}
      {![
        "storniert",
        "abgelehnt",
        "abgeschlossen",
        "geliefert",
        "rueckerstattung_ausstehend",
        "rueckerstattung_abgeschlossen",
      ].includes(anfrage.status) && <StornoDialog anfrageId={anfrage.id} />}
    </div>
  );
}
