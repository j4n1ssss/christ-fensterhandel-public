# Project Research Summary

**Project:** Christ Fensterhandel Konfigurator-System — v1.4 Bestellungsflow + Integrationen
**Domain:** B2B Fenster-Konfigurator — Stripe end-to-end, E-Mail system, PDF generation, German invoice compliance, customer self-service
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

v1.4 is an integration milestone on top of an established, production-ready codebase (23k+ LOC, 17+ collections, 20-status order flow from v1.3). The core challenge is not greenfield architecture but surgical extension: new features must slot into existing conventions (afterChange hooks, status-config as Single Source of Truth, role-based access, Zustand stores) without breaking them. The recommended approach is to build in strict dependency order — Settings Global and `tax.ts` first, then email templates, then PDF infrastructure, then Stripe end-to-end, then customer self-service — because every downstream feature depends on these foundational pieces. The technology additions are minimal: exactly 5 new npm packages, all verified compatible with the existing React 19 + Next.js 15 + Payload CMS 3.79 stack.

The most critical risks are legal, not technical. German tax law requires gap-free sequential invoice numbers (Paragraph 14 UStG) and correct MwSt display on every Rechnung. PostgreSQL SEQUENCE is explicitly wrong for this (sequences skip on rollback creating gaps). A dedicated counter table with row-level locking is mandatory and must be designed before the first invoice is generated — retrofitting means renumbering all invoices. Similarly, MwSt calculation must live in a single `src/lib/tax.ts` module used by all consumers (Konfigurator, PDF, Stripe amount) to prevent 1-cent rounding discrepancies that constitute incorrect invoices under German law. The `E-Rechnung` requirement (XRechnung/ZUGFeRD structured XML) does NOT apply — Christ Fensterhandel sells B2C, and PDF invoices remain legally sufficient indefinitely for consumer transactions.

The secondary risk category is webhook and hook reliability. Stripe delivers with at-least-once semantics; N8N retries timed-out webhooks; and the existing Payload `afterChange` hook chain re-fires on every `payload.update()` call. Without idempotency keys on N8N webhook payloads, duplicate emails are inevitable within weeks of production. Without `context.skipXxx` guards on new hooks that call `payload.update()`, cascading triggers produce duplicate emails, phantom StatusHistorie entries, and potential PostgreSQL deadlocks. The `context` guard pattern already exists in the codebase (`context.skipEditHistory` in `profile-edit-history.ts`) but is easy to miss under time pressure. It must be established as an explicit convention in Phase 1 before any new hooks are added.

## Key Findings

### Recommended Stack

The existing stack (Next.js 15.4.11, Payload CMS 3.79, PostgreSQL, React 19.2.4, Tailwind CSS 4, Shadcn UI, Stripe 20.4.1, N8N) requires exactly 5 new npm packages. The existing `stripe` SDK stays at v20.4.1 — all needed APIs (Refunds, Checkout Session management, dispute events) are available in that version. No Redis, no nodemailer, no Puppeteer, no tax library.

**Core new dependencies:**
- `rate-limiter-flexible` ^10.0.1 — in-memory rate limiting without Redis; correct for single-VPS Coolify deployment; handles burst, cleanup, and IP parsing edge cases that a custom `Map()` implementation would miss
- `@react-pdf/renderer` ^4.3.2 — server-side PDF generation via React/JSX components; React 19 compatible since v4.1.0; requires `serverExternalPackages: ['@react-pdf/renderer']` in `next.config.ts`
- `@react-email/components` ^1.0.10 — type-safe email components producing table-based HTML (email-client-safe); native Tailwind 4 support; React 19 peerDep satisfied
- `@react-email/render` ^2.0.4 — renders JSX email templates to HTML strings with inline CSS for N8N delivery
- `react-email` ^5.2.10 (devDependency only) — local email preview server

**Deliberate non-additions:** No Puppeteer (200-400MB RAM + 2-5s startup on shared VPS shared with PostgreSQL and N8N), no nodemailer (N8N handles SMTP — adding a parallel email path requires dual maintenance), no Redis (single-VPS makes in-memory rate limiting sufficient), no tax calculation library (German B2C at fixed 19% is two arithmetic functions), no E-Rechnung/XRechnung (B2C exemption, transition period until 2026-12-31+).

