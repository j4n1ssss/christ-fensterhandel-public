"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal — Dialog-Primitive mit Portal in document.body.
 *
 * Warum createPortal? Ein Parent mit backdrop-filter, filter oder transform
 * bricht position:fixed (Browser-Spec). Portal in den Body vermeidet das.
 *
 * Features:
 *   - Esc schließt
 *   - Klick auf Backdrop schließt (via button für Accessibility)
 *   - Body-Scroll-Lock während geöffnet
 *   - Focus-Ring via focus-visible (brand-500)
 *   - Size über container-Tokens
 */

export type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** sm=container-md (32rem) | md=container-xl (48rem) | lg=container-xxl (56rem). Default: sm. */
  size?: ModalSize;
  /** aria-label des Dialogs (falls kein sichtbarer Titel vorhanden). */
  ariaLabel?: string;
  /** Close-Button im Panel rendern? Default: true. */
  showClose?: boolean;
  /** Klasse auf das Panel (z. B. für extra Padding). */
  className?: string;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "max-w-[var(--container-md)]",
  md: "max-w-[var(--container-xl)]",
  lg: "max-w-[var(--container-xxl)]",
};

export function Modal({
  open,
  onClose,
  children,
  size = "sm",
  ariaLabel,
  showClose = true,
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      {/* Backdrop — semi-opak, kein backdrop-filter (createPortal-safe). */}
      <button
        type="button"
        aria-label="Dialog schließen"
        onClick={onClose}
        className="absolute inset-0 bg-black-950/60 transition-opacity"
      />
      {/* Panel */}
      <div
        className={cn(
          "relative w-full",
          "rounded-[var(--radius)] border border-black-200 bg-white shadow-2xl",
          SIZE_MAP[size],
          className,
        )}
      >
        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className={cn(
              "absolute right-4 top-4 z-10",
              "inline-flex size-9 items-center justify-center rounded-full",
              "text-black-600 transition-colors",
              "hover:bg-black-100 hover:text-black-950",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
