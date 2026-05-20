import {
  computeDiff,
  resolveRelationshipLabels,
  EXCLUDED_FIELDS,
  RELATIONSHIP_FIELDS,
  GROUP_FIELDS,
  type DiffEntry,
} from "@/lib/diff-utils";

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

describe("EXCLUDED_FIELDS", () => {
  it("contains exactly updatedAt, createdAt, id, last_edited_by", () => {
    expect(EXCLUDED_FIELDS).toEqual(
      new Set(["updatedAt", "createdAt", "id", "last_edited_by"]),
    );
    expect(EXCLUDED_FIELDS.size).toBe(4);
  });
});

describe("RELATIONSHIP_FIELDS", () => {
  it("contains exactly 14 entries (material + 13 erlaubte_*)", () => {
    const keys = Object.keys(RELATIONSHIP_FIELDS);
    expect(keys).toHaveLength(14);
    expect(keys).toContain("material");
    expect(keys).toContain("erlaubte_produkttypen");
    expect(keys).toContain("erlaubte_fensterformen");
    expect(keys).toContain("erlaubte_fluegelanzahl");
    expect(keys).toContain("erlaubte_oeffnungsarten");
    expect(keys).toContain("erlaubte_zusatzlichter");
    expect(keys).toContain("erlaubte_farben");
    expect(keys).toContain("erlaubte_dichtungsfarben");
    expect(keys).toContain("erlaubte_verglasungen");
    expect(keys).toContain("erlaubte_schallschutz");
    expect(keys).toContain("erlaubte_sicherheitsglas");
    expect(keys).toContain("erlaubte_glasdekore");
    expect(keys).toContain("erlaubte_sprossen");
    expect(keys).toContain("erlaubte_extras");
  });

  it("maps each field to collection and titleField", () => {
    expect(RELATIONSHIP_FIELDS.material).toEqual({
      collection: "materialien",
      titleField: "name",
    });
    expect(RELATIONSHIP_FIELDS.erlaubte_farben).toEqual({
      collection: "farben",
      titleField: "name",
    });
  });
});

describe("GROUP_FIELDS", () => {
  it("contains exactly technische_daten and masse", () => {
    expect(GROUP_FIELDS).toEqual(new Set(["technische_daten", "masse"]));
    expect(GROUP_FIELDS.size).toBe(2);
  });
});

// ──────────────────────────────────────────────────────────────
// computeDiff
// ──────────────────────────────────────────────────────────────

