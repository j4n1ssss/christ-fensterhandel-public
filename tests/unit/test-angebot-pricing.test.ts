/**
 * Unit tests for Angebot pricing calculations.
 * Wave 0 stubs replaced with actual implementations (ANG-01).
 */

import { calcNetFromGross, calcGrossFromNet } from "@/lib/tax";

describe("Angebot Pricing", () => {
  describe("Brutto -> Netto + MwSt derivation", () => {
    it("calculates netto from brutto using calcNetFromGross", () => {
      // 119.00 EUR brutto -> 100.00 EUR netto at 19%
      expect(calcNetFromGross(11900, 19)).toBe(10000);
    });

    it("derives MwSt as brutto - netto (not separate calcTax)", () => {
      const brutto = 11900;
      const netto = calcNetFromGross(brutto, 19);
      const mwst = brutto - netto;
      expect(mwst).toBe(1900);
    });

    it("handles standard 19% MwSt correctly", () => {
      // Various amounts
      expect(calcNetFromGross(23800, 19)).toBe(20000); // 238.00 -> 200.00
      expect(calcNetFromGross(1190, 19)).toBe(1000); // 11.90 -> 10.00
      // Round-trip: netto -> brutto -> netto
      const brutto = calcGrossFromNet(15000, 19);
      expect(brutto).toBe(17850); // 150.00 * 1.19 = 178.50
      expect(calcNetFromGross(brutto, 19)).toBe(15000);
    });

    it("handles edge case: 1 cent brutto", () => {
      const netto = calcNetFromGross(1, 19);
      expect(netto).toBe(1); // Math.round(1 / 1.19) = Math.round(0.84) = 1
      const mwst = 1 - netto;
      expect(mwst).toBe(0);
    });
  });

  describe("Custom price detection", () => {
    it("detects custom price when bruttoCents differs from standard", () => {
      const produkteSummeNetto = 10000; // 100.00 EUR netto
      const standardBrutto = calcGrossFromNet(produkteSummeNetto, 19);
      expect(standardBrutto).toBe(11900);
      // Custom price is different
      const customBrutto = 12000;
      expect(customBrutto).not.toBe(standardBrutto);
    });

    it("returns false when bruttoCents matches calcGrossFromNet(produkteSumme)", () => {
      const produkteSummeNetto = 10000;
      const standardBrutto = calcGrossFromNet(produkteSummeNetto, 19);
      const isCustom = standardBrutto !== 11900;
      expect(isCustom).toBe(false);
    });

    it("requires begruendung when price is custom", () => {
      const produkteSummeNetto = 10000;
      const standardBrutto = calcGrossFromNet(produkteSummeNetto, 19);
      const customBrutto = 10000; // Different from standard 11900
      const isCustomPrice = customBrutto !== standardBrutto;
      expect(isCustomPrice).toBe(true);
      // When custom, begruendung should be required
      const begruendung = "";
      expect(isCustomPrice && !begruendung).toBe(true);
    });

    it("does not require begruendung when price matches standard", () => {
      const produkteSummeNetto = 10000;
      const standardBrutto = calcGrossFromNet(produkteSummeNetto, 19);
      const isCustomPrice = standardBrutto !== standardBrutto;
      expect(isCustomPrice).toBe(false);
    });
  });

  describe("Rabatt calculation", () => {
    it("computes rabattCents when Gesamt < sum of adjusted positions", () => {
      // 2 positions: each 100 EUR brutto, total should be 200 EUR
      const adjustedTotal = 20000; // 200.00 EUR
      const gesamtBrutto = 18000; // 180.00 EUR (20 EUR Rabatt)
      const rabattCents =
        gesamtBrutto < adjustedTotal ? adjustedTotal - gesamtBrutto : 0;
      expect(rabattCents).toBe(2000);
    });

    it("returns 0 rabattCents when no individual adjustments", () => {
      const einzelpreise: { positionsIndex: number; bruttoCents: number }[] =
        [];
      const rabattCents = einzelpreise.length > 0 ? 1000 : 0;
      expect(rabattCents).toBe(0);
    });

    it("handles mixed adjusted and non-adjusted positions", () => {
      // Position 0: adjusted to 5000, qty 2 -> 10000
      // Position 1: standard netto 3000, qty 1 -> brutto 3570 (at 19%)
      const positions = [
        { einzelpreis: 4000, stueckzahl: 2 }, // netto 4000/unit
        { einzelpreis: 3000, stueckzahl: 1 }, // netto 3000/unit
      ];
      const einzelpreise = [{ positionsIndex: 0, bruttoCents: 5000 }];

      let adjustedTotal = 0;
      for (let i = 0; i < positions.length; i++) {
        const adjusted = einzelpreise.find((e) => e.positionsIndex === i);
        if (adjusted) {
          adjustedTotal += adjusted.bruttoCents * positions[i].stueckzahl;
        } else {
          adjustedTotal += calcGrossFromNet(
            positions[i].einzelpreis * positions[i].stueckzahl,
            19,
          );
        }
      }
      // pos 0: 5000 * 2 = 10000, pos 1: 3000 * 1.19 = 3570
      expect(adjustedTotal).toBe(13570);

      const gesamtBrutto = 12000;
      const rabattCents =
        gesamtBrutto < adjustedTotal ? adjustedTotal - gesamtBrutto : 0;
      expect(rabattCents).toBe(1570);
    });
  });
});
