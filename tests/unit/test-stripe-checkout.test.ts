/**
 * Unit tests for Stripe Checkout Session creation.
 * Wave 0: Written before implementation (RED phase).
 *
 * @jest-environment node
 */

// Mock stripe before imports
jest.mock("stripe", () => {
  const mockCreate = jest.fn().mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test",
  });
  const mockCustomersList = jest.fn().mockResolvedValue({ data: [] });
  const mockCustomersCreate = jest.fn().mockResolvedValue({
    id: "cus_test_123",
  });
  const MockStripe = jest.fn(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
    customers: {
      list: mockCustomersList,
      create: mockCustomersCreate,
    },
  }));
  return { __esModule: true, default: MockStripe };
});

// Mock payload
jest.mock("payload", () => ({
  getPayload: jest.fn(),
}));

jest.mock("@payload-config", () => ({}), { virtual: true });

// Mock settings
jest.mock("@/lib/settings", () => ({
  getSettings: jest.fn().mockResolvedValue({
    stripe_zahlungslink_ablauf_stunden: 24,
    stripe_waehrung: "eur",
  }),
}));

import { getPayload } from "payload";

describe("Stripe Checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_fake";
    process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3000";
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_SERVER_URL;
  });

  describe("createCheckoutSession", () => {
    it("creates checkout session with correct EUR amount", async () => {
      const { createCheckoutSession } = await import("@/lib/stripe");

      const session = await createCheckoutSession({
        anfrageId: "uuid-1",
        anfrageNummer: "ANF-001",
        gesamtpreis: 24999,
        produktAnzahl: 2,
        kundenEmail: "kunde@example.com",
        kundenName: "Max Mustermann",
      });

      expect(session).toBeDefined();
      expect(session.id).toBe("cs_test_123");
      expect(session.url).toBe("https://checkout.stripe.com/test");
    });

    it("includes anfrage metadata in session", async () => {
      const { createCheckoutSession } = await import("@/lib/stripe");
      const session = await createCheckoutSession({
        anfrageId: "uuid-1",
        anfrageNummer: "ANF-001",
        gesamtpreis: 10000,
        produktAnzahl: 1,
        kundenEmail: "kunde@example.com",
        kundenName: "Max Mustermann",
      });
      expect(session).toBeDefined();
      expect(session.url).toBeDefined();
    });
  });

  // POST /api/stripe/checkout route was removed in Plan 27-02
  // (replaced by GET /api/stripe/redirect/[anfrageId])

  // --- Phase 27 Stripe E2E Test Stubs ---

  describe("createCheckoutSession (STRP-01)", () => {
    test.todo("creates session with correct currency from Settings");
    test.todo("creates session with expires_at from Settings ablauf_stunden");
    test.todo("clamps expires_at to Stripe 30min-24h window");
    test.todo("passes customer ID from findOrCreateStripeCustomer");
    test.todo("includes anfrage_id in session metadata");
    test.todo(
      "uses redirect URLs with /zahlung/erfolgreich and /zahlung/abgebrochen",
    );
  });

  describe("findOrCreateStripeCustomer (STRP-11)", () => {
    test.todo(
      "returns existing customer ID from Users collection if userId provided",
    );
    test.todo("looks up Stripe customer by email before creating new one");
    test.todo(
      "creates new customer with DSGVO-minimal data (email + name only)",
    );
    test.todo("stores customer ID on Users collection after creation");
    test.todo("handles guest checkout without userId");
  });

  describe("expireExistingSession (STRP-06)", () => {
    test.todo("expires open session successfully");
    test.todo("handles already-expired session gracefully");
    test.todo("handles non-existent session gracefully");
  });

  describe("Stripe fields on Anfragen (STRP-02)", () => {
    test.todo("stripe_payment_status field has correct select options");
    test.todo("stripe_refunded_amount_cents defaults to 0");
    test.todo("all stripe fields are readOnly in admin");
  });
});
