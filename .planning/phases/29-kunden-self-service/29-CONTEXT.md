# Phase 29: Kunden Self-Service - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Kunden koennen selbststaendig auf Rueckfragen antworten (mit optionalen Datei-Anhaengen), Stornierungen beantragen (Request-Pattern, Admin bestaetigt), Reklamationen mit Fotos einreichen (eigene Collection mit Status-Flow), und ihr Passwort zuruecksetzen (Custom UI + Payload API). Zwei neue Status: `kundenantwort` und `stornierung_beantragt`. Gast-Routen fuer Rueckfrage-Antwort und Reklamation.

Kein manueller E-Mail-Versand (Phase 30), kein Webhook-Tab Redesign (Phase 30), keine Admin-Pagination (Phase 30).

</domain>

<decisions>
## Implementation Decisions

### Rueckfrage-Antwort (KUND-01)

#### Formular-Platzierung
- Inline im bestehenden orange Rueckfrage-Banner (StatusBanner Component erweitern)
- "Jetzt antworten" Button klappt Formular-Bereich auf (toggle, kein Modal)
- Formular: Textarea (Pflicht, min 10 Zeichen) + optionaler Datei-Upload (max 3 Dateien, Bilder/PDF, max 10MB pro Datei)
- Nur sichtbar bei Status `rueckfrage`

#### Gast-Route
- Oeffentliche Route `/rueckfrage/[anfrageId]` (UUID-basiert, Rate Limited 5/min pro IP)
- Zeigt: Anfrage-Nummer, letzte Rueckfrage-Nachricht des Admin aus StatusHistorie, Antwort-Formular (Textarea + Datei-Upload)
- Analog zum Angebots-Annahme Pattern aus Phase 28 (/angebot/[anfrageId])
- Eingeloggte Kunden nutzen den Banner im Dashboard

#### Neuer Status: kundenantwort
- Status `kundenantwort` als 21. Status ins System aufnehmen (status-config.ts, status-transitions.ts)
- Nach Absenden: Status wechselt automatisch von `rueckfrage` auf `kundenantwort`
- Kunden-Text: "Ihre Antwort wurde uebermittelt, wir bearbeiten sie."
- Kunden-Phase: "Anfrage" (gleich wie rueckfrage)
- Attention-Score: 3 (gleich wie rueckfrage — Kunde wartet auf Admin-Reaktion)
- Eigene Farbe im Admin (z.B. blau oder tuerkis — unterscheidbar von rueckfrage-orange)
- Formular verschwindet nach Absenden (einmalige Antwort pro Rueckfrage-Zyklus)
- Bei erneuter `rueckfrage` durch Admin erscheint Formular wieder

#### Transitions
- `kundenantwort` → `in_bearbeitung` (Admin bearbeitet)
- `kundenantwort` → `rueckfrage` (Admin stellt direkt nochmal Rueckfrage — spart Umweg)
- Splitbutton bei `kundenantwort`: Primary "Zurueck zur Bearbeitung", Chevron "Erneut Rueckfrage senden"

#### Speicherung
- Kundenantwort als StatusHistorie-Eintrag (konsistent mit bestehendem Pattern)
- StatusHistorie-Collection um optionales `anhaenge` Feld erweitern (Array von Upload-Relationships)
- Kommentar-Text: Kundenantwort-Text, geaendert_von: Kunden-E-Mail
- Anhaenge im selben StatusHistorie-Eintrag gespeichert

#### Admin-Benachrichtigung
- E-Mail an Staff via `kundenantwort` Event (Slot in event-matrix.ts bereits vordefiniert)
- E-Mail enthaelt: Anfrage-Nummer, kompletten Kundentext, Hinweis auf Anhaenge (Anzahl), CTA-Button "Anfrage oeffnen"
- Betreff: "Kundenantwort zu Anfrage #ANF-YYYY-NNN"

### Stornierungsanfrage (KUND-02)

