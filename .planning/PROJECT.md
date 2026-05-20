# Christ Fensterhandel — Konfigurator-System

## What This Is

Ein vollstaendiges Fenster-Konfigurator-System fuer Christ Fensterhandel. Kunden konfigurieren Fenster und Balkontueren ueber einen 10-Step-Konfigurator mit Hub-basierter Filterung und Live-SVG-Vorschau, legen Produkte in den Warenkorb, senden Anfragen ab und verfolgen den Bestellstatus im Kunden-Dashboard mit 5-Phasen-Fortschrittsbalken und verstaendlichen deutschen Status-Texten. Christ Fensterhandel verwaltet Profile als zentralen Hub fuer alle Produkt-Zuordnungen (13 Relationship-Felder), mit Undo/Redo Sicherheitsnetz und lueckenloser Aenderungshistorie im Admin-Dashboard mit vollstaendig custom Navigation, redesignter Anfrage-Detail-View (AttentionBar + Splitbutton + 2-Spalten-Tabs) und Listen-View mit Filter-Tabs und Attention-Score-Sortierung, plus 20-Status-Bestellungsflow mit Transitions, Stripe-Zahlungen und automatisierten E-Mail-Benachrichtigungen bei 14 kundenrelevanten Status-Aenderungen via N8N.

## Core Value

Kunden koennen Fenster/Tueren Schritt fuer Schritt konfigurieren, wobei jede Auswahl die naechsten Optionen ueber den Profile-Hub intelligent filtert — und Christ Fensterhandel bekommt jede Anfrage strukturiert ins Dashboard.

## Requirements

### Validated

- ✓ Next.js + Payload CMS + PostgreSQL Projekt-Setup — v1.0
- ✓ Tailwind CSS + Shadcn UI mit Design Tokens — v1.0
- ✓ TypeScript strict, ESLint, saubere Ordnerstruktur — v1.0
- ✓ 17+ CMS Collections mit Beziehungen und konditionaler Filterung — v1.0
- ✓ Seed-Script mit realistischen Drutex-Daten — v1.0
- ✓ 10-Step Konfigurator mit konditionaler Ketten-Logik — v1.0
- ✓ Landing Page mit 3 Konfigurator-Karten — v1.0
- ✓ Zurueck-Reset-Logik und Fortschrittsanzeige — v1.0
- ✓ Zusammenfassung mit Preisvorschau — v1.0
- ✓ Warenkorb (hinzufuegen, bearbeiten, loeschen, Stueckzahl) — v1.0
- ✓ Server-seitige Preisberechnung mit CMS-Preisregeln — v1.0
- ✓ Rabattcode-Validierung (gueltig/abgelaufen/aufgebraucht/min-bestellwert) — v1.0
- ✓ Konfigurations-Snapshot bei Absenden — v1.0
- ✓ Kontaktformular mit Server-seitiger Zod-Validierung — v1.0
- ✓ Access Control (Admin/Mitarbeiter/Viewer/Kunde Rollen) — v1.0
- ✓ Admin-Dashboard mit Filter, Suche, Status-Workflow, Historie, Notizen — v1.0
- ✓ Kunden-Auth (Login/Register) mit eigenem Dashboard — v1.0
- ✓ Stripe Test-Integration (Checkout, Webhook, Status "bezahlt") — v1.0
- ✓ N8N Integration (Webhooks, E-Mail-Automatisierung) — v1.0
- ✓ Puck Page Builder mit 5 Block-Components und Draft Mode — v1.0
- ✓ Mehrsprachigkeit DE/EN (Payload i18n, Sprachumschalter) — v1.0
- ✓ DSGVO-Basics (Cookie-Banner, Datenschutz-Checkbox, Datenloeschung) — v1.0
- ✓ Profile als zentraler Hub mit 13 hasMany-Relationship-Feldern in 2 Tabs — v1.1
- ✓ Automatische Migration erlaubte_farben (idempotent, paginiert) — v1.1
- ✓ Hub-first Filterung ersetzt Ketten-Filter komplett (Steps 4-6, 8-9) — v1.1
- ✓ Undo/Redo mit Keyboard-Shortcuts und Save-Floor — v1.1
- ✓ Edit-History mit Diff-Logging und History-Panel — v1.1
- ✓ Hub-Status Badge, Type-Fixes, Versions-ADR — v1.1
- ✓ Custom Navigation Component ersetzt Standard Payload Sidebar — v1.2
- ✓ Feste Links (Dashboard, Bestellungen, Produkte, Benutzer) + 4 aufklappbare Dropdowns — v1.2
- ✓ Graue Untergruppen-Ueberschriften in Produktverwaltung — v1.2
- ✓ Keine Emojis in Navigation, nur Text-Labels — v1.2
- ✓ Dropdown-Zustand session-persistent — v1.2
- ✓ Rollenbasierte Nav-Filterung + Kunden-Admin-Block — v1.2
- ✓ status-config.ts als Single Source of Truth (20 Statuse, Farben, Labels, Kunden-Texte) — v1.3
- ✓ 20-Status-Bestellungsflow mit validierten Transitions und Abzweigungen — v1.3
- ✓ Admin-Status zu Kunden-Text Mapping mit 5-Phasen-Modell — v1.3
- ✓ Hersteller-Felder und Stornierung-Felder auf Anfragen-Collection — v1.3
- ✓ customer_facing Flag auf WebhookPayload fuer N8N E-Mail-Trigger — v1.3
- ✓ admin-custom.css fuer strukturelle Admin-Styles (BEM-Konvention) — v1.3
- ✓ Attention Bar mit Status-Badge, Wartezeit-Farbcodierung, Gesamtpreis — v1.3
- ✓ Splitbutton-Pattern fuer kontextabhaengige Status-Aktionen — v1.3
- ✓ 2-Spalten-Layout mit Produktkarten und Tab-Panel (Kontakt/Timeline/Notizen) — v1.3
- ✓ Stueckzahl-Badge pro Produktkarte (32x32px, Einzelpreis x Menge) — v1.3
- ✓ Anfragen-Liste mit Filter-Tabs und Attention-Score-Sortierung — v1.3
- ✓ Wartezeit-Spalte mit Farb-Codierung (gruen/gelb/orange/rot) — v1.3
- ✓ 5-Phasen-Fortschrittsbalken im Kunden-Dashboard — v1.3
- ✓ E-Mail-Trigger bei 14 kundenrelevanten Status-Aenderungen via N8N — v1.3

