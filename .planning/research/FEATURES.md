# Feature Landscape: v1.4 Bestellungsflow + Integrationen

**Domain:** B2B Fenster-Konfigurator -- Stripe, E-Mail, PDF, Kunden-Self-Service, Admin Settings
**Researched:** 2026-03-27
**Confidence:** HIGH (existing codebase examined, todo specs reviewed, Stripe/UStG docs verified)

## Context

v1.3 shipped with 20-status order flow, AttentionBar + Splitbutton admin UX, 5-phase customer progress bar, and N8N webhook triggers on 14 customer-facing status changes. v1.4 builds on this foundation to make the order flow end-to-end: automatic payment links, professional email templates, legally compliant invoices, and customer self-service actions.

### What Already Exists (DO NOT rebuild)
- Stripe Checkout Session creation (`src/lib/stripe.ts` + `src/app/api/stripe/checkout/route.ts`)
- Stripe webhook handler for `checkout.session.completed` (`src/app/api/stripe/webhook/route.ts`)
- N8N webhook sender with error tracking to Payload Global (`src/lib/n8n-webhook.ts`)
- WebhookPayload interface with `customer_facing`, `kunden_text`, `kunden_phase` fields
- 20 statuses in `status-config.ts` with EMAIL_TRIGGER_STATUSES (14 triggers)
- QUICK_ACTIONS map for Splitbutton per status
- 3 existing Payload Globals: `webhook_errors`, `navigation`, `footer`
- StripePayButton component in Kunden-Dashboard (basic)
- CSRF protection via `isSameOriginOrReferer` on Stripe checkout route

---

## Table Stakes

Features users and the business EXPECT. Missing any of these = the system is incomplete for production use.

### 1. Stripe Zahlungslink-Automatisierung

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Auto-create Checkout Session on "zahlungslink_versendet" | Admin clicks Splitbutton "Zahlungslink senden" and the payment link MUST exist automatically. Manual Stripe dashboard link creation is a dealbreaker for a 2-5 person team. Every B2B order system (Shopify, WooCommerce, Billomat) auto-generates payment links on status change. | MEDIUM | Extends existing `createCheckoutSession()` in `src/lib/stripe.ts`. Trigger from `afterChange` hook on Anfragen when status changes to `zahlungslink_versendet`. |
| Store `stripe_checkout_url` + `stripe_session_id` + `stripe_payment_intent_id` on Anfrage | Admin needs to see the payment link, copy it, and know the Stripe reference for support cases. Customer dashboard needs the link for the "Jetzt bezahlen" button. Without these fields, payment tracking is blind. | LOW | New fields on `anfragen.ts` collection. |
| Payment link visible + copyable in Admin detail view | Admin must see the link status (aktiv/abgelaufen/bezahlt) at a glance. Standard in every payment dashboard. | LOW | Reads from new Anfrage fields. Renders in `anfrage-detail-view.tsx`. |
| "Jetzt bezahlen" button in Kunden-Dashboard | The customer receives an email with a payment link AND sees the button in their dashboard. Both channels must work. Missing the dashboard button = customer calls "where do I pay?" | LOW | Extends existing `stripe-pay-button.tsx`. Uses `stripe_checkout_url` from Anfrage. |
| Checkout Session with `expires_at` + `after_expiration` recovery | Stripe sessions expire after 24h by default. Without explicit expiry handling, expired links result in confused customers and admin confusion. Stripe's `after_expiration.recovery.enabled = true` provides a recovery URL automatically. | LOW | Parameter on `sessions.create()`. Store `expires_at` on Anfrage for display. |
| "Neuen Zahlungslink erstellen" when link expired | Admin needs a one-click way to regenerate an expired link. The old session must be expired/invalidated first to prevent double payment. | LOW | Expire old session via `stripe.checkout.sessions.expire()`, create new one. |
| One active Checkout Session per Anfrage (no duplicates) | Race condition: admin clicks "Zahlungslink senden" twice. Without dedup, two sessions exist and customer could pay twice. Stripe does NOT prevent this automatically. | MEDIUM | Before creating new session: check if `stripe_session_id` exists and is still active. If active, return existing URL. If expired, create new. Invalidate old on regeneration. |
| `checkout.session.expired` webhook handler | When a link expires without payment, admin must be notified. Status should reflect this (stay at `zahlungslink_versendet`, not auto-change). Stripe fires this event automatically when `expires_at` passes. | LOW | New case in `src/app/api/stripe/webhook/route.ts`. Log expiry, optionally notify admin via N8N. |
| Webhook idempotency (process each event exactly once) | Stripe retries webhooks for up to 3 days on 5xx responses. Without idempotency, the same payment could update the Anfrage status multiple times, trigger multiple N8N emails, etc. | LOW | Check `event.id` against a processed events store (simple: check if status already matches target; robust: store event IDs in a Set or DB field on the Anfrage). Current code has basic idempotency (`if (anfrage.status !== 'bezahlt')`) -- extend pattern to all webhook event types. |

