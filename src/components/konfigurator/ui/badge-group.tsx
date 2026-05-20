"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "info";

export interface BadgeItem {
  text: string;
  variant?: BadgeVariant;
}

/**
 * Badge-Varianten — tokenisiert:
 *   default → neutrales Chip (black-100 / black-700)
 *   success → green via --color-success-* Token-Skala
 *   info    → brand-50 / brand-700 (konsistent mit Marketing — kein separates Blau)
 */
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-black-100 text-black-700",
  success: "bg-success-100 text-success-800",
  info: "bg-brand-50 text-brand-700",
};

export interface BadgeGroupProps {
  badges: BadgeItem[];
  className?: string;
}

export function BadgeGroup({ badges, className }: BadgeGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((badge) => (
        <span
          key={badge.text}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.05em]",
            VARIANT_CLASSES[badge.variant || "default"],
          )}
        >
          {badge.text}
        </span>
      ))}
    </div>
  );
}
