/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFilteredOptions } from "@/lib/konfigurator/filters";
import type { CMSData, KonfiguratorSelections } from "@/lib/konfigurator/types";
import type {
  Produkttypen,
  Materialien,
  Profile,
  Flügelanzahl,
  Öffnungsarten,
  Fensterform,
  Farben,
} from "@/payload-types";

// Helper to create minimal mock objects with required fields
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

function mockFlügelanzahl(
  overrides: Partial<Flügelanzahl> & {
    id: string;
    name: string;
    slug: string;
    anzahl: number;
  },
): Flügelanzahl {
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
  overrides: Partial<Öffnungsarten> & {
    id: string;
    name: string;
    slug: string;
  },
): Öffnungsarten {
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
  overrides: Partial<Fensterform> & { id: string; name: string; slug: string },
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

function createMockCMSData(): CMSData {
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
    name: "Balkontür",
    slug: "balkontuer",
    erlaubte_materialien: ["mat-kunststoff"],
  });

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
  });

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

  const einflgl = mockFlügelanzahl({
    id: "fl-1",
    name: "1-fluegelig",
    slug: "1-fluegelig",
    anzahl: 1,
    fuer_produkttypen: ["pt-fenster", "pt-balkontuer"],
  });

  const zweiflgl = mockFlügelanzahl({
    id: "fl-2",
    name: "2-fluegelig",
    slug: "2-fluegelig",
    anzahl: 2,
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
    name: "Weiß",
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

  return {
    produkttypen: [fenster, balkontuer],
    materialien: [kunststoff, alu],
    profile: [iglo5, igloEnergy, mb70],
    fluegelanzahl: [einflgl, zweiflgl],
    zusatzlichter: [],
    oeffnungsarten: [dreh, kipp],
    fensterformen: [rechteck, rundbogen],
    farben: [weiss, anthrazit],
    dichtungsfarben: [],
    verglasungen: [],
    schallschutz: [],
    sicherheitsglas: [],
    glasdekore: [],
    sprossen: [],
    extras: [],
    preisregeln: [],
  };
}

describe("getFilteredOptions", () => {
  const cmsData = createMockCMSData();

  describe("Step 1 - Produkttyp (no filtering)", () => {
    it("returns all produkttypen", () => {
      const result = getFilteredOptions(1, cmsData, emptySelections);
      expect(result).toHaveLength(2);
    });
  });

  describe("Step 2 - Material filtered by Produkttyp", () => {
    it("returns materials linked via erlaubte_materialien for Fenster", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(2, cmsData, selections) as any[];
      expect(result).toHaveLength(2); // Kunststoff + Alu
      expect(result.map((m: any) => m.id)).toEqual([
        "mat-kunststoff",
        "mat-alu",
      ]);
    });

    it("returns only Kunststoff for Balkontuer", () => {
      const selections = { ...emptySelections, produkttyp: "pt-balkontuer" };
      const result = getFilteredOptions(2, cmsData, selections) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("mat-kunststoff");
    });
  });

  describe("Step 3 - Profil filtered by Material", () => {
    it("returns profiles linked via erlaubte_profile for Kunststoff", () => {
      const selections = { ...emptySelections, material: "mat-kunststoff" };
      const result = getFilteredOptions(3, cmsData, selections) as any[];
      expect(result).toHaveLength(2); // Iglo 5 + Iglo Energy
      expect(result.map((p: any) => p.id).sort()).toEqual([
        "prof-iglo-energy",
        "prof-iglo5",
      ]);
    });

    it("returns only MB-70 for Aluminium", () => {
      const selections = { ...emptySelections, material: "mat-alu" };
      const result = getFilteredOptions(3, cmsData, selections) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("prof-mb70");
    });
  });

  describe("Step 4 - Flügelanzahl filtered by Produkttyp", () => {
    it("returns 1- and 2-flügelig for Fenster", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(4, cmsData, selections);
      expect(result).toHaveLength(2);
    });

    it("returns only 1-flügelig for Balkontür", () => {
      const selections = { ...emptySelections, produkttyp: "pt-balkontuer" };
      const result = getFilteredOptions(4, cmsData, selections) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("fl-1");
    });
  });

  describe("Step 5 - Öffnungsarten filtered by Produkttyp", () => {
    it("returns all for Fenster (both für_fenster)", () => {
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(5, cmsData, selections);
      expect(result).toHaveLength(2); // Dreh + Kipp
    });

    it("returns only Dreh for Balkontür (Kipp is für_balkontür=false)", () => {
      const selections = { ...emptySelections, produkttyp: "pt-balkontuer" };
      const result = getFilteredOptions(5, cmsData, selections) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("oa-dreh");
    });
  });

  describe("Step 6 - Fensterform filtered by Flügel + Öffnungsart", () => {
    it("returns Rechteck and Rundbogen for 1-flügel + Dreh", () => {
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
      const result = getFilteredOptions(6, cmsData, selections);
      expect(result).toHaveLength(2); // Both allow fl-1 + oa-dreh
    });

    it("returns only Rechteck for 2-flügel (Rundbogen only allows 1-flügel)", () => {
      const selections = {
        ...emptySelections,
        fluegelanzahl: "fl-2",
        oeffnungsarten: [
          {
            wingIndex: 0,
            oeffnungsart: "oa-dreh",
            griffSeite: null as "links" | "rechts" | null,
          },
          {
            wingIndex: 1,
            oeffnungsart: "oa-dreh",
            griffSeite: null as "links" | "rechts" | null,
          },
        ],
      };
      const result = getFilteredOptions(6, cmsData, selections) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ff-rechteck");
    });
  });

  describe("Step 8 - Farben filtered by Material + außen/innen", () => {
    it("returns farben for Kunststoff für_außen", () => {
      const selections = { ...emptySelections, material: "mat-kunststoff" };
      const result = getFilteredOptions(8, cmsData, selections) as {
        aussen: any[];
        innen: any[];
      };
      expect(result.aussen).toHaveLength(2); // Weiß + Anthrazit both für_außen + Kunststoff
      expect(result.innen).toHaveLength(1); // Only Weiß für_innen
    });

    it("returns only Weiß for Aluminium", () => {
      const selections = { ...emptySelections, material: "mat-alu" };
      const result = getFilteredOptions(8, cmsData, selections) as {
        aussen: any[];
        innen: any[];
      };
      expect(result.aussen).toHaveLength(1);
      expect(result.aussen[0].id).toBe("farbe-weiss");
    });
  });

  describe("handles populated objects (not just string IDs)", () => {
    it("works when erlaubte_materialien contains populated objects", () => {
      const populatedCmsData = {
        ...cmsData,
        produkttypen: [
          {
            ...cmsData.produkttypen[0],
            erlaubte_materialien: [
              cmsData.materialien[0],
              cmsData.materialien[1],
            ] as (string | Materialien)[],
          },
          cmsData.produkttypen[1],
        ],
      };
      const selections = { ...emptySelections, produkttyp: "pt-fenster" };
      const result = getFilteredOptions(2, populatedCmsData, selections);
      expect(result).toHaveLength(2);
    });
  });
});
