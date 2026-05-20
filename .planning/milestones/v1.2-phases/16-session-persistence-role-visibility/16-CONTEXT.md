# Phase 16: Session Persistence + Role Visibility - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Dropdown-Auf/Zu-Zustand wird session-persistent (sessionStorage) und Nav-Links werden basierend auf der User-Rolle gefiltert. Zusaetzlich wird der Admin-Panel-Zugang fuer `kunde`-Rolle blockiert (Redirect auf Kunden-Bereich). Die Custom Nav aus Phase 15 wird erweitert, nicht ersetzt.

</domain>

<decisions>
## Implementation Decisions

### Rollen-Filterung Ansatz
- **Eigene Rollen-Map pro Nav-Link** in der Nav-Config — kein Payload `visibleEntities` API-Call
- Jeder NavItem und jede NavSection erhaelt ein optionales `roles`-Array (z.B. `roles: ['admin']`)
- Fehlendes `roles`-Array = sichtbar fuer alle Staff-Rollen
- User-Rolle kommt aus `useAuth()` (bereits im Component vorhanden)

### Rollen-Sichtbarkeit
- **Viewer und Mitarbeiter sehen identische Nav-Links** — keine Nav-Unterscheidung zwischen diesen Rollen
- **Admin sieht alles** — alle Direktlinks, alle Dropdowns
- **Mitarbeiter/Viewer sehen:**
  - Direktlinks: Dashboard, Bestellungen, Produkte (3 von 4)
  - Dropdowns: Bestellungsverwaltung, Produktverwaltung (2 von 4)
- **Admin-only Bereiche:**
  - Direktlink: Benutzer
  - Dropdown: Website (Pages, Navigation, Footer, Puck Templates)
  - Dropdown: System (Medien, Edit-History, Webhook Fehler)
- **Kunden (`rolle === 'kunde'`):** Kein Zugang zum Admin-Panel — harter Block

### Kunden-Admin-Block
- Kunden duerfen sich NICHT im Admin-Panel einloggen
- Bei Zugriff auf `/admin` → Redirect auf `/kunden/login` (nicht eingeloggt) oder `/kunden/dashboard` (eingeloggt)
- Implementierung ueber `admin.access` in `payload.config.ts` ODER Next.js Middleware
- Kein Nav-Filtering fuer Kunden noetig — sie kommen gar nicht erst rein

### Session-Persistenz Verhalten
- **Dual-Logik:** URL-basiert bei SPA-Navigation, sessionStorage bei Reload/Tab-Wechsel
- Bei SPA-Navigation (pathname-Wechsel): Aktives Dropdown wird automatisch geoeffnet (URL-Logik wie in Phase 15)
- Bei Browser-Reload/Tab-Wechsel: sessionStorage-Zustand wird wiederhergestellt
- **Additiv oeffnen:** Bei Navigation oeffnet sich das aktive Dropdown ZUSAETZLICH zu bereits offenen — andere bleiben wie sie sind
- **Alles speichern:** Jedes manuelle Oeffnen UND Schliessen wird in sessionStorage geschrieben
- sessionStorage-Key: z.B. `admin-nav-sections` als JSON-Objekt `{ key: boolean }`
- Beim allerersten Laden (kein sessionStorage vorhanden): URL-basierte Logik als Fallback

### Leere Sektionen
- Wenn ein Dropdown nach Rollen-Filterung keine sichtbaren Items hat → **Dropdown komplett ausblenden** (Header verschwindet)
- **Dynamisches Layout:** Separator und Spacing passen sich an — keine leeren Luecken
- Separator zwischen Direktlinks und Dropdowns nur anzeigen wenn mindestens ein Dropdown sichtbar ist

### Dashboard
- Gleiches Payload Admin Dashboard fuer alle Staff-Rollen (admin, mitarbeiter, viewer)
- Keine rollenspezifischen Dashboard-Varianten in Phase 16

