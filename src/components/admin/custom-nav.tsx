"use client";

import { useAuth, useNav, Logout } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { WebhookFehlerBadge } from "@/components/admin/webhook-fehler-badge";

type NavItem = { label: string; href: string; roles?: string[] };
type NavSubgroup = { heading: string; items: NavItem[] };
type NavSection = {
  key: string;
  label: string;
  items?: NavItem[];
  subgroups?: NavSubgroup[];
  roles?: string[];
};

const STORAGE_KEY = "admin-nav-sections";

function filterByRole<T extends { roles?: string[] }>(
  items: T[],
  userRole: string,
): T[] {
  return items.filter((item) => !item.roles || item.roles.includes(userRole));
}

const DIRECT_LINKS: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bestellungen", href: "/admin/collections/anfragen" },
  { label: "Produkte", href: "/admin/collections/profile" },
  { label: "Benutzer", href: "/admin/collections/users", roles: ["admin"] },
];

const DROPDOWN_SECTIONS: NavSection[] = [
  {
    key: "bestellungsverwaltung",
    label: "Bestellungsverwaltung",
    items: [
      { label: "Anfragen", href: "/admin/collections/anfragen" },
      { label: "Angebote", href: "/admin/collections/angebote" },
      { label: "Rechnungen", href: "/admin/collections/rechnungen" },
      { label: "Reklamationen", href: "/admin/collections/reklamationen" },
      { label: "Status-Historie", href: "/admin/collections/status_historie" },
    ],
  },
  {
    key: "produktverwaltung",
    label: "Produktverwaltung",
    subgroups: [
      {
        heading: "HAUPTPRODUKTE",
        items: [
          { label: "Profile", href: "/admin/collections/profile" },
          { label: "Produkttypen", href: "/admin/collections/produkttypen" },
          { label: "Materialien", href: "/admin/collections/materialien" },
        ],
      },
      {
        heading: "AUSSTATTUNG",
        items: [
          { label: "Farben", href: "/admin/collections/farben" },
          {
            label: "Dichtungsfarben",
            href: "/admin/collections/dichtungsfarben",
          },
          { label: "Verglasungen", href: "/admin/collections/verglasungen" },
          { label: "Schallschutz", href: "/admin/collections/schallschutz" },
          {
            label: "Sicherheitsglas",
            href: "/admin/collections/sicherheitsglas",
          },
          { label: "Glasdekore", href: "/admin/collections/glasdekore" },
          { label: "Sprossen", href: "/admin/collections/sprossen" },
          { label: "Extras", href: "/admin/collections/extras" },
        ],
      },
      {
        heading: "KONFIGURATION",
        items: [
          {
            label: "Fluegelanzahl",
            href: "/admin/collections/fluegelanzahl",
          },
          {
            label: "Öffnungsarten",
            href: "/admin/collections/oeffnungsarten",
          },
          {
            label: "Fensterformen",
            href: "/admin/collections/fensterformen",
          },
          {
            label: "Zusatzlichter",
            href: "/admin/collections/zusatzlichter",
          },
        ],
      },
      {
        heading: "PREISE",
        items: [
          { label: "Preisregeln", href: "/admin/collections/preisregeln" },
          { label: "Rabattcodes", href: "/admin/collections/rabattcodes" },
        ],
      },
    ],
  },
  {
    key: "website",
    label: "Website",
    roles: ["admin"],
    items: [
      { label: "Pages", href: "/admin/collections/pages" },
      { label: "Navigation", href: "/admin/globals/navigation" },
      { label: "Footer", href: "/admin/globals/footer" },
      { label: "Puck Templates", href: "/admin/puck-editor" },
    ],
  },
];

const SYSTEM_SECTION: NavSection = {
  key: "system",
  label: "System",
  roles: ["admin"],
  items: [
    { label: "Medien", href: "/admin/collections/media" },
    { label: "Edit-History", href: "/admin/collections/edit_history" },
    { label: "E-Mail Queue", href: "/admin/collections/email_queue" },
    { label: "E-Mail Preview", href: "/api/email-preview" },
    { label: "Einstellungen", href: "/admin/einstellungen" },
  ],
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return (
    pathname.startsWith(href) &&
    (pathname.length === href.length || pathname[href.length] === "/")
  );
}

function sectionHasActiveLink(pathname: string, section: NavSection): boolean {
  if (section.items) {
    return section.items.some((item) => isActive(pathname, item.href));
  }
  if (section.subgroups) {
    return section.subgroups.some((sg) =>
      sg.items.some((item) => isActive(pathname, item.href)),
    );
  }
  return false;
}