### 2. Stripe Rueckerstattung

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Admin-triggered refund via Stripe API | When admin clicks "Stornieren" on a paid Anfrage, the refund must be processed through Stripe, not manually in the Stripe Dashboard. For a 2-5 person team, context-switching to Stripe Dashboard for every cancellation is unacceptable. | MEDIUM | New API route `src/app/api/stripe/refund/route.ts`. Uses `stripe.refunds.create({ payment_intent: anfrage.stripe_payment_intent_id })`. |
| Partial refund support | Hersteller has already started production when customer cancels. Admin needs to refund only the non-incurred cost. Stripe supports this via `amount` parameter on refund creation. | LOW | `stripe.refunds.create({ payment_intent, amount: partialAmountInCents })`. Uses existing `rueckerstattung_betrag` field from v1.3. |
| `charge.refunded` webhook handler | After refund processes, Anfrage must auto-update `rueckerstattung_status` to "durchgefuehrt". Without this, admin must manually check Stripe and update the Anfrage. | LOW | New case in webhook handler. Updates `rueckerstattung_status` field. |
| Refund status fields on Anfrage | `rueckerstattung_betrag`, `rueckerstattung_status` (ausstehend/durchgefuehrt/teilweise/abgelehnt), `stripe_refund_id`. Already partially defined in v1.3 status-config. | LOW | Fields already conceptualized in v1.3. Need to be added to `anfragen.ts` if not yet present. |

### 3. Stripe Chargeback/Dispute Handling

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| `charge.dispute.created` webhook handler | Chargebacks happen. Without handling this event, the admin discovers a dispute weeks later in the Stripe Dashboard. Status must change to `zahlungsproblem` immediately. Stripe gives 7-21 days to respond -- missing the deadline means automatic loss. | LOW | New case in webhook handler. Set status to `zahlungsproblem`. Send N8N notification to admin. |
| Dispute notification to admin | Admin must know IMMEDIATELY when a chargeback occurs. This is a financial emergency. | LOW | N8N webhook with `event_type: 'chargeback'` or similar. |

### 4. E-Mail Event-Matrix + Templates

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Complete event-to-recipient matrix (18 events) | The 14 `EMAIL_TRIGGER_STATUSES` from v1.3 only cover customer-facing triggers. Staff notifications (neue Anfrage an Mitarbeiter, Kundenantwort an Mitarbeiter, Reklamation an Admin) are missing. Without staff emails, the admin must check the dashboard constantly. | LOW | Extend `WebhookPayload` interface with `recipients: ('kunde' \| 'mitarbeiter' \| 'admin')[]`. Define matrix as config object in `src/lib/email-config.ts`. |
| Base email layout (header + footer + content slot) | All transactional emails must look professional and consistent. A text-only email with "Ihre Anfrage ist in Bearbeitung" looks unprofessional. Industry standard: branded header (logo, company name), content area, footer (Impressum, Datenschutz, Kontakt). | MEDIUM | Use React Email (`@react-email/components`) for component-based templates. Render to HTML string server-side via `render()`. Pass HTML to N8N. React Email chosen because: (1) team already uses React/TSX, (2) components are type-safe with props, (3) `render()` produces email-client-compatible HTML, (4) dev server for preview. MJML is the alternative but requires learning a new syntax. |
| Per-event email templates (9 distinct templates) | Not every status change needs a unique template. Group by purpose: (1) Anfrage-Bestaetigung, (2) Status-Update (generic with variable status text), (3) Angebot bereit, (4) Zahlungslink, (5) Zahlungsbestaetigung, (6) Stornierung, (7) Rueckfrage, (8) Reklamation-Update, (9) Rueckerstattung. | MEDIUM | Each template is a React Email component in `src/email-templates/`. Props: `kunde_name`, `anfrage_nummer`, `status_text`, `action_url`, `freitext`. Uses base layout. |
| Email preview route (`/api/email-preview/[template]`) | Developers and admin must verify email appearance before deploying. Sending test emails for every change is slow. Standard in React Email ecosystem. | LOW | API route renders template with sample data, returns HTML. Protected by admin auth. |
| Provider-agnostic template delivery | Templates are HTML strings passed to N8N. N8N handles SMTP/Gmail/SendGrid/Mailgun. Templates must NOT contain provider-specific logic. Currently N8N uses Gmail -- Christ Fensterhandel may switch to their own domain SMTP. | LOW | Already architected correctly: N8N receives HTML body + recipient + subject via webhook. Templates render in Next.js, N8N sends. |

