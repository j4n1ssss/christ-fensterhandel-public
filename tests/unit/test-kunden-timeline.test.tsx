import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  StatusTimeline,
  StatusBadge,
} from "@/components/kunden/status-timeline";
import { STATUS_CUSTOMER_TEXT } from "@/lib/status-config";
import type { StatusHistorie } from "@/payload-types";

function makeEntry(
  overrides: Partial<StatusHistorie> & {
    von_status: string;
    zu_status: string;
  },
): StatusHistorie {
  return {
    id: overrides.id ?? "1",
    anfrage: overrides.anfrage ?? "a1",
    von_status: overrides.von_status,
    zu_status: overrides.zu_status,
    zeitpunkt: overrides.zeitpunkt ?? "2026-03-26T10:00:00Z",
    kommentar: overrides.kommentar ?? null,
    updatedAt: overrides.updatedAt ?? "2026-03-26T10:00:00Z",
    createdAt: overrides.createdAt ?? "2026-03-26T10:00:00Z",
  };
}

describe("StatusTimeline", () => {
  test("timeline badge shows customer text instead of internal label", () => {
    const entries = [
      makeEntry({ von_status: "neu", zu_status: "in_bearbeitung" }),
    ];
    render(<StatusTimeline entries={entries} />);
    expect(
      screen.getByText("Ihre Anfrage wird gerade von unserem Team bearbeitet."),
    ).toBeInTheDocument();
  });

  test("timeline does not show internal status label", () => {
    const entries = [
      makeEntry({ von_status: "neu", zu_status: "in_bearbeitung" }),
    ];
    render(<StatusTimeline entries={entries} />);
    // "In Bearbeitung" is the internal admin label -- should NOT appear
    expect(screen.queryByText("In Bearbeitung")).not.toBeInTheDocument();
  });

  test("timeline transition shows customer text for both statuses", () => {
    const entries = [
      makeEntry({ von_status: "neu", zu_status: "in_bearbeitung" }),
    ];
    render(<StatusTimeline entries={entries} />);
    // The transition <p> contains both "von" and "zu" customer texts joined by arrow
    const transitionP = screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        (element?.textContent?.includes(STATUS_CUSTOMER_TEXT.neu) ?? false) &&
        (element?.textContent?.includes(STATUS_CUSTOMER_TEXT.in_bearbeitung) ??
          false),
    );
    expect(transitionP).toBeInTheDocument();
  });

  test("empty timeline shows fallback message", () => {
    render(<StatusTimeline entries={[]} />);
    expect(
      screen.getByText("Noch keine Status-Änderungen vorhanden."),
    ).toBeInTheDocument();
  });

  test("timeline handles unknown status gracefully", () => {
    const entries = [
      makeEntry({ von_status: "neu", zu_status: "unknown_status" }),
    ];
    render(<StatusTimeline entries={entries} />);
    // The ?? fallback should render the raw key
    expect(screen.getByText("unknown_status")).toBeInTheDocument();
  });

  test("timeline renders kommentar when present", () => {
    const entries = [
      makeEntry({
        von_status: "neu",
        zu_status: "rueckfrage",
        kommentar: "Bitte Masse pruefen",
      }),
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Bitte Masse pruefen")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  test("shows customer text for bezahlt", () => {
    render(<StatusBadge status="bezahlt" />);
    expect(
      screen.getByText("Danke, Ihre Zahlung ist bei uns eingegangen."),
    ).toBeInTheDocument();
  });

  test("does not show internal label for bezahlt", () => {
    render(<StatusBadge status="bezahlt" />);
    // "Bezahlt" is the internal admin label
    expect(screen.queryByText("Bezahlt")).not.toBeInTheDocument();
  });
});
