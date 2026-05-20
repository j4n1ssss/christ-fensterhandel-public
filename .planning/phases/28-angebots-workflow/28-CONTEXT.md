# Phase 28: Angebots-Workflow - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin erstellt Angebote mit optionaler Preis-Anpassung (Gesamt oder pro Position) und versendet sie per One-Click (PDF + Status + E-Mail). Kunden nehmen Angebote an und werden direkt zur Stripe-Zahlung weitergeleitet. Angebots-Historie mit Versionen (V1, V2, V3). AGB-Checkbox auf dem Anfrage-Formular. Unverbindlicher Preishinweis im Konfigurator.

Kein manueller E-Mail-Versand (Phase 30), kein Kunden-Self-Service (Phase 29), kein Webhook-Tab Redesign (Phase 30).

</domain>

<decisions>
## Implementation Decisions

### Angebots-Erstellungs-Modal

- Grosses scrollbares Modal (max-height 85vh), sticky Footer mit Submit-Button
- Oben: Volle Konfigurationsdetails pro Position (read-only): Name, Menge, Masse, Farben, Verglasung etc.
- Dual-Preis-Modus:
  - **Standard (oben):** Gesamtpreis-Feld (Brutto editierbar, Netto + MwSt werden live berechnet und angezeigt, read-only)
  - **Aufklappbar:** Einzelpreise pro Position editierbar (Brutto pro Position)
- Letztes Edit gewinnt bei Konflikt: Einzelpreise geaendert → Gesamt wird neu berechnet. Gesamt manuell geaendert → Differenz als pauschaler Rabatt auf PDF (Zwischensumme + Rabattzeile + Gesamt)
- Begruendung: Pflichtfeld, erscheint bei JEDER Abweichung vom berechneten Preis (Gesamt ODER Einzelposition)
- Gueltigkeit: Preset-Dropdown (14 / 30 / 60 / 90 Tage), Default aus Settings Global (angebots_gueltigkeit_tage)
- Freitext: Optional, fuer individuelle Hinweise
- Splitbutton "Angebot erstellen" bei Status in_bearbeitung oeffnet das Modal (kein direkter Status-Wechsel mehr)
- One-Click "Angebot erstellen & senden": Ein API-Call erledigt alles serverseitig:
  1. Angebot-Eintrag in DB (Version, Entwurf)
  2. PDF generieren + speichern
  3. Angebot-Status → versendet
  4. Anfrage-Status → angebot_versendet
  5. E-Mail mit PDF an Kunden queuen
  6. Modal schliesst, UI refresht

### Annahme-Flow (Kunden)

- **Annehmen = sofort Zahlung:** Klick auf "Angebot annehmen" → Status direkt auf zahlungslink_versendet → Checkout Session erstellen → Redirect zu Stripe. Kein manueller Admin-Schritt dazwischen.
- **Confirm-Dialog vor Redirect:** Kunde sieht Zusammenfassung (Betrag, Widerrufs-Hinweis Massanfertigung §312g, AGB-Checkbox). Erst nach Bestaetigung geht es zu Stripe.
- **AGB-Checkbox bei Annahme:** Eigene Checkbox im Confirm-Dialog: "Ich akzeptiere die AGB und bestaetige die Bestellung." Eigener Zeitstempel (angebot_akzeptiert_am + agb_akzeptiert_bei_annahme_am).
- **Gast-Zugang:** Eigene oeffentliche Route /angebot/[anfrageId] — UUID als Auth-Token, Rate Limited (5/min pro IP). Zeigt Angebots-Zusammenfassung (Produkte, Betrag, Gueltigkeit), PDF-Download, "Annehmen & zahlen" Button. Analog zum Stripe-Redirect Pattern aus Phase 27.
- **Dashboard-Zugang:** Eingeloggte Kunden sehen "Angebot annehmen & zahlen" Button direkt im Dashboard (Anfrage-Detail-View). Gleiche Logik, nur im Dashboard-Kontext.
- **E-Mail-Link:** Angebots-E-Mail enthaelt Link zu /angebot/[anfrageId] (NICHT direkte Stripe-URL).

### Status-Flow Aenderungen