#### UI-Pattern
- Dezenter "Stornierung beantragen" Link am Seitenende der Anfrage-Detail-View
- Klick oeffnet Confirm-Dialog mit:
  - Begruendung Textarea (Pflicht, min 10 Zeichen)
  - Hinweistext: "Ihre Anfrage wird nicht automatisch storniert. Unser Team prueft Ihre Anfrage und meldet sich."
  - Buttons: "Abbrechen" + "Stornierung beantragen"

#### Sichtbarkeit
- Button bei ALLEN Status sichtbar AUSSER: storniert, abgelehnt, abgeschlossen, geliefert, rueckerstattung_ausstehend, rueckerstattung_abgeschlossen
- Nur fuer eingeloggte Kunden im Dashboard (keine Gast-Route — Stornierung erfordert Login)

#### Neuer Status: stornierung_beantragt
- Status `stornierung_beantragt` als 22. Status ins System aufnehmen
- Nach Absenden: Status wechselt automatisch auf `stornierung_beantragt`
- Begruendung wird in `stornierung_grund` Feld gespeichert (existiert bereits auf Anfrage)
- StatusHistorie-Eintrag mit Kommentar "Stornierung beantragt: [Begruendung]"
- Kunden-Text: "Ihre Stornierungsanfrage wird von unserem Team geprueft."
- Kunden-Phase: aktuelle Phase beibehalten (da Stornierung aus jedem Status kommen kann)
- Dashboard zeigt gelbes Banner (orange-50 Styling, WARNING_STATUSES erweitern)
- Storno-Button verschwindet nach Absenden

#### Transitions
- `stornierung_beantragt` → `storniert` (Admin bestaetigt Stornierung)
- `stornierung_beantragt` → `in_bearbeitung` (Admin lehnt ab / weiter bearbeiten)
- Splitbutton bei `stornierung_beantragt`: Primary "Stornierung bestaetigen", Chevron "Ablehnen (zurueck zu Bearbeitung)"
- Attention-Score: 3 (Admin muss reagieren)
- COMMENT_REQUIRED bei `stornierung_beantragt` → `in_bearbeitung` (Admin muss Ablehnung begruenden)

#### Admin-Benachrichtigung
- E-Mail an Staff via neuem `stornierung_beantragt` Event in event-matrix.ts
- E-Mail enthaelt: Anfrage-Nummer, Kunden-Begruendung, CTA "Anfrage oeffnen"

### Reklamation (KUND-03)

#### Neue Collection: reklamationen
- Eigene Payload Collection `reklamationen` mit Feldern:
  - anfrage (Relationship zu Anfragen, Pflicht)
  - beschreibung (Textarea, Pflicht, min 20 Zeichen)
  - fotos (Upload Array, max 5 Dateien)
  - status (Select: offen | in_bearbeitung | geloest)
  - loesung (Textarea, Admin-only — Loesung/Massnahme)
  - erstellt_von (Relationship: Users)
  - createdAt, updatedAt
- Mehrere Reklamationen pro Anfrage moeglich

#### Foto-Upload
- Erlaubte Typen: image/jpeg, image/png, image/webp, image/heic + application/pdf
- Max 5 Dateien pro Reklamation
- Max 10 MB pro Datei
- Upload via Payload Media Collection (bestehende Upload-Infrastruktur nutzen)

#### Einreichung: Dashboard + Gast-Route
- Dashboard: "Reklamation melden" Button in der Detail-View (nur bei Status `geliefert` oder `abgeschlossen`)
- Klick klappt Inline-Formular auf (wie Rueckfrage-Banner Pattern): Beschreibung Textarea + Foto-Upload + "Reklamation einreichen" Button
- Gast-Route: `/reklamation/[anfrageId]` (UUID-basiert, Rate Limited 5/min)
- Gast-Route zeigt: Anfrage-Nummer, Formular (Beschreibung + Fotos), "Einreichen" Button

