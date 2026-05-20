/**
 * Test stubs for GET /api/stripe/redirect/[anfrageId] (STRP-04, STRP-05)
 *
 * @jest-environment node
 */

describe("Redirect route", () => {
  test.todo("redirects to existing valid Stripe checkout URL");
  test.todo(
    "redirects to /zahlung/fehler when anfrage status is not zahlungslink_versendet",
  );
  test.todo("redirects to /zahlung/fehler when anfrage not found");
  test.todo("auto-regenerates expired session and redirects to new URL");
  test.todo("expires old session before creating new one (STRP-06)");
  test.todo("queues zahlungslink_versendet email on regeneration");
  test.todo("stores new session data on anfrage after regeneration");
});

describe("Payment status polling route", () => {
  test.todo("returns stripe_payment_status from DB for valid session_id");
  test.todo("rejects invalid session_id format (must start with cs_)");
  test.todo("returns 404 for unknown session_id");
  test.todo("returns anfrage_id in response for client-side navigation");
});