**Note on email rendering (partially conflicting research):** PITFALLS.md recommends MJML for Outlook Word-engine compatibility. STACK.md chose React Email based on Tailwind 4 support and developer ergonomics. Resolution: `@react-email/components` uses table-based layout (not flexbox/grid), which is email-client-safe. Use off-white (`#FAFAFA`) and dark grey (`#222222`) colors instead of pure white/black to prevent dark-mode inversion. This requires empirical validation with Outlook 2019/2021 during Phase 2 before scaling to all 9 templates.

**New Payload entities required:**
- `rechnungen` collection — immutable invoice records; no update/delete access after creation; GoBD 8-year retention
- `nummernkreise` Global — counter table for RE/ANG/GS/ST sequential numbers; accessed only via `allocateNummer()` helper
- `einstellungen` Global — MwSt rate, company data for PDFs, payment settings, Angebots-Gueltigkeit; must have `revalidateTag()` in afterChange hook to prevent stale cache

### Expected Features

**Must-have (table stakes — system not production-ready without these):**

Stripe Zahlungslink Automation (8 features):
- Auto-create Checkout Session on `zahlungslink_versendet` status change (via afterChange hook)
- Store `stripe_checkout_url`, `stripe_session_id`, `stripe_payment_intent_id` on Anfrage
- `checkout.session.expired` + `charge.refunded` + `charge.dispute.created` webhook handlers
- One-active-session dedup guard to prevent double-payment on double-click
- "Neuen Zahlungslink erstellen" with old session expiry before new creation
- `checkout.session.expired` webhook: set status to `zahlungslink_abgelaufen`

Stripe Rueckerstattung (4 features):
- Admin-triggered refund via `stripe.refunds.create({ payment_intent, amount? })`
- Partial refund support (amount in cents, required for Massanfertigung where production started)
- `charge.refunded` webhook auto-updates refund status fields
- Refund status fields: `stripe_refund_status` (none/partial/full), `stripe_refund_amount`

E-Mail System (5 table stakes features):
- 18-event email matrix (14 existing customer triggers + 4 new staff notifications)
- 9 distinct React Email templates with shared base layout (logo, Impressum, Datenschutz links)
- Email preview route (`/api/email-preview/[template]`) for admin verification
- Provider-agnostic: HTML strings sent via N8N webhook, N8N handles SMTP delivery
- Idempotency keys on all webhook payloads to prevent duplicate email sends

PDF Generation (5 table stakes features):
- Angebots-PDF with ANG-YYYY-NNN sequential number; company letterhead from Settings; Netto + MwSt + Brutto breakdown
- Rechnungs-PDF compliant with Paragraph 14 UStG (Steuernummer, sequential RE-YYYY-NNN, MwSt display)
- Stornorechnung template for refund scenarios (GS-YYYY-NNN referencing original RE number)
- `rechnungen` collection as immutable audit trail (no update, no delete)
- PDF stored as Payload Media upload; served via URL (no regeneration on each download)

Admin Settings Global (6 table stakes features):
- 4-tab schema: Allgemein (Firma), Steuern (MwSt-Satz), Zahlungen (Stripe), Dokumente (Nummernkreise)
- Admin-only access (`isAdmin` role check)
- `revalidateTag()` afterChange hook to prevent stale values in financial calculations

**Should-have (differentiators for v1.4):**
- Manueller E-Mail-Versand aus Admin (template selector modal; all sends logged to StatusHistorie)
- Kunden-Stornierungsanfrage (request flow, NOT auto-cancel — legally correct for Massanfertigung under Paragraph 312g BGB)
- Kundenantwort auf Rueckfrage (answer form in customer dashboard; triggers status back to `in_bearbeitung`)
- Reklamation mit Fotos (new `reklamationen` collection; customer-submitted; max 5 photos)
- Angebots-Workflow modal (price adjustment with reason field; generate PDF + change status + send email as atomic operation)
- Angebots-Annahme durch Kunden (Option C: annehmen + zahlen; atomic transition with Widerrufsbelehrung display)