#### Auto-Status-Wechsel
- Nach Einreichung: Anfrage-Status wechselt automatisch auf `reklamation` (existiert bereits im Status-System)
- Reklamation-Collection-Status: `offen`
- Admin sieht roten Badge in der Anfragen-Liste

#### Kunden-Sichtbarkeit
- Eigener "Ihre Reklamation" Bereich in der Detail-View (unterhalb des Status-Banners)
- Zeigt: Status (offen/in Bearbeitung/geloest), eigene Beschreibung, eigene Fotos (Thumbnails), Admin-Loesung (wenn geloest)
- Bei geloest: Gruener Hintergrund + Loesungstext

#### Admin-Benachrichtigung
- E-Mail an Staff via bestehendem `reklamation` Event in event-matrix.ts
- E-Mail enthaelt: Anfrage-Nummer, Reklamations-Beschreibung, Anzahl Fotos, CTA "Anfrage oeffnen"

### Passwort-Reset (KUND-04)

#### Custom UI + Payload API
- Eigene Pages im Kunden-Frontend:
  - `/kunden/passwort-vergessen` — E-Mail-Eingabe + "Link anfordern" Button
  - `/kunden/passwort-reset/[token]` — Neues Passwort + Bestaetigung Felder + "Passwort aendern" Button
- Design konsistent mit Login/Register Pages (Tailwind + Shadcn)
- Nutzt Payload API Endpoints im Hintergrund (POST /api/users/forgot-password, POST /api/users/reset-password)
- Rate Limited (5/min pro IP auf forgot-password)

#### E-Mail
- Eigenes React Email Template `passwort-reset` mit Base-Layout (Logo, Footer)
- Laeuft ueber E-Mail-Queue (Phase 25 System) — NICHT ueber Payload's eingebauten E-Mail-Versand
- Payload's generateEmailHTML/generateEmailSubject Override in Users Collection Config
- Link zeigt auf `/kunden/passwort-reset/[token]` (NICHT /admin/reset-password)
- Token-Ablauf: 1 Stunde (Payload Default)

#### Platzierung
- Login-Seite: "Passwort vergessen?" Link unter dem Login-Button
- Dashboard: "Passwort aendern" im Profil-Bereich (fuer eingeloggte Kunden — hier ohne Token, direkt neues Passwort + altes Passwort)

#### Erfolgs-/Fehler-States
- Nach Link-Anforderung: Erfolgs-Hinweis "Falls ein Konto mit dieser E-Mail existiert, haben wir Ihnen einen Link gesendet." (kein E-Mail-Leak)
- Nach Reset: Erfolgs-Seite + automatischer Redirect zum Login nach 3 Sekunden
- Abgelaufener Token: Fehler-Hinweis + Link zu "Neuen Link anfordern"

### Claude's Discretion

- Exakte Tailwind-Klassen und Spacing fuer alle neuen UI-Elemente
- StatusBanner Component-Erweiterung Implementierungsdetails
- Reklamation-Thumbnails Darstellung und Lightbox-Verhalten
- Passwort-Staerke-Anforderungen (min 8 Zeichen etc.)
- Upload-Component Implementierung (Drag&Drop vs. File-Input)
- Error-Handling und Loading-States fuer alle Formulare
- Neue Status-Farben fuer kundenantwort und stornierung_beantragt in STATUS_TAILWIND

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Kunden-Features Requirements
- `.planning/REQUIREMENTS.md` -- KUND-01 (Kundenantwort), KUND-02 (Stornierung), KUND-03 (Reklamation), KUND-04 (Passwort-Reset)

### Status-System (erweitern um 2 neue Status)
- `src/lib/status-config.ts` -- StatusKey Type (+ kundenantwort, stornierung_beantragt), STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, SPLITBUTTON_ACTIONS, ATTENTION_SCORE
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS (+ kundenantwort, stornierung_beantragt Transitions), COMMENT_REQUIRED

