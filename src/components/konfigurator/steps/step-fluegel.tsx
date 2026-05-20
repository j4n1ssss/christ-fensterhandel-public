"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";
import type { Fluegelanzahl, Zusatzlichter } from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

/** Extract ID from a Payload relationship field. */
function extractId(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}

/**
 * Step 4: Flügel selection.
 * Section 1: Flügelanzahl-Cards (gefiltert nach Produkttyp).
 * Section 2: Optionale Zusatzlichter (Ober-/Unterlicht) als Toggle-Buttons.
 */
export function StepFluegel() {
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

  const step4Result = getFilteredOptions(4, store.cmsData, selections);

  const filteredFluegel: Fluegelanzahl[] = Array.isArray(step4Result)
    ? (step4Result as Fluegelanzahl[])
    : (
        step4Result as {
          fluegelanzahl: Fluegelanzahl[];
          zusatzlichter: Zusatzlichter[] | null;
        }
      ).fluegelanzahl;

  const hubZusatzlichter = !Array.isArray(step4Result)
    ? (
        step4Result as {
          fluegelanzahl: Fluegelanzahl[];
          zusatzlichter: Zusatzlichter[] | null;
        }
      ).zusatzlichter
    : null;

  const filteredZusatzlichter: Zusatzlichter[] =
    hubZusatzlichter !== null && hubZusatzlichter !== undefined
      ? hubZusatzlichter
      : store.fluegelanzahl
        ? store.cmsData.zusatzlichter.filter((z) =>
            z.kombinierbar_mit?.some(
              (f) => extractId(f) === store.fluegelanzahl,
            ),
          )
        : [];

  const handleSelectFluegel = (id: string) => {
    if (id !== store.fluegelanzahl) {
      store.resetDependentSteps(4);
      store.setSelection("zusatzlichter", []);
    }
    store.setSelection("fluegelanzahl", id);
    store.completeStep(4);
    store.setStep(5);
  };

  const handleToggleZusatzlicht = (id: string) => {
    const current = store.zusatzlichter;
    const isSelected = current.includes(id);
    const updated = isSelected
      ? current.filter((z) => z !== id)
      : [...current, id];
    store.setSelection("zusatzlichter", updated);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 4 — Flügel"
        title="Flügelanzahl wählen"
        description="Wie viele Flügel soll dein Fenster haben? Danach kannst du optional Ober- oder Unterlichter ergänzen."
      />

      {/* Section 1: Flügelanzahl */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {filteredFluegel.map((item) => (
          <OptionCard
            key={item.id}
            title={item.name}
            selected={store.fluegelanzahl === item.id}
            onClick={() => handleSelectFluegel(item.id)}
          />
        ))}
      </div>

      {/* Section 2: Zusatzlichter (optional) */}
      {filteredZusatzlichter.length > 0 ? (
        <div className="mt-10 border-t border-black-200 pt-8">
          <SectionKicker tone="muted" className="mb-3">
            Optional
          </SectionKicker>
          <h3 className="font-heading text-lg font-medium text-black-950 md:text-xl">
            Zusatzlichter
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-black-600">
            Oberlicht oder Unterlicht hinzufügen — sinnvoll bei hohen Räumen
            oder Treppenhaeusern.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {filteredZusatzlichter.map((item) => {
              const isSelected = store.zusatzlichter.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleZusatzlicht(item.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-black-200 bg-white text-black-800 hover:border-brand-500/60 hover:bg-black-50",
                  )}
                >
                  {item.name}
                  {item.beschreibung ? (
                    <span className="ml-1.5 text-xs text-black-500">
                      ({item.beschreibung})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </StepContainer>
  );
}
