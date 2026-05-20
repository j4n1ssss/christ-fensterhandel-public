import { formatCents } from "@/lib/format-currency";
import { formatCurrency, formatPrice } from "@/lib/format-currency";

describe("formatCents", () => {
  it("formats 12345 cents as German locale EUR", () => {
    const result = formatCents(12345);
    expect(result).toContain("123,45");
    expect(result).toMatch(/EUR|€/);
  });

  it("formats 0 cents", () => {
    const result = formatCents(0);
    expect(result).toContain("0,00");
  });

  it("formats 1 cent", () => {
    const result = formatCents(1);
    expect(result).toContain("0,01");
  });

  it("formats 100 cents as 1,00", () => {
    const result = formatCents(100);
    expect(result).toContain("1,00");
  });

  it("formats USD currency", () => {
    const result = formatCents(12345, "USD");
    expect(result).toMatch(/\$|USD/);
  });
});

describe("backward compatibility", () => {
  it("formatCurrency still works with float amounts", () => {
    const result = formatCurrency(123.45);
    expect(result).toContain("123,45");
  });

  it("formatPrice returns dash for null", () => {
    const result = formatPrice(null);
    expect(result).toBe("\u2014");
  });

  it("formatPrice returns dash for undefined", () => {
    const result = formatPrice(undefined);
    expect(result).toBe("\u2014");
  });
});
