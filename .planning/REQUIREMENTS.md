# Requirements: Christ Fensterhandel v1.4

**Defined:** 2026-03-27
**Core Value:** Kunden konfigurieren Fenster/Tueren Schritt fuer Schritt mit intelligenter Hub-Filterung -- Christ bekommt strukturierte Anfragen ins Dashboard

## v1.4 Requirements

Requirements fuer Milestone v1.4 Bestellungsflow + Integrationen. Jedes Requirement mappt zu einer Roadmap-Phase.

### Security

- [x] **SEC-01**: Admin kann .env aus Git-History entfernen, alle Secrets rotieren und .env.example bereitstellen
- [x] **SEC-02**: System hat Rate Limiting auf Login (5/min), Anfrage-Submit (3/min), Status-Pruefen (10/min), Rabattcode (10/min)
- [x] **SEC-03**: Alle mutierenden API-Routes haben CSRF-Schutz (nicht nur Stripe Checkout)
- [x] **SEC-04**: Seed-Script bricht in Production ab (NODE_ENV-Guard)

### Grundlagen

- [x] **BASE-01**: Einstellungen als Payload Global (Firmendaten, MwSt-Satz, Stripe-Config, Zahlungslink-Ablaufzeit, Angebots-Gueltigkeit)
- [x] **BASE-02**: Zentrale MwSt-Berechnung in lib/tax.ts (Cent-Integer-Arithmetik, konfigurierbarer Satz aus Settings)
- [x] **BASE-03**: Nummernkreise als Counter-Table (ANG-YYYY-NNN, RE-YYYY-NNN, GS-YYYY-NNN -- fortlaufend, lueckenlos)
- [x] **BASE-04**: Optimistic Locking bei Status-Aenderung (Versionsnummer auf Anfrage, Konflikt-Warnung bei gleichzeitiger Bearbeitung)

### E-Mail-System

- [x] **MAIL-01**: E-Mail Event-Matrix als Config (20 Events: 18 Business-Events + 2 Future-Slots mit Empfaenger-Mapping: Kunde/Mitarbeiter)
- [x] **MAIL-02**: React Email Base-Layout (Logo, Content-Slot, Footer mit Impressum + Datenschutz)
- [x] **MAIL-03**: 9 E-Mail-Templates (Bestaetigung, Status-Update, Angebot, Zahlungslink, Zahlung, Stornierung, Rueckfrage, Reklamation, Rueckerstattung)
- [x] **MAIL-04**: E-Mail-Preview Route (/api/email-preview/[template], Staff-geschuetzt: admin + mitarbeiter)
- [x] **MAIL-05**: N8N Idempotency-Keys zur Duplikat-Praevention bei Webhook-Retries
- [x] **MAIL-06**: N8N Setup-Dokumentation (Testing-Checkliste, Provider-Wechsel, Webhook-URLs)
- [x] **MAIL-07**: E-Mail-Validierung vor Webhook-Versand (Format + nicht leer, Fallback wenn ungueltig)
- [x] **MAIL-08**: Persistente Event-Queue fuer N8N (DB-basiert, Retry mit Exponential Backoff, max 5 Versuche)

### PDF-Dokumente

- [x] **PDF-01**: PDF-Infrastruktur mit @react-pdf/renderer (lib/pdf/, API-Route)
- [x] **PDF-02**: Angebots-PDF mit Konfiguration, Preisen (netto+MwSt+brutto), Gueltigkeit, Widerrufshinweis
- [x] **PDF-03**: Rechnungs-PDF nach §14 UStG (10 Pflichtangaben inkl. Steuernummer, Zahlungsvermerk)
- [x] **PDF-04**: Gutschrift-PDF bei Rueckerstattung (GS-Nummer, Referenz auf Original-Rechnung)
- [x] **PDF-05**: Rechnungen Collection (immutable -- kein Update/Delete, Archivierungspflicht)
- [x] **PDF-06**: PDF-Download in Admin + Kunden-Dashboard
- [x] **PDF-07**: PDF als Base64-Attachment im N8N Webhook Payload

