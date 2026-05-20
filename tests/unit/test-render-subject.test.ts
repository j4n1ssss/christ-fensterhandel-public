import { renderSubject } from "@/lib/email/render-subject";

describe("renderSubject", () => {
  test("replaces #{variable} placeholders correctly", () => {
    const result = renderSubject("Anfrage #{anfrage_nummer} bestaetigt", {
      anfrage_nummer: "ANF-2026-042",
    });
    expect(result).toBe("Anfrage ANF-2026-042 bestaetigt");
  });

  test("replaces multiple placeholders", () => {
    const result = renderSubject("#{a} #{b}", { a: "X", b: "Y" });
    expect(result).toBe("X Y");
  });

  test("returns empty string for missing variable placeholder", () => {
    const result = renderSubject(
      "Anfrage #{anfrage_nummer} von #{kunde_name}",
      { anfrage_nummer: "ANF-2026-042" },
    );
    expect(result).toBe("Anfrage ANF-2026-042 von ");
  });

  test("returns string unchanged when no placeholders present", () => {
    const result = renderSubject("Keine Platzhalter hier", {});
    expect(result).toBe("Keine Platzhalter hier");
  });

  test("handles empty template string", () => {
    const result = renderSubject("", { key: "value" });
    expect(result).toBe("");
  });

  test("handles empty variables object", () => {
    const result = renderSubject("#{missing}", {});
    expect(result).toBe("");
  });
});
