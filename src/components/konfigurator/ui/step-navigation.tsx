"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { STEPS } from "@/lib/konfigurator/step-config";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking/pirsch";

/**
 * Zurück / Weiter navigation buttons.
 * - Zurück disabled on step 1
 * - Weiter disabled if current step is not complete
 * - On mobile: sticky footer with iOS safe-area padding
 * - On desktop: inline above preview, no border on top
 *
 * Nutzt das tokenisierte <Button> (alternate/primary, size=normal).
 */
export function StepNavigation() {
  const currentStep = useKonfiguratorStore((s) => s.currentStep);
  const completeStep = useKonfiguratorStore((s) => s.completeStep);
  const setStep = useKonfiguratorStore((s) => s.setStep);

  const stepConfig = STEPS.find((s) => s.id === currentStep);
  const selections = useKonfiguratorStore(
    useShallow((s) => ({
      produkttyp: s.produkttyp,
      material: s.material,
      profil: s.profil,
      fluegelanzahl: s.fluegelanzahl,
      zusatzlichter: s.zusatzlichter,
      oeffnungsarten: s.oeffnungsarten,
      fensterform: s.fensterform,
      masse: s.masse,
      farbeAussen: s.farbeAussen,
      farbeInnen: s.farbeInnen,
      dichtungsfarbe: s.dichtungsfarbe,
      gleichWieAussen: s.gleichWieAussen,
      verglasung: s.verglasung,
      schallschutz: s.schallschutz,
      sicherheitsglas: s.sicherheitsglas,
      glasdekor: s.glasdekor,
      sprossen: s.sprossen,
      extras: s.extras,
    })),
  );

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const isComplete = stepConfig?.isComplete(selections) ?? false;

  const handleBack = () => {
    if (!isFirstStep) {
      setStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (isComplete && !isLastStep) {
      trackEvent("Konfigurator Schritt abgeschlossen", {
        schritt: stepConfig?.name ?? `step-${currentStep}`,
        nummer: currentStep,
      });
      // Letzter Schritt vor Zusammenfassung → Konfigurator komplett.
      if (currentStep + 1 === STEPS.length) {
        trackEvent("Konfigurator abgeschlossen", {
          produkttyp: selections.produkttyp ?? "unbekannt",
          material: selections.material ?? "unbekannt",
        });
      }
      completeStep(currentStep);
      setStep(currentStep + 1);
    }
  };

  return (
    <div
      className={cn(
        "bg-white px-[var(--page-padding-inline)] py-4",
        // Mobile: sticky footer with iOS safe area
        "fixed inset-x-0 bottom-0 z-10 border-t border-black-200 pb-[calc(env(safe-area-inset-bottom)+1rem)]",
        // Desktop: inline above preview, no top border
        "lg:static lg:z-auto lg:border-t-0 lg:pb-4",
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
        <Button
          type="button"
          variant="alternate"
          size="normal"
          onClick={handleBack}
          disabled={isFirstStep}
          leadingIcon={<ArrowLeft aria-hidden />}
        >
          Zurück
        </Button>

        <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-500 lg:hidden">
          {currentStep} / {STEPS.length}
        </span>

        <Button
          type="button"
          variant="primary"
          size="normal"
          onClick={handleNext}
          disabled={!isComplete || isLastStep}
          trailingIcon={<ArrowRight aria-hidden />}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
