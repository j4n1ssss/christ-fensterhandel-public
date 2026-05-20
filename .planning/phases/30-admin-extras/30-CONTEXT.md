# Phase 30: Admin-Extras - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin hat erweiterte Werkzeuge fuer E-Mail-Versand, Webhook-Monitoring und performante Anfragen-Listen. Umfasst: Webhook-Tab Redesign in der Anfrage-Detail-View, manueller E-Mail-Versand mit Template-Auswahl und Freitext, Server-seitige Pagination fuer die Anfragen-Liste mit URL-State, Dashboard-Performance-Optimierung, und Migration der alten webhook_errors Global auf email_queue.

Keine neuen Collections (ausser Schema-Erweiterungen auf email_queue). Keine neuen Status oder Transitions. Keine Kunden-facing Features.

</domain>

<decisions>
## Implementation Decisions

### Webhook-Tab Redesign (ADMN-01, ADMN-03)

#### Tab-Position & Sichtbarkeit
- 5. Tab "Webhooks" im TabPanel der Anfrage-Detail-View (neben Kontakt/Timeline/Notizen/Details)
- Zeigt nur Queue-Eintraege dieser Anfrage (gefiltert ueber neues anfrage Relationship-Feld)
- Nur fuer admin-Rolle sichtbar (Mitarbeiter/Viewer sehen den Tab nicht)
- Bestehende globale E-Mail Queue unter System-Dropdown bleibt erhalten

#### Darstellung
- Kompakte Zeilen: Event-Type, Status-Badge (sent/failed/dead), Zeitstempel, Empfaenger
- Aufklapp-Detail-Row: Betreff, Empfaenger, Attempts-Zaehler, Error-Log (letzte Fehlermeldung), Idempotency-Key. Kein HTML-Preview
- Kompakte Zahlenleiste oben: "12 gesendet . 1 fehlgeschlagen . 0 abgebrochen" als farbige Badges
- Kein Filtering (chronologische Liste reicht bei < 50 Eintraegen pro Anfrage)
- Sortierung: Neueste zuerst (createdAt DESC), max 50 Eintraege laden

#### Retry & Refresh
- Retry-Button bei failed/dead: Sofort re-queuen (setzt auf 'pending'), Toast "Erneut in Queue"
- Tab refresht automatisch nach Retry-Klick, sonst nur bei Tab-Wechsel/Load

#### Webhook-Logging Erweiterung (ADMN-03)
- email_queue speichert bereits alle Events (pending->sent/failed/dead) -- 'sent' = Erfolgs-Log
- Cleanup-Retention von 30 auf 90 Tage verlaengern (sent-Events 90 Tage behalten)

### Manueller E-Mail-Versand (ADMN-02)

#### Trigger & UI
- "E-Mail senden" Button im Kontakt-Tab (unter Kontaktdaten)
- Modal/Dialog wie Angebots-Modal (bewaehrtes Pattern)
- Single-Screen Layout: Template-Dropdown, Betreff (immer aenderbar), Freitext (optional), Empfaenger, Ersetzen/Zusaetzlich Radio, Vorschau-Button, Senden-Button
- Berechtigung: admin + mitarbeiter

#### Template-Auswahl
- Alle 9 bestehenden Kunden-Templates im Dropdown
- Zusaetzlich "Freitext (ohne Template)" als 10. Option
- Neues FreitextEmail React Email Template in der Registry: BaseLayout + Begruessung + Body-Prop + Anfrage-Referenz + CTA + Footer
- Template kann ohne Freitext gesendet werden (Standard-Text) ODER mit optionalem Freitext
- Freitext-Position: Nach der Begruessung ("Guten Tag [Name]"), vor dem Haupt-Content des Templates

#### Betreff
- Betreff-Feld ist immer sichtbar und aenderbar
- Bei Template-Auswahl: vorausgefuellt aus Event-Matrix, aber editierbar
- Bei Freitext-Option: leeres Betreff-Feld (Pflicht)

#### Empfaenger
- Vorausgefuellt mit Kunden-E-Mail
- Optionaler alternativer Empfaenger mit Radio-Button: "Statt Kunde" oder "Zusaetzlich zu Kunde"

#### Vorschau
- Inline iframe-Vorschau im Modal (unter den Formular-Feldern, Modal wird groesser)
- Echte Anfrage-Daten + eingegebener Freitext in der Vorschau
- Neue Route POST /api/admin/email-preview: { anfrageId, templateSlug, freitext?, subject? } -> rendert HTML
- Staff-geschuetzt (admin + mitarbeiter)

#### Server-Route
- POST /api/admin/send-email
- Payload: { anfrageId, templateSlug, subject, freitext?, to, mode: 'replace' | 'additional' }
- Server rendert Template mit echten Anfrage-Daten
- Validierung + CSRF-Schutz
- Rate-Limit: 10/min pro User (In-Memory Map, Phase 25 Pattern)

