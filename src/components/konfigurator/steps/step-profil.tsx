"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import type { BadgeItem } from "@/components/konfigurator/ui/badge-group";
import type { Profile, Media } from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

/** Map Qualitaetsstufe auf Badge-Variant. */
const QUALITAET_BADGE: Record<string, BadgeItem> = {
  einstieg: { text: "Einstieg", variant: "default" },
  standard: { text: "Standard", variant: "info" },
  premium: { text: "Premium", variant: "success" },
  top: { text: "Top", variant: "success" },
};

/**
 * Step 3: Profil selection.
 * Gefiltert nach gewähltem Material. Unter jeder Card erscheint eine
 * Spec-Box mit den technischen Kennwerten (Uw, Kammern, Bautiefe, Dichtungen).
 */
export function StepProfil() {
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

  const filteredProfiles = getFilteredOptions(
    3,
    store.cmsData,
    selections,
  ) as Profile[];

  const handleSelect = (id: string) => {
    if (id !== store.profil) {
      store.resetDependentSteps(3);
    }
    store.setSelection("profil", id);
    store.completeStep(3);
    store.setStep(4);
  };

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 3 — Profil"
        title="Profil wählen"
        description="Das Profil bestimmt Dämmwerte und Optik. Die technischen Daten helfen beim Vergleich."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {filteredProfiles.map((item) => {
          const badges: BadgeItem[] = [];
          if (item.qualitaetsstufe && QUALITAET_BADGE[item.qualitaetsstufe]) {
            badges.push(QUALITAET_BADGE[item.qualitaetsstufe]);
          }

          return (
            <div key={item.id} className="flex flex-col">
              <OptionCard
                title={item.name_einfach}
                description={item.name_technisch}
                imageUrl={resolveImageUrl(item.bild)}
                badges={badges}
                selected={store.profil === item.id}
                onClick={() => handleSelect(item.id)}
              />
              {/* Technical specs below the card */}
              <dl className="mt-2 space-y-1 rounded-md bg-black-50 px-3 py-2.5 text-xs">
                {item.technische_daten?.uw_wert != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-black-500">Uw-Wert</dt>
                    <dd className="font-mono font-medium text-black-900 tabular-nums">
                      {item.technische_daten.uw_wert} W/(m&#178;K)
                    </dd>
                  </div>
                )}
                {item.technische_daten?.kammern != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-black-500">Kammern</dt>
                    <dd className="font-mono font-medium text-black-900 tabular-nums">
                      {item.technische_daten.kammern}
                    </dd>
                  </div>
                )}
                {item.technische_daten?.bautiefe_mm != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-black-500">Bautiefe</dt>
                    <dd className="font-mono font-medium text-black-900 tabular-nums">
                      {item.technische_daten.bautiefe_mm} mm
                    </dd>
                  </div>
                )}
                {item.technische_daten?.dichtungen != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-black-500">Dichtungen</dt>
                    <dd className="font-mono font-medium text-black-900 tabular-nums">
                      {item.technische_daten.dichtungen}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          );
        })}
      </div>
    </StepContainer>
  );
}