- **Neue Transition:** angebot_versendet → zahlungslink_versendet (Kunden-Annahme, automatisch)
- **bestaetigt bleibt als Admin-Option:** Admin kann manuell auf "bestaetigt" setzen (z.B. telefonische Annahme, Barzahlung). Splitbutton bei angebot_versendet behaelt "Kunde hat bestaetigt".
- **Zwei Wege:**
  - Kunden-Weg: angebot_versendet → zahlungslink_versendet → bezahlt (automatisch)
  - Admin-Weg: angebot_versendet → bestaetigt → zahlungslink_versendet → bezahlt (manuell)
- **Abbruch/Timeout:** Wenn Checkout Session expired → Status zurueck auf angebot_versendet. Kunde kann erneut annehmen. Angebot-Gueltigkeit bleibt unberuehrt.
- **Abgelaufenes Angebot:** Angebots-Route zeigt "Angebot abgelaufen" Hinweis + Kontaktdaten. Button deaktiviert. PDF-Download bleibt verfuegbar. Kein automatisches neues Angebot.

### Angebots-Annahme API-Route

- Eigene Route: POST /api/angebot/annehmen mit { anfrageId, agb_akzeptiert: true }
- Server-Logik:
  1. Anfrage laden + validieren
  2. Pruefen: Status == angebot_versendet
  3. Pruefen: Angebot gueltig (gueltig_bis > jetzt)
  4. AGB-Zeitstempel speichern
  5. Checkout Session erstellen (via createCheckoutSession)
  6. Status → zahlungslink_versendet
  7. Return: { checkout_url }
- Rate Limited, CSRF-geschuetzt fuer eingeloggte, UUID-basiert fuer Gaeste

### Angebots-Historie & Versioning

- Angebots-Versionen im Dokumente-Bereich (rechte Spalte, Anfrage-Detail-View): Chronologisch, neuestes oben. Jedes Angebot mit Version, Datum, Betrag, Status, PDF-Download.
- "+ Neues Angebot erstellen" Button im Dokumente-Bereich, JEDERZEIT verfuegbar (nicht nur bei in_bearbeitung)
- Neues Angebot setzt Status IMMER automatisch auf angebot_versendet (egal welcher vorheriger Status)
- Modal vorausgefuellt mit Preis des letzten Angebots als Ausgangswert, Version automatisch erhoeht
- Kunden sehen NUR das aktuelle Angebot (hoechste versendete Version). Alte Versionen nur im Admin sichtbar.

### AGB-Checkbox auf Anfrage-Formular

- Neue Checkbox direkt unter bestehender Datenschutz-Checkbox: "Ich akzeptiere die AGB [Link]"
- AGB-Link dynamisch aus Settings Global (agb_link Feld, existiert bereits)
- Initial: /agb als Platzhalter-Seite ("AGB werden in Kuerze ergaenzt")
- Spaeter austauschbar: PDF-URL, Puck-Seite, etc. — nur Settings aendern
- Akzeptanz-Zeitstempel (agb_akzeptiert_am) auf Anfrage gespeichert
- Pflichtfeld (Formular-Submit blockiert wenn nicht akzeptiert)

### Auftragsbestaetigung

- Kein neues E-Mail-Template — bestehende Zahlungsbestaetigung (Event 'zahlung_eingegangen') erweitern
- Erweitert um: Produktliste (Name, Menge, Einzelpreis), Gesamtbetrag, naechste Schritte ("Wir bestellen beim Hersteller...")
- Rechnung als PDF-Attachment (bereits in Phase 27 gebaut)
- Wird erst bei Zahlungseingang gesendet (nicht bei Annahme) — vermeidet "Auftrag bestaetigt" ohne Zahlung

### Preishinweis im Konfigurator

- Konfigurator Step 10 (Zusammenfassung): Kleiner grauer Hinweistext unter dem Gesamtpreis: "Preise sind unverbindlich. Der endgueltige Preis steht im Angebot."
- Anfrage-Formular: Gleicher Hinweis vor dem Submit-Button (unter den Checkboxen)
- Kein auffaelliges Banner — dezent aber sichtbar

### Claude's Discretion