#### Event-Type & Protokollierung
- event_type fuer manuelle Sends: manuell_[templateSlug] (z.B. 'manuell_bestaetigung', 'manuell_freitext')
- E-Mail wird in email_queue eingereiht (normaler Queue-Weg)
- StatusHistorie-Eintrag mit eigenem Aktions-Typ 'email_gesendet': { aktion: 'email_gesendet', template, betreff, empfaenger, gesendet_von: userId }
- Kein Status-Wechsel durch manuellen Versand
- Timeline-Ansicht zeigt den Eintrag mit E-Mail-Icon, unterscheidet sich visuell von Status-Aenderungen

#### Error-Handling
- Template-Rendering fehlschlaegt: Fehlermeldung im Modal, kein Queue-Eintrag
- Anfrage geloescht waehrend Modal offen: Beim Senden wird Anfrage geprueft, Fehlermeldung + Modal schliessen

### Server-seitige Pagination (ADMN-04)

#### Pagination-Typ
- Offset-Pagination mit Seitenzahlen (Payload nativ unterstuetzt)
- 25 Eintraege pro Seite
- "Seite X von Y" + Zaehler pro Filter-Tab

#### Filter & Sortierung
- Filter-Tabs (Alle/Offen/Wartet/Angebot/Bezahlt/Abgeschlossen) als Query-Parameter an die API
- Sortierung server-seitig (inkl. Attention-Score)
- Freitext-Suche server-seitig (anfrage_nummer, Kundenname, E-Mail)
- Zaehler pro Filter-Tab: "Offen (12) . Wartet (5) . Angebot (3)" -- Count-Queries zusammen mit Anfragen-Liste in einer API-Route

#### Attention-Score Server-seitig
- Berechnung in der API-Route /api/admin/anfragen-list
- Formel 1:1 uebertragen: getAttentionScore() aus list-view-helpers.ts (Wartetage x STATUS_WEIGHT)
- list-view-helpers.ts ist reines Daten-Modul (kein React) -- direkt auf Server importierbar
- Bestehende Gewichtungen beibehalten (Anpassung deferred: ADMN-F04)

#### URL-State
- Query-Parameter: ?page=2&tab=offen&sort=attention&q=suchtext
- Browser-History per pushState/replaceState
- Seiten-Reload stellt State wieder her

#### Responsive
- Desktop-only. Keine Mobile/Tablet-Anpassungen fuer Admin Panel

### WebhookFehlerBadge Migration

- Badge in der Nav zaehlt jetzt nur 'dead' Eintraege aus email_queue (nicht mehr aus webhook_errors Global)
- Alte webhook_errors Global komplett entfernen (Config + Code loeschen, DB-Eintrag bleibt)
- Nav-Label aendern: "Webhook Fehler" -> "E-Mail Queue"
- Badge zeigt Anzahl dead-Events, kein Zeitfenster (Badge verschwindet wenn alle resolved)
- Bleibt unter System-Dropdown

### Dashboard-Overview Optimierung

- Eigene API-Route /api/admin/dashboard-stats: alle Statistiken in einem Request
- Bestehende 4 Stat-Karten bleiben: Neue heute, Offene gesamt, Bestaetigt (Monat), Umsatz
- Neue 5. Stat-Karte: "Dringend" (Anfragen mit >7 Tagen Wartezeit)
- Umsatz-Query: Server-seitige Aggregation statt limit=0 (Payload find mit Pagination, server-seitig summieren)
- Status-Verteilung, Letzte 10, Dringende-Liste bleiben
- Count-Queries parallel server-seitig

### email_queue Schema-Erweiterungen

- Neues Feld 'anfrage': Relationship zu anfragen Collection (fuer Tab-Filterung, beim Queuing gesetzt)
- Neues Feld 'sent_by': Relationship zu users Collection (wer hat manuell gesendet, null bei automatischen)
- Kein is_manual Flag -- wenn sent_by gesetzt, war es manuell
- subject Feld (bereits vorhanden) speichert den ggf. geaenderten Betreff

### Claude's Discretion

- Exaktes CSS/Layout der Webhook-Tab Zahlenleiste und Aufklapp-Rows
- StatusHistorie 'email_gesendet' Icon-Wahl und Timeline-Darstellung
- Freitext-Template interne Struktur (Props, Rendering)
- Dashboard-Stats API-Route Aggregations-Strategie
- Anfragen-Liste URL-Routing Integration mit Payload Admin Custom Views

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### E-Mail System (Phase 25)
- `.planning/phases/25-e-mail-system/25-CONTEXT.md` -- Template-Registry, Event-Matrix, Queue-Architektur, Worker-Flow
- `src/lib/email/queue.ts` -- Queue-Engine (queueEmailEvent, processQueue, cleanupSentEvents)
- `src/lib/email/event-matrix.ts` -- Event-Matrix Config (EmailEventType, EventConfig)
- `src/lib/email/types.ts` -- EmailEventPayload, Recipient Types
- `src/collections/system/email-queue.ts` -- email_queue Collection Schema (Felder, Access Control)

