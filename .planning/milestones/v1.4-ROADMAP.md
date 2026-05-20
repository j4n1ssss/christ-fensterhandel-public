# Roadmap: Christ Fensterhandel Konfigurator

## Milestones

- ✅ **v1.0 MVP** -- Phases 1-6 (shipped 2026-03-10)
- ✅ **v1.1 Admin-Panel Umbau: Profile Hub + UX** -- Phases 7-14 (shipped 2026-03-23)
- ✅ **v1.2 Admin-Navigation Umbau** -- Phases 15-16 (shipped 2026-03-23)
- ✅ **v1.3 Bestellungsflow + Admin UX Redesign** -- Phases 17-23 (shipped 2026-03-27)
- 🚧 **v1.4 Bestellungsflow + Integrationen** -- Phases 24-30 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) -- SHIPPED 2026-03-10</summary>

- [x] **Phase 1: Fundament** - CMS Collections, Seed Data, Projekt-Setup (4/4 plans)
- [x] **Phase 2: Konfigurator-Pipeline** - 10-Step Konfigurator mit konditionaler Ketten-Logik (5/5 plans)
- [x] **Phase 3: Kauffluss** - Warenkorb, Preisberechnung, Anfrage-Absenden (3/3 plans)
- [x] **Phase 4: Dashboards und Rollen** - Admin-Dashboard, Kunden-Portal, Access Control (3/3 plans)
- [x] **Phase 5: Externe Integrationen** - Stripe Payments, N8N Webhooks + E-Mails (2/2 plans)
- [x] **Phase 6: Website und Compliance** - Puck Page Builder, i18n DE/EN, DSGVO (3/3 plans)

</details>

<details>
<summary>✅ v1.1 Admin-Panel Umbau (Phases 7-14) -- SHIPPED 2026-03-23</summary>

- [x] **Phase 7: Data Model Foundation** - Profile-Schema mit 13 Hub-Feldern in Tabs + edit_history Collection (2/2 plans)
- [x] **Phase 8: Migration & Backfill** - erlaubte_farben automatisch befuellen (1/1 plan) -- 2026-03-18
- [x] **Phase 9: Filter Logic Refactor** - Hub-first Filterung mit Feature-Flag (2/2 plans) -- 2026-03-19
- [x] **Phase 10: Undo/Redo** - Session-scoped mit Keyboard-Shortcuts (2/2 plans) -- 2026-03-19
- [x] **Phase 11: Edit-History Hooks + UI** - Editor-Tracking und History-Panel (2/2 plans) -- 2026-03-20
- [x] **Phase 12: QA & Tech-Debt** - Hub-Status Badge, Type-Fixes, Versions-ADR (3/3 plans) -- 2026-03-22
- [x] **Phase 13: Undo Save-Floor Fix + Cleanup** - markSaved() wiring, Doku-Korrektur (1/1 plan) -- 2026-03-22
- [x] **Phase 14: Integration Polish** - UTF-8 Fix, credentials Fix, ROADMAP-Korrektur (1/1 plan) -- 2026-03-23

</details>

<details>
<summary>✅ v1.2 Admin-Navigation Umbau (Phases 15-16) -- SHIPPED 2026-03-23</summary>

- [x] **Phase 15: Core Navigation** - Custom Sidebar mit allen Links, Dropdowns, Untergruppen und WebhookBadge (2/2 plans) -- 2026-03-23
- [x] **Phase 16: Session Persistence + Role Visibility** - Dropdown-Zustand session-persistent, Nav-Links rollenbasiert gefiltert (2/2 plans) -- 2026-03-23

</details>

<details>
<summary>✅ v1.3 Bestellungsflow + Admin UX Redesign (Phases 17-23) -- SHIPPED 2026-03-27</summary>

