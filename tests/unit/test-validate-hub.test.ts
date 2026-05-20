import {
  validateProfile,
  REQUIRED_HUB_FIELDS,
  OPTIONAL_HUB_FIELDS,
} from "@/scripts/validate-hub-fields";

describe("validateProfile", () => {
  const fullyPopulated = {
    id: "prof-1",
    name_technisch: "Test Profile",
    // Required fields
    erlaubte_fluegelanzahl: ["fl-1", "fl-2"],
    erlaubte_oeffnungsarten: ["oa-1"],
    erlaubte_fensterformen: ["ff-1", "ff-2"],
    erlaubte_farben: ["f-1"],
    erlaubte_verglasungen: ["v-1"],
    // Optional fields
    erlaubte_zusatzlichter: ["zl-1"],
    erlaubte_dichtungsfarben: [],
    erlaubte_schallschutz: null,
    erlaubte_sicherheitsglas: ["sg-1"],
    erlaubte_glasdekore: [],
    erlaubte_sprossen: [],
    erlaubte_extras: ["ex-1"],
    erlaubte_produkttypen: [],
  };

  it("returns valid:true when all required fields are populated", () => {
    const result = validateProfile(fullyPopulated);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.profileName).toBe("Test Profile");
  });

  it("returns valid:false when a required field is an empty array", () => {
    const profile = { ...fullyPopulated, erlaubte_fluegelanzahl: [] };
    const result = validateProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "erlaubte_fluegelanzahl" }),
      ]),
    );
  });

  it("returns valid:false when a required field is null", () => {
    const profile = { ...fullyPopulated, erlaubte_farben: null };
    const result = validateProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "erlaubte_farben" }),
      ]),
    );
  });

  it("returns valid:true with warnings when an optional field is empty", () => {
    // erlaubte_schallschutz is null (optional) - should be warning not error
    const result = validateProfile(fullyPopulated);
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "erlaubte_schallschutz" }),
      ]),
    );
  });

  it("returns valid:false with multiple errors when multiple required fields are empty", () => {
    const profile = {
      ...fullyPopulated,
      erlaubte_fluegelanzahl: [],
      erlaubte_farben: null,
      erlaubte_verglasungen: [],
    };
    const result = validateProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it("counts items per field in the details", () => {
    const result = validateProfile(fullyPopulated);
    const fluegelDetail = result.details.find(
      (d) => d.field === "erlaubte_fluegelanzahl",
    );
    expect(fluegelDetail).toEqual({
      field: "erlaubte_fluegelanzahl",
      count: 2,
      status: "ok",
    });

    const schallschutzDetail = result.details.find(
      (d) => d.field === "erlaubte_schallschutz",
    );
    expect(schallschutzDetail).toEqual({
      field: "erlaubte_schallschutz",
      count: 0,
      status: "warning",
    });
  });

  it("uses profile.id as fallback when name_technisch is missing", () => {
    const profile = { ...fullyPopulated, name_technisch: undefined };
    const result = validateProfile(
      profile as unknown as Record<string, unknown>,
    );
    expect(result.profileName).toBe("prof-1");
  });
});

describe("REQUIRED_HUB_FIELDS", () => {
  it("contains exactly the 5 required Hub fields", () => {
    expect(REQUIRED_HUB_FIELDS).toEqual([
      "erlaubte_fluegelanzahl",
      "erlaubte_oeffnungsarten",
      "erlaubte_fensterformen",
      "erlaubte_farben",
      "erlaubte_verglasungen",
    ]);
  });
});

describe("OPTIONAL_HUB_FIELDS", () => {
  it("contains exactly the 8 optional Hub fields", () => {
    expect(OPTIONAL_HUB_FIELDS).toEqual([
      "erlaubte_zusatzlichter",
      "erlaubte_dichtungsfarben",
      "erlaubte_schallschutz",
      "erlaubte_sicherheitsglas",
      "erlaubte_glasdekore",
      "erlaubte_sprossen",
      "erlaubte_extras",
      "erlaubte_produkttypen",
    ]);
  });
});
