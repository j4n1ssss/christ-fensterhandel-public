import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button-Varianten.
 *
 * primary   — Brand-Fill, Haupt-CTA.
 * secondary — Black-Fill, starke neutrale Aktion.
 * alternate — Outline, für "nebenan"-Aktionen.
 * tertiary  — Ghost, minimale visuelle Präsenz.
 * link      — Text-only mit Underline auf Hover.
 *
 * Sizes: small (h-9) | normal (h-11).
 * Icon-Slots: leadingIcon / trailingIcon — SVG-Size wird automatisch
 * gesetzt, Du musst pro Icon nichts konfigurieren.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium whitespace-nowrap select-none",
    "rounded-md",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background focus-visible:ring-brand-500",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        secondary:
          "bg-black-900 text-white hover:bg-black-800 active:bg-black-700",
        alternate:
          "bg-transparent text-black-900 border border-black-900 hover:bg-black-50 active:bg-black-100",
        "alternate-inverse":
          "bg-white-5 text-white-100 border border-white-40 backdrop-blur-sm hover:bg-white-20 active:bg-white-40",
        tertiary:
          "bg-transparent text-black-800 hover:bg-black-100 active:bg-black-200",
        link:
          "bg-transparent text-brand-700 underline-offset-4 hover:underline hover:text-brand-800 h-auto !px-0",
      },
      size: {
        small: "h-9 px-4 text-sm [&_svg]:size-4",
        normal: "h-11 px-6 text-base [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "normal",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Icon links vom Text. Ignoriert, wenn asChild=true. */
  leadingIcon?: React.ReactNode;
  /** Icon rechts vom Text. Ignoriert, wenn asChild=true. */
  trailingIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      // Slot akzeptiert nur ein einzelnes Kind — Icons werden übersprungen.
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
