# Phase 18: Statuses, Transitions und Collection-Felder - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Das Anfragen-Datenmodell um den vollstaendigen Bestellungsflow erweitern -- von Eingang bis Lieferung, inklusive Abzweigungen fuer Rueckfrage, Stornierung und Hersteller-Probleme. 20 Status-Keys in status-config.ts, erweiterte Transitions in status-transitions.ts, neue Collection-Felder (Hersteller, Stornierung, Rueckerstattung), last_status_change_at mit automatischem Update, und customer_facing Flag auf dem WebhookPayload.

</domain>

<decisions>
## Implementation Decisions

### V1-Scope: Alle 20 Statuse

- Kein V2-Deferral -- ALLE Statuse kommen rein, einmal vollstaendig
- 20 Status-Keys, snake_case ohne Umlaute (konsistent mit bestehenden 7):
  - **Haupt-Flow (12):** neu, in_bearbeitung, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, an_hersteller, hersteller_bestaetigt, in_produktion, versandbereit, geliefert, abgeschlossen
  - **Abzweigungen (8):** rueckfrage, abgelehnt, storniert, hersteller_problem, hersteller_bestaetigt_mit_vorbehalt, zahlungsproblem, wieder_geoeffnet, reklamation

### Transitions

- Linearer Hauptflow: neu -> in_bearbeitung -> angebot_versendet -> bestaetigt -> zahlungslink_versendet -> bezahlt -> an_hersteller -> hersteller_bestaetigt -> in_produktion -> versandbereit -> geliefert -> abgeschlossen
- Abzweigungen (aus Todo 017):
  - in_bearbeitung -> rueckfrage -> in_bearbeitung
  - in_bearbeitung -> abgelehnt -> neu
  - bezahlt -> storniert (Endstatus)
  - an_hersteller -> hersteller_problem (Admin entscheidet naechsten Schritt)
  - hersteller_bestaetigt -> hersteller_bestaetigt_mit_vorbehalt (Kunden-Kommunikation)
  - bezahlt -> zahlungsproblem (automatisch oder manuell)
  - abgeschlossen -> wieder_geoeffnet -> in_bearbeitung
  - geliefert -> reklamation -> in_bearbeitung ODER abgeschlossen

### Kommentar-Pflicht bei Status-Uebergaengen

- 6 Uebergaenge erfordern Pflicht-Kommentar:
  - rueckfrage (besteht bereits)
  - abgelehnt (besteht bereits)
  - storniert (NEU -- stornierung_grund IST der Kommentar, kein separates Feld)
  - hersteller_problem (NEU -- was genau ist das Problem?)
  - reklamation (NEU -- was reklamiert der Kunde?)
  - wieder_geoeffnet (NEU -- warum nochmal oeffnen?)

### Stornierung-Sonderregeln

- stornierung_grund ersetzt den Status-Kommentar (kein doppeltes Eingabefeld)
- rueckerstattung_betrag ist Pflicht NUR wenn Anfrage vorher bezahlt war (conditional required)
- rueckerstattung_status (Select: ausstehend/durchgefuehrt/abgelehnt) ebenfalls conditional

### Felder-Organisation im Admin

- Hersteller-Felder und Stornierung-Felder als **Collapsible Groups mit Conditional Visibility**
- **Hersteller-Infos** (Collapsible): sichtbar ab Status bezahlt (Admin kann vorbereiten bevor an_hersteller)
  - hersteller_bestellnummer (Text)
  - lieferdatum_erwartet (Date)
  - hersteller_notizen (Textarea)
  - hersteller_antwort (Textarea)
- **Stornierung** (Collapsible): sichtbar nur bei Status storniert
  - stornierung_grund (Textarea, Pflicht)
  - rueckerstattung_betrag (Number, Pflicht wenn vorher bezahlt)
  - rueckerstattung_status (Select, Pflicht wenn vorher bezahlt)
- **last_status_change_at**: sichtbar als readOnly-Feld im Admin-Formular (hilft beim Priorisieren)

### E-Mail-Trigger (customer_facing)

- **customer_facing: true (14 Statuse):** neu, rueckfrage, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, hersteller_problem, in_produktion, versandbereit, geliefert, abgeschlossen, storniert, zahlungsproblem, reklamation
- **customer_facing: false (6 Statuse):** in_bearbeitung, an_hersteller, hersteller_bestaetigt, hersteller_bestaetigt_mit_vorbehalt, wieder_geoeffnet, abgelehnt
- abgelehnt ist bewusst false -- Ablehnung wird manuell/telefonisch kommuniziert, nicht per Auto-Mail

### WebhookPayload Erweiterung

- customer_facing: boolean Flag auf dem Payload
- PLUS kunden_text: string (aus STATUS_CUSTOMER_TEXT) direkt mitgeliefert
- PLUS kunden_phase: string (aus STATUS_CUSTOMER_PHASE) direkt mitgeliefert
- N8N muss keinen Text nachschlagen -- alles kommt direkt im Payload

### Claude's Discretion

