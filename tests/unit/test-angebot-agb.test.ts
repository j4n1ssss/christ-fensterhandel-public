/**
 * Unit tests for AGB checkbox schema validation (ANG-05).
 * Tests the kontaktSchema to ensure agb field works as z.literal(true).
 */
import { kontaktSchema } from "@/lib/anfrage/schemas";

describe("AGB Checkbox", () => {
  const validBase = {
    vorname: "Max",
    nachname: "Muster",
    email: "max@test.de",
    datenschutz: true as const,
    agb: true as const,
  };

  describe("Schema validation", () => {
    it("kontaktSchema requires agb: z.literal(true)", () => {
      const result = kontaktSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("rejects submission when agb is false", () => {
      const result = kontaktSchema.safeParse({
        ...validBase,
        agb: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects submission when agb is missing", () => {
      const { agb: _agb, ...withoutAgb } = validBase;
      const result = kontaktSchema.safeParse(withoutAgb);
      expect(result.success).toBe(false);
    });

    it("accepts submission when agb is true", () => {
      const result = kontaktSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agb).toBe(true);
      }
    });

    it("rejects submission when agb is undefined", () => {
      const result = kontaktSchema.safeParse({
        ...validBase,
        agb: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("rejects submission when agb is a string instead of boolean", () => {
      const result = kontaktSchema.safeParse({
        ...validBase,
        agb: "true",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Combined validation", () => {
    it("accepts when both datenschutz and agb are true", () => {
      const result = kontaktSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agb).toBe(true);
        expect(result.data.datenschutz).toBe(true);
      }
    });

    it("rejects when agb is true but datenschutz is false", () => {
      const result = kontaktSchema.safeParse({
        ...validBase,
        datenschutz: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects when datenschutz is true but agb is false", () => {
      const result = kontaktSchema.safeParse({
        ...validBase,
        agb: false,
      });
      expect(result.success).toBe(false);
    });
  });
});