### 5. Angebots-PDF Generierung

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Professional Angebots-PDF with full configuration details | When admin sets status to "angebot_versendet", a PDF must be generated. In the Fenster industry, a quote without a formal PDF document is not taken seriously. Customer expects: company letterhead, their configuration, prices, validity period. | HIGH | Use `@react-pdf/renderer` for server-side PDF generation. Why: (1) React component syntax familiar to team, (2) no headless browser needed (unlike Puppeteer), (3) produces proper PDF (not HTML-to-PDF conversion), (4) fast server-side rendering. Template in `src/lib/pdf/angebot-template.tsx`. |
| Angebotsnummer (ANG-YYYY-NNN) sequential generation | Business requirement: every quote has a unique, traceable number. Format: `ANG-2026-001`, `ANG-2026-002`, etc. Counter resets per year. | MEDIUM | Counter stored in Payload Global `document_counters` or as max query on Anfragen. Atomic increment to prevent duplicates under concurrent requests. |
| Angebot validity period (konfigurierbar, default 30 Tage) | Quotes expire. Customer and admin must see when a quote expires. Standard in B2B: 30 days. Must be configurable via Admin Settings. | LOW | `angebot_gueltig_bis` date field on Anfrage. Calculated from `angebot_erstellt_am + validity_days`. Validity days from Settings Global. |
| PDF download in Admin + Kunden-Dashboard | Both admin and customer must access the PDF. Admin: "Angebot herunterladen" button in detail view. Customer: PDF link in their Anfrage detail. | LOW | Store PDF as Payload Media upload or as generated-on-demand (cheaper: generate on demand, cache URL). API route: `GET /api/angebot/[anfrage_id]/pdf`. |
| PDF as email attachment via N8N | When "angebot_versendet" triggers N8N email, the PDF must be attached. N8N supports base64-encoded attachments in webhook payloads. | MEDIUM | Generate PDF, convert to base64 string, include in N8N webhook payload as `attachment` field. N8N workflow attaches to email. |

### 6. Rechnungs-PDF (legally required)

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Rechnungs-PDF compliant with Paragraph 14 UStG | **Legally mandatory in Germany after payment.** Missing = tax violation. Required contents: Rechnungssteller (name, address, Steuernummer/USt-IdNr), Empfaenger (name, address), Rechnungsnummer (fortlaufend), Rechnungsdatum, Leistungsbeschreibung, Netto + MwSt-Satz + MwSt-Betrag + Brutto, Zahlungsvermerk. | HIGH | Reuse `@react-pdf/renderer` infrastructure from Angebot. Template in `src/lib/pdf/rechnung-template.tsx`. Different layout from Angebot (stricter format, legal requirements). |
| Rechnungsnummer (RE-YYYY-NNN) with sequential counter | Must be sequential and traceable. NOT random UUIDs. German tax law requires "fortlaufende Nummer" (sequential number) -- note: does NOT legally require gap-free numbering (BFH ruling), but gap-free is best practice and simpler to implement. Separate counter from Angebotsnummer. | MEDIUM | Same counter mechanism as Angebotsnummer but separate sequence. Stored in `document_counters` Global. |
| MwSt calculation (central `tax.ts` module) | MwSt (currently 19%) must be calculated correctly everywhere: Konfigurator preview, Warenkorb, Angebot-PDF, Rechnung-PDF, Stripe amount. Rounding errors between these points = legal and financial problems. One central module, one truth. | MEDIUM | New file `src/lib/tax.ts`. Functions: `calculateMwSt(netto, rate)`, `nettoFromBrutto(brutto, rate)`, `formatPrice(amount)`. MwSt rate from Settings Global (default 19). Used by: PDF templates, Konfigurator, Warenkorb, Stripe checkout. |
| Rechnungen Collection (immutable records) | Invoices must NOT be editable or deletable after creation. German law (GoBD): 8-year retention, no modification. Separate collection from Anfragen because: (1) one Anfrage can have multiple invoices (corrections), (2) invoices have their own lifecycle, (3) immutability is easier to enforce on a dedicated collection. | MEDIUM | New collection `src/collections/business/rechnungen.ts`. Fields: `rechnung_nummer`, `anfrage` (relation), `kunde_name`, `kunde_adresse`, `netto`, `mwst_satz`, `mwst_betrag`, `brutto`, `pdf` (upload), `erstellt_am`. Access: read-only after creation (no update, no delete). |
| Gutschrift/Stornorechnung bei Rueckerstattung | When a refund occurs, a Gutschrift (credit note, GS-YYYY-NNN) must be created referencing the original Rechnung. You cannot delete or modify the original invoice -- only issue a Stornorechnung that negates it. Since 2013 UStG change: Gutschrift is for settlement (Abrechnungsgutschrift), Stornorechnung is for corrections. For refund scenarios: create a Stornorechnung. | HIGH | Same PDF infrastructure. New template `src/lib/pdf/stornorechnung-template.tsx`. References original `rechnung_nummer`. Separate counter: `ST-YYYY-NNN`. |
| Auto-generate Rechnung after "bezahlt" | Invoice generation must be automatic on payment confirmation. Admin should NOT manually create invoices -- this is error-prone and defeats the purpose. | LOW | `afterChange` hook on Anfragen: when status changes to `bezahlt`, generate Rechnung, store PDF, send via N8N email. |

