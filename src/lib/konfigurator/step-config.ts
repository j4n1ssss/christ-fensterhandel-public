import type { KonfiguratorSelections, StepConfig } from "./types";

/**
 * All 10 configurator steps with completion checks.
 */
export const STEPS: StepConfig[] = [
  {
    id: 1,
    name: "Produkttyp",
    slug: "produkttyp",
    isComplete: (s: KonfiguratorSelections) => s.produkttyp !== null,
  },
  {
    id: 2,
    name: "Material",
    slug: "material",
    isComplete: (s: KonfiguratorSelections) => s.material !== null,
  },
  {
    id: 3,
    name: "Profil",
    slug: "profil",
    isComplete: (s: KonfiguratorSelections) => s.profil !== null,
  },
  {
    id: 4,
    name: "Flügel",
    slug: "fluegel",
    isComplete: (s: KonfiguratorSelections) => s.fluegelanzahl !== null,
  },
  {
    id: 5,
    name: "Öffnungsart",
    slug: "oeffnungsart",
    isComplete: (s: KonfiguratorSelections) =>
      s.oeffnungsarten.length > 0 &&
      s.oeffnungsarten.every((w) => w.oeffnungsart !== null),
  },
  {
    id: 6,
    name: "Form",
    slug: "form",
    isComplete: (s: KonfiguratorSelections) => s.fensterform !== null,
  },
  {
    id: 7,
    name: "Maße",
    slug: "masse",
    isComplete: (s: KonfiguratorSelections) => s.masse !== null,
  },
  {
    id: 8,
    name: "Farben",
    slug: "farben",
    isComplete: (s: KonfiguratorSelections) =>
      s.farbeAussen !== null && s.dichtungsfarbe !== null,
  },
  {
    id: 9,
    name: "Verglasung & Extras",
    slug: "verglasung-extras",
    isComplete: (s: KonfiguratorSelections) => s.verglasung !== null,
  },
  {
    id: 10,
    name: "Zusammenfassung",
    slug: "zusammenfassung",
    isComplete: () => true,
  },
];

/**
 * Dependency graph: which steps does each step depend on?
 * Used for cascade reset (when a step changes, all transitive dependents are reset).
 */
export const STEP_DEPENDENCIES: Record<number, number[]> = {
  1: [],
  2: [1],
  3: [2],
  4: [1, 3], // 3: profile affects Hub-filtered fluegelanzahl
  5: [1, 3, 4], // 3: profile affects Hub-filtered oeffnungsarten
  6: [3, 4, 5], // 3: profile affects Hub-filtered fensterformen
  7: [3],
  8: [2, 3], // 3: profile affects Hub-filtered farben
  9: [3], // 3: profile affects Hub-filtered verglasungen etc.
  10: [],
};

/**
 * Find ALL steps that transitively depend on the changed step.
 * If step 1 changes, this returns [2,3,4,5,6,7,8] because:
 * - 2 depends on 1
 * - 3 depends on 2 (which depends on 1)
 * - 4 depends on 1
 * - 5 depends on 1 and 4
 * - 6 depends on 4 and 5
 * - 7 depends on 3
 * - 8 depends on 2
 */
export function findDependentSteps(changedStep: number): number[] {
  const dependents = new Set<number>();
  const queue: number[] = [changedStep];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Find all steps that have `current` in their dependency list
    for (const [stepStr, deps] of Object.entries(STEP_DEPENDENCIES)) {
      const step = parseInt(stepStr, 10);
      if (deps.includes(current) && !dependents.has(step)) {
        dependents.add(step);
        queue.push(step);
      }
    }
  }

  return Array.from(dependents).sort((a, b) => a - b);
}
