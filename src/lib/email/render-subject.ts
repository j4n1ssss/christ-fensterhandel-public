/**
 * Subject template rendering with #{variable} placeholder replacement.
 *
 * Pattern: "Anfrage #{anfrage_nummer} bestaetigt" + { anfrage_nummer: "ANF-2026-042" }
 * Result:  "Anfrage ANF-2026-042 bestaetigt"
 *
 * Missing variables are replaced with empty string.
 */
export function renderSubject(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/#{(\w+)}/g, (_, key) => variables[key] ?? "");
}
