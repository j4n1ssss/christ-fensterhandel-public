/**
 * Email queue engine tests.
 *
 * Tests queueEmailEvent (creation, validation, toggle skip, idempotency),
 * processQueue (processing, retry, backoff, dead), and cleanupSentEvents.
 *
 * Mocks: Payload API, getSettings, renderEmailForEvent, global fetch.
 */

import type { EmailEventPayload } from "@/lib/email/types";
import { MOCK_SETTINGS } from "@/lib/email/mock-data";

// --- Mock setup ---

const mockCreate = jest.fn().mockResolvedValue({ id: "queue-entry-1" });
const mockFind = jest.fn().mockResolvedValue({ docs: [] });
const mockUpdate = jest.fn().mockResolvedValue({});
const mockDelete = jest.fn().mockResolvedValue({});

// Mock payload dynamic import
jest.mock("payload", () => ({
  getPayload: jest.fn().mockResolvedValue({
    create: (...args: unknown[]) => mockCreate(...args),
    find: (...args: unknown[]) => mockFind(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  }),
}));

jest.mock("@payload-config", () => ({}), { virtual: true });

// Mock getSettings
jest.mock("@/lib/settings", () => ({
  getSettings: jest.fn().mockResolvedValue({
    ...MOCK_SETTINGS,
    benachrichtigungs_emails: "admin@example.com, staff@example.com",
    email_reply_to: "reply@example.com",
    email: "info@example.com",
    email_event_toggles: {},
  }),
}));

// Mock renderEmailForEvent
jest.mock("@/lib/email/render-email", () => ({
  renderEmailForEvent: jest.fn().mockResolvedValue({
    html: "<html>test</html>",
    plainText: "test",
    subject: "Test Subject",
  }),
}));

// Mock fetch for N8N webhook calls
const mockFetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({}),
});
global.fetch = mockFetch;

// Set env
process.env.N8N_EMAIL_WEBHOOK_URL = "https://n8n.example.com/webhook/email";
process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3000";

// --- Imports (after mocks) ---
import {
  queueEmailEvent,
  processQueue,
  cleanupSentEvents,
} from "@/lib/email/queue";
import { getSettings } from "@/lib/settings";
import { renderEmailForEvent } from "@/lib/email/render-email";

// --- Helpers ---

const MOCK_PAYLOAD: EmailEventPayload = {
  eventType: "neue_anfrage",
  anfrageId: "550e8400-e29b-41d4-a716-446655440000",
  anfrageNummer: "ANF-2026-001",
  status: "neu",
  kunde: {
    vorname: "Max",
    nachname: "Mustermann",
    email: "max@example.com",
  },
  produkte: [{ produkttyp: "Fenster PVC", stueckzahl: 2, einzelpreis: 15000 }],
  gesamtbetragCents: 30000,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: "queue-entry-1" });
  mockFind.mockResolvedValue({ docs: [] });
  mockUpdate.mockResolvedValue({});
  mockDelete.mockResolvedValue({});
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
  });

  // Reset getSettings mock
  (getSettings as jest.Mock).mockResolvedValue({
    ...MOCK_SETTINGS,
    benachrichtigungs_emails: "admin@example.com, staff@example.com",
    email_reply_to: "reply@example.com",
    email: "info@example.com",
    email_event_toggles: {},
  });

  // Reset renderEmailForEvent mock
  (renderEmailForEvent as jest.Mock).mockResolvedValue({
    html: "<html>test</html>",
    plainText: "test",
    subject: "Test Subject",
  });
});

// =============================================================================
// queueEmailEvent tests
// =============================================================================

