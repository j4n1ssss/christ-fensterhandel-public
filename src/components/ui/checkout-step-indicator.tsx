import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionKicker } from "@/components/ui/section-kicker";

/**
 * CheckoutStepIndicator — schlankes Progress-Element für mehrstufige Flows
 * (Warenkorb → Anfrage → Zusammenfassung → Danke).
 *
 * Marketing-Idiom: sehr dezent.
 *   - Kicker links: "Schritt {n} von {total}"
 *   - Mono-Label rechts: Name des aktuellen Schritts
 *   - Duenne Balken (2 px) in black-950 (aktiv/fertig) vs. black-200 (noch offen)
 *
 * Variante `variant="bars"` zeigt einen Balken pro Schritt; `variant="segments"`
 * zeigt einen durchgehenden Balken mit Fortschritts-Segment. Default: bars.
 */

export interface CheckoutStep {
  /** Kurzer Anzeige-Label (z. B. "Warenkorb", "Kontaktdaten"). */
  label: string;
}

interface CheckoutStepIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  steps: CheckoutStep[];
  /** 0-basierter Index des aktuellen Schritts. */
  currentStep: number;
  /** Optional: "bars" (pro Schritt) oder "segments" (ein Balken). */
  variant?: "bars" | "segments";
}

export function CheckoutStepIndicator({
  steps,
  currentStep,
  variant = "bars",
  className,
  ...props
}: CheckoutStepIndicatorProps) {
  const total = steps.length;
  const clamped = Math.max(0, Math.min(currentStep, total - 1));
  const current = steps[clamped];
  const progress = total > 1 ? clamped / (total - 1) : 1;

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      role="group"
      aria-label={`Fortschritt: Schritt ${clamped + 1} von ${total}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <SectionKicker>
          Schritt {clamped + 1} von {total}
        </SectionKicker>
        {current ? (
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-black-700">
            {current.label}
          </span>
        ) : null}
      </div>

      {variant === "bars" ? (
        <div className="flex items-center gap-1.5" aria-hidden>
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-[2px] flex-1 rounded-full transition-colors duration-300",
                idx <= clamped ? "bg-black-950" : "bg-black-200",
              )}
            />
          ))}
        </div>
      ) : (
        <div className="relative h-[2px] w-full rounded-full bg-black-200" aria-hidden>
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-black-950 transition-[width] duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
