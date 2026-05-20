# Phase 15: Core Navigation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Custom Sidebar Component ersetzt Payload's Standard-Navigation komplett. Feste Links oben (Dashboard, Bestellungen, Produkte, Benutzer), 4 aufklappbare Dropdown-Sektionen (Bestellungsverwaltung, Produktverwaltung, Website, System) mit grauen Untergruppen-Ueberschriften in Produktverwaltung, eingebettetes WebhookFehlerBadge mit Error-Count auf zwei Ebenen, und aktive Link-Hervorhebung mit Akzent-Strich + Hintergrund.

</domain>

<decisions>
## Implementation Decisions

### WebhookFehlerBadge Darstellung
- **Doppelte Anzeige:** Error-Count `(n)` erscheint an zwei Stellen:
  1. Neben dem "System" Dropdown-Header — sichtbar auch wenn Dropdown geschlossen
  2. Neben dem "Webhook Fehler" Link innerhalb des aufgeklappten System-Dropdowns
- Beide Badges nur sichtbar wenn Error-Count > 0
- Badge-Refactoring noetig: Aktuelle Server Component (`getPayload()`) muss zu Client-Pattern werden (`useEffect` + `fetch('/api/webhook_errors')`) da Custom Nav `'use client'` ist
- **Warum doppelt:** Admin soll Fehler sehen ohne System-Dropdown oeffnen zu muessen, aber beim Aufklappen sofort erkennen welches Item gemeint ist

### Dropdown-Verhalten beim Seitenaufruf
- **Aktive Sektion automatisch offen:** Beim Laden wird der Dropdown geoeffnet, der einen Link enthaelt dessen URL zum aktuellen `pathname` passt (via `usePathname()`)
- Alle anderen Dropdowns bleiben geschlossen
- **Doppel-Highlight gewollt:** Wenn Admin auf `/admin/collections/anfragen` ist, sind sowohl "Bestellungen" (direkter Link) als auch "Anfragen" (im Dropdown) aktiv markiert — Breadcrumb-Effekt zur Orientierung
- **Phase 16 Uebergang:** Phase 16 legt sessionStorage-Persistenz als Layer darueber. Wenn gespeicherter Zustand existiert, gewinnt der. Wenn nicht, greift die URL-basierte Logik als Fallback. Kein Breaking Change noetig.

### Aktiver Link — Visueller Stil
- **Akzent-Strich links + subtiler Hintergrund** (Option 4)
- Gleicher Active-Stil fuer direkte Links (Dashboard, Bestellungen, etc.) und Dropdown-Items (Anfragen, Profile, etc.)
- Inactive Links leicht gedimmt (geringerer Kontrast), aber gut lesbar
- Deutliche Hervorhebung — Admin soll nicht suchen muessen wo er ist

### Styling-Stack und Design-Regeln
- **Shadcn UI Components:** `Collapsible` (Dropdowns), `Badge` (Error-Count), `Button` (Links/Toggle)
- **Tailwind CSS** fuer alles Styling — keine Inline-Styles, kein CSS-Modules, kein Payload-eigenes CSS
- **Groessere Texte** als Payload-Default, groessere Klickbereiche
- **Keine Underline-Hover-Effekte**
- **Keine Emojis** — nur Text-Labels (NAV-07, Feedback Memory)
- Eigener visueller Charakter erlaubt, aber nicht zu weit weg von Payload's Look
- Feintuning danach ueber Tailwind-Klassen moeglich

### Prerequisite: Shadcn Components installieren
- Shadcn ist konfiguriert (`components.json` existiert) aber keine Components installiert
- Vor Phase 15 Implementierung: `npx shadcn add collapsible badge button`
- Installiert Radix-Primitives als Dependencies und erstellt `src/components/ui/` Dateien

</decisions>

<code_context>
## Codebase Integration Points

### Bestehende Dateien (MODIFY)
- `src/payload.config.ts` — `Nav: '@/components/admin/custom-nav#default'` zu `admin.components` hinzufuegen, `afterNavLinks` Eintrag entfernen (wird durch eingebetteten Badge ersetzt)
- `src/components/admin/webhook-fehler-badge.tsx` — Refactoring von Server Component (`getPayload()`) zu Client-safe Pattern (`useEffect` + `fetch`)

### Neue Dateien (CREATE)
- `src/components/admin/custom-nav.tsx` — Haupt-Navigation Component (`'use client'`)
- `src/components/ui/collapsible.tsx` — via `npx shadcn add collapsible`
- `src/components/ui/badge.tsx` — via `npx shadcn add badge`
- `src/components/ui/button.tsx` — via `npx shadcn add button`

