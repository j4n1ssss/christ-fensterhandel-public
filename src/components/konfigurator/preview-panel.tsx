"use client";

import React, { useCallback } from "react";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { SectionKicker } from "@/components/ui/section-kicker";
import { WindowSVG } from "./preview/window-svg";
import { SelectionSummary } from "./preview/selection-summary";

/**
 * Right-side preview panel showing window SVG and selection summary.
 * Tokenized surfaces: bg-black-50 für den Vorschau-Rahmen, black-200 Lines.
 */
export function PreviewPanel() {
  const cmsData = useKonfiguratorStore((s) => s.cmsData);
  const fluegelanzahl = useKonfiguratorStore((s) => s.fluegelanzahl);
  const fensterform = useKonfiguratorStore((s) => s.fensterform);
  const masse = useKonfiguratorStore((s) => s.masse);
  const oeffnungsarten = useKonfiguratorStore((s) => s.oeffnungsarten);
  const zusatzlichter = useKonfiguratorStore((s) => s.zusatzlichter);
  const farbeAussen = useKonfiguratorStore((s) => s.farbeAussen);
  const sprossenId = useKonfiguratorStore((s) => s.sprossen);

  const selectedFluegel = cmsData?.fluegelanzahl.find(
    (f) => f.id === fluegelanzahl,
  );
  const wingCount = selectedFluegel?.anzahl ?? 1;

  const selectedForm = cmsData?.fensterformen.find((f) => f.id === fensterform);
  const form = selectedForm?.slug?.includes("rundbogen")
    ? ("rundbogen" as const)
    : ("rechteck" as const);

  const displayWidth = masse?.breite ?? 100;
  const displayHeight = masse?.hoehe ?? 120;

  const selectedFarbe = cmsData?.farben.find((f) => f.id === farbeAussen);
  const resolvedFrameColor = selectedFarbe?.farb_code ?? "#888";

  const selectedSprossen = cmsData?.sprossen.find((s) => s.id === sprossenId);
  const sprossenTyp = selectedSprossen?.typ ?? null;

  const hasOberlicht = cmsData
    ? zusatzlichter.some((zId) => {
        const z = cmsData.zusatzlichter.find((item) => item.id === zId);
        return z?.slug === "oberlicht";
      })
    : false;

  const hasUnterlicht = cmsData
    ? zusatzlichter.some((zId) => {
        const z = cmsData.zusatzlichter.find((item) => item.id === zId);
        return z?.slug === "unterlicht";
      })
    : false;

  const resolveOaSlug = useCallback(
    (id: string): string | undefined => {
      if (!cmsData) return undefined;
      return cmsData.oeffnungsarten.find((oa) => oa.id === id)?.slug;
    },
    [cmsData],
  );

  return (
    <aside className="p-5 md:p-6">
      <SectionKicker>Vorschau</SectionKicker>

      {/* Window SVG */}
      <div className="mt-4 flex aspect-square items-center justify-center rounded-[var(--radius)] border border-black-200 bg-black-50 p-4">
        <WindowSVG
          wingCount={wingCount}
          frameColor={resolvedFrameColor}
          form={form}
          width={displayWidth}
          height={displayHeight}
          wingOpenings={oeffnungsarten}
          hasOberlicht={hasOberlicht}
          hasUnterlicht={hasUnterlicht}
          masseMm={masse}
          sprossenTyp={sprossenTyp}
          resolveOaSlug={resolveOaSlug}
        />
      </div>

      {/* Selection Summary */}
      <div className="mt-6">
        <SectionKicker className="mb-3">Ihre Auswahl</SectionKicker>
        <SelectionSummary />
      </div>
    </aside>
  );
}