- Angebots-Modal Inline Styles + admin-custom.css Layout (Radix Dialog im Admin)
- Scrollbares Modal responsive Verhalten
- /angebot/[anfrageId] Page Layout und Styling (nutzt Frontend Design Skill)
- Confirm-Dialog Component-Struktur
- Exakte Validierung der Annahme-Route (Edge Cases)
- Preis-Konflikt-Logik Implementierung (Gesamt vs. Einzelpreise)
- Angebots-E-Mail Template Anpassung (Link zu /angebot/[anfrageId] statt Dashboard)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Angebots-Requirements
- `.planning/REQUIREMENTS.md` -- ANG-01 bis ANG-05 (Modal, Historie, Annahme, Bestaetigung, AGB)

### Angebots-Planung (Todos)
- `docs/todos/042_2026-03-27_angebots-erstellung-workflow.md` -- Angebots-Workflow Anforderungen, Preis-Anpassung, Annahme-Optionen
- `docs/todos/043_2026-03-27_kundenabsprache-offene-fragen.md` -- Offene Fragen (Annahme-Flow, AGB-Text, Steuer)

### Bestehende Angebote-Infrastruktur (Phase 26)
- `src/collections/business/angebote.ts` -- Angebote Collection (Felder, Immutabilitaet, Versioning)
- `src/lib/pdf/render-pdf.ts` -- renderPDF('angebot', ...) fuer PDF-Generierung
- `src/app/(payload)/api/pdf/angebot/[anfrageId]/route.ts` -- PDF-Download Route
- `src/lib/pdf/generate-and-store.ts` -- PDF speichern + Angebot-Eintrag erstellen

### Stripe-Integration (Phase 27)
- `src/lib/stripe.ts` -- createCheckoutSession() fuer Checkout nach Annahme
- `src/app/api/stripe/webhook/route.ts` -- checkout.session.expired Handler (Status zurueck auf angebot_versendet)
- `src/components/kunden/stripe-pay-button.tsx` -- StripePayButton Pattern fuer Dashboard-Integration

### E-Mail-System (Phase 25)
- `src/lib/email/event-matrix.ts` -- angebot_versendet Event (Template-Zuordnung)
- `src/lib/email/queue.ts` -- queueEmailEvent() fuer E-Mail nach Angebots-Versand
- `src/emails/templates/zahlungslink.tsx` -- Zahlungslink Template (wird bei Annahme-Flow genutzt)
- `src/emails/templates/zahlung-eingegangen.tsx` -- Zahlungsbestaetigung Template (erweitern um Auftragsdetails)

### Status-System
- `src/lib/status-config.ts` -- StatusKey, SPLITBUTTON_ACTIONS (Angebot erstellen oeffnet Modal statt direktem Wechsel)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS (neue Transition: angebot_versendet → zahlungslink_versendet)

### Settings (Phase 24)
- `src/payload-globals/settings.ts` -- agb_link, angebots_gueltigkeit_tage (existierende Felder)
- `src/lib/settings.ts` -- getSettings() fuer AGB-Link und Gueltigkeit

### Admin UI
- `src/components/admin/anfrage-detail-view.tsx` -- Detail-View (Modal-Trigger, Dokumente-Bereich)
- `src/components/admin/splitbutton.tsx` -- Splitbutton (oeffnet Modal statt Status-Wechsel)

### Kunden-Dashboard
- `src/components/kunden/anfrage-detail.tsx` -- Anfrage-Detail (Angebots-Bereich + Annehmen-Button)

### Anfrage-Formular
- `src/components/konfigurator/` -- Step 10 Zusammenfassung (Preishinweis)
- `src/app/(frontend)/anfrage/page.tsx` oder aehnlich -- Anfrage-Formular (AGB-Checkbox)

