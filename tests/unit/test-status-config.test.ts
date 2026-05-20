import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_TAILWIND,
  STATUS_CUSTOMER_TEXT,
  STATUS_CUSTOMER_PHASE,
  STATUS_GROUP,
  EMAIL_TRIGGER_STATUSES,
  STATUS_WEIGHT,
  LIST_TAB_FILTERS,
  getStatusColor,
  getStatusLabel,
  isCustomerFacing,
} from "@/lib/status-config";
import type {
  StatusKey,
  StatusGroup,
  CustomerPhase,
} from "@/lib/status-config";

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
  "rueckerstattung_ausstehend",
  "rueckerstattung_abgeschlossen",
  "kundenantwort",
  "stornierung_beantragt",
];

describe("status-config", () => {
  describe("STATUS_COLORS (hex)", () => {
    it("has exactly 24 keys", () => {
      expect(Object.keys(STATUS_COLORS)).toHaveLength(24);
    });

    it("has all 24 status keys", () => {
      for (const key of ALL_STATUS_KEYS) {
        expect(STATUS_COLORS).toHaveProperty(key);
      }
    });

    // Existing statuses (with updated colors for neu and in_bearbeitung)
    it("maps neu to #f59e0b (amber)", () => {
      expect(STATUS_COLORS.neu).toBe("#f59e0b");
    });

    it("maps in_bearbeitung to #3b82f6 (blue)", () => {
      expect(STATUS_COLORS.in_bearbeitung).toBe("#3b82f6");
    });

    it("maps bestaetigt to #22c55e (green)", () => {
      expect(STATUS_COLORS.bestaetigt).toBe("#22c55e");
    });

    it("maps bezahlt to #10b981 (emerald)", () => {
      expect(STATUS_COLORS.bezahlt).toBe("#10b981");
    });

    it("maps abgeschlossen to #6b7280 (gray)", () => {
      expect(STATUS_COLORS.abgeschlossen).toBe("#6b7280");
    });

    it("maps rueckfrage to #f97316 (orange)", () => {
      expect(STATUS_COLORS.rueckfrage).toBe("#f97316");
    });

    it("maps abgelehnt to #ef4444 (red)", () => {
      expect(STATUS_COLORS.abgelehnt).toBe("#ef4444");
    });

    // New statuses
    it("maps angebot_versendet to #3b82f6 (blue)", () => {
      expect(STATUS_COLORS.angebot_versendet).toBe("#3b82f6");
    });

    it("maps zahlungslink_versendet to #10b981 (emerald)", () => {
      expect(STATUS_COLORS.zahlungslink_versendet).toBe("#10b981");
    });

    it("maps an_hersteller to #8b5cf6 (violet)", () => {
      expect(STATUS_COLORS.an_hersteller).toBe("#8b5cf6");
    });

    it("maps hersteller_bestaetigt to #8b5cf6 (violet)", () => {
      expect(STATUS_COLORS.hersteller_bestaetigt).toBe("#8b5cf6");
    });

    it("maps hersteller_bestaetigt_mit_vorbehalt to #f59e0b (amber)", () => {
      expect(STATUS_COLORS.hersteller_bestaetigt_mit_vorbehalt).toBe("#f59e0b");
    });

    it("maps in_produktion to #8b5cf6 (violet)", () => {
      expect(STATUS_COLORS.in_produktion).toBe("#8b5cf6");
    });

    it("maps hersteller_problem to #ef4444 (red)", () => {
      expect(STATUS_COLORS.hersteller_problem).toBe("#ef4444");
    });

    it("maps versandbereit to #06b6d4 (cyan)", () => {
      expect(STATUS_COLORS.versandbereit).toBe("#06b6d4");
    });

    it("maps geliefert to #06b6d4 (cyan)", () => {
      expect(STATUS_COLORS.geliefert).toBe("#06b6d4");
    });

    it("maps storniert to #ef4444 (red)", () => {
      expect(STATUS_COLORS.storniert).toBe("#ef4444");
    });

    it("maps zahlungsproblem to #ef4444 (red)", () => {
      expect(STATUS_COLORS.zahlungsproblem).toBe("#ef4444");
    });

    it("maps wieder_geoeffnet to #6b7280 (gray)", () => {
      expect(STATUS_COLORS.wieder_geoeffnet).toBe("#6b7280");
    });

    it("maps reklamation to #ef4444 (red)", () => {
      expect(STATUS_COLORS.reklamation).toBe("#ef4444");
    });

    it("maps kundenantwort to #06b6d4 (cyan)", () => {
      expect(STATUS_COLORS.kundenantwort).toBe("#06b6d4");
    });

    it("maps stornierung_beantragt to #f59e0b (amber)", () => {
      expect(STATUS_COLORS.stornierung_beantragt).toBe("#f59e0b");
    });
  });

  describe("STATUS_LABELS", () => {
    it("has exactly 24 keys", () => {
      expect(Object.keys(STATUS_LABELS)).toHaveLength(24);
    });

    // Existing labels (with real UTF-8 umlauts)
    it("maps bestaetigt to real umlaut Bestätigt", () => {
      expect(STATUS_LABELS.bestaetigt).toBe("Bestätigt");
    });

    it("maps rueckfrage to real umlaut Rückfrage", () => {
      expect(STATUS_LABELS.rueckfrage).toBe("Rückfrage");
    });

    it("has existing status keys with correct labels", () => {
      expect(STATUS_LABELS.neu).toBe("Neu");
      expect(STATUS_LABELS.in_bearbeitung).toBe("In Bearbeitung");
      expect(STATUS_LABELS.bezahlt).toBe("Bezahlt");
      expect(STATUS_LABELS.abgeschlossen).toBe("Abgeschlossen");
      expect(STATUS_LABELS.abgelehnt).toBe("Abgelehnt");
    });

    // New labels
    it("maps angebot_versendet to Angebot versendet", () => {
      expect(STATUS_LABELS.angebot_versendet).toBe("Angebot versendet");
    });

    it("maps zahlungslink_versendet to Zahlungslink versendet", () => {
      expect(STATUS_LABELS.zahlungslink_versendet).toBe(
        "Zahlungslink versendet",
      );
    });

    it("maps an_hersteller to An Hersteller", () => {
      expect(STATUS_LABELS.an_hersteller).toBe("An Hersteller");
    });

    it("maps hersteller_bestaetigt to Hersteller bestätigt", () => {
      expect(STATUS_LABELS.hersteller_bestaetigt).toBe("Hersteller bestätigt");
    });

    it("maps hersteller_bestaetigt_mit_vorbehalt to Bestätigt mit Vorbehalt", () => {
      expect(STATUS_LABELS.hersteller_bestaetigt_mit_vorbehalt).toBe(
        "Bestätigt mit Vorbehalt",
      );
    });

    it("maps in_produktion to In Produktion", () => {
      expect(STATUS_LABELS.in_produktion).toBe("In Produktion");
    });

    it("maps hersteller_problem to Hersteller-Problem", () => {
      expect(STATUS_LABELS.hersteller_problem).toBe("Hersteller-Problem");
    });

    it("maps versandbereit to Versandbereit", () => {
      expect(STATUS_LABELS.versandbereit).toBe("Versandbereit");
    });

    it("maps geliefert to Geliefert", () => {
      expect(STATUS_LABELS.geliefert).toBe("Geliefert");
    });

    it("maps storniert to Storniert", () => {
      expect(STATUS_LABELS.storniert).toBe("Storniert");
    });

    it("maps zahlungsproblem to Zahlungsproblem", () => {
      expect(STATUS_LABELS.zahlungsproblem).toBe("Zahlungsproblem");
    });

    it("maps wieder_geoeffnet to Wieder geöffnet", () => {
      expect(STATUS_LABELS.wieder_geoeffnet).toBe("Wieder geöffnet");
    });

    it("maps reklamation to Reklamation", () => {
      expect(STATUS_LABELS.reklamation).toBe("Reklamation");
    });

    it("maps kundenantwort to Kundenantwort", () => {
      expect(STATUS_LABELS.kundenantwort).toBe("Kundenantwort");
    });

    it("maps stornierung_beantragt to Stornierung beantragt", () => {
      expect(STATUS_LABELS.stornierung_beantragt).toBe("Stornierung beantragt");
    });
  });

  describe("STATUS_TAILWIND", () => {
    it("has exactly 24 keys", () => {
      expect(Object.keys(STATUS_TAILWIND)).toHaveLength(24);
    });

    it("has all 24 keys with { bg, text, dot } shape", () => {
      for (const key of ALL_STATUS_KEYS) {
        const entry = STATUS_TAILWIND[key];
        expect(entry).toHaveProperty("bg");
        expect(entry).toHaveProperty("text");
        expect(entry).toHaveProperty("dot");
        expect(typeof entry.bg).toBe("string");
        expect(typeof entry.text).toBe("string");
        expect(typeof entry.dot).toBe("string");
      }
    });

    it("maps neu to amber Tailwind classes (changed from blue)", () => {
      expect(STATUS_TAILWIND.neu).toEqual({
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
      });
    });

    it("maps in_bearbeitung to blue Tailwind classes (changed from amber)", () => {
      expect(STATUS_TAILWIND.in_bearbeitung).toEqual({
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
      });
    });

    it("maps an_hersteller to violet Tailwind classes", () => {
      expect(STATUS_TAILWIND.an_hersteller).toEqual({
        bg: "bg-violet-50",
        text: "text-violet-700",
        dot: "bg-violet-500",
      });
    });

    it("maps storniert to red Tailwind classes", () => {
      expect(STATUS_TAILWIND.storniert).toEqual({
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
      });
    });

    it("maps versandbereit to cyan Tailwind classes", () => {
      expect(STATUS_TAILWIND.versandbereit).toEqual({
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        dot: "bg-cyan-500",
      });
    });

    it("maps kundenantwort to cyan Tailwind classes", () => {
      expect(STATUS_TAILWIND.kundenantwort).toEqual({
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        dot: "bg-cyan-500",
      });
    });

    it("maps stornierung_beantragt to amber Tailwind classes", () => {
      expect(STATUS_TAILWIND.stornierung_beantragt).toEqual({
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
      });
    });
  });

  describe("STATUS_CUSTOMER_TEXT", () => {
    it("has exactly 24 keys", () => {
      expect(Object.keys(STATUS_CUSTOMER_TEXT)).toHaveLength(24);
    });

    it("maps neu to correct warm Siezen text", () => {
      expect(STATUS_CUSTOMER_TEXT.neu).toBe(
        "Wir haben Ihre Anfrage erhalten und pr\u00fcfen sie sorgf\u00e4ltig.",
      );
    });

    it("has all 24 keys with non-empty strings", () => {
      for (const key of ALL_STATUS_KEYS) {
        expect(typeof STATUS_CUSTOMER_TEXT[key]).toBe("string");
        expect(STATUS_CUSTOMER_TEXT[key].length).toBeGreaterThan(0);
      }
    });

    it("uses em-dash in bestaetigt text", () => {
      expect(STATUS_CUSTOMER_TEXT.bestaetigt).toContain("\u2014");
    });

    it("angebot_versendet contains Angebot ist bereit", () => {
      expect(STATUS_CUSTOMER_TEXT.angebot_versendet).toContain(
        "Angebot ist bereit",
      );
    });

    it("storniert contains storniert", () => {
      expect(STATUS_CUSTOMER_TEXT.storniert).toContain("storniert");
    });
  });

  describe("STATUS_CUSTOMER_PHASE", () => {
    it("maps neu to Anfrage", () => {
      expect(STATUS_CUSTOMER_PHASE.neu).toBe("Anfrage");
    });

    it("maps in_bearbeitung to Anfrage", () => {
      expect(STATUS_CUSTOMER_PHASE.in_bearbeitung).toBe("Anfrage");
    });

    it("maps bestaetigt to Angebot", () => {
      expect(STATUS_CUSTOMER_PHASE.bestaetigt).toBe("Angebot");
    });

    it("maps bezahlt to Zahlung", () => {
      expect(STATUS_CUSTOMER_PHASE.bezahlt).toBe("Zahlung");
    });

    it("maps abgeschlossen to Lieferung", () => {
      expect(STATUS_CUSTOMER_PHASE.abgeschlossen).toBe("Lieferung");
    });

    it("maps rueckfrage to Anfrage", () => {
      expect(STATUS_CUSTOMER_PHASE.rueckfrage).toBe("Anfrage");
    });

    it("maps abgelehnt to null", () => {
      expect(STATUS_CUSTOMER_PHASE.abgelehnt).toBeNull();
    });

    // New status phase mappings
    it("maps angebot_versendet to Angebot", () => {
      expect(STATUS_CUSTOMER_PHASE.angebot_versendet).toBe("Angebot");
    });

    it("maps zahlungslink_versendet to Zahlung", () => {
      expect(STATUS_CUSTOMER_PHASE.zahlungslink_versendet).toBe("Zahlung");
    });

    it("maps an_hersteller to Produktion", () => {
      expect(STATUS_CUSTOMER_PHASE.an_hersteller).toBe("Produktion");
    });

    it("maps storniert to null", () => {
      expect(STATUS_CUSTOMER_PHASE.storniert).toBeNull();
    });

    it("maps zahlungsproblem to Zahlung", () => {
      expect(STATUS_CUSTOMER_PHASE.zahlungsproblem).toBe("Zahlung");
    });

    it("maps reklamation to Lieferung", () => {
      expect(STATUS_CUSTOMER_PHASE.reklamation).toBe("Lieferung");
    });

    it("maps wieder_geoeffnet to Anfrage", () => {
      expect(STATUS_CUSTOMER_PHASE.wieder_geoeffnet).toBe("Anfrage");
    });

    it("maps kundenantwort to Anfrage", () => {
      expect(STATUS_CUSTOMER_PHASE.kundenantwort).toBe("Anfrage");
    });

    it("maps stornierung_beantragt to null", () => {
      expect(STATUS_CUSTOMER_PHASE.stornierung_beantragt).toBeNull();
    });
  });

  describe("STATUS_GROUP", () => {
    it("maps neu to offen", () => {
      expect(STATUS_GROUP.neu).toBe("offen");
    });

    it("maps in_bearbeitung to offen", () => {
      expect(STATUS_GROUP.in_bearbeitung).toBe("offen");
    });

    it("maps bestaetigt to zahlung", () => {
      expect(STATUS_GROUP.bestaetigt).toBe("zahlung");
    });

    it("maps bezahlt to zahlung", () => {
      expect(STATUS_GROUP.bezahlt).toBe("zahlung");
    });

    it("maps abgeschlossen to abgeschlossen", () => {
      expect(STATUS_GROUP.abgeschlossen).toBe("abgeschlossen");
    });

    it("maps rueckfrage to offen", () => {
      expect(STATUS_GROUP.rueckfrage).toBe("offen");
    });

    it("maps abgelehnt to abgeschlossen", () => {
      expect(STATUS_GROUP.abgelehnt).toBe("abgeschlossen");
    });

    // New status group mappings
    it("maps angebot_versendet to offen", () => {
      expect(STATUS_GROUP.angebot_versendet).toBe("offen");
    });

    it("maps zahlungslink_versendet to zahlung", () => {
      expect(STATUS_GROUP.zahlungslink_versendet).toBe("zahlung");
    });

    it("maps an_hersteller to produktion", () => {
      expect(STATUS_GROUP.an_hersteller).toBe("produktion");
    });

    it("maps versandbereit to lieferung", () => {
      expect(STATUS_GROUP.versandbereit).toBe("lieferung");
    });

    it("maps storniert to abgeschlossen", () => {
      expect(STATUS_GROUP.storniert).toBe("abgeschlossen");
    });

    it("maps reklamation to offen", () => {
      expect(STATUS_GROUP.reklamation).toBe("offen");
    });

    it("maps wieder_geoeffnet to offen", () => {
      expect(STATUS_GROUP.wieder_geoeffnet).toBe("offen");
    });

    it("maps kundenantwort to offen", () => {
      expect(STATUS_GROUP.kundenantwort).toBe("offen");
    });

    it("maps stornierung_beantragt to offen", () => {
      expect(STATUS_GROUP.stornierung_beantragt).toBe("offen");
    });
  });

  describe("EMAIL_TRIGGER_STATUSES", () => {
    it("has exactly 17 entries", () => {
      expect(EMAIL_TRIGGER_STATUSES).toHaveLength(17);
    });

    it("includes all 14 original customer-facing statuses", () => {
      const expected: StatusKey[] = [
        "neu",
        "rueckfrage",
        "angebot_versendet",
        "bestaetigt",
        "zahlungslink_versendet",
        "bezahlt",
        "hersteller_problem",
        "in_produktion",
        "versandbereit",
        "geliefert",
        "abgeschlossen",
        "storniert",
        "zahlungsproblem",
        "reklamation",
      ];
      for (const key of expected) {
        expect(EMAIL_TRIGGER_STATUSES).toContain(key);
      }
    });

    it("does NOT include in_bearbeitung", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain("in_bearbeitung");
    });

    it("does NOT include an_hersteller", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain("an_hersteller");
    });

    it("does NOT include hersteller_bestaetigt", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain("hersteller_bestaetigt");
    });

    it("does NOT include hersteller_bestaetigt_mit_vorbehalt", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain(
        "hersteller_bestaetigt_mit_vorbehalt",
      );
    });

    it("does NOT include wieder_geoeffnet", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain("wieder_geoeffnet");
    });

    it("does NOT include abgelehnt", () => {
      expect(EMAIL_TRIGGER_STATUSES).not.toContain("abgelehnt");
    });

    it("includes kundenantwort", () => {
      expect(EMAIL_TRIGGER_STATUSES).toContain("kundenantwort");
    });

    it("includes stornierung_beantragt", () => {
      expect(EMAIL_TRIGGER_STATUSES).toContain("stornierung_beantragt");
    });
  });

  describe("getStatusColor", () => {
    it("returns #f59e0b for neu (new amber color)", () => {
      expect(getStatusColor("neu")).toBe("#f59e0b");
    });

    it("returns fallback #6b7280 for unknown status", () => {
      expect(getStatusColor("unknown_status")).toBe("#6b7280");
    });
  });

  describe("getStatusLabel", () => {
    it("returns correct label for known status", () => {
      expect(getStatusLabel("rueckfrage")).toBe("Rückfrage");
    });

    it("returns raw key as fallback for unknown status", () => {
      expect(getStatusLabel("unknown_status")).toBe("unknown_status");
    });
  });

  describe("isCustomerFacing", () => {
    it("returns true for neu", () => {
      expect(isCustomerFacing("neu")).toBe(true);
    });

    it("returns true for storniert", () => {
      expect(isCustomerFacing("storniert")).toBe(true);
    });

    it("returns false for in_bearbeitung", () => {
      expect(isCustomerFacing("in_bearbeitung")).toBe(false);
    });

    it("returns false for abgelehnt (explicitly customer_facing: false)", () => {
      expect(isCustomerFacing("abgelehnt")).toBe(false);
    });

    it("returns false for unknown status", () => {
      expect(isCustomerFacing("unknown_status")).toBe(false);
    });
  });

  describe("Type exports", () => {
    it("StatusKey type exists (compile-time via const assertion)", () => {
      const key: StatusKey = "neu";
      expect(key).toBe("neu");
    });

    it("StatusGroup type exists", () => {
      const group: StatusGroup = "offen";
      expect(group).toBe("offen");
    });

    it("CustomerPhase type exists", () => {
      const phase: CustomerPhase = "Anfrage";
      expect(phase).toBe("Anfrage");
    });
  });

  describe("STATUS_WEIGHT", () => {
    it("has entries for all 24 StatusKeys", () => {
      const statusKeys = Object.keys(STATUS_COLORS);
      for (const key of statusKeys) {
        expect(STATUS_WEIGHT).toHaveProperty(key);
        expect(typeof STATUS_WEIGHT[key as StatusKey]).toBe("number");
      }
      expect(Object.keys(STATUS_WEIGHT)).toHaveLength(24);
    });

    it("assigns correct weight tiers", () => {
      // Tier 3: Admin muss handeln
      expect(STATUS_WEIGHT.neu).toBe(3);
      expect(STATUS_WEIGHT.in_bearbeitung).toBe(3);
      expect(STATUS_WEIGHT.rueckfrage).toBe(3);
      expect(STATUS_WEIGHT.hersteller_problem).toBe(3);
      expect(STATUS_WEIGHT.zahlungsproblem).toBe(3);
      expect(STATUS_WEIGHT.wieder_geoeffnet).toBe(3);
      // Tier 2: Admin sollte pruefen
      expect(STATUS_WEIGHT.angebot_versendet).toBe(2);
      expect(STATUS_WEIGHT.bestaetigt).toBe(2);
      expect(STATUS_WEIGHT.zahlungslink_versendet).toBe(2);
      expect(STATUS_WEIGHT.hersteller_bestaetigt_mit_vorbehalt).toBe(2);
      // Tier 1: Wartet auf Externe
      expect(STATUS_WEIGHT.bezahlt).toBe(1);
      expect(STATUS_WEIGHT.an_hersteller).toBe(1);
      expect(STATUS_WEIGHT.in_produktion).toBe(1);
      // Tier 0: Terminal
      expect(STATUS_WEIGHT.abgeschlossen).toBe(0);
      expect(STATUS_WEIGHT.storniert).toBe(0);
      expect(STATUS_WEIGHT.abgelehnt).toBe(0);
    });

    it("kundenantwort has Attention-Score 3", () => {
      expect(STATUS_WEIGHT.kundenantwort).toBe(3);
    });

    it("stornierung_beantragt has Attention-Score 3", () => {
      expect(STATUS_WEIGHT.stornierung_beantragt).toBe(3);
    });
  });

  describe("LIST_TAB_FILTERS", () => {
    it("has exactly 5 tabs", () => {
      expect(Object.keys(LIST_TAB_FILTERS).sort()).toEqual([
        "abgeschlossen",
        "alle",
        "in_produktion",
        "offen",
        "rueckfrage",
      ]);
    });

    it("alle tab has empty filter array", () => {
      expect(LIST_TAB_FILTERS.alle).toEqual([]);
    });

    it("every StatusKey appears in exactly one non-alle tab", () => {
      const allStatuses = Object.keys(STATUS_COLORS) as StatusKey[];
      const covered = [
        ...LIST_TAB_FILTERS.offen,
        ...LIST_TAB_FILTERS.rueckfrage,
        ...LIST_TAB_FILTERS.in_produktion,
        ...LIST_TAB_FILTERS.abgeschlossen,
      ];
      expect(covered.sort()).toEqual([...allStatuses].sort());
    });
  });
});
