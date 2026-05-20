"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";
import { formatEUR, calculateMwSt } from "@/lib/cart/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { KontaktFormData } from "@/lib/anfrage/schemas";
import { cn } from "@/lib/utils";
import { SectionKicker } from "@/components/ui/section-kicker";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";

/**
 * Anfrage-Zusammenfassung mit Produktliste, Preisen, Kontaktdaten und Submit.
 * Schritt 3 von 3 im Anfrage-Flow.
 */
export function AnfrageSummary() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const discountResult = useCartStore((s) => s.discountResult);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const kontaktdaten = useMemo<KontaktFormData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("kontaktdaten");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, []);

  const subtotal = getSubtotal();
  let discountAmount = 0;
  if (discountResult?.valid) {
    if (discountResult.typ === "prozent") {
      discountAmount =
        Math.round(subtotal * (discountResult.wert / 100) * 100) / 100;
    } else {
      discountAmount = discountResult.wert;
    }
  }
  const nettoAfterDiscount = subtotal - discountAmount;
  const { mwst, brutto } = calculateMwSt(nettoAfterDiscount);

  const handleSubmit = async () => {
    if (!kontaktdaten || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const produkte = items.map((item) => ({
        selections: item.selections,
        resolvedNames: item.resolvedNames,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/anfrage/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kontaktdaten,
          produkte,
          rabattcode: discountResult?.valid ? discountResult.code : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Anfrage konnte nicht gesendet werden");
      }

      sessionStorage.setItem(
        "anfrage-danke",
        JSON.stringify({
          anfrageNummer: result.anfrageNummer,
          produktCount: items.length,
          gesamtpreis: result.gesamtpreis,
        }),
      );

      router.push(
        `/anfrage/danke?nr=${encodeURIComponent(result.anfrageNummer)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass =
    "rounded-xl border border-black-200 bg-white p-6 md:p-8";
  const sectionHeading =
    "font-heading text-xl font-medium tracking-tight text-black-950 md:text-2xl";

  return (
    <div className="space-y-6">
      {/* Produktliste + Preise */}
      <section className={cardClass}>
        <SectionKicker tone="brand" className="mb-2">
          Produkte
        </SectionKicker>
        <h3 className={sectionHeading}>Deine Produkte</h3>

        <dl className="mt-6 divide-y divide-black-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black-900">
                  {item.resolvedNames.produkttyp} —{" "}
                  {item.resolvedNames.material} {item.resolvedNames.profil}
                </p>
                {item.resolvedNames.masse ? (
                  <p className="mt-0.5 font-mono text-xs tabular-nums text-black-500">
                    {item.resolvedNames.masse.breite} &times;{" "}
                    {item.resolvedNames.masse.hoehe} mm
                  </p>
                ) : null}
                {item.quantity > 1 ? (
                  <p className="mt-0.5 text-xs text-black-500">
                    Menge: <span className="tabular-nums">{item.quantity}</span>
                  </p>
                ) : null}
              </div>
              <p className="font-mono text-sm font-medium tabular-nums text-black-900">
                {formatEUR(item.previewPrice * item.quantity)}
              </p>
            </div>
          ))}
        </dl>

        {/* Price breakdown */}
        <div className="mt-6 space-y-2.5 border-t border-black-200 pt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-black-600">Zwischensumme (netto)</span>
            <span
              className={cn(
                "font-mono tabular-nums",
                discountResult?.valid
                  ? "text-black-400 line-through"
                  : "font-medium text-black-900",
              )}
            >
              {formatEUR(subtotal)}
            </span>
          </div>

          {discountResult?.valid ? (
            <>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-success-700">
                  Rabatt ({discountResult.code})
                </span>
                <span className="font-mono font-medium tabular-nums text-success-700">
                  -{formatEUR(discountAmount)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-black-600">
                  Zwischensumme nach Rabatt
                </span>
                <span className="font-mono font-medium tabular-nums text-black-900">
                  {formatEUR(nettoAfterDiscount)}
                </span>
              </div>
            </>
          ) : null}

          <div className="flex items-baseline justify-between text-sm">
            <span className="text-black-600">zzgl. 19 % MwSt</span>
            <span className="font-mono font-medium tabular-nums text-black-900">
              {formatEUR(mwst)}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between rounded-md bg-brand-50 px-5 py-4">
            <span className="font-heading text-base font-medium text-black-950">
              Gesamtbetrag (brutto)
            </span>
            <span className="font-heading text-2xl font-medium tabular-nums tracking-tight text-brand-800 md:text-3xl">
              {formatEUR(brutto)}
            </span>
          </div>

          <p className="pt-1 text-xs leading-relaxed text-black-500">
            Unverbindliche Preisvorschau. Der endgültige Preis wird
            serverseitig berechnet.
          </p>
        </div>
      </section>

      {/* Kontaktdaten */}
      {kontaktdaten ? (
        <section className={cardClass}>
          <SectionKicker tone="brand" className="mb-2">
            Kontakt
          </SectionKicker>
          <h3 className={sectionHeading}>Deine Kontaktdaten</h3>

          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                Name
              </dt>
              <dd className="mt-1 font-medium text-black-900">
                {kontaktdaten.vorname} {kontaktdaten.nachname}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                E-Mail
              </dt>
              <dd className="mt-1 font-medium text-black-900">
                {kontaktdaten.email}
              </dd>
            </div>
            {kontaktdaten.telefon ? (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                  Telefon
                </dt>
                <dd className="mt-1 font-medium text-black-900">
                  {kontaktdaten.telefon}
                </dd>
              </div>
            ) : null}
            {kontaktdaten.strasse || kontaktdaten.plz || kontaktdaten.ort ? (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                  Adresse
                </dt>
                <dd className="mt-1 font-medium leading-relaxed text-black-900">
                  {kontaktdaten.strasse ? (
                    <>
                      {kontaktdaten.strasse}
                      <br />
                    </>
                  ) : null}
                  {kontaktdaten.plz} {kontaktdaten.ort}
                </dd>
              </div>
            ) : null}
            {kontaktdaten.nachricht ? (
              <div className="sm:col-span-2">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                  Nachricht
                </dt>
                <dd className="mt-1 leading-relaxed text-black-900">
                  {kontaktdaten.nachricht}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {/* Error state */}
      {error ? (
        <ErrorAlert title="Anfrage fehlgeschlagen">{error}</ErrorAlert>
      ) : null}

      <p className="text-xs leading-relaxed text-black-500">
        Preise sind unverbindlich. Der endgültige Preis steht im Angebot.
      </p>

      {/* Navigation + Submit */}
      <div className="flex flex-col gap-3 border-t border-black-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="alternate"
          size="normal"
          leadingIcon={<ArrowLeft aria-hidden />}
        >
          <Link href="/anfrage">Zurück zu Kontaktdaten</Link>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="normal"
          onClick={handleSubmit}
          disabled={submitting}
          leadingIcon={
            submitting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : undefined
          }
        >
          {submitting ? "Wird gesendet…" : "Verbindlich absenden"}
        </Button>
      </div>
    </div>
  );
}
