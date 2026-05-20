import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionKicker } from "@/components/ui/section-kicker";

/**
 * StepHeader — Titel-Block oben in jedem Konfigurator-Step.
 *
 * Marketing-Idiom in App-Größe:
 *   Kicker (font-mono, brand-600) + H2 (font-heading, medium, leading-[1.1])
 *   + optionale Description in black-600.
 *
 * Props:
 *   kicker       — z. B. "Schritt 2 von 10" oder "Material"
 *   title        — der sichtbare Schritt-Titel
 *   description  — kurzer Erklaertext unter dem Titel
 */

interface StepHeaderProps extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  title: string;
  description?: React.ReactNode;
}

export function StepHeader({
  kicker,
  title,
  description,
  className,
  ...props
}: StepHeaderProps) {
  return (
    <header className={cn("mb-8 md:mb-10", className)} {...props}>
      {kicker ? (
        <SectionKicker tone="brand" className="mb-3">
          {kicker}
        </SectionKicker>
      ) : null}
      <h2 className="font-heading text-2xl font-medium leading-[1.1] tracking-tight text-black-950 md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-black-600 md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
