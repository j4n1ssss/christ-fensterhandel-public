import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock @payloadcms/ui hooks
jest.mock("@payloadcms/ui", () => ({
  useAuth: () => ({
    user: { id: "1", email: "admin@test.de", rolle: "admin" },
  }),
  useNav: () => ({
    navOpen: true,
    navRef: { current: null },
  }),
  Logout: () => <div data-testid="logout">Logout</div>,
}));

// Mock next/navigation with configurable pathname
let mockPathname = "/admin";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
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

// Mock Collapsible with open prop check to verify which sections are open
jest.mock("@/components/ui/collapsible", () => ({
  __esModule: true,
  Collapsible: ({
    children,
    open,
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="collapsible"
      data-open={open ? "true" : "false"}
      {...props}
    >
      {open ? children : null}
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

beforeEach(() => {
  mockPathname = "/admin";
  sessionStorage.clear();
});

describe("session persistence", () => {
  test("on first load with no sessionStorage, active section is opened via URL logic", () => {
    mockPathname = "/admin/collections/anfragen";
    const { container } = render(<CustomNav />);

    const collapsibles = container.querySelectorAll(
      '[data-testid="collapsible"]',
    );
    // Find the bestellungsverwaltung collapsible (should be open because URL matches)
    const openCollapsibles = container.querySelectorAll('[data-open="true"]');
    expect(openCollapsibles.length).toBeGreaterThanOrEqual(1);

    // Verify sessionStorage was not pre-populated
    // but after render it should have been written
    const stored = sessionStorage.getItem("admin-nav-sections");
    expect(stored).not.toBeNull();
  });

  test("on mount with existing sessionStorage, state is restored from storage", () => {
    // Pre-populate sessionStorage with specific state
    sessionStorage.setItem(
      "admin-nav-sections",
      JSON.stringify({
        bestellungsverwaltung: true,
        produktverwaltung: false,
        website: false,
        system: false,
      }),
    );

    mockPathname = "/admin";
    const { container } = render(<CustomNav />);

    const collapsibles = container.querySelectorAll(
      '[data-testid="collapsible"]',
    );
    // First collapsible (bestellungsverwaltung) should be open
    expect(collapsibles[0]).toHaveAttribute("data-open", "true");
    // Second collapsible (produktverwaltung) should be closed
    expect(collapsibles[1]).toHaveAttribute("data-open", "false");
  });

  test("after toggleSection, sessionStorage is updated with new state", () => {
    mockPathname = "/admin/collections/anfragen";
    const { container } = render(<CustomNav />);

    // After initial render, sessionStorage should contain the state
    const stored = sessionStorage.getItem("admin-nav-sections");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    // bestellungsverwaltung should be true (URL-based active detection)
    expect(parsed.bestellungsverwaltung).toBe(true);
  });

  test("on pathname change (SPA nav), active section is ADDITIVELY opened", () => {
    // Start with bestellungsverwaltung open via sessionStorage
    sessionStorage.setItem(
      "admin-nav-sections",
      JSON.stringify({
        bestellungsverwaltung: true,
        produktverwaltung: false,
        website: false,
        system: false,
      }),
    );

    // Navigate to a system page
    mockPathname = "/admin/collections/media";
    const { container } = render(<CustomNav />);

    // After SPA navigation, system should be additively opened
    // AND bestellungsverwaltung should remain open
    const stored = sessionStorage.getItem("admin-nav-sections");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.bestellungsverwaltung).toBe(true);
    expect(parsed.system).toBe(true);
  });

  test("corrupt sessionStorage data falls back to URL logic (no crash)", () => {
    // Set corrupt data
    sessionStorage.setItem("admin-nav-sections", "NOT_VALID_JSON{{{");

    mockPathname = "/admin/collections/anfragen";

    // Should NOT throw
    expect(() => {
      render(<CustomNav />);
    }).not.toThrow();

    // After render, sessionStorage should have been overwritten with valid state
    const stored = sessionStorage.getItem("admin-nav-sections");
    expect(stored).not.toBeNull();
    // Should be valid JSON now
    expect(() => JSON.parse(stored!)).not.toThrow();
  });
});
