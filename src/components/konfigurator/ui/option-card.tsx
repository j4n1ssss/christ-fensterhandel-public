"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BadgeGroup, type BadgeItem } from "./badge-group";

export interface OptionCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  badges?: BadgeItem[];
  selected: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Reusable option card for all step selections.
 *
 * Marketing-Card-Idiom (reduziert für App-Dichte):
 *   Base:     rounded-xl + border-black-200 + bg-white
 *   Hover:    border-brand-500/60 + subtle shadow (kein translate — haeuft
 *             sich in dichten Grids auf)
 *   Selected: border-brand-500 + ring-brand-500/25 + shadow-md
 *   Titel:    text-black-900 (unselected) -> text-brand-700 (selected)
 */
export function OptionCard({
  title,
  description,
  imageUrl,
  badges,
  selected,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        selected
          ? "border-brand-500 shadow-md ring-2 ring-brand-500/25"
          : "border-black-200 hover:border-brand-500/60 hover:shadow-md",
        className,
      )}
    >
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-black-50">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority={false}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3
          className={cn(
            "text-sm font-medium transition-colors",
            selected ? "text-brand-700" : "text-black-900",
          )}
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-black-500">
            {description}
          </p>
        ) : null}
        {badges && badges.length > 0 ? (
          <div className="mt-3">
            <BadgeGroup badges={badges} />
          </div>
        ) : null}
      </div>
    </button>
  );
}
