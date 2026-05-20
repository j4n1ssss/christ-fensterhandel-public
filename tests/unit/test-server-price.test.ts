import { calculateServerPrice } from "@/lib/anfrage/price-server";

// Mock payload instance
function createMockPayload(collections: Record<string, unknown[]>) {
  return {
    find: jest.fn(
      ({
        collection,
        where,
      }: {
        collection: string;
        where?: Record<string, unknown>;
      }) => {
        const docs = collections[collection] || [];
        return Promise.resolve({ docs, totalDocs: docs.length });
      },
    ),
  };
}

describe("calculateServerPrice", () => {
  const baseSelections = {
    produkttyp: "pt-fenster",
    material: "mat-kunststoff",
    profil: "prof-iglo5",
    masse: { breite: 1000, hoehe: 1200 },
    verglasung: null as string | null,
    schallschutz: null as string | null,
    sicherheitsglas: null as string | null,
    glasdekor: null as string | null,
    sprossen: null as string | null,
    farbeAussen: null as string | null,
    farbeInnen: null as string | null,
    extras: [] as string[],
    fluegelanzahl: null as string | null,
    zusatzlichter: [] as string[],
    oeffnungsarten: [] as Array<{
      wingIndex: number;
      oeffnungsart: string | null;
      griffSeite: "links" | "rechts" | null;
    }>,
    fensterform: null as string | null,
    dichtungsfarbe: null as string | null,
    gleichWieAussen: false,
  };

  it("calculates base price from area * grundpreis_pro_m2 (cents)", async () => {
    const mockPayload = createMockPayload({
      preisregeln: [
        {
          id: "pr-1",
          produkttyp: "pt-fenster",
          material: "mat-kunststoff",
          profil: "prof-iglo5",
          grundpreis_pro_m2: 15000, // 150 EUR in cents
          aktiv: true,
        },
      ],
    });

    const price = await calculateServerPrice(
      baseSelections,
      mockPayload as any,
    );
    // 1000mm * 1200mm = 1.2 m2, 15000 cents * 1.2 = 18000 cents
    expect(price).toBe(18000);
  });

  it("adds aufpreis from verglasung (cents)", async () => {
    const mockPayload = createMockPayload({
      preisregeln: [
        {
          id: "pr-1",
          produkttyp: "pt-fenster",
          material: "mat-kunststoff",
          profil: "prof-iglo5",
          grundpreis_pro_m2: 15000,
          aktiv: true,
        },
      ],
      verglasungen: [{ id: "vg-1", aufpreis: 5000, aktiv: true }],
    });

    const selections = { ...baseSelections, verglasung: "vg-1" };
    const price = await calculateServerPrice(selections, mockPayload as any);
    expect(price).toBe(23000); // 18000 base + 5000
  });

  it("returns 0 if no matching Preisregel", async () => {
    const mockPayload = createMockPayload({ preisregeln: [] });
    const price = await calculateServerPrice(
      baseSelections,
      mockPayload as any,
    );
    expect(price).toBe(0);
  });

  it("returns 0 if required selections are missing", async () => {
    const mockPayload = createMockPayload({
      preisregeln: [
        {
          id: "pr-1",
          produkttyp: "pt-fenster",
          material: "mat-kunststoff",
          profil: "prof-iglo5",
          grundpreis_pro_m2: 15000,
          aktiv: true,
        },
      ],
    });

    const selections = { ...baseSelections, produkttyp: null };
    const price = await calculateServerPrice(selections, mockPayload as any);
    expect(price).toBe(0);
  });

  it("adds aufpreis from extras (multiple, cents)", async () => {
    const mockPayload = createMockPayload({
      preisregeln: [
        {
          id: "pr-1",
          produkttyp: "pt-fenster",
          material: "mat-kunststoff",
          profil: "prof-iglo5",
          grundpreis_pro_m2: 10000, // 100 EUR in cents
          aktiv: true,
        },
      ],
      extras: [
        { id: "ex-1", aufpreis: 2000, aktiv: true },
        { id: "ex-2", aufpreis: 3500, aktiv: true },
      ],
    });

    const selections = { ...baseSelections, extras: ["ex-1", "ex-2"] };
    const price = await calculateServerPrice(selections, mockPayload as any);
    // 1.2 m2 * 10000 = 12000 + 2000 + 3500 = 17500 cents
    expect(price).toBe(17500);
  });

  it("rounds area * grundpreis to integer cents", async () => {
    const mockPayload = createMockPayload({
      preisregeln: [
        {
          id: "pr-1",
          produkttyp: "pt-fenster",
          material: "mat-kunststoff",
          profil: "prof-iglo5",
          grundpreis_pro_m2: 9999, // 99.99 EUR in cents
          aktiv: true,
        },
      ],
    });

    const price = await calculateServerPrice(
      baseSelections,
      mockPayload as any,
    );
    // 1.2 * 9999 = 11998.8 -> Math.round = 11999 cents
    expect(price).toBe(11999);
  });
});
