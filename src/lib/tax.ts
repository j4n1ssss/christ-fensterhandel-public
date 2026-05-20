/**
 * Central MwSt/tax calculation library.
 * All amounts in integer cents. All rates in percent (e.g. 19 for 19%).
 * No floating point money. No OOP. Pure functions only.
 */

export function calcGrossFromNet(
  netCents: number,
  ratePercent: number,
): number {
  return Math.round(netCents * (1 + ratePercent / 100));
}

export function calcNetFromGross(
  grossCents: number,
  ratePercent: number,
): number {
  return Math.round(grossCents / (1 + ratePercent / 100));
}

export function calcTax(netCents: number, ratePercent: number): number {
  return Math.round((netCents * ratePercent) / 100);
}

export function splitLine(
  unitCents: number,
  qty: number,
  ratePercent: number,
): { netCents: number; taxCents: number; grossCents: number } {
  const netCents = unitCents * qty;
  const taxCents = calcTax(netCents, ratePercent);
  const grossCents = netCents + taxCents;
  return { netCents, taxCents, grossCents };
}
