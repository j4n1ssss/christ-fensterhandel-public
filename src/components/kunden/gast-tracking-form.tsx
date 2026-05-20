"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Loader2, Package } from "lucide-react";
import {
  STATUS_TAILWIND,
  STATUS_CUSTOMER_TEXT,
  type StatusKey,
} from "@/lib/status-config";
import { formatCents } from "@/lib/format-currency";
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

/** Converts STATUS_TAILWIND structured object to flat Tailwind class string */
function getTailwindClasses(status: string): string {
  const tw = STATUS_TAILWIND[status as keyof typeof STATUS_TAILWIND];
  return tw ? `${tw.bg} ${tw.text}` : "bg-gray-50 text-gray-700";
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

/**
 * Guest tracking form: Anfrage-Nr + Email lookup.
 * Displays status, basic info, and timeline if found.
 */
export function GastTrackingForm() {
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

  const inputClassName =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const errorClassName = "mt-1 text-xs text-red-600";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="anfrage_nummer"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Anfrage-Nr.
          </label>
          <input
            id="anfrage_nummer"
            type="text"
            {...register("anfrage_nummer")}
            className={inputClassName}
            placeholder="z.B. ANF-2026-001"
          />
          {errors.anfrage_nummer && (
            <p className={errorClassName}>{errors.anfrage_nummer.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={inputClassName}
            placeholder="ihre@email.de"
          />
          {errors.email && (
            <p className={errorClassName}>{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isSubmitting ? "Wird gesucht..." : "Status prüfen"}
        </button>
      </form>

      {/* Result */}
      {result && !result.found && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            {result.error ||
              "Keine Anfrage gefunden. Prüfen Sie Ihre Anfrage-Nr. und E-Mail."}
          </p>
        </div>
      )}

      {result && result.found && (
        <div className="space-y-4">
          {/* Status overview */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {result.anfrage_nummer}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Erstellt:{" "}
                  {result.zeitpunkt ? formatDate(result.zeitpunkt) : "—"}
                </p>
              </div>
              <span
                className={`inline-flex self-start rounded-full px-3 py-1 text-sm font-medium ${getTailwindClasses(result.status || "")}`}
              >
                {STATUS_CUSTOMER_TEXT[result.status as StatusKey] ??
                  result.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {result.produkte_count}{" "}
                {result.produkte_count === 1 ? "Produkt" : "Produkte"}
              </span>
              <span>Gesamtpreis: {formatCents(result.gesamtpreis ?? 0)}</span>
            </div>
          </div>

          {/* Timeline */}
          {result.timeline && result.timeline.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-base font-semibold text-foreground">
                Status-Verlauf
              </h3>
              <div className="space-y-3">
                {[...result.timeline].reverse().map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        STATUS_TAILWIND[
                          entry.zu_status as keyof typeof STATUS_TAILWIND
                        ]?.dot ?? "bg-gray-300"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ??
                            entry.zu_status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.zeitpunkt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {STATUS_CUSTOMER_TEXT[entry.von_status as StatusKey] ??
                          entry.von_status}
                        {" → "}
                        {STATUS_CUSTOMER_TEXT[entry.zu_status as StatusKey] ??
                          entry.zu_status}
                      </p>
                      {entry.kommentar && (
                        <p className="mt-1 rounded bg-muted/50 px-2 py-1 text-xs text-foreground">
                          {entry.kommentar}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