describe("computeDiff", () => {
  it("returns empty array when no fields changed", () => {
    const doc = { name_einfach: "Iglo 5", aktiv: true };
    expect(computeDiff(doc, doc)).toEqual([]);
  });

  it("detects a new field being set from empty previous doc", () => {
    const result = computeDiff({}, { name_einfach: "Iglo 5" });
    expect(result).toEqual([
      { field: "name_einfach", from: null, to: "Iglo 5" },
    ]);
  });

  it("detects a text field change", () => {
    const result = computeDiff(
      { name_einfach: "Iglo 5" },
      { name_einfach: "Iglo 5 Classic" },
    );
    expect(result).toEqual([
      { field: "name_einfach", from: "Iglo 5", to: "Iglo 5 Classic" },
    ]);
  });

  it("detects a number field change", () => {
    const result = computeDiff({ sortOrder: 0 }, { sortOrder: 5 });
    expect(result).toEqual([{ field: "sortOrder", from: 0, to: 5 }]);
  });

  it("detects a checkbox field change", () => {
    const result = computeDiff({ aktiv: true }, { aktiv: false });
    expect(result).toEqual([{ field: "aktiv", from: true, to: false }]);
  });

  it("detects a select field change", () => {
    const result = computeDiff(
      { qualitaetsstufe: "standard" },
      { qualitaetsstufe: "premium" },
    );
    expect(result).toEqual([
      { field: "qualitaetsstufe", from: "standard", to: "premium" },
    ]);
  });

  it("excludes updatedAt, createdAt, id, last_edited_by from diff", () => {
    const prev = {
      id: "1",
      updatedAt: "2026-01-01",
      createdAt: "2026-01-01",
      last_edited_by: "user-a",
      name_einfach: "Iglo 5",
    };
    const next = {
      id: "1",
      updatedAt: "2026-01-02",
      createdAt: "2026-01-01",
      last_edited_by: "user-b",
      name_einfach: "Iglo 5 Classic",
    };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      { field: "name_einfach", from: "Iglo 5", to: "Iglo 5 Classic" },
    ]);
  });

  it("handles group fields with dot-path notation (technische_daten)", () => {
    const prev = { technische_daten: { uw_wert: 1.3, kammern: 5 } };
    const next = { technische_daten: { uw_wert: 1.1, kammern: 5 } };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      { field: "technische_daten.uw_wert", from: 1.3, to: 1.1 },
    ]);
  });

  it("handles group fields with dot-path notation (masse)", () => {
    const prev = { masse: { min_breite_mm: 400, max_breite_mm: 1200 } };
    const next = { masse: { min_breite_mm: 400, max_breite_mm: 1400 } };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      { field: "masse.max_breite_mm", from: 1200, to: 1400 },
    ]);
  });

  it("handles group field being set from null/undefined", () => {
    const prev = {};
    const next = { technische_daten: { uw_wert: 1.3, kammern: 5 } };
    const result = computeDiff(prev, next);
    expect(result).toContainEqual({
      field: "technische_daten.uw_wert",
      from: null,
      to: 1.3,
    });
    expect(result).toContainEqual({
      field: "technische_daten.kammern",
      from: null,
      to: 5,
    });
  });

  it("handles hasMany relationship array changes (erlaubte_farben)", () => {
    const prev = { erlaubte_farben: ["uuid1", "uuid2"] };
    const next = { erlaubte_farben: ["uuid1", "uuid3"] };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      {
        field: "erlaubte_farben",
        from: ["uuid1", "uuid2"],
        to: ["uuid1", "uuid3"],
      },
    ]);
  });

  it("handles hasMany relationship array - same IDs different order is NOT a change", () => {
    const prev = { erlaubte_farben: ["uuid2", "uuid1"] };
    const next = { erlaubte_farben: ["uuid1", "uuid2"] };
    const result = computeDiff(prev, next);
    expect(result).toEqual([]);
  });

  it("handles single relationship field change (material)", () => {
    const prev = { material: "mat-uuid-1" };
    const next = { material: "mat-uuid-2" };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      { field: "material", from: "mat-uuid-1", to: "mat-uuid-2" },
    ]);
  });

  it("handles null/undefined vs empty array correctly for relationship fields", () => {
    // null and empty array should be treated as equivalent (no values)
    const result1 = computeDiff(
      { erlaubte_farben: null },
      { erlaubte_farben: [] },
    );
    expect(result1).toEqual([]);

    const result2 = computeDiff(
      { erlaubte_farben: undefined },
      { erlaubte_farben: [] },
    );
    expect(result2).toEqual([]);

    const result3 = computeDiff({}, { erlaubte_farben: [] });
    expect(result3).toEqual([]);
  });

  it("handles null/undefined vs missing key equivalence for simple fields", () => {
    const result1 = computeDiff(
      { name_einfach: null },
      { name_einfach: undefined },
    );
    expect(result1).toEqual([]);

    const result2 = computeDiff({ name_einfach: null }, {});
    expect(result2).toEqual([]);
  });

  it("handles multiple fields changing at once", () => {
    const prev = { name_einfach: "A", aktiv: true, sortOrder: 1 };
    const next = { name_einfach: "B", aktiv: false, sortOrder: 1 };
    const result = computeDiff(prev, next);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      field: "name_einfach",
      from: "A",
      to: "B",
    });
    expect(result).toContainEqual({ field: "aktiv", from: true, to: false });
  });

  it("handles upload field (bild) change", () => {
    const prev = { bild: "media-uuid-1" };
    const next = { bild: "media-uuid-2" };
    const result = computeDiff(prev, next);
    expect(result).toEqual([
      { field: "bild", from: "media-uuid-1", to: "media-uuid-2" },
    ]);
  });
});

