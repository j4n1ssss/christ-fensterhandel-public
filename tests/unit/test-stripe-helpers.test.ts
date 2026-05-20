/**
 * Test stubs for stripe-helpers.ts (STRP-03)
 * Pure function tests -- no Stripe SDK mocking needed.
 *
 * @jest-environment node
 */

describe("PAYMENT_STATUS_COLORS", () => {
  test.todo("has entries for all 6 payment statuses");
  test.todo("offen is amber, bezahlt is green, abgelaufen is red");
});

describe("PAYMENT_STATUS_LABELS", () => {
  test.todo("has German labels for all 6 payment statuses");
});

describe("getStripeDashboardUrl", () => {
  test.todo(
    "returns test dashboard URL when STRIPE_SECRET_KEY starts with sk_test_",
  );
  test.todo(
    "returns live dashboard URL when STRIPE_SECRET_KEY starts with sk_live_",
  );
  test.todo("builds correct URL for payments object type");
  test.todo("builds correct URL for customers object type");
});

describe("ZAHLUNGS_PANEL_VISIBLE_STATUSES", () => {
  test.todo("includes zahlungslink_versendet and all post-payment statuses");
  test.todo(
    "does NOT include neu, in_bearbeitung, angebot_versendet, bestaetigt",
  );
});

describe("REFUND_ALLOWED_STATUSES", () => {
  test.todo("includes bezahlt and all post-bezahlt statuses");
  test.todo(
    "does NOT include rueckerstattung_ausstehend or rueckerstattung_abgeschlossen",
  );
  test.todo("does NOT include early statuses (neu, in_bearbeitung, etc.)");
});