**Defer to v1.5+:**
- E-Mail per-event toggle UI (Settings architecture supports it; build toggle UI when volume justifies it)
- E-Rechnung / XRechnung / ZUGFeRD (B2C — legally unnecessary; revisit if B2B channel added)
- AGB-Checkbox (requires finalized AGB document from Christ Fensterhandel)
- Digest/summary emails (< 100 orders/month does not justify cron + aggregation complexity)
- Rechnungs-Uebersicht custom admin page (Payload built-in list view with custom columns suffices)

### Architecture Approach

v1.4 extends the existing module structure rather than creating parallel systems. New code slots into established locations: `src/lib/security.ts` gains rate limiting helpers, `src/lib/stripe.ts` gains `createRefund()` and session expiry management, `src/lib/n8n-webhook.ts` gains extended payload types (`email_html`, `email_subject`, idempotency keys, attachment URLs). New top-level modules `src/lib/tax.ts`, `src/lib/pdf/`, and `src/lib/email/` follow the same import and export patterns as existing lib files.

The critical architectural constraint is the afterChange hook cascade: any new hook that calls `payload.update()` MUST set a context flag (`context.skipWebhook`, `context.skipPdfGeneration`, `context.skipStripeSync`) AND check the flag at the start of the hook to prevent re-entry. This pattern already exists for edit history but is inconsistently applied. Establishing it as an explicit, documented convention in Phase 1 is mandatory before adding new hooks.

**Major components and their responsibilities:**
1. `src/lib/tax.ts` — single source of truth for all MwSt calculations; cent-integer arithmetic; reads MwSt rate from `einstellungen` Global; used by Konfigurator price display, PDF generators, and Stripe amount conversion
2. `src/lib/pdf/` — React-PDF templates (Angebot, Rechnung, Stornorechnung); generated via dedicated API routes (NOT inside afterChange hooks); stored as Payload Media uploads
3. `src/lib/email/` — React Email templates rendered server-side to HTML strings; dispatched via N8N webhook with `idempotency_key` field on every payload
4. `einstellungen` Global — provides MwSt rate, company data, and payment settings to all downstream generators; must have `revalidateTag('global_settings')` in afterChange hook; API routes for financial calculations must fetch uncached
5. `nummernkreise` Global — transactional counter accessed only via `allocateNummer(kreis)` helper; counter allocated only at the moment of confirmed document creation (never speculatively)

**Critical data flow for the Rechnung creation path (webhook-triggered):**
- Stripe fires `checkout.session.completed`
- Check `event.id` against processed-events (idempotency)
- Run `isValidTransition(currentStatus, 'bezahlt')` — reject if transition is invalid (e.g., already `storniert`)
- Call `payload.update(anfrage, { status: 'bezahlt' }, { context: { isWebhookUpdate: true } })`
- `afterChange` hook fires; `context.isWebhookUpdate` prevents re-triggering
- `allocateNummer('rechnung')` returns `RE-2026-NNN`
- PDF generation API called (separate async request, not inline in hook)
- `rechnungen` document created (immutable)
- N8N webhook fired with `email_html` (Zahlungsbestaetigung template) and `idempotency_key`

### Critical Pitfalls

1. **Stripe webhook race condition — success page vs. webhook delay** — Customer lands on `/kunden/dashboard?payment=success` up to 30s before `checkout.session.completed` arrives. Dashboard shows old status. Prevention: poll Anfrage status on success page (every 2s, up to 30s); store `stripe_payment_intent_id` on session creation (not on webhook receipt); reject new Checkout Sessions if `stripe_payment_intent_id` already set on Anfrage.

2. **Stripe webhook event ordering causing status regression** — `charge.refunded` sets status to `storniert`; then a delayed `checkout.session.completed` retry sets it back to `bezahlt`. Prevention: run `isValidTransition()` in the webhook handler before every status update; store processed `event.id` values to skip already-processed events.

