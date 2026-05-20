# Phase 27: Stripe End-to-End - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Zahlungsflow funktioniert vollautomatisch von Zahlungslink-Erstellung bis Rueckerstattung ohne manuelle Eingriffe. Umfasst: Automatische Checkout-Session bei Status-Wechsel, Stripe-Felder auf Anfrage, Zahlungslink-Anzeige im Admin (AttentionBar + Panel), Kunden-Bezahl-Button mit Redirect-Route, Danke-Seite mit Polling, Session-Expiry mit Auto-Regenerierung, Rueckerstattungs-Modal (voll + teil) mit doppelter Bestaetigung, 4 Webhook-Handler (completed, expired, refunded, dispute), Stripe Customer-Verknuepfung, und strukturiertes Logging.

Kein Angebots-Erstellungs-Modal (Phase 28), kein manueller E-Mail-Versand (Phase 30), kein Kunden-Self-Service (Phase 29).

</domain>

<decisions>
## Implementation Decisions

### Admin Zahlungslink-Anzeige
- Kombinierte Darstellung: Kompakter Status in AttentionBar (farbcodiertes Badge + Kopier-Icon fuer URL) PLUS separater Zahlungs-Panel in der rechten Spalte mit allen Details und Aktionen
- AttentionBar Badge-Farben: Gruen=bezahlt, Gelb=offen, Rot=abgelaufen, Lila=rueckerstattet
- Zahlungs-Panel sichtbar ab Status "zahlungslink_versendet" und bei allen Folge-Status (bezahlt, an_hersteller, etc.), NICHT bei fruehen Status (neu, in_bearbeitung, angebot_versendet, bestaetigt)
- Panel zeigt: Status-Badge, Zahlungslink (kopierbar), Ablaufdatum, Betrag
- Aufklappbarer Detail-Bereich im Panel: Session-ID, Payment-Intent-ID, Stripe Customer-ID (als klickbarer Link zum Stripe Dashboard)
- Stripe Dashboard Link: Automatisch korrekte URL (test.stripe.com im Test-Modus, dashboard.stripe.com im Live-Modus, Erkennung via STRIPE_SECRET_KEY Prefix)
- "Neuen Link erstellen" Button direkt im Zahlungs-Panel bei abgelaufenem Link
- Bei Regenerierung wird automatisch eine neue Zahlungslink-E-Mail gequeued
- Preis-Guard: Status-Wechsel auf "zahlungslink_versendet" wird blockiert wenn gesamtpreis = 0 oder null
- Kein manueller E-Mail-Versand-Button fuer Zahlungslink — kommt in Phase 30 (generischer manueller Versand)

### Checkout-Session Konfiguration
- Ablaufzeit aus Settings Global (stripe_zahlungslink_ablauf_stunden, Default 24h)
- Waehrung aus Settings Global (stripe_waehrung, Default EUR)
- Stripe waehlt automatisch passende Zahlungsarten basierend auf Locale und Waehrung

### Redirect-Route & E-Mail-Links
- E-Mails enthalten KEINE direkte Stripe URL, sondern /api/stripe/redirect/[anfrageId]
- Redirect-Route prueft Session-Status und regeneriert automatisch bei abgelaufener Session
- Nur Status "zahlungslink_versendet" gilt als zahlbar
- Bei nicht-zahlbarem Status: Redirect zu Fehler-Seite (/zahlung/fehler)
- Redirect-Route braucht keinen Login — UUID ist kryptographisch random, Rate Limited (5/min pro IP)
- Bestehende POST /api/stripe/checkout Route wird ENTFERNT und durch GET Redirect-Route ersetzt

### Danke-Seite & Post-Payment UX
- Eigene Route /zahlung/[status] (erfolgreich, abgebrochen, fehler) — noindex
- Login-Awareness: Eingeloggt = "Zurueck zum Dashboard" Button auf Anfrage-Detail. Nicht eingeloggt = "Rechnung per E-Mail" Info-Text
- Bei Abbruch: Eingeloggt = "Erneut bezahlen" Button. Nicht eingeloggt = "Zahlungslink in Ihrer E-Mail" Hinweis
- Polling auf der Danke-Seite: GET /api/stripe/payment-status?session_id=cs_... alle 2 Sekunden
- Phase 1 (0-30 Sek): Spinner + "Zahlung wird verarbeitet..."
- Phase 2 (Status bezahlt): Gruener Banner "Zahlung erfolgreich!"
- Phase 3 (Timeout 30 Sek): "Zahlung eingegangen! Verarbeitung kann einen Moment dauern. Rechnung kommt per E-Mail."
- Danke-Seite ist oeffentlich zugaenglich mit Session-ID als Auth-Token (aus Stripe Redirect URL-Param)

