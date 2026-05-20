import {
  calcGrossFromNet,
  calcNetFromGross,
  calcTax,
  splitLine,
} from "@/lib/tax";

describe("calcGrossFromNet", () => {
  it("calculates gross from net with 19% tax", () => {
    // 100.00 EUR net -> 119.00 EUR gross
    expect(calcGrossFromNet(10000, 19)).toBe(11900);
  });

  it("returns 0 for zero amount", () => {
    expect(calcGrossFromNet(0, 19)).toBe(0);
  });

  it("handles sub-cent rounding correctly", () => {
    // 0.01 EUR * 1.19 = 0.0119 -> Math.round(1.19) = 1
    expect(calcGrossFromNet(1, 19)).toBe(1);
  });
});

describe("calcNetFromGross", () => {
  it("calculates net from gross with 19% tax (round-trip)", () => {
    // 119.00 EUR gross -> 100.00 EUR net
    expect(calcNetFromGross(11900, 19)).toBe(10000);
  });

  it("handles non-exact round-trip values", () => {
    // 999 / 1.19 = 839.4957... -> Math.round = 839
    expect(calcNetFromGross(999, 19)).toBe(839);
  });
});

describe("calcTax", () => {
  it("calculates tax amount from net", () => {
    expect(calcTax(10000, 19)).toBe(1900);
  });

  it("returns 0 for sub-cent tax", () => {
    // Math.round(1 * 0.19) = Math.round(0.19) = 0
    expect(calcTax(1, 19)).toBe(0);
  });

  it("returns 0 for 0% tax rate", () => {
    expect(calcTax(10000, 0)).toBe(0);
  });
});

describe("splitLine", () => {
  it("splits a line item into net, tax, and gross", () => {
    // 50.00 EUR * 3 = 150.00 EUR net, 19% tax = 28.50, gross = 178.50
    expect(splitLine(5000, 3, 19)).toEqual({
      netCents: 15000,
      taxCents: 2850,
      grossCents: 17850,
    });
  });

  it("returns all zeros for zero unit price", () => {
    expect(splitLine(0, 5, 19)).toEqual({
      netCents: 0,
      taxCents: 0,
      grossCents: 0,
    });
  });
});
