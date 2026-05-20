/**
 * Unit tests for Stripe Webhook handling.
 * Wave 0: Written before implementation (RED phase).
 *
 * @jest-environment node
 */

const mockConstructEvent = jest.fn();
const mockUpdate = jest.fn();
const mockFindByID = jest.fn();

// Mock stripe before imports
jest.mock("stripe", () => {
  const MockStripe = jest.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
  return { __esModule: true, default: MockStripe };
});

// Mock payload
jest.mock("payload", () => ({
  getPayload: jest.fn().mockResolvedValue({
    findByID: mockFindByID,
    update: mockUpdate,
  }),
}));

jest.mock("@payload-config", () => ({}), { virtual: true });

describe("Stripe Webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_fake";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_fake";
    mockUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  describe("POST /api/stripe/webhook", () => {
    it("rejects request without valid stripe signature (401)", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const { POST } = await import("@/app/api/stripe/webhook/route");
      const request = new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "invalid_sig",
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("updates anfrage status to bezahlt on checkout.session.completed", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            payment_status: "paid",
            metadata: {
              anfrage_id: "uuid-1",
              anfrage_nummer: "ANF-001",
            },
          },
        },
      };
      mockConstructEvent.mockReturnValue(mockEvent);
      mockFindByID.mockResolvedValue({
        id: "uuid-1",
        status: "bestaetigt",
      });

      const { POST } = await import("@/app/api/stripe/webhook/route");
      const request = new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid_sig",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: "anfragen",
          id: "uuid-1",
          data: expect.objectContaining({ status: "bezahlt" }),
        }),
      );
    });

    it("idempotent — skips update if already bezahlt", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            payment_status: "paid",
            metadata: {
              anfrage_id: "uuid-1",
              anfrage_nummer: "ANF-001",
            },
          },
        },
      };
      mockConstructEvent.mockReturnValue(mockEvent);
      mockFindByID.mockResolvedValue({
        id: "uuid-1",
        status: "bezahlt",
      });

      const { POST } = await import("@/app/api/stripe/webhook/route");
      const request = new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid_sig",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("ignores non-checkout events", async () => {
      const mockEvent = {
        type: "charge.succeeded",
        data: {
          object: {
            id: "ch_test_123",
          },
        },
      };
      mockConstructEvent.mockReturnValue(mockEvent);

      const { POST } = await import("@/app/api/stripe/webhook/route");
      const request = new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "valid_sig",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // --- Phase 27 Expanded Webhook Stubs ---

  describe("handleCheckoutCompleted (STRP-07)", () => {
    test.todo("sets status to bezahlt and stores payment_intent_id");
    test.todo(
      "skips duplicate events when stripe_payment_status is already bezahlt",
    );
    test.todo("ignores sessions without anfrage_id in metadata");
    test.todo("ignores sessions where payment_status is not paid");
  });

  describe("handleCheckoutExpired (STRP-05)", () => {
    test.todo(
      "sets stripe_payment_status to abgelaufen without changing anfrage status",
    );
    test.todo("skips duplicate expired events");
    test.todo("does NOT send email on expiry");
  });

  describe("handleChargeRefunded (STRP-09)", () => {
    test.todo(
      "updates stripe_refunded_amount_cents from charge.amount_refunded",
    );
    test.todo("sets stripe_payment_status to rueckerstattet for full refund");
    test.todo(
      "sets stripe_payment_status to teilweise_erstattet for partial refund",
    );
    test.todo(
      "changes anfrage status to rueckerstattung_abgeschlossen only for full refund from rueckerstattung_ausstehend",
    );
    test.todo("generates Gutschrift PDF on each refund event");
    test.todo("queues rueckerstattung email to customer");
  });

  describe("handleDisputeCreated (STRP-09)", () => {
    test.todo("sets stripe_payment_status to dispute");
    test.todo("sends immediate staff email with zahlung_dispute event type");
    test.todo("does NOT change anfrage status");
  });

  describe("Webhook idempotency (STRP-07)", () => {
    test.todo(
      "duplicate checkout.session.completed does not create duplicate updates",
    );
    test.todo(
      "duplicate charge.refunded does not double-count refunded amount",
    );
  });

  describe("Structured logging (STRP-10)", () => {
    test.todo("webhook handler uses console.info with [Stripe Webhook] prefix");
    test.todo("no console.log calls in webhook handler");
  });
});
