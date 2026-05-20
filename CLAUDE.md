# CLAUDE.md — Christ Fensterhandel GSD (Speed-Build)

## Projekt-Kontext

Dieses Projekt ist der **GSD-Speed-Build** des Christ Fensterhandel Konfigurator-Systems.
Der User promptet und ueberwacht — Claude/GSD baut.

## PFLICHT: Vor dem Start diese Dateien lesen

### 1. Lernplan (Technische Spezifikation + Phasen)
```
../lernplan-tech-stack.ipynb
```
Das Jupyter Notebook enthaelt den **kompletten Projektumfang** mit allen Phasen (1-17),
CMS-Collections, Konfigurator-Pipeline, Warenkorb, Auth, Stripe, N8N und Deployment.
**Diesen Lernplan als Basis-Spezifikation nutzen.**

### 2. Projekt-Dokumentation (Detailierte Anforderungen)
```
../../docs/                 → Produkt-/Spezifikations-Doku (Eltern-Projekt)
├── konfigurator/           → Konfigurator-Logik, Steps, CMS-Struktur, N8N
├── dashboard/              → Admin-Dashboard Anforderungen
├── research/               → Architektur-Entscheidungen, Tech-Stack
└── wissen/                 → Tech-Stack Uebersicht, Sicherheit

./docs/                     → Lokale Projekt-Doku (in diesem Ordner)
├── website/                → Seitenstruktur, Design System, Rechtliches (verschoben 2026-04-21)
├── audits/, todos/, research/, wissen/, entscheidungen/
```

### 3. Wichtigste Docs (Reihenfolge):
1. `../../docs/research/005_2026-03-04_architektur-entscheidungen-komplett.md` → Finale Architektur
2. `../../docs/konfigurator/002_2026-02-13_technische-umsetzung.md` → Konfigurator-Technik
3. `../../docs/konfigurator/004_2026-02-13_cms-struktur.md` → CMS Collections
4. `../../docs/konfigurator/steps/` → Alle Konfigurator-Steps im Detail
5. `../../docs/dashboard/` → Admin-Dashboard

## Tech-Stack (FIXIERT)

| Komponente | Technologie |
|------------|-------------|
| Framework | Next.js (App Router) |
| CMS | Payload CMS (embedded in Next.js) |
| Datenbank | **PostgreSQL** (NICHT SQLite!) |
| UI | Tailwind CSS + Shadcn UI |
| Forms | React Hook Form + Zod |
| Auth | Payload Auth (eingebaut) |
| Payments | Stripe (Test-Modus) |
| Automation | N8N (Webhooks) |
| Page Builder | Puck Editor (@delmaredigital/payload-puck) |
| Deployment | Coolify + Docker |

## Frontend / UI (STRIKT)

### Frontend Design Skill (PFLICHT bei UI-Aufgaben)

Bei **JEDER** UI-Aufgabe (Components, Pages, Layouts, Styles) den `/frontend-design` Skill nutzen.

**Warum:** Verhindert generisches AI-Styling (Inter Font, lila Gradient, langweilige Layouts).

**Wann aktivieren:**
- Neue Page erstellen
- Neue Component bauen
- Styling/CSS aendern
- Layout-Entscheidungen

**Workflow:**
1. Pruefen ob `.design/STYLE-GUIDE.md` existiert → als Basis nutzen
2. Pruefen ob `.design/inspo/` Screenshots existieren → als Referenz nutzen
3. `/frontend-design` Skill aktivieren
4. Component/Page bauen

### Style Guide + Design-Referenzen

```
.design/
├── STYLE-GUIDE.md              → Extrahierter Style Guide (Source of Truth fuer alle UI)
├── inspo/                      → Screenshots von Referenz-Websites
│   ├── 01-hero.png
│   ├── 02-section.png
│   └── ...
└── reference-template/         → Runtergeladenes Template (falls vorhanden)
```

- Der **STYLE-GUIDE.md** definiert: Farben, Fonts, Spacing, Animationen, Layout-Patterns
- ALLE UI-Elemente muessen dem Style Guide folgen — Konfigurator, Website-Pages, Kunden-Dashboard
- Payload Admin Dashboard ist ausgenommen (eigenes Theming begrenzt moeglich)
- Bei Abweichungen: User fragen, nicht eigenmmaechtig aendern

### Design-Konsistenz

- **Ein Style Guide fuer alles:** Website, Konfigurator, Kunden-Portal nutzen dasselbe Design System
- **Tailwind Config als Single Source:** Farben, Fonts, Spacing in `tailwind.config.ts` definiert
- **Shadcn Theme:** Shadcn Components an Style Guide anpassen (CSS Variables)
- **Keine generischen Defaults:** NICHT Inter, Roboto, Arial. NICHT lila-auf-weiss. NICHT Standard-Shadcn-Theme ohne Anpassung.

## Regeln

- **PostgreSQL von Anfang an** — kein SQLite, auch nicht zum Testen
- **Ein Projekt, ein Ordner** — alles baut aufeinander auf
- **Lernplan-Phasen als Milestones** — Phase 1-17 aus dem Notebook als GSD-Phasen uebernehmen
- **Docs als Source of Truth** — bei Unklarheiten die docs/ Dateien lesen, nicht raten
- **Parallel-Ordner:** Der Lern-Ordner `01-christ-fensterhandel-learn/` ist das Schwester-Projekt wo der User selbst schreibt. Nicht verwechseln oder veraendern.
- **Frontend Design Skill** — bei JEDER UI-Aufgabe `/frontend-design` nutzen (siehe oben)
