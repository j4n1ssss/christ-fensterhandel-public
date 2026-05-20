import type { KonfiguratorSelections } from "@/lib/konfigurator/types";

/**
 * Display-friendly names resolved from CMS UUIDs.
 * Used in the cart to show human-readable configuration details.
 */
export interface ResolvedNames {
  produkttyp: string;
  material: string;
  profil: string;
  fluegelanzahl: string;
  fensterform: string;
  farbeAussen: string;
  farbeInnen: string;
  dichtungsfarbe: string;
  verglasung: string;
  schallschutz: string;
  sicherheitsglas: string;
  glasdekor: string;
  sprossen: string;
  extras: string[];
  masse: { breite: number; hoehe: number } | null;
}

/**
 * A single product in the shopping cart.
 */
export interface CartItem {
  id: string;
  selections: KonfiguratorSelections;
  resolvedNames: ResolvedNames;
  /** Price in integer cents (e.g. 24999 = 249.99 EUR) */
  previewPrice: number;
  quantity: number;
  addedAt: string; // ISO 8601
}

/**
 * Result of validating a discount code.
 */
export interface DiscountResult {
  valid: boolean;
  code: string;
  typ: "prozent" | "festbetrag";
  wert: number;
  error?: string;
}
