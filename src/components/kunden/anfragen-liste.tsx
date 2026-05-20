import Link from "next/link";
import type { Anfragen } from "@/payload-types";
import { ProgressStepperMini } from "./progress-stepper";
import { STATUS_CUSTOMER_PHASE, type StatusKey } from "@/lib/status-config";
import { FileText, Package, ArrowRight } from "lucide-react";
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

interface AnfragenListeProps {
  anfragen: Anfragen[];
}

/**
 * Displays a list of Anfragen as cards.
 * Each card shows Anfrage-Nr, Status, Gesamtpreis, Datum, and product count.
 * Clicking a card navigates to the detail page.
 */
export function AnfragenListe({ anfragen }: AnfragenListeProps) {
  if (anfragen.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          Noch keine Anfragen
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sie haben noch keine Anfragen erstellt. Starten Sie den Konfigurator!
        </p>
        <Link
          href="/konfigurator/fenster"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Konfigurator starten
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anfragen.map((anfrage) => {
        const produkteCount = anfrage.produkte?.length ?? 0;
        const currentPhase =
          STATUS_CUSTOMER_PHASE[anfrage.status as StatusKey] ?? null;
        const isCompleted =
          anfrage.status === "geliefert" || anfrage.status === "abgeschlossen";

        return (
          <Link
            key={anfrage.id}
            href={`/kunden/dashboard/${anfrage.id}`}
            className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/50 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {anfrage.anfrage_nummer}
                  </span>
                  {currentPhase !== null ? (
                    <ProgressStepperMini
                      currentPhase={currentPhase}
                      completed={isCompleted}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-red-700">
                      {anfrage.status === "storniert"
                        ? "Storniert"
                        : "Abgelehnt"}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(anfrage.createdAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {produkteCount}{" "}
                    {produkteCount === 1 ? "Produkt" : "Produkte"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {formatCents(anfrage.gesamtpreis ?? 0)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
