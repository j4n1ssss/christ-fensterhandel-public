# Phase 20: Admin List View Redesign - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Die Anfragen-Liste im Admin komplett umbauen: Filter-Tabs nach Workflow-Phase (5 Tabs mit Anzahl-Badge), Wartezeit-Spalte mit Farb-Codierung und farbigem Zeilenrand, Attention-Score fuer automatische Dringlichkeits-Sortierung mit visuellem Balken, und 3-Dot Menu fuer schnelle Aktionen. Die Detail-View (Phase 19) und das Kunden-Dashboard (Phase 21) sind separate Phasen.

</domain>

<decisions>
## Implementation Decisions

### Filter-Tabs (ADMN-07)

- 5 Tabs: Alle / Offen / Rueckfrage / In Produktion / Abgeschlossen
- Tab-Mapping (NICHT 1:1 mit STATUS_GROUP, sondern optimiert fuer Admin-Workflow):
  - **Alle** -- kein Filter
  - **Offen** -- neu, in_bearbeitung, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, wieder_geoeffnet
  - **Rueckfrage** -- rueckfrage, hersteller_problem, zahlungsproblem (alle Status die Admin-Aktion erfordern)
  - **In Produktion** -- an_hersteller, hersteller_bestaetigt, hersteller_bestaetigt_mit_vorbehalt, in_produktion, versandbereit, geliefert
  - **Abgeschlossen** -- abgeschlossen, abgelehnt, storniert
- Jeder Tab zeigt Anzahl-Badge mit Anzahl der Anfragen (z.B. "Rueckfrage (3)")
- Tab-Zustand per URL-Parameter persistiert (?tab=rueckfrage) -- teilbar, bookmarkbar, Browser-Zurueck funktioniert
- Smart Default: Wenn Rueckfrage > 0 startet dort, sonst Offen, sonst Alle

### Spalten & Zeilen-Layout

- Spalten pro Zeile: Anfrage-Nr, Kunde (Nachname), Status-Badge, Wartezeit-Badge, Produkt-Zusammenfassung (z.B. "2x Fenster, 1x Balkontuer"), Gesamtpreis, Letzte Aktion (z.B. "Angebot erstellt vor 2h"), Erstelldatum, 3-Dot Menu
- Wartezeit-Darstellung: Beides -- farbiger linker Rand an der gesamten Zeile (4px) UND farbiger Badge in der Wartezeit-Spalte
- Wartezeit-Schwellenwerte aus Phase 19: <1d gruen (kein Badge/Rand), 1-3d gelb, 3-7d orange, >7d rot
- Suchleiste ueber der Tabelle -- durchsucht Anfrage-Nr, Nachname, E-Mail (nutzt existierende listSearchableFields)
- Pagination mit 20-30 Eintraegen pro Seite, Seitenzahl in URL (?tab=offen&page=2)

### Attention-Score (ADMN-09)

- Formel: Wartezeit (Tage) x Status-Gewicht = Attention-Score
- Dreistufige Gewichtung:
  - **Gewicht 3** (Admin muss handeln): neu, in_bearbeitung, rueckfrage, hersteller_problem, zahlungsproblem, wieder_geoeffnet
  - **Gewicht 2** (Admin sollte pruefen): angebot_versendet, bestaetigt, zahlungslink_versendet, hersteller_bestaetigt_mit_vorbehalt
  - **Gewicht 1** (Wartet auf Externe): bezahlt, an_hersteller, hersteller_bestaetigt, in_produktion, versandbereit, geliefert, reklamation
  - **Gewicht 0** (Terminal): abgeschlossen, abgelehnt, storniert
- Score sichtbar als visueller Dringlichkeits-Balken in einer eigenen Spalte oder integriert in die Zeile
- Client-seitige Sortierung nach Laden (Payload hat keinen computed-field Sort)
- Default-Sortierung: Attention-Score (dringendste oben)
- Klickbare Spaltenueberschriften fuer alternative Sortierung (Datum, Preis, Name)

### Zeilen-Interaktion

- Zeilen-Klick navigiert direkt zur Anfrage-Detail-View (Phase 19 Redesign)
- 3-Dot Menu am Zeilenende mit:
  - Primaere Quick-Action aus QUICK_ACTIONS Map (z.B. "Anfrage annehmen" bei Status neu)
  - Trennlinie
  - "Details oeffnen" Link
  - Bei Terminal-Status: nur "Details oeffnen"
- Nach Quick-Action aus dem 3-Dot Menu: gesamte Liste neu laden (Reload, kein Optimistic Update)
- Kommentar-Pflicht bei COMMENT_REQUIRED Status: Detail-View oeffnen statt Inline-Kommentar in der Liste