- Exakte Transition-Map fuer hersteller_problem und hersteller_bestaetigt_mit_vorbehalt (wohin danach)
- PostgreSQL-Migration-Strategie (ALTER TYPE ADD VALUE oder neue Enum)
- Reihenfolge der Felder im Admin-Formular innerhalb der Collapsible Groups
- Implementation der conditional required Logik fuer Stornierung-Felder
- Kunden-Texte fuer die 13 neuen Statuse (im Stil der bestehenden: warm, Siezen)
- Farb-Zuordnung fuer neue Statuse (Farb-Gruppen aus Todo 017 als Basis)
- STATUS_GROUP Zuordnung fuer die neuen Statuse (Gruppen: offen, zahlung, produktion, lieferung, abgeschlossen)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bestellungsflow-Spezifikation
- `docs/todos/017_2026-03-22_bestellungs-flow-verbesserung.md` -- Kompletter Soll-Flow, Admin-Status zu Kunden-Text Mapping, Farb-Codierung, Quick-Actions, E-Mail-Trigger-Liste, neue Felder, Edge Cases

### Status-System (Phase 17 Basis)
- `src/lib/status-config.ts` -- Single Source of Truth mit allen flat Maps (StatusKey erweitern)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS und COMMENT_REQUIRED (erweitern)
- `.planning/phases/17-status-config-centralization/17-CONTEXT.md` -- Kunden-Text-Stil, 5-Phasen-Modell, Export-Struktur

### Anfragen-Collection
- `src/collections/business/anfragen.ts` -- Status Select-Feld, beforeChange Hook, afterChange Webhook, bestehende Felder-Struktur

### Webhook-System
- `src/lib/n8n-webhook.ts` -- WebhookPayload Interface (erweitern um customer_facing, kunden_text, kunden_phase)

### Requirements
- `.planning/REQUIREMENTS.md` -- STAT-03, STAT-04, STAT-06, FELD-01, FELD-02, FELD-03

### Architektur
- `.planning/research/ARCHITECTURE.md` -- Build Order, Separation status-config vs status-transitions
- `.planning/research/PITFALLS.md` -- Pitfall 1 (Centralization), Pitfall 8 (Customer mapping layer)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/status-config.ts`: Flat Maps Pattern -- StatusKey Union Type erweitern, neue Eintraege in alle 7 Maps (COLORS, LABELS, TAILWIND, CUSTOMER_TEXT, CUSTOMER_PHASE, GROUP, EMAIL_TRIGGER_STATUSES)
- `src/lib/status-transitions.ts`: VALID_TRANSITIONS Record + COMMENT_REQUIRED Array erweitern
- `src/collections/business/anfragen.ts`: beforeChange Hook fuer Status-Validierung + afterChange Hook fuer Webhook bereits vorhanden

### Established Patterns
- Payload Collapsible Fields: Bereits bei "Produkte" und "Technische Konfiguration" genutzt -- gleiches Pattern fuer Hersteller/Stornierung
- Payload condition() API: `admin: { condition: (data) => ... }` fuer conditional visibility
- beforeChange Hook: Status-Transition-Validierung + Status-Historie-Tracking bereits implementiert
- afterChange Hook: WebhookPayload Konstruktion + Stripe-Spezialfall bereits vorhanden
- Admin: inline styles mit hex aus STATUS_COLORS, Kunden: Tailwind-Klassen aus STATUS_TAILWIND

### Integration Points
- Status Select-Feld in anfragen.ts: options Array muss 20 Eintraege bekommen
- beforeChange Hook: COMMENT_REQUIRED Check + last_status_change_at Update
- afterChange Hook: WebhookPayload um customer_facing + kunden_text + kunden_phase erweitern, isCustomerFacing() nutzen
- PostgreSQL: Enum-Migration fuer neue Status-Werte noetig

</code_context>

<specifics>
## Specific Ideas

- "Alle Statuse rein -- kein V2-Deferral. Lieber einmal vollstaendig als spaeter nochmal anfassen."
- stornierung_grund ersetzt den Status-Kommentar -- kein doppeltes Eingabefeld fuer den Admin
- Hersteller-Felder ab bezahlt sichtbar (nicht erst ab an_hersteller) -- Admin kann vorbereiten
- last_status_change_at als readOnly im Formular -- hilft sofort beim Priorisieren
- abgelehnt bewusst customer_facing: false -- sensible Kommunikation manuell/telefonisch
- WebhookPayload liefert kunden_text und kunden_phase direkt mit -- N8N muss nichts nachschlagen
- Kunden-Texte im bestehenden Stil: warm, persoenlich, Siezen ("Wir haben Ihre Anfrage erhalten...")
- Endstatus-Pattern: storniert bekommt keinen Fortschrittsbalken (wie abgelehnt aus Phase 17)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope. Alle Statuse inklusive REKLAMATION, ZAHLUNGSPROBLEM und WIEDER_GEOEFFNET sind V1-Scope.

</deferred>

---

*Phase: 18-statuses-transitions-collection-felder*
*Context gathered: 2026-03-25*
