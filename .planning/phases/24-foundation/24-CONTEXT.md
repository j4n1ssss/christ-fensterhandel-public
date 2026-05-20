# Phase 24: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

System hat sichere, konfigurierbare Grundlagen fuer alle nachfolgenden Finanz- und Dokument-Features. Umfasst: Settings Global (Firmendaten, Steuer, Stripe, Dokumente), zentrale MwSt-Berechnung mit Cent-Integer-Arithmetik, Nummernkreise fuer Dokumente (ANG/RE/GS), Security-Haertung (Rate Limiting, CSRF, Seed-Guard), und Optimistic Locking auf Anfragen.

**WICHTIG:** Phase 24 baut Infrastruktur (Felder, Funktionen, Helpers). Konkrete Business-Werte (Steuersatz, Firmendaten, E-Mail-Config) sind BLOCKED bis Kundenabsprache (Todo 043) + Steuerberater geklaert haben: Paraguay-Firma -> DE-Verkauf Steuersituation, ob eigene Rechnungen noetig oder Stripe reicht, E-Mail-Provider-Setup.

</domain>

<decisions>
## Implementation Decisions

### Settings Global Struktur
- Payload Global als Datenschicht + Custom Admin Page als Frontend-UI (wie anfrage-detail-view und dashboard-overview Pattern)
- Navigation: Unter System-Dropdown (nicht als Top-Level Link)
- 4 Tabs auf der Custom Page: Firmendaten | Steuer | Stripe | Dokumente
- Access: Nur Admin darf bearbeiten (Mitarbeiter/Viewer read-only oder kein Zugang)
- Aenderungen wirken sofort (kein Cache, jeder API-Call liest aktuellen Wert aus DB)
- Einsprachig (keine i18n-Lokalisierung fuer faktische Firmendaten)
- "Zuletzt aktualisiert am [Datum] von [User]" Anzeige (kein volles History-Tracking)

### Settings Felder-Gruppen
- **Firmendaten:** Firmenname, Adresse, Telefon, E-Mail, Steuernummer, USt-IdNr, Bankverbindung (IBAN, BIC, Bank-Name als optionale Felder — Firma in Paraguay, primaer Stripe)
- **Steuer-Konfiguration:** MwSt-Satz (Default 19%), Preisanzeige brutto/netto (konfigurierbar)
- **Stripe-Konfiguration:** Zahlungslink-Ablaufzeit (Default 24h), Waehrung (konfigurierbar — EUR Default, Dropdown mit EUR/USD/PYG etc.), Test/Live-Info (Keys bleiben in .env)
- **Dokument-Einstellungen:** Angebots-Gueltigkeit (Default 30 Tage), Widerrufsbelehrung-Text (Textarea), AGB-Link/PDF, Logo fuer PDFs (Upload via Payload Media)
- **E-Mail-Felder:** Absender-Name, Reply-To Adresse, E-Mail-Signatur — vorbereitet fuer Phase 25

### MwSt & Preisberechnung
- Vollstaendige lib/tax.ts mit funktionalen Helpers (kein OOP)
- Funktionen: calcNetFromGross(grossCents, rate), calcGrossFromNet(netCents, rate), calcTax(netCents, rate), splitLine(unitCents, qty, rate)
- Cent-Integer-Arithmetik durchgehend (keine Floats fuer Geldbetraege)
- MwSt-Satz wird aus Settings Global gelesen via getSettings() Helper (lib/settings.ts)
- Komplette Migration aller bestehenden Preise auf Cent: Seed-Daten, Preisregeln-Collection, DB-Felder, calculate-price API, Warenkorb-Store
- Preisanzeige (brutto/netto) konfigurierbar ueber Settings
- Neue formatCents(cents: number) Funktion in lib/format-currency.ts (bestehende formatCurrency wird fuer Abwaertskompatibilitaet behalten aber intern umgestellt)

### Nummernkreise
- Payload Collection 'nummernkreise' mit Counter-Pattern: { typ: 'ANG'|'RE'|'GS', jahr: number, letzteNummer: number, prefix: string }
- 4-stellig: ANG-2026-0001, RE-2026-0042, GS-2026-0003
- Automatischer Jahreswechsel: getNextNumber() prueft aktuelles Jahr, legt bei Bedarf neuen Eintrag an
- Atomarer Increment via Payload Transaction (lueckenlos bei Concurrency)
- Nur fuer Admin sichtbar (nicht in Haupt-Navigation, aber ueber URL erreichbar)
- Helper: lib/nummernkreise.ts mit getNextNumber(typ: 'ANG'|'RE'|'GS'): Promise<string>

### Security & Rate Limiting
- **Rate Limiting:** In-Memory Map (kein Redis noetig, Single-Server Coolify)
- Pro-Route mit withRateLimit(handler, {limit, windowMs}) Wrapper
- Middleware Matcher fuer /api/users/login (5/min pro IP) — Payload-Route, braucht Middleware-Approach
- Limits: Login 5/min, Anfrage-Submit 3/min, Status-Pruefen 10/min, Rabattcode 10/min
- Response: HTTP 429 + Retry-After Header + deutsche Fehlermeldung, kein IP-Block
- X-Forwarded-For Header korrekt lesen fuer Deployment hinter Reverse Proxy (Coolify/Docker)
- **CSRF:** Origin-Check (bestehend) + Double-Submit Cookie Token (validateCsrfToken existiert schon in security.ts)
- Scope: Alle 7 Custom API Routes + /api/users/login (Rate Limiting)
- **Seed-Guard:** NODE_ENV Check (if production -> throw Error) + Warnung bei nicht-localhost DB-URL
- **.env-Hygiene:** Secrets rotieren, .gitignore pruefen, .env.example vollstaendig mit Kommentaren und Kategorien aktualisieren
- **Logging:** console.warn bei Rate-Limit-Hit und fehlgeschlagenen CSRF-Checks (Coolify loggt stdout/stderr)