### Collection-Slug Mapping (vollstaendig)

**Direkte Links:**
| Nav-Label | Slug/URL |
|---|---|
| Dashboard | `/admin` |
| Bestellungen | `anfragen` → `/admin/collections/anfragen` |
| Produkte | `profile` → `/admin/collections/profile` |
| Benutzer | `users` → `/admin/collections/users` |

**Bestellungsverwaltung Dropdown:**
| Nav-Label | Slug |
|---|---|
| Anfragen | `anfragen` |
| Status-Historie | `status_historie` |

**Produktverwaltung Dropdown:**
| Untergruppe | Nav-Label | Slug |
|---|---|---|
| HAUPTPRODUKTE | Profile | `profile` |
| HAUPTPRODUKTE | Produkttypen | `produkttypen` |
| HAUPTPRODUKTE | Materialien | `materialien` |
| AUSSTATTUNG | Farben | `farben` |
| AUSSTATTUNG | Dichtungsfarben | `dichtungsfarben` |
| AUSSTATTUNG | Verglasungen | `verglasungen` |
| AUSSTATTUNG | Schallschutz | `schallschutz` |
| AUSSTATTUNG | Sicherheitsglas | `sicherheitsglas` |
| AUSSTATTUNG | Glasdekore | `glasdekore` |
| AUSSTATTUNG | Sprossen | `sprossen` |
| AUSSTATTUNG | Extras | `extras` |
| KONFIGURATION | Fluegelanzahl | `fluegelanzahl` |
| KONFIGURATION | Oeffnungsarten | `oeffnungsarten` |
| KONFIGURATION | Fensterformen | `fensterformen` |
| KONFIGURATION | Zusatzlichter | `zusatzlichter` |
| PREISE | Preisregeln | `preisregeln` |
| PREISE | Rabattcodes | `rabattcodes` |

**Website Dropdown:**
| Nav-Label | Slug/Type |
|---|---|
| Pages | `pages` (Collection, Puck-generiert) |
| Navigation | `navigation` (Global) → `/admin/globals/navigation` |
| Footer | `footer` (Global) → `/admin/globals/footer` |
| Puck Templates | Route → `/admin/puck-editor` |

**System Dropdown:**
| Nav-Label | Slug |
|---|---|
| Medien | `media` |
| Edit-History | `edit_history` |
| Webhook Fehler | `webhook_errors` (Global) → `/admin/globals/webhook_errors` |

### Verified Imports (aus Research)
- `@payloadcms/ui`: `useConfig`, `useAuth`, `useNav` (client hooks)
- `next/navigation`: `usePathname` (SSR-safe)
- `payload/shared`: `formatAdminURL` (baut Collection-URLs aus Admin-Route-Prefix)

### Bekannte Pitfalls
1. **afterNavLinks verschwindet still** wenn `admin.components.Nav` gesetzt wird — Badge in gleicher Aenderung migrieren
2. **importMap Path Format:** Exakt `'@/components/admin/custom-nav#default'` verwenden, `#default` nicht vergessen
3. **sessionStorage SSR Hydration:** Nur in `useEffect` lesen, nie waehrend Render
4. **Tailwind `.table` Utility:** Kann Payload Collection-Listen brechen — nach erstem Render alle Listen pruefen
5. **WebhookFehlerBadge Server/Client:** getPayload() → useEffect + fetch Refactoring noetig (bestaetigt durch Codebase Scout)

</code_context>

<deferred>
## Deferred Ideas

- **NAV-P2-01:** Auto-Expand der aktiven Dropdown-Sektion beim Seitenaufruf (UMGESETZT in Phase 15 als Default-Verhalten)
- **NAV-P2-02:** Animierte Dropdown-Uebergaenge (AnimateHeight aus @payloadcms/ui)
- **NAV-P2-03:** Cross-Session Dropdown-Persistenz via usePreferences (DB-backed)
- **Keyboard Navigation:** Arrow Keys, Escape-Close innerhalb Dropdowns
- **Benutzer-Trennung:** Team vs. Kunden in Navigation → Todo 011, nicht v1.2

</deferred>

---
*Context gathered: 2026-03-23*
*Discussed areas: WebhookFehlerBadge Darstellung, Dropdown-Verhalten, Aktiver Link Stil, Styling-Stack*
*Ready for: /gsd:plan-phase 15*
