"use client";

import React from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import { OptionCard } from "@/components/konfigurator/ui/option-card";
import { StepContainer } from "@/components/konfigurator/ui/step-container";
import { StepHeader } from "@/components/konfigurator/ui/step-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { cn } from "@/lib/utils";
import type {
  Verglasungen,
  Schallschutz,
  Sicherheitsglas,
  Glasdekore,
  Sprossen,
  Extra,
  Media,
} from "@/payload-types";
import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

function resolveImageUrl(
  bild: string | Media | null | undefined,
): string | undefined {
  if (!bild) return undefined;
  if (typeof bild === "string") return undefined;
  return bild.url ?? undefined;
}

const SG_TYP_LABELS: Record<string, string> = {
  vsg_aussen: "VSG Außen",
  vsg_innen: "VSG Innen",
  vsg_beidseitig: "VSG Beidseitig",
};

const SPROSSEN_TYP_LABELS: Record<string, string> = {
  wiener: "Wiener",
  helima: "Helima",
  aufgesetzt: "Aufgesetzt",
};

const EXTRA_KAT_LABELS: Record<string, string> = {
  griffe: "Griffe",
  beschlaege: "Beschläge",
  sonstiges: "Sonstiges",
};

/**
 * Section-Wrapper mit Kicker-Label + Heading + optionaler Pflicht-Badge.
 * Kicker (brand, mono) gibt jeder Section einen klaren Entry-Point.
 */