### 7. Admin Settings Page (Payload Global)

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Settings Global with tabbed schema | Central configuration point. Currently, config values are scattered: MwSt rate is hardcoded, Angebots-Gueltigkeit is hardcoded, Webhook URL is in `.env`. Business-configurable values belong in a Settings Global where admin can change them without code deployment. | MEDIUM | New Payload Global `src/payload-globals/settings.ts`. Uses Payload `tabs` field type for organized sections. Existing pattern: `WebhookErrors` Global already works. |
| Tab: Allgemein (Firma, Logo, Kontakt) | Company details appear on every PDF and email. Must be editable. When Christ Fensterhandel changes phone number, they should not need a code deployment. | LOW | Fields: `firmenname`, `adresse`, `telefon`, `email`, `steuernummer`, `ust_id`, `logo` (upload). |
| Tab: Steuern (MwSt-Satz) | MwSt rate changes (happened in 2020: 19% to 16% temporarily). Must be configurable. | LOW | Field: `mwst_satz` (number, default 19). Read by `tax.ts`. |
| Tab: Zahlungen (Stripe-Modus, Link-Ablauf, Waehrung) | Display Stripe mode (test/live), configure checkout session expiry duration, default currency. | LOW | Fields: `stripe_modus` (read-only, from env), `zahlungslink_ablauf_stunden` (number, default 24), `waehrung` (select, default EUR). |
| Tab: Dokumente (Angebots-Gueltigkeit, Nummernkreise) | Angebots-Gueltigkeitsdauer (default 30 Tage), current counter values for ANG/RE/GS/ST sequences (read-only display). | LOW | Fields: `angebot_gueltigkeit_tage` (number, default 30), counter display fields (read-only). |
| Access: admin-only | Settings must be restricted to admin role. Mitarbeiter and Viewer must not change system configuration. | LOW | `access: { read: isAdmin, update: isAdmin }`. Same pattern as `WebhookErrors`. |

---

## Differentiators

