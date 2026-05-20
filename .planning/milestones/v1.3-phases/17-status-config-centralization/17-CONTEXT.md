# Phase 17: Status-Config Centralization - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

`src/lib/status-config.ts` als Single Source of Truth fuer alle Status-Metadaten erstellen. Alle 6 bestehenden Komponenten mit lokalen STATUS_COLORS/STATUS_LABELS Definitionen migrieren. Keine lokale Duplikation mehr. Keine neuen Statuse hinzufuegen — das ist Phase 18.

</domain>

<decisions>
## Implementation Decisions

### Kunden-Texte
- Ton: persoenlich-warm, Siezen ("Sie/Ihre")
- Jeder Status bekommt einen vollstaendigen deutschen Satz
- Konkrete Texte fuer die 7 bestehenden Statuse:
  - `neu`: "Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig."
  - `in_bearbeitung`: "Ihre Anfrage wird gerade von unserem Team bearbeitet."
  - `bestaetigt`: "Ihr Angebot ist fertig — Sie koennen es jetzt einsehen."
  - `bezahlt`: "Danke, Ihre Zahlung ist bei uns eingegangen."
  - `abgeschlossen`: "Ihre Bestellung ist erfolgreich abgeschlossen."
  - `rueckfrage`: "Wir haben eine Rueckfrage zu Ihrer Anfrage."
  - `abgelehnt`: "Ihre Anfrage konnte leider nicht beruecksichtigt werden."
- Phase 18 ergaenzt neue Statuse im selben Stil

### Kunden-Phasen-Zuordnung
- 5-Phasen-Modell: Anfrage → Angebot → Zahlung → Produktion → Lieferung
- `neu` → Anfrage
- `in_bearbeitung` → Anfrage
- `bestaetigt` → Angebot
- `bezahlt` → Zahlung
- `abgeschlossen` → Lieferung
- `rueckfrage` → Anfrage
- `abgelehnt` → Eigener Endstatus (KEIN Fortschrittsbalken, roter Hinweis stattdessen)
- `storniert` (Phase 18) → Eigener Endstatus analog zu `abgelehnt`
- Produktion-Phase bleibt leer bis Phase 18 neue Statuse einfuegt

### Migrations-Umfang
- **6 Dateien** migrieren (nicht 4 wie in den urspruenglichen Success Criteria)
- Admin-Komponenten (hex-Farben): status-workflow.tsx, status-timeline.tsx, anfrage-detail-view.tsx, dashboard-overview.tsx
- Kunden-Komponenten (Tailwind-Klassen): kunden/status-timeline.tsx, kunden/gast-tracking-form.tsx
- Verifikation: `grep -r "STATUS_COLORS\|STATUS_LABELS" src/` darf nur status-config.ts liefern

### E-Mail-Trigger
- ALLE 7 aktuellen Statuse sind kundenrelevant und loesen E-Mail-Trigger aus
- Kein Status ist "intern" bei den aktuellen 7 — der Kunde wird bei JEDEM Statuswechsel informiert
- `customer_facing: true` fuer alle 7
- Erst Phase 18 fuehrt interne Statuse ein (z.B. `an_hersteller`) wo `customer_facing: false` relevant wird

### Zukunfts-Struktur
- status-config.ts wird komplett vorbereitet mit allen Exports die v1.3 braucht
- Phase 18 erweitert den StatusKey Union Type und fuellt neue Werte ein
- Exports in Phase 17:
  - `StatusKey` (Union Type, 7 aktuelle Werte)
  - `STATUS_COLORS` (Record<StatusKey, string> — hex)
  - `STATUS_LABELS` (Record<StatusKey, string>)
  - `STATUS_TAILWIND` (Record<StatusKey, { bg, text, dot }> — Tailwind-Klassen)
  - `STATUS_CUSTOMER_TEXT` (Record<StatusKey, string>)
  - `STATUS_CUSTOMER_PHASE` (Record<StatusKey, CustomerPhase | null> — null fuer Endstatus ohne Fortschritt)
  - `STATUS_GROUP` (Record<StatusKey, StatusGroup>)
  - `EMAIL_TRIGGER_STATUSES` (StatusKey[])
  - Helper: `getStatusColor()`, `getStatusLabel()`, `isCustomerFacing()`

### Status-Gruppen
- 5 Gruppen fuer Filter-Tabs (Phase 20):
  - `offen`: neu, in_bearbeitung, rueckfrage
  - `zahlung`: bestaetigt, bezahlt
  - `produktion`: (leer — Phase 18 fuellt)
  - `lieferung`: (leer — Phase 18 fuellt)
  - `abgeschlossen`: abgeschlossen, abgelehnt

