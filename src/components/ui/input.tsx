import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Basis-Input — passt zu den Buttons:
 * rounded-md, h-11, border-black-300, focus-ring brand-500.
 * Placeholder ist dezent (black-400), Text black-950.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-black-300 bg-white px-3.5 text-sm text-black-950",
        "placeholder:text-black-400",
        "transition-colors duration-150",
        "focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-error-500 aria-[invalid=true]:focus-visible:ring-error-500/25",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

/**
 * Label — konsistent mit Labels in den Marketing-Sections:
 * kleine Sans-Schrift, leicht dunkelgrau, medium weight.
 */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 block text-sm font-medium text-black-800",
        className,
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

/**
 * Field-Error — rot, klein, mit Top-Spacing.
 */
export function FieldError({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p
      className={cn("mt-1.5 text-xs text-error-600", className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
}