### Vorherige Phase-Contexts
- `.planning/phases/25-e-mail-system/25-CONTEXT.md` -- E-Mail-Queue, Event-Matrix
- `.planning/phases/26-pdf-infrastruktur/26-CONTEXT.md` -- PDF-Generierung, Angebote Collection, Auto-Trigger
- `.planning/phases/27-stripe-end-to-end/27-CONTEXT.md` -- Checkout Session, Redirect-Route, Danke-Seite

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Angebote Collection` (collections/business/angebote.ts): Felder, Versioning, Immutabilitaet — direkt nutzbar
- `renderPDF('angebot', ...)` (lib/pdf/render-pdf.ts): PDF-Generierung — wird im Modal-Submit aufgerufen
- `createCheckoutSession()` (lib/stripe.ts): Checkout Session — wird bei Annahme aufgerufen
- `queueEmailEvent()` (lib/email/queue.ts): E-Mail-Queuing — fuer Angebots-Versand und Zahlungsbestaetigung
- `getSettings()` (lib/settings.ts): Settings mit agb_link, angebots_gueltigkeit_tage
- `getNextNumber('ANG')` (lib/nummernkreise.ts): Angebotsnummer-Vergabe
- `calcNetFromGross()`, `calcTax()` (lib/tax.ts): MwSt-Berechnung fuer Brutto→Netto im Modal
- `formatCents()` (lib/format-currency.ts): Preisformatierung
- `withRateLimit()` (lib/rate-limit.ts): Rate Limiting fuer Annahme-Route

### Established Patterns
- Splitbutton oeffnet Modal statt direktem Status-Wechsel (neues Pattern — Splitbutton bisher nur fuer direkte Aktionen)
- Custom Admin Components mit Inline Styles + admin-custom.css + Radix Primitives (Dialog fuer Modal)
- Oeffentliche Routes mit UUID als Auth-Token (/api/stripe/redirect/[anfrageId] Pattern)
- afterChange Hooks fuer Business-Logik (PDF-Trigger, E-Mail-Trigger)
- API-Routes mit Zod-Validierung + Rate Limiting + CSRF

### Integration Points
- `src/components/admin/splitbutton.tsx`: "Angebot erstellen" Aktion muss Modal oeffnen statt Status zu aendern
- `src/components/admin/anfrage-detail-view.tsx`: Angebots-Modal Component + Dokumente-Bereich Angebots-Liste
- `src/lib/status-transitions.ts`: Neue Transition angebot_versendet → zahlungslink_versendet
- `src/app/api/stripe/webhook/route.ts`: checkout.session.expired Handler muss auf angebot_versendet zuruecksetzen (wenn vorheriger Status angebot_versendet war)
- `src/components/kunden/anfrage-detail.tsx`: Angebots-Bereich mit Annehmen-Button
- `src/emails/templates/zahlung-eingegangen.tsx`: Erweitern um Produktliste und naechste Schritte
- Neue Dateien: /api/angebot/annehmen, /angebot/[anfrageId] Page, AGB-Checkbox im Formular

</code_context>

<specifics>
## Specific Ideas

- Dual-Preis-Modus im Modal: Gesamtpreis als Schnellweg oben, Einzelpreise aufklappbar darunter — "Mix aus beidem, Standard ist Gesamtpreis"
- Letztes Edit gewinnt: Einzelpreise geaendert → Gesamt auto. Gesamt manuell geaendert → pauschaler Rabatt auf PDF (Zwischensumme + Rabattzeile + Gesamt)
- Gast-Route /angebot/[anfrageId]: "Muss auch fuer Gaeste ohne Login funktionieren, analog Stripe Redirect mit UUID"
- Kunden sehen nur aktuelles Angebot — alte Versionen nur im Admin sichtbar
- "Preise sind unverbindlich, endgueltiger Preis im Angebot" — kleiner Text-Zusatz im Konfigurator Step 10 und Anfrage-Formular
- Auftragsbestaetigung erst nach Zahlung, nicht bei Annahme — "Vermeidet Verwirrung wenn Kunde annimmt aber nicht zahlt"

</specifics>

<deferred>
## Deferred Ideas

- Manueller E-Mail-Versand fuer Angebots-Link — Phase 30: Admin-Extras
- Angebots-PDF mit eingebettetem Zahlungslink/QR-Code — uebertrieben fuer v1.4
- Angebots-Vergleich fuer Kunden (V1 vs V2 Diff) — v2, aktuell sehen Kunden nur aktuelles
- Automatische Erinnerungs-Mail bei baldigem Ablauf — eigenes Feature, nicht Teil dieses Workflows
- Angebots-Templates (vordefinierte Texte/Rabatte) — v2, aktuell Freitext reicht
- Teilzahlung / Anzahlung nach Annahme — STRP-F03 (v1.5+)

</deferred>

---

*Phase: 28-angebots-workflow*
*Context gathered: 2026-04-01*
