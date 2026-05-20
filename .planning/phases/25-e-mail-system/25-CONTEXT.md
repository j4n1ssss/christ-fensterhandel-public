# Phase 25: E-Mail-System - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

System versendet professionelle, template-basierte E-Mails fuer alle 18+ Business-Events ohne Duplikate. Umfasst: React Email Templates mit Base-Layout, Event-Matrix als TypeScript Config, persistente Event-Queue mit Exponential Backoff Retry, Idempotency-Keys, Admin-Preview-Route mit Test-Send, N8N als reiner Mail-Transport (App rendert HTML), und Migration des bestehenden Webhook-Systems auf Queue-basierte Architektur.

Kein eigener E-Mail-Provider — N8N bleibt Mail-Transport. Keine neuen Status oder Transitions. Keine Kunden-Self-Service Features (Phase 29).

</domain>

<decisions>
## Implementation Decisions

### Template-Technologie
- React Email fuer alle Templates (JSX-Komponenten, TypeScript-typisiert, SSR zu HTML)
- Templates in `src/emails/` als eigener Top-Level Ordner
- Base-Layout Komponente (`base-layout.tsx`) mit Header (Logo) + Footer (Firmendaten aus Settings, Impressum, Datenschutz)
- 9 Kunden-Templates + separate schlichtere Mitarbeiter-Templates wo noetig
- Wiederverwendbare Email-Components: Button, Anfrage-Card, Status-Badge in `src/emails/components/`
- Marken-konsistentes Design basierend auf `.design/STYLE-GUIDE.md` (Farben, Logo, CTA-Buttons in Markenfarbe)
- E-Mail-sichere Fonts (Arial/Helvetica als Fallback)
- Kein Dark Mode (inkonsistent zwischen Clients, Aufwand-Nutzen schlecht)
- Nur deutsche E-Mails (Zielgruppe DE/AT)
- HTML + Plain-Text Rendering (React Email `render({ plainText: true })`) fuer bessere Spam-Scores
- Kontextabhaengige CTA-Buttons (Zahlungslink: "Jetzt bezahlen", Angebot: "Angebot ansehen", Status-Updates: "Anfrage ansehen")
- Kompakte Anfrage-Details in relevanten Mails (Produktliste mit Name, Menge, Einzelpreis + Gesamtbetrag)
- Footer dynamisch aus Settings Global via getSettings() (Firmenname, Adresse, Kontakt)

### Event-Matrix & Empfaenger
- Alle 20 Statuse in der Event-Matrix abgedeckt (auch die ohne E-Mail-Aktion)
- 18+ spezifische `EmailEventType` Union Types (nicht mehr nur 3 generische event_types)
- Zukunfts-Events vordefiniert (z.B. 'kundenantwort' fuer Phase 29) — Slot angelegt, noch nicht verdrahtet
- TypeScript Config `src/lib/email/event-matrix.ts` als Single Source of Truth (wie status-config.ts Pattern)
- Map von Event → { empfaenger: ['kunde'|'staff'], templates: { kunde, staff }, betreff: { kunde, staff } }
- Betreff als Template-Strings mit Variablen: `'Anfrage #{anfrage_nummer} bestaetigt'`
- render-subject Funktion ersetzt `#{variable}` Platzhalter
- Gleiche Mail an Mitarbeiter + Admin (kein Admin-Extra-Kanal)
- Konfigurierbarer Staff-Verteiler: Textarea-Feld `benachrichtigungs_emails` in Settings Global (komma-getrennt, Zod-validiert)
- Event-Toggles in Settings (JSON-Feld `email_event_toggles`): Admin kann pro Event+Empfaenger ein/ausschalten ohne Deployment
- Alle Events default: enabled (true)