### Claude's Discretion
- Technische Entscheidung ob `admin.access` oder Middleware fuer Kunden-Block besser passt
- sessionStorage Key-Naming und Serialisierungs-Format
- Exakte Implementierung des Dual-Logik-Patterns (URL + sessionStorage)
- Ob `roles`-Array auf NavItem-Ebene oder NavSection-Ebene filtert (vermutlich beides)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Navigation Component (Phase 15 Basis)
- `src/components/admin/custom-nav.tsx` — Bestehende Custom Nav mit Dropdown-Sections, Active-Link-Highlighting, WebhookFehlerBadge
- `.planning/milestones/v1.2-phases/15-core-navigation/15-CONTEXT.md` — Phase 15 Entscheidungen, Collection-Slug Mapping, Pitfalls

### Access Control
- `src/access/role-checks.ts` — `hasRole()`, `isStaff()`, `staffCanRead()`, `staffCanWrite()` Funktionen
- `src/collections/system/users.ts` — Rollen-Definition (`admin | mitarbeiter | viewer | kunde`), bestehende `admin.hidden` Nutzung
- `src/payload.config.ts` — Admin-Config, Collection-Registrierung, Puck-Plugin Access

### Requirements
- `.planning/REQUIREMENTS.md` — UX-02 (Session-Persistenz), UX-03 (Rollen-Filterung)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAuth()` aus `@payloadcms/ui` — liefert `user.rolle` client-seitig, bereits in `custom-nav.tsx` importiert
- `hasRole()` / `isStaff()` aus `src/access/role-checks.ts` — Server-seitige Rollen-Checks, Pattern kann fuer Client-seitige Filterung adaptiert werden
- `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` aus Shadcn — bereits installiert und in Nav genutzt

### Established Patterns
- `custom-nav.tsx` nutzt `DIRECT_LINKS` und `DROPDOWN_SECTIONS` als statische Config-Arrays — Rollen-Map kann dort ergaenzt werden
- `useEffect` + `useState` fuer Dropdown-State — sessionStorage-Integration passt in dieses Pattern
- `isActive()` / `sectionHasActiveLink()` — URL-basierte Logik bereits vorhanden, muss mit sessionStorage koexistieren
- `users`-Collection hat `admin.hidden: ({ user }) => user?.rolle === 'kunde'` — einzige bestehende Hidden-Nutzung

### Integration Points
- `custom-nav.tsx` Zeile 396: `const [openSections, setOpenSections]` — hier sessionStorage-Layer einbauen
- `custom-nav.tsx` Zeile 398-404: `useEffect` mit pathname-basierter Logik — hier Dual-Logik implementieren
- `custom-nav.tsx` Zeile 406-408: `toggleSection` — hier sessionStorage-Write einbauen
- `payload.config.ts` `admin`-Sektion — hier `admin.access` fuer Kunden-Block
- `DIRECT_LINKS` und `DROPDOWN_SECTIONS` Arrays — Rollen-Map ergaenzen

</code_context>

<specifics>
## Specific Ideas

- Kunden-Redirect soll auf `/kunden/login` (nicht eingeloggt) oder `/kunden/dashboard` (eingeloggt als Kunde) zeigen
- Mitarbeiter/Viewer sollen sich auf "operatives Geschaeft" konzentrieren — Navigation spiegelt das wider
- Doppel-Highlight Breadcrumb-Effekt aus Phase 15 bleibt erhalten
- WebhookFehlerBadge ist nur fuer Admin relevant (System-Dropdown ist Admin-only)

</specifics>

<deferred>
## Deferred Ideas

- **NAV-P2-02:** Animierte Dropdown-Uebergaenge (AnimateHeight)
- **NAV-P2-03:** Cross-Session Dropdown-Persistenz via usePreferences (DB-backed)
- **Keyboard Navigation:** Arrow Keys, Escape-Close innerhalb Dropdowns
- **Rollenspezifisches Dashboard:** Verschiedene Dashboard-Ansichten pro Rolle
- **Benutzer-Trennung Team/Kunden:** Eigenes Todo 011, nicht Teil von v1.2

</deferred>

---

*Phase: 16-session-persistence-role-visibility*
*Context gathered: 2026-03-23*
*Discussed areas: Rollen-Filterung Granularitaet, Session-Persistenz Verhalten, Leere Sektionen, Direktlinks vs. Rollen*
*Ready for: /gsd:plan-phase 16*