- [x] **Phase 17: Status-Config Centralization** - status-config.ts als Single Source of Truth, dreifache Duplikation beseitigt (2/2 plans) -- 2026-03-24
- [x] **Phase 18: Statuses, Transitions und Collection-Felder** - 20 Statuse, Transitions, Hersteller/Stornierung-Felder, WebhookPayload-Erweiterung (3/3 plans) -- 2026-03-25
- [x] **Phase 19: Admin Detail View Redesign** - AttentionBar, Splitbutton, 2-Spalten-Layout mit Tabs (4/4 plans) -- 2026-03-25
- [x] **Phase 20: Admin List View Redesign** - Filter-Tabs, Wartezeit-Sortierung, Attention-Score (2/2 plans) -- 2026-03-25
- [x] **Phase 21: Kunden-Dashboard + N8N** - 5-Phasen-Fortschrittsbalken, Kunden-Texte, E-Mail-Trigger (2/2 plans) -- 2026-03-26
- [x] **Phase 22: Integration Fixes + Tech Debt** - formatCurrency Import, Kunden-Texte, Splitbutton-Bug, CSS Cleanup (1/1 plan) -- 2026-03-27
- [x] **Phase 23: Verification + Tracking Closure** - Phase 21 VERIFICATION.md, ADMN-06 Tracking-Fix (1/1 plan) -- 2026-03-27

</details>

### v1.4 Bestellungsflow + Integrationen (In Progress)

**Milestone Goal:** Stripe, N8N E-Mails, PDF-Dokumente (Angebot/Rechnung) und Kunden-Features End-to-End fertigstellen, Security-Grundlagen haerten.

