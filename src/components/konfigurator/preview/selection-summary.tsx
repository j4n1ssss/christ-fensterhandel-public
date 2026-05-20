"use client";

import React from "react";
import { Check } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { STEPS } from "@/lib/konfigurator/step-config";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import type { CMSData } from "@/lib/konfigurator/types";

/**
 * Maps step IDs to the selection keys and CMS collection for label resolution.
 */
const STEP_DISPLAY_MAP: Record<
  number,
  { key: string; collection?: keyof CMSData; label?: string }[]
> = {
  1: [{ key: "produkttyp", collection: "produkttypen" }],
  2: [{ key: "material", collection: "materialien" }],
  3: [{ key: "profil", collection: "profile" }],
  4: [{ key: "fluegelanzahl", collection: "fluegelanzahl" }],
  5: [{ key: "oeffnungsarten", label: "Öffnungsart" }],
  6: [{ key: "fensterform", collection: "fensterformen" }],
  7: [{ key: "masse", label: "Maße" }],
  8: [
    { key: "farbeAussen", collection: "farben", label: "Außen" },
    { key: "farbeInnen", collection: "farben", label: "Innen" },
    { key: "dichtungsfarbe", collection: "dichtungsfarben" },
  ],
  9: [
    { key: "verglasung", collection: "verglasungen" },
    { key: "schallschutz", collection: "schallschutz" },
    { key: "sicherheitsglas", collection: "sicherheitsglas" },
  ],
};

/**
 * Resolve a UUID or string ID to a display name using CMS data.
 */
function resolveDisplayName(
  value: string | null,
  collection: keyof CMSData | undefined,
  cmsData: CMSData | null,
): string | null {
  if (!value || !collection || !cmsData) return value;
  const items = cmsData[collection] as Array<{
    id: number | string;
    name?: string;
    titel?: string;
  }>;
  if (!items) return value;
  const found = items.find((item) => String(item.id) === String(value));
  return found?.name || found?.titel || value;
}

/**
 * Shows a summary of all completed step selections in the preview panel.
 * For each completed step: checkmark + step name + selected option label.
 */
export function SelectionSummary() {
  const completedSteps = useKonfiguratorStore((s) => s.completedSteps);
  const cmsData = useKonfiguratorStore((s) => s.cmsData);
  const selections = useKonfiguratorStore(
    useShallow((s) => ({
      produkttyp: s.produkttyp,
      material: s.material,
      profil: s.profil,
      fluegelanzahl: s.fluegelanzahl,
      oeffnungsarten: s.oeffnungsarten,
      fensterform: s.fensterform,
      masse: s.masse,
      farbeAussen: s.farbeAussen,
      farbeInnen: s.farbeInnen,
      dichtungsfarbe: s.dichtungsfarbe,
      verglasung: s.verglasung,
      schallschutz: s.schallschutz,
      sicherheitsglas: s.sicherheitsglas,
    })),
  );

  const completedStepIds = Array.from(completedSteps).sort((a, b) => a - b);

  if (completedStepIds.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-black-500">
        Noch keine Auswahl getroffen.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {completedStepIds.map((stepId) => {
        const stepConfig = STEPS.find((s) => s.id === stepId);
        const displayEntries = STEP_DISPLAY_MAP[stepId];
        if (!stepConfig || !displayEntries) return null;

        const values: string[] = [];
        for (const entry of displayEntries) {
          const raw = selections[entry.key as keyof typeof selections];
          if (raw === null || raw === undefined) continue;

          if (
            entry.key === "masse" &&
            typeof raw === "object" &&
            "breite" in raw
          ) {
            values.push(`${raw.breite} x ${raw.hoehe} mm`);
          } else if (entry.key === "oeffnungsarten" && Array.isArray(raw)) {
            if (raw.length > 0) {
              values.push(`${raw.length} Flügel konfiguriert`);
            }
          } else if (typeof raw === "string") {
            const resolved = resolveDisplayName(raw, entry.collection, cmsData);
            const prefix = entry.label ? `${entry.label}: ` : "";
            values.push(`${prefix}${resolved || raw}`);
          }
        }

        if (values.length === 0) return null;

        return (
          <li key={stepId} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white",
              )}
              aria-hidden
            >
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            <div className="min-w-0 text-xs leading-snug">
              <span className="font-medium text-black-900">
                {stepConfig.name}
              </span>
              <span className="ml-1 text-black-500">
                — {values.join(", ")}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
