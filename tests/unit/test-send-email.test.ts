/**
 * Unit tests for POST /api/admin/send-email (ADMN-02).
 * Wave 0: Test stubs written before implementation.
 *
 * @jest-environment node
 */

describe("POST /api/admin/send-email", () => {
  it.todo("returns 403 for unauthenticated requests");
  it.todo("returns 403 for kunde role");
  it.todo("returns 400 for missing required fields");
  it.todo("returns 400 for invalid email address");
  it.todo("returns 404 for non-existent anfrage");
  it.todo("returns 429 when rate limit exceeded (>10/min)");
  it.todo("creates email_queue entry with anfrage and sent_by fields");
  it.todo("creates StatusHistorie entry with [E-Mail gesendet] prefix");
  it.todo("mode replace sends only to alt recipient");
  it.todo("mode additional sends to both customer and alt recipient");
  it.todo("uses event_type format manuell_{templateSlug}");
});
