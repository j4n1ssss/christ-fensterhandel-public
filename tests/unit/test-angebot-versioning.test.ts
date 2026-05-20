/**
 * Unit tests for Angebot versioning logic.
 * Tests the sorting/selection logic for angebote versions.
 * ANG-02: Angebots-Historie mit Versionierung.
 */

interface AngebotDoc {
  id: string;
  version: number;
  status: "entwurf" | "versendet";
  betrag_brutto_cents: number;
  createdAt: string;
}

/**
 * Pure function: Given an array of angebote docs, returns the latest
 * versendet version (highest version number with status=versendet).
 */
function getLatestVersendeteAngebot(angebote: AngebotDoc[]): AngebotDoc | null {
  const versendet = angebote.filter((a) => a.status === "versendet");
  if (versendet.length === 0) return null;
  return versendet.reduce((latest, current) =>
    current.version > latest.version ? current : latest,
  );
}

/**
 * Pure function: Compute the next version number given existing angebote.
 */
function getNextVersion(angebote: AngebotDoc[]): number {
  if (angebote.length === 0) return 1;
  const maxVersion = Math.max(...angebote.map((a) => a.version));
  return maxVersion + 1;
}

/**
 * Pure function: Sort angebote by version descending (newest first).
 */
function sortByVersionDesc(angebote: AngebotDoc[]): AngebotDoc[] {
  return [...angebote].sort((a, b) => b.version - a.version);
}

describe("Angebot Versioning", () => {
  const makeAngebot = (
    version: number,
    status: "entwurf" | "versendet" = "versendet",
    betrag = 10000,
  ): AngebotDoc => ({
    id: `ang-${version}`,
    version,
    status,
    betrag_brutto_cents: betrag,
    createdAt: new Date(Date.now() - (10 - version) * 86400000).toISOString(),
  });

  it("first angebot for an anfrage gets version 1", () => {
    const angebote: AngebotDoc[] = [];
    expect(getNextVersion(angebote)).toBe(1);
  });

  it("second angebot increments to version 2", () => {
    const angebote = [makeAngebot(1)];
    expect(getNextVersion(angebote)).toBe(2);
  });

  it("latest version query returns highest version with status versendet", () => {
    const angebote = [
      makeAngebot(1, "versendet", 5000),
      makeAngebot(2, "versendet", 8000),
      makeAngebot(3, "entwurf", 9000),
    ];
    const latest = getLatestVersendeteAngebot(angebote);
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe(2);
    expect(latest!.betrag_brutto_cents).toBe(8000);
  });

  it("old versions remain accessible but not shown to customers", () => {
    const angebote = [
      makeAngebot(1, "versendet", 5000),
      makeAngebot(2, "versendet", 8000),
      makeAngebot(3, "versendet", 12000),
    ];

    // All versions are accessible (admin view)
    expect(angebote).toHaveLength(3);

    // Customer view: only latest versendet
    const customerView = getLatestVersendeteAngebot(angebote);
    expect(customerView!.version).toBe(3);
    expect(customerView!.betrag_brutto_cents).toBe(12000);

    // Other versions still exist in the array
    const sorted = sortByVersionDesc(angebote);
    expect(sorted[0].version).toBe(3);
    expect(sorted[1].version).toBe(2);
    expect(sorted[2].version).toBe(1);
  });

  it("returns null when no versendet angebote exist", () => {
    const angebote = [makeAngebot(1, "entwurf")];
    expect(getLatestVersendeteAngebot(angebote)).toBeNull();
  });

  it("correctly computes next version with gaps", () => {
    // Edge case: versions 1, 3 exist (2 was deleted or skipped)
    const angebote = [makeAngebot(1), makeAngebot(3)];
    expect(getNextVersion(angebote)).toBe(4);
  });

  it("sorts versions descending for display", () => {
    const angebote = [makeAngebot(2), makeAngebot(1), makeAngebot(3)];
    const sorted = sortByVersionDesc(angebote);
    expect(sorted.map((a) => a.version)).toEqual([3, 2, 1]);
  });
});