### Post-Payment Webhook Flow
- Sequenziell im afterChange Hook: Webhook setzt Status auf "bezahlt" + speichert payment_intent_id → afterChange: 1. Rechnung generieren (renderPDF) 2. Zahlungsbestaetigung + Rechnung per E-Mail queuen 3. Staff-E-Mail queuen (zahlung_eingegangen)
- checkout.session.expired: Nur stripe_payment_status auf "abgelaufen" setzen, Badge wird rot, "Neuen Link erstellen" Button erscheint. Keine E-Mail an Admin oder Kunden
- charge.dispute.created: stripe_payment_status auf "dispute" setzen + Staff-E-Mail sofort senden (zeitkritisch wegen Antwort-Frist). Kein eigener Anfrage-Status noetig

### Rueckerstattung
- Modal mit Betragswahl: Vorausgefuellter Gesamtbetrag, Radio fuer Voll/Teil, Eingabefeld fuer Teilbetrag (validiert: > 0 und <= verbleibend), Pflicht-Begruendung
- Doppelte Bestaetigung: Modal → Confirm-Dialog "X EUR wirklich rueckerstatten? NICHT rueckgaengig machbar!"
- Rueckerstatten-Button im Zahlungs-Panel (rechte Spalte), NICHT im Splitbutton
- Nur Admin darf erstatten (Mitarbeiter sehen Button nicht)
- Moeglich bei allen Status nach "bezahlt" (bezahlt, an_hersteller, hersteller_bestaetigt, in_produktion, lieferung, montage, abgeschlossen). Nicht bei fruehen Status oder rueckerstattung_*
- Mehrfache Teilerstattungen moeglich: stripe_refunded_amount_cents kumuliert, Modal zeigt "Bereits erstattet: X EUR, Verbleibend: Y EUR"
- Neuer Status "rueckerstattung_ausstehend" (amber, nicht customer_facing): API-Route setzt bei VOLLER Erstattung auf diesen Zwischenstatus, Webhook bestaetigt → "rueckerstattung_abgeschlossen". NICHT optimistisch setzen!
- Teilerstattungen aendern den Anfrage-Status NICHT — nur stripe_refunded_amount wird hochgezaehlt + StatusHistorie-Eintrag + Gutschrift-PDF. Erst bei voller Erstattung (oder letzte Teilzahlung = Rest): Status-Wechsel auf rueckerstattung_ausstehend
- Jede Erstattung (voll oder teil) generiert eine Gutschrift-PDF mit GS-Nummer (Pflicht nach dt. Steuerrecht)
- API-Route POST /api/stripe/refund + charge.refunded Webhook-Sync: API erstellt Refund + setzt Zwischenstatus, Webhook bestaetigt finalen Status
- Rueckerstattungs-E-Mail an Kunden bei charge.refunded Webhook (mit Gutschrift-PDF als Attachment)
- Keine zeitliche Begrenzung fuer Refunds (Stripe erlaubt bis 180 Tage)
- Rueckerstattungs-Historie ueber bestehende StatusHistorie (Betrag + Grund im Kommentar-Feld)

### Stripe Felder auf Anfrage (STRP-02)
- stripe_checkout_url: String (aktuelle Checkout URL)
- stripe_session_id: String (Stripe Checkout Session ID)
- stripe_payment_intent_id: String (nach Zahlung)
- stripe_payment_status: Select (offen/bezahlt/abgelaufen/dispute/refunded/partially_refunded)
- stripe_expires_at: Date (Session-Ablaufdatum)
- stripe_refunded_amount_cents: Number (kumulierter Erstattungsbetrag in Cent)

### Stripe Customer-Verknuepfung (STRP-11)
- Customer wird bei Checkout-Session-Erstellung erstellt (nicht bei Registrierung): E-Mail pruefen → bestehenden nutzen oder neuen erstellen
- stripe_customer_id als Feld auf Users-Collection (ein Customer pro User-Account)
- Gaeste ohne User-Account: Stripe Customer wird trotzdem erstellt (E-Mail + Name aus Kontaktdaten, metadata: { anfrage_id }). Wenn Gast spaeter Account erstellt: Customer per E-Mail-Lookup verknuepfen
- DSGVO-minimal: Nur E-Mail + Name an Stripe, keine Adresse oder Telefon
- Stripe Dashboard Link im aufklappbaren Detail-Bereich (immer sichtbar, Test/Live automatisch korrekt)
- Keine Migration bestehender Anfragen — nur neue Checkout-Sessions erstellen Customers