### Stripe/Zahlungen

- [x] **STRP-01**: Automatische Checkout Session bei Status "zahlungslink_versendet" (afterChange Hook)
- [x] **STRP-02**: Stripe-Felder auf Anfrage (checkout_url, session_id, payment_intent_id, expires_at)
- [x] **STRP-03**: Zahlungslink in Admin-Detail-View (sichtbar, kopierbar, Status offen/bezahlt/abgelaufen)
- [x] **STRP-04**: "Jetzt bezahlen" Button im Kunden-Dashboard mit Stripe-Weiterleitung
- [x] **STRP-05**: Session Expiry + Regenerierung (checkout.session.expired Webhook, Admin kann neuen Link erstellen)
- [x] **STRP-06**: Doppelzahlung verhindern (max 1 aktive Session pro Anfrage)
- [x] **STRP-07**: Webhook-Idempotenz + Transition-Validierung fuer 4 Event-Types
- [x] **STRP-08**: Rueckerstattung ueber Stripe API (voll + teilweise, Admin-triggered)
- [x] **STRP-09**: charge.refunded + charge.dispute.created Webhook-Handler
- [x] **STRP-10**: zahlung_eingegangen Event an N8N + console.log Cleanup
- [x] **STRP-11**: Stripe Customer-Objekt erstellen und mit Kunden-E-Mail verknuepfen (Zahlungshistorie)

### Angebots-Workflow

- [x] **ANG-01**: "Angebot erstellen" Modal in Admin (Konfiguration, Preis-Anpassung mit Begruendung, Gueltigkeit, Freitext)
- [x] **ANG-02**: Angebots-Historie mit Versionen (V1, V2, V3 pro Anfrage)
- [x] **ANG-03**: Angebots-Annahme Infrastruktur im Kunden-Dashboard (Button + Status-Wechsel, konkreter Flow konfigurierbar)
- [x] **ANG-04**: Auftragsbestaetigung nach Annahme (E-Mail mit Zusammenfassung)
- [x] **ANG-05**: AGB-Checkbox auf Anfrage-Formular (Akzeptanz-Zeitstempel, AGB als Link/PDF)

### Kunden-Features

- [x] **KUND-01**: Kundenantwort auf Rueckfrage (Formular im Dashboard, Nachricht an Anfrage, Admin-Benachrichtigung)
- [x] **KUND-02**: Stornierungsanfrage durch Kunden (Request-Pattern, Admin muss bestaetigen)
- [x] **KUND-03**: Reklamation Collection mit Fotos (Status offen/in_bearbeitung/geloest, Zuordnung zu Anfrage)
- [x] **KUND-04**: Passwort-Reset-Flow (vergessen-Link, Token mit Ablauf, E-Mail)

### Admin-Features

- [x] **ADMN-01**: Webhook-Tab Redesign (chronologische Liste, Details, Retry-Button, Stats-Leiste)
- [x] **ADMN-02**: Manueller E-Mail-Versand aus Anfrage-Detail-View (Template-Auswahl, Freitext, alternative Empfaenger)
- [x] **ADMN-03**: Webhook-Logging erweitern (auch Erfolge loggen, nicht nur Fehler)
- [x] **ADMN-04**: Server-seitige Pagination fuer Anfragen-Liste (ersetze limit=0, Offset-Pagination, Dashboard-Optimierung)

## Future Requirements

Deferred to v1.5+. Tracked but not in current roadmap.

### Admin UX

- **ADMN-F01**: E-Mail-Einstellungsseite mit aktiv/inaktiv Toggles pro Event
- **ADMN-F02**: Taegliche Zusammenfassungs-Mails (Digest statt Einzel-Mails)
- **ADMN-F03**: In-App Benachrichtigungen fuer Admin/Mitarbeiter
- **ADMN-F04**: Attention-Score Gewichtungen in Settings konfigurierbar

### Stripe

- **STRP-F01**: Stripe Live-Modus Setup + Umschaltung
- **STRP-F02**: Weitere Zahlungsarten (SEPA, PayPal)
- **STRP-F03**: Teilzahlungen / Anzahlungs-Flow

