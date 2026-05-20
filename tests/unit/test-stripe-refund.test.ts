/**
 * Test stubs for POST /api/stripe/refund (STRP-08)
 *
 * @jest-environment node
 */

describe("Refund API route", () => {
  test.todo("rejects non-admin users with 403");
  test.todo("validates request body with Zod schema");
  test.todo(
    "rejects refund when anfrage status is not in REFUND_ALLOWED_STATUSES",
  );
  test.todo("rejects refund when no payment_intent_id on anfrage");
  test.todo("rejects refund amount exceeding remaining balance");
  test.todo("creates full Stripe refund when no amount_cents provided");
  test.todo("creates partial Stripe refund with specified amount_cents");
  test.todo("sets status to rueckerstattung_ausstehend for full refund");
  test.todo("does NOT change anfrage status for partial refund");
  test.todo("updates stripe_refunded_amount_cents cumulatively");
  test.todo("creates StatusHistorie entry with refund amount and reason");
  test.todo("returns success response with refund_id and amount");
  test.todo("checks optimistic lock version before processing");
  test.todo("handles StripeInvalidRequestError gracefully");
});