### Event-Queue & Retry
- Neue Payload Collection `email_queue` mit Feldern: event_type, payload_data (JSON), status (pending/processing/sent/failed/dead), attempts, max_attempts (default 5), next_retry_at, idempotency_key (unique), error_log, created_at
- Queue ersetzt bestehende webhook_errors Global und sendN8NWebhook() komplett — ein System fuer alles
- Cron-basierter Worker via `instrumentation.ts` register() Hook — setInterval alle 60 Sekunden
- Exponential Backoff: 1min, 2min, 4min, 8min, 16min — nach 5 Versuchen Status 'dead'
- HTML wird beim Queuing gerendert (Daten-Snapshot zum Event-Zeitpunkt), nicht erst beim Processing
- Single-Worker reicht (ein Docker Container auf Coolify, < 100 Events/Tag)
- Cleanup: 'sent' Events nach 30 Tagen automatisch loeschen, 'dead' Events bleiben fuer manuelle Pruefung
- Admin kann 'dead' Events manuell retrien (Retry-Button in Admin, setzt auf 'pending' zurueck)
- Queue sichtbar im Admin Panel unter System-Dropdown (ersetzt 'Webhook Fehler' Link)
- Idempotency-Key: `${anfrageId}_${eventType}_${statusNeu}_${timestamp}` — unique constraint auf DB-Ebene
- E-Mail-Validierung vor Queuing: Zod `z.string().email()` — ungueltige Adressen bekommen Queue-Eintrag mit status='skipped'

### afterChange Hook Flow
1. Status aendert sich → afterChange feuert
2. Event-Matrix Lookup → Template + Empfaenger bestimmen
3. Event-Toggles pruefen (Settings) → ggf. skippen
4. E-Mail-Validierung der Empfaenger
5. React Email Template rendern → HTML + Plain-Text String
6. Queue-Eintrag erstellen: { html, subject, to, event_type, idempotency_key, status: 'pending' }
7. Hook kehrt zurueck (non-blocking)

### Queue Worker Flow
1. Pending/Failed Events holen (WHERE status='pending' OR (status='failed' AND next_retry_at < now))
2. Status auf 'processing' setzen
3. POST an N8N_EMAIL_WEBHOOK_URL: { to, subject, html, plain_text, reply_to }
4. Erfolg: status='sent' | Fehler: attempts++, status='failed', next_retry_at berechnen
5. Bei attempts >= max_attempts: status='dead'
6. Cleanup: 'sent' Events aelter als 30 Tage loeschen

### N8N Workflow-Architektur
- Ein einziger N8N Eingangs-Workflow fuer E-Mail-Versand (App rendert HTML, N8N ist nur Transport)
- Neue separate .env Variable: N8N_EMAIL_WEBHOOK_URL (getrennt von alter N8N_WEBHOOK_URL)
- N8N Workflow: Webhook Trigger → Send Email Node (to, subject, html, plain_text, reply_to) → Respond
- Nur E-Mail-Versand in Phase 25, kein Multi-Channel (Slack etc.)
- N8N-Setup-Dokumentation als Markdown in `docs/wissen/n8n-email-setup.md` (MAIL-06)

### Webhook-Payload Struktur
- Komplett neues `EmailEventPayload` Interface in `src/lib/email/types.ts` (kein R\u00fcckw\u00e4rtskompatibilitaet)
- Payload enthaelt: event_type, anfrage_id, anfrage_nummer, status, kunde, produkte (Array), gesamtbetrag_cents, email (gerendert), idempotency_key, customer_facing, kunden_text, kunden_phase
- An N8N gesendet: nur Email-Felder { to, subject, html, plain_text, reply_to }
- Restliche Daten bleiben in der Queue fuer Logging/Debug

### Preview & Testing
- API Route `/api/email-preview/[template]` mit Mock-Daten (Admin-geschuetzt)
- Template-Index Seite unter `/api/email-preview` — listet alle Templates mit Links
- Query-Parameter fuer Varianten: `?status=bezahlt`, `?status=storniert`
- Test-Send Button: vorausgefuellt mit Admin-E-Mail des eingeloggten Users, editierbar, Rate Limited (5/min)
- Test-Send laeuft ueber Queue (echtes E2E) — Queue-Eintrag mit event_type='test_preview'
- HTML + Plain-Text beide previewbar