describe("queueEmailEvent", () => {
  it("creates queue entries for each recipient in EVENT_MATRIX", async () => {
    // neue_anfrage has empfaenger: ['kunde', 'staff']
    await queueEmailEvent(MOCK_PAYLOAD);

    // Should create entries for: 1 kunde (max@example.com) + 2 staff (admin@, staff@)
    expect(mockCreate).toHaveBeenCalledTimes(3);

    // Check kunde entry
    const kundeCall = mockCreate.mock.calls.find(
      (call: unknown[]) =>
        (call[0] as { data: { to: string } }).data.to === "max@example.com",
    );
    expect(kundeCall).toBeDefined();
    expect((kundeCall![0] as { collection: string }).collection).toBe(
      "email_queue",
    );
    expect((kundeCall![0] as { data: { status: string } }).data.status).toBe(
      "pending",
    );

    // Check staff entries
    const staffCalls = mockCreate.mock.calls.filter(
      (call: unknown[]) =>
        (call[0] as { data: { to: string } }).data.to === "admin@example.com" ||
        (call[0] as { data: { to: string } }).data.to === "staff@example.com",
    );
    expect(staffCalls).toHaveLength(2);
  });

  it("skips recipient when event toggle is disabled", async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...MOCK_SETTINGS,
      benachrichtigungs_emails: "admin@example.com",
      email_reply_to: "reply@example.com",
      email: "info@example.com",
      email_event_toggles: { neue_anfrage_kunde: false },
    });

    await queueEmailEvent(MOCK_PAYLOAD);

    // Should only create staff entry, not kunde
    const allTos = mockCreate.mock.calls.map(
      (call: unknown[]) => (call[0] as { data: { to: string } }).data.to,
    );
    expect(allTos).not.toContain("max@example.com");
    expect(allTos).toContain("admin@example.com");
  });

  it("creates entry with status='skipped' for invalid email format", async () => {
    const invalidPayload: EmailEventPayload = {
      ...MOCK_PAYLOAD,
      kunde: { vorname: "Max", nachname: "Test", email: "not-an-email" },
    };

    // in_bearbeitung has empfaenger: ['kunde'] only
    invalidPayload.eventType = "in_bearbeitung";

    await queueEmailEvent(invalidPayload);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callData = (
      mockCreate.mock.calls[0][0] as {
        data: { status: string; error_log: string };
      }
    ).data;
    expect(callData.status).toBe("skipped");
    expect(callData.error_log).toContain("Ung");
  });

  it("generates idempotency_key matching expected format", async () => {
    // Use event with single kunde recipient for simplicity
    const payload: EmailEventPayload = {
      ...MOCK_PAYLOAD,
      eventType: "in_bearbeitung",
    };

    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    await queueEmailEvent(payload);

    const callData = (
      mockCreate.mock.calls[0][0] as { data: { idempotency_key: string } }
    ).data;
    expect(callData.idempotency_key).toContain(MOCK_PAYLOAD.anfrageId);
    expect(callData.idempotency_key).toContain("in_bearbeitung");
    expect(callData.idempotency_key).toContain(String(now));

    jest.restoreAllMocks();
  });

  it("renders HTML at queue-time (html field is non-empty)", async () => {
    const payload: EmailEventPayload = {
      ...MOCK_PAYLOAD,
      eventType: "in_bearbeitung",
    };

    await queueEmailEvent(payload);

    expect(renderEmailForEvent).toHaveBeenCalled();
    const callData = (mockCreate.mock.calls[0][0] as { data: { html: string } })
      .data;
    expect(callData.html).toBe("<html>test</html>");
    expect(callData.html.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// processQueue tests
// =============================================================================

describe("processQueue", () => {
  it("sets status='processing' then 'sent' on successful N8N POST", async () => {
    const mockEntry = {
      id: "entry-1",
      to: "test@example.com",
      subject: "Test",
      html: "<html>test</html>",
      plain_text: "test",
      reply_to: "reply@example.com",
      status: "pending",
      attempts: 0,
      max_attempts: 5,
    };
    mockFind.mockResolvedValueOnce({ docs: [mockEntry] });

    await processQueue();

    // First update: processing
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "email_queue",
        id: "entry-1",
        data: expect.objectContaining({ status: "processing" }),
      }),
    );

    // Second update: sent
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "email_queue",
        id: "entry-1",
        data: expect.objectContaining({ status: "sent" }),
      }),
    );

    // Verify N8N POST
    expect(mockFetch).toHaveBeenCalledWith(
      "https://n8n.example.com/webhook/email",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: expect.any(String),
      }),
    );
  });

  it("sets status='failed' with next_retry_at when N8N POST fails", async () => {
    const mockEntry = {
      id: "entry-2",
      to: "test@example.com",
      subject: "Test",
      html: "<html>test</html>",
      plain_text: "test",
      reply_to: "reply@example.com",
      status: "pending",
      attempts: 0,
      max_attempts: 5,
    };
    mockFind.mockResolvedValueOnce({ docs: [mockEntry] });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await processQueue();

    // Should update to failed
    const failedUpdate = mockUpdate.mock.calls.find(
      (call: unknown[]) =>
        (call[0] as { data: { status: string } }).data.status === "failed",
    );
    expect(failedUpdate).toBeDefined();
    const data = (
      failedUpdate![0] as { data: { attempts: number; next_retry_at: string } }
    ).data;
    expect(data.attempts).toBe(1);
    expect(data.next_retry_at).toBeDefined();
  });

  it("applies exponential backoff: attempt 1 -> 1min, 2 -> 2min, 3 -> 4min, 4 -> 8min, 5 -> dead", async () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    // Test attempts 1 through 4 (each should be failed with increasing delay)
    for (const { attemptsBefore, expectedDelayMs } of [
      { attemptsBefore: 0, expectedDelayMs: 1 * 60_000 }, // 2^0 = 1 min
      { attemptsBefore: 1, expectedDelayMs: 2 * 60_000 }, // 2^1 = 2 min
      { attemptsBefore: 2, expectedDelayMs: 4 * 60_000 }, // 2^2 = 4 min
      { attemptsBefore: 3, expectedDelayMs: 8 * 60_000 }, // 2^3 = 8 min
    ]) {
      mockUpdate.mockClear();
      mockFind.mockResolvedValueOnce({
        docs: [
          {
            id: `entry-backoff-${attemptsBefore}`,
            to: "test@example.com",
            subject: "Test",
            html: "<html>test</html>",
            plain_text: "test",
            reply_to: "reply@example.com",
            status: attemptsBefore === 0 ? "pending" : "failed",
            attempts: attemptsBefore,
            max_attempts: 5,
          },
        ],
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Error",
      });

      await processQueue();

      const failedUpdate = mockUpdate.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as { data: { status: string } }).data.status === "failed",
      );
      expect(failedUpdate).toBeDefined();
      const data = (failedUpdate![0] as { data: { next_retry_at: string } })
        .data;
      const expectedTime = new Date(now + expectedDelayMs).toISOString();
      expect(data.next_retry_at).toBe(expectedTime);
    }

    // Test attempt 5 -> dead
    mockUpdate.mockClear();
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          id: "entry-backoff-dead",
          to: "test@example.com",
          subject: "Test",
          html: "<html>test</html>",
          plain_text: "test",
          reply_to: "reply@example.com",
          status: "failed",
          attempts: 4,
          max_attempts: 5,
        },
      ],
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Error",
    });

    await processQueue();

    const deadUpdate = mockUpdate.mock.calls.find(
      (call: unknown[]) =>
        (call[0] as { data: { status: string } }).data.status === "dead",
    );
    expect(deadUpdate).toBeDefined();

    jest.restoreAllMocks();
  });

  it("does NOT pick up entries where next_retry_at is in the future", async () => {
    // This tests the query itself: processQueue should query with next_retry_at <= now
    await processQueue();

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "email_queue",
        where: expect.objectContaining({
          or: expect.arrayContaining([
            expect.objectContaining({ status: { equals: "pending" } }),
            expect.objectContaining({
              and: expect.arrayContaining([
                expect.objectContaining({ status: { equals: "failed" } }),
                expect.objectContaining({
                  next_retry_at: { less_than_equal: expect.any(String) },
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });
});

// =============================================================================
// cleanupSentEvents tests
// =============================================================================

describe("cleanupSentEvents", () => {
  it("deletes entries with status='sent' older than 30 days", async () => {
    const oldEntry = { id: "old-sent-1" };
    mockFind.mockResolvedValueOnce({ docs: [oldEntry] });

    await cleanupSentEvents(30);

    // Verify the find query
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "email_queue",
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({ status: { equals: "sent" } }),
            expect.objectContaining({
              createdAt: { less_than: expect.any(String) },
            }),
          ]),
        }),
      }),
    );

    // Verify deletion
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "email_queue",
        id: "old-sent-1",
      }),
    );
  });
});
