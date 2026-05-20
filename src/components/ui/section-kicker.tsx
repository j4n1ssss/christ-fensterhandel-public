import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionKicker — Monospace-Eyebrow über Überschriften.
 *
 * Das visuelle Marketing-Idiom der Website:
 *   font-mono + uppercase + tracking-[0.25em] + klein.
 *
 * Varianten (tone):
 *   muted — black-500 (Default; auf weissem/hellem Grund)
 *   brand — brand-600 (Highlight; für Section-Entry-Points)
 *   onDark — white-60 (auf dunklem Grund)
 */

export type SectionKickerTone = "muted" | "brand" | "onDark";

interface SectionKickerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  tone?: SectionKickerTone;
  /** HTML-Element. Default: p. Für <span> z. B. in Inline-Kontexten. */
  as?: "p" | "span" | "div";
}

const TONE_CLASSES: Record<SectionKickerTone, string> = {
  muted: "text-black-500",
  brand: "text-brand-600",
  onDark: "text-white-60",
};

export function SectionKicker({
  tone = "muted",
  as: Comp = "p",
  className,
  children,
  ...props
}: SectionKickerProps) {
  return (
    <Comp
      className={cn(
        "font-mono text-xs uppercase tracking-[0.25em]",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
