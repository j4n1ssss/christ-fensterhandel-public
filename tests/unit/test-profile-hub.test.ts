import { Profile } from "@/collections/produkte/profile";

/**
 * Helper to extract fields from a tabs field by tab label.
 */
function getTabFields(tabsField: any, tabLabel: string): any[] {
  const tab = tabsField.tabs.find((t: any) => t.label === tabLabel);
  return tab?.fields || [];
}

/**
 * Expected field-name -> collection-slug mappings per tab.
 */
const KOMBINATIONEN_FIELDS = {
  erlaubte_produkttypen: "produkttypen",
  erlaubte_fensterformen: "fensterformen",
  erlaubte_fluegelanzahl: "fluegelanzahl",
  erlaubte_oeffnungsarten: "oeffnungsarten",
  erlaubte_zusatzlichter: "zusatzlichter",
};

const AUSSTATTUNG_FIELDS = {
  erlaubte_farben: "farben",
  erlaubte_dichtungsfarben: "dichtungsfarben",
  erlaubte_verglasungen: "verglasungen",
  erlaubte_schallschutz: "schallschutz",
  erlaubte_sicherheitsglas: "sicherheitsglas",
  erlaubte_glasdekore: "glasdekore",
  erlaubte_sprossen: "sprossen",
  erlaubte_extras: "extras",
};

const ALL_HUB_FIELDS = { ...KOMBINATIONEN_FIELDS, ...AUSSTATTUNG_FIELDS };

describe("Profile Hub", () => {
  const tabsField = (Profile.fields as any[]).find(
    (f: any) => f.type === "tabs",
  );

  describe("HUB-01: tabs structure", () => {
    it("has a tabs field in Profile config", () => {
      expect(tabsField).toBeDefined();
      expect(tabsField.type).toBe("tabs");
    });

    it("has exactly 2 tabs", () => {
      expect(tabsField.tabs).toHaveLength(2);
    });

    it('first tab is labeled "Kombinationen" with 5 fields', () => {
      const kombTab = tabsField.tabs[0];
      expect(kombTab.label).toBe("Kombinationen");
      expect(kombTab.fields).toHaveLength(5);
    });

    it('second tab is labeled "Ausstattung" with 8 fields', () => {
      const austTab = tabsField.tabs[1];
      expect(austTab.label).toBe("Ausstattung");
      expect(austTab.fields).toHaveLength(8);
    });

    it("contains all 13 hub field names", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFieldNames = [...kombFields, ...austFields].map(
        (f: any) => f.name,
      );

      for (const fieldName of Object.keys(ALL_HUB_FIELDS)) {
        expect(allFieldNames).toContain(fieldName);
      }
    });

    it("all 13 fields have type relationship and hasMany true", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFields = [...kombFields, ...austFields];

      for (const field of allFields) {
        expect(field.type).toBe("relationship");
        expect(field.hasMany).toBe(true);
      }
    });
  });

  describe("HUB-01: relationTo mappings", () => {
    it("Kombinationen fields map to correct collection slugs", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");

      for (const [fieldName, collectionSlug] of Object.entries(
        KOMBINATIONEN_FIELDS,
      )) {
        const field = kombFields.find((f: any) => f.name === fieldName);
        expect(field).toBeDefined();
        expect(field.relationTo).toBe(collectionSlug);
      }
    });

    it("Ausstattung fields map to correct collection slugs", () => {
      const austFields = getTabFields(tabsField, "Ausstattung");

      for (const [fieldName, collectionSlug] of Object.entries(
        AUSSTATTUNG_FIELDS,
      )) {
        const field = austFields.find((f: any) => f.name === fieldName);
        expect(field).toBeDefined();
        expect(field.relationTo).toBe(collectionSlug);
      }
    });
  });

  describe("HUB-02: filterOptions and allowCreate", () => {
    it("all 13 hub fields have filterOptions { aktiv: { equals: true } }", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFields = [...kombFields, ...austFields];

      for (const field of allFields) {
        expect(field.filterOptions).toEqual({ aktiv: { equals: true } });
      }
    });

    it("all 13 hub fields have admin.allowCreate true", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFields = [...kombFields, ...austFields];

      for (const field of allFields) {
        expect(field.admin).toBeDefined();
        expect(field.admin.allowCreate).toBe(true);
      }
    });
  });

  describe("HUB-03: maxDepth 0", () => {
    it("all 13 hub fields have maxDepth 0", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFields = [...kombFields, ...austFields];

      for (const field of allFields) {
        expect(field.maxDepth).toBe(0);
      }
    });
  });

  describe("HUB-04: material field unchanged", () => {
    it("material field exists with correct base properties", () => {
      const materialField = (Profile.fields as any[]).find(
        (f: any) => f.name === "material",
      );
      expect(materialField).toBeDefined();
      expect(materialField.type).toBe("relationship");
      expect(materialField.relationTo).toBe("materialien");
      expect(materialField.required).toBe(true);
    });

    it("material field does NOT have hasMany", () => {
      const materialField = (Profile.fields as any[]).find(
        (f: any) => f.name === "material",
      );
      expect(materialField.hasMany).toBeUndefined();
    });

    it("material field does NOT have maxDepth", () => {
      const materialField = (Profile.fields as any[]).find(
        (f: any) => f.name === "material",
      );
      expect(materialField.maxDepth).toBeUndefined();
    });

    it("material field does NOT have filterOptions", () => {
      const materialField = (Profile.fields as any[]).find(
        (f: any) => f.name === "material",
      );
      expect(materialField.filterOptions).toBeUndefined();
    });

    it("material field does NOT have admin.allowCreate", () => {
      const materialField = (Profile.fields as any[]).find(
        (f: any) => f.name === "material",
      );
      expect(materialField.admin?.allowCreate).toBeUndefined();
    });
  });

  describe("unnamed tabs (flat data)", () => {
    it("both tabs have label but NOT name property", () => {
      for (const tab of tabsField.tabs) {
        expect(tab.label).toBeDefined();
        expect(tab.name).toBeUndefined();
      }
    });
  });

  describe("all hub fields have help text", () => {
    it("all 13 hub fields have a truthy admin.description string", () => {
      const kombFields = getTabFields(tabsField, "Kombinationen");
      const austFields = getTabFields(tabsField, "Ausstattung");
      const allFields = [...kombFields, ...austFields];

      for (const field of allFields) {
        expect(typeof field.admin?.description).toBe("string");
        expect(field.admin.description.length).toBeGreaterThan(0);
      }
    });
  });
});
