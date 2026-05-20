import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ProgressStepper,
  ProgressStepperMini,
} from "@/components/kunden/progress-stepper";

describe("ProgressStepper", () => {
  test("renders 5 phases as list items", () => {
    render(<ProgressStepper currentPhase="Zahlung" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });

  test("marks completed phases with erledigt label", () => {
    render(<ProgressStepper currentPhase="Zahlung" />);
    // Anfrage (index 0) and Angebot (index 1) are completed when Zahlung (index 2) is active
    expect(screen.getByLabelText("Anfrage - erledigt")).toBeInTheDocument();
    expect(screen.getByLabelText("Angebot - erledigt")).toBeInTheDocument();
  });

  test("marks active phase with aktuell label", () => {
    render(<ProgressStepper currentPhase="Produktion" />);
    expect(screen.getByLabelText("Produktion - aktuell")).toBeInTheDocument();
  });

  test("marks upcoming phases with ausstehend label", () => {
    render(<ProgressStepper currentPhase="Anfrage" />);
    const ausstehend = [
      screen.getByLabelText("Angebot - ausstehend"),
      screen.getByLabelText("Zahlung - ausstehend"),
      screen.getByLabelText("Produktion - ausstehend"),
      screen.getByLabelText("Lieferung - ausstehend"),
    ];
    expect(ausstehend).toHaveLength(4);
  });

  test("returns null when currentPhase is null", () => {
    const { container } = render(<ProgressStepper currentPhase={null} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders first phase (Anfrage) with no completed steps", () => {
    render(<ProgressStepper currentPhase="Anfrage" />);
    // 0 erledigt, 1 aktuell, 4 ausstehend
    expect(screen.getByLabelText("Anfrage - aktuell")).toBeInTheDocument();
    expect(screen.getByLabelText("Angebot - ausstehend")).toBeInTheDocument();
    expect(screen.getByLabelText("Zahlung - ausstehend")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Produktion - ausstehend"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Lieferung - ausstehend")).toBeInTheDocument();
    // No erledigt labels should exist
    expect(screen.queryByLabelText(/erledigt/)).toBeNull();
  });

  test("renders last phase (Lieferung) with all previous completed", () => {
    render(<ProgressStepper currentPhase="Lieferung" />);
    // 4 erledigt, 1 aktuell, 0 ausstehend
    expect(screen.getByLabelText("Anfrage - erledigt")).toBeInTheDocument();
    expect(screen.getByLabelText("Angebot - erledigt")).toBeInTheDocument();
    expect(screen.getByLabelText("Zahlung - erledigt")).toBeInTheDocument();
    expect(screen.getByLabelText("Produktion - erledigt")).toBeInTheDocument();
    expect(screen.getByLabelText("Lieferung - aktuell")).toBeInTheDocument();
    expect(screen.queryByLabelText(/ausstehend/)).toBeNull();
  });

  test("active step has aria-current=step", () => {
    render(<ProgressStepper currentPhase="Angebot" />);
    const activeItem = screen
      .getByLabelText("Angebot - aktuell")
      .closest('[aria-current="step"]');
    expect(activeItem).not.toBeNull();
  });

  test("renders phase labels as text", () => {
    render(<ProgressStepper currentPhase="Zahlung" />);
    expect(screen.getByText("Anfrage")).toBeInTheDocument();
    expect(screen.getByText("Angebot")).toBeInTheDocument();
    expect(screen.getByText("Zahlung")).toBeInTheDocument();
    expect(screen.getByText("Produktion")).toBeInTheDocument();
    expect(screen.getByText("Lieferung")).toBeInTheDocument();
  });
});

describe("ProgressStepperMini", () => {
  test("renders 5 dots with aria-label on container", () => {
    const { container } = render(
      <ProgressStepperMini currentPhase="Angebot" />,
    );
    const wrapper = container.querySelector(
      '[aria-label="Fortschritt: Angebot"]',
    );
    expect(wrapper).not.toBeNull();
    // 5 dots all aria-hidden
    const dots = wrapper!.querySelectorAll('[aria-hidden="true"]');
    expect(dots).toHaveLength(5);
  });

  test("returns null for null phase", () => {
    const { container } = render(<ProgressStepperMini currentPhase={null} />);
    expect(container.innerHTML).toBe("");
  });
});