function Section({
  kicker,
  title,
  required,
  children,
  firstOfStep,
}: {
  kicker: string;
  title: string;
  required?: boolean;
  firstOfStep?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(!firstOfStep && "border-t border-black-200 pt-8")}>
      <SectionKicker tone="brand" className="mb-2">
        {kicker}
      </SectionKicker>
      <h3 className="flex flex-wrap items-baseline gap-3 font-heading text-lg font-medium text-black-950 md:text-xl">
        {title}
        {required ? (
          <span className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-error-600">
            Pflichtfeld
          </span>
        ) : null}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Step 9: Verglasung & Extras.
 * Multi-Section mit Verglasung (pflicht), Schallschutz, Sicherheitsglas,
 * Glasdekor, Sprossen (alle optional), Extras (multi-select, optional).
 */
export function StepVerglasungExtras() {
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

  const data = getFilteredOptions(9, store.cmsData, selections) as {
    verglasungen: Verglasungen[];
    schallschutz: Schallschutz[] | null;
    sicherheitsglas: Sicherheitsglas[] | null;
    glasdekore: Glasdekore[] | null;
    sprossen: Sprossen[] | null;
    extras: Extra[] | null;
  };

  const extrasGroups: Record<string, Extra[]> = {};
  if (data.extras) {
    for (const ex of data.extras) {
      const key = ex.kategorie || "sonstiges";
      if (!extrasGroups[key]) extrasGroups[key] = [];
      extrasGroups[key].push(ex);
    }
  }

  const checkComplete = (verglasungId: string | null) => {
    if (verglasungId) {
      store.completeStep(9);
    }
  };

  const handleSelectVerglasung = (id: string) => {
    store.setSelection("verglasung", id);
    checkComplete(id);
  };

  const handleSelectOptional = (
    key: keyof KonfiguratorSelections,
    id: string | null,
  ) => {
    store.setSelection(key, id);
  };

  const handleToggleExtra = (id: string) => {
    const current = store.extras;
    const updated = current.includes(id)
      ? current.filter((e) => e !== id)
      : [...current, id];
    store.setSelection("extras", updated);
  };

  const gridClass =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3";

  return (
    <StepContainer contentClassName="max-w-[var(--layout-md)]">
      <StepHeader
        kicker="Schritt 9 — Verglasung & Extras"
        title="Verglasung & Extras"
        description="Die Verglasung ist pflicht — alle weiteren Optionen nur bei Bedarf. Lass Sektionen leer, wenn du sie nicht brauchst."
      />

      <div className="space-y-10">
        {/* Verglasung (required) */}
        <Section kicker="Glas" title="Verglasung" required firstOfStep>
          <div className={gridClass}>
            {data.verglasungen.map((v) => (
              <OptionCard
                key={v.id}
                title={v.name}
                description={v.beschreibung ?? undefined}
                badges={[
                  ...(v.ug_wert != null ? [{ text: `Ug ${v.ug_wert}` }] : []),
                  ...(v.aufpreis != null && v.aufpreis > 0
                    ? [{ text: `+${v.aufpreis} EUR` }]
                    : []),
                ]}
                selected={store.verglasung === v.id}
                onClick={() => handleSelectVerglasung(v.id)}
              />
            ))}
          </div>
        </Section>

        {/* Schallschutz (optional) */}
        {data.schallschutz !== null ? (
          <Section kicker="Akustik" title="Schallschutz">
            <div className={gridClass}>
              <OptionCard
                title="Kein Schallschutz"
                selected={store.schallschutz === null}
                onClick={() => handleSelectOptional("schallschutz", null)}
              />
              {data.schallschutz.map((s) => (
                <OptionCard
                  key={s.id}
                  title={s.name}
                  description={s.beschreibung ?? undefined}
                  badges={[
                    ...(s.schallschutzklasse != null
                      ? [
                          {
                            text: `Klasse ${s.schallschutzklasse}`,
                            variant: "info" as const,
                          },
                        ]
                      : []),
                    ...(s.aufpreis != null && s.aufpreis > 0
                      ? [{ text: `+${s.aufpreis} EUR` }]
                      : []),
                  ]}
                  selected={store.schallschutz === s.id}
                  onClick={() => handleSelectOptional("schallschutz", s.id)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Sicherheitsglas (optional) */}
        {data.sicherheitsglas !== null ? (
          <Section kicker="Sicherheit" title="Sicherheitsglas">
            <div className={gridClass}>
              <OptionCard
                title="Keins"
                selected={store.sicherheitsglas === null}
                onClick={() => handleSelectOptional("sicherheitsglas", null)}
              />
              {data.sicherheitsglas.map((s) => (
                <OptionCard
                  key={s.id}
                  title={s.name}
                  description={s.beschreibung ?? undefined}
                  badges={[
                    ...(s.typ
                      ? [
                          {
                            text: SG_TYP_LABELS[s.typ] || s.typ,
                            variant: "info" as const,
                          },
                        ]
                      : []),
                    ...(s.aufpreis != null && s.aufpreis > 0
                      ? [{ text: `+${s.aufpreis} EUR` }]
                      : []),
                  ]}
                  selected={store.sicherheitsglas === s.id}
                  onClick={() => handleSelectOptional("sicherheitsglas", s.id)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Glasdekor (optional) */}
        {data.glasdekore !== null ? (
          <Section kicker="Dekor" title="Glasdekor">
            <div className={gridClass}>
              <OptionCard
                title="Keins"
                selected={store.glasdekor === null}
                onClick={() => handleSelectOptional("glasdekor", null)}
              />
              {data.glasdekore.map((g) => (
                <OptionCard
                  key={g.id}
                  title={g.name}
                  description={g.beschreibung ?? undefined}
                  imageUrl={resolveImageUrl(g.bild)}
                  badges={
                    g.aufpreis != null && g.aufpreis > 0
                      ? [{ text: `+${g.aufpreis} EUR` }]
                      : undefined
                  }
                  selected={store.glasdekor === g.id}
                  onClick={() => handleSelectOptional("glasdekor", g.id)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Sprossen (optional) */}
        {data.sprossen !== null ? (
          <Section kicker="Sprossen" title="Sprossen">
            <div className={gridClass}>
              <OptionCard
                title="Keine"
                selected={store.sprossen === null}
                onClick={() => handleSelectOptional("sprossen", null)}
              />
              {data.sprossen.map((sp) => (
                <OptionCard
                  key={sp.id}
                  title={sp.name}
                  description={sp.beschreibung ?? undefined}
                  badges={[
                    ...(sp.typ
                      ? [
                          {
                            text: SPROSSEN_TYP_LABELS[sp.typ] || sp.typ,
                            variant: "info" as const,
                          },
                        ]
                      : []),
                    ...(sp.aufpreis != null && sp.aufpreis > 0
                      ? [{ text: `+${sp.aufpreis} EUR` }]
                      : []),
                  ]}
                  selected={store.sprossen === sp.id}
                  onClick={() => handleSelectOptional("sprossen", sp.id)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Extras (optional, multi-select) */}
        {data.extras !== null ? (
          <Section kicker="Extras" title="Weitere Extras">
            {Object.entries(extrasGroups).map(([kategorie, extras]) => (
              <div key={kategorie} className="mt-5 first:mt-0">
                <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.15em] text-black-500">
                  {EXTRA_KAT_LABELS[kategorie] || kategorie}
                </p>
                <div className={gridClass}>
                  {extras.map((ex) => (
                    <OptionCard
                      key={ex.id}
                      title={ex.name}
                      description={ex.beschreibung ?? undefined}
                      imageUrl={resolveImageUrl(ex.bild)}
                      badges={
                        ex.aufpreis != null && ex.aufpreis > 0
                          ? [{ text: `+${ex.aufpreis} EUR` }]
                          : undefined
                      }
                      selected={store.extras.includes(ex.id)}
                      onClick={() => handleToggleExtra(ex.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {data.extras.length === 0 ? (
              <p className="text-sm text-black-500">
                Keine Extras verfügbar.
              </p>
            ) : null}
          </Section>
        ) : null}
      </div>
    </StepContainer>
  );
}
