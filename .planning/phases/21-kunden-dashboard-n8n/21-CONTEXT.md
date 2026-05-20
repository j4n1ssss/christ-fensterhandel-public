# Phase 21: Kunden-Dashboard + N8N - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Kunden sehen ihren Bestellstatus in verstaendlicher Sprache mit 5-Phasen-Fortschrittsbalken und erhalten E-Mails bei relevanten Status-Aenderungen. Alle 20 Admin-Statuse werden auf kundenfreundliche Texte und ein 5-Phasen-Modell gemappt. Der N8N-Webhook feuert bei jedem Status-Wechsel, N8N filtert anhand customer_facing. Kein neues Kunden-Self-Service (Antworten, Stornierung) -- das ist v2.

</domain>

<decisions>
## Implementation Decisions

### Fortschrittsbalken-Design
- Visuelles Muster: Punkte + Linie (klassisches Stepper-Pattern)
- 5 Kreise verbunden durch horizontale Linie
- Erledigte Schritte: gefuellter Kreis (emerald-500) + gruene Linie
- Aktueller Schritt: groesserer Kreis + subtile Puls-Animation (Tailwind keyframe)
- Kommende Schritte: leerer Kreis (gray-300) + graue Linie
- Labels unter jedem Punkt: Anfrage, Angebot, Zahlung, Produktion, Lieferung
- Farbschema: Gruen-Progression (emerald-500 erledigt, primary aktiv, gray-300 kommend)
- Zwei Varianten:
  - **Voll** (Detail-View): Punkte + Linie + Labels darunter, volle Breite
  - **Mini** (Anfragen-Liste): Nur Punkte ohne Labels, kompakter Indikator pro Karte

### Dashboard-Umbau-Umfang
- Gezieltes Upgrade: bestehendes Layout (2-Spalten Timeline + Produkte) beibehalten
- Fortschrittsbalken oben einfuegen (direkt unter Header, vor den Karten)
- Kunden-Text aus STATUS_CUSTOMER_TEXT als Hinweis-Satz unter dem Fortschrittsbalken
- Status-Timeline im Kunden-Bereich zeigt Kunden-Texte statt interner Labels (kein interner Key sichtbar)
- Anfragen-Liste: Mini-Fortschrittsbalken STATT StatusBadge (StatusBadge entfaellt in der Liste)
- Stripe-Zahlungsbutton bleibt bei Status bestaetigt (aktuelles Verhalten beibehalten, NICHT auf zahlungslink_versendet verschieben)

### Endstatus-Darstellung (storniert/abgelehnt)
- Roter Hinweis-Banner STATT Fortschrittsbalken (kein ausgegrauter Balken)
- Banner zeigt Kunden-Text aus STATUS_CUSTOMER_TEXT
- red-50 Hintergrund + border-red Styling
- Rest der Seite (Produkte, Timeline) bleibt sichtbar

### Sonderstatus-Banner
- Banner-Pattern fuer ALLE Sonderstatus wiederverwenden:
  - rueckfrage: orange-50 Banner ("Wir haben eine Rueckfrage zu Ihrer Anfrage." + Verweis auf Timeline)
  - hersteller_problem: orange-50 Banner ("Wir melden uns bei Ihnen bezueglich Ihrer Bestellung.")
  - zahlungsproblem: red-50 Banner ("Es gibt ein Problem mit Ihrer Zahlung...")
  - reklamation: orange-50 Banner ("Ihre Reklamation wird bearbeitet.")
  - storniert: red-50 Banner (Endstatus, kein Fortschrittsbalken)
  - abgelehnt: red-50 Banner (Endstatus, kein Fortschrittsbalken)
- Kein CTA-Button in Bannern (Kunden-Antwort ist v2/SELF-Service)
- Kunden-Text kommt direkt aus STATUS_CUSTOMER_TEXT -- kein Hardcoding

### N8N E-Mail-Trigger
- Webhook feuert bei JEDEM Status-Wechsel (nicht nur bei customer_facing: true)
- N8N filtert anhand customer_facing Flag ob E-Mail gesendet wird
- Bestehende event_types reichen (status_aenderung) -- keine neuen Types
- Payload-Seite sicherstellen: customer_facing, kunden_text, kunden_phase korrekt befuellt
- Zusaetzlich: N8N-Workflow-Dokumentation als Markdown (empfohlener Workflow: Trigger -> Filter -> E-Mail-Template)

### Claude's Discretion
- Exakte Tailwind-Klassen und Spacing fuer Fortschrittsbalken
- Puls-Animation Keyframe-Definition
- Breakpoint-Verhalten des Fortschrittsbalken auf Mobile (horizontal vs. kompakt)
- Mini-Fortschrittsbalken Groesse und Spacing in der Anfragen-Liste
- N8N-Workflow-Doku Detailtiefe und Struktur
- Banner-Component API (Props, Varianten-Handling)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bestellungsflow-Spezifikation
- `docs/todos/017_2026-03-22_bestellungs-flow-verbesserung.md` -- Admin-Status zu Kunden-Text Mapping, 5-Phasen-Modell, E-Mail-Trigger-Liste

### Status-System (Single Source of Truth)
- `src/lib/status-config.ts` -- STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, EMAIL_TRIGGER_STATUSES, isCustomerFacing(), STATUS_TAILWIND (alle 20 Statuse)
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS, COMMENT_REQUIRED