// ──────────────────────────────────────────────────────────────
// resolveRelationshipLabels
// ──────────────────────────────────────────────────────────────

describe("resolveRelationshipLabels", () => {
  const createMockPayload = (docs: Record<string, any[]> = {}) => ({
    find: jest
      .fn()
      .mockImplementation(({ collection }: { collection: string }) => {
        return Promise.resolve({ docs: docs[collection] || [] });
      }),
  });

  it("resolves hasMany relationship IDs to { id, label } objects", async () => {
    const mockPayload = createMockPayload({
      farben: [
        { id: "uuid1", name: "Weiss RAL 9016" },
        { id: "uuid2", name: "Anthrazit RAL 7016" },
      ],
    });

    const diff: DiffEntry[] = [
      {
        field: "erlaubte_farben",
        from: ["uuid1"],
        to: ["uuid1", "uuid2"],
      },
    ];

    const result = await resolveRelationshipLabels(diff, mockPayload);
    expect(result).toEqual([
      {
        field: "erlaubte_farben",
        from: [{ id: "uuid1", label: "Weiss RAL 9016" }],
        to: [
          { id: "uuid1", label: "Weiss RAL 9016" },
          { id: "uuid2", label: "Anthrazit RAL 7016" },
        ],
      },
    ]);
  });

  it("resolves single relationship IDs to { id, label } objects", async () => {
    const mockPayload = createMockPayload({
      materialien: [{ id: "mat-1", name: "Kunststoff" }],
    });

    const diff: DiffEntry[] = [{ field: "material", from: null, to: "mat-1" }];

    const result = await resolveRelationshipLabels(diff, mockPayload);
    expect(result).toEqual([
      {
        field: "material",
        from: null,
        to: { id: "mat-1", label: "Kunststoff" },
      },
    ]);
  });

  it("passes through non-relationship entries unchanged", async () => {
    const mockPayload = createMockPayload();
    const diff: DiffEntry[] = [{ field: "name_einfach", from: "A", to: "B" }];

    const result = await resolveRelationshipLabels(diff, mockPayload);
    expect(result).toEqual([{ field: "name_einfach", from: "A", to: "B" }]);
  });

  it("falls back to raw ID when resolution fails", async () => {
    const mockPayload = {
      find: jest.fn().mockRejectedValue(new Error("DB error")),
    };

    const diff: DiffEntry[] = [
      {
        field: "erlaubte_farben",
        from: ["uuid1"],
        to: ["uuid1", "uuid2"],
      },
    ];

    const result = await resolveRelationshipLabels(diff, mockPayload);
    // Should keep raw IDs on failure (graceful degradation)
    expect(result).toEqual([
      {
        field: "erlaubte_farben",
        from: ["uuid1"],
        to: ["uuid1", "uuid2"],
      },
    ]);
  });

  it("handles null from/to values in relationship fields", async () => {
    const mockPayload = createMockPayload({
      materialien: [{ id: "mat-1", name: "Kunststoff" }],
    });

    const diff: DiffEntry[] = [{ field: "material", from: "mat-1", to: null }];

    const result = await resolveRelationshipLabels(diff, mockPayload);
    expect(result).toEqual([
      {
        field: "material",
        from: { id: "mat-1", label: "Kunststoff" },
        to: null,
      },
    ]);
  });

  it("calls payload.find with correct parameters", async () => {
    const mockPayload = createMockPayload({
      farben: [{ id: "uuid1", name: "Weiss" }],
    });

    const diff: DiffEntry[] = [
      { field: "erlaubte_farben", from: [], to: ["uuid1"] },
    ];

    await resolveRelationshipLabels(diff, mockPayload);

    expect(mockPayload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "farben",
        where: { id: { in: ["uuid1"] } },
        select: { name: true },
        depth: 0,
        pagination: false,
      }),
    );
  });
});
