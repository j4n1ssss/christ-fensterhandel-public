# Phase 5: Externe Integrationen - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Bezahlung ueber Stripe und automatisierte E-Mails ueber N8N funktionieren Ende-zu-Ende. Stripe Checkout Session wird bei Status BESTAETIGT erstellt, Webhook setzt Status auf BEZAHLT. N8N empfaengt Webhooks und versendet formatierte E-Mails an Kunde und Firma. Keine neuen UI-Seiten oder Dashboards — Integration in bestehendes Kunden-Dashboard und Admin-Panel.

</domain>

<decisions>
## Implementation Decisions

### Stripe Checkout-Flow
- Checkout startet bei Status BESTAETIGT (Admin bestaetigt → Kunde sieht "Jetzt bezahlen" im Dashboard)
- Voller Betrag (brutto inkl. MwSt) in einer Zahlung — keine Teilzahlung/Anzahlung
- Stripe automatic payment methods (Karte, SEPA, Klarna etc. — Stripe waehlt basierend auf Land/Betrag)
- App erstellt Stripe Checkout Session beim Status-Wechsel auf BESTAETIGT, URL wird im Webhook-Payload an N8N mitgesendet
- Nach erfolgreicher Zahlung: Redirect zurueck zum Kunden-Dashboard
- Stripe Webhook setzt Anfrage-Status automatisch auf BEZAHLT
- Test-Modus mit Karte 4242 4242 4242 4242

### Webhook-Security
- Stripe Webhook: Signature-Pruefung mit stripe.webhooks.constructEvent() und WHSEC-Secret
- N8N Webhook: Shared Secret im x-webhook-secret Header (N8N prueft Wert)
- Webhook-Fehler werden geloggt (console.error), blockieren aber nicht den Hauptfluss
- Stripe hat eigene Retry-Logik (bis 3 Tage)
- Fehler-Badge im Admin-Dashboard wenn Webhooks fehlschlagen (sichtbar fuer Admin)

### E-Mail-Trigger (Kunden-E-Mails)
- Neue Anfrage: Bestaetigungs-E-Mail ("Ihre Anfrage #1234 ist eingegangen, wir melden uns innerhalb von 2 Werktagen")
- Status BESTAETIGT: E-Mail mit Stripe-Zahlungslink UND Dashboard-Verweis (Kunde kann waehlen)
- Status RUECKFRAGE: E-Mail mit Admin-Kommentar und Verweis auf Dashboard zum Antworten
- Status BEZAHLT: Zahlungsbestaetigung
- Status ABGESCHLOSSEN: Abschluss-E-Mail

### E-Mail an Firma
- Bei neuer Anfrage: Kompakte Uebersicht (Kundenname, E-Mail, Telefon, Anzahl Produkte, Gesamtbetrag, Link zum Admin-Dashboard)
- Keine volle Produktliste in der E-Mail — Details im Dashboard

### E-Mail-Branding
- Branded HTML-Templates mit Logo, Farben aus Style Guide, styled Buttons
- Absender: noreply@christ-fensterhandel.de (oder .com)
- Footer mit Kontaktdaten und Impressum-Link

### N8N Workflow-Design
- Ein Workflow mit einem Webhook-Endpoint, Switch-Node routet nach event_type
- Event-Typen: neue_anfrage, status_aenderung, zahlung_eingegangen
- Webhook-Payload: event_type, anfrage_id, anfrage_nummer, status (neu/alt), kunde (name, email), gesamtbetrag, produkt_anzahl, optional stripe_checkout_url
- N8N lokal per Docker zum Entwickeln/Testen, spaeter auf Server importieren
- App generiert Stripe Checkout Session URL, N8N setzt sie nur ins E-Mail-Template ein

### Claude's Discretion
- Stripe Checkout Session API-Aufruf Implementierung (server-side)
- N8N docker-compose Setup fuer lokale Entwicklung
- E-Mail HTML-Template Struktur und Styling-Details
- Webhook-Payload exakte JSON-Struktur
- Fehler-Badge Implementierung im Admin (Payload Custom Component oder Global)
- afterChange Hook Refactoring (aktueller Placeholder → vollstaendige Implementierung)
- Stripe Webhook Endpoint Route und Event-Handling

</decisions>

<specifics>
## Specific Ideas

- Stripe-Button im Kunden-Dashboard ist bereits als UI-Element vorbereitet (Phase 4) — muss nur mit echter Checkout Session URL verbunden werden
- afterChange Hook in Anfragen-Collection hat bereits Placeholder fuer N8N Webhook (Status-Aenderung wird erkannt)
- BESTAETIGT-E-Mail bietet beide Wege: direkter Zahlungslink UND Dashboard-Login — Kunde entscheidet
- Fehler-Badge im Dashboard: Admin soll sofort sehen wenn E-Mail-Versand fehlschlaegt, nicht erst in Logs suchen muessen

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `afterChange` Hook in Anfragen Collection (src/collections/business/anfragen.ts): Placeholder fuer N8N Webhook bei Status-Aenderung, erkennt bereits previousDoc.status !== doc.status
- Stripe-Button UI im Kunden-Dashboard: Vorbereitet fuer Checkout Session URL
- `calculateServerPrice()` (src/app/api/anfrage/calculate-price/route.ts): Server-seitige Preisberechnung — Betrag fuer Stripe Checkout Session
- Status-Workflow Transitions (Phase 4): Definierte Uebergaenge inkl. BESTAETIGT → BEZAHLT
- API Routes Pattern (src/app/api/): Bestehende Route-Struktur fuer neue Stripe/Webhook Endpoints

### Established Patterns
- Payload CMS afterChange/beforeChange Hooks fuer Business-Logik
- Next.js API Routes unter src/app/api/ mit Zod-Validierung
- Payload Local API fuer server-seitige Datenabfragen (kein REST overhead)
- Environment Variables fuer Secrets (.env)
- UUID als IDs (PostgreSQL Adapter)

### Integration Points
- src/collections/business/anfragen.ts: afterChange Hook erweitern (Placeholder → echte Webhook-Calls)
- Neue API Route: /api/stripe/checkout — Checkout Session erstellen
- Neue API Route: /api/stripe/webhook — Stripe Webhook empfangen
- Neue API Route: /api/webhooks/n8n — N8N Webhook Endpoint (fuer Fehler-Reporting)
- Kunden-Dashboard: Stripe-Button mit echter Checkout URL verbinden
- Admin-Dashboard: Fehler-Badge Component hinzufuegen
- docker-compose.yml: N8N Container fuer lokale Entwicklung
- .env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET

</code_context>

<deferred>
## Deferred Ideas

- PDF-Generierung (Angebots-PDF als E-Mail-Anhang) — v2 (INT-V2-01)
- Automatische Erinnerungs-E-Mail bei unbezahlten Anfragen nach X Tagen — v2
- N8N Cron-Workflow fuer alte unbearbeitete Anfragen — v2 (INT-V2-03)
- Anzahlung/Teilzahlung Option — spaetere Erweiterung
- E-Mail-Tracking (geoeffnet/geklickt) — v2

</deferred>

---

*Phase: 05-externe-integrationen*
*Context gathered: 2026-03-10*
