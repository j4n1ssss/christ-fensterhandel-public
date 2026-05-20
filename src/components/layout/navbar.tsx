"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { CartBadge } from "@/components/cart/cart-badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ─────────────────────────────────────────────────────────────
   NAV-STRUKTUR — basiert auf
   docs/website/relaunch/sitemap/neue-sitemap.md
   ───────────────────────────────────────────────────────────── */

type NavGroup = {
  heading?: string;
  items: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
};

type NavItem =
  | { kind: "link"; label: string; href: string }
  | {
      kind: "dropdown";
      label: string;
      groups: NavGroup[];
      footer?: { label: string; href: string };
    };

const NAV_ITEMS: NavItem[] = [
  {
    kind: "dropdown",
    label: "Produkte",
    groups: [
      {
        heading: "Fenster",
        items: [
          { label: "Kunststoff-Fenster", href: "/produkte/fenster", description: "DRUTEX Iglo-Serie" },
          { label: "Aluminium-Fenster", href: "/produkte/aluminium-fenster", description: "MB-Serien 45 / 70 / 86" },
          { label: "Holz-Fenster", href: "/produkte/holz-fenster", description: "Natürliche Optik" },
        ],
      },
      {
        heading: "Türen",
        items: [
          { label: "Haustüren", href: "/produkte/haustueren", description: "Kunststoff, Holz, Alu, Vollglas" },
          { label: "Balkontüren", href: "/produkte/balkontueren", description: "Dreh-Kipp, PSK, HST" },
          { label: "Schiebetüren", href: "/produkte/schiebetueren", description: "HST und PSK" },
        ],
      },
      {
        heading: "Weitere",
        items: [
          { label: "Rollläden", href: "/produkte/rolllaeden", description: "Aufsatz, Unterputz, Vorsatz" },
          { label: "Zubehör", href: "/produkte/zubehoer", description: "Beschläge, Sprossen, Montage" },
        ],
      },
    ],
    footer: { label: "Alle Produkte ansehen", href: "/produkte" },
  },
  { kind: "link", label: "Versand & Lieferung", href: "/versand-lieferung" },
  { kind: "link", label: "FAQ", href: "/faq" },
  { kind: "link", label: "Bestellung verfolgen", href: "/bestellung-verfolgen" },
  {
    kind: "dropdown",
    label: "Galerie",
    groups: [
      {
        items: [
          { label: "Alle Projekte", href: "/galerie", description: "Übersicht aller Kategorien" },
          { label: "Fenster-Projekte", href: "/galerie/fenster" },
          { label: "Türen-Projekte", href: "/galerie/tueren" },
          { label: "Referenz-Objekte", href: "/galerie/objekte", description: "Fertige Einbauten" },
          { label: "Werk & Produktion", href: "/galerie/werk", description: "Einblick bei DRUTEX" },
        ],
      },
    ],
  },
  {
    kind: "dropdown",
    label: "Unternehmen",
    groups: [
      {
        heading: "Über uns",
        items: [
          { label: "Über uns", href: "/ueber-uns", description: "Familie, Werte, Team" },
          { label: "Kontakt", href: "/kontakt", description: "Showroom & Ansprechpartner" },
        ],
      },
      {
        heading: "DRUTEX Partnerschaft",
        items: [
          { label: "Partnerschaft", href: "/ueber-uns/drutex", description: "Warum DRUTEX?" },
          { label: "DRUTEX Profil", href: "/ueber-uns/drutex/profil" },
          { label: "Produktion", href: "/ueber-uns/drutex/produktion" },
          { label: "Fuhrpark", href: "/ueber-uns/drutex/fuhrpark" },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────────── */

interface NavbarProps {
  isLoggedIn: boolean;
}

export function Navbar({ isLoggedIn }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-Intent (Desktop): 150 ms Delay vor Close, damit der User
  // vom Trigger ins Dropdown-Panel wandern kann.
  const openNow = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(label);
  };
  const closeSoon = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  // ESC schließt alles.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Body-Scroll lock, solange Mega-Menu offen ist.
  React.useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Beim Wechsel ≥ 1471 px (Desktop) Mega-Menu schließen, um Hänger zu vermeiden.
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1471px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black-200 bg-white/95 backdrop-blur-md">
      <Container size="xl">
        <div className="flex h-16 items-stretch justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Muster Fenster · Startseite"
            className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
            onClick={() => setMobileOpen(false)}
          >
            <span className="font-heading text-lg font-semibold tracking-tight text-black-950">
              Muster Fenster
            </span>
          </Link>

          {/* Desktop-Hauptnavigation · ≥ 1471 px */}
          <nav
            aria-label="Hauptnavigation"
            className="hidden items-stretch min-[1471px]:flex"
          >
            {NAV_ITEMS.map((item) =>
              item.kind === "link" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-full items-center px-3 text-sm font-medium text-black-700 transition-colors hover:bg-black-50 hover:text-black-950"
                >
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.label}
                  className="relative flex"
                  onMouseEnter={() => openNow(item.label)}
                  onMouseLeave={closeSoon}
                >
                  <button
                    type="button"
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                    className="inline-flex h-full cursor-pointer items-center gap-1 px-3 text-sm font-medium text-black-700 transition-colors hover:bg-black-50 hover:text-black-950"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        openDropdown === item.label && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </div>
              ),
            )}
          </nav>

          {/* Rechts: Konfigurator + Auth + Warenkorb + Burger */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Konfigurator-CTA — sichtbar ≥ 651 px */}
            <Link
              href="/konfigurator"
              className={cn(
                buttonVariants({ variant: "primary", size: "small" }),
                "hidden min-[651px]:inline-flex",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Konfigurator
              <ArrowRight aria-hidden />
            </Link>

            {/* Anmelden / Dashboard — nur Desktop ≥ 1471 px */}
            <Link
              href={isLoggedIn ? "/dashboard" : "/anmelden"}
              className={cn(
                buttonVariants({ variant: "alternate", size: "small" }),
                "hidden min-[1471px]:inline-flex",
              )}
            >
              {isLoggedIn ? "Dashboard" : "Anmelden"}
            </Link>

            {/* Warenkorb — sichtbar ≥ 651 px */}
            <Link
              href="/warenkorb"
              aria-label="Warenkorb"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-black-700 transition-colors min-[651px]:inline-flex hover:bg-black-100 hover:text-black-950"
              onClick={() => setMobileOpen(false)}
            >
              <CartBadge />
            </Link>

            {/* Burger — sichtbar < 1471 px */}
            <button
              type="button"
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-mega-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="relative hidden h-10 w-10 items-center justify-center rounded-md text-black-800 transition-colors hover:bg-black-100 hover:text-black-950 max-[1470px]:inline-flex"
            >
              <Menu
                aria-hidden
                className={cn(
                  "absolute size-5 transition-all duration-200",
                  mobileOpen
                    ? "rotate-90 scale-75 opacity-0"
                    : "rotate-0 scale-100 opacity-100",
                )}
              />
              <X
                aria-hidden
                className={cn(
                  "absolute size-5 transition-all duration-200",
                  mobileOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-75 opacity-0",
                )}
              />
            </button>
          </div>
        </div>
      </Container>

      {/* ─── Desktop-Mega-Menu-Panel (≥ 1471 px) ─── */}
      {NAV_ITEMS.filter((i) => i.kind === "dropdown").map((item) => {
        if (item.kind !== "dropdown") return null;
        const isOpen = openDropdown === item.label;
        return (
          <div
            key={item.label}
            aria-hidden={!isOpen}
            onMouseEnter={() => openNow(item.label)}
            onMouseLeave={closeSoon}
            className={cn(
              "absolute inset-x-0 top-full z-30 hidden border-b border-black-200 bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] transition-all duration-200 min-[1471px]:block",
              isOpen
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0",
            )}
          >
            <Container size="xl">
              <div className="py-10">
                <div
                  className="grid gap-10"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(item.groups.length, 3)}, minmax(0, 1fr))`,
                  }}
                >
                  {item.groups.map((group, i) => (
                    <div key={i}>
                      {group.heading && (
                        <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
                          {group.heading}
                        </h3>
                      )}
                      <ul className="space-y-1">
                        {group.items.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              className="group block rounded-md px-3 py-2.5 transition-colors hover:bg-black-50"
                            >
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm font-medium text-black-900 transition-colors group-hover:text-brand-700">
                                  {sub.label}
                                </span>
                                <ArrowRight
                                  className="size-3.5 -translate-x-1 text-black-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100"
                                  aria-hidden
                                />
                              </div>
                              {sub.description && (
                                <p className="mt-0.5 text-xs leading-relaxed text-black-500">
                                  {sub.description}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {item.footer && (
                  <div className="mt-8 flex justify-end border-t border-black-100 pt-5">
                    <Link
                      href={item.footer.href}
                      onClick={() => setOpenDropdown(null)}
                      className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-black-600 transition-colors hover:text-brand-700"
                    >
                      {item.footer.label}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                )}
              </div>
            </Container>
          </div>
        );
      })}

      {/* ─── Mobile-Mega-Menu · Full-Screen Overlay (< 1471 px) ─── */}
      <MobileMegaMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isLoggedIn={isLoggedIn}
      />
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE MEGA MENU
   Fullscreen-Overlay unterhalb der sticky Navbar (top-16).
   Items fade + slide-up gestaffelt (CSS-driven via
   [data-mega-open="true"] + animation-delay inline).
   ───────────────────────────────────────────────────────────── */

function MobileMegaMenu({
  open,
  onClose,
  isLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}) {
  // Portal-Target erst nach Mount verfügbar (SSR-safe).
  // Grund: Der <header> hat `backdrop-blur-md` → backdrop-filter erzeugt
  // einen neuen Containing-Block für `position: fixed`. Würde das Menu
  // im Header bleiben, landet es außerhalb des sichtbaren Bereichs.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const overlay = (
    <div
      id="mobile-mega-menu"
      data-mega-open={open ? "true" : "false"}
      aria-hidden={!open}
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-40 hidden overflow-y-auto overscroll-contain bg-white transition-opacity duration-300 ease-out max-[1470px]:block",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <Container size="xl">
        <nav
          aria-label="Mobile Hauptnavigation"
          className="flex flex-col gap-1 py-6"
        >
          {NAV_ITEMS.map((item, idx) => {
            const delay = `${idx * 55}ms`;
            if (item.kind === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{ animationDelay: delay }}
                  className="mega-item group flex items-center justify-between border-b border-black-100 py-4 font-heading text-2xl font-medium tracking-tight text-black-900 transition-colors hover:text-brand-700"
                >
                  <span>{item.label}</span>
                  <ArrowRight
                    className="size-5 -translate-x-1 text-black-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              );
            }
            return (
              <div
                key={item.label}
                className="mega-item"
                style={{ animationDelay: delay }}
              >
                <Collapsible>
                  <CollapsibleTrigger className="group flex w-full items-center justify-between border-b border-black-100 py-4 text-left font-heading text-2xl font-medium tracking-tight text-black-900 transition-colors data-[state=open]:text-brand-700 hover:text-brand-700">
                    <span>{item.label}</span>
                    <ChevronDown
                      className="size-5 text-black-400 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-brand-600"
                      aria-hidden
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mega-collapsible overflow-hidden">
                    <div className="flex flex-col gap-6 py-5 pl-1">
                      {item.groups.map((group, gi) => (
                        <div key={gi}>
                          {group.heading && (
                            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black-500">
                              {group.heading}
                            </h3>
                          )}
                          <ul className="flex flex-col gap-0.5">
                            {group.items.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  onClick={onClose}
                                  className="group/sub block rounded-md py-2.5 pl-3 pr-2 transition-colors hover:bg-black-50"
                                >
                                  <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-base font-medium text-black-900 transition-colors group-hover/sub:text-brand-700">
                                      {sub.label}
                                    </span>
                                    <ArrowRight
                                      className="size-3.5 -translate-x-1 text-black-400 opacity-0 transition-all group-hover/sub:translate-x-0 group-hover/sub:text-brand-600 group-hover/sub:opacity-100"
                                      aria-hidden
                                    />
                                  </div>
                                  {sub.description && (
                                    <p className="mt-0.5 text-xs leading-relaxed text-black-500">
                                      {sub.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {item.footer && (
                        <Link
                          href={item.footer.href}
                          onClick={onClose}
                          className="inline-flex items-center gap-2 self-start pl-3 font-mono text-xs uppercase tracking-[0.15em] text-black-600 transition-colors hover:text-brand-700"
                        >
                          {item.footer.label}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </nav>

        {/* Aktions-Zone — Konfigurator + Cart nur < 651 px,
            Anmelden/Dashboard generell (weil < 1471 px nicht in Navbar). */}
        <div
          className="mega-item flex flex-col gap-3 border-t border-black-200 py-8"
          style={{ animationDelay: `${NAV_ITEMS.length * 55}ms` }}
        >
          <Link
            href="/konfigurator"
            onClick={onClose}
            className={cn(
              buttonVariants({ variant: "primary", size: "normal" }),
              "min-[651px]:hidden w-full justify-center",
            )}
          >
            Konfigurator
            <ArrowRight aria-hidden />
          </Link>

          <Link
            href={isLoggedIn ? "/dashboard" : "/anmelden"}
            onClick={onClose}
            className={cn(
              buttonVariants({ variant: "alternate", size: "normal" }),
              "w-full justify-center",
            )}
          >
            {isLoggedIn ? "Zum Dashboard" : "Anmelden"}
          </Link>

          <Link
            href="/warenkorb"
            onClick={onClose}
            className={cn(
              buttonVariants({ variant: "alternate", size: "normal" }),
              "min-[651px]:hidden w-full justify-center",
            )}
          >
            Warenkorb
          </Link>
        </div>
      </Container>
    </div>
  );

  return createPortal(overlay, document.body);
}
