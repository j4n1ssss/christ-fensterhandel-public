"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import type { Media } from "@/payload-types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

/**
 * Step 1: Produkttyp selection.
 * Zeigt alle Produkttypen als Image-Cards. Auswahl rührt cascade-reset an
 * und springt direkt zu Step 2.
 */
export function StepProdukttyp() {
  const cmsData = useKonfiguratorStore((s) => s.cmsData);
  const produkttyp = useKonfiguratorStore((s) => s.produkttyp);
  const setSelection = useKonfiguratorStore((s) => s.setSelection);
  const resetDependentSteps = useKonfiguratorStore(
    (s) => s.resetDependentSteps,
  );
  const completeStep = useKonfiguratorStore((s) => s.completeStep);
  const setStep = useKonfiguratorStore((s) => s.setStep);

  if (!cmsData) return null;

  const handleSelect = (id: string) => {
    if (id !== produkttyp) {
      resetDependentSteps(1);
    }
    setSelection("produkttyp", id);
    completeStep(1);
    setStep(2);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 1 — Produkttyp"
        title="Produkttyp wählen"
        description="Wähle zunächst die Produkt-Kategorie. Jede Option schaltet später andere Materialien und Profile frei."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {cmsData.produkttypen.map((item) => (
          <OptionCard
            key={item.id}
            title={item.name}
            description={item.beschreibung ?? undefined}
            imageUrl={resolveImageUrl(item.bild)}
            selected={produkttyp === item.id}
            onClick={() => handleSelect(item.id)}
          />
        ))}
      </div>
    </StepContainer>
  );
}
