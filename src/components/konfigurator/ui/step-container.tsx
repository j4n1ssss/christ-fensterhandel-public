import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StepContainer — scrollbarer Content-Bereich eines Konfigurator-Steps.
 *
 * Ersetzt das bisherige hardcoded `flex-1 overflow-y-auto p-6 lg:p-8`.
 * Nutzt den responsiven `--page-padding-inline`-Token für horizontale Insets
 * (24 px mobile / 32 px tablet / 48 px desktop, wie im Marketing-Idiom).
 *
 * Das innere Content-Wrapper begrenzt die Lesebreite auf `--layout-sm`
 * (48 rem), damit Step-Inhalte auf großen Bildschirmen nicht ins Leere laufen.
 * Überschreibbar über `contentClassName`, z. B. `max-w-[var(--layout-md)]`
 * für breitere Grids.
 */

interface StepContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Klasse auf den inneren Wrapper (z. B. andere max-width). */
  contentClassName?: string;
}

export function StepContainer({
  className,
  contentClassName,
  children,
  ...props
}: StepContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        "px-[var(--page-padding-inline)]",
        "py-8 md:py-10 lg:py-12",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[var(--layout-sm)]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
