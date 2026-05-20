import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock @payloadcms/ui hooks
jest.mock("@payloadcms/ui", () => ({
  useConfig: () => ({
    config: { routes: { admin: "/admin" } },
  }),
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

// Mock Collapsible to always render children (Radix hides content when closed)
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

describe("direct links", () => {
  test('renders "Dashboard" link with href="/admin"', () => {
    render(<CustomNav />);
    const link = screen.getByText("Dashboard");
    expect(link.closest("a")).toHaveAttribute("href", "/admin");
  });

  test('renders "Bestellungen" link with href="/admin/collections/anfragen"', () => {
    render(<CustomNav />);
    const link = screen.getByText("Bestellungen");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/admin/collections/anfragen",
    );
  });

  test('renders "Produkte" link with href="/admin/collections/profile"', () => {
    render(<CustomNav />);
    const link = screen.getByText("Produkte");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/admin/collections/profile",
    );
  });

  test('renders "Benutzer" link with href="/admin/collections/users"', () => {
    render(<CustomNav />);
    const link = screen.getByText("Benutzer");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/admin/collections/users",
    );
  });
});

describe("bestellungsverwaltung", () => {
  test('renders "Bestellungsverwaltung" section header', () => {
    render(<CustomNav />);
    expect(screen.getByText("Bestellungsverwaltung")).toBeInTheDocument();
  });

  test('renders "Anfragen" and "Status-Historie" as dropdown items', () => {
    render(<CustomNav />);
    expect(screen.getByText("Anfragen")).toBeInTheDocument();
    expect(screen.getByText("Status-Historie")).toBeInTheDocument();
  });
});

describe("produktverwaltung", () => {
  test('renders "Produktverwaltung" section header', () => {
    render(<CustomNav />);
    expect(screen.getByText("Produktverwaltung")).toBeInTheDocument();
  });

  test("renders all 17 collection links", () => {
    render(<CustomNav />);
    const expectedLabels = [
      "Profile",
      "Produkttypen",
      "Materialien",
      "Farben",
      "Dichtungsfarben",
      "Verglasungen",
      "Schallschutz",
      "Sicherheitsglas",
      "Glasdekore",
      "Sprossen",
      "Extras",
      "Fluegelanzahl",
      "Oeffnungsarten",
      "Fensterformen",
      "Zusatzlichter",
      "Preisregeln",
      "Rabattcodes",
    ];
    for (const label of expectedLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe("website", () => {
  test('renders "Website" section header', () => {
    render(<CustomNav />);
    expect(screen.getByText("Website")).toBeInTheDocument();
  });

  test('renders "Pages", "Navigation", "Footer", "Puck Templates" as dropdown items', () => {
    render(<CustomNav />);
    expect(screen.getByText("Pages")).toBeInTheDocument();
    // "Navigation" appears as both a section header label and a dropdown item
    // Use getAllByText to handle multiple instances
    const navigationElements = screen.getAllByText("Navigation");
    expect(navigationElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("Puck Templates")).toBeInTheDocument();
  });
});

describe("system", () => {
  test('renders "System" section header', () => {
    render(<CustomNav />);
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  test('renders "Medien", "Edit-History", "Webhook Fehler" as dropdown items', () => {
    render(<CustomNav />);
    expect(screen.getByText("Medien")).toBeInTheDocument();
    expect(screen.getByText("Edit-History")).toBeInTheDocument();
    expect(screen.getByText("Webhook Fehler")).toBeInTheDocument();
  });
});

describe("subgroup headings", () => {
  test('renders "HAUPTPRODUKTE", "AUSSTATTUNG", "KONFIGURATION", "PREISE" as text', () => {
    render(<CustomNav />);
    expect(screen.getByText("HAUPTPRODUKTE")).toBeInTheDocument();
    expect(screen.getByText("AUSSTATTUNG")).toBeInTheDocument();
    expect(screen.getByText("KONFIGURATION")).toBeInTheDocument();
    expect(screen.getByText("PREISE")).toBeInTheDocument();
  });

  test("subgroup headings are NOT wrapped in <a> tags (not clickable)", () => {
    render(<CustomNav />);
    const headings = [
      "HAUPTPRODUKTE",
      "AUSSTATTUNG",
      "KONFIGURATION",
      "PREISE",
    ];
    for (const heading of headings) {
      const element = screen.getByText(heading);
      expect(element.closest("a")).toBeNull();
    }
  });
});

describe("no emojis", () => {
  test("rendered HTML contains no emoji characters", () => {
    const { container } = render(<CustomNav />);
    const html = container.innerHTML;
    // Match common emoji Unicode ranges
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu;
    expect(html.match(emojiRegex)).toBeNull();
  });
});

describe("nav order", () => {
  test("direct links appear before dropdown sections", () => {
    const { container } = render(<CustomNav />);
    const allText = container.textContent || "";
    const dashboardPos = allText.indexOf("Dashboard");
    const bestellungsverwaltungPos = allText.indexOf("Bestellungsverwaltung");
    expect(dashboardPos).toBeLessThan(bestellungsverwaltungPos);
  });

  test("dropdown sections appear in order: Bestellungsverwaltung, Produktverwaltung, Website, System", () => {
    const { container } = render(<CustomNav />);
    const allText = container.textContent || "";
    const positions = [
      allText.indexOf("Bestellungsverwaltung"),
      allText.indexOf("Produktverwaltung"),
      allText.indexOf("Website"),
      allText.indexOf("System"),
    ];
    // Each should be found
    for (const pos of positions) {
      expect(pos).toBeGreaterThan(-1);
    }
    // Each should be in ascending order
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});

describe("active link", () => {
  test('when pathname is "/admin", the Dashboard link has active styling', () => {
    render(<CustomNav />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  test('when pathname is "/admin/collections/anfragen", both Bestellungen and Anfragen have active styling', () => {
    // Change mock pathname for this test
    mockPathname = "/admin/collections/anfragen";
    render(<CustomNav />);

    // Both "Bestellungen" direct link and "Anfragen" dropdown link should have aria-current
    const bestellungenLink = screen.getByText("Bestellungen").closest("a");
    expect(bestellungenLink).toHaveAttribute("aria-current", "page");

    const anfragenLink = screen.getByText("Anfragen").closest("a");
    expect(anfragenLink).toHaveAttribute("aria-current", "page");

    // Reset pathname for subsequent tests
    mockPathname = "/admin";
  });

  test('active links have aria-current="page"', () => {
    render(<CustomNav />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });
});