### Optimistic Locking
- version Number-Feld auf Anfragen-Collection (startet bei 1, admin readOnly)
- beforeChange Hook: prueft ob data.version === existing.version, bei Mismatch: 409 Conflict Error
- Greift bei jeder Bearbeitung (nicht nur Status-Aenderungen)
- UI: Toast-Warnung "Diese Anfrage wurde zwischenzeitlich geaendert" + Reload-Button
- Nur im Admin relevant, Kunden-Dashboard braucht kein Locking

### Claude's Discretion
- Exakte Payload Global Field-Konfiguration (Feldnamen, Validierung)
- Custom Admin Page Layout-Details und Styling
- Payload Migration fuer Cent-Umstellung (Migrationsskript-Struktur)
- Concurrency-Strategie fuer Nummernkreise (Transaction vs. findOneAndUpdate)
- Rate-Limit Store Cleanup-Intervall (Memory-Leak-Praevention)
- CSRF Token Generation und Cookie-Konfiguration (httpOnly, sameSite, secure)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projekt-Spezifikation
- `../../docs/research/005_2026-03-04_architektur-entscheidungen-komplett.md` — Finale Architektur-Entscheidungen (Tech-Stack, Patterns)
- `../../docs/konfigurator/002_2026-02-13_technische-umsetzung.md` — Konfigurator-Technik (Preisberechnung-Kontext)
- `../../docs/konfigurator/004_2026-02-13_cms-struktur.md` — CMS Collections (Preisregeln-Struktur)
- `docs/todos/043_2026-03-27_kundenabsprache-offene-fragen.md` — Offene Business-Fragen (Paraguay-Steuer, Rechnungen, E-Mail-Provider)

### Requirements
- `.planning/REQUIREMENTS.md` §Security (SEC-01 bis SEC-04) — Security-Anforderungen
- `.planning/REQUIREMENTS.md` §Grundlagen (BASE-01 bis BASE-04) — Foundation-Anforderungen

### Bestehender Code (Kontext fuer Migration)
- `src/lib/security.ts` — Bestehender CSRF-Helper (Origin-Check + Double-Submit Token vorbereitet)
- `src/lib/stripe.ts` — Stripe-Integration (Preise aktuell als Float)
- `src/lib/format-currency.ts` — Bestehende Formatierung (muss auf Cent erweitert werden)
- `src/app/api/anfrage/calculate-price/route.ts` — Preisberechnung-API (Float -> Cent Migration)
- `src/seed/index.ts` — Seed-Script (braucht Production-Guard)
- `src/middleware.ts` — Bestehende Middleware (Rate Limiting fuer Login-Route einbauen)
- `src/payload-globals/` — Bestehende Globals (WebhookErrors, Navigation, Footer — Pattern fuer Settings)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/security.ts`: CSRF-Helper mit isSameOriginOrReferer() und validateCsrfToken() — kann direkt erweitert werden
- `src/lib/format-currency.ts`: formatCurrency() und formatPrice() — braucht formatCents() Ergaenzung
- `src/payload-globals/`: 3 bestehende Globals (WebhookErrors, Navigation, Footer) — Pattern fuer Settings Global
- `src/middleware.ts`: Bestehende Middleware — Rate Limiting fuer Login-Route einhaengen
- `src/lib/status-config.ts`: Single Source of Truth Pattern — Vorbild fuer Settings-Konsumenten

### Established Patterns
- Payload Globals fuer systemweite Konfiguration (WebhookErrors, Navigation, Footer)
- Custom Admin Pages mit Inline Styles + admin-custom.css (kein Tailwind im Admin)
- Radix Primitives direkt (kein Shadcn im Admin)
- afterChange/beforeChange Hooks fuer Business-Logik
- Zod-Validierung an API-Boundaries

### Integration Points
- `src/payload.config.ts` globals Array: Settings Global registrieren
- `src/payload.config.ts` collections Array: Nummernkreise Collection registrieren
- Alle 7 Custom API Routes: Rate Limiting + CSRF Wrapper anwenden
- `src/components/admin/status-workflow.tsx`: Version-Feld mitsenden fuer Optimistic Locking
- Navigation Component: System-Dropdown um "Einstellungen" Link erweitern
- Seed-Script: Production-Guard am Anfang einbauen

</code_context>

<specifics>
## Specific Ideas

- "Firma sitzt in Paraguay, primaer Stripe" — Bankverbindung als optionale Felder, Steuer-Situation noch offen
- "Phase 24 baut nur die Infrastruktur (leere Felder), nicht die Business-Logik" — Alles konfigurierbar aber mit sinnvollen Defaults
- "Todo 043 blockiert konkrete Werte" — Felder anlegen, Werte spaeter eintragen
- X-Forwarded-For Header korrekt lesen fuer Reverse Proxy (Coolify auf Netcup VPS)
- /api/users/login ist Payload-Route, braucht Middleware-Approach fuer Rate Limiting
- Custom Admin Page wie anfrage-detail-view und dashboard-overview Pattern

</specifics>

<deferred>
## Deferred Ideas

- E-Mail-Einstellungsseite mit Toggles (ADMN-F01) — v1.5+
- Security-Events Collection fuer auditierbare Logs — spaetere Phase, console.warn reicht erstmal
- Modal mit Diff bei Optimistic Locking Konflikt — uebertrieben fuer aktuelles Volumen
- IP-Blocklisting nach wiederholten Rate-Limit-Hits — nicht noetig fuer aktuelles Threat-Model

</deferred>

---

*Phase: 24-foundation*
*Context gathered: 2026-03-28*