### E-Mail-System (Events verdrahten)
- `src/lib/email/event-matrix.ts` -- kundenantwort Event-Slot bereits vordefiniert, stornierung_beantragt + reklamation Events erweitern
- `src/lib/email/types.ts` -- EmailEventType Union (+ neue Events)
- `src/emails/templates/rueckfrage.tsx` -- Bestehendes Rueckfrage-Template (Referenz)
- `src/emails/templates/stornierung.tsx` -- Bestehendes Stornierung-Template (Referenz)
- `src/emails/templates/reklamation.tsx` -- Bestehendes Reklamation-Template (Referenz)
- `src/lib/email/queue.ts` -- queueEmailEvent() fuer alle Benachrichtigungen

### Kunden-Dashboard (UI erweitern)
- `src/components/kunden/anfrage-detail.tsx` -- Detail-View (Rueckfrage-Formular, Storno-Button, Reklamations-Bereich einbauen)
- `src/components/kunden/status-banner.tsx` -- StatusBanner (erweitern um Rueckfrage-Formular + stornierung_beantragt + kundenantwort)
- `src/components/kunden/angebots-annahme.tsx` -- AngebotAnnahmeButton Pattern (Vorlage fuer Confirm-Dialog)
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` -- Detail-Page (Server Component, Reklamation-Daten laden)
- `src/app/(frontend)/kunden/login/page.tsx` -- Login-Page (Passwort-vergessen Link)

### Bestehende Anfrage-Infrastruktur
- `src/collections/business/anfragen.ts` -- Anfragen Collection (stornierung_grund Feld existiert, afterChange Hooks)
- `src/collections/system/status-historie.ts` -- StatusHistorie Collection (anhaenge Feld hinzufuegen)

### Admin UI (Splitbutton + Liste)
- `src/components/admin/splitbutton.tsx` -- SPLITBUTTON_ACTIONS (neue Status hinzufuegen)
- `src/components/admin/anfragen-list-view.tsx` -- Anfragen-Liste (neue Status-Farben + Badges)
- `src/lib/list-view-helpers.ts` -- ATTENTION_SCORE (neue Status hinzufuegen)

### Gast-Routen Referenz (Pattern aus Phase 28)
- `src/app/(frontend)/angebot/[anfrageId]/page.tsx` -- Oeffentliche Angebots-Route (Vorlage fuer /rueckfrage/ und /reklamation/)
- `src/lib/rate-limit.ts` -- withRateLimit() / checkRateLimit() fuer Rate Limiting

### Vorherige Phase-Contexts
- `.planning/phases/21-kunden-dashboard-n8n/21-CONTEXT.md` -- Kunden-Dashboard Aufbau, Banner-Pattern, Kein CTA (jetzt gebaut)
- `.planning/phases/25-e-mail-system/25-CONTEXT.md` -- E-Mail-Queue, Event-Matrix, kundenantwort Slot
- `.planning/phases/28-angebots-workflow/28-CONTEXT.md` -- Gast-Route Pattern, Confirm-Dialog Pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatusBanner` (kunden/status-banner.tsx): Bereits Rueckfrage/Reklamation-Banner — erweitern um CTA + Formular
- `AngebotAnnahmeButton` (kunden/angebots-annahme.tsx): Confirm-Dialog Pattern — Vorlage fuer Storno-Dialog
- `STATUS_CUSTOMER_TEXT` (status-config.ts): Alle 20 Kunden-Texte — erweitern um kundenantwort + stornierung_beantragt
- `SPLITBUTTON_ACTIONS` (status-config.ts): Splitbutton-Config — erweitern um neue Status
- `ATTENTION_SCORE` (status-config.ts): Score-Map — erweitern um neue Status (Score 3)
- `queueEmailEvent()` (lib/email/queue.ts): E-Mail-Queuing — fuer alle Benachrichtigungen
- `checkRateLimit()` (lib/rate-limit.ts): Rate Limiting — fuer Gast-Routen und Passwort-Reset
- `formatCents()` (lib/format-currency.ts): Preisformatierung
- `getSettings()` (lib/settings.ts): Settings fuer Token-Ablaufzeiten etc.

