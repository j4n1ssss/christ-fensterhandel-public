import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusBanner } from "@/components/kunden/status-banner";

describe("StatusBanner", () => {
  test("renders error banner for storniert with role=alert", () => {
    render(<StatusBanner status="storniert" />);
    const banner = screen.getByRole("alert");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-red-50");
  });

  test("renders error banner for abgelehnt with role=alert", () => {
    render(<StatusBanner status="abgelehnt" />);
    const banner = screen.getByRole("alert");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-red-50");
  });

  test("renders warning banner for rueckfrage with appended text", () => {
    render(<StatusBanner status="rueckfrage" />);
    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-orange-50");
    expect(banner.textContent).toContain(
      "Bitte pruefen Sie den Status-Verlauf fuer Details",
    );
  });

  test("renders warning banner for hersteller_problem", () => {
    render(<StatusBanner status="hersteller_problem" />);
    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-orange-50");
  });

  test("renders error banner for zahlungsproblem", () => {
    render(<StatusBanner status="zahlungsproblem" />);
    // zahlungsproblem is in ERROR_STATUSES, so isError = true
    // Not terminal, so role="status"
    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-red-50");
  });

  test("renders warning banner for reklamation", () => {
    render(<StatusBanner status="reklamation" />);
    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("bg-orange-50");
  });

  test("returns null for normal status neu", () => {
    const { container } = render(<StatusBanner status="neu" />);
    expect(container.innerHTML).toBe("");
  });

  test("returns null for normal status in_bearbeitung", () => {
    const { container } = render(<StatusBanner status="in_bearbeitung" />);
    expect(container.innerHTML).toBe("");
  });

  test("returns null for normal status bezahlt", () => {
    const { container } = render(<StatusBanner status="bezahlt" />);
    expect(container.innerHTML).toBe("");
  });

  test("uses STATUS_CUSTOMER_TEXT for banner text", () => {
    render(<StatusBanner status="storniert" />);
    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain("Ihre Bestellung wurde storniert");
  });
});
