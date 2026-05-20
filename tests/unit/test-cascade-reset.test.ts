import {
  findDependentSteps,
  STEP_DEPENDENCIES,
} from "@/lib/konfigurator/step-config";

describe("findDependentSteps", () => {
  it("returns all transitive dependents when step 1 changes", () => {
    const result = findDependentSteps(1);
    // Step 1 (Produkttyp) affects: 2(Material), 3(Profil via 2),
    // 4(Fluegel via 1+3), 5(Oeffnung via 1+3+4), 6(Form via 3+4+5),
    // 7(Masse via 3), 8(Farben via 2+3), 9(Verglasung via 3)
    expect(result.sort()).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("returns dependents when step 2 changes", () => {
    const result = findDependentSteps(2);
    // Step 2 (Material) affects: 3(Profil), 4(via 3), 5(via 3+4),
    // 6(via 3+4+5), 7(Masse via 3), 8(Farben via 2+3), 9(via 3)
    expect(result.sort()).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });

  it("returns dependents when step 3 changes (profile = Hub)", () => {
    const result = findDependentSteps(3);
    // Step 3 (Profil) affects: 4, 5, 6, 7, 8, 9 (all Hub-dependent + Masse)
    expect(result.sort()).toEqual([4, 5, 6, 7, 8, 9]);
  });

  it("returns dependents when step 4 changes", () => {
    const result = findDependentSteps(4);
    // Step 4 (Fluegel) affects: 5(Oeffnung), 6(Form via 4+5)
    expect(result.sort()).toEqual([5, 6]);
  });

  it("returns empty array when step 9 changes (no dependents)", () => {
    const result = findDependentSteps(9);
    expect(result).toEqual([]);
  });

  it("returns empty array when step 10 changes (no dependents)", () => {
    const result = findDependentSteps(10);
    expect(result).toEqual([]);
  });
});

describe("STEP_DEPENDENCIES", () => {
  it("defines correct dependency graph with profile (Step 3) for Hub steps", () => {
    expect(STEP_DEPENDENCIES[1]).toEqual([]);
    expect(STEP_DEPENDENCIES[2]).toEqual([1]);
    expect(STEP_DEPENDENCIES[3]).toEqual([2]);
    expect(STEP_DEPENDENCIES[4]).toEqual([1, 3]);
    expect(STEP_DEPENDENCIES[5]).toEqual([1, 3, 4]);
    expect(STEP_DEPENDENCIES[6]).toEqual([3, 4, 5]);
    expect(STEP_DEPENDENCIES[7]).toEqual([3]);
    expect(STEP_DEPENDENCIES[8]).toEqual([2, 3]);
    expect(STEP_DEPENDENCIES[9]).toEqual([3]);
    expect(STEP_DEPENDENCIES[10]).toEqual([]);
  });
});
