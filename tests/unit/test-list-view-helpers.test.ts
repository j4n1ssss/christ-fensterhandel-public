import {
  getAttentionScore,
  getScoreColor,
  formatRelativeTime,
  getSmartDefaultTab,
  getLetzeAktion,
} from "@/lib/list-view-helpers";

describe("list-view-helpers", () => {
  describe("getAttentionScore", () => {
    it("returns 0 for terminal status (weight 0)", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
      expect(
        getAttentionScore(threeDaysAgo, threeDaysAgo, "abgeschlossen"),
      ).toBe(0);
    });

    it("returns 0 for terminal status storniert (weight 0)", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(getAttentionScore(fiveDaysAgo, fiveDaysAgo, "storniert")).toBe(0);
    });

    it("returns days * 3 for weight-3 status (neu)", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(getAttentionScore(fiveDaysAgo, fiveDaysAgo, "neu")).toBe(15);
    });

    it("returns days * 2 for weight-2 status (angebot_versendet)", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(
        getAttentionScore(fiveDaysAgo, fiveDaysAgo, "angebot_versendet"),
      ).toBe(10);
    });

    it("returns days * 1 for weight-1 status (bezahlt)", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(getAttentionScore(fiveDaysAgo, fiveDaysAgo, "bezahlt")).toBe(5);
    });

    it("uses lastStatusChangeAt when provided", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
      const tenDaysAgo = new Date(Date.now() - 10 * 86_400_000).toISOString();
      // lastStatusChangeAt = 2 days ago, createdAt = 10 days ago
      // Should use lastStatusChangeAt (2 days * weight 3 = 6)
      expect(getAttentionScore(twoDaysAgo, tenDaysAgo, "neu")).toBe(6);
    });

    it("falls back to createdAt when lastStatusChangeAt is null", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(getAttentionScore(null, fiveDaysAgo, "neu")).toBe(15);
    });

    it("returns 0 for unknown status (fallback weight 0)", () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000).toISOString();
      expect(
        getAttentionScore(fiveDaysAgo, fiveDaysAgo, "unknown_status"),
      ).toBe(0);
    });
  });

  describe("getScoreColor", () => {
    it('returns "" for score 0', () => {
      expect(getScoreColor(0)).toBe("");
    });

    it('returns "" for negative score', () => {
      expect(getScoreColor(-5)).toBe("");
    });

    it("returns green #22c55e for score 1", () => {
      expect(getScoreColor(1)).toBe("#22c55e");
    });

    it("returns green #22c55e for score 5", () => {
      expect(getScoreColor(5)).toBe("#22c55e");
    });

    it("returns yellow #eab308 for score 6", () => {
      expect(getScoreColor(6)).toBe("#eab308");
    });

    it("returns yellow #eab308 for score 15", () => {
      expect(getScoreColor(15)).toBe("#eab308");
    });

    it("returns orange #f97316 for score 16", () => {
      expect(getScoreColor(16)).toBe("#f97316");
    });

    it("returns orange #f97316 for score 30", () => {
      expect(getScoreColor(30)).toBe("#f97316");
    });

    it("returns red #ef4444 for score 31", () => {
      expect(getScoreColor(31)).toBe("#ef4444");
    });

    it("returns red #ef4444 for score 100", () => {
      expect(getScoreColor(100)).toBe("#ef4444");
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-03-25T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "gerade eben" for less than 1 minute ago', () => {
      const thirtySecondsAgo = new Date("2026-03-25T11:59:45Z").toISOString();
      expect(formatRelativeTime(thirtySecondsAgo)).toBe("gerade eben");
    });

    it('returns "vor X Min." for less than 60 minutes', () => {
      const tenMinutesAgo = new Date("2026-03-25T11:50:00Z").toISOString();
      expect(formatRelativeTime(tenMinutesAgo)).toBe("vor 10 Min.");
    });

    it('returns "vor 1 Min." for exactly 1 minute ago', () => {
      const oneMinuteAgo = new Date("2026-03-25T11:59:00Z").toISOString();
      expect(formatRelativeTime(oneMinuteAgo)).toBe("vor 1 Min.");
    });

    it('returns "vor Xh" for less than 24 hours', () => {
      const fiveHoursAgo = new Date("2026-03-25T07:00:00Z").toISOString();
      expect(formatRelativeTime(fiveHoursAgo)).toBe("vor 5h");
    });

    it('returns "vor 1h" for exactly 1 hour ago', () => {
      const oneHourAgo = new Date("2026-03-25T11:00:00Z").toISOString();
      expect(formatRelativeTime(oneHourAgo)).toBe("vor 1h");
    });

    it('returns "vor 1 Tag" for exactly 1 day ago', () => {
      const oneDayAgo = new Date("2026-03-24T12:00:00Z").toISOString();
      expect(formatRelativeTime(oneDayAgo)).toBe("vor 1 Tag");
    });

    it('returns "vor X Tagen" for more than 1 day', () => {
      const threeDaysAgo = new Date("2026-03-22T12:00:00Z").toISOString();
      expect(formatRelativeTime(threeDaysAgo)).toBe("vor 3 Tagen");
    });
  });

  describe("getSmartDefaultTab", () => {
    it('returns "rueckfrage" when tabCounts.rueckfrage > 0', () => {
      expect(
        getSmartDefaultTab({
          alle: 10,
          offen: 5,
          rueckfrage: 2,
          in_produktion: 0,
          abgeschlossen: 3,
        }),
      ).toBe("rueckfrage");
    });

    it('returns "offen" when tabCounts.offen > 0 and rueckfrage is 0', () => {
      expect(
        getSmartDefaultTab({
          alle: 10,
          offen: 5,
          rueckfrage: 0,
          in_produktion: 0,
          abgeschlossen: 5,
        }),
      ).toBe("offen");
    });

    it('returns "alle" when both offen and rueckfrage are 0', () => {
      expect(
        getSmartDefaultTab({
          alle: 5,
          offen: 0,
          rueckfrage: 0,
          in_produktion: 2,
          abgeschlossen: 3,
        }),
      ).toBe("alle");
    });

    it('returns "rueckfrage" even if offen also > 0 (priority)', () => {
      expect(
        getSmartDefaultTab({
          alle: 20,
          offen: 10,
          rueckfrage: 3,
          in_produktion: 4,
          abgeschlossen: 3,
        }),
      ).toBe("rueckfrage");
    });

    it('returns "alle" when tabCounts is empty object', () => {
      expect(getSmartDefaultTab({})).toBe("alle");
    });
  });

  describe("getLetzeAktion", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-03-25T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns label + relative time for known status", () => {
      const twoHoursAgo = new Date("2026-03-25T10:00:00Z").toISOString();
      expect(getLetzeAktion("neu", twoHoursAgo)).toBe("Neu vor 2h");
    });

    it("returns label only when lastStatusChangeAt is null", () => {
      expect(getLetzeAktion("bezahlt", null)).toBe("Bezahlt");
    });

    it("returns raw status key for unknown status with null date", () => {
      expect(getLetzeAktion("unknown_status", null)).toBe("unknown_status");
    });

    it("returns label + relative time for rueckfrage", () => {
      const oneDayAgo = new Date("2026-03-24T12:00:00Z").toISOString();
      expect(getLetzeAktion("rueckfrage", oneDayAgo)).toBe(
        "R\u00fcckfrage vor 1 Tag",
      );
    });
  });
});
