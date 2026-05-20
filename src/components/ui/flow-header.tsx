import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionKicker, type SectionKickerTone } from "@/components/ui/section-kicker";

/**
 * FlowHeader — Page-Header für Sub-Pages (Warenkorb, Anfrage, Zusammenfassung, Danke).
 *
 * Marketing-Idiom: Kicker + große H1 (font-heading, leading-[1.05], tracking-tight)
 * + optionaler Body-Text in black-600.
 *
 * Props:
 *   kicker         — Monospace-Label über der H1 (z. B. "Warenkorb", "Schritt 2 von 3")
 *   kickerTone     — tone für den Kicker (default: brand)
 *   title          — H1-Text
 *   description    — optional; erscheint unter der H1 mit max-w-container-xl
 *   align          — "start" (default) | "center"
 *   size           — "default" (4xl → 6xl) | "compact" (3xl → 5xl) für engere Pages
 *   as             — H-Level (default h1; nutze h2 wenn der Header intern ist)
 */

export type FlowHeaderSize = "default" | "compact";
export type FlowHeaderAlign = "start" | "center";

interface FlowHeaderProps extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  kickerTone?: SectionKickerTone;
  title: string;
  description?: React.ReactNode;
  align?: FlowHeaderAlign;
  size?: FlowHeaderSize;
  as?: "h1" | "h2";
}

const TITLE_SIZE: Record<FlowHeaderSize, string> = {
  default:
    "text-4xl md:text-5xl lg:text-6xl",
  compact:
    "text-3xl md:text-4xl lg:text-5xl",
};

export function FlowHeader({
  kicker,
  kickerTone = "brand",
  title,
  description,
  align = "start",
  size = "default",
  as = "h1",
  className,
  ...props
}: FlowHeaderProps) {
  const Heading = as;
  const centered = align === "center";

  return (
    <header
      className={cn(
        "mb-12 md:mb-16",
        centered && "text-center",
        className,
      )}
      {...props}
    >
      {kicker ? (
        <SectionKicker tone={kickerTone} className="mb-5">
          {kicker}
        </SectionKicker>
      ) : null}
      <Heading
        className={cn(
          "font-heading font-medium leading-[1.05] tracking-tight text-black-950",
          TITLE_SIZE[size],
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "mt-6 max-w-[var(--container-xl)] text-base leading-relaxed text-black-600 md:text-lg",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
