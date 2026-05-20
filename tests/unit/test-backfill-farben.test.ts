import {
  matchFarbenForProfile,
  shouldBackfill,
  extractId,
} from "@/migrations/backfill-erlaubte-farben";

interface FarbeForMatching {
  id: string;
  erlaubte_materialien?: (string | { id: string })[] | null;
  sortOrder?: number | null;
}

// Shared fixture data for matchFarbenForProfile tests
const farben: FarbeForMatching[] = [
  { id: "farbe-1", erlaubte_materialien: ["mat-1"], sortOrder: 3 },
  { id: "farbe-2", erlaubte_materialien: ["mat-1"], sortOrder: 1 },
  { id: "farbe-3", erlaubte_materialien: ["mat-2"], sortOrder: 2 },
  { id: "farbe-4", erlaubte_materialien: ["mat-1", "mat-2"], sortOrder: 5 },
];

describe("matchFarbenForProfile", () => {
  // Test 1 (MIG-01 derivation): matches correct Farben by material
  it("returns matching Farbe IDs for a given material", () => {
    const result = matchFarbenForProfile({ material: "mat-1" }, farben);
    expect(result).toEqual(["farbe-2", "farbe-1", "farbe-4"]);
  });

  // Test 2 (MIG-01 sorting): sorted by sortOrder ascending
  it("returns Farben sorted by sortOrder ascending", () => {
    const result = matchFarbenForProfile({ material: "mat-1" }, farben);
    // farbe-2 (sortOrder 1), farbe-1 (sortOrder 3), farbe-4 (sortOrder 5)
    expect(result).toEqual(["farbe-2", "farbe-1", "farbe-4"]);
  });

  // Test 3 (MIG-01 empty match): no matching Farben returns empty array
  it("returns empty array when no Farben match the material", () => {
    const result = matchFarbenForProfile({ material: "mat-3" }, farben);
    expect(result).toEqual([]);
  });

  // Test 8 (MIG-01 edge case): material as populated object
  it('handles material as populated object { id: "mat-1" }', () => {
    const result = matchFarbenForProfile({ material: { id: "mat-1" } }, farben);
    expect(result).toEqual(["farbe-2", "farbe-1", "farbe-4"]);
  });

  // Test 9 (MIG-01 edge case): Farbe with erlaubte_materialien as null
  it("returns no matches when Farbe has erlaubte_materialien as null", () => {
    const farbenWithNull: FarbeForMatching[] = [
      { id: "farbe-x", erlaubte_materialien: null, sortOrder: 1 },
    ];
    const result = matchFarbenForProfile({ material: "mat-1" }, farbenWithNull);
    expect(result).toEqual([]);
  });

  // Test 10 (MIG-01 edge case): Farbe with erlaubte_materialien as empty array
  it("returns no matches when Farbe has erlaubte_materialien as empty array", () => {
    const farbenWithEmpty: FarbeForMatching[] = [
      { id: "farbe-y", erlaubte_materialien: [], sortOrder: 1 },
    ];
    const result = matchFarbenForProfile(
      { material: "mat-1" },
      farbenWithEmpty,
    );
    expect(result).toEqual([]);
  });
});

describe("shouldBackfill", () => {
  // Test 4 (MIG-02 idempotency - skip): non-empty array returns false
  it("returns false when erlaubte_farben is a non-empty array", () => {
    expect(shouldBackfill(["farbe-1", "farbe-2"])).toBe(false);
  });

  // Test 5 (MIG-02 idempotency - fill null): null returns true
  it("returns true when erlaubte_farben is null", () => {
    expect(shouldBackfill(null)).toBe(true);
  });

  // Test 6 (MIG-02 idempotency - fill undefined): undefined returns true
  it("returns true when erlaubte_farben is undefined", () => {
    expect(shouldBackfill(undefined)).toBe(true);
  });

  // Test 7 (MIG-02 idempotency - fill empty): empty array returns true
  it("returns true when erlaubte_farben is empty array", () => {
    expect(shouldBackfill([])).toBe(true);
  });
});
