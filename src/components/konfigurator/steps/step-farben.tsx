"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";
import type { Farben, Dichtungsfarben } from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

/**
 * Color swatch card für Farben und Dichtungsfarben.
 * Zeigt Farb-Plaettchen + Name + (optional) Aufpreis.
 */
function ColorSwatch({
  name,
  farbCode,
  aufpreis,
  selected,
  disabled,
  onClick,
}: {
  name: string;
  farbCode: string | null | undefined;
  aufpreis?: number | null;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-md border p-3 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        selected
          ? "border-brand-500 bg-brand-50/40 shadow-sm ring-2 ring-brand-500/25"
          : "border-black-200 bg-white hover:border-brand-500/60 hover:shadow-sm",
      )}
    >
      <div
        className="size-10 rounded-sm border border-black-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
        style={{ backgroundColor: farbCode || "#ccc" }}
        aria-hidden
      />
      <span
        className={cn(
          "text-xs font-medium leading-tight",
          selected ? "text-brand-800" : "text-black-900",
        )}
      >
        {name}
      </span>
      {aufpreis != null && aufpreis > 0 ? (
        <span className="font-mono text-[11px] tabular-nums text-black-500">
          +{aufpreis} EUR
        </span>
      ) : null}
    </button>
  );
}

/** Farben nach Kategorie gruppieren für strukturierte Anzeige. */
function groupByKategorie(farben: Farben[]): Record<string, Farben[]> {
  const groups: Record<string, Farben[]> = {};
  for (const f of farben) {
    const key = f.kategorie || "standard";
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }
  return groups;
}

const KATEGORIE_LABELS: Record<string, string> = {
  standard: "Standard",
  dekor: "Dekor",
  uni: "Uni",
  ral_sonderfarbe: "RAL Sonderfarbe",
};

/**
 * Step 8: Farbauswahl.
 * Drei Sektionen: Außenfarbe, Innenfarbe (mit "Gleich wie Außen"-Toggle),
 * Dichtungsfarbe. Farben sind nach Material gefiltert.
 */
export function StepFarben() {
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

  const filtered = getFilteredOptions(8, store.cmsData, selections) as {
    aussen: Farben[];
    innen: Farben[];
    dichtungsfarben: Dichtungsfarben[];
  };

  const dichtungsfarben = filtered.dichtungsfarben;
  const aussenGroups = groupByKategorie(filtered.aussen);
  const innenGroups = groupByKategorie(filtered.innen);

  const checkComplete = (
    farbeAussen: string | null,
    farbeInnen: string | null,
    dichtungsfarbe: string | null,
    gleichWieAussen: boolean,
  ) => {
    const aussenOk = farbeAussen !== null;
    const innenOk = gleichWieAussen || farbeInnen !== null;
    const dichtungOk = dichtungsfarbe !== null;

    if (aussenOk && innenOk && dichtungOk) {
      store.completeStep(8);
      store.setStep(9);
    }
  };

  const handleSelectAussen = (id: string) => {
    store.setSelection("farbeAussen", id);
    if (store.gleichWieAussen) {
      store.setSelection("farbeInnen", id);
    }
    checkComplete(
      id,
      store.gleichWieAussen ? id : store.farbeInnen,
      store.dichtungsfarbe,
      store.gleichWieAussen,
    );
  };

  const handleSelectInnen = (id: string) => {
    store.setSelection("farbeInnen", id);
    checkComplete(
      store.farbeAussen,
      id,
      store.dichtungsfarbe,
      store.gleichWieAussen,
    );
  };

  const handleToggleGleich = () => {
    const newValue = !store.gleichWieAussen;
    store.setSelection("gleichWieAussen", newValue);
    if (newValue && store.farbeAussen) {
      store.setSelection("farbeInnen", store.farbeAussen);
      checkComplete(
        store.farbeAussen,
        store.farbeAussen,
        store.dichtungsfarbe,
        true,
      );
    } else {
      checkComplete(
        store.farbeAussen,
        store.farbeInnen,
        store.dichtungsfarbe,
        newValue,
      );
    }
  };

  const handleSelectDichtung = (id: string) => {
    store.setSelection("dichtungsfarbe", id);
    const effectiveInnen = store.gleichWieAussen
      ? store.farbeAussen
      : store.farbeInnen;
    checkComplete(store.farbeAussen, effectiveInnen, id, store.gleichWieAussen);
  };

  const sectionHeading =
    "font-heading text-lg font-medium text-black-950 md:text-xl";

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 8 — Farben"
        title="Farben wählen"
        description="Außen, innen und Dichtung — in dieser Reihenfolge. Die Auswahl ist nach deinem Material gefiltert."
      />

      <div className="space-y-10">
        {/* Section 1: Außenfarbe */}
        <section>
          <SectionKicker tone="brand" className="mb-2">
            Außen
          </SectionKicker>
          <h3 className={sectionHeading}>Außenfarbe</h3>
          {Object.entries(aussenGroups).map(([kategorie, farben]) => (
            <div key={kategorie} className="mt-5">
              <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                {KATEGORIE_LABELS[kategorie] || kategorie}
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {farben.map((f) => (
                  <ColorSwatch
                    key={f.id}
                    name={f.name}
                    farbCode={f.farb_code}
                    aufpreis={f.aufpreis}
                    selected={store.farbeAussen === f.id}
                    onClick={() => handleSelectAussen(f.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Section 2: Innenfarbe */}
        <section className="border-t border-black-200 pt-8">
          <SectionKicker tone="brand" className="mb-2">
            Innen
          </SectionKicker>
          <div className="flex flex-wrap items-center gap-5">
            <h3 className={sectionHeading}>Innenfarbe</h3>
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-black-700">
              <input
                type="checkbox"
                checked={store.gleichWieAussen}
                onChange={handleToggleGleich}
                className="size-4 rounded border-black-300 accent-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              <span>Gleich wie Außenfarbe</span>
            </label>
          </div>

          {store.gleichWieAussen ? (
            <p className="mt-4 text-sm leading-relaxed text-black-600">
              Innenfarbe wird automatisch von der Außenfarbe uebernommen.
            </p>
          ) : (
            Object.entries(innenGroups).map(([kategorie, farben]) => (
              <div key={kategorie} className="mt-5">
                <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                  {KATEGORIE_LABELS[kategorie] || kategorie}
                </p>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {farben.map((f) => (
                    <ColorSwatch
                      key={f.id}
                      name={f.name}
                      farbCode={f.farb_code}
                      aufpreis={f.aufpreis}
                      selected={store.farbeInnen === f.id}
                      onClick={() => handleSelectInnen(f.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Section 3: Dichtungsfarbe */}
        <section className="border-t border-black-200 pt-8">
          <SectionKicker tone="brand" className="mb-2">
            Dichtung
          </SectionKicker>
          <h3 className={sectionHeading}>Dichtungsfarbe</h3>
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {dichtungsfarben.map((d) => (
              <ColorSwatch
                key={d.id}
                name={d.name}
                farbCode={d.farb_code}
                selected={store.dichtungsfarbe === d.id}
                onClick={() => handleSelectDichtung(d.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </StepContainer>
  );
}
