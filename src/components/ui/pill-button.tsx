import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * PillButton — Pill-Button mit Icon-Badge.
 * Signature-CTA für große Action-Momente (Hero, End-CTA, Section-Closer).
 *
 * Varianten (variant):
 *   primary    — schwarz-fill + brand-badge (Haupt-CTA, dominant)
 *   secondary  — brand-fill + schwarz-badge (inverted, für helle Flächen)
 *   alternate  — outline + brand-badge (neben-Aktionen)
 *   tertiary   — ghost + brand-badge (minimale Präsenz)
 *
 * Größen (size): sm | md | lg | xl
 * Icon-Position (iconPosition): trailing (default) | leading | none
 *
 * Rendert als <Link> wenn `href` gesetzt, sonst als <button>.
 */

export type PillButtonSize = "sm" | "md" | "lg" | "xl";
export type PillButtonIconPosition = "trailing" | "leading" | "none";
export type PillButtonVariant =
  | "primary"
  | "secondary"
  | "alternate"
  | "tertiary";

/* Lookup: asymmetrisches Padding je Size × IconPosition */
const PADDING_MAP: Record<
  PillButtonSize,
  Record<PillButtonIconPosition, string>
> = {
  sm: {
    trailing: "gap-3 py-1.5 pl-5 pr-1.5",
    leading: "gap-3 py-1.5 pl-1.5 pr-5",
    none: "py-1.5 px-5",
  },
  md: {
    trailing: "gap-4 py-2.5 pl-6 pr-2.5",
    leading: "gap-4 py-2.5 pl-2.5 pr-6",
    none: "py-2.5 px-6",
  },
  lg: {
    trailing: "gap-5 py-3.5 pl-7 pr-3.5",
    leading: "gap-5 py-3.5 pl-3.5 pr-7",
    none: "py-3.5 px-7",
  },
  xl: {
    trailing: "gap-6 py-5 pl-8 pr-5",
    leading: "gap-6 py-5 pl-5 pr-8",
    none: "py-5 px-8",
  },
};

/* Layout: flex-direction + justify je IconPosition */
const POSITION_CLASSES: Record<PillButtonIconPosition, string> = {
  trailing: "justify-between",
  leading: "flex-row-reverse justify-between",
  none: "justify-center",
};

/* Variant-Styling: Pill + Label + Badge */
const VARIANT_PILL: Record<PillButtonVariant, string> = {
  primary: "bg-black-950 hover:bg-black-900 border-black-950",
  secondary: "bg-brand-500 hover:bg-brand-600 border-brand-500",
  alternate:
    "bg-transparent border-black-950 hover:bg-black-950 hover:border-black-950",
  tertiary: "bg-transparent border-transparent hover:bg-black-100",
};

const VARIANT_LABEL: Record<PillButtonVariant, string> = {
  primary: "text-white-100",
  secondary: "text-black-950",
  alternate: "text-black-950 transition-colors group-hover:text-white-100",
  tertiary: "text-black-950",
};

const VARIANT_BADGE: Record<PillButtonVariant, string> = {
  primary: "bg-brand-500 text-black-950 group-hover:bg-brand-400",
  secondary: "bg-black-950 text-brand-500 group-hover:bg-black-900",
  alternate: "bg-brand-500 text-black-950 group-hover:bg-brand-400",
  tertiary: "bg-brand-500 text-black-950 group-hover:bg-brand-400",
};

/* Basis-Klassen für Pill (ohne variant-spezifisches) */
const pillButtonBase = cva(
  [
    "group inline-flex items-center",
    "rounded-full border-2 border-transparent",
    "transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
);

const pillLabelVariants = cva("font-heading font-medium leading-none", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl md:text-2xl",
    },
  },
  defaultVariants: { size: "md" },
});

const pillBadgeSizes = cva(
  [
    "flex shrink-0 items-center justify-center rounded-full",
    "transition-all duration-300",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-9 [&_svg]:size-4",
        lg: "size-11 [&_svg]:size-[18px]",
        xl: "size-12 [&_svg]:size-5",
      },
      direction: {
        trailing: "group-hover:translate-x-1",
        leading: "group-hover:-translate-x-1",
      },
    },
    defaultVariants: { size: "md", direction: "trailing" },
  },
);

type PillButtonBaseProps = {
  children: React.ReactNode;
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  iconPosition?: PillButtonIconPosition;
  /** Icon im Badge. Default: ArrowRight. Bei iconPosition="none" ignoriert. */
  icon?: React.ReactNode;
  className?: string;
};

export type PillButtonProps = PillButtonBaseProps &
  (
    | ({ href: string } & Omit<
        React.ComponentPropsWithoutRef<typeof Link>,
        "href" | "children" | "className"
      >)
    | ({ href?: undefined } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "children" | "className"
      >)
  );

export function PillButton({
  className,
  variant = "primary",
  size = "md",
  iconPosition = "trailing",
  children,
  icon,
  ...props
}: PillButtonProps) {
  const classes = cn(
    pillButtonBase(),
    VARIANT_PILL[variant],
    POSITION_CLASSES[iconPosition],
    PADDING_MAP[size][iconPosition],
    className,
  );

  const label = (
    <span className={cn(pillLabelVariants({ size }), VARIANT_LABEL[variant])}>
      {children}
    </span>
  );

  const badge =
    iconPosition === "none" ? null : (
      <span
        className={cn(
          pillBadgeSizes({ size, direction: iconPosition }),
          VARIANT_BADGE[variant],
        )}
        aria-hidden="true"
      >
        {icon ?? <ArrowRight />}
      </span>
    );

  const content = (
    <>
      {label}
      {badge}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const { href: _unused, ...buttonProps } = props as {
    href?: undefined;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}

export { pillButtonBase as pillButtonVariants };