### Settings-Erweiterung
- Neuer 5. Tab 'E-Mail' auf Custom Admin Page (neben Firmendaten, Steuer, Stripe, Dokumente)
- Bestehende E-Mail-Felder (email_absender_name, email_reply_to, email_signatur) in den neuen Tab verschieben
- Neue Felder: benachrichtigungs_emails (Textarea, komma-getrennt), email_event_toggles (JSON)
- Event-Toggles UI: Checkboxen pro Event+Empfaenger auf der Custom Admin Page

### Migration & Cleanup (Big Bang)
- sendN8NWebhook() durch queueEmailEvent() ersetzen
- webhook_errors Global komplett loeschen (Datei + Config + Navigation)
- n8n-webhook.ts komplett loeschen
- WebhookPayload Interface durch EmailEventPayload ersetzen
- Navigation: 'Webhook Fehler' → 'E-Mail Queue'
- payload.config.ts: email_queue Collection registrieren, webhook_errors entfernen
- .env: N8N_EMAIL_WEBHOOK_URL hinzufuegen, alte N8N_WEBHOOK_URL als deprecated markieren

### Claude's Discretion
- Exakte React Email Component-Struktur und Styling
- Mock-Daten Format und Varianten-Abdeckung
- Queue Worker Error-Handling Details
- instrumentation.ts Implementierungsdetails
- Retry-Button Custom Component Implementierung
- Template-Index HTML Layout
- Event-Matrix Betreff-Texte (deutscher Wortlaut)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### E-Mail Requirements
- `.planning/REQUIREMENTS.md` -- MAIL-01 bis MAIL-08 (Event-Matrix, Templates, Preview, Idempotency, Queue, Doku, Validierung)

### E-Mail Planung (Todos)
- `docs/todos/028_2026-03-27_email-event-matrix.md` -- Event-Matrix Entwurf (18 Events, Empfaenger-Zuordnung, offene Fragen)
- `docs/todos/030_2026-03-27_email-html-templates-styleguide.md` -- Template-Anforderungen, Style Guide, Struktur
- `docs/todos/029_2026-03-27_n8n-setup-testing-anleitung.md` -- N8N Setup, Testing-Checkliste, Edge Cases, Provider-Config

### Status-System (Source of Truth)
- `src/lib/status-config.ts` -- EMAIL_TRIGGER_STATUSES (14 Kunden-facing), isCustomerFacing(), StatusKey Type, STATUS_CUSTOMER_TEXT
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS (welche Wechsel moeglich sind)

### Bestehender Webhook-Code (wird migriert)
- `src/lib/n8n-webhook.ts` -- WebhookPayload Interface, sendN8NWebhook(), trackWebhookError() — wird komplett ersetzt
- `src/collections/business/anfragen.ts` -- afterChange Hook mit sendN8NWebhook() Aufrufen — wird auf queueEmailEvent() umgestellt
- `src/payload-globals/webhook-errors.ts` -- webhook_errors Global — wird geloescht

### Settings (Phase 24 Infrastruktur)
- `src/payload-globals/settings.ts` -- Settings Global mit vorbereiteten E-Mail-Feldern (email_absender_name, email_reply_to, email_signatur)
- `src/components/admin/settings-view.tsx` -- Custom Admin Page mit 4 Tabs — bekommt 5. Tab 'E-Mail'

### Design
- `.design/STYLE-GUIDE.md` -- Farben, Fonts, Logo fuer marken-konsistentes E-Mail-Design

