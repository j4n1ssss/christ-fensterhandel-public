"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { formatCents } from "@/lib/format-currency";
import { Container } from "@/components/layout/container";
import { SectionKicker } from "@/components/ui/section-kicker";
import { Button } from "@/components/ui/button";
import { trackRevenue, trackEvent } from "@/lib/tracking/pirsch";

interface DankeData {
  anfrageNummer: string;
  produktCount: number;
  gesamtpreis: number;
}

/**
 * Danke-Page nach erfolgreichem Anfrage-Submit.
 * Liest anfrage_nummer aus URL-Query und Summary aus sessionStorage,
 * leert Warenkorb und sessionStorage beim Mount.
 */
export function DankeContent() {
  const searchParams = useSearchParams();
  const anfrageNummer = searchParams.get("nr");

  const dankeData = useMemo<DankeData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("anfrage-danke");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }, []);

  useEffect(() => {
    useCartStore.getState().clearCart();
    sessionStorage.removeItem("kontaktdaten");
    sessionStorage.removeItem("anfrage-danke");
  }, []);

  // Conversion-Event nach Submit. Nur einmal pro Mount, mit grob gerundetem
  // Auftragswert — keine PII, keine exakten Beträge.
  useEffect(() => {
    if (!dankeData) {
      trackEvent("Anfrage abgeschickt");
      return;
    }
    trackRevenue("Anfrage abgeschickt", dankeData.gesamtpreis, {
      position_anzahl: dankeData.produktCount,
    });
  }, [dankeData]);

  return (
    <Container size="sm">
      <div className="py-20 text-center md:py-28 lg:py-32">
        {/* Success icon */}
        <div
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-100"
          aria-hidden
        >
          <CheckCircle2 className="size-9 text-success-700" />
        </div>

        {/* Kicker + Heading */}
        <SectionKicker tone="brand" className="mt-8 flex justify-center">
          Anfrage gesendet
        </SectionKicker>
        <h1 className="mt-5 font-heading text-3xl font-medium leading-[1.05] tracking-tight text-black-950 md:text-4xl lg:text-5xl">
          Vielen Dank — wir melden uns.
        </h1>

        <p className="mx-auto mt-6 max-w-[var(--container-lg)] text-base leading-relaxed text-black-600 md:text-lg">
          Deine Anfrage ist bei uns eingegangen. Wir prüfen die Konfiguration
          und melden uns innerhalb von 2 Werktagen mit deinem Angebot.
        </p>

        {/* Anfrage-Nummer Card */}
        {anfrageNummer ? (
          <div className="mx-auto mt-10 max-w-[var(--container-md)] rounded-xl border border-black-200 bg-white p-6 md:p-8">
            <SectionKicker>Referenz</SectionKicker>
            <p className="mt-3 font-heading text-3xl font-medium tracking-tight tabular-nums text-black-950 md:text-4xl">
              {anfrageNummer}
            </p>
            {dankeData ? (
              <p className="mt-3 font-mono text-xs text-black-500">
                {dankeData.produktCount}{" "}
                {dankeData.produktCount === 1 ? "Produkt" : "Produkte"}
                {" · "}
                Gesamtbetrag {formatCents(dankeData.gesamtpreis)}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Next Steps */}
        <dl className="mx-auto mt-12 grid max-w-[var(--container-lg)] gap-5 text-left sm:grid-cols-2">
          <div className="rounded-md border border-black-200 bg-white p-5">
            <dt className="font-mono text-xs uppercase tracking-[0.15em] text-brand-600">
              Nächster Schritt
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-black-900">
              Du bekommst eine Bestätigung per E-Mail an die angegebene Adresse.
            </dd>
          </div>
          <div className="rounded-md border border-black-200 bg-white p-5">
            <dt className="font-mono text-xs uppercase tracking-[0.15em] text-brand-600">
              Dann
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-black-900">
              Wir prüfen deine Konfiguration und senden dir innerhalb von 2
              Werktagen ein verbindliches Angebot.
            </dd>
          </div>
        </dl>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="primary"
            size="normal"
            trailingIcon={<ArrowRight aria-hidden />}
          >
            <Link href="/konfigurator/fenster">Neue Konfiguration</Link>
          </Button>
          <Button asChild variant="alternate" size="normal">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
