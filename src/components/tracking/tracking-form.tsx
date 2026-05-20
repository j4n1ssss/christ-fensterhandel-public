"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Package } from "lucide-react";
import {
  STATUS_TAILWIND,
  STATUS_CUSTOMER_TEXT,
  type StatusKey,
} from "@/lib/status-config";
import { formatCents } from "@/lib/format-currency";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking/pirsch";

const trackingSchema = z.object({
  anfrage_nummer: z.string().min(1, "Anfrage-Nr. ist erforderlich"),
  email: z.email("Bitte gültige E-Mail-Adresse eingeben"),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

interface TimelineEntry {
  von_status: string;
  zu_status: string;
  zeitpunkt: string;
  kommentar: string | null;
}

interface TrackingResult {
  found: boolean;
  status?: string;
  anfrage_nummer?: string;
  produkte_count?: number;
  gesamtpreis?: number;
  zeitpunkt?: string;
  timeline?: TimelineEntry[];
  error?: string;
}

function getStatusClasses(status: string): string {
  const tw = STATUS_TAILWIND[status as keyof typeof STATUS_TAILWIND];
  return tw ? `${tw.bg} ${tw.text}` : "bg-black-100 text-black-700";
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function TrackingForm() {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { anfrage_nummer: "", email: "" },
  });

  const onSubmit = async (data: TrackingFormValues) => {
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/status-pruefen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: TrackingResult = await response.json();
      setResult(json);
      if (json.found) {
        trackEvent("Bestellung verfolgt");
      }
    } catch {
      setResult({ found: false, error: "Ein Fehler ist aufgetreten." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="anfrage_nummer">Anfrage-Nummer</Label>
          <Input
            id="anfrage_nummer"
            aria-invalid={!!errors.anfrage_nummer}
            {...register("anfrage_nummer")}
            placeholder="z. B. ANF-2026-001"
          />
          <FieldError>{errors.anfrage_nummer?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            {...register("email")}
            placeholder="du@beispiel.de"
          />
          <FieldError>{errors.email?.message}</FieldError>
          <p className="mt-1.5 text-xs text-black-500">
            Die E-Mail-Adresse, mit der die Anfrage gestellt wurde.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            buttonVariants({ variant: "primary", size: "normal" }),
            "mt-2 w-full",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Wird geprüft…
            </>
          ) : (
            <>
              Status prüfen
              <ArrowRight aria-hidden />
            </>
          )}
        </button>
      </form>

      {result && !result.found && (
        <div className="rounded-md border border-black-200 bg-black-50 p-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
            Kein Treffer
          </p>
          <p className="mt-3 text-sm text-black-700">
            {result.error ||
              "Keine Anfrage gefunden. Prüfe Anfrage-Nr. und E-Mail-Adresse."}
          </p>
        </div>
      )}

      {result && result.found && (
        <div className="space-y-6">
          {/* Status-Übersicht */}
          <div className="border border-black-200 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
                  Anfrage
                </p>
                <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight text-black-950">
                  {result.anfrage_nummer}
                </h2>
                <p className="mt-1 font-mono text-xs text-black-500">
                  Erstellt:{" "}
                  {result.zeitpunkt ? formatDate(result.zeitpunkt) : "—"}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex self-start rounded-full px-3 py-1.5 text-xs font-medium",
                  getStatusClasses(result.status || ""),
                )}
              >
                {STATUS_CUSTOMER_TEXT[result.status as StatusKey] ??
                  result.status}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-black-100 pt-5 font-mono text-xs text-black-600">
              <span className="inline-flex items-center gap-2">
                <Package className="size-3.5" aria-hidden />
                {result.produkte_count}{" "}
                {result.produkte_count === 1 ? "Produkt" : "Produkte"}
              </span>
              <span>
                Gesamt:{" "}
                <span className="text-black-950">
                  {formatCents(result.gesamtpreis ?? 0)}
                </span>
              </span>
            </div>
          </div>

          {/* Timeline */}
          {result.timeline && result.timeline.length > 0 && (
            <div className="border border-black-200 bg-white p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
                Status-Verlauf
              </p>
              <ol className="mt-5 space-y-5">
                {[...result.timeline].reverse().map((entry, index) => {
                  const tw =
                    STATUS_TAILWIND[
                      entry.zu_status as keyof typeof STATUS_TAILWIND
                    ];
                  return (
                    <li key={index} className="flex gap-4">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1.5 size-2.5 shrink-0 rounded-full",
                          tw?.dot ?? "bg-black-300",
                        )}
                      />
                      <div className="min-w-0 flex-1 border-b border-black-100 pb-5 last:border-b-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-black-950">
                            {STATUS_CUSTOMER_TEXT[
                              entry.zu_status as StatusKey
                            ] ?? entry.zu_status}
                          </span>
                          <span className="font-mono text-xs text-black-500">
                            {formatDate(entry.zeitpunkt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-black-500">
                          {STATUS_CUSTOMER_TEXT[
                            entry.von_status as StatusKey
                          ] ?? entry.von_status}
                          {" → "}
                          {STATUS_CUSTOMER_TEXT[
                            entry.zu_status as StatusKey
                          ] ?? entry.zu_status}
                        </p>
                        {entry.kommentar && (
                          <p className="mt-3 rounded-md bg-black-50 px-3 py-2 text-xs leading-relaxed text-black-700">
                            {entry.kommentar}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