### Established Patterns
- StatusBanner mit WARNING_STATUSES/ERROR_STATUSES Arrays (erweitern um neue Status)
- Inline-Formular Pattern (AngebotAnnahmeButton zeigt Confirm inline, kein Modal)
- Gast-Route mit UUID als Auth-Token (/angebot/[anfrageId] Pattern)
- afterChange Hooks fuer Business-Logik (Status-Wechsel → E-Mail queuen)
- API-Routes mit Zod-Validierung + Rate Limiting
- Server Components fuer Pages, Client Components fuer interaktive Elemente
- Payload Media Collection fuer Datei-Uploads

### Integration Points
- `src/lib/status-config.ts`: 2 neue Status (kundenantwort, stornierung_beantragt) in ALLE Maps eintragen
- `src/lib/status-transitions.ts`: Neue Transitions + COMMENT_REQUIRED fuer stornierung_beantragt → in_bearbeitung
- `src/collections/system/status-historie.ts`: Optionales `anhaenge` Upload-Array-Feld hinzufuegen
- `src/collections/business/anfragen.ts`: afterChange Hook um neue Events erweitern
- `src/payload.config.ts`: reklamationen Collection registrieren
- `src/components/admin/navigation.tsx`: Reklamationen Link in Navigation (unter Bestellungen-Dropdown)
- `src/components/kunden/status-banner.tsx`: WARNING_STATUSES um stornierung_beantragt + kundenantwort erweitern
- `src/app/(frontend)/kunden/login/page.tsx`: "Passwort vergessen?" Link
- Neue Routen: /api/kunden/antwort, /api/kunden/storno, /api/kunden/reklamation, /rueckfrage/[anfrageId], /reklamation/[anfrageId], /kunden/passwort-vergessen, /kunden/passwort-reset/[token]

</code_context>

<specifics>
## Specific Ideas

- Rueckfrage-Antwort im Banner: "Jetzt antworten" klappt Formular direkt im orange Banner auf — kein separater Bereich, kein Modal. Analogie zum AngebotAnnahmeButton Confirm-Pattern.
- Gast-Route fuer Rueckfrage zeigt Admin-Rueckfrage-Nachricht + Antwortfeld — Kunde versteht sofort worauf er antwortet.
- Stornierung ist bewusst NUR fuer eingeloggte Kunden (kein Gast-Zugang) — "ernsthafter Schritt, da soll man eingeloggt sein."
- Neuer Status kundenantwort gibt Admin sofortige Sichtbarkeit dass Kunde geantwortet hat — Attention-Score 3 priorisiert in der Liste.
- stornierung_beantragt erfordert Admin-Bestaetigung — KEIN automatisches Stornieren. Admin hat volle Kontrolle.
- Reklamation als eigene Collection ermoeglicht mehrere Reklamationen pro Anfrage und eigenen Status-Flow.
- Passwort-Reset E-Mail ueber E-Mail-Queue (Phase 25 System) — konsistentes Branding, kein Payload-Default.
- "Falls ein Konto mit dieser E-Mail existiert..." — kein E-Mail-Leak bei Passwort-vergessen.

</specifics>

<deferred>
## Deferred Ideas

- Chat-aehnliche Mehrfach-Antworten auf Rueckfragen (aktuell einmalig pro Zyklus) -- eigene Nachrichten-Collection, v2
- Kunden-Profil-Seite mit Adresse/Kontakt bearbeiten -- nicht Teil von Self-Service, eigene Phase
- Reklamation-Fotos Lightbox/Gallery im Admin -- Claude's Discretion fuer v1.4, aufwaendige Gallery v2
- Automatische Stornierung nach X Tagen ohne Zahlung -- eigene Business-Logik, nicht Self-Service
- Gast-Stornierung -- bewusst nur fuer eingeloggte Kunden, Gaeste rufen an

</deferred>

---

*Phase: 29-kunden-self-service*
*Context gathered: 2026-04-02*