### Integrationen

- **INTG-F01**: Hersteller-Bestell-Automatisierung (aktuell manuell)
- **INTG-F02**: SPF/DKIM/DMARC DNS-Setup Dokumentation
- **INTG-F03**: N8N Webhook Secret Rotation ohne Downtime

## Out of Scope

| Feature | Reason |
|---------|--------|
| E-Rechnung/XRechnung | Erst ab 2027 fuer B2B relevant, Christ ist B2C |
| Hersteller-Portal | Eigenes System, manueller Prozess reicht |
| Metriken-Dashboard | Separate Anforderung, nicht Teil des Bestellungsflows |
| Gast-Tracking | Nicht Teil des aktuellen Scopes |
| Drutex API-Integration | Kommt nach v1.4 (manuelle Bestellung) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 24: Foundation | Complete |
| SEC-02 | Phase 24: Foundation | Complete |
| SEC-03 | Phase 24: Foundation | Complete |
| SEC-04 | Phase 24: Foundation | Complete |
| BASE-01 | Phase 24: Foundation | Complete |
| BASE-02 | Phase 24: Foundation | Complete |
| BASE-03 | Phase 24: Foundation | Complete |
| BASE-04 | Phase 24: Foundation | Complete |
| MAIL-01 | Phase 25: E-Mail-System | Complete |
| MAIL-02 | Phase 25: E-Mail-System | Complete |
| MAIL-03 | Phase 25: E-Mail-System | Complete |
| MAIL-04 | Phase 25: E-Mail-System | Complete |
| MAIL-05 | Phase 25: E-Mail-System | Complete |
| MAIL-06 | Phase 25: E-Mail-System | Complete |
| MAIL-07 | Phase 25: E-Mail-System | Complete |
| MAIL-08 | Phase 25: E-Mail-System | Complete |
| PDF-01 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-02 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-03 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-04 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-05 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-06 | Phase 26: PDF-Infrastruktur | Complete |
| PDF-07 | Phase 26: PDF-Infrastruktur | Complete |
| STRP-01 | Phase 27: Stripe End-to-End | Complete |
| STRP-02 | Phase 27: Stripe End-to-End | Complete |
| STRP-03 | Phase 27: Stripe End-to-End | Complete |
| STRP-04 | Phase 27: Stripe End-to-End | Complete |
| STRP-05 | Phase 27: Stripe End-to-End | Complete |
| STRP-06 | Phase 27: Stripe End-to-End | Complete |
| STRP-07 | Phase 27: Stripe End-to-End | Complete |
| STRP-08 | Phase 27: Stripe End-to-End | Complete |
| STRP-09 | Phase 27: Stripe End-to-End | Complete |
| STRP-10 | Phase 27: Stripe End-to-End | Complete |
| STRP-11 | Phase 27: Stripe End-to-End | Complete |
| ANG-01 | Phase 28: Angebots-Workflow | Complete |
| ANG-02 | Phase 28: Angebots-Workflow | Complete |
| ANG-03 | Phase 28: Angebots-Workflow | Complete |
| ANG-04 | Phase 28: Angebots-Workflow | Complete |
| ANG-05 | Phase 28: Angebots-Workflow | Complete |
| KUND-01 | Phase 29: Kunden Self-Service | Complete |
| KUND-02 | Phase 29: Kunden Self-Service | Complete |
| KUND-03 | Phase 29: Kunden Self-Service | Complete |
| KUND-04 | Phase 29: Kunden Self-Service | Complete |
| ADMN-01 | Phase 30: Admin-Extras | Complete |
| ADMN-02 | Phase 30: Admin-Extras | Complete |
| ADMN-03 | Phase 30: Admin-Extras | Complete |
| ADMN-04 | Phase 30: Admin-Extras | Complete |

**Coverage:**
- v1.4 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-04-03 after Phase 30 plan revision (ADMN-01 scope narrowed per CONTEXT.md: Filtering/Erfolgsrate deferred to ADMN-F04; ADMN-04 clarified as offset-pagination)*