3. **afterChange hook cascade — duplicate emails and PostgreSQL deadlocks** — PDF generation hook calls `payload.update()` to store the PDF reference, re-firing the webhook hook. Prevention: every hook that calls `payload.update()` must set AND check `context.skipXxx` flags. Document the naming convention and enforce in code review. Establish in Phase 1 before any new hooks are added.

4. **Gap-free invoice numbering** — PostgreSQL `SERIAL`/`SEQUENCE` skips on transaction rollback, creating gaps. German tax law (Paragraph 14 UStG, GoBD) requires sequential numbers. Prevention: `nummernkreise` Global as counter table; `UPDATE ... SET counter = counter + 1 RETURNING counter` atomically within the invoice creation transaction; allocate number only when document is definitively being created.

5. **MwSt rounding errors** — Float arithmetic (`119.99 * 0.19 = 22.7981`) produces 1-cent discrepancies between Konfigurator display, PDF, and Stripe amount. Prevention: single `src/lib/tax.ts` module; convert to cent integers once (`Math.round(netto * 100)`); all arithmetic in cents; use `summenweise Rundung` (sum netto first, calculate MwSt on total); MwSt rate from configurable `einstellungen` Global.

6. **Payload Global caching — stale MwSt rate on invoices** — Admin changes MwSt rate; Next.js serves cached value; new invoices use old rate. Prevention: `revalidateTag('global_settings')` in `einstellungen` afterChange hook; API routes for financial calculations use uncached fetch; log MwSt rate and timestamp on each invoice PDF as audit trail.

7. **N8N retry storms / duplicate emails** — N8N retries timed-out webhook calls; each retry is a new N8N execution (not deduplicated). With 18+ email events, probability of at least one duplicate per week approaches 100%. Prevention: `idempotency_key: ${anfrage_id}_${event_type}_${status}_${timestamp_minute}` in every webhook payload; N8N checks key before Send Email node.

8. **CSRF expansion breaking Payload Admin Panel** — Applying global CSRF middleware to all `/api/*` routes blocks Payload's own Admin REST requests. Prevention: use Payload's built-in `csrf: [process.env.NEXT_PUBLIC_SERVER_URL]` config for Payload-managed routes; apply custom `isSameOriginOrReferer()` ONLY to custom API routes (not Payload endpoints).

## Implications for Roadmap

Based on the dependency graph from FEATURES.md and the pitfall severity from PITFALLS.md, the following 7-phase structure is recommended:

### Phase 1: Foundation — Settings + Tax + Security Hardening
**Rationale:** Three separate features (PDF generation, Stripe amount calculation, Konfigurator price display) all depend on `tax.ts` and the MwSt rate from the Settings Global. Security hardening (rate limiting, CSRF expansion, hook cascade conventions) must be established before any new routes or hooks are added — retrofitting is far more expensive than getting it right first. The `context.skipXxx` hook convention must be documented and applied to existing hooks before adding new ones.
**Delivers:** `einstellungen` Global with 4-tab schema and `revalidateTag()` hook; `src/lib/tax.ts` with cent-integer arithmetic; `rate-limiter-flexible` on sensitive routes; `isSameOriginOrReferer()` applied to all custom API routes; hook cascade convention documented
**Avoids:** Pitfalls 4 (rounding), 7 (CSRF), 8 (hook cascade), 10 (Global caching)
**Research flag:** Standard patterns — skip phase research

### Phase 2: Email System
**Rationale:** Email templates are required by the Stripe flow (Zahlungslink email) and the Angebots-Workflow (Angebot-bereit email). Building email before Stripe ensures the required templates exist when the payment link automation is wired. Email rendering issues (Outlook, dark mode, inline CSS) are far easier to debug and fix in isolation than after they are triggered by production webhook events. Idempotency keys on N8N webhook payloads must be introduced here — before the full 18-event matrix is live.
**Delivers:** React Email base layout (logo, Impressum footer); 9 email templates; email preview route; extended `WebhookPayload` interface with `email_html`, `email_subject`, `idempotency_key`, `recipients`; N8N workflow update to check idempotency key before Send Email
**Avoids:** Pitfall 6 (email cross-client rendering — validate with Outlook + Gmail before scaling), Pitfall 7 (N8N duplicate emails)
**Research flag:** Needs proof-of-concept — build base layout and one template, test in Outlook 2019/2021 and Gmail, confirm React Email table-based layout renders correctly before building remaining 8 templates. If Outlook rendering fails, evaluate MJML switch at this point.

