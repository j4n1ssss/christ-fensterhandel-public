/**
 * Hub field constants — shared between client components and server scripts.
 * This file MUST NOT import from payload, payload-config, or any server-only module.
 */

export const REQUIRED_HUB_FIELDS = [
  "erlaubte_fluegelanzahl",
  "erlaubte_oeffnungsarten",
  "erlaubte_fensterformen",
  "erlaubte_farben",
  "erlaubte_verglasungen",
] as const;

export const OPTIONAL_HUB_FIELDS = [
  "erlaubte_zusatzlichter",
  "erlaubte_dichtungsfarben",
  "erlaubte_schallschutz",
  "erlaubte_sicherheitsglas",
  "erlaubte_glasdekore",
  "erlaubte_sprossen",
  "erlaubte_extras",
  "erlaubte_produkttypen",
] as const;
