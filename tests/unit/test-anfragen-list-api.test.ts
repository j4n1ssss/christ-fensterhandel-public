/**
 * Unit tests for GET /api/admin/anfragen-list (ADMN-04).
 * Wave 0: Test stubs written before implementation.
 *
 * @jest-environment node
 */

describe("GET /api/admin/anfragen-list", () => {
  it.todo("returns 403 for unauthenticated requests");
  it.todo("returns paginated docs with totalDocs, totalPages, page");
  it.todo("filters by tab using LIST_TAB_FILTERS status mapping");
  it.todo("applies search filter to anfrage_nummer, nachname, email");
  it.todo("sorts by attention score server-side (computed field)");
  it.todo("sorts by native fields using Payload pagination");
  it.todo("returns tabCounts reflecting current search filter");
  it.todo("enriches docs with _attentionScore, _waitingDays, _urgencyLevel");
  it.todo("defaults to page=1, limit=25, tab=alle, sort=attention");
});
