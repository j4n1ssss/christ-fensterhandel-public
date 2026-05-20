# Phase 26: PDF-Infrastruktur - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

System generiert rechtskonforme Geschaeftsdokumente (Angebot, Rechnung, Gutschrift) als PDF und archiviert Rechnungen unveraenderbar. Umfasst: @react-pdf/renderer Infrastruktur, 3 PDF-Templates mit Shared Components, Rechnungen-Collection (immutable), Angebote-Collection (immutable nach Versand, versioniert), eigene PDF-Upload-Collection, Download-Integration in Admin + Kunden-Dashboard, PDF als Base64-Attachment im E-Mail-Queue Payload, und PDF-Preview Route fuer Staff.

Kein Angebots-Erstellungs-Modal (Phase 28), kein Stripe-Zahlungslink im PDF (Phase 27), keine Kunden-Self-Service Features (Phase 29).

</domain>

<decisions>
## Implementation Decisions

### PDF-Rendering-Technologie
- @react-pdf/renderer fuer alle PDF-Templates (JSX-Components, TypeScript, kein Browser noetig)
- Templates in `src/lib/pdf/` als eigener Ordner (analog zu src/lib/email/)
- Shared Components in `src/lib/pdf/components/`: Header (Logo + Firmendaten), Footer (Bankverbindung + Steuer + Kontakt + Seitenzahl), ProduktBlock, MwStBlock
- Zentraler `renderPDF(type: 'angebot'|'rechnung'|'gutschrift', anfrageId, settings)` Helper analog zu `renderEmailForEvent()` — Single Entry Point fuer API-Routes, E-Mail-Queue und Preview
- Synchrone Generierung in API-Route (kein Job-Queue — < 100 PDFs/Tag)
- Eine API-Route pro Dokumenttyp: /api/pdf/angebot/[anfrageId], /api/pdf/rechnung/[anfrageId], /api/pdf/gutschrift/[anfrageId]
- Einfacher Try/Catch als Memory-Guard (kein Semaphore — 8GB VPS, @react-pdf braucht ~50-100MB pro Render)
- System-Fonts (Helvetica eingebaut in @react-pdf) — keine Custom Fonts
- Nur A4 Hochformat
- Nur deutsche Sprache (wie E-Mails, Phase 25)
- PDF-Preview Route /api/pdf-preview/[type] mit Mock-Daten, Staff-geschuetzt (admin + mitarbeiter), analog zum E-Mail-Preview Pattern aus Phase 25

### Dokument-Layout & Design
- Professionell-schlichtes Business-Layout: Logo oben links, Firmen-/Kundendaten als Briefkopf, klare Tabelle, MwSt-Aufschluesselung, Footer mit Bankverbindung/Steuer/Kontakt
- Keine Farbakzente oder Dekorationen — wie typische deutsche Handwerker-Angebote
- Produkt-Beschreibung als kompakter mehrzeiliger Block mit ALLEN Konfigurations-Details:
  ```
  Pos 1: Fenster PVC — Drutex Iglo 5                    2x    499,00 EUR    998,00 EUR
         1200x1400mm | 2-fluegelig, Dreh-Kipp L+R
         Aussen: Anthrazit (RAL 7016) | Innen: Weiss | Dichtung: Schwarz
         2-fach Waermeschutz | Schallschutz Kl.3 | Griff Premium, Insektenschutz
  ```
- Footer dreispaltig: Links Bankverbindung (IBAN, BIC, Bank), Mitte Steuernummer/USt-IdNr, Rechts Kontaktdaten + Seitenzahl. Alles aus Settings Global.
- Angebots-PDF: Widerrufsbelehrung als Textblock am Ende (vor Footer), Text aus Settings Global (widerrufsbelehrung Textarea). Nur im Angebot, nicht in Rechnung/Gutschrift.
- Rechnungs-PDF: Alle 10 Pflichtangaben nach Paragraph 14 UStG (Steuernummer, fortlaufende RE-Nummer, MwSt-Ausweis, Zahlungsvermerk)
- Gutschrift-PDF: Referenz auf Original-Rechnung, eigene GS-Nummer

### Collections-Architektur
- **Rechnungen-Collection** (slug: 'rechnungen'): Speichert Rechnungen + Gutschriften. Typ-Feld: 'rechnung'|'gutschrift'. Komplett immutable (access update/delete: false, beforeChange Guard). Filter-Tabs in der Admin-Liste: Alle | Rechnungen | Gutschriften (wie Anfragen-Liste Pattern).
- **Angebote-Collection** (slug: 'angebote'): Separate Collection. Version als Number-Feld (1, 2, 3...). Immutable nach Versand (beforeChange Guard prueft status !== 'entwurf'). Neues Angebot bei Aenderungen = neuer Eintrag mit hoeherer Version.
- **PDF-Uploads-Collection** (slug: 'pdf_uploads'): Eigene Upload-Collection nur fuer PDFs. Trennt Geschaeftsdokumente von normalen Medien (Logo, Bilder). Rechnungen + Angebote haben relationship zu pdf_uploads.
- Access: Admin + Mitarbeiter sehen beide Collections. Erstellen kann nur Admin. Kunden sehen eigene Dokumente nur im Kunden-Dashboard.
- Navigation: Rechnungen und Angebote unter 'Bestellungen' Dropdown (neben Anfragen).

