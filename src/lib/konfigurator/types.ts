import type {
  Produkttypen,
  Materialien,
  Profile,
  Fluegelanzahl,
  Zusatzlichter,
  Oeffnungsarten,
  Fensterform,
  Farben,
  Dichtungsfarben,
  Verglasungen,
  Schallschutz,
  Sicherheitsglas,
  Glasdekore,
  Sprossen,
  Extra,
  Preisregeln,
} from "@/payload-types";

/**
 * All CMS data loaded upfront for client-side filtering.
 */
export interface CMSData {
  produkttypen: Produkttypen[];
  materialien: Materialien[];
  profile: Profile[];
  fluegelanzahl: Fluegelanzahl[];
  zusatzlichter: Zusatzlichter[];
  oeffnungsarten: Oeffnungsarten[];
  fensterformen: Fensterform[];
  farben: Farben[];
  dichtungsfarben: Dichtungsfarben[];
  verglasungen: Verglasungen[];
  schallschutz: Schallschutz[];
  sicherheitsglas: Sicherheitsglas[];
  glasdekore: Glasdekore[];
  sprossen: Sprossen[];
  extras: Extra[];
  preisregeln: Preisregeln[];
}

/**
 * Per-wing opening type and handle side selection (Step 5).
 */
export interface WingOpening {
  wingIndex: number;
  oeffnungsart: string | null;
  griffSeite: "links" | "rechts" | null;
}

/**
 * All configurator selections across all 10 steps.
 */
export interface KonfiguratorSelections {
  // Step 1
  produkttyp: string | null;
  // Step 2
  material: string | null;
  // Step 3
  profil: string | null;
  // Step 4
  fluegelanzahl: string | null;
  zusatzlichter: string[];
  // Step 5
  oeffnungsarten: WingOpening[];
  // Step 6
  fensterform: string | null;
  // Step 7
  masse: { breite: number; hoehe: number } | null;
  // Step 8
  farbeAussen: string | null;
  farbeInnen: string | null;
  dichtungsfarbe: string | null;
  gleichWieAussen: boolean;
  // Step 9
  verglasung: string | null;
  schallschutz: string | null;
  sicherheitsglas: string | null;
  glasdekor: string | null;
  sprossen: string | null;
  extras: string[];
}

/**
 * Configuration for a single step in the configurator.
 */
export interface StepConfig {
  id: number;
  name: string;
  slug: string;
  isComplete: (s: KonfiguratorSelections) => boolean;
}