const NAV_STYLES = `
  .cn-link,
  a.cn-link {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    box-sizing: border-box !important;
    height: 42px !important;
    padding: 0 16px !important;
    margin: 0 !important;
    font-size: 14px !important;
    line-height: 1 !important;
    font-weight: 400 !important;
    border-radius: 8px !important;
    transition: background-color 150ms ease, color 150ms ease !important;
    text-decoration: none !important;
    color: rgba(255, 255, 255, 0.5) !important;
  }
  .cn-link:hover,
  a.cn-link:hover {
    color: rgba(255, 255, 255, 0.8) !important;
    background: rgba(255, 255, 255, 0.06) !important;
  }
  .cn-link--active,
  a.cn-link--active {
    color: #fff !important;
    font-weight: 500 !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }
  .cn-link--active:hover,
  a.cn-link--active:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #fff !important;
  }
  .cn-link--l1 { padding-left: 32px !important; }
  .cn-link--l2 { padding-left: 44px !important; }
  .cn-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    height: 42px;
    padding: 0 16px;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: rgba(255, 255, 255, 0.7);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
    text-align: left;
  }
  .cn-trigger:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.06);
  }
  .cn-chevron {
    color: rgba(255, 255, 255, 0.3);
    transition: transform 200ms ease;
    flex-shrink: 0;
  }
  .cn-chevron--open {
    transform: rotate(180deg);
  }
  .cn-subheading {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 16px;
    margin: 8px 0 2px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
    color: rgba(255, 255, 255, 0.25);
    user-select: none;
  }
  /* App Header Restyle */
  .app-header {
    --app-header-height: 64px !important;
    height: 64px !important;
    min-height: 64px !important;
  }
  .app-header__content {
    height: 64px !important;
  }
  .step-nav__home {
    overflow: visible !important;
    width: auto !important;
    height: auto !important;
    display: flex !important;
    align-items: center !important;
  }
  .step-nav__home img {
    max-width: 200px !important;
    max-height: 36px !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
  }
  .cn-separator {
    height: 1px;
    margin: 8px 24px;
    background: rgba(255, 255, 255, 0.08);
  }
  .nav .nav__scroll,
  .nav .nav__wrap,
  .nav .cn-col {
    width: 100% !important;
    max-width: 100% !important;
    gap: 2px !important;
  }
`;

function NavLink({
  href,
  label,
  active,
  level = 0,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  level?: number;
  children?: React.ReactNode;
}) {
  const levelClass =
    level === 1 ? "cn-link--l1" : level === 2 ? "cn-link--l2" : "";
  return (
    <Link
      href={href}
      className={`cn-link ${levelClass} ${active ? "cn-link--active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {children || label}
    </Link>
  );
}

function DropdownSection({
  section,
  isOpen,
  onToggle,
  pathname,
  badge,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  badge?: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="cn-trigger">
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {section.label}
          {badge}
        </span>
        <ChevronDown
          size={16}
          className={`cn-chevron ${isOpen ? "cn-chevron--open" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {section.items && (
          <div
            className="cn-col"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={active}
                  level={1}
                />
              );
            })}
          </div>
        )}

        {section.subgroups && (
          <div
            className="cn-col"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {section.subgroups.map((subgroup) => (
              <div key={subgroup.heading}>
                <span className="cn-subheading" role="presentation">
                  {subgroup.heading}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {subgroup.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        active={active}
                        level={2}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CustomNav() {
  const { user } = useAuth();
  const { navOpen, navRef } = useNav();
  const pathname = usePathname();

  const userRole = (user as { rolle?: string })?.rolle ?? "viewer";
  const visibleDirectLinks = filterByRole(DIRECT_LINKS, userRole);
  const visibleDropdownSections = filterByRole(
    [...DROPDOWN_SECTIONS, SYSTEM_SECTION],
    userRole,
  );
  const showSeparator = visibleDropdownSections.length > 0;

  const prevPathnameRef = useRef<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const allSections = [...DROPDOWN_SECTIONS, SYSTEM_SECTION];
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (
      stored &&
      prevPathnameRef.current !== null &&
      pathname === prevPathnameRef.current
    ) {
      // Browser reload or tab switch: restore from sessionStorage
      try {
        setOpenSections(JSON.parse(stored));
      } catch {
        // Corrupt data: fall through to URL logic
      }
      prevPathnameRef.current = pathname;
      return;
    }

    // SPA navigation or first load:
    // Additively open the section that contains the active link
    setOpenSections((prev) => {
      const base =
        stored && prevPathnameRef.current === null
          ? (() => {
              try {
                return JSON.parse(stored) as Record<string, boolean>;
              } catch {
                return { ...prev };
              }
            })()
          : { ...prev };
      for (const section of allSections) {
        if (sectionHasActiveLink(pathname, section)) {
          base[section.key] = true;
        }
      }
      return base;
    });
    prevPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Object.keys(openSections).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
    }
  }, [openSections]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <style>{NAV_STYLES}</style>
      <aside
        className={["nav", navOpen && "nav--nav-open", "nav--nav-hydrated"]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="nav__scroll" ref={navRef}>
          <nav
            className="nav__wrap"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "8px 0",
              minHeight: "100%",
            }}
          >
            {/* Direct Links (NAV-01) */}
            <div
              className="cn-col"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {visibleDirectLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={active}
                  />
                );
              })}
            </div>

            {/* Separator */}
            {showSeparator && <div className="cn-separator" />}

            {/* Dropdown Sections (NAV-02, NAV-03, NAV-04, NAV-05) */}
            {showSeparator && (
              <div
                className="cn-col"
                style={{ display: "flex", flexDirection: "column" }}
              >
                {visibleDropdownSections.map((section) => (
                  <DropdownSection
                    key={section.key}
                    section={section}
                    isOpen={!!openSections[section.key]}
                    onToggle={() => toggleSection(section.key)}
                    pathname={pathname}
                    badge={
                      section.key === "system" ? (
                        <WebhookFehlerBadge />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}

            {/* Spacer to push logout to bottom */}
            <div style={{ flex: 1 }} />

            {/* Logout */}
            <div style={{ padding: "16px" }}>
              <Logout />
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}

export {
  filterByRole,
  STORAGE_KEY,
  DIRECT_LINKS,
  DROPDOWN_SECTIONS,
  SYSTEM_SECTION,
};
