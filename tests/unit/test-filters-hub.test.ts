/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getFilteredOptions,
  getHubField,
  USE_HUB,
} from "@/lib/konfigurator/filters";
import type { CMSData, KonfiguratorSelections } from "@/lib/konfigurator/types";
import type {
  Produkttypen,
  Materialien,
  Profile,
  Fluegelanzahl,
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
  Zusatzlichter,
} from "@/payload-types";

// --- Mock helpers (reuse pattern from test-filters.test.ts) ---

function mockProdukttyp(
  overrides: Partial<Produkttypen> & { id: string; name: string; slug: string },
): Produkttypen {
  return {
    erlaubte_materialien: [],
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockMaterial(
  overrides: Partial<Materialien> & { id: string; name: string; slug: string },
): Materialien {
  return {
    erlaubte_profile: [],
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockProfile(
  overrides: Partial<Profile> & {
    id: string;
    name_technisch: string;
    name_einfach: string;
    slug: string;
    material: string;
  },
): Profile {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockFluegelanzahl(
  overrides: Partial<Fluegelanzahl> & {
    id: string;
    name: string;
    slug: string;
    anzahl: number;
  },
): Fluegelanzahl {
  return {
    fuer_produkttypen: [],
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockOeffnungsart(
  overrides: Partial<Oeffnungsarten> & {
    id: string;
    name: string;
    slug: string;
  },
): Oeffnungsarten {
  return {
    fuer_fenster: true,
    fuer_balkontuer: false,
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockFensterform(
  overrides: Partial<Fensterform> & {
    id: string;
    name: string;
    slug: string;
  },
): Fensterform {
  return {
    erlaubte_fluegelanzahl: [],
    erlaubte_oeffnungsarten: [],
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockFarbe(
  overrides: Partial<Farben> & {
    id: string;
    name: string;
    slug: string;
    kategorie: Farben["kategorie"];
  },
): Farben {
  return {
    fuer_aussen: true,
    fuer_innen: true,
    erlaubte_materialien: [],
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockDichtungsfarbe(
  overrides: Partial<Dichtungsfarben> & {
    id: string;
    name: string;
    slug: string;
  },
): Dichtungsfarben {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockVerglasung(
  overrides: Partial<Verglasungen> & { id: string; name: string; slug: string },
): Verglasungen {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockSchallschutz(
  overrides: Partial<Schallschutz> & { id: string; name: string; slug: string },
): Schallschutz {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockSicherheitsglas(
  overrides: Partial<Sicherheitsglas> & {
    id: string;
    name: string;
    slug: string;
  },
): Sicherheitsglas {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockGlasdekor(
  overrides: Partial<Glasdekore> & { id: string; name: string; slug: string },
): Glasdekore {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockSprosse(
  overrides: Partial<Sprossen> & { id: string; name: string; slug: string },
): Sprossen {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockExtra(
  overrides: Partial<Extra> & { id: string; name: string; slug: string },
): Extra {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

function mockZusatzlicht(
  overrides: Partial<Zusatzlichter> & {
    id: string;
    name: string;
    slug: string;
  },
): Zusatzlichter {
  return {
    aktiv: true,
    sortOrder: 0,
    updatedAt: "",
    createdAt: "",
    ...overrides,
  };
}

const emptySelections: KonfiguratorSelections = {
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

// --- Create rich mock CMS data with Hub-relevant items ---

function createHubCMSData(): CMSData {
  const kunststoff = mockMaterial({
    id: "mat-kunststoff",
    name: "Kunststoff",
    slug: "kunststoff",
    erlaubte_profile: ["prof-iglo5", "prof-iglo-energy"],
  });

  const alu = mockMaterial({
    id: "mat-alu",
    name: "Aluminium",
    slug: "aluminium",
    erlaubte_profile: ["prof-mb70"],
  });

  const fenster = mockProdukttyp({
    id: "pt-fenster",
    name: "Fenster",
    slug: "fenster",
    erlaubte_materialien: ["mat-kunststoff", "mat-alu"],
  });

  const balkontuer = mockProdukttyp({
    id: "pt-balkontuer",
    name: "Balkontuer",
    slug: "balkontuer",
    erlaubte_materialien: ["mat-kunststoff"],
  });

  const fl1 = mockFluegelanzahl({
    id: "fl-1",
    name: "1-fluegelig",
    slug: "1-fluegelig",
    anzahl: 1,
    fuer_produkttypen: ["pt-fenster", "pt-balkontuer"],
  });
  const fl2 = mockFluegelanzahl({
    id: "fl-2",
    name: "2-fluegelig",
    slug: "2-fluegelig",
    anzahl: 2,
    fuer_produkttypen: ["pt-fenster"],
  });
  const fl3 = mockFluegelanzahl({
    id: "fl-3",
    name: "3-fluegelig",
    slug: "3-fluegelig",
    anzahl: 3,
    fuer_produkttypen: ["pt-fenster"],
  });

  const dreh = mockOeffnungsart({
    id: "oa-dreh",
    name: "Dreh",
    slug: "dreh",
    fuer_fenster: true,
    fuer_balkontuer: true,
  });
  const kipp = mockOeffnungsart({
    id: "oa-kipp",
    name: "Kipp",
    slug: "kipp",
    fuer_fenster: true,
    fuer_balkontuer: false,
  });
  const drehKipp = mockOeffnungsart({
    id: "oa-dreh-kipp",
    name: "Dreh-Kipp",
    slug: "dreh-kipp",
    fuer_fenster: true,
    fuer_balkontuer: false,
  });

  const rechteck = mockFensterform({
    id: "ff-rechteck",
    name: "Rechteck",
    slug: "rechteck",
    erlaubte_fluegelanzahl: ["fl-1", "fl-2"],
    erlaubte_oeffnungsarten: ["oa-dreh", "oa-kipp"],
  });
  const rundbogen = mockFensterform({
    id: "ff-rundbogen",
    name: "Rundbogen",
    slug: "rundbogen",
    erlaubte_fluegelanzahl: ["fl-1"],
    erlaubte_oeffnungsarten: ["oa-dreh"],
  });

  const weiss = mockFarbe({
    id: "farbe-weiss",
    name: "Weiss",
    slug: "weiss",
    kategorie: "standard",
    fuer_aussen: true,
    fuer_innen: true,
    erlaubte_materialien: ["mat-kunststoff", "mat-alu"],
  });
  const anthrazit = mockFarbe({
    id: "farbe-anthrazit",
    name: "Anthrazit",
    slug: "anthrazit",
    kategorie: "dekor",
    fuer_aussen: true,
    fuer_innen: false,
    erlaubte_materialien: ["mat-kunststoff"],
  });
  const eiche = mockFarbe({
    id: "farbe-eiche",
    name: "Eiche",
    slug: "eiche",
    kategorie: "dekor",
    fuer_aussen: false,
    fuer_innen: true,
    erlaubte_materialien: ["mat-kunststoff"],
  });

  const dichtSchwarz = mockDichtungsfarbe({
    id: "dicht-schwarz",
    name: "Schwarz",
    slug: "schwarz",
  });
  const dichtGrau = mockDichtungsfarbe({
    id: "dicht-grau",
    name: "Grau",
    slug: "grau",
  });

  const vgl2fach = mockVerglasung({
    id: "vgl-2fach",
    name: "2-fach",
    slug: "2-fach",
  });
  const vgl3fach = mockVerglasung({
    id: "vgl-3fach",
    name: "3-fach",
    slug: "3-fach",
  });

  const schall32 = mockSchallschutz({
    id: "sch-32db",
    name: "32 dB",
    slug: "32-db",
  });
  const schall36 = mockSchallschutz({
    id: "sch-36db",
    name: "36 dB",
    slug: "36-db",
  });

  const sgEsg = mockSicherheitsglas({ id: "sg-esg", name: "ESG", slug: "esg" });
  const sgVsg = mockSicherheitsglas({ id: "sg-vsg", name: "VSG", slug: "vsg" });

  const gdSatinato = mockGlasdekor({
    id: "gd-satinato",
    name: "Satinato",
    slug: "satinato",
  });
  const gdOrnament = mockGlasdekor({
    id: "gd-ornament",
    name: "Ornament",
    slug: "ornament",
  });

  const spWiener = mockSprosse({
    id: "sp-wiener",
    name: "Wiener Sprosse",
    slug: "wiener",
  });
  const spHelima = mockSprosse({
    id: "sp-helima",
    name: "Helima",
    slug: "helima",
  });

  const exGriffPremium = mockExtra({
    id: "ex-griff-premium",
    name: "Griff Premium",
    slug: "griff-premium",
  });
  const exInsektenschutz = mockExtra({
    id: "ex-insektenschutz",
    name: "Insektenschutz",
    slug: "insektenschutz",
  });

  const zlOberlicht = mockZusatzlicht({
    id: "zl-oberlicht",
    name: "Oberlicht",
    slug: "oberlicht",
  });
  const zlUnterlicht = mockZusatzlicht({
    id: "zl-unterlicht",
    name: "Unterlicht",
    slug: "unterlicht",
  });

  // Profile with Hub fields populated
  const iglo5 = mockProfile({
    id: "prof-iglo5",
    name_technisch: "Iglo 5",
    name_einfach: "Iglo 5",
    slug: "iglo-5",
    material: "mat-kunststoff",
    masse: {
      min_breite_mm: 500,
      max_breite_mm: 2000,
      min_hoehe_mm: 500,
      max_hoehe_mm: 2500,
    },
    // Hub fields
    erlaubte_fluegelanzahl: ["fl-1", "fl-2"],
    erlaubte_oeffnungsarten: ["oa-dreh", "oa-kipp"],
    erlaubte_fensterformen: ["ff-rechteck"],
    erlaubte_farben: ["farbe-weiss"],
    erlaubte_dichtungsfarben: ["dicht-schwarz"],
    erlaubte_verglasungen: ["vgl-2fach"],
    erlaubte_schallschutz: [], // empty = null = hide
    erlaubte_sicherheitsglas: null, // null = hide
    erlaubte_glasdekore: ["gd-satinato"],
    erlaubte_sprossen: [], // empty = hide
    erlaubte_extras: ["ex-griff-premium"],
    erlaubte_zusatzlichter: ["zl-oberlicht"],
  });

  // Profile without Hub fields (simulates unfilled profile)
  const igloEnergy = mockProfile({
    id: "prof-iglo-energy",
    name_technisch: "Iglo Energy",
    name_einfach: "Iglo Energy",
    slug: "iglo-energy",
    material: "mat-kunststoff",
  });

  const mb70 = mockProfile({
    id: "prof-mb70",
    name_technisch: "MB-70",
    name_einfach: "MB-70",
    slug: "mb-70",
    material: "mat-alu",
  });

  return {
    produkttypen: [fenster, balkontuer],
    materialien: [kunststoff, alu],
    profile: [iglo5, igloEnergy, mb70],
    fluegelanzahl: [fl1, fl2, fl3],
    zusatzlichter: [zlOberlicht, zlUnterlicht],
    oeffnungsarten: [dreh, kipp, drehKipp],
    fensterformen: [rechteck, rundbogen],
    farben: [weiss, anthrazit, eiche],
    dichtungsfarben: [dichtSchwarz, dichtGrau],
    verglasungen: [vgl2fach, vgl3fach],
    schallschutz: [schall32, schall36],
    sicherheitsglas: [sgEsg, sgVsg],
    glasdekore: [gdSatinato, gdOrnament],
    sprossen: [spWiener, spHelima],
    extras: [exGriffPremium, exInsektenschutz],
    preisregeln: [],
  };
}

// =====================================================
// getHubField tests
// =====================================================

describe("getHubField", () => {
  const cmsData = createHubCMSData();
  const iglo5 = cmsData.profile[0]; // Profile with Hub fields

  it("returns filtered items when Hub field has matching IDs (intersection with cmsData)", () => {
    const result = getHubField<Fluegelanzahl>(
      iglo5,
      "erlaubte_fluegelanzahl",
      cmsData,
      "fluegelanzahl",
    );
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result!.map((f) => f.id).sort()).toEqual(["fl-1", "fl-2"]);
  });

  it("returns null when profil is undefined", () => {
    const result = getHubField<Fluegelanzahl>(
      undefined,
      "erlaubte_fluegelanzahl",
      cmsData,
      "fluegelanzahl",
    );
    expect(result).toBeNull();
  });

  it("returns null when Hub field is null", () => {
    const result = getHubField<Sicherheitsglas>(
      iglo5,
      "erlaubte_sicherheitsglas",
      cmsData,
      "sicherheitsglas",
    );
    expect(result).toBeNull();
  });

  it("returns null when Hub field is empty array []", () => {
    const result = getHubField<Schallschutz>(
      iglo5,
      "erlaubte_schallschutz",
      cmsData,
      "schallschutz",
    );
    expect(result).toBeNull();
  });

  it("handles string IDs (maxDepth:0 returns strings)", () => {
    // iglo5 Hub fields use string IDs (simulating maxDepth:0)
    const result = getHubField<Farben>(
      iglo5,
      "erlaubte_farben",
      cmsData,
      "farben",
    );
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe("farbe-weiss");
  });

  it("handles populated objects ({ id: string }) gracefully", () => {
    // Create profile with populated objects instead of string IDs
    const profilWithPopulated = mockProfile({
      id: "prof-populated",
      name_technisch: "Populated",
      name_einfach: "Populated",
      slug: "populated",
      material: "mat-kunststoff",
      erlaubte_fluegelanzahl: [{ id: "fl-1" } as any, { id: "fl-3" } as any],
    });
    const result = getHubField<Fluegelanzahl>(
      profilWithPopulated,
      "erlaubte_fluegelanzahl",
      cmsData,
      "fluegelanzahl",
    );
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result!.map((f) => f.id).sort()).toEqual(["fl-1", "fl-3"]);
  });

  it("only returns items that exist in cmsData (intersection)", () => {
    // Hub field has IDs that do NOT exist in cmsData
    const profilWithNonExistent = mockProfile({
      id: "prof-nonexist",
      name_technisch: "NonExist",
      name_einfach: "NonExist",
      slug: "nonexist",
      material: "mat-kunststoff",
      erlaubte_fluegelanzahl: ["fl-1", "fl-nonexistent", "fl-also-not-real"],
    });
    const result = getHubField<Fluegelanzahl>(
      profilWithNonExistent,
      "erlaubte_fluegelanzahl",
      cmsData,
      "fluegelanzahl",
    );
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe("fl-1");
  });
});

// =====================================================
// USE_HUB feature flag
// =====================================================

describe("USE_HUB feature flag", () => {
  it("is exported and set to false", () => {
    expect(USE_HUB).toBe(false);
  });
});

// =====================================================
// Legacy behavior preserved (USE_HUB=false via getFilteredOptions)
// =====================================================

describe("getFilteredOptions legacy (USE_HUB=false)", () => {
  const cmsData = createHubCMSData();

  describe("Step 4 legacy: filters by fuer_produkttypen", () => {
    it("returns 1-fl and 2-fl for Fenster (3-fl also matches)", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(
        4,
        cmsData,
        selections,
      ) as Fluegelanzahl[];
      // All three fuer_produkttypen include pt-fenster
      expect(result).toHaveLength(3);
    });

    it("returns only 1-fl for Balkontuer", () => {
      const selections = { ...emptySelections, produkttyp: "pt-balkontuer" };
      const result = getFilteredOptions(
        4,
        cmsData,
        selections,
      ) as Fluegelanzahl[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("fl-1");
    });
  });

  describe("Step 5 legacy: filters by fuer_fenster/fuer_balkontuer", () => {
    it("returns all fuer_fenster for Fenster", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(
        5,
        cmsData,
        selections,
      ) as Oeffnungsarten[];
      expect(result).toHaveLength(3); // dreh, kipp, dreh-kipp all have fuer_fenster=true
    });

    it("returns only Dreh for Balkontuer", () => {
      const selections = { ...emptySelections, produkttyp: "pt-balkontuer" };
      const result = getFilteredOptions(
        5,
        cmsData,
        selections,
      ) as Oeffnungsarten[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("oa-dreh");
    });
  });

  describe("Step 6 legacy: filters by erlaubte_fluegelanzahl + erlaubte_oeffnungsarten", () => {
    it("returns both forms for 1-fl + Dreh", () => {
      const selections = {
        ...emptySelections,
        fluegelanzahl: "fl-1",
        oeffnungsarten: [
          {
            wingIndex: 0,
            oeffnungsart: "oa-dreh",
            griffSeite: null as "links" | "rechts" | null,
          },
        ],
      };
      const result = getFilteredOptions(
        6,
        cmsData,
        selections,
      ) as Fensterform[];
      expect(result).toHaveLength(2);
    });
  });

  describe("Step 8 legacy: filters by erlaubte_materialien", () => {
    it("returns farben filtered by material and includes dichtungsfarben", () => {
      const selections = { ...emptySelections, material: "mat-kunststoff" };
      const result = getFilteredOptions(8, cmsData, selections) as {
        aussen: Farben[];
        innen: Farben[];
        dichtungsfarben: Dichtungsfarben[];
      };
      expect(result.aussen).toHaveLength(2); // weiss + anthrazit (both fuer_aussen + kunststoff)
      expect(result.innen).toHaveLength(2); // weiss + eiche (both fuer_innen + kunststoff)
      expect(result.dichtungsfarben).toHaveLength(2); // unfiltered
    });

    it("returns all farben when no material selected, includes dichtungsfarben", () => {
      const result = getFilteredOptions(8, cmsData, emptySelections) as {
        aussen: Farben[];
        innen: Farben[];
        dichtungsfarben: Dichtungsfarben[];
      };
      expect(result.aussen).toHaveLength(2); // weiss + anthrazit
      expect(result.innen).toHaveLength(2); // weiss + eiche
      expect(result.dichtungsfarben).toHaveLength(2); // unfiltered
    });
  });

  describe("Step 9 legacy: returns all items unfiltered per category", () => {
    it("returns all items for each category", () => {
      const result = getFilteredOptions(9, cmsData, emptySelections) as any;
      expect(result.verglasungen).toHaveLength(2);
      expect(result.schallschutz).toHaveLength(2);
      expect(result.sicherheitsglas).toHaveLength(2);
      expect(result.glasdekore).toHaveLength(2);
      expect(result.sprossen).toHaveLength(2);
      expect(result.extras).toHaveLength(2);
    });
  });

  describe("Steps unchanged: 1, 2, 3, 7, 10 behave identically regardless of USE_HUB", () => {
    it("Step 1 returns all produkttypen", () => {
      const result = getFilteredOptions(
        1,
        cmsData,
        emptySelections,
      ) as Produkttypen[];
      expect(result).toHaveLength(2);
    });

    it("Step 2 filters by erlaubte_materialien", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(
        2,
        cmsData,
        selections,
      ) as Materialien[];
      expect(result).toHaveLength(2);
    });

    it("Step 3 filters by erlaubte_profile", () => {
      const selections = { ...emptySelections, material: "mat-kunststoff" };
      const result = getFilteredOptions(3, cmsData, selections) as Profile[];
      expect(result).toHaveLength(2);
    });

    it("Step 7 returns masse from profil", () => {
      const selections = { ...emptySelections, profil: "prof-iglo5" };
      const result = getFilteredOptions(7, cmsData, selections);
      expect(result).toEqual({
        min_breite_mm: 500,
        max_breite_mm: 2000,
        min_hoehe_mm: 500,
        max_hoehe_mm: 2500,
      });
    });

    it("Step 10 returns null", () => {
      const result = getFilteredOptions(10, cmsData, emptySelections);
      expect(result).toBeNull();
    });
  });
});

// =====================================================
// Hub logic tests (testing getHubField directly for each step's scenario)
// =====================================================

describe("Hub step logic (USE_HUB=true scenarios via getHubField)", () => {
  const cmsData = createHubCMSData();
  const iglo5 = cmsData.profile[0];

  describe("Step 4 Hub: fluegelanzahl + zusatzlichter from profil", () => {
    it("returns fluegelanzahl from profil.erlaubte_fluegelanzahl intersected with cmsData", () => {
      const result = getHubField<Fluegelanzahl>(
        iglo5,
        "erlaubte_fluegelanzahl",
        cmsData,
        "fluegelanzahl",
      );
      expect(result).toHaveLength(2);
      expect(result!.map((f) => f.id).sort()).toEqual(["fl-1", "fl-2"]);
      // fl-3 is NOT in Hub so should not appear
    });

    it("returns empty array for unfilled profile Hub field (returns null)", () => {
      const igloEnergy = cmsData.profile[1]; // no Hub fields
      const result = getHubField<Fluegelanzahl>(
        igloEnergy,
        "erlaubte_fluegelanzahl",
        cmsData,
        "fluegelanzahl",
      );
      expect(result).toBeNull();
    });

    it("returns zusatzlichter from profil.erlaubte_zusatzlichter", () => {
      const result = getHubField<Zusatzlichter>(
        iglo5,
        "erlaubte_zusatzlichter",
        cmsData,
        "zusatzlichter",
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe("zl-oberlicht");
    });
  });

  describe("Step 5 Hub: oeffnungsarten from profil", () => {
    it("returns oeffnungsarten from profil.erlaubte_oeffnungsarten", () => {
      const result = getHubField<Oeffnungsarten>(
        iglo5,
        "erlaubte_oeffnungsarten",
        cmsData,
        "oeffnungsarten",
      );
      expect(result).toHaveLength(2);
      expect(result!.map((oa) => oa.id).sort()).toEqual(["oa-dreh", "oa-kipp"]);
      // oa-dreh-kipp is NOT in Hub
    });
  });

  describe("Step 6 Hub: fensterformen from profil (one call replaces 20 lines)", () => {
    it("returns fensterformen from profil.erlaubte_fensterformen", () => {
      const result = getHubField<Fensterform>(
        iglo5,
        "erlaubte_fensterformen",
        cmsData,
        "fensterformen",
      );
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe("ff-rechteck");
      // ff-rundbogen is NOT in Hub
    });
  });

  describe("Step 8 Hub: farben + dichtungsfarben from profil", () => {
    it("returns Hub-filtered farben split by fuer_aussen/fuer_innen, and Hub-filtered dichtungsfarben", () => {
      const hubFarben =
        getHubField<Farben>(iglo5, "erlaubte_farben", cmsData, "farben") ?? [];
      const hubDichtung = getHubField<Dichtungsfarben>(
        iglo5,
        "erlaubte_dichtungsfarben",
        cmsData,
        "dichtungsfarben",
      );

      // Hub only allows farbe-weiss
      expect(hubFarben).toHaveLength(1);
      expect(hubFarben[0].id).toBe("farbe-weiss");

      const aussen = hubFarben.filter((f) => f.fuer_aussen);
      const innen = hubFarben.filter((f) => f.fuer_innen);
      expect(aussen).toHaveLength(1); // weiss is fuer_aussen
      expect(innen).toHaveLength(1); // weiss is fuer_innen

      // Hub only allows dicht-schwarz
      expect(hubDichtung).not.toBeNull();
      expect(hubDichtung).toHaveLength(1);
      expect(hubDichtung![0].id).toBe("dicht-schwarz");
    });
  });

  describe("Step 9 Hub: per-category filtering with null for empty", () => {
    it("returns verglasungen from Hub (non-empty)", () => {
      const result = getHubField<Verglasungen>(
        iglo5,
        "erlaubte_verglasungen",
        cmsData,
        "verglasungen",
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe("vgl-2fach");
    });

    it("returns null for schallschutz (empty Hub field [])", () => {
      const result = getHubField<Schallschutz>(
        iglo5,
        "erlaubte_schallschutz",
        cmsData,
        "schallschutz",
      );
      expect(result).toBeNull();
    });

    it("returns null for sicherheitsglas (null Hub field)", () => {
      const result = getHubField<Sicherheitsglas>(
        iglo5,
        "erlaubte_sicherheitsglas",
        cmsData,
        "sicherheitsglas",
      );
      expect(result).toBeNull();
    });

    it("returns glasdekore from Hub (non-empty)", () => {
      const result = getHubField<Glasdekore>(
        iglo5,
        "erlaubte_glasdekore",
        cmsData,
        "glasdekore",
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe("gd-satinato");
    });

    it("returns null for sprossen (empty Hub field [])", () => {
      const result = getHubField<Sprossen>(
        iglo5,
        "erlaubte_sprossen",
        cmsData,
        "sprossen",
      );
      expect(result).toBeNull();
    });

    it("returns extras from Hub (non-empty)", () => {
      const result = getHubField<Extra>(
        iglo5,
        "erlaubte_extras",
        cmsData,
        "extras",
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe("ex-griff-premium");
    });
  });
});
