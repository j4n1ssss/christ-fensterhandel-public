import {
  getWaitingDays,
  getUrgencyLevel,
  getProduktZusammenfassung,
  isTerminalStatus,
  isCompletedStatus,
  shouldShowDetailsTab,
  URGENCY_COLORS,
} from "@/lib/detail-view-helpers";
import { formatCurrency } from "@/lib/format-currency";

describe("detail-view-helpers", () => {
  describe("getWaitingDays", () => {
    it("returns 0 for null input", () => {
      expect(getWaitingDays(null)).toBe(0);
    });

    it("returns correct day count for a date 3 days ago", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
      expect(getWaitingDays(threeDaysAgo)).toBe(3);
    });
  });

  describe("getUrgencyLevel", () => {
    it('returns "normal" for 0 days', () => {
      expect(getUrgencyLevel(0)).toBe("normal");
    });

    it('returns "warn" for 2 days', () => {
      expect(getUrgencyLevel(2)).toBe("warn");
    });

    it('returns "urgent" for 5 days', () => {
      expect(getUrgencyLevel(5)).toBe("urgent");
    });

    it('returns "critical" for 10 days', () => {
      expect(getUrgencyLevel(10)).toBe("critical");
    });
  });

  describe("getProduktZusammenfassung", () => {
    it("groups by produkttyp and sums stueckzahl", () => {
      const produkte = [
        { produkttyp: "Fenster", stueckzahl: 2 },
        { produkttyp: "Tür", stueckzahl: 1 },
        { produkttyp: "Fenster", stueckzahl: 3 },
      ];
      expect(getProduktZusammenfassung(produkte)).toBe("5x Fenster, 1x Tür");
    });

    it('returns "1x Fenster" for single product', () => {
      const produkte = [{ produkttyp: "Fenster", stueckzahl: 1 }];
      expect(getProduktZusammenfassung(produkte)).toBe("1x Fenster");
    });
  });

  describe("isTerminalStatus", () => {
    it('returns true for "storniert"', () => {
      expect(isTerminalStatus("storniert")).toBe(true);
    });

    it('returns false for "neu"', () => {
      expect(isTerminalStatus("neu")).toBe(false);
    });
  });

  describe("isCompletedStatus", () => {
    it('returns true for "abgeschlossen"', () => {
      expect(isCompletedStatus("abgeschlossen")).toBe(true);
    });
  });

  describe("shouldShowDetailsTab", () => {
    it('returns false for "neu"', () => {
      expect(shouldShowDetailsTab("neu")).toBe(false);
    });

    it('returns true for "an_hersteller"', () => {
      expect(shouldShowDetailsTab("an_hersteller")).toBe(true);
    });

    it('returns true for "storniert"', () => {
      expect(shouldShowDetailsTab("storniert")).toBe(true);
    });
  });

  describe("URGENCY_COLORS", () => {
    it("has correct color values", () => {
      expect(URGENCY_COLORS.normal).toBe("");
      expect(URGENCY_COLORS.warn).toBe("#eab308");
      expect(URGENCY_COLORS.urgent).toBe("#f97316");
      expect(URGENCY_COLORS.critical).toBe("#ef4444");
    });
  });
});

describe("formatCurrency", () => {
  it('formats 1234.5 to include "EUR"', () => {
    const result = formatCurrency(1234.5);
    // de-DE format: "1.234,50 €" or "1.234,50 EUR"
    expect(result).toMatch(/1\.234,50/);
    // Should contain Euro symbol or EUR
    expect(result).toMatch(/(\u20AC|EUR)/);
  });
});