### Phase 3: PDF Infrastructure
**Rationale:** PDF generation depends on `tax.ts` (Phase 1) and company data from `einstellungen` (Phase 1). The Angebots-PDF is required before the Angebots-Workflow modal (Phase 5). The Rechnungs-PDF is triggered automatically after Stripe payment (Phase 4). PDF infrastructure must be proven working — including `serverExternalPackages` config, React 19 compatibility, and VPS memory usage — before it is wired into business-critical automated flows.
**Delivers:** `@react-pdf/renderer` setup with `serverExternalPackages` config; shared letterhead/table/footer components; Angebots-PDF template (ANG-YYYY-NNN); Rechnungs-PDF template (RE-YYYY-NNN, Paragraph 14 UStG compliant); Stornorechnung template (GS-YYYY-NNN); `nummernkreise` Global with `allocateNummer()` helper; `rechnungen` collection (immutable, read-only access after creation); dedicated PDF API routes with Node.js runtime and concurrency semaphore
**Avoids:** Pitfalls 3 (gap-free numbers — must be designed before first invoice), 5 (PDF memory/timeout — dedicated routes, stored as Media)
**Research flag:** Needs proof-of-concept — validate `renderToBuffer()` works in the actual deployment (not just local) before building all 4 templates. Test German umlauts with the chosen font set.

### Phase 4: Stripe End-to-End
**Rationale:** Depends on email templates (Phase 2) for Zahlungslink notification and PDF infrastructure (Phase 3) for auto-generated Rechnung after payment. Stripe webhook expansion is the highest-risk phase due to race conditions, event ordering, and idempotency requirements. Building last among the infrastructure phases ensures all dependencies exist and can be wired correctly in a single, testable integration.
**Delivers:** New Anfrage fields (`stripe_checkout_url`, `stripe_session_id`, `stripe_payment_intent_id`, refund fields); auto-create Checkout Session in afterChange hook on `zahlungslink_versendet`; expanded webhook handler (expired, refunded, disputed) with `isValidTransition()` validation and event-ID idempotency; admin-triggered refund API route; one-active-session dedup guard; "Neuen Zahlungslink erstellen" with old session expiry; auto-generate Rechnung after `bezahlt` webhook
**Avoids:** Pitfalls 1 (webhook race condition), 2 (event ordering regression), 8 (hook cascade on Stripe hooks)
**Research flag:** Standard patterns — Stripe API docs are comprehensive; no phase research needed

### Phase 5: Angebots-Workflow
**Rationale:** Depends on Angebots-PDF (Phase 3) and email system (Phase 2). The admin-facing "Angebot erstellen" modal completes the commercial flow: Anfrage -> Angebot -> Bestaetigung -> Zahlung. The customer-facing "Angebots-Annahme" (Option C: annehmen + zahlen) closes the loop from the customer side. Both require all prior infrastructure to be stable.
**Delivers:** "Angebot erstellen" modal in Admin with price adjustment field (+ reason required if price changed) and Gueltigkeit from Settings; combined generate-PDF + update-Anfrage + change-status + send-email as single atomic operation; "Angebot annehmen und bezahlen" button in Kunden-Dashboard with Widerrufsbelehrung display; Auftragsbestaetigung email trigger
**Avoids:** Pitfall 8 (hook cascade on combined modal action — use single `payload.update()` call, not sequential updates)
**Research flag:** Standard patterns — Payload modal/custom component pattern already established in codebase