### Claude's Discretion
- Interne TypeScript-Typen-Struktur (z.B. StatusConfig Objekt vs separate Maps)
- Helper-Funktionen Signatur und Implementation
- Import-Pattern (named exports vs default export)
- Reihenfolge der Migration (welche Datei zuerst)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Status-System Spezifikation
- `.planning/REQUIREMENTS.md` — STAT-01 und STAT-02 definieren die Phase 17 Requirements
- `.planning/ROADMAP.md` §Phase 17 — Success Criteria mit Verifikations-Befehlen

### Architektur und Pitfalls
- `.planning/research/ARCHITECTURE.md` — Build Order Step 1 (status-config.ts), Separation von status-config.ts vs status-transitions.ts
- `.planning/research/PITFALLS.md` — Pitfall 1 (Centralization done last), Pitfall 8 (Customer mapping in wrong layer)
- `.planning/research/SUMMARY.md` — Executive Summary mit Abhaengigkeitskette
- `.planning/research/FEATURES.md` — P1 Feature: status-config.ts centralization
- `.planning/research/STACK.md` — Bestaetigung: keine neuen Dependencies fuer Phase 17

### Bestehende Duplikations-Stellen (alle 6 lesen!)
- `src/components/admin/status-workflow.tsx` — STATUS_COLORS (hex) + STATUS_LABELS, Zeile 6-23
- `src/components/admin/status-timeline.tsx` — STATUS_COLORS (hex) + STATUS_LABELS, Zeile 5-22
- `src/components/admin/anfrage-detail-view.tsx` — STATUS_COLORS (hex) + STATUS_LABELS, Zeile 8-25
- `src/components/admin/dashboard-overview.tsx` — STATUS_COLORS (hex) + STATUS_LABELS, Zeile 6-23
- `src/components/kunden/status-timeline.tsx` — STATUS_COLORS (Tailwind bg/text/dot) + STATUS_LABELS, Zeile 4-22
- `src/components/kunden/gast-tracking-form.tsx` — STATUS_LABELS + STATUS_COLORS (Tailwind), Zeile 34-51

### Bestehende Transition-Logik (NICHT aendern in Phase 17)
- `src/lib/status-transitions.ts` — VALID_TRANSITIONS, COMMENT_REQUIRED, bleibt separate Datei

### Projekt-Entscheidungen
- `.planning/PROJECT.md` §Key Decisions — "Inline Styles statt Tailwind im Admin", "Dual-Layer Kunden-Block"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/status-transitions.ts`: Bleibt getrennt von status-config.ts (Transition-Logik vs Display-Metadaten). Wird NICHT in Phase 17 geaendert.
- Admin-Komponenten nutzen inline styles mit Payload CSS Variables (`var(--theme-*)`) — hex-Farben aus status-config.ts passen direkt rein
- Kunden-Komponenten nutzen Tailwind-Klassen — STATUS_TAILWIND mit `{ bg, text, dot }` Objekten wird direkt in `className` verwendet

### Established Patterns
- Admin: `const color = STATUS_COLORS[status] || '#6b7280'` — Fallback-Pattern mit grauem Default
- Kunden: `const colors = STATUS_COLORS[status] || STATUS_COLORS.neu` — Fallback auf ersten Status
- Alle 6 Dateien verwenden `Record<string, string>` — wird zu `Record<StatusKey, string>` mit Type-Safety

### Integration Points
- status-config.ts wird von 6 Komponenten importiert (4 admin, 2 kunden)
- status-transitions.ts importiert NICHT aus status-config.ts und umgekehrt — separate Concerns
- N8N Webhook (`src/lib/n8n-webhook.ts`) wird in Phase 18 um `customer_facing` erweitert, nutzt dann `isCustomerFacing()` aus status-config.ts

</code_context>

<specifics>
## Specific Ideas

- "Der Kunde soll bei JEDEM Statuswechsel informiert werden. Keine internen Statuse — alles ist kundenrelevant." (fuer die aktuellen 7)
- Endstatus-Pattern: `abgelehnt` und `storniert` (Phase 18) bekommen keinen Fortschrittsbalken, sondern einen separaten roten Hinweis-Block
- Kunden-Texte sind bewusst warm/persoenlich gehalten im Siezen-Stil ("Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.")
- STATUS_GROUP `produktion` und `lieferung` bleiben in Phase 17 leer — Phase 18 fuellt sie mit neuen Statuse

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-status-config-centralization*
*Context gathered: 2026-03-23*
