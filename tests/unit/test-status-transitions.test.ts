import {
  VALID_TRANSITIONS,
  COMMENT_REQUIRED,
  isValidTransition,
  getNextStatuses,
} from "@/lib/status-transitions";

describe("VALID_TRANSITIONS", () => {
  it("defines transitions for all 24 statuses", () => {
    const allStatuses = [
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
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
    }
    expect(Object.keys(VALID_TRANSITIONS)).toHaveLength(24);
  });

  it("has no dead-end statuses except terminal ones (storniert, rueckerstattung_abgeschlossen)", () => {
    const terminalStatuses = ["storniert", "rueckerstattung_abgeschlossen"];
    for (const [status, transitions] of Object.entries(VALID_TRANSITIONS)) {
      if (terminalStatuses.includes(status)) {
        expect(transitions).toEqual([]);
      } else {
        expect(transitions.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("COMMENT_REQUIRED", () => {
  it("has exactly 5 entries", () => {
    expect(COMMENT_REQUIRED).toHaveLength(5);
  });

  it("requires comment for rueckfrage", () => {
    expect(COMMENT_REQUIRED).toContain("rueckfrage");
  });

  it("requires comment for abgelehnt", () => {
    expect(COMMENT_REQUIRED).toContain("abgelehnt");
  });

  it("requires comment for hersteller_problem", () => {
    expect(COMMENT_REQUIRED).toContain("hersteller_problem");
  });

  it("requires comment for reklamation", () => {
    expect(COMMENT_REQUIRED).toContain("reklamation");
  });

  it("requires comment for wieder_geoeffnet", () => {
    expect(COMMENT_REQUIRED).toContain("wieder_geoeffnet");
  });

  it("does not require comment for storniert (uses stornierung_grund instead)", () => {
    expect(COMMENT_REQUIRED).not.toContain("storniert");
  });

  it("does not require comment for other statuses", () => {
    expect(COMMENT_REQUIRED).not.toContain("neu");
    expect(COMMENT_REQUIRED).not.toContain("in_bearbeitung");
    expect(COMMENT_REQUIRED).not.toContain("bestaetigt");
    expect(COMMENT_REQUIRED).not.toContain("bezahlt");
    expect(COMMENT_REQUIRED).not.toContain("abgeschlossen");
  });
});

describe("isValidTransition", () => {
  // Linear main flow
  it("allows neu -> in_bearbeitung", () => {
    expect(isValidTransition("neu", "in_bearbeitung")).toBe(true);
  });

  it("allows in_bearbeitung -> angebot_versendet", () => {
    expect(isValidTransition("in_bearbeitung", "angebot_versendet")).toBe(true);
  });

  it("allows angebot_versendet -> bestaetigt", () => {
    expect(isValidTransition("angebot_versendet", "bestaetigt")).toBe(true);
  });

  it("allows angebot_versendet -> zahlungslink_versendet (Kunden-Annahme)", () => {
    expect(
      isValidTransition("angebot_versendet", "zahlungslink_versendet"),
    ).toBe(true);
  });

  it("allows bestaetigt -> zahlungslink_versendet", () => {
    expect(isValidTransition("bestaetigt", "zahlungslink_versendet")).toBe(
      true,
    );
  });

  it("allows zahlungslink_versendet -> bezahlt", () => {
    expect(isValidTransition("zahlungslink_versendet", "bezahlt")).toBe(true);
  });

  it("allows bezahlt -> an_hersteller", () => {
    expect(isValidTransition("bezahlt", "an_hersteller")).toBe(true);
  });

  it("allows an_hersteller -> hersteller_bestaetigt", () => {
    expect(isValidTransition("an_hersteller", "hersteller_bestaetigt")).toBe(
      true,
    );
  });

  it("allows hersteller_bestaetigt -> in_produktion", () => {
    expect(isValidTransition("hersteller_bestaetigt", "in_produktion")).toBe(
      true,
    );
  });

  it("allows in_produktion -> versandbereit", () => {
    expect(isValidTransition("in_produktion", "versandbereit")).toBe(true);
  });

  it("allows versandbereit -> geliefert", () => {
    expect(isValidTransition("versandbereit", "geliefert")).toBe(true);
  });

  it("allows geliefert -> abgeschlossen", () => {
    expect(isValidTransition("geliefert", "abgeschlossen")).toBe(true);
  });

  // Branch transitions from main flow
  it("allows in_bearbeitung -> rueckfrage", () => {
    expect(isValidTransition("in_bearbeitung", "rueckfrage")).toBe(true);
  });

  it("allows in_bearbeitung -> abgelehnt", () => {
    expect(isValidTransition("in_bearbeitung", "abgelehnt")).toBe(true);
  });

  it("allows angebot_versendet -> rueckfrage", () => {
    expect(isValidTransition("angebot_versendet", "rueckfrage")).toBe(true);
  });

  it("allows bezahlt -> storniert", () => {
    expect(isValidTransition("bezahlt", "storniert")).toBe(true);
  });

  it("allows bezahlt -> zahlungsproblem", () => {
    expect(isValidTransition("bezahlt", "zahlungsproblem")).toBe(true);
  });

  it("allows an_hersteller -> hersteller_problem", () => {
    expect(isValidTransition("an_hersteller", "hersteller_problem")).toBe(true);
  });

  it("allows an_hersteller -> hersteller_bestaetigt_mit_vorbehalt", () => {
    expect(
      isValidTransition("an_hersteller", "hersteller_bestaetigt_mit_vorbehalt"),
    ).toBe(true);
  });

  it("allows hersteller_bestaetigt_mit_vorbehalt -> in_produktion", () => {
    expect(
      isValidTransition("hersteller_bestaetigt_mit_vorbehalt", "in_produktion"),
    ).toBe(true);
  });

  it("allows hersteller_bestaetigt_mit_vorbehalt -> storniert", () => {
    expect(
      isValidTransition("hersteller_bestaetigt_mit_vorbehalt", "storniert"),
    ).toBe(true);
  });

  it("allows geliefert -> reklamation", () => {
    expect(isValidTransition("geliefert", "reklamation")).toBe(true);
  });

  it("allows abgeschlossen -> wieder_geoeffnet", () => {
    expect(isValidTransition("abgeschlossen", "wieder_geoeffnet")).toBe(true);
  });

  // Return transitions
  it("allows rueckfrage -> in_bearbeitung", () => {
    expect(isValidTransition("rueckfrage", "in_bearbeitung")).toBe(true);
  });

  it("allows abgelehnt -> neu (admin reopen)", () => {
    expect(isValidTransition("abgelehnt", "neu")).toBe(true);
  });

  it("allows wieder_geoeffnet -> in_bearbeitung", () => {
    expect(isValidTransition("wieder_geoeffnet", "in_bearbeitung")).toBe(true);
  });

  it("allows hersteller_problem -> in_bearbeitung", () => {
    expect(isValidTransition("hersteller_problem", "in_bearbeitung")).toBe(
      true,
    );
  });

  it("allows hersteller_problem -> storniert", () => {
    expect(isValidTransition("hersteller_problem", "storniert")).toBe(true);
  });

  it("allows zahlungsproblem -> bezahlt", () => {
    expect(isValidTransition("zahlungsproblem", "bezahlt")).toBe(true);
  });

  it("allows zahlungsproblem -> storniert", () => {
    expect(isValidTransition("zahlungsproblem", "storniert")).toBe(true);
  });

  it("allows reklamation -> in_bearbeitung", () => {
    expect(isValidTransition("reklamation", "in_bearbeitung")).toBe(true);
  });

  it("allows reklamation -> abgeschlossen", () => {
    expect(isValidTransition("reklamation", "abgeschlossen")).toBe(true);
  });

  // Terminal status: storniert has no outgoing transitions
  it("disallows storniert -> neu (terminal status)", () => {
    expect(isValidTransition("storniert", "neu")).toBe(false);
  });

  it("disallows storniert -> in_bearbeitung (terminal status)", () => {
    expect(isValidTransition("storniert", "in_bearbeitung")).toBe(false);
  });

  // Removed transitions (no longer valid in 20-status flow)
  it("disallows bezahlt -> abgeschlossen (now goes through production chain)", () => {
    expect(isValidTransition("bezahlt", "abgeschlossen")).toBe(false);
  });

  it("disallows abgeschlossen -> in_bearbeitung (now goes through wieder_geoeffnet)", () => {
    expect(isValidTransition("abgeschlossen", "in_bearbeitung")).toBe(false);
  });

  it("disallows in_bearbeitung -> bestaetigt (now goes through angebot_versendet)", () => {
    expect(isValidTransition("in_bearbeitung", "bestaetigt")).toBe(false);
  });

  it("disallows bestaetigt -> bezahlt (now goes through zahlungslink_versendet)", () => {
    expect(isValidTransition("bestaetigt", "bezahlt")).toBe(false);
  });

  // General invalid transitions
  it("disallows neu -> abgeschlossen (skip states)", () => {
    expect(isValidTransition("neu", "abgeschlossen")).toBe(false);
  });

  it("disallows neu -> bezahlt (skip states)", () => {
    expect(isValidTransition("neu", "bezahlt")).toBe(false);
  });

  it("disallows bestaetigt -> neu (backwards)", () => {
    expect(isValidTransition("bestaetigt", "neu")).toBe(false);
  });

  it("disallows same status transition", () => {
    expect(isValidTransition("neu", "neu")).toBe(false);
  });

  it("disallows bezahlt -> bestaetigt (backwards)", () => {
    expect(isValidTransition("bezahlt", "bestaetigt")).toBe(false);
  });

  // Phase 29: kundenantwort transitions
  it("allows rueckfrage -> kundenantwort transition", () => {
    expect(isValidTransition("rueckfrage", "kundenantwort")).toBe(true);
  });

  it("allows kundenantwort -> in_bearbeitung transition", () => {
    expect(isValidTransition("kundenantwort", "in_bearbeitung")).toBe(true);
  });

  it("allows kundenantwort -> rueckfrage transition", () => {
    expect(isValidTransition("kundenantwort", "rueckfrage")).toBe(true);
  });

  // Phase 29: stornierung_beantragt transitions
  it("allows stornierung_beantragt -> storniert transition", () => {
    expect(isValidTransition("stornierung_beantragt", "storniert")).toBe(true);
  });

  it("allows stornierung_beantragt -> in_bearbeitung transition", () => {
    expect(isValidTransition("stornierung_beantragt", "in_bearbeitung")).toBe(
      true,
    );
  });

  it("allows in_bearbeitung -> stornierung_beantragt transition", () => {
    expect(isValidTransition("in_bearbeitung", "stornierung_beantragt")).toBe(
      true,
    );
  });

  // Excluded statuses should NOT transition to stornierung_beantragt
  it("does not allow storniert -> stornierung_beantragt", () => {
    expect(isValidTransition("storniert", "stornierung_beantragt")).toBe(false);
  });

  it("does not allow abgelehnt -> stornierung_beantragt", () => {
    expect(isValidTransition("abgelehnt", "stornierung_beantragt")).toBe(false);
  });

  it("does not allow abgeschlossen -> stornierung_beantragt", () => {
    expect(isValidTransition("abgeschlossen", "stornierung_beantragt")).toBe(
      false,
    );
  });

  it("does not allow geliefert -> stornierung_beantragt", () => {
    expect(isValidTransition("geliefert", "stornierung_beantragt")).toBe(false);
  });
});

describe("getNextStatuses", () => {
  it("returns valid next statuses for neu", () => {
    const next = getNextStatuses("neu");
    expect(next).toContain("in_bearbeitung");
    expect(next).toContain("stornierung_beantragt");
    expect(next).toHaveLength(2);
  });

  it("returns valid next statuses for in_bearbeitung", () => {
    const next = getNextStatuses("in_bearbeitung");
    expect(next).toContain("angebot_versendet");
    expect(next).toContain("rueckfrage");
    expect(next).toContain("abgelehnt");
    expect(next).toContain("stornierung_beantragt");
    expect(next).not.toContain("bestaetigt");
  });

  it("returns valid next statuses for bezahlt", () => {
    const next = getNextStatuses("bezahlt");
    expect(next).toContain("an_hersteller");
    expect(next).toContain("storniert");
    expect(next).toContain("zahlungsproblem");
    expect(next).toContain("rueckerstattung_ausstehend");
    expect(next).toContain("stornierung_beantragt");
    expect(next).toHaveLength(5);
  });

  it("returns valid next statuses for abgeschlossen", () => {
    const next = getNextStatuses("abgeschlossen");
    expect(next).toContain("wieder_geoeffnet");
    expect(next).toContain("rueckerstattung_ausstehend");
    expect(next).toHaveLength(2);
  });

  it("returns empty array for storniert (terminal)", () => {
    expect(getNextStatuses("storniert")).toEqual([]);
  });

  it("returns empty array for unknown status", () => {
    expect(getNextStatuses("unknown_status")).toEqual([]);
  });
});