### Phase 6: Customer Self-Service
**Rationale:** Fully independent of phases 2-4 (no dependencies on PDF or Stripe). Stornierungsanfrage, Kundenantwort, and Reklamation mit Fotos enhance the customer dashboard without touching the payment or invoice path. Safe to build after core infrastructure is stable. Lower risk — failure here does not break business-critical order flow.
**Delivers:** "Stornierung beantragen" button (sets flag, triggers admin notification via N8N; explicitly NOT auto-cancel — legally correct for Massanfertigung); Kundenantwort form on Rueckfrage status (sets `kunden_antwort` field, auto-transitions to `in_bearbeitung`); `reklamationen` collection with photo upload (max 5 photos, linked to Anfrage)
**Avoids:** Anti-feature trap of auto-cancel; accidental triggering of afterChange cascade on customer input routes
**Research flag:** Standard patterns — Payload CRUD, upload handling already established; no research needed

### Phase 7: Admin Extras
**Rationale:** Manueller E-Mail-Versand requires all 9 email templates to exist (Phase 2). Stripe Customer-Objekt creation is a low-effort improvement to the Checkout Session creation. Both are polish features that improve the operational experience after core business flow is working.
**Delivers:** "E-Mail senden" modal in Admin detail view with template selector, optional override recipient, preview, and send via N8N (with `manual: true` flag); log manual sends to StatusHistorie; Stripe Customer object creation/lookup before Checkout Session
**Research flag:** Standard patterns — no research needed

### Phase Ordering Rationale

- **Foundation before everything:** `tax.ts` is a dependency for PDF, Stripe amounts, and Konfigurator. The hook cascade convention must be in place before any new hooks are added. CSRF expansion must happen before new API routes are created.
- **Email before Stripe:** The Zahlungslink automation requires the customer email template to exist at wire-up time. Debugging email rendering in isolation is far less painful than debugging it in the context of a Stripe webhook chain.
- **PDF before Stripe:** The `checkout.session.completed` webhook auto-generates a Rechnung. The PDF infrastructure must exist and be validated before that webhook handler is expanded.
- **Stripe after both Email and PDF:** The full payment flow (payment link -> webhook -> invoice -> email) requires both prior phases. Testing the complete chain once rather than in pieces reduces integration debugging.
- **Customer Self-Service late and independent:** No hard dependencies on phases 2-4; can be parallelized with Phase 5 or 6 if team size allows.

### Research Flags

Needs empirical validation before proceeding:
- **Phase 2 (Email):** React Email vs MJML for Outlook Word-engine compatibility. The PITFALLS.md and STACK.md research conflict on this point. Build one template, test in Outlook 2019/2021 + Gmail, decide before building remaining 8 templates. If React Email table-layout passes, proceed; if Word-engine breaks it, switch to MJML at this point.
- **Phase 3 (PDF):** `@react-pdf/renderer` renderToBuffer in Next.js 15 App Router + actual VPS memory usage. The compatibility is documented as resolved with React 19, but the `serverExternalPackages` config and font handling for German characters need to be verified in the actual deployment environment before building all templates.

Standard patterns (skip research-phase):
- **Phase 1:** Payload Globals, rate-limiter-flexible, CSRF per-route pattern — all well-documented
- **Phase 4:** Stripe API — comprehensive official documentation, no unknowns
- **Phase 5:** Payload custom admin UI — existing patterns in codebase
- **Phase 6:** Payload CRUD + file uploads — established patterns
- **Phase 7:** Payload admin modal + N8N webhook — established patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All 5 packages verified via npm on 2026-03-27; version compatibility matrix confirmed; React 19 peerDeps satisfied |
| Features | HIGH | Derived from 14 todo documents, codebase inspection, Stripe official docs, and German law primary sources (gesetze-im-internet.de, IHK Stuttgart) |
| Architecture | HIGH | Based on direct inspection of 23k+ LOC existing codebase; extends proven patterns with no new architectural concepts |
| Pitfalls | HIGH | Identified from direct code inspection (existing vulnerabilities confirmed in webhook route, hook chain, price calculation); legal requirements from primary sources |
| Legal (UStG/GoBD) | MEDIUM | Paragraph 14 requirements verified via IHK and official law text; E-Rechnung B2C exemption confirmed; edge cases (Kleinunternehmer-Regelung, cross-border) need professional review |

**Overall confidence: HIGH**

### Gaps to Address

- **React Email vs MJML Outlook rendering:** PITFALLS.md and STACK.md conflict. Resolve empirically in Phase 2 with a proof-of-concept test against Outlook 2019/2021 before committing to full template suite. Cost of switching from React Email to MJML after 9 templates are built is high.

