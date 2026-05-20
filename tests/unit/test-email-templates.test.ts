/**
 * Email template rendering tests.
 *
 * Verifies all 11 templates (9 customer + 2 staff) render valid HTML + plain text.
 * Uses renderEmailForEvent orchestrator with mock data.
 */

import { renderEmailForEvent, TEMPLATE_SLUGS } from "@/lib/email/render-email";
import {
  MOCK_SETTINGS,
  MOCK_ANFRAGE,
  getMockDataForTemplate,
} from "@/lib/email/mock-data";
import type { EmailEventPayload, Recipient } from "@/lib/email/types";

// Mock process.env for consistent test URLs
beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3000";
});

const CUSTOMER_TEMPLATE_SLUGS = [
  "anfrage-bestaetigung",
  "status-update",
  "angebot-versendet",
  "zahlungslink",
  "zahlung-bestaetigung",
  "stornierung",
  "rueckfrage",
  "reklamation",
  "rueckerstattung",
];

const STAFF_TEMPLATE_SLUGS = ["neue-anfrage", "status-benachrichtigung"];

const ALL_TEMPLATE_SLUGS = [
  ...CUSTOMER_TEMPLATE_SLUGS,
  ...STAFF_TEMPLATE_SLUGS,
];

describe("TEMPLATE_SLUGS registry", () => {
  it("has exactly 11 entries", () => {
    expect(TEMPLATE_SLUGS).toHaveLength(11);
  });

  it("contains all expected slugs", () => {
    for (const slug of ALL_TEMPLATE_SLUGS) {
      expect(TEMPLATE_SLUGS).toContain(slug);
    }
  });
});

describe("renderEmailForEvent", () => {
  const mockPayload: EmailEventPayload = {
    eventType: "neue_anfrage",
    anfrageId: MOCK_ANFRAGE.anfrageId,
    anfrageNummer: MOCK_ANFRAGE.anfrageNummer,
    status: MOCK_ANFRAGE.status,
    kunde: MOCK_ANFRAGE.kunde,
    produkte: MOCK_ANFRAGE.produkte.map((p) => ({
      produkttyp: p.name,
      stueckzahl: p.stueckzahl,
      einzelpreis: p.einzelpreis,
    })),
    gesamtbetragCents: MOCK_ANFRAGE.gesamtbetragCents,
  };

  it("anfrage-bestaetigung renders valid HTML with subject", async () => {
    const result = await renderEmailForEvent(
      "anfrage-bestaetigung",
      mockPayload,
      "kunde",
      MOCK_SETTINGS,
    );
    expect(result.html).toBeTruthy();
    expect(result.html).toContain("<!DOCTYPE");
    expect(result.html).toContain("Anfrage");
    expect(result.plainText).toBeTruthy();
    expect(result.subject).toBeTruthy();
  });

  it("status-update renders HTML containing status text", async () => {
    const statusPayload: EmailEventPayload = {
      ...mockPayload,
      eventType: "in_bearbeitung",
      status: "in_bearbeitung",
    };
    const result = await renderEmailForEvent(
      "status-update",
      statusPayload,
      "kunde",
      MOCK_SETTINGS,
    );
    expect(result.html).toBeTruthy();
    expect(result.html).toContain("Status");
  });

  describe("customer templates", () => {
    it.each(CUSTOMER_TEMPLATE_SLUGS)(
      "%s renders non-empty HTML with DOCTYPE",
      async (slug) => {
        const mockData = getMockDataForTemplate(slug);
        const eventPayload: EmailEventPayload = {
          ...mockPayload,
          ...((mockData._eventOverrides as Partial<EmailEventPayload>) || {}),
        };
        const recipient: Recipient = "kunde";

        const result = await renderEmailForEvent(
          slug,
          eventPayload,
          recipient,
          MOCK_SETTINGS,
        );

        expect(result.html).toBeTruthy();
        expect(result.html.length).toBeGreaterThan(100);
        expect(result.html).toContain("<!DOCTYPE");
        expect(result.plainText).toBeTruthy();
      },
    );
  });

  describe("staff templates", () => {
    it("neue-anfrage renders non-empty HTML with DOCTYPE", async () => {
      const result = await renderEmailForEvent(
        "neue-anfrage",
        mockPayload,
        "staff",
        MOCK_SETTINGS,
      );

      expect(result.html).toBeTruthy();
      expect(result.html.length).toBeGreaterThan(100);
      expect(result.html).toContain("<!DOCTYPE");
      expect(result.plainText).toBeTruthy();
    });

    it("status-benachrichtigung renders non-empty HTML with DOCTYPE", async () => {
      const statusPayload: EmailEventPayload = {
        ...mockPayload,
        eventType: "bestaetigt",
        status: "bestaetigt",
        statusAlt: "angebot_versendet",
      };
      const result = await renderEmailForEvent(
        "status-benachrichtigung",
        statusPayload,
        "staff",
        MOCK_SETTINGS,
      );

      expect(result.html).toBeTruthy();
      expect(result.html.length).toBeGreaterThan(100);
      expect(result.html).toContain("<!DOCTYPE");
      expect(result.plainText).toBeTruthy();
    });
  });

  it("BaseLayout footer contains firmenname from settings", async () => {
    const result = await renderEmailForEvent(
      "anfrage-bestaetigung",
      mockPayload,
      "kunde",
      MOCK_SETTINGS,
    );
    expect(result.html).toContain("Christ Fensterhandel");
  });

  it("throws error for unknown template slug", async () => {
    await expect(
      renderEmailForEvent(
        "unknown-template",
        mockPayload,
        "kunde",
        MOCK_SETTINGS,
      ),
    ).rejects.toThrow("Unknown template");
  });
});
