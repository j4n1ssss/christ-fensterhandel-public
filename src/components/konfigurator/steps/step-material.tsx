"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import type { BadgeItem } from "@/components/konfigurator/ui/badge-group";
import type { Materialien, Media } from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

/**
 * Step 2: Material selection.
 * Gefiltert nach dem gewählten Produkttyp. Jede Card zeigt Lieferzeit- und
 * Garantie-Badges als Entscheidungs-Helfer.
 */
export function StepMaterial() {
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

  const filteredMaterials = getFilteredOptions(
    2,
    store.cmsData,
    selections,
  ) as Materialien[];

  const handleSelect = (id: string) => {
    if (id !== store.material) {
      store.resetDependentSteps(2);
    }
    store.setSelection("material", id);
    store.completeStep(2);
    store.setStep(3);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 2 — Material"
        title="Material wählen"
        description="Holz, Kunststoff oder Aluminium? Die Wahl bestimmt Dämmwerte, Pflege und verfügbare Profile."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {filteredMaterials.map((item, index) => {
          const badges: BadgeItem[] = [];
          if (index === 0) {
            badges.push({ text: "Beliebt", variant: "default" });
          }
          if (item.lieferzeit_wochen) {
            badges.push({
              text: `${item.lieferzeit_wochen} Wochen Lieferzeit`,
              variant: "info",
            });
          }
          if (item.garantie_jahre) {
            badges.push({
              text: `${item.garantie_jahre} Jahre Garantie`,
              variant: "success",
            });
          }

          return (
            <OptionCard
              key={item.id}
              title={item.name}
              description={item.beschreibung ?? undefined}
              imageUrl={resolveImageUrl(item.bild)}
              badges={badges}
              selected={store.material === item.id}
              onClick={() => handleSelect(item.id)}
            />
          );
        })}
      </div>
    </StepContainer>
  );
}
