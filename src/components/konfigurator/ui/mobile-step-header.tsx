"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "@/lib/konfigurator/step-config";
import { useKonfiguratorStore } from "@/lib/konfigurator/store";
import { SectionKicker } from "@/components/ui/section-kicker";

/**
 * Mobile step header — visible only below lg breakpoint.
 * Shows "Schritt N / 10 - Name". Click opens overlay with step list.
 *
 * Marketing-Idiom:
 *   Label im Header als font-mono Kicker + Step-Name in black-950.
 *   Active/Completed/Future analog zur Desktop-Sidebar.
 *   Backdrop: black-950/60 (kein backdrop-filter — Parent-safe).
 */
export function MobileStepHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const currentStep = useKonfiguratorStore((s) => s.currentStep);
  const completedSteps = useKonfiguratorStore((s) => s.completedSteps);
  const goToStep = useKonfiguratorStore((s) => s.goToStep);

  const stepConfig = STEPS.find((s) => s.id === currentStep);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleStepClick = (stepId: number) => {
    goToStep(stepId);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border-b border-black-200 bg-white px-[var(--page-padding-inline)] py-3.5"
      >
        <span className="flex min-w-0 items-baseline gap-3">
          <SectionKicker as="span" className="shrink-0">
            Schritt {currentStep}/{STEPS.length}
          </SectionKicker>
          <span className="truncate text-sm font-medium text-black-950">
            {stepConfig?.name}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-black-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Overlay */}
      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black-950/60"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            role="button"
            tabIndex={-1}
            aria-label="Overlay schließen"
          />

          {/* Step list panel */}
          <div className="fixed inset-x-0 top-0 z-50 max-h-[80vh] overflow-y-auto border-b border-black-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black-200 px-[var(--page-padding-inline)] py-3.5">
              <SectionKicker>Schritte</SectionKicker>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Schließen"
                className="inline-flex size-9 items-center justify-center rounded-full text-black-600 transition-colors hover:bg-black-100 hover:text-black-950"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <ol className="space-y-0.5 p-3">
              {STEPS.map((step) => {
                const isCompleted = completedSteps.has(step.id);
                const isActive = step.id === currentStep;
                const isFuture = !isCompleted && !isActive;

                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isFuture) handleStepClick(step.id);
                      }}
                      disabled={isFuture}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors",
                        isActive && "bg-black-50 font-medium text-black-950",
                        isCompleted && !isActive && "text-black-800",
                        isFuture && "text-black-400",
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
                      <span>{step.name}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      ) : null}
    </div>
  );
}
