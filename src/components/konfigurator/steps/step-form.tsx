"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import type { Fensterform, Media } from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

/**
 * Step 6: Fensterform selection.
 * Gefiltert nach erlaubter Flügelanzahl und erlaubten Öffnungsarten.
 * Bei den meisten Konfigurationen kommt nur Rechteck — Sonderformen
 * erscheinen nur, wenn CMS-Daten sie zulassen.
 */
export function StepForm() {
  const cmsData = useKonfiguratorStore((s) => s.cmsData);
  const fensterform = useKonfiguratorStore((s) => s.fensterform);
  const setSelection = useKonfiguratorStore((s) => s.setSelection);
  const resetDependentSteps = useKonfiguratorStore(
    (s) => s.resetDependentSteps,
  );
  const completeStep = useKonfiguratorStore((s) => s.completeStep);
  const setStep = useKonfiguratorStore((s) => s.setStep);
  const store = useKonfiguratorStore();

  if (!cmsData) return null;

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

  const filteredForms = getFilteredOptions(
    6,
    cmsData,
    selections,
  ) as Fensterform[];

  const handleSelect = (id: string) => {
    if (id !== fensterform) {
      resetDependentSteps(6);
    }
    setSelection("fensterform", id);
    completeStep(6);
    setStep(7);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 6 — Form"
        title="Fensterform wählen"
        description="Rechteck deckt die meisten Einbausituationen ab. Rundbogen & Sonderformen sind nur verfügbar, wenn deine bisherige Konfiguration sie zulässt."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {filteredForms.map((item) => (
          <OptionCard
            key={item.id}
            title={item.name}
            description={item.beschreibung ?? undefined}
            imageUrl={resolveImageUrl(item.bild)}
            badges={[{ text: item.slug }]}
            selected={fensterform === item.id}
            onClick={() => handleSelect(item.id)}
          />
        ))}
      </div>

      {filteredForms.length === 0 ? (
        <div className="mt-8 flex h-32 items-center justify-center rounded-md border border-dashed border-black-200 bg-black-50">
          <span className="text-sm text-black-500">
            Keine passenden Fensterformen für deine Konfiguration verfügbar.
          </span>
        </div>
      ) : null}
    </StepContainer>
  );
}
