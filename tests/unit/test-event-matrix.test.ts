import { EVENT_MATRIX, getEventConfig } from "@/lib/email/event-matrix";
import type { EmailEventType, EventConfig } from "@/lib/email/types";

/**
 * All 23 EmailEventType values (20 business + 2 payment + 1 utility slot).
 */
const ALL_EVENT_TYPES: EmailEventType[] = [
  "neue_anfrage",
  "in_bearbeitung",
  "angebot_versendet",
  "bestaetigt",
  "zahlungslink_versendet",
  "bezahlt",
  "an_hersteller",
  "hersteller_bestaetigt",
  "hersteller_bestaetigt_mit_vorbehalt",
  "in_produktion",
  "hersteller_problem",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
  "storniert",
  "rueckfrage",
  "zahlungsproblem",
  "reklamation",
  "kundenantwort",
  "stornierung_beantragt",
  "rueckerstattung",
  "zahlung_dispute",
  "test_preview",
];

describe("EVENT_MATRIX", () => {
  test("has entries for all 23 EmailEventType values", () => {
    const matrixKeys = Object.keys(EVENT_MATRIX);
    expect(matrixKeys).toHaveLength(23);
    for (const eventType of ALL_EVENT_TYPES) {
      expect(EVENT_MATRIX[eventType]).toBeDefined();
    }
  });

  test.each(ALL_EVENT_TYPES)(
    "%s has valid empfaenger, templates, betreff, and enabled_default",
    (eventType) => {
      const config = EVENT_MATRIX[eventType];
      expect(Array.isArray(config.empfaenger)).toBe(true);
      expect(config.empfaenger.length).toBeGreaterThan(0);
      // Every empfaenger must be 'kunde' or 'staff'
      for (const r of config.empfaenger) {
        expect(["kunde", "staff"]).toContain(r);
      }
      // Must have at least one template slug
      const templateKeys = Object.keys(config.templates);
      expect(templateKeys.length).toBeGreaterThan(0);
      for (const slug of Object.values(config.templates)) {
        expect(typeof slug).toBe("string");
        expect(slug!.length).toBeGreaterThan(0);
      }
      // Must have at least one betreff
      const betreffKeys = Object.keys(config.betreff);
      expect(betreffKeys.length).toBeGreaterThan(0);
      for (const b of Object.values(config.betreff)) {
        expect(typeof b).toBe("string");
        expect(b!.length).toBeGreaterThan(0);
      }
      // enabled_default must be boolean
      expect(typeof config.enabled_default).toBe("boolean");
    },
  );

  test("neue_anfrage maps to empfaenger ['kunde', 'staff'] with correct templates", () => {
    const config = EVENT_MATRIX["neue_anfrage"];
    expect(config.empfaenger).toEqual(["kunde", "staff"]);
    expect(config.templates.kunde).toBe("anfrage-bestaetigung");
    expect(config.templates.staff).toBe("neue-anfrage");
  });

  test("storniert maps to empfaenger ['kunde', 'staff'] with correct templates", () => {
    const config = EVENT_MATRIX["storniert"];
    expect(config.empfaenger).toContain("kunde");
    expect(config.empfaenger).toContain("staff");
    expect(config.templates.kunde).toBe("stornierung");
  });

  test("has stornierung_beantragt event config with staff recipient", () => {
    const config = EVENT_MATRIX["stornierung_beantragt"];
    expect(config).toBeDefined();
    expect(config.empfaenger).toEqual(["staff"]);
    expect(config.templates.staff).toBe("status-benachrichtigung");
    expect(config.betreff.staff).toContain("Stornierungsanfrage");
    expect(config.enabled_default).toBe(true);
  });

  test("kundenantwort exists as future slot with enabled_default: true", () => {
    const config = EVENT_MATRIX["kundenantwort"];
    expect(config).toBeDefined();
    expect(config.enabled_default).toBe(true);
  });

  test("test_preview exists as utility slot with enabled_default: true", () => {
    const config = EVENT_MATRIX["test_preview"];
    expect(config).toBeDefined();
    expect(config.enabled_default).toBe(true);
  });

  test("all events have enabled_default: true", () => {
    for (const eventType of ALL_EVENT_TYPES) {
      expect(EVENT_MATRIX[eventType].enabled_default).toBe(true);
    }
  });
});

describe("getEventConfig", () => {
  test("returns EventConfig for valid event type", () => {
    const config = getEventConfig("neue_anfrage");
    expect(config).toBeDefined();
    expect(config!.empfaenger).toEqual(["kunde", "staff"]);
  });

  test("returns undefined for unknown event type", () => {
    const config = getEventConfig("nonexistent" as EmailEventType);
    expect(config).toBeUndefined();
  });
});