### Claude's Discretion

- Exaktes Balken-Design fuer Attention-Score Visualisierung (Laenge, Farbe, Position)
- Pagination-Component Styling
- "Letzte Aktion" Berechnung (letzter Status-Wechsel als Text-Zusammenfassung)
- Suchleisten-Implementierung (Payload Pattern vs custom)
- 3-Dot Menu Dropdown-Implementierung (Radix Primitives)
- Produkt-Zusammenfassung Formatierung in der Zeile
- Empty-State wenn keine Anfragen im aktiven Tab

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` -- ADMN-07, ADMN-08, ADMN-09

### Status-System
- `src/lib/status-config.ts` -- STATUS_COLORS, STATUS_LABELS, STATUS_GROUP (Tab-Mapping-Basis), QUICK_ACTIONS (3-Dot Menu Actions)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS, COMMENT_REQUIRED
- `src/lib/detail-view-helpers.ts` -- getWaitingDays(), getUrgencyLevel(), URGENCY_COLORS, isTerminalStatus(), isCompletedStatus(), getProduktZusammenfassung()

### UX-Spezifikation
- `docs/todos/017_2026-03-22_bestellungs-flow-verbesserung.md` -- Quick-Actions-Tabelle, Wartezeit-Logik, Farb-Codierung

### Bestehende Listen-Referenz
- `src/components/admin/dashboard-overview.tsx` -- "Letzte 10 Anfragen" Tabelle mit Wartezeit-Spalte (Pattern-Referenz)
- `src/components/admin/attention-bar.tsx` -- Wartezeit + Status-Badge Pattern (wiederverwendbare Muster)

### Anfragen-Collection
- `src/collections/business/anfragen.ts` -- listSearchableFields (Zeile 70-74), admin.components.views (Zeile 75+)

### Admin CSS
- `src/styles/admin-custom.scss` -- BEM-aehnliche CSS-Klassen fuer Admin-Styling (Phase 19)

### Prior Phase Context
- `.planning/phases/19-admin-detail-view-redesign/19-CONTEXT.md` -- Wartezeit-Schwellenwerte, Splitbutton-Pattern, CSS-Klassen-Konvention, submitStatusChange() Logik

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `detail-view-helpers.ts`: getWaitingDays(), getUrgencyLevel(), URGENCY_COLORS, getProduktZusammenfassung() -- alle direkt in der Liste wiederverwendbar
- `status-config.ts`: STATUS_GROUP Map fuer Tab-Filterung, QUICK_ACTIONS fuer 3-Dot Menu Items
- `format-currency.ts`: formatCurrency() Helper
- `attention-bar.tsx`: Wartezeit-Badge + Status-Badge Rendering-Pattern als Vorlage
- `dashboard-overview.tsx`: Bestehende Tabellen-Struktur mit Wartezeit-Spalte als Ausgangspunkt

### Established Patterns
- Admin Styling: Inline Styles + CSS-Klassen in admin-custom.scss, var(--theme-*) Payload Variables, kein Tailwind
- Kein Shadcn im Admin: Radix Primitives direkt (relevant fuer 3-Dot Dropdown)
- BEM-aehnliche Klassen: .list-view, .list-view__row, .list-view__row--urgent etc.
- sessionStorage fuer UI-State (Phase 16), aber hier URL-Parameter fuer Tabs

### Integration Points
- Payload admin.components.views: Custom List View fuer Anfragen-Collection einhaengen
- URL-Parameter System: ?tab=offen&page=2&sort=attention_score
- QUICK_ACTIONS Map + submitStatusChange() Logik fuer 3-Dot Menu Status-Wechsel
- listSearchableFields bereits konfiguriert (anfrage_nummer, kontaktdaten.nachname, kontaktdaten.email)

</code_context>

<specifics>
## Specific Ideas

- Smart Default Tab: Admin landet automatisch beim "Rueckfrage"-Tab wenn dort Anfragen warten -- lenkt Aufmerksamkeit auf Dringendes
- Attention-Score als visueller Balken statt Zahl -- intuitiver fuer nicht-technische Admin-User
- Farbiger Zeilenrand (4px links) + Wartezeit-Badge = doppeltes visuelles Signal fuer Dringlichkeit
- "Letzte Aktion" Spalte gibt dem Admin sofort Kontext ohne Detail-View oeffnen zu muessen
- 3-Dot Menu mit nur primaerer Quick-Action + Detail-Link: Balance zwischen Schnelligkeit und Einfachheit
- Bei COMMENT_REQUIRED Status: 3-Dot Menu oeffnet Detail-View statt Inline-Kommentar (zu komplex fuer die Liste)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 20-admin-list-view-redesign*
*Context gathered: 2026-03-25*
