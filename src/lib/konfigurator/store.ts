import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CMSData, KonfiguratorSelections, WingOpening } from "./types";
import { findDependentSteps, STEPS } from "./step-config";

/**
 * Default empty selections for all configurator steps.
 */
const DEFAULT_SELECTIONS: KonfiguratorSelections = {
  produkttyp: null,
  material: null,
  profil: null,
  fluegelanzahl: null,
  zusatzlichter: [],
  oeffnungsarten: [],
  fensterform: null,
  masse: null,
  farbeAussen: null,
  farbeInnen: null,
  dichtungsfarbe: null,
  gleichWieAussen: false,
  verglasung: null,
  schallschutz: null,
  sicherheitsglas: null,
  glasdekor: null,
  sprossen: null,
  extras: [],
};

/**
 * Selection keys for each step, used for cascade reset.
 */
const STEP_SELECTION_KEYS: Record<number, (keyof KonfiguratorSelections)[]> = {
  1: ["produkttyp"],
  2: ["material"],
  3: ["profil"],
  4: ["fluegelanzahl", "zusatzlichter"],
  5: ["oeffnungsarten"],
  6: ["fensterform"],
  7: ["masse"],
  8: ["farbeAussen", "farbeInnen", "dichtungsfarbe", "gleichWieAussen"],
  9: [
    "verglasung",
    "schallschutz",
    "sicherheitsglas",
    "glasdekor",
    "sprossen",
    "extras",
  ],
  10: [],
};

interface KonfiguratorStore extends KonfiguratorSelections {
  // CMS data (loaded once)
  cmsData: CMSData | null;
  isLoading: boolean;

  // Step navigation
  currentStep: number;
  completedSteps: Set<number>;

  // Actions
  setStep: (step: number) => void;
  setSelection: (key: keyof KonfiguratorSelections, value: unknown) => void;
  goToStep: (step: number) => void;
  resetDependentSteps: (fromStep: number) => void;
  loadCMSData: () => Promise<void>;
  completeStep: (step: number) => void;
  resetAll: () => void;
}

/**
 * Collections to fetch from the Payload CMS REST API.
 */
const CMS_COLLECTIONS = [
  "produkttypen",
  "materialien",
  "profile",
  "fluegelanzahl",
  "zusatzlichter",
  "oeffnungsarten",
  "fensterformen",
  "farben",
  "dichtungsfarben",
  "verglasungen",
  "schallschutz",
  "sicherheitsglas",
  "glasdekore",
  "sprossen",
  "extras",
  "preisregeln",
] as const;

/**
 * Collections that have an 'aktiv' boolean field.
 * Only these get the where[aktiv][equals]=true filter.
 * preisregeln does NOT have an aktiv field.
 */
const COLLECTIONS_WITH_AKTIV: Set<string> = new Set([
  "produkttypen",
  "materialien",
  "profile",
  "fluegelanzahl",
  "zusatzlichter",
  "oeffnungsarten",
  "fensterformen",
  "farben",
  "dichtungsfarben",
  "verglasungen",
  "schallschutz",
  "sicherheitsglas",
  "glasdekore",
  "sprossen",
  "extras",
]);

export const useKonfiguratorStore = create<KonfiguratorStore>()(
  persist(
    (set, get) => ({
      // CMS data
      cmsData: null,
      isLoading: false,

      // Navigation
      currentStep: 1,
      completedSteps: new Set<number>(),

      // Default selections
      ...DEFAULT_SELECTIONS,

      setStep: (step: number) => {
        set({ currentStep: step });
      },

      setSelection: (key: keyof KonfiguratorSelections, value: unknown) => {
        set({ [key]: value } as Partial<KonfiguratorStore>);
      },

      goToStep: (step: number) => {
        const { completedSteps } = get();
        // Can only go to a step that is <= max completed + 1
        const maxCompleted =
          completedSteps.size > 0 ? Math.max(...completedSteps) : 0;
        if (step <= maxCompleted + 1) {
          set({ currentStep: step });
        }
      },

      resetDependentSteps: (fromStep: number) => {
        const stepsToReset = findDependentSteps(fromStep);
        if (stepsToReset.length === 0) return;

        set((state) => {
          const updates: Record<string, unknown> = {};

          for (const step of stepsToReset) {
            const keys = STEP_SELECTION_KEYS[step] || [];
            for (const key of keys) {
              updates[key] = DEFAULT_SELECTIONS[key];
            }
          }

          // Remove reset steps from completedSteps
          const newCompleted = new Set(
            [...state.completedSteps].filter((s) => !stepsToReset.includes(s)),
          );

          return { ...updates, completedSteps: newCompleted };
        });
      },

      loadCMSData: async () => {
        set({ isLoading: true });

        try {
          const responses = await Promise.all(
            CMS_COLLECTIONS.map(async (slug) => {
              const params = new URLSearchParams({
                limit: "100",
                sort: "sortOrder",
                depth: slug === "profile" ? "1" : "2",
              });
              if (COLLECTIONS_WITH_AKTIV.has(slug)) {
                params.set("where[aktiv][equals]", "true");
              }
              const res = await fetch(`/api/${slug}?${params.toString()}`);
              if (!res.ok) {
                throw new Error(`Fehler beim Laden von ${slug}: ${res.status}`);
              }
              return res.json();
            }),
          );

          const cmsData = Object.fromEntries(
            CMS_COLLECTIONS.map((slug, i) => [slug, responses[i].docs || []]),
          ) as unknown as CMSData;

          set({ cmsData, isLoading: false });
        } catch (error) {
          console.error("Failed to load CMS data:", error);
          set({ isLoading: false });
        }
      },

      completeStep: (step: number) => {
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        }));
      },

      resetAll: () => {
        set({
          currentStep: 1,
          completedSteps: new Set<number>(),
          ...DEFAULT_SELECTIONS,
        });
      },
    }),
    {
      name: "konfigurator",
      skipHydration: true,
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        produkttyp: state.produkttyp,
        material: state.material,
        profil: state.profil,
        fluegelanzahl: state.fluegelanzahl,
        zusatzlichter: state.zusatzlichter,
        oeffnungsarten: state.oeffnungsarten,
        fensterform: state.fensterform,
        masse: state.masse,
        farbeAussen: state.farbeAussen,
        farbeInnen: state.farbeInnen,
        dichtungsfarbe: state.dichtungsfarbe,
        gleichWieAussen: state.gleichWieAussen,
        verglasung: state.verglasung,
        schallschutz: state.schallschutz,
        sicherheitsglas: state.sicherheitsglas,
        glasdekor: state.glasdekor,
        sprossen: state.sprossen,
        extras: state.extras,
      }),
      // Restore Set from serialized array
      merge: (persisted, current) => {
        const persistedState = persisted as Record<string, unknown>;
        return {
          ...current,
          ...persistedState,
          completedSteps: new Set(
            (persistedState?.completedSteps as number[]) || [],
          ),
        };
      },
    },
  ),
);
