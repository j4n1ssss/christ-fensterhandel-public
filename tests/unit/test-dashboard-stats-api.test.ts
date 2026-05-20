/**
 * Unit tests for GET /api/admin/dashboard-stats (ADMN-04).
 * Wave 0: Test stubs written before implementation.
 *
 * @jest-environment node
 */

describe("GET /api/admin/dashboard-stats", () => {
  it.todo("returns 403 for unauthenticated requests");
  it.todo(
    "returns stats object with neueHeute, offeneGesamt, bestaetigteMonat, umsatzCents, dringend",
  );
  it.todo(
    "computes dringend count using server-side date query (no limit=0 + JS filter)",
  );
  it.todo("computes umsatz via paginated iteration (no limit=0)");
  it.todo("returns statusDistribution array with color and label");
  it.todo("returns letzte10 enriched with statusColor and statusLabel");
  it.todo("runs stat queries in parallel via Promise.all");
});