### Kunden-Dashboard Zahlungs-UX
- "Jetzt bezahlen" Bereich nur bei Status "zahlungslink_versendet" sichtbar
- Erweiterter StripePayButton: Betrag, Ablaufdatum als statischer Text, Button-Text je nach Zustand
- Bei abgelaufenem Link: Button bleibt aktiv (Redirect-Route regeneriert automatisch), kein Fehlertext
- Bei bezahlt: Gruener Bereich "Zahlung erhalten" mit Datum
- Button nutzt direkt /api/stripe/redirect/[anfrageId] (window.location, kein fetch)
- Keine alte /api/stripe/checkout Route mehr — wird entfernt
- Bei Rueckerstattung: Status-Text "Ihre Zahlung wurde zurueckerstattet." + Gutschrift-PDF zum Download

### Logging & Cleanup (STRP-10)
- Alle console.log im Stripe-Code durch strukturiertes Logging ersetzen: console.info('[Stripe Webhook]', { event, anfrageId, status, paymentIntent })
- Kein console.log in Production-Code

### Neuer Status: rueckerstattung_ausstehend
- Farbe: #f59e0b (amber)
- Label: "Rueckerstattung ausstehend"
- Nicht customer_facing (Kunde sieht vorherigen Status-Text)
- Phase: stornierung
- Transitions: alle Post-Bezahlt-Status → rueckerstattung_ausstehend → rueckerstattung_abgeschlossen (via Webhook)

### Claude's Discretion
- Exakte Stripe API-Aufrufe und Error-Handling-Details
- Zahlungs-Panel Inline Styles + admin-custom.css Layout
- Polling-Endpunkt Implementierung (Stripe Session Lookup vs. lokales DB-Feld)
- Redirect-Route Rate-Limit-Konfiguration und Fehlerseiten-Layout
- Danke-Seite Design und responsive Layout
- Refund-Modal Component-Struktur (Radix Dialog im Admin)
- stripe_payment_status Select-Werte und Transitions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stripe Requirements
- `.planning/REQUIREMENTS.md` -- STRP-01 bis STRP-11 (Checkout, Felder, Admin-View, Kunden-Button, Expiry, Doppelzahlung, Webhook-Idempotenz, Refund, Webhook-Handler, Event-Cleanup, Customer)

### Stripe-Planung (Todos)
- `docs/todos/031_2026-03-27_stripe-zahlungslink-flow.md` -- Komplett-Uebersicht: Ist-Zustand, was fehlt, Edge Cases, betroffene Dateien

### Bestehender Stripe-Code
- `src/lib/stripe.ts` -- getStripe() + createCheckoutSession() (muss erweitert werden: Customer, Expiry, Settings-Werte)
- `src/app/api/stripe/checkout/route.ts` -- WIRD ENTFERNT, ersetzt durch Redirect-Route
- `src/app/api/stripe/webhook/route.ts` -- Aktuell nur checkout.session.completed, muss auf 4 Event-Types erweitert werden
- `src/components/kunden/stripe-pay-button.tsx` -- Bestehender Pay-Button, muss auf Redirect-Route umgebaut werden

### E-Mail-System (Phase 25)
- `src/lib/email/event-matrix.ts` -- zahlungslink_versendet Event bereits konfiguriert
- `src/emails/templates/zahlungslink.tsx` -- Zahlungslink E-Mail-Template (braucht Redirect-URL statt direkter Stripe-URL)
- `src/lib/email/queue.ts` -- queueEmailEvent() fuer E-Mail-Queuing nach Zahlung/Refund

### PDF-System (Phase 26)
- `src/lib/pdf/` -- renderPDF() fuer Rechnungs-/Gutschrift-Generierung bei bezahlt/refunded
- `src/collections/business/rechnungen.ts` -- Rechnungen-Collection (Rechnung bei bezahlt, Gutschrift bei Refund)

### Status-System
- `src/lib/status-config.ts` -- StatusKey, STATUS_LABELS, Transitions (muss um rueckerstattung_ausstehend erweitert werden)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS (neue Transitions fuer Refund-Flow)

### Settings (Phase 24)
- `src/payload-globals/settings.ts` -- stripe_zahlungslink_ablauf_stunden, stripe_waehrung
- `src/lib/settings.ts` -- getSettings() fuer Checkout-Session Konfiguration

### Admin UI
- `src/components/admin/anfrage-detail-view.tsx` -- Detail-View (Zahlungs-Panel + AttentionBar Badge integrieren)
- `src/components/admin/attention-bar.tsx` -- AttentionBar (Zahlungs-Badge hinzufuegen)
- `src/components/admin/splitbutton.tsx` -- Splitbutton (Preis-Guard bei zahlungslink_versendet)