- **Stripe Checkout Sessions vs Payment Links inconsistency in ARCHITECTURE.md:** ARCHITECTURE.md's `createPaymentLink()` function uses `stripe.paymentLinks.create()`. STACK.md explicitly recommends staying with Checkout Sessions. The correct decision is Checkout Sessions — they support `expires_at`, single-use semantics, metadata, and integrate with the existing webhook handler. The Payment Links function in ARCHITECTURE.md should not be implemented as written in Phase 4.

- **afterChange hook inventory before Phase 4:** Map all existing hooks on Anfragen (execution order, which `context` flags they set/check, which `payload.update()` calls they make) before adding new Stripe hooks. A race condition between existing and new hooks is the likeliest source of production bugs in Phase 4.

- **VPS memory headroom for PDF generation:** Research estimates `@react-pdf/renderer` at ~50MB per render; Puppeteer at 200-400MB. The actual available memory on the Netcup VPS 1000 G11 (shared with PostgreSQL and N8N) needs to be measured before setting the PDF concurrency semaphore limit in Phase 3.

- **Steuerberater review of Rechnungs-PDF template:** The system implements Paragraph 14 UStG requirements as researched. Christ Fensterhandel's tax advisor should review the final template before production invoices are issued. Edge cases (Kleinunternehmer-Regelung, any cross-border EU sales) need professional verification.

- **AGB and Widerrufsbelehrung text:** The Angebots-Annahme flow (Phase 5) must display Widerrufsbelehrung text covering the Massanfertigung exception (Paragraph 312g BGB). The exact legal text should come from Christ Fensterhandel or their lawyer, not be drafted by the development team.

## Sources

### Primary (HIGH confidence)
- Existing codebase — direct inspection of `src/lib/stripe.ts`, `src/lib/security.ts`, `src/lib/n8n-webhook.ts`, `src/lib/status-config.ts`, `src/app/api/stripe/webhook/route.ts` on 2026-03-27
- npm registry — all 5 new packages verified via `npm view` on 2026-03-27
- [Stripe API: Create Checkout Session](https://docs.stripe.com/api/checkout/sessions/create) — `expires_at`, metadata, `after_expiration.recovery`
- [Stripe API: Create Refund](https://docs.stripe.com/api/refunds/create?lang=node) — partial refunds via `amount` parameter
- [Stripe API: Expire Session](https://stripe.com/docs/api/checkout/sessions/expire?lang=node) — `stripe.checkout.sessions.expire(id)`
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks) — at-least-once delivery, 3-day retry window
- [Paragraph 14 UStG](https://www.gesetze-im-internet.de/ustg_1980/__14.html) — Rechnung mandatory contents
- [IHK Stuttgart: Pflichtangaben Rechnungen](https://www.ihk.de/stuttgart/fuer-unternehmen/recht-und-steuern/steuerrecht/umsatzsteuer-national/neue-pflichtangaben-fuer-rechnungen-684834) — legal requirements confirmed
- [CYBERTEC: PostgreSQL Sequences vs Invoice Numbers](https://www.cybertec-postgresql.com/en/postgresql-sequences-vs-invoice-numbers/) — gap-free counter pattern
- [@react-pdf/renderer compatibility](https://react-pdf.org/compatibility) — React 19 supported since v4.1.0
- [@react-email/render npm](https://www.npmjs.com/package/@react-email/render) — React 19 peerDep `^18.0 || ^19.0` confirmed

### Secondary (MEDIUM confidence)
- [@react-pdf/renderer GitHub #3074](https://github.com/diegomura/react-pdf/issues/3074) — renderToBuffer + React 19 resolution
- [React Email 5.0 announcement (Resend blog)](https://resend.com/blog/react-email-5) — Tailwind 4 support, 920K weekly downloads

### Tertiary (LOW confidence — needs validation)
- React Email Outlook Word-engine rendering: community reports table-based layout survives the Word renderer, but no explicit Outlook 2019/2021 test results found. Requires empirical validation in Phase 2.

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*