### Active

## Current Milestone: v1.4 Bestellungsflow + Integrationen

**Goal:** Stripe, N8N E-Mails, PDF-Dokumente (Angebot/Rechnung) und Kunden-Features End-to-End fertigstellen, Security-Grundlagen haerten.

**Target features:**
- Security-Haertung (.env Secrets, Rate Limiting, CSRF, Seed-Guard)
- Stripe Zahlungslink-Automatisierung + Rueckerstattung + Edge Cases
- N8N E-Mail-System komplett (Event-Matrix, Templates, Provider-agnostisch)
- Angebots-PDF + Rechnungs-PDF mit MwSt nach §14 UStG
- Bestellungsflow V2 (Reklamation, Kunden Self-Service, Kundenantwort auf Rueckfrage)
- Admin-Features (Manueller E-Mail-Versand, Webhook-Tab Redesign, Settings-Page)
- Cleanup (Stripe console.log, zahlung_eingegangen Event)

<!-- Deferred from v1.0/v1.1 -->
- [ ] Dockerfile fuer Next.js + Payload App
- [ ] PostgreSQL als Docker Container
- [ ] Coolify-Deployment auf Netcup VPS mit SSL (Let's Encrypt)
- [ ] N8N als Docker Container auf demselben Server
- [ ] Auto-Deployment bei Git Push
- [ ] USE_HUB Feature-Flag und Legacy-Code entfernen
- [ ] Legacy-Ketten-Felder entfernen nach Hub-Validierung

### Out of Scope

- Webflow — Projekt laeuft komplett auf Next.js + Payload CMS
- Supabase — PostgreSQL direkt, kein externer DB-Service
- Retool/Softr — Dashboard ist in Payload Admin eingebaut
- Drutex API-Integration — kommt erst nach v1 (manuelle Bestellung)
- Echtzeit-Chat — nicht Teil des Konfigurators
- Mobile App — Web-first, responsive reicht
- Garagentore/Raffstore-Konfigurator — eigene Konfiguratoren, spaeter
- Tueren-/Rolllaeden-Konfigurator — eigener Step-Flow, v2
- Metriken-Dashboard — v2
- Gast-Tracking — v2
- E-Mail-Einstellungsseite mit Toggles — v1.4 baut Architektur vor, UI kommt spaeter
- Hersteller-Bestell-Automatisierung — manueller Prozess reicht fuer v1.4

## Context

Shipped v1.3 mit 23.412 LOC TypeScript/TSX am 2026-03-27.
Tech Stack: Next.js 15 (App Router), Payload CMS 3.79, PostgreSQL, Tailwind CSS 4, Shadcn UI, Zustand, Zod, React Hook Form, Stripe, N8N, Puck Editor.

v1.0: 62/67 Requirements (5 Deployment deferred). v1.1: 32/32 Requirements. v1.2: 13/13 Requirements. v1.3: 22/22 Requirements.
Profile ist zentraler Hub mit 13 Relationship-Feldern, Hub-first Filterung, Undo/Redo und Edit-History.
Admin-Panel hat redesignte Detail-View (AttentionBar + Splitbutton + 2-Spalten-Tabs), Listen-View mit Filter-Tabs und Attention-Score, und custom Navigation mit rollenbasierter Sichtbarkeit.
Kunden-Dashboard zeigt 5-Phasen-Fortschrittsbalken und verstaendliche Status-Texte.
20-Status-Bestellungsflow mit validierten Transitions, Hersteller- und Stornierung-Feldern.
340+ Tests (Unit), 0 Regressionen.

## Constraints

- **Tech-Stack**: Next.js App Router + Payload CMS 3.0 (embedded) + PostgreSQL + Tailwind + Shadcn UI + React Hook Form + Zod — fixiert
- **Datenbank**: PostgreSQL — KEIN SQLite
- **Deployment**: Coolify auf Netcup VPS 1000 G11 — DSGVO-konform (Server in DE)
- **Automation**: N8N Self-hosted auf demselben Server
- **Page Builder**: Puck Editor via @delmaredigital/payload-puck Plugin
- **Bezahlung**: Stripe Test-Modus

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Payload CMS statt Webflow + Supabase | Alles in einem Projekt, eingebaute Auth/Admin | ✓ Good — Admin Panel deckt Dashboard-Needs ab |
| PostgreSQL statt SQLite | Produktions-DB von Tag 1 | ✓ Good — keine Migration noetig |
| Puck Editor statt manuelles Page-Building | Drag&Drop fuer Geschaeftsinhaber | ✓ Good — 5 Blocks, Draft Mode funktioniert |
| Coolify statt Vercel | DSGVO (Server in DE), alles auf einem Server | — Pending (Deployment) |
| Server-seitige Preisberechnung | Client-Preis nur Vorschau, Manipulationsschutz | ✓ Good — Zod-validiert, nicht manipulierbar |
| Zustand + persist fuer Konfigurator/Warenkorb | SSR-safe mit skipHydration, LocalStorage Persistenz | ✓ Good — reibungslos, kein Hydration-Mismatch |
| Zod v4 inline Schemas statt getStepSchema() | zodResolver Type-Kompatibilitaet mit Zod v4 | ⚠️ Revisit — Pattern funktioniert, aber dupliziert Schemas |
| afterChange Hooks fuer N8N Webhooks | Non-blocking, try/catch wrapped | ✓ Good — Fehler isoliert, Badge im Admin |
| Tailwind CSS 4 mit CSS @theme | Kein JS-Config, CSS-native | ✓ Good — sauber, zukunftssicher |
| Hub ersetzt Ketten-Filter komplett | Profil als einzige Filterquelle (Steps 4-6, 8-9), kein Legacy-Fallback | ✓ Good — 32/32 Reqs, 3 Audit-Runden bestanden |
| Undo/Redo mit getFields/REPLACE_STATE | PoC-first Ansatz, structuredClone, dispatchFields | ✓ Good — Save-Floor via useFormModified |
| Edit-History afterChange + skipContext Guard | Kein Infinite Loop, immutable Collection | ✓ Good — StatusHistorie-Pattern bewaehrt |
| Custom Nav statt NavGroup Override | NavGroup ist an usePreferences DB-Persistenz gekoppelt | ✓ Good — sessionStorage + Rollen-Filterung sauber |
| Inline Styles + admin-custom.css im Admin | Payload Admin nutzt eigenes CSS-System, kein Tailwind | ✓ Good — BEM-Klassen + Inline fuer dynamische Werte |
| Dual-Layer Kunden-Block | access.admin Server-Block + Middleware Redirect | ✓ Good — Defense in Depth |
| Separate flat Record maps in status-config.ts | Einfachere Consumer-Imports und Tree-Shaking als nested Config | ✓ Good — 6+ Consumer-Dateien importieren einzelne Maps |
| Splitbutton statt Status-Dropdown | Primaere Aktion sofort sichtbar, Abzweigungen im Chevron | ✓ Good — kontextabhaengig pro Status, Admin spart Klicks |
| Client-side Filtering mit limit=0 | Akzeptabel fuer < 500 Anfragen, URL-Param-Persistenz | ✓ Good — bookmarkbare Filter-Views |
| CSS contents fuer ProgressStepper DOM | Flat DOM-Struktur mit connecting lines | ✓ Good — Mini-Variante und Vollversion wiederverwendbar |
| No XState — plain-object state machine | Bestehender Pattern reicht, keine Library noetig | ✓ Good — VALID_TRANSITIONS + COMMENT_REQUIRED decken alle Flows ab |
| Radix Primitives direkt statt Shadcn im Admin | Admin hat kein Tailwind, Shadcn Wrapper unnoetig | ✓ Good — direkte Kontrolle ueber Styling |

---
*Last updated: 2026-03-27 after v1.4 milestone start*