### Auto-Trigger & Generierung
- **Rechnung:** Automatisch bei Status-Wechsel auf 'bezahlt' (afterChange Hook). RE-Nummer via getNextNumber('RE'). Admin kann auch manuell Rechnung erstellen.
- **Angebot:** Automatisch bei Status-Wechsel auf 'angebot_versendet' (afterChange Hook). ANG-Nummer via getNextNumber('ANG'). Admin kann auch manuell ueber '+ Angebot erstellen' Button.
- **Gutschrift:** Automatisch bei Status-Wechsel auf 'rueckerstattung_abgeschlossen'. GS-Nummer via getNextNumber('GS'). Admin kann auch manuell fuer Teilerstattungen/Sonderfaelle.

### Download & Attachment-Flow
- **Admin Detail-View:** Dokumente-Bereich in der Anfrage-Detail-View (rechte Spalte). Liste aller Angebote/Rechnungen/Gutschriften fuer diese Anfrage mit Download-Button pro Dokument. Plus '+ Angebot erstellen' Button.
- **Kunden-Dashboard:** 'Ihre Dokumente' Sektion in der Anfrage-Detail-View mit Download-Links. API-Route prueft ob PDF zum eingeloggten Kunden gehoert.
- **Download streamt gespeichertes PDF** — kein erneutes Rendering. Garantiert Konsistenz mit Archiv.
- **E-Mail-Attachment:** PDF als Base64-String im Email-Queue-Eintrag (payload_data.attachments Array). PDF wird zum Snapshot-Zeitpunkt eingefroren. N8N bekommt { attachments: [{ filename, content_base64, mimetype }] }.
- **Dateiname-Schema:** Typ + Anfragenummer, z.B. Angebot_ANF-2026-0042_V1.pdf, Rechnung_ANF-2026-0042.pdf, Gutschrift_ANF-2026-0042.pdf

### Claude's Discretion
- @react-pdf/renderer StyleSheet Implementierung und exakte Layout-Details
- ProduktBlock Component Implementierung (Mapping Konfigurations-Snapshot zu Darstellung)
- PDF-Preview Mock-Daten Struktur
- Exakte Angebote-Collection Feld-Konfiguration (status, gueltig_bis, freitext etc.)
- PDF-Upload Collection Konfiguration (mimeTypes, maxFileSize)
- afterChange Hook Implementierung fuer Auto-Trigger (Error Handling, Reihenfolge mit E-Mail-Queue)
- Admin Detail-View Dokumente-Bereich Styling (Inline Styles + admin-custom.css)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### PDF Requirements
- `.planning/REQUIREMENTS.md` -- PDF-01 bis PDF-07 (Infrastruktur, Angebot, Rechnung, Gutschrift, Collection, Download, Attachment)

### PDF-Planung (Todos)
- `docs/todos/038_2026-03-27_angebot-pdf-generierung.md` -- Angebots-PDF Anforderungen, Inhalt, Zustellung
- `docs/todos/039_2026-03-27_rechnung-mwst-steuer.md` -- Rechnungs-PDF nach Paragraph 14 UStG, MwSt-Handling, Gutschriften

### Foundation (Phase 24 Infrastruktur)
- `src/lib/tax.ts` -- Cent-Integer MwSt-Berechnung: calcGrossFromNet, calcNetFromGross, calcTax, splitLine
- `src/lib/nummernkreise.ts` -- getNextNumber('ANG'|'RE'|'GS') fuer Dokumentnummern-Vergabe
- `src/lib/settings.ts` -- getSettings() Helper fuer Firmendaten, Steuer, pdf_logo, widerrufsbelehrung
- `src/payload-globals/settings.ts` -- Settings Global mit vorbereiteten Feldern: pdf_logo, widerrufsbelehrung, agb_link, angebots_gueltigkeit_tage
- `src/lib/format-currency.ts` -- formatCents() fuer Preise in PDFs

### E-Mail-System (Phase 25 Integration)
- `src/lib/email/render-email.ts` -- renderEmailForEvent() Pattern als Vorbild fuer renderPDF()
- `src/lib/email/types.ts` -- EmailEventPayload Interface (Attachments-Feld erweitern)

