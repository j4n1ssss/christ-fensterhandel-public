import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { Anfragen } from "@/payload-types";
import {
  STATUS_CUSTOMER_TEXT,
  STATUS_TAILWIND,
  type StatusKey,
} from "@/lib/status-config";
import { formatCents } from "@/lib/format-currency";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function getStatusClasses(status: string | null | undefined): string {
  if (!status) return "bg-black-100 text-black-700";
  const tw = STATUS_TAILWIND[status as keyof typeof STATUS_TAILWIND];
  return tw ? `${tw.bg} ${tw.text}` : "bg-black-100 text-black-700";
}

interface DashboardAnfragenListProps {
  anfragen: Anfragen[];
}

/**
 * Editorial list der Anfragen eines Kunden.
 * Kein Card-Raster — statt dessen horizontale Einträge mit
 * feinen Trennlinien (black-100), Status-Badge rechts,
 * Hover mit sanftem bg-black-50 und Arrow-Animation.
 */
export function DashboardAnfragenList({ anfragen }: DashboardAnfragenListProps) {
  if (anfragen.length === 0) {
    return (
      <div className="border border-dashed border-black-300 bg-black-50 px-6 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-black-500">
          Noch leer
        </p>
        <h3 className="mt-4 font-heading text-2xl font-medium tracking-tight text-black-950 md:text-3xl">
          Du hast noch keine Anfragen.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black-600">
          Starte den Konfigurator, um dein erstes Fenster oder deine erste Tür
          individuell zu konfigurieren.
        </p>
        <Link
          href="/konfigurator"
          className={cn(
            buttonVariants({ variant: "primary", size: "normal" }),
            "mt-8",
          )}
        >
          Konfigurator starten
          <ArrowRight aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <ul className="border-t border-black-200">
      {anfragen.map((anfrage) => {
        const produkteCount = anfrage.produkte?.length ?? 0;
        return (
          <li key={anfrage.id} className="border-b border-black-200">
            <Link
              href={`/kunden/dashboard/${anfrage.id}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-5 transition-colors hover:bg-black-50 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-8 sm:px-6"
            >
              {/* Nummer + Meta */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-heading text-lg font-medium tracking-tight text-black-950">
                    {anfrage.anfrage_nummer}
                  </span>
                  <span className="font-mono text-xs text-black-500">
                    {formatDate(anfrage.createdAt)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 font-mono text-xs text-black-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Package className="size-3" aria-hidden />
                    {produkteCount}{" "}
                    {produkteCount === 1 ? "Produkt" : "Produkte"}
                  </span>
                </div>
              </div>

              {/* Preis — desktop only inline, mobile unter Nummer */}
              <span className="col-start-1 row-start-2 text-sm tabular-nums text-black-800 sm:col-start-2 sm:row-start-1">
                {formatCents(anfrage.gesamtpreis ?? 0)}
              </span>

              {/* Status-Badge */}
              <span
                className={cn(
                  "col-start-2 row-start-1 inline-flex justify-self-end rounded-full px-3 py-1 text-xs font-medium sm:col-start-3",
                  getStatusClasses(anfrage.status),
                )}
              >
                {STATUS_CUSTOMER_TEXT[anfrage.status as StatusKey] ??
                  anfrage.status}
              </span>

              {/* Arrow — desktop only */}
              <ArrowRight
                className="hidden size-4 -translate-x-1 text-black-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100 sm:block"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
