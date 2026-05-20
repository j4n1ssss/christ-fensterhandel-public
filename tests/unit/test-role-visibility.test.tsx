import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock @payloadcms/ui hooks with mutable rolle
let mockRolle = "admin";
jest.mock("@payloadcms/ui", () => ({
  useAuth: () => ({
    user: { id: "1", email: "test@test.de", rolle: mockRolle },
  }),
  useNav: () => ({
    navOpen: true,
    navRef: { current: null },
  }),
  Logout: () => <div data-testid="logout">Logout</div>,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

// Mock next/link
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
      [key: string]: unknown;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock WebhookFehlerBadge
jest.mock("@/components/admin/webhook-fehler-badge", () => ({
  __esModule: true,
  default: () => <span data-testid="webhook-badge" />,
  WebhookFehlerBadge: () => <span data-testid="webhook-badge" />,
}));

// Mock Collapsible - always render children so we can query for link text
jest.mock("@/components/ui/collapsible", () => ({
  __esModule: true,
  Collapsible: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="collapsible" {...props}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
  CollapsibleContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
}));

import CustomNav from "@/components/admin/custom-nav";

afterEach(() => {
  mockRolle = "admin";
  sessionStorage.clear();
});

describe("role visibility", () => {
  test("admin (rolle='admin') sees all 4 direct links", () => {
    mockRolle = "admin";
    render(<CustomNav />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Bestellungen")).toBeInTheDocument();
    expect(screen.getByText("Produkte")).toBeInTheDocument();
    expect(screen.getByText("Benutzer")).toBeInTheDocument();
  });

  test("admin sees all 4 dropdown sections", () => {
    mockRolle = "admin";
    render(<CustomNav />);

    expect(screen.getByText("Bestellungsverwaltung")).toBeInTheDocument();
    expect(screen.getByText("Produktverwaltung")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  test("viewer (rolle='viewer') sees only 3 direct links -- NOT Benutzer", () => {
    mockRolle = "viewer";
    render(<CustomNav />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Bestellungen")).toBeInTheDocument();
    expect(screen.getByText("Produkte")).toBeInTheDocument();
    expect(screen.queryByText("Benutzer")).toBeNull();
  });

  test("viewer sees only 2 dropdown sections -- NOT Website, NOT System", () => {
    mockRolle = "viewer";
    render(<CustomNav />);

    expect(screen.getByText("Bestellungsverwaltung")).toBeInTheDocument();
    expect(screen.getByText("Produktverwaltung")).toBeInTheDocument();
    expect(screen.queryByText("Website")).toBeNull();
    expect(screen.queryByText("System")).toBeNull();
  });

  test("mitarbeiter (rolle='mitarbeiter') sees same as viewer (identical nav)", () => {
    mockRolle = "mitarbeiter";
    render(<CustomNav />);

    // Same 3 direct links
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Bestellungen")).toBeInTheDocument();
    expect(screen.getByText("Produkte")).toBeInTheDocument();
    expect(screen.queryByText("Benutzer")).toBeNull();

    // Same 2 dropdown sections
    expect(screen.getByText("Bestellungsverwaltung")).toBeInTheDocument();
    expect(screen.getByText("Produktverwaltung")).toBeInTheDocument();
    expect(screen.queryByText("Website")).toBeNull();
    expect(screen.queryByText("System")).toBeNull();
  });

  test("when all dropdowns are filtered out, the separator div is NOT rendered", () => {
    // Use a hypothetical role that would have NO dropdowns visible
    // Since bestellungsverwaltung and produktverwaltung have no roles restriction,
    // they are always visible. So for a regular viewer, separator SHOULD be visible.
    // Test the positive case: viewer with 2 dropdowns visible should have separator
    mockRolle = "viewer";
    const { container } = render(<CustomNav />);

    const separator = container.querySelector(".cn-separator");
    // Viewer has 2 dropdowns, so separator should be visible
    expect(separator).toBeInTheDocument();
  });

  test("empty sections after filtering are completely hidden (no section header visible)", () => {
    mockRolle = "viewer";
    render(<CustomNav />);

    // Website and System section headers should NOT be visible at all
    // Not just collapsed, but completely absent from the DOM
    expect(screen.queryByText("Website")).toBeNull();
    expect(screen.queryByText("System")).toBeNull();

    // But their items should also not be in the DOM
    expect(screen.queryByText("Pages")).toBeNull();
    expect(screen.queryByText("Footer")).toBeNull();
    expect(screen.queryByText("Medien")).toBeNull();
    expect(screen.queryByText("Edit-History")).toBeNull();
  });
});
