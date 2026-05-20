"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "@/lib/konfigurator/step-config";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { SectionKicker } from "@/components/ui/section-kicker";

/**
 * Left-hand step sidebar — visible at lg+.
 *
 * Marketing-Idiom-Mapping:
 *   Active     → bg-black-50, text-black-950 (neutraler Focus)
 *   Completed  → text-black-900, hover:bg-black-50
 *   Future     → text-black-400 (gedeckt, nicht dead)
 *   Indicator  → Check in brand-500 Kreis (fertig), Kontur-Kreis in black-950 (aktiv),
 *                dezenter Kontur-Kreis in black-200 (future).
 */
export function StepSidebar() {
  const currentStep = useKonfiguratorStore((s) => s.currentStep);
  const completedSteps = useKonfiguratorStore((s) => s.completedSteps);
  const goToStep = useKonfiguratorStore((s) => s.goToStep);

  return (
    <nav className="hidden w-64 shrink-0 border-r border-black-200 bg-white p-5 lg:block">
      <SectionKicker className="mb-5">Konfiguration</SectionKicker>
      <ol className="space-y-0.5">
        {STEPS.map((step) => {
          const isCompleted = completedSteps.has(step.id);
          const isActive = step.id === currentStep;
          const isFuture = !isCompleted && !isActive;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (isCompleted || isActive) {
                    goToStep(step.id);
                  }
                }}
                disabled={isFuture}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  isActive && "bg-black-50 font-medium text-black-950",
                  isCompleted &&
                    !isActive &&
                    "cursor-pointer text-black-800 hover:bg-black-50",
                  isFuture && "cursor-default text-black-400",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-mono transition-colors",
                    isCompleted && "bg-brand-500 text-white",
                    isActive &&
                      !isCompleted &&
                      "border-2 border-black-950 text-black-950",
                    isFuture && "border border-black-200 text-black-400",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : (
                    step.id
                  )}
                </span>
                <span className="truncate">{step.name}</span>
                {isActive ? (
                  <ChevronRight
                    className="ml-auto size-4 shrink-0 text-black-950"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