### Admin Detail View (Phase 19)
- `.planning/phases/19-admin-detail-view-redesign/19-CONTEXT.md` -- Tab-Panel Architektur, Splitbutton, Attention Bar
- `src/components/admin/anfrage-detail-view.tsx` -- Hauptkomponente der Detail-View
- `src/components/admin/tab-panel.tsx` -- TabPanel Component (4 Tabs, sessionStorage Persistenz)

### Anfragen-Liste
- `src/components/admin/anfragen-list-view.tsx` -- Aktuelle Liste mit limit=0 und client-side Sort/Filter
- `src/lib/list-view-helpers.ts` -- getAttentionScore(), getScoreColor(), formatRelativeTime()
- `src/lib/status-config.ts` -- STATUS_WEIGHT, STATUS_LABELS, STATUS_COLORS

### Dashboard
- `src/components/admin/dashboard-overview.tsx` -- Aktuelle Dashboard-Statistiken mit limit=0 Umsatz-Query

### Navigation
- `src/components/admin/custom-nav.tsx` -- Custom Admin Navigation
- `src/components/admin/webhook-fehler-badge.tsx` -- Aktueller Badge (liest aus webhook_errors Global)

### REQUIREMENTS
- `.planning/REQUIREMENTS.md` -- ADMN-01 bis ADMN-04 Requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TabPanel` Component (tab-panel.tsx): Erweiterbares Tab-System mit sessionStorage Persistenz. 5. Tab "Webhooks" hinzufuegen
- `email-queue-retry.tsx`: Bestehende Retry-Button Component fuer Queue-Eintraege
- `WebhookFehlerBadge` (webhook-fehler-badge.tsx): Badge-Component, muss auf email_queue Query umgestellt werden
- `AngebotsModal` (angebots-modal.tsx): Bewaehrtes Modal-Pattern, als Vorlage fuer E-Mail-Send-Modal
- `list-view-helpers.ts`: Reines Daten-Modul (kein React) mit getAttentionScore(), direkt server-seitig importierbar
- React Email Templates in `src/emails/`: 9 bestehende Templates + BaseLayout + wiederverwendbare Components
- Rate-Limiter Pattern aus Phase 25 (`/api/email-preview/[template]`): In-Memory Map mit Limit/Minute

### Established Patterns
- Admin Custom Views: React Components als Payload Custom Views (admin.views in payload.config.ts)
- Inline Styles + admin-custom.css: Strukturelle Styles als BEM-Klassen, Detail-Styles inline (kein Tailwind in Admin)
- Queue-basierte E-Mail-Architektur: queueEmailEvent() -> processQueue() -> N8N Webhook
- Status-Config als Single Source of Truth: status-config.ts fuer Labels, Farben, Transitions, Gewichtungen
- Optimistic Locking: Version-Feld auf Anfragen, 409-Conflict bei Race Conditions

### Integration Points
- TabPanel in anfrage-detail-view.tsx: 5. Tab einfuegen (Webhooks)
- email_queue Collection: Schema-Erweiterung (anfrage, sent_by Felder)
- anfragen-list-view.tsx: Kompletter Umbau auf Server-Pagination
- dashboard-overview.tsx: Umbau auf API-Route statt direkte Payload-Queries
- custom-nav.tsx: Nav-Label "Webhook Fehler" -> "E-Mail Queue", Badge-Quelle aendern
- Template-Registry: Neues FreitextEmail Template als 10. Eintrag

</code_context>

<specifics>
## Specific Ideas

- E-Mail-Modal Layout: Single-Screen mit Template-Dropdown, Betreff, Freitext, Empfaenger, Radio (Statt/Zusaetzlich), Vorschau inline, Senden-Button
- Freitext-E-Mail: Base-Layout mit Logo + "Guten Tag [Name]" + Freitext-Body + Anfrage-Referenz (#NR) + CTA "Anfrage ansehen" + Impressum-Footer
- URL-Parameter fuer Anfragen-Liste: ?page=2&tab=offen&sort=attention&q=suchtext
- Filter-Tab-Zaehler: "Offen (12) . Wartet (5) . Angebot (3)" direkt in den Tab-Labels
- Dashboard 5. Karte: "Dringend" mit Anzahl Anfragen >7 Tage Wartezeit

</specifics>

<deferred>
## Deferred Ideas

- ADMN-F04: Attention-Score Gewichtungen in Settings konfigurierbar (bleibt deferred)
- E-Mail-Einstellungsseite mit aktiv/inaktiv Toggles pro Event (ADMN-F01)
- Mobile/Tablet-Optimierung des Admin Panels
- Dark Mode fuer E-Mail-Templates
- HTML-Preview im Webhook-Tab Aufklapp-Row (nur Error-Log + Metadaten)

</deferred>

---

*Phase: 30-admin-extras*
*Context gathered: 2026-04-03*