**Phase Numbering:**
- Integer phases (24, 25, ...): Planned milestone work
- Decimal phases (24.1, 24.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 24: Foundation** - Settings Global, MwSt-Berechnung, Nummernkreise, Security-Haertung, Optimistic Locking (completed 2026-03-28)
- [x] **Phase 25: E-Mail-System** - Event-Matrix, React Email Templates, Preview-Route, Idempotency, Event-Queue (completed 2026-03-29)
- [x] **Phase 26: PDF-Infrastruktur** - Angebots-/Rechnungs-/Gutschrift-PDF, Rechnungen-Collection, Download-Integration (completed 2026-03-31)
- [x] **Phase 27: Stripe End-to-End** - Zahlungslink-Automatisierung, Webhooks, Rueckerstattung, Session-Management (completed 2026-04-01)
- [x] **Phase 28: Angebots-Workflow** - Angebots-Erstellung, Versionen, Kunden-Annahme, AGB-Checkbox (completed 2026-04-01)
- [x] **Phase 29: Kunden Self-Service** - Kundenantwort, Stornierungsanfrage, Reklamation, Passwort-Reset (completed 2026-04-02)
- [x] **Phase 30: Admin-Extras** - Webhook-Tab Redesign, Manueller E-Mail-Versand, Server-seitige Pagination (completed 2026-04-03)

## Phase Details

### Phase 24: Foundation
**Goal**: System hat sichere, konfigurierbare Grundlagen fuer alle nachfolgenden Finanz- und Dokument-Features
**Depends on**: Nothing (first phase of v1.4)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, BASE-01, BASE-02, BASE-03, BASE-04
**Success Criteria** (what must be TRUE):
  1. Admin kann in der Einstellungen-Global Firmendaten, MwSt-Satz, Stripe-Config und Dokumenten-Einstellungen pflegen, und Aenderungen wirken sich sofort auf alle Berechnungen aus (kein Cache-Stale)
  2. MwSt-Berechnungen liefern in allen Kontexten (Konfigurator, PDF, Stripe) identische Cent-genaue Ergebnisse ohne Rundungsdifferenzen
  3. Nummernkreise vergeben lueckenlose, fortlaufende Nummern (ANG-YYYY-NNN, RE-YYYY-NNN, GS-YYYY-NNN) auch bei gleichzeitigen Anfragen
  4. Login-Versuche werden nach 5 Fehlversuchen pro Minute geblockt, Anfrage-Submits nach 3 pro Minute, und alle mutierenden Custom-API-Routes haben CSRF-Schutz
  5. Seed-Script verweigert Ausfuehrung wenn NODE_ENV=production, und .env ist nicht in der Git-History
**Plans**: 5 plans

Plans:
- [x] 24-01-PLAN.md -- Settings Global + Custom Admin Page (Firmendaten, Steuer, Stripe, Dokumente)
- [x] 24-02-PLAN.md -- Tax/Cent Library + Nummernkreise Collection + Helpers
- [x] 24-03-PLAN.md -- Rate Limiting + CSRF + Seed Guard + .env Hygiene
- [x] 24-04-PLAN.md -- Optimistic Locking + Cent Migration (all price fields)

### Phase 25: E-Mail-System
**Goal**: System versendet professionelle, template-basierte E-Mails fuer alle 20 Events (18 Business-Events + 2 Future-Slots: kundenantwort, test_preview) ohne Duplikate
**Depends on**: Phase 24 (Firmendaten aus Settings fuer Footer/Impressum)
**Requirements**: MAIL-01, MAIL-02, MAIL-03, MAIL-04, MAIL-05, MAIL-06, MAIL-07, MAIL-08
**Success Criteria** (what must be TRUE):
  1. Fuer jedes der 20 Events in der Event-Matrix (18 Business + 2 Future-Slots) ist definiert, wer die E-Mail erhaelt (Kunde, Mitarbeiter), und der Webhook-Payload enthaelt fertig gerendertes HTML, Betreff, Empfaenger und Idempotency-Key
  2. Alle 9 E-Mail-Templates rendern korrekt mit Logo, Content und Impressum-Footer, und sind ueber /api/email-preview/[template] im Browser pruefbar (fuer Admin und Mitarbeiter)
  3. N8N verarbeitet keine doppelten Events -- Webhook-Retries mit bereits bekanntem Idempotency-Key werden ignoriert
  4. Fehlgeschlagene Webhook-Aufrufe landen in einer persistenten Event-Queue und werden automatisch mit Exponential Backoff bis zu 5x wiederholt
  5. E-Mails werden nur versendet wenn die Empfaenger-Adresse ein gueltiges Format hat -- bei ungueltiger Adresse wird ein Fallback-Eintrag in der Queue protokolliert
**Plans**: 5 plans

Plans:
- [ ] 25-01-PLAN.md -- Types, Event-Matrix, Email Queue Collection, Settings Extension
- [ ] 25-02-PLAN.md -- React Email Components + 11 Templates + Render Orchestrator
- [ ] 25-03-PLAN.md -- Queue Engine + Worker + afterChange Migration + Old Code Cleanup
- [ ] 25-04-PLAN.md -- Preview Routes + Settings E-Mail Tab + N8N Documentation

### Phase 26: PDF-Infrastruktur
**Goal**: System generiert rechtskonforme Geschaeftsdokumente als PDF und archiviert Rechnungen unveraenderbar
**Depends on**: Phase 24 (tax.ts fuer MwSt-Berechnung, Nummernkreise fuer Dokumentennummern, Settings fuer Firmendaten)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06, PDF-07
**Success Criteria** (what must be TRUE):
  1. Angebots-PDF zeigt Konfigurations-Details, Preise (netto + MwSt + brutto), Gueltigkeitsdatum und Widerrufshinweis mit korrekter ANG-Nummer aus dem Nummernkreis
  2. Rechnungs-PDF enthaelt alle 10 Pflichtangaben nach Paragraph 14 UStG (inkl. Steuernummer, fortlaufende RE-Nummer, MwSt-Ausweis) und wird bei Erstellung unveraenderbar in der Rechnungen-Collection gespeichert
  3. Gutschrift-PDF referenziert die Original-Rechnung und traegt eine eigene GS-Nummer
  4. Admin kann PDFs direkt aus der Anfrage-Detail-View herunterladen, Kunden sehen ihre PDFs im Dashboard
  5. N8N Webhook-Payloads enthalten PDFs als Base64-Attachment fuer automatischen E-Mail-Versand
**Plans**: 3 plans

Plans:
- [ ] 26-01-PLAN.md -- PDF Types + Collections + renderPDF Infrastructure
- [ ] 26-02-PLAN.md -- PDF Templates (Angebot/Rechnung/Gutschrift) + Shared Components
- [ ] 26-03-PLAN.md -- API Routes + Auto-Trigger Hooks + Download Integration + N8N Attachment

### Phase 27: Stripe End-to-End
**Goal**: Zahlungsflow funktioniert vollautomatisch von Zahlungslink-Erstellung bis Rueckerstattung ohne manuelle Eingriffe
**Depends on**: Phase 25 (E-Mail-Templates fuer Zahlungslink/Bestaetigung), Phase 26 (Rechnungs-PDF nach Zahlung)
**Requirements**: STRP-01, STRP-02, STRP-03, STRP-04, STRP-05, STRP-06, STRP-07, STRP-08, STRP-09, STRP-10, STRP-11
**Success Criteria** (what must be TRUE):
  1. Wenn Admin den Status auf "zahlungslink_versendet" setzt, wird automatisch eine Stripe Checkout Session erstellt, die URL auf der Anfrage gespeichert, und der Kunde erhaelt eine E-Mail mit Zahlungslink
  2. Admin sieht in der Detail-View den Zahlungslink-Status (offen/bezahlt/abgelaufen), kann den Link kopieren, und bei Ablauf einen neuen erstellen -- wobei maximal eine aktive Session pro Anfrage existiert
  3. Kunden koennen im Dashboard ueber "Jetzt bezahlen" direkt zur Stripe-Checkout-Seite weitergeleitet werden
  4. Nach erfolgreicher Zahlung wird automatisch eine Rechnung generiert, der Status auf "bezahlt" gesetzt, und eine Zahlungsbestaetigung per E-Mail versendet -- auch bei verzoegertem Webhook-Eingang
  5. Admin kann volle oder teilweise Rueckerstattungen ausloesen, der Webhook aktualisiert den Rueckerstattungs-Status, und eine Gutschrift wird automatisch erstellt
**Plans**: 5 plans

Plans:
- [ ] 27-01-PLAN.md -- Stripe Fields + Status Config + stripe.ts + stripe-helpers.ts Foundation
- [ ] 27-02-PLAN.md -- Webhook Expansion (4 Events) + afterChange Refactor + Redirect/Refund/Polling Routes
- [ ] 27-03-PLAN.md -- Kunden Frontend (StripePayButton Refactor + Danke-Seite mit Polling)
- [ ] 27-04-PLAN.md -- Admin UI (ZahlungsPanel + RefundModal + AttentionBar Badge + Splitbutton Guard)

### Phase 28: Angebots-Workflow
**Goal**: Admin kann Angebote erstellen und versenden, Kunden koennen Angebote annehmen und den Bestellprozess fortsetzen
**Depends on**: Phase 26 (Angebots-PDF), Phase 25 (E-Mail-Templates), Phase 27 (Stripe fuer Zahlung nach Annahme)
**Requirements**: ANG-01, ANG-02, ANG-03, ANG-04, ANG-05
**Success Criteria** (what must be TRUE):
  1. Admin kann ueber ein Modal ein Angebot erstellen mit optionaler Preis-Anpassung (Begruendung erforderlich bei Abweichung), Gueltigkeitsdauer und Freitext -- das Modal generiert PDF, aendert den Status und versendet die E-Mail in einem Vorgang
  2. Jede Anfrage hat eine Angebots-Historie mit versionierten Angeboten (V1, V2, V3), und fruehere Versionen bleiben einsehbar
  3. Kunden sehen im Dashboard einen "Angebot annehmen" Button und koennen den Bestellprozess fortsetzen -- der konkrete Annahme-Flow ist konfigurierbar gebaut (Infrastruktur steht, Details koennen spaeter angepasst werden)
  4. Nach Annahme erhaelt der Kunde eine Auftragsbestaetigung per E-Mail mit Zusammenfassung
  5. Das Anfrage-Formular hat eine AGB-Checkbox mit Akzeptanz-Zeitstempel -- der AGB-Text ist als Link/PDF hinterlegt (Platzhalter bis finaler Text vorliegt)
**Plans**: 5 plans

Plans:
- [ ] 28-00-PLAN.md -- Wave 0 Test Stubs (Pricing, Versioning, Annehmen, AGB, Webhook Expiry)
- [ ] 28-01-PLAN.md -- Backend Foundation (Status Transitions, Collection Fields, API Routes, PDF Guard, Webhook Expiry Reset)
- [ ] 28-02-PLAN.md -- Admin UI (AngebotsModal mit Dual-Price-Mode, DokumentePanel Enhancement, Splitbutton Integration)
- [ ] 28-03-PLAN.md -- Kunden Frontend (Public /angebot/[anfrageId] Page, AnnahmeButton, Dashboard Angebots-Bereich, Email Updates)
- [ ] 28-04-PLAN.md -- AGB + Preishinweis (AGB-Checkbox auf Anfrage-Formular, Preishinweis-Texte, AGB Platzhalter-Seite)

### Phase 29: Kunden Self-Service
**Goal**: Kunden koennen selbststaendig auf Rueckfragen antworten, Stornierungen beantragen, Reklamationen einreichen und ihr Passwort zuruecksetzen
**Depends on**: Phase 25 (E-Mail-Templates fuer Passwort-Reset-Mail und Admin-Benachrichtigung bei Kundenantwort)
**Requirements**: KUND-01, KUND-02, KUND-03, KUND-04
**Success Criteria** (what must be TRUE):
  1. Kunden sehen bei Status "rueckfrage" ein Antwort-Formular im Dashboard, koennen eine Nachricht senden, und die Anfrage wechselt automatisch zurueck auf "in_bearbeitung" mit Admin-Benachrichtigung
  2. Kunden koennen eine Stornierung beantragen (Request-Pattern -- KEIN automatisches Stornieren), der Admin sieht die Anfrage und muss bestaetigen oder ablehnen
  3. Kunden koennen eine Reklamation mit bis zu 5 Fotos einreichen, die einer bestehenden Anfrage zugeordnet wird und einen eigenen Status-Flow hat (offen/in_bearbeitung/geloest)
  4. Kunden koennen ueber "Passwort vergessen" einen Reset-Link per E-Mail anfordern und ihr Passwort mit zeitlich begrenztem Token zuruecksetzen
**Plans**: 4 plans

Plans:
- [ ] 29-01-PLAN.md -- Status Foundation (kundenantwort + stornierung_beantragt in alle Maps, Transitions, StatusHistorie anhaenge, Upload-Constants, Tests)
- [ ] 29-02-PLAN.md -- Rueckfrage-Antwort + Stornierung (API Routes, Client Components, Guest Route, StatusBanner Extension)
- [ ] 29-03-PLAN.md -- Reklamation (Collection, API Route, Client Components, Guest Route, Admin-Nav)
- [ ] 29-04-PLAN.md -- Passwort-Reset (Custom UI Pages, Payload Auth Override, Email Template, Login Link)

### Phase 30: Admin-Extras
**Goal**: Admin hat erweiterte Werkzeuge fuer E-Mail-Versand, Webhook-Monitoring und performante Anfragen-Listen
**Depends on**: Phase 25 (E-Mail-Templates fuer manuellen Versand), Phase 27 (Stripe-Integration fuer Webhook-Daten)
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04
**Success Criteria** (what must be TRUE):
  1. Webhook-Tab in der Anfrage-Detail-View zeigt eine chronologische Liste aller Webhooks (Erfolge UND Fehler) mit Details, Stats-Leiste und einem Retry-Button fuer fehlgeschlagene Eintraege
  2. Admin kann aus der Anfrage-Detail-View manuell eine E-Mail versenden (Template-Auswahl, Freitext, optionaler alternativer Empfaenger), und jeder Versand wird in der StatusHistorie protokolliert
  3. Anfragen-Liste nutzt Server-seitige Pagination statt limit=0, und bleibt performant auch bei >500 Anfragen
**Plans**: 4 plans

Plans:
- [ ] 30-00-PLAN.md -- Wave 0 Test Stubs (FreitextEmail, send-email, email-preview, anfragen-list-api, dashboard-stats-api)
- [ ] 30-01-PLAN.md -- Foundation (email_queue Schema, FreitextEmail Template, API Routes, Badge Migration, Retention)
- [ ] 30-02-PLAN.md -- Webhook Tab + Email Send Modal (UI Components, TabPanel Extension, StatusTimeline)
- [ ] 30-03-PLAN.md -- Server-side Pagination + Dashboard Optimization (API Routes, List Refactor, Dashboard Refactor)

## Progress

**Execution Order:**
Phases execute in numeric order: 24 -> 24.1 -> 25 -> 25.1 -> ... -> 30

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fundament | v1.0 | 4/4 | Complete | 2026-03-09 |
| 2. Konfigurator-Pipeline | v1.0 | 5/5 | Complete | 2026-03-09 |
| 3. Kauffluss | v1.0 | 3/3 | Complete | 2026-03-10 |
| 4. Dashboards und Rollen | v1.0 | 3/3 | Complete | 2026-03-10 |
| 5. Externe Integrationen | v1.0 | 2/2 | Complete | 2026-03-10 |
| 6. Website und Compliance | v1.0 | 3/3 | Complete | 2026-03-10 |
| 7. Data Model Foundation | v1.1 | 2/2 | Complete | 2026-03-18 |
| 8. Migration & Backfill | v1.1 | 1/1 | Complete | 2026-03-18 |
| 9. Filter Logic Refactor | v1.1 | 2/2 | Complete | 2026-03-19 |
| 10. Undo/Redo | v1.1 | 2/2 | Complete | 2026-03-19 |
| 11. Edit-History Hooks + UI | v1.1 | 2/2 | Complete | 2026-03-20 |
| 12. QA & Tech-Debt | v1.1 | 3/3 | Complete | 2026-03-22 |
| 13. Undo Save-Floor Fix | v1.1 | 1/1 | Complete | 2026-03-22 |
| 14. Integration Polish | v1.1 | 1/1 | Complete | 2026-03-23 |
| 15. Core Navigation | v1.2 | 2/2 | Complete | 2026-03-23 |
| 16. Session Persistence + Role Visibility | v1.2 | 2/2 | Complete | 2026-03-23 |
| 17. Status-Config Centralization | v1.3 | 2/2 | Complete | 2026-03-24 |
| 18. Statuses, Transitions, Fields | v1.3 | 3/3 | Complete | 2026-03-25 |
| 19. Admin Detail View Redesign | v1.3 | 4/4 | Complete | 2026-03-25 |
| 20. Admin List View Redesign | v1.3 | 2/2 | Complete | 2026-03-25 |
| 21. Kunden-Dashboard + N8N | v1.3 | 2/2 | Complete | 2026-03-26 |
| 22. Integration Fixes + Tech Debt | v1.3 | 1/1 | Complete | 2026-03-27 |
| 23. Verification + Tracking Closure | v1.3 | 1/1 | Complete | 2026-03-27 |
| 24. Foundation | v1.4 | 4/4 | Complete | 2026-03-28 |
| 25. E-Mail-System | v1.4 | 4/4 | Complete | 2026-03-29 |
| 26. PDF-Infrastruktur | v1.4 | 3/3 | Complete | 2026-03-31 |
| 27. Stripe End-to-End | v1.4 | 5/5 | Complete | 2026-04-01 |
| 28. Angebots-Workflow | v1.4 | 5/5 | Complete | 2026-04-01 |
| 29. Kunden Self-Service | v1.4 | 4/4 | Complete | 2026-04-02 |
| 30. Admin-Extras | 4/4 | Complete    | 2026-04-03 | - |

---
_For full phase details of completed milestones see: `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.1-ROADMAP.md`, `.planning/milestones/v1.2-ROADMAP.md`, and `.planning/milestones/v1.3-ROADMAP.md`_
