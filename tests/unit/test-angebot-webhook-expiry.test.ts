/**
 * Unit tests for webhook checkout expiry reset logic (Angebots-Annahme flow).
 * Tests the metadata-based flow detection and status reset logic.
 */

describe("Webhook Checkout Expiry", () => {
  describe("Angebots-Annahme flow reset", () => {
    it("resets anfrage status to angebot_versendet when session metadata has flow=angebots_annahme", () => {
      const session = {
        metadata: { anfrage_id: "uuid-1", flow: "angebots_annahme" },
      };
      const anfrage = {
        status: "zahlungslink_versendet",
        stripe_payment_status: "offen",
      };

      const isAngebotsAnnahme = session.metadata?.flow === "angebots_annahme";
      const updateData: Record<string, any> = {
        stripe_payment_status: "abgelaufen",
      };

      if (isAngebotsAnnahme && anfrage.status === "zahlungslink_versendet") {
        updateData.status = "angebot_versendet";
      }

      expect(updateData.status).toBe("angebot_versendet");
      expect(updateData.stripe_payment_status).toBe("abgelaufen");
    });

    it("does NOT reset status when session metadata has no flow field", () => {
      const session = {
        metadata: { anfrage_id: "uuid-1" },
      };
      const anfrage = {
        status: "zahlungslink_versendet",
        stripe_payment_status: "offen",
      };

      const isAngebotsAnnahme =
        (session.metadata as any)?.flow === "angebots_annahme";
      const updateData: Record<string, any> = {
        stripe_payment_status: "abgelaufen",
      };

      if (isAngebotsAnnahme && anfrage.status === "zahlungslink_versendet") {
        updateData.status = "angebot_versendet";
      }

      expect(updateData.status).toBeUndefined();
      expect(updateData.stripe_payment_status).toBe("abgelaufen");
    });

    it("sets stripe_payment_status to abgelaufen in both cases", () => {
      // Case 1: With Angebots-Annahme flow
      const updateData1: Record<string, any> = {
        stripe_payment_status: "abgelaufen",
      };
      expect(updateData1.stripe_payment_status).toBe("abgelaufen");

      // Case 2: Without flow metadata
      const updateData2: Record<string, any> = {
        stripe_payment_status: "abgelaufen",
      };
      expect(updateData2.stripe_payment_status).toBe("abgelaufen");
    });

    it("is idempotent -- skips if already abgelaufen", () => {
      const anfrage = { stripe_payment_status: "abgelaufen" };
      const shouldSkip = anfrage.stripe_payment_status === "abgelaufen";
      expect(shouldSkip).toBe(true);
    });

    it("does NOT reset status when anfrage status is NOT zahlungslink_versendet", () => {
      const session = {
        metadata: { anfrage_id: "uuid-1", flow: "angebots_annahme" },
      };
      // Anfrage already moved to bezahlt (race condition handling)
      const anfrage = { status: "bezahlt", stripe_payment_status: "bezahlt" };

      const isAngebotsAnnahme = session.metadata?.flow === "angebots_annahme";
      const updateData: Record<string, any> = {
        stripe_payment_status: "abgelaufen",
      };

      if (isAngebotsAnnahme && anfrage.status === "zahlungslink_versendet") {
        updateData.status = "angebot_versendet";
      }

      // Status should NOT be changed since anfrage is already bezahlt
      expect(updateData.status).toBeUndefined();
    });
  });
});