### Vorherige Phase-Contexts
- `.planning/phases/21-kunden-dashboard-n8n/21-CONTEXT.md` -- N8N-Webhook feuert bei JEDEM Status, customer_facing Flag, Kunden-Text-Mapping
- `.planning/phases/24-foundation/24-CONTEXT.md` -- Settings Global Struktur, E-Mail-Felder vorbereitet, getSettings() Helper

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getSettings()` (lib/settings.ts): Liest Settings Global — fuer Footer-Firmendaten und E-Mail-Config
- `STATUS_CUSTOMER_TEXT` (status-config.ts): Kunden-Texte fuer alle 20 Statuse — direkt in Templates nutzbar
- `EMAIL_TRIGGER_STATUSES` (status-config.ts): Liste der 14 Kunden-facing Statuse — Basis fuer Event-Matrix
- `isCustomerFacing()` (status-config.ts): Helper fuer customer_facing Flag
- `formatCents()` (lib/format-currency.ts): Cent-Formatierung aus Phase 24 — fuer Preise in E-Mails
- `getNextNumber()` (lib/nummernkreise.ts): Nummernkreise-Helper — nicht direkt gebraucht, aber Referenz fuer Idempotency-Key Pattern

### Established Patterns
- Payload Collections fuer persistente Daten (email_queue folgt bestehendem Pattern)
- Payload Globals fuer systemweite Config (Settings, Footer, Navigation)
- Custom Admin Pages mit Inline Styles + admin-custom.css (fuer Settings E-Mail Tab)
- afterChange Hooks fuer Business-Logik (anfragen.ts — wird auf Queue umgestellt)
- Zod-Validierung an API-Boundaries (fuer E-Mail-Validierung und Preview-Route)
- TypeScript Config als Single Source of Truth (status-config.ts Pattern fuer event-matrix.ts)
- instrumentation.ts fuer Server-Side Init (Queue Worker)

### Integration Points
- `src/collections/business/anfragen.ts` afterChange Hook: sendN8NWebhook() → queueEmailEvent()
- `src/payload.config.ts`: email_queue Collection registrieren, webhook_errors Global entfernen
- `src/payload-globals/settings.ts`: Neue Felder (benachrichtigungs_emails, email_event_toggles)
- `src/components/admin/settings-view.tsx`: 5. Tab 'E-Mail' hinzufuegen
- `src/components/admin/navigation.tsx`: 'Webhook Fehler' → 'E-Mail Queue', 'E-Mail Preview' Link hinzufuegen
- `src/instrumentation.ts`: Queue Worker starten (neu erstellen)
- `.env` / `.env.example`: N8N_EMAIL_WEBHOOK_URL hinzufuegen

</code_context>

<specifics>
## Specific Ideas

- N8N ist nur Mail-Transport — App rendert HTML komplett, N8N muss nur noch senden (simpelster N8N Workflow moeglich)
- Preview-Route Test-Send Button: vorausgefuellt mit eingeloggter Admin-E-Mail, editierbar, Rate Limited (5/min) — Mix aus Sicherheit und Flexibilitaet
- Event-Toggles erlauben Admin einzelne E-Mails zu deaktivieren ohne Code-Deployment — wichtig fuer Testphase und Feinsteuerung
- Big Bang Migration: Altes Webhook-System komplett durch Queue ersetzen — noch nicht in Produktion, kein Kompatibilitaets-Risiko
- Produkte direkt im Payload (nicht per Callback): Template bekommt alle Daten beim Rendering, N8N braucht keinen API-Zugang
- Event-Matrix Betreff mit Template-Strings: `#{anfrage_nummer}` Platzhalter — informativ und konsistent

</specifics>

<deferred>
## Deferred Ideas

- E-Mail-Einstellungsseite als eigene Page (v1.5+) — Phase 25 nutzt den Settings E-Mail Tab
- Kunden-Antwort auf Rueckfrage E-Mail (Phase 29: Kunden Self-Service)
- Kunden-Stornierung E-Mail (Phase 29: Kunden Self-Service)
- Kunden-Reklamation mit Fotos E-Mail (Phase 29: Kunden Self-Service)
- N8N Multi-Channel (Slack, Push, SMS) — aktuell nur E-Mail
- E-Mail Bounce-Handling (Hard/Soft Bounce Logik in N8N)
- SPF/DKIM/DMARC automatische Validierung — Doku reicht erstmal
- E-Mail-Templates als CMS-Collection (editierbar ohne Deployment) — uebertrieben fuer aktuelles Volumen
- Taegliche Zusammenfassung statt Einzel-Mails — nicht angefragt
- Gast-Tracking E-Mails (Anfrage-Status ohne Login) — v2

</deferred>

---

*Phase: 25-e-mail-system*
*Context gathered: 2026-03-29*
