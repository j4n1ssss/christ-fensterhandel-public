# Phase 4: Dashboards und Rollen - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin verwaltet Anfragen mit Status-Workflow und Historie im Payload Admin Panel (Custom Views), Kunden sehen eigene Anfragen unter /kunden/dashboard mit Login/Register. Rollenbasierter Zugriff auf API- und UI-Ebene. Stripe-Zahlung und E-Mail-Versand sind NICHT Teil dieser Phase (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Admin-Dashboard Ort
- Payload Admin Panel nutzen (kein eigenes Custom-Dashboard)
- Custom Dashboard-Startseite als Payload Admin Landing: Statistik-Karten (neue Anfragen heute, offene gesamt, bestaetigte diesen Monat, Umsatz), Status-Verteilung als farbige Badges, letzte 5-10 Anfragen als kompakte Liste
- Custom Anfrage-Detail-View: Alles auf einer Seite — Status-Timeline links, Produktliste mit Mini-SVG Mitte, Kontaktdaten + Notizen rechts, Schnell-Status-Buttons oben

### Kunden-Auth & Dashboard
- Login/Register mit Email + Passwort (Payload Auth eingebaut, kein externer Provider)
- Gastverfolgung: Gaeste koennen mit Anfrage-Nr + E-Mail ihren Status pruefen auf /status-pruefen
- Kunden-Dashboard unter /kunden/dashboard mit Konfigurator-Style (Tailwind + Shadcn, konsistent mit Frontend)
- Anfragen-Liste + Detail mit Status-Timeline (chronologisch)
- Kunde kann bei Status "Rueckfrage" antworten (Nachricht senden) und bei "Bestaetigt" zur Zahlung weitergehen (Stripe-Button, Funktion erst in Phase 5)
- Gast-Anfragen werden beim Registrieren automatisch dem Account zugeordnet (gleiche E-Mail)
- Kunde sieht: Status-Timeline, Produktkonfigurationen, Gesamtpreis. Sieht NICHT: interne Notizen, wer Status geaendert hat

### Status-Workflow
- Definierte Uebergaenge (nicht frei waehlbar):
  - NEU -> IN_BEARBEITUNG
  - IN_BEARBEITUNG -> BESTAETIGT / RUECKFRAGE / ABGELEHNT
  - BESTAETIGT -> BEZAHLT
  - BEZAHLT -> ABGESCHLOSSEN
  - ABGELEHNT -> NEU (Admin-Reopen)
  - ABGESCHLOSSEN -> IN_BEARBEITUNG (Admin-Reopen)
- Kommentar Pflicht bei RUECKFRAGE (Frage formulieren) und ABGELEHNT (Grund angeben), bei anderen optional
- Admin kann abgelehnte/abgeschlossene Anfragen wieder oeffnen (wird in Historie protokolliert)
- afterChange Hook fuer Status-Aenderungen wird vorbereitet (Webhook-Placeholder), E-Mail-Versand kommt in Phase 5

### Access Control
- Payload Access Control Policies auf ALLEN Collections (API + Admin Panel)
- **Admin**: Alles erlaubt — lesen, schreiben, loeschen, Users verwalten, CMS editieren
- **Mitarbeiter**: Status aendern, interne Notizen schreiben, Anfragen lesen. NICHT: Anfragen loeschen, Preise/Kontaktdaten aendern, Users verwalten, CMS Collections editieren
- **Viewer**: Alles lesen (inkl. Preise, Kontaktdaten, Notizen), nichts aendern
- **Kunde**: Nur eigene Anfragen lesen (serverseitig gefiltert), kein Zugriff auf Admin Panel
- API-Calls ohne passende Rolle werden abgelehnt (kein Umgehen ueber direkte API-Aufrufe)

### Claude's Discretion
- Payload Custom View Architektur (React Server Components vs. Client Components)
- Dashboard-Widget Layout und Responsive-Verhalten
- Exakte Access Control Policy Implementierung (Payload access functions)
- Gast-Tracking Formular Layout
- Kunden-Register Formular Felder (minimal vs. ausfuehrlich)
- Status-Timeline UI-Komponente Design
- Mini-SVG Groesse und Darstellung in der Anfrage-Detail-View
- afterChange Hook Struktur fuer spaetere N8N-Integration

</decisions>

<specifics>
## Specific Ideas

- Dashboard-Startseite soll dem Admin sofort zeigen was los ist — "wie viele neue Anfragen, was muss bearbeitet werden"
- Anfrage-Detail als Single-Page-View: Alles auf einen Blick ohne Tab-Wechsel
- Kunden-Dashboard im gleichen Style wie Konfigurator/Warenkorb — konsistentes Kundenerlebnis
- Gast-Tracking ermoeglicht Status-Pruefung ohne Account-Zwang
- Rueckfrage-Antwort vom Kunden: einfaches Nachricht-Feld, keine komplexe Chat-Funktion
- Stripe-Button bei "Bestaetigt" wird in Phase 4 als UI-Element vorbereitet, Funktion erst Phase 5

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Users` Collection (src/collections/system/users.ts): Rolle-Feld mit admin/mitarbeiter/viewer/kunde bereits angelegt
- `Anfragen` Collection (src/collections/business/anfragen.ts): Status-Feld, Produkte-Array, Kontaktdaten, interne Notizen, beforeChange Hook fuer StatusHistorie bereits implementiert
- `StatusHistorie` Collection (src/collections/business/status-historie.ts): Immutable (update/delete: false), Felder: anfrage, von_status, zu_status, geaendert_von, zeitpunkt, kommentar
- `AnfrageEditButton` Custom Component (src/components/admin/anfrage-edit-button.tsx): Bestehendes Pattern fuer Payload Custom Admin Components
- `WindowSVG` Component (src/components/konfigurator/preview/): Als Mini-SVG in Anfrage-Detail nutzbar
- `cn()` Utility, Zustand Store Pattern, React Hook Form + Zod — alles wiederverwendbar
- Shadcn UI Components (Button, Card, Input, etc.) — fuer Kunden-Dashboard

### Established Patterns
- Payload CMS 3.79 embedded in Next.js App Router
- UUID als IDs (PostgreSQL Adapter)
- Zustand mit persist + skipHydration fuer SSR
- Frontend unter src/app/(frontend)/ mit Tailwind + Shadcn
- Payload Admin Custom Components via import paths (@/components/admin/...)
- beforeChange Hooks fuer Business-Logik (Anfragen Collection)

### Integration Points
- src/app/(frontend)/layout.tsx: Navigation erweitern um Login/Dashboard Links
- Neue Frontend-Routes: /kunden/login, /kunden/register, /kunden/dashboard, /status-pruefen
- Payload Admin: Custom Views fuer Dashboard-Startseite und Anfrage-Detail
- Anfragen Collection: Access Control Policies hinzufuegen
- Alle Collections: Access Control Policies basierend auf User-Rolle
- Users Collection: Payload Auth ist bereits aktiviert (auth: true)

</code_context>

<deferred>
## Deferred Ideas

- Metriken-Dashboard mit Recharts (Anfragen/Monat, Kategorien-Verteilung) — v2 (ADMIN-V2-02)
- Produkt-Level Bestaetigung/Ablehnung mit Grund — v2 (ADMIN-V2-01)
- PDF-Generierung (Angebots-PDF aus Anfrage) — v2 (INT-V2-01)
- Rate-Limiting auf API-Endpoints — v2 (INT-V2-02)
- Passwort-Reset per E-Mail — braucht N8N, kommt mit Phase 5

</deferred>

---

*Phase: 04-dashboards-und-rollen*
*Context gathered: 2026-03-10*
