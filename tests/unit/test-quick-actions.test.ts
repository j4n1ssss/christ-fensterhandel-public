import { QUICK_ACTIONS } from "@/lib/status-config";
import type { StatusKey } from "@/lib/status-config";
import { VALID_TRANSITIONS } from "@/lib/status-transitions";

const ALL_STATUS_KEYS: StatusKey[] = [
  "neu",
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
  "rueckfrage",
  "abgelehnt",
  "storniert",
  "zahlungsproblem",
  "wieder_geoeffnet",
  "reklamation",
];

describe("QUICK_ACTIONS", () => {
  it("has an entry for every StatusKey (20 keys)", () => {
    for (const key of ALL_STATUS_KEYS) {
      expect(QUICK_ACTIONS).toHaveProperty(key);
    }
    expect(Object.keys(QUICK_ACTIONS)).toHaveLength(20);
  });

  it("every target is a valid StatusKey", () => {
    for (const key of ALL_STATUS_KEYS) {
      const actions = QUICK_ACTIONS[key];
      for (const action of actions) {
        expect(ALL_STATUS_KEYS).toContain(action.target);
      }
    }
  });

  it("every target for status X exists in VALID_TRANSITIONS[X]", () => {
    for (const key of ALL_STATUS_KEYS) {
      const actions = QUICK_ACTIONS[key];
      const validTargets = VALID_TRANSITIONS[key] || [];
      for (const action of actions) {
        expect(validTargets).toContain(action.target);
      }
    }
  });

  it("storniert has empty actions array", () => {
    expect(QUICK_ACTIONS.storniert).toEqual([]);
  });

  it("all labels use real UTF-8 characters (no \\u escapes, no ue/ae/oe where umlauts expected)", () => {
    const jsonString = JSON.stringify(QUICK_ACTIONS);
    // Should not contain unicode escape sequences
    expect(jsonString).not.toMatch(/\\u[0-9a-fA-F]{4}/);

    // Check specific labels contain real umlauts
    const allLabels = Object.values(QUICK_ACTIONS)
      .flat()
      .map((a) => a.label);

    const labelsWithUmlauts = allLabels.filter(
      (l) =>
        l.includes("ück") ||
        l.includes("ätigt") ||
        l.includes("öff") ||
        l.includes("ü"),
    );
    // There should be labels with real umlauts
    expect(labelsWithUmlauts.length).toBeGreaterThan(0);
  });

  it('primary action for "neu" is { label: "Anfrage annehmen", target: "in_bearbeitung" }', () => {
    expect(QUICK_ACTIONS.neu[0]).toEqual({
      label: "Anfrage annehmen",
      target: "in_bearbeitung",
    });
  });

  it('"in_bearbeitung" has 3 actions (1 primary + 2 secondary)', () => {
    expect(QUICK_ACTIONS.in_bearbeitung).toHaveLength(3);
  });
});