Features that go beyond standard B2B e-commerce and create operational advantage for Christ Fensterhandel's small team.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Manueller E-Mail-Versand aus Admin** | "Kunde hat Mail nicht bekommen" happens daily. Admin opens Anfrage, clicks "E-Mail senden", selects template (Zahlungslink / Angebot / Status-Update / Freitext), previews, sends. All via N8N (same provider path). No context-switching to Gmail. Logging in Status-Timeline. | MEDIUM | Modal in `anfrage-detail-view.tsx`. N8N webhook with `manual: true` flag + optional `override_email`. Template selector dropdown. |
| **Kunden-Stornierungsanfrage (Request, not Action)** | Customer can REQUEST cancellation from their dashboard. This does NOT auto-cancel -- it creates a notification for admin. Admin reviews, checks with Hersteller, then decides. Why differentiator: most B2B systems require a phone call for cancellation. This reduces phone load while keeping admin control. Critical: Massanfertigung (custom windows) are exempt from 14-day Widerruf (Paragraph 312g BGB), so customer cannot FORCE cancellation. | LOW | Button "Stornierung beantragen" in Kunden-Dashboard. Sets flag `stornierung_beantragt: true` on Anfrage. N8N notifies admin. Admin decides via Splitbutton. |
| **Kundenantwort auf Rueckfrage** | When admin sends Rueckfrage, customer needs a way to answer. Currently: customer calls or emails separately. With this feature: customer sees the question in their dashboard + text input to answer. Answer triggers N8N notification to Mitarbeiter. Status auto-changes back to `in_bearbeitung`. | MEDIUM | New field `rueckfrage_text` on Anfrage (set by admin when entering Rueckfrage status). New field `kunden_antwort` (set by customer). Customer dashboard: show question + answer form when status is `rueckfrage`. `afterChange` hook: if `kunden_antwort` changes, set status to `in_bearbeitung` + trigger N8N. |
| **Reklamation mit Fotos** | Customer can submit a complaint with photo evidence directly from their dashboard. Photos are critical for window defects (scratches, wrong color, broken seal). Without photo upload: customer emails photos, admin downloads, attaches to order manually. With: structured Reklamation record with photos linked to Anfrage. | MEDIUM | New collection `reklamationen` with: `anfrage` (relation), `beschreibung` (textarea), `fotos` (upload array, max 5), `status` (offen/in_bearbeitung/geloest), `loesung` (textarea). Customer can create from dashboard when status is `geliefert`. |
| **Angebots-Workflow im Admin (Preis-Anpassung)** | Admin receives Anfrage with calculated price. Sometimes a manual discount or price adjustment is needed (Sonderrabatt, Mengenrabatt, Verhandlung). "Angebot erstellen" modal shows configuration + calculated price + allows override with reason. Generates PDF + changes status in one action. | MEDIUM | Modal component. Fields: `angebot_preis` (pre-filled from `gesamtpreis`), `angebot_anpassung_grund` (text, required if price changed), `angebot_gueltig_bis` (pre-filled +30d). On submit: update Anfrage, generate PDF, change status, trigger N8N. |
| **Angebots-Annahme durch Kunden (Option C: Annehmen + Zahlen)** | Customer sees Angebot in dashboard with button "Angebot annehmen und bezahlen". One click: creates Stripe Checkout Session + sets status to `bestaetigt`. Reduces friction: one step instead of two (accept then pay separately). | MEDIUM | Combined action: on click, API creates Checkout Session and returns URL. Status transitions: `angebot_versendet` -> `bestaetigt` -> `zahlungslink_versendet` happen atomically. Widerrufsbelehrung (Massanfertigung-Ausnahme Paragraph 312g BGB) shown before confirmation. |
| **Auftragsbestaetigung nach Annahme** | After customer accepts offer: automatic Auftragsbestaetigung email with order summary, expected timeline, next steps. Professional touch that builds trust. Optional: as PDF attachment. | LOW | Email template "Auftragsbestaetigung". Triggered on status `bestaetigt`. Content: order summary from Anfrage data. |
| **Stripe Customer-Objekt** | Link customer email to Stripe Customer for payment history. When same customer orders again, Stripe remembers their payment method. Small effort, big UX improvement for repeat customers. | LOW | `stripe.customers.create({ email })` or `stripe.customers.list({ email })` before creating Checkout Session. Pass `customer` ID to session. |

---

## Anti-Features

Features to explicitly NOT build in v1.4. Each has a clear reason and alternative.

