import {
  kontaktSchema,
  snapshotItemSchema,
  submissionSchema,
} from "@/lib/anfrage/schemas";

describe("kontaktSchema", () => {
  const validData = {
    vorname: "Max",
    nachname: "Mustermann",
    email: "max@example.com",
    datenschutz: true as const,
    agb: true as const,
  };

  it("accepts valid contact data with required fields only", () => {
    const result = kontaktSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts valid data with all optional fields", () => {
    const result = kontaktSchema.safeParse({
      ...validData,
      telefon: "0151-12345678",
      strasse: "Musterstr. 1",
      plz: "12345",
      ort: "Musterstadt",
      nachricht: "Bitte schnell liefern",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty vorname", () => {
    const result = kontaktSchema.safeParse({ ...validData, vorname: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing vorname", () => {
    const { vorname, ...rest } = validData;
    const result = kontaktSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = kontaktSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects datenschutz = false", () => {
    const result = kontaktSchema.safeParse({
      ...validData,
      datenschutz: false,
    });
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be omitted", () => {
    const result = kontaktSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.telefon).toBeUndefined();
      expect(result.data.strasse).toBeUndefined();
      expect(result.data.plz).toBeUndefined();
      expect(result.data.ort).toBeUndefined();
      expect(result.data.nachricht).toBeUndefined();
    }
  });
});

describe("snapshotItemSchema", () => {
  it("validates a valid snapshot item", () => {
    const item = {
      selections: { produkttyp: "pt-1", material: "mat-1" },
      resolvedNames: { produkttyp: "Fenster", material: "Kunststoff" },
      serverPrice: 1234.56,
      quantity: 2,
    };
    const result = snapshotItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing serverPrice", () => {
    const item = {
      selections: { produkttyp: "pt-1" },
      resolvedNames: { produkttyp: "Fenster" },
      quantity: 1,
    };
    const result = snapshotItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe("submissionSchema", () => {
  it("validates a complete submission", () => {
    const submission = {
      kontaktdaten: {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max@example.com",
        datenschutz: true as const,
        agb: true as const,
      },
      produkte: [
        {
          selections: { produkttyp: "pt-1" },
          resolvedNames: { produkttyp: "Fenster" },
          serverPrice: 500,
          quantity: 1,
        },
      ],
    };
    const result = submissionSchema.safeParse(submission);
    expect(result.success).toBe(true);
  });

  it("rejects submission with empty produkte", () => {
    const submission = {
      kontaktdaten: {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max@example.com",
        datenschutz: true as const,
        agb: true as const,
      },
      produkte: [],
    };
    const result = submissionSchema.safeParse(submission);
    expect(result.success).toBe(false);
  });

  it("accepts optional rabattcode", () => {
    const submission = {
      kontaktdaten: {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max@example.com",
        datenschutz: true as const,
        agb: true as const,
      },
      produkte: [
        {
          selections: { produkttyp: "pt-1" },
          resolvedNames: { produkttyp: "Fenster" },
          serverPrice: 500,
          quantity: 1,
        },
      ],
      rabattcode: "SOMMER2026",
    };
    const result = submissionSchema.safeParse(submission);
    expect(result.success).toBe(true);
  });
});
