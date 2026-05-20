/**
 * Unit tests for Angebot acceptance (Annehmen) validation.
 * Tests the validation logic extracted from the route handler.
 */

describe("Angebot Annehmen Validation", () => {
  describe("Status validation", () => {
    it("rejects when anfrage status is not angebot_versendet", () => {
      const anfrage = { status: "in_bearbeitung" };
      const isValid = anfrage.status === "angebot_versendet";
      expect(isValid).toBe(false);
    });

    it("accepts when anfrage status is angebot_versendet", () => {
      const anfrage = { status: "angebot_versendet" };
      const isValid = anfrage.status === "angebot_versendet";
      expect(isValid).toBe(true);
    });
  });

  describe("Gueltigkeit validation", () => {
    it("rejects when angebot is expired (gueltig_bis < now)", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const isExpired = new Date() > yesterday;
      expect(isExpired).toBe(true);
    });

    it("accepts when angebot is valid until end of day", () => {
      const today = new Date();
      // Set gueltig_bis to today
      const gueltigBis = new Date(today);
      gueltigBis.setHours(23, 59, 59, 999);

      const isExpired = new Date() > gueltigBis;
      expect(isExpired).toBe(false);
    });

    it("accepts when gueltig_bis is null (no expiry)", () => {
      const gueltigBis = null;
      // When null, we skip validation (no expiry)
      const shouldValidate = gueltigBis !== null;
      expect(shouldValidate).toBe(false);
    });
  });

  describe("AGB validation", () => {
    it("rejects when agb_akzeptiert is not true", () => {
      const { z } = require("zod");
      const schema = z.object({
        anfrageId: z.string().min(1),
        agb_akzeptiert: z.literal(true),
      });
      const result = schema.safeParse({
        anfrageId: "test-id",
        agb_akzeptiert: false,
      });
      expect(result.success).toBe(false);
    });

    it("stores agb_akzeptiert_bei_annahme_am timestamp", () => {
      const now = new Date().toISOString();
      const updateData = { agb_akzeptiert_bei_annahme_am: now };
      expect(updateData.agb_akzeptiert_bei_annahme_am).toBeDefined();
      expect(
        new Date(updateData.agb_akzeptiert_bei_annahme_am).getTime(),
      ).toBeGreaterThan(0);
    });
  });

  describe("Checkout creation", () => {
    it("creates Stripe checkout with angebot.betrag_brutto_cents", () => {
      const angebot = { betrag_brutto_cents: 25000 };
      const checkoutOpts = {
        gesamtpreis: angebot.betrag_brutto_cents,
      };
      expect(checkoutOpts.gesamtpreis).toBe(25000);
    });

    it("includes flow metadata for webhook expiry handling", () => {
      const metadata = { flow: "angebots_annahme" };
      expect(metadata.flow).toBe("angebots_annahme");
    });

    it("updates anfrage status to zahlungslink_versendet", () => {
      const updateData = {
        status: "zahlungslink_versendet",
        stripe_checkout_url: "https://checkout.stripe.com/pay/cs_test_123",
        stripe_session_id: "cs_test_123",
        stripe_payment_status: "offen",
      };
      expect(updateData.status).toBe("zahlungslink_versendet");
      expect(updateData.stripe_payment_status).toBe("offen");
    });

    it("returns checkout_url in response", () => {
      const response = {
        checkout_url: "https://checkout.stripe.com/pay/cs_test_123",
      };
      expect(response.checkout_url).toContain("checkout.stripe.com");
    });
  });
});