| Anti-Feature | Why Tempting | Why Problematic | What to Do Instead |
|--------------|-------------|-----------------|-------------------|
| **Automatic full refund on Stornierung** | Seems obvious: cancel order -> refund money. Less admin work. | Fenster are Massanfertigung. If Hersteller already started production, full refund loses money. Partial refund amount depends on production stage, supplier costs, agreements. Automatic refund removes admin judgment from a decision that requires it. | Admin manually enters `rueckerstattung_betrag` in the Stornierung flow. "Rueckerstattung ausloesen" button triggers Stripe refund with that amount. Never automatic. |
| **E-Rechnung (structured XML invoice, XRechnung/ZUGFeRD)** | Legally required for B2B from 2025 in Germany. Seems urgent. | The transition period runs until 2026-12-31: during this time, "sonstige Rechnung" (PDF) is still fully legal. Christ Fensterhandel sells to end consumers (B2C), not businesses. E-Rechnung obligation only applies to B2B domestic transactions. For B2C: PDF invoices remain sufficient indefinitely. | PDF invoices for v1.4. Monitor E-Rechnung requirements for when Christ Fensterhandel adds B2B sales channels. Defer XRechnung/ZUGFeRD to v2 if needed. |
| **Customer self-service cancellation (auto-cancel)** | Customer clicks "Stornieren" and order is immediately cancelled. Reduces admin workload. | Massanfertigung = custom manufactured goods. Once ordered from Hersteller, cancellation has real costs. Paragraph 312g BGB: no 14-day Widerruf for Massanfertigung. Auto-cancel without admin review is financially dangerous and legally unsound. | "Stornierung beantragen" button (request, not action). Admin reviews, negotiates with Hersteller if needed, then manually processes cancellation with appropriate refund amount. |
| **Email settings page with per-event toggles** | Admin wants to control which emails go out. Toggle-based settings seem user-friendly. | Adds significant complexity: UI for 18+ event toggles, N8N workflow must check settings before sending, settings cache invalidation, risk of accidentally disabling critical emails (payment confirmation). For a 2-5 person team with < 100 orders/month, this is over-engineering. | Hardcode all email events as active in code/N8N. Build the Settings Global with the tab structure that ALLOWS adding toggles later. But do not build the toggle UI or the N8N conditional logic in v1.4. |
| **Digest/summary emails (daily batch)** | Instead of 10 individual emails, send one daily summary. Reduces inbox noise for staff. | At current volume (< 100 orders/month), staff receives maybe 5-10 emails/day. That is manageable. Digest emails require: cron job, email queue, aggregation logic, different template, timezone handling. The complexity is disproportionate to the benefit. | Individual emails per event. Revisit digest mode at > 500 orders/month. |
| **Direct SMTP email sending from Next.js app** | Simpler: skip N8N, send emails directly via Nodemailer. Fewer moving parts. | N8N is the single point for all email sending. Provider switching (Gmail -> own SMTP -> SendGrid) happens in ONE place. Direct sending creates a second email path. When provider changes, two systems need updating. N8N also provides retry, logging, and workflow orchestration that Nodemailer does not. | ALL emails via N8N. App generates HTML template + recipient + subject, sends to N8N webhook. N8N handles delivery. |
| **Puppeteer for PDF generation** | Pixel-perfect HTML-to-PDF conversion. Uses the same HTML/CSS as web pages. | Puppeteer requires a headless Chromium instance. On a Coolify/Docker deployment on a Netcup VPS 1000 G11, this adds 200-400MB RAM overhead and significant startup latency (2-5 seconds per PDF). For invoices/quotes with structured layout (not pixel-perfect web pages), `@react-pdf/renderer` produces professional PDFs without the browser overhead. | Use `@react-pdf/renderer` for all PDF generation. Component-based, fast, no browser dependency. |
| **Rechnungs-Uebersicht als eigene Admin-Page** | Nice to have: a dedicated page listing all invoices with filters. | Rechnungen Collection already gets a list view in Payload Admin for free. Custom page adds development time for marginal benefit. The standard Payload list view with search + filters covers the admin need. | Use Payload's built-in list view for `rechnungen` collection. Add custom columns (Anfrage-Nr, Kunde, Betrag) via `admin.listSearchableFields` and `admin.useAsTitle`. |
| **AGB-Akzeptanz Checkbox bei Angebots-Annahme** | Legal requirement to show AGB before contract. Checkbox seems like the right pattern. | AGB text must exist first. Christ Fensterhandel may not have finalized AGB yet. Building the checkbox without finalized AGB text creates a false sense of legal compliance. | Add Widerrufsbelehrung text (Massanfertigung-Ausnahme) to Angebots-PDF and customer dashboard. Defer AGB checkbox to when actual AGB document exists. Flag this as legal review needed. |

---

## Feature Dependencies