### Vorherige Phase-Contexts
- `.planning/phases/24-foundation/24-CONTEXT.md` -- Settings Global, Cent-Arithmetik, Rate Limiting, CSRF
- `.planning/phases/25-e-mail-system/25-CONTEXT.md` -- E-Mail-Queue, Event-Matrix, Template-Pattern
- `.planning/phases/26-pdf-infrastruktur/26-CONTEXT.md` -- PDF-Generierung, Rechnungen/Gutschriften, Auto-Trigger bei Status-Wechsel

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getStripe()` (lib/stripe.ts): Lazy Stripe-Client mit env-Guard — direkt nutzbar
- `createCheckoutSession()` (lib/stripe.ts): Basis-Funktion — muss um Customer, Expiry, Settings erweitert werden
- `queueEmailEvent()` (lib/email/queue.ts): E-Mail-Queuing — fuer Zahlungsbestaetigung und Refund-Mails
- `renderPDF()` (lib/pdf/): PDF-Generierung — fuer Rechnung bei bezahlt, Gutschrift bei Refund
- `getNextNumber()` (lib/nummernkreise.ts): Fuer GS-Nummern bei Gutschriften
- `getSettings()` (lib/settings.ts): Fuer Checkout-Session Konfiguration (Ablaufzeit, Waehrung)
- `formatCents()` (lib/format-currency.ts): Fuer Preisanzeige in Admin-Panel und Kunden-Dashboard
- `withRateLimit()` (lib/rate-limit.ts): Fuer Redirect-Route und Refund-Route
- `checkOptimisticLock()` (lib/anfrage/optimistic-lock.ts): Fuer Refund-Status-Updates

### Established Patterns
- afterChange Hooks fuer Business-Logik (anfragen.ts — Checkout Session bei Status-Wechsel)
- Custom Admin Components mit Inline Styles + admin-custom.css (fuer Zahlungs-Panel)
- Radix Primitives direkt im Admin (Dialog fuer Refund-Modal)
- API-Routes mit Zod-Validierung + Rate Limiting + CSRF (fuer Refund-Route)
- Status-Badge Farbcodierung (status-config.ts Pattern fuer stripe_payment_status)
- Polling-Pattern: useEffect + setInterval + cleanup (fuer Danke-Seite)

### Integration Points
- `src/collections/business/anfragen.ts` afterChange: Checkout-Session bei "zahlungslink_versendet" (aktuell bei "bestaetigt" — muss verschoben werden)
- `src/app/api/stripe/webhook/route.ts`: Von 1 auf 4 Event-Types erweitern (completed, expired, refunded, dispute)
- `src/components/admin/attention-bar.tsx`: Zahlungs-Badge hinzufuegen
- `src/components/admin/anfrage-detail-view.tsx`: Zahlungs-Panel in rechte Spalte integrieren
- `src/components/kunden/anfrage-detail.tsx`: StripePayButton auf Redirect-Route umbauen
- `src/lib/status-config.ts`: rueckerstattung_ausstehend Status + Transitions hinzufuegen
- `src/collections/users.ts`: stripe_customer_id Feld hinzufuegen
- Neue Dateien: /api/stripe/redirect/[anfrageId], /api/stripe/refund, /api/stripe/payment-status, /zahlung/[status] Pages

</code_context>

<specifics>
## Specific Ideas

- Bei abgelaufenem Zahlungslink im Kunden-Dashboard: Button bleibt aktiv, Redirect-Route regeneriert automatisch — Kunde merkt nichts
- Danke-Seite pollt alle 2 Sek bis Webhook verarbeitet, Timeout nach 30 Sek mit Fallback-Text "Rechnung kommt per E-Mail"
- Refund NICHT optimistisch setzen: Zwischenstatus "rueckerstattung_ausstehend" bei API-Call, Webhook bestaetigt finalen Status
- Stripe Dashboard Link klickbar im aufklappbaren Detail-Bereich (automatisch Test/Live korrekt)
- charge.dispute.created bekommt sofortige Staff-E-Mail weil Disputes zeitkritische Antwort-Fristen haben
- Gaeste ohne Account koennen bezahlen ohne Login — UUID als Auth-Token in Redirect-URL

</specifics>

<deferred>
## Deferred Ideas

- Manueller E-Mail-Versand fuer Zahlungslink — Phase 30: Admin-Extras (generischer manueller Versand)
- Stripe Live-Modus Setup + Umschaltung — STRP-F01 (v1.5+)
- Weitere Zahlungsarten (SEPA, PayPal) — STRP-F02 (v1.5+)
- Teilzahlungen / Anzahlungs-Flow — STRP-F03 (v1.5+)
- Countdown bis Link-Ablauf im Kunden-Dashboard — uebertrieben und erzeugt Druck
- Lazy Migration alter Anfragen zu Stripe Customers — kein Mehrwert fuer aktuelles Volumen
- E-Mail an Kunden bei abgelaufenem Zahlungslink — verwirrend wenn Kunde nicht zahlen wollte

</deferred>

---

*Phase: 27-stripe-end-to-end*
*Context gathered: 2026-03-31*