### Status-System
- `src/lib/status-config.ts` -- StatusKey Type, STATUS_LABELS (fuer Trigger-Status: 'bezahlt', 'angebot_versendet', 'rueckerstattung_abgeschlossen')
- `src/lib/status-transitions.ts` -- VALID_TRANSITIONS (welche Wechsel PDF-Generierung ausloesen)

### Admin UI Patterns
- `src/components/admin/anfrage-detail-view.tsx` -- Bestehende Detail-View (Dokumente-Bereich integrieren)
- `src/components/admin/navigation.tsx` -- Bestellungen-Dropdown erweitern um Rechnungen + Angebote

### Vorherige Phase-Contexts
- `.planning/phases/24-foundation/24-CONTEXT.md` -- Settings Global Struktur, Nummernkreise, tax.ts
- `.planning/phases/25-e-mail-system/25-CONTEXT.md` -- E-Mail-Queue, Webhook-Payload, Preview-Route Pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getSettings()` (lib/settings.ts): Liest Settings Global — fuer Firmendaten, Logo, Steuer in PDFs
- `getNextNumber('ANG'|'RE'|'GS')` (lib/nummernkreise.ts): Atomare Nummernvergabe mit Transaction — direkt nutzbar
- `calcGrossFromNet()`, `calcNetFromGross()`, `calcTax()`, `splitLine()` (lib/tax.ts): Cent-Arithmetik fuer MwSt-Berechnung
- `formatCents()` (lib/format-currency.ts): Cent-Formatierung fuer Preisanzeige
- `renderEmailForEvent()` (lib/email/render-email.ts): Pattern fuer renderPDF() — dynamic imports, Template-Registry, buildProps Switch
- Email-Preview Route: Pattern fuer PDF-Preview Route (Staff-geschuetzt, Mock-Daten)

### Established Patterns
- Payload Collections fuer persistente Daten (rechnungen, angebote folgen bestehendem Pattern)
- Payload Upload Collections fuer File-Storage (media Collection als Vorbild fuer pdf_uploads)
- afterChange Hooks fuer Auto-Trigger (anfragen.ts Hook-Chain: Status-Aenderung → Aktion)
- Custom Admin Pages mit Inline Styles + admin-custom.css (fuer Dokumente-Bereich in Detail-View)
- Filter-Tabs in List-View (Anfragen-Liste Pattern fuer Rechnungen: Alle | Rechnungen | Gutschriften)
- Immutable Collections via access + beforeChange Guard

### Integration Points
- `src/collections/business/anfragen.ts` afterChange Hook: PDF-Generierung bei Status-Wechsel (bezahlt, angebot_versendet, rueckerstattung_abgeschlossen)
- `src/payload.config.ts`: rechnungen, angebote, pdf_uploads Collections registrieren
- `src/components/admin/anfrage-detail-view.tsx`: Dokumente-Bereich in rechter Spalte integrieren
- `src/components/admin/navigation.tsx`: Bestellungen-Dropdown um Rechnungen + Angebote Links erweitern
- `src/lib/email/types.ts`: EmailEventPayload um attachments Array erweitern
- `src/lib/email/queue.ts` oder Worker: Attachments an N8N mitsenden
- Kunden-Dashboard: Dokumente-Sektion mit Download-Links

</code_context>

<specifics>
## Specific Ideas

- Produkt-Beschreibung als kompakter mehrzeiliger Block: "Muss auf die Rechnung, Kunde muss genau sehen was er bestellt hat"
- Dateiname-Schema mit Anfragenummer: Angebot_ANF-2026-0042_V1.pdf, Rechnung_ANF-2026-0042.pdf
- Filter-Tabs auf Rechnungen-Collection: "Wie bei der Anfragen-Liste"
- Rechnungen + Gutschriften zusammen (beide immutable), Angebote separat (versioniert, immutable nach Versand)
- Alle 3 Dokumenttypen: Auto-Trigger bei Status-Wechsel PLUS manueller Button fuer Sonderfaelle

</specifics>

<deferred>
## Deferred Ideas

- Angebots-Erstellungs-Modal mit Preis-Anpassung und Begruendung — Phase 28: Angebots-Workflow
- Stripe-Zahlungslink im Angebots-PDF — Phase 27: Stripe End-to-End
- AGB als PDF-Download neben AGB-Link — wenn AGB finalisiert sind
- PDF-Design mit Custom Fonts aus Style Guide — aktuell System-Fonts, spaeter optional
- Mehrsprachige PDFs (DE/EN) — wenn internationale Kunden kommen
- S3/Cloud Storage fuer PDFs — Docker Volume reicht, Migration spaeter moeglich

</deferred>

---

*Phase: 26-pdf-infrastruktur*
*Context gathered: 2026-03-31*