```
[A] Settings Global (MwSt-Satz, Firma-Daten, Zahlungslink-Ablauf, Angebots-Gueltigkeit)
    |-- required by --> [B] tax.ts (MwSt rate)
    |-- required by --> [C] PDF templates (Firma-Daten im Header)
    |-- required by --> [D] Stripe Checkout (expires_at from settings)
    |-- required by --> [E] Angebots-Workflow (Gueltigkeit from settings)

[B] tax.ts (central MwSt calculation)
    |-- required by --> [C] Angebots-PDF (Netto/MwSt/Brutto breakdown)
    |-- required by --> [F] Rechnungs-PDF (legally required MwSt display)
    |-- required by --> [G] Stripe Checkout (correct amount with MwSt)

[C] PDF base infrastructure (@react-pdf/renderer + shared components)
    |-- required by --> [H] Angebots-PDF template
    |-- required by --> [F] Rechnungs-PDF template
    |-- required by --> [I] Stornorechnung template
    |-- required by --> [J] Gutschrift template

[D] Stripe Zahlungslink-Automatisierung
    |-- requires --> [A] Settings (expires_at config)
    |-- requires --> [K] E-Mail Templates (Zahlungslink email)
    |-- triggers --> [L] Webhook handlers (expired, completed, refunded, disputed)

[K] E-Mail Templates (React Email)
    |-- requires --> [M] Email Event-Matrix (which templates exist)
    |-- required by --> [D] Stripe flow (Zahlungslink email)
    |-- required by --> [H] Angebot flow (Angebots-Email with PDF attachment)
    |-- required by --> [F] Rechnung flow (Rechnungs-Email with PDF attachment)
    |-- required by --> [N] Kunden Self-Service (Stornierungsanfrage notification)

[E] Angebots-Workflow
    |-- requires --> [A] Settings (Gueltigkeit, Firma-Daten)
    |-- requires --> [B] tax.ts (MwSt calculation)
    |-- requires --> [H] Angebots-PDF
    |-- triggers --> [K] Email (Angebot bereit)

[L] Stripe Webhook handlers (expanded)
    |-- requires --> [D] Stripe fields on Anfrage
    |-- triggers --> [F] Rechnung generation (after bezahlt)
    |-- triggers --> [I] Stornorechnung (after refund)

[N] Kunden Self-Service
    |-- requires --> [K] Email Templates (notifications)
    |-- independent from --> [D] Stripe (Stornierungsanfrage does not touch payment)

[O] Manueller E-Mail-Versand
    |-- requires --> [K] Email Templates (template selector)
    |-- requires --> [M] Email Event-Matrix (available templates list)
```

### Critical Path (sequential, cannot parallelize)

```
[A] Settings Global --> [B] tax.ts --> [C] PDF base --> [H] Angebots-PDF
                                                    --> [F] Rechnungs-PDF
[M] Email Event-Matrix --> [K] Email Templates --> [D] Stripe flow (needs Zahlungslink email)
```

### Parallelizable Work

- Settings Global and Email Event-Matrix can be built in parallel (no dependency)
- Stripe webhook expansion and Email Templates can be built in parallel after their deps
- Kunden Self-Service features are independent of PDF and Stripe work
- Manueller E-Mail-Versand can be built after Email Templates ship

---

## MVP Recommendation

### Launch With (v1.4 -- this milestone)

Ordered by dependency chain. Each unblocks the next.

**Phase A: Foundation (Settings + Tax + Email Matrix)**
1. Settings Global with tabs (Allgemein, Steuern, Zahlungen, Dokumente)
2. `tax.ts` central MwSt module reading from Settings
3. Email Event-Matrix config (`src/lib/email-config.ts`) -- the 18-event map

**Phase B: Email System**
4. React Email base layout component (header/footer/content slot)
5. 9 email templates (React Email components)
6. Email preview API route
7. N8N webhook payload extension (recipients array, HTML body, attachments)

**Phase C: PDF Infrastructure**
8. `@react-pdf/renderer` setup + shared PDF components (letterhead, table, footer)
9. Angebots-PDF template + Angebotsnummer counter
10. Rechnungs-PDF template + Rechnungsnummer counter
11. Stornorechnung/Gutschrift template + counter
12. Rechnungen Collection (immutable)

**Phase D: Stripe End-to-End**
13. Stripe fields on Anfrage collection (checkout_url, session_id, payment_intent_id, etc.)
14. Auto-create Checkout Session on "zahlungslink_versendet" (afterChange hook)
15. Expand webhook handler (expired, refunded, disputed events)
16. Admin-triggered refund API route
17. Regenerate expired payment link
18. One-active-session dedup guard

**Phase E: Angebots-Workflow**
19. "Angebot erstellen" modal in Admin (price adjustment, validity, freitext)
20. Combined flow: generate PDF + change status + send email in one action
21. Angebots-Annahme im Kunden-Dashboard (Option C: annehmen + zahlen)
22. Auto-generate Rechnung after "bezahlt"

**Phase F: Kunden Self-Service**
23. Stornierungsanfrage (request button, admin notification)
24. Kundenantwort auf Rueckfrage (question display + answer form)
25. Reklamation mit Fotos (new collection + customer form)

**Phase G: Admin Extras**
26. Manueller E-Mail-Versand (template selector modal)
27. Stripe Customer-Objekt creation

### Defer to v1.5+

- E-Mail-Einstellungen UI (per-event toggles) -- architecture is ready, UI not needed yet
- Digest/summary emails
- E-Rechnung (XRechnung/ZUGFeRD) -- not needed for B2C
- AGB-Checkbox -- requires finalized AGB document
- Rechnungs-Uebersicht custom page -- Payload list view suffices
- Auftragsbestaetigung as separate PDF -- email is sufficient for v1.4

---

## Complexity Estimates

