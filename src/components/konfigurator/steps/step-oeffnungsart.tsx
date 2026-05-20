"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";
import type { Oeffnungsarten, Media } from "@/payload-types";
import type {
  KonfiguratorSelections,
  WingOpening,
} from "@/lib/konfigurator/types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

/** Dreh und Dreh-Kipp brauchen eine Griff-Seite, Fest und Kipp nicht. */
function needsGriffSeite(slug: string): boolean {
  return slug === "dreh" || slug === "dreh-kipp";
}

/** Wing-Label für Anzeige. */
function getWingLabel(wingIndex: number, totalWings: number): string {
  if (totalWings === 1) return "Flügel";
  if (totalWings === 2) {
    return wingIndex === 0 ? "Linker Flügel" : "Rechter Flügel";
  }
  return `Flügel ${wingIndex + 1}`;
}

/**
 * Step 5: Öffnungsart per Flügel.
 * Zeigt Öffnungs-Optionen für jeden Flügel einzeln.
 * Dreh/Dreh-Kipp-Auswahl triggert einen Griff-Seite-Toggle.
 */
export function StepOeffnungsart() {
  const store = useKonfiguratorStore();

  if (!store.cmsData) return null;

  const selections: KonfiguratorSelections = {
    produkttyp: store.produkttyp,
    material: store.material,
    profil: store.profil,
    fluegelanzahl: store.fluegelanzahl,
    zusatzlichter: store.zusatzlichter,
    oeffnungsarten: store.oeffnungsarten,
    fensterform: store.fensterform,
    masse: store.masse,
    farbeAussen: store.farbeAussen,
    farbeInnen: store.farbeInnen,
    dichtungsfarbe: store.dichtungsfarbe,
    gleichWieAussen: store.gleichWieAussen,
    verglasung: store.verglasung,
    schallschutz: store.schallschutz,
    sicherheitsglas: store.sicherheitsglas,
    glasdekor: store.glasdekor,
    sprossen: store.sprossen,
    extras: store.extras,
  };

  const filteredOeffnungsarten = getFilteredOptions(
    5,
    store.cmsData,
    selections,
  ) as Oeffnungsarten[];

  const selectedFluegel = store.cmsData.fluegelanzahl.find(
    (f) => f.id === store.fluegelanzahl,
  );
  const wingCount = selectedFluegel?.anzahl ?? 1;
  const currentOpenings = store.oeffnungsarten;

  const getWingOpening = (wingIndex: number): WingOpening =>
    currentOpenings.find((w) => w.wingIndex === wingIndex) ?? {
      wingIndex,
      oeffnungsart: null,
      griffSeite: null,
    };

  const handleSelectOeffnungsart = (
    wingIndex: number,
    oeffnungsartId: string,
  ) => {
    const oeffnungsart = filteredOeffnungsarten.find(
      (oa) => oa.id === oeffnungsartId,
    );
    const requiresGriff = oeffnungsart
      ? needsGriffSeite(oeffnungsart.slug)
      : false;

    const updated: WingOpening[] = Array.from({ length: wingCount }, (_, i) => {
      if (i === wingIndex) {
        return {
          wingIndex: i,
          oeffnungsart: oeffnungsartId,
          griffSeite: requiresGriff ? "links" : null,
        };
      }
      return getWingOpening(i);
    });

    store.setSelection("oeffnungsarten", updated);

    const allComplete = updated.every((w) => {
      if (w.oeffnungsart === null) return false;
      const oa = filteredOeffnungsarten.find((o) => o.id === w.oeffnungsart);
      if (oa && needsGriffSeite(oa.slug) && w.griffSeite === null) return false;
      return true;
    });

    if (allComplete) {
      store.completeStep(5);
      store.setStep(6);
    }
  };

  const handleToggleGriffSeite = (
    wingIndex: number,
    seite: "links" | "rechts",
  ) => {
    const updated: WingOpening[] = Array.from({ length: wingCount }, (_, i) => {
      const current = getWingOpening(i);
      if (i === wingIndex) {
        return { ...current, griffSeite: seite };
      }
      return current;
    });

    store.setSelection("oeffnungsarten", updated);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 5 — Öffnung"
        title="Öffnungsart wählen"
        description="Lege pro Flügel fest, wie er sich öffnen soll. Dreh- und Dreh-Kipp-Flügel brauchen zusätzlich die Griff-Seite."
      />

      <div className="space-y-10">
        {Array.from({ length: wingCount }, (_, wingIndex) => {
          const wingOpening = getWingOpening(wingIndex);
          const selectedOa = filteredOeffnungsarten.find(
            (oa) => oa.id === wingOpening.oeffnungsart,
          );
          const showGriffSeite = selectedOa
            ? needsGriffSeite(selectedOa.slug)
            : false;

          return (
            <div
              key={wingIndex}
              className={cn(
                wingIndex > 0 && "border-t border-black-200 pt-8",
              )}
            >
              <SectionKicker tone="brand" className="mb-2">
                {wingCount > 1 ? `Flügel ${wingIndex + 1} / ${wingCount}` : "Flügel"}
              </SectionKicker>
              <h3 className="font-heading text-lg font-medium text-black-950 md:text-xl">
                {getWingLabel(wingIndex, wingCount)}
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
                {filteredOeffnungsarten.map((oa) => (
                  <OptionCard
                    key={oa.id}
                    title={oa.name}
                    description={oa.beschreibung ?? undefined}
                    imageUrl={resolveImageUrl(oa.bild)}
                    selected={wingOpening.oeffnungsart === oa.id}
                    onClick={() => handleSelectOeffnungsart(wingIndex, oa.id)}
                  />
                ))}
              </div>

              {/* Griff-Seite toggle für Dreh / Dreh-Kipp */}
              {showGriffSeite ? (
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                    Griff-Seite
                  </span>
                  <div className="flex gap-2">
                    {(["links", "rechts"] as const).map((seite) => (
                      <button
                        key={seite}
                        type="button"
                        onClick={() => handleToggleGriffSeite(wingIndex, seite)}
                        aria-pressed={wingOpening.griffSeite === seite}
                        className={cn(
                          "rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                          wingOpening.griffSeite === seite
                            ? "border-brand-500 bg-brand-50 text-brand-800"
                            : "border-black-200 bg-white text-black-800 hover:border-brand-500/60 hover:bg-black-50",
                        )}
                      >
                        {seite === "links" ? "Links" : "Rechts"}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </StepContainer>
  );
}