### Bestehende Kunden-Komponenten (alle lesen!)
- `src/components/kunden/anfrage-detail.tsx` -- Detail-View mit 2-Spalten (Timeline + Produkte), StatusBadge, Stripe-Button
- `src/components/kunden/anfragen-liste.tsx` -- Anfragen-Karten mit StatusBadge, Preis, Datum
- `src/components/kunden/status-timeline.tsx` -- StatusTimeline + StatusBadge Components (nutzt STATUS_TAILWIND + getStatusLabel)
- `src/components/kunden/stripe-pay-button.tsx` -- Stripe-Zahlungsbutton (bei bestaetigt)

### Kunden-Dashboard Pages
- `src/app/(frontend)/kunden/dashboard/page.tsx` -- Dashboard-Uebersicht (Server Component, Auth + Anfragen-Query)
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` -- Detail-Page (Server Component, Auth + Ownership-Check + StatusHistorie)

### Webhook-System
- `src/lib/n8n-webhook.ts` -- WebhookPayload Interface mit customer_facing, kunden_text, kunden_phase

### Vorherige Phase-Contexts
- `.planning/phases/17-status-config-centralization/17-CONTEXT.md` -- Kunden-Text-Stil (warm, Siezen), 5-Phasen-Modell, Endstatus-Pattern
- `.planning/phases/18-statuses-transitions-collection-felder/18-CONTEXT.md` -- 20 Statuse, customer_facing Liste, WebhookPayload-Erweiterung

### Requirements
- `.planning/REQUIREMENTS.md` -- STAT-05, KUND-01, KUND-02, N8N-01

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `STATUS_CUSTOMER_TEXT` (status-config.ts): Alle 20 Kunden-Texte bereits vorhanden -- direkt verwenden
- `STATUS_CUSTOMER_PHASE` (status-config.ts): Alle 20 Phase-Zuordnungen vorhanden (null fuer Endstatus)
- `CustomerPhase` Type (status-config.ts): "Anfrage" | "Angebot" | "Zahlung" | "Produktion" | "Lieferung"
- `STATUS_TAILWIND` (status-config.ts): Tailwind-Klassen fuer alle 20 Statuse -- fuer farbige Banner nutzbar
- `isCustomerFacing()` (status-config.ts): Helper zum Pruefen ob Status customer-facing ist
- `getStatusLabel()` (status-config.ts): Liefert interne Labels -- muss in Kunden-Views durch STATUS_CUSTOMER_TEXT ersetzt werden
- `StatusBadge` (kunden/status-timeline.tsx): Bestehender Badge -- wird in Liste durch Mini-Fortschrittsbalken ersetzt
- `formatCurrency()` (src/lib/format-currency.ts): Bereits als standalone Modul extrahiert (Phase 19)

### Established Patterns
- Kunden-Komponenten: Tailwind CSS + Shadcn CSS Variables (bg-card, text-foreground, etc.)
- Server Components fuer Pages: getPayload() + getCurrentUser() + Payload Local API
- Client Components fuer interaktive Elemente: "use client" Direktive
- Status-Fallback: `STATUS_TAILWIND[status as StatusKey] || STATUS_TAILWIND.neu`
- Status-Timeline: reverse chronologisch sortiert, Dot-Farben aus STATUS_TAILWIND

### Integration Points
- anfrage-detail.tsx: Fortschrittsbalken + Kunden-Text-Hinweis einbauen, StatusBadge durch Kunden-Phase ersetzen
- anfragen-liste.tsx: StatusBadge durch Mini-Fortschrittsbalken ersetzen
- status-timeline.tsx: getStatusLabel() durch STATUS_CUSTOMER_TEXT ersetzen fuer Kunden-Ansicht
- n8n-webhook.ts: afterChange Hook pruefen ob customer_facing korrekt gesetzt wird
- anfragen.ts (Collection): afterChange Hook sendet bereits WebhookPayload -- Verdrahtung verifizieren

</code_context>

<specifics>
## Specific Ideas

- Zwei Fortschrittsbalken-Varianten: Voll (mit Labels) fuer Detail-View, Mini (nur Punkte) fuer Listen-Karten
- Mini-Fortschrittsbalken ERSETZT StatusBadge in der Liste komplett -- nicht additiv
- Kein CTA in Sonderstatus-Bannern (Kunden-Antwort/Self-Service ist v2)
- Stripe-Button bei bestaetigt beibehalten (nicht auf zahlungslink_versendet verschieben) -- bestehendes Verhalten ist korrekt fuer den Kunden-Flow
- N8N Webhook feuert IMMER (auch bei internen Status-Wechseln) -- N8N filtert selbst, das gibt Flexibilitaet fuer spaetere Workflows (Logging, Audit)
- N8N-Workflow-Dokumentation als Markdown mitliefern: empfohlener Flow Trigger -> customer_facing Filter -> E-Mail-Template pro Status

</specifics>

<deferred>
## Deferred Ideas

- Kunden-Antwort auf Rueckfrage (CTA-Button, Formular) -- v2/SELF-01
- Kunden-Stornierung einreichen -- v2/SELF-01
- Kunden-Reklamation mit Fotos einreichen -- v2/SELF-02
- N8N E-Mail-Templates als eigene CMS-Collection -- v2/AUTO-02
- Gast-Tracking (Anfrage-Status ohne Login) -- v2

</deferred>

---

*Phase: 21-kunden-dashboard-n8n*
*Context gathered: 2026-03-26*
