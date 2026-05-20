/**
 * Unit tests for POST /api/admin/email-preview (ADMN-02).
 * Wave 0: Test stubs written before implementation.
 *
 * @jest-environment node
 */

describe("POST /api/admin/email-preview", () => {
  it.todo("returns 403 for unauthenticated requests");
  it.todo("returns 403 for kunde role");
  it.todo("returns 400 for missing anfrageId or templateSlug");
  it.todo("returns 404 for non-existent anfrage");
  it.todo("returns rendered HTML for valid template + anfrage");
  it.todo("includes freitext in rendered output when provided");
  it.todo("works without freitext (optional field)");
});