| Feature Area | Table Stakes Count | Differentiator Count | Estimated Effort | Risk Level |
|-------------|-------------------|---------------------|-----------------|------------|
| Stripe Zahlungslink + Webhook | 8 features | 1 (Stripe Customer) | L-XL | MEDIUM (webhook edge cases) |
| Stripe Rueckerstattung | 4 features | 0 | M | LOW (well-documented API) |
| Stripe Chargeback | 2 features | 0 | S | LOW (single webhook handler) |
| E-Mail System | 5 features | 2 (Manuell, Auftragsbestaetigung) | L | MEDIUM (cross-client HTML rendering) |
| Angebots-PDF | 5 features | 1 (Preis-Anpassung Workflow) | L | LOW (react-pdf is well-documented) |
| Rechnungs-PDF + MwSt | 6 features | 0 | XL | HIGH (legal compliance, immutability) |
| Kunden Self-Service | 0 table stakes | 3 (Stornierung, Rueckfrage, Reklamation) | M | LOW (UI + simple state changes) |
| Admin Settings | 6 features | 0 | M | LOW (Payload Globals pattern proven) |

**Total estimated effort:** 3-4 weeks for a single developer, parallelizable to 2 weeks with two.

---

## Sources

### Stripe Integration
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create?lang=node) -- HIGH confidence
- [Stripe Refunds API](https://docs.stripe.com/api/refunds/create?lang=node) -- HIGH confidence
- [Stripe Abandoned Cart Recovery](https://docs.stripe.com/payments/checkout/abandoned-carts) -- HIGH confidence
- [Stripe Dispute Handling](https://docs.stripe.com/disputes/how-disputes-work) -- HIGH confidence
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks) -- HIGH confidence
- [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests) -- HIGH confidence

### German Invoice Law
- [Paragraph 14 UStG - gesetze-im-internet.de](https://www.gesetze-im-internet.de/ustg_1980/__14.html) -- HIGH confidence
- [IHK Stuttgart - Pflichtangaben Rechnungen](https://www.ihk.de/stuttgart/fuer-unternehmen/recht-und-steuern/steuerrecht/umsatzsteuer-national/neue-pflichtangaben-fuer-rechnungen-684834) -- HIGH confidence
- [Gutschrift vs Stornorechnung - Stripe](https://stripe.com/resources/more/invoice-correction-vs-credit-note-germany) -- HIGH confidence
- [Rechnungsnummer-Pflicht - DHZ](https://www.deutsche-handwerks-zeitung.de/sind-lueckenlos-fortlaufende-rechnungsnummern-pflicht-313278/) -- HIGH confidence
- [E-Rechnung B2B ab 2025 - HWK Dresden](https://www.hwk-dresden.de/recht/aktuelle-themen/detail/e-rechnung-ab-2025-im-b2b-bereich-verpflichtend.html) -- HIGH confidence

### Email Templates
- [React Email - Official Docs](https://react.email/docs/utilities/render) -- HIGH confidence
- [Payload CMS + React Email Integration](https://www.omniux.io/blog/payload--react-email-creating-dynamic-emails-for-everyone) -- MEDIUM confidence
- [MJML Framework](https://mjml.io/) -- HIGH confidence
- [Email Markup Development 2025](https://voskoboinyk.com/posts/2025-01-29-state-of-email-markup) -- MEDIUM confidence

### PDF Generation
- [react-pdf/renderer - Official](https://react-pdf.org/) -- HIGH confidence
- [Server-side PDF with react-pdf in Node.js](https://dev.to/ramcpucoder/how-to-generate-pdf-invoices-in-a-nodejs-backend-using-react-pdfrenderer-1oc9) -- MEDIUM confidence

### Payload CMS Globals
- [Payload CMS Globals Documentation](https://payloadcms.com/docs/configuration/globals) -- HIGH confidence

### Existing Codebase (examined)
- `src/lib/stripe.ts` -- current Checkout Session creation
- `src/app/api/stripe/webhook/route.ts` -- current webhook handler (checkout.session.completed only)
- `src/lib/n8n-webhook.ts` -- webhook sender with error tracking
- `src/lib/status-config.ts` -- 20 statuses, EMAIL_TRIGGER_STATUSES, QUICK_ACTIONS
- `src/payload-globals/webhook-errors.ts` -- existing Global pattern
- `src/payload.config.ts` -- 3 existing Globals registered

---
*Feature research for: v1.4 Bestellungsflow + Integrationen (Stripe, E-Mail, PDF, Self-Service, Settings)*
*Researched: 2026-03-27*
