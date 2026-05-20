# Pitfalls Research

**Domain:** Adding Security, Stripe, N8N E-Mail, PDF/MwSt, and Kunden-Features to existing Next.js 15 + Payload CMS 3.79 fenster-konfigurator system (v1.4 milestone)
**Researched:** 2026-03-27
**Confidence:** HIGH (based on direct code inspection of 23.412 LOC codebase + verified research)

> **Scope note:** This replaces the v1.3 PITFALLS.md (Status-Config centralization, Custom Admin Views). Those pitfalls are captured in git history.
> This file focuses on the v1.4 milestone: Stripe hardening, rate limiting, sequential invoicing, MwSt calculation, PDF generation, e-mail templates, N8N deduplication, CSRF expansion, hook cascading, and Global caching.

---

## Critical Pitfalls

### Pitfall 1: Stripe Webhook Race Condition -- Success Page vs. Webhook Processing

**What goes wrong:**
After completing Stripe Checkout, the user is redirected to `/kunden/dashboard?payment=success`. The current webhook handler (line 49-73 in `src/app/api/stripe/webhook/route.ts`) updates the Anfrage status to `bezahlt`. But there is a ~200-500ms gap where the user lands on the success page BEFORE the webhook has fired. The dashboard shows the old status (`bestaetigt` or `zahlungslink_versendet`), confusing the customer. Worse: if the customer refreshes and sees the old status, they may attempt to pay again, creating a duplicate Checkout Session.

The existing idempotency check (`if (anfrage.status !== 'bezahlt')`) only prevents double-processing of the same webhook -- it does NOT prevent the user from creating a second Checkout Session via `/api/stripe/checkout` while the first webhook is still in-flight.

**Why it happens:**
Stripe webhooks are asynchronous. The redirect to `success_url` happens immediately when the customer completes payment. The webhook is sent separately and may arrive 100ms to 30s later. The current code has no mechanism to bridge this gap.

**How to avoid:**
1. On the success page, poll the Anfrage status (e.g., every 2s for up to 30s) OR use Stripe's `session.retrieve()` to eagerly check payment_status
2. Add a `stripe_payment_intent_id` field to Anfragen -- store the Payment Intent ID on Checkout Session creation, not just on webhook receipt
3. In `/api/stripe/checkout`, reject new Checkout Sessions if a `stripe_payment_intent_id` already exists for this Anfrage (prevents double-pay)
4. Make all database operations idempotent: the webhook handler and the eager-sync path must both use the same update logic with the same guards

**Warning signs:**
- Customer support tickets: "I paid but it still shows bestätigt"
- Duplicate Stripe charges for the same Anfrage
- Race condition test: run `stripe trigger checkout.session.completed` while simultaneously loading the success page

**Phase to address:** Stripe Zahlungslink phase (early in v1.4)

---

### Pitfall 2: Stripe Webhook Event Ordering and Duplicate Delivery

**What goes wrong:**
Stripe delivers webhooks with at-least-once semantics. The current handler processes exactly one event type (`checkout.session.completed`) but v1.4 adds `checkout.session.expired`, `charge.refunded`, and `charge.dispute.created`. These events can arrive out of order or be delivered multiple times (Stripe retries for up to 3 days on 5xx/timeout responses).

Scenario: A `charge.refunded` event arrives, sets status to `storniert`, then a delayed `checkout.session.completed` retry arrives (from a network blip 2 hours ago) and sets status back to `bezahlt`. The idempotency check (`if (anfrage.status !== 'bezahlt')`) does not catch this because the status IS different from `bezahlt` at that point -- it is `storniert`, so the check passes and the status regresses.

**Why it happens:**
The idempotency check only prevents re-processing the SAME transition, not invalid transitions. The existing `isValidTransition()` function in `status-transitions.ts` is used in the beforeChange hook, but the webhook handler bypasses it by calling `payload.update()` directly.

**How to avoid:**
1. Store `stripe_event_id` (from `event.id`) in a processed-events table or Set field. Check before processing -- if event was already processed, return 200 immediately
2. Use `isValidTransition()` in the webhook handler too: do not set `bezahlt` if current status is `storniert` or `abgeschlossen`
3. Process events through Payload's API (which triggers beforeChange hooks with transition validation) rather than raw `payload.update()` -- OR replicate the transition validation in the webhook handler
4. Log and alert on rejected events (webhook tried to set bezahlt but transition was invalid)

**Warning signs:**
- Status regressions visible in StatusHistorie (e.g., storniert -> bezahlt)
- Stripe Dashboard shows successful delivery but system state is wrong
- N8N sends contradictory emails (first "Storniert", then "Bezahlt")

**Phase to address:** Stripe Zahlungslink phase

---

### Pitfall 3: Gap-Free Invoice Numbering (Lueckenlose Rechnungsnummern) with PostgreSQL

**What goes wrong:**
German tax law (ss 14 UStG) requires sequential, gap-free invoice numbers. PostgreSQL SERIAL / SEQUENCE is explicitly NOT suitable for this because sequences never rollback -- if a transaction fails after consuming a sequence value, that number is gone forever, creating a gap. The todo `039_rechnung-mwst-steuer.md` requires format `RE-YYYY-NNN` with no gaps.

Two common mistakes:
1. Using `SERIAL` or `nextval()` -- gaps on rollback
2. Using `MAX(nummer) + 1` without locking -- race condition where two concurrent invoice creations get the same number

**Why it happens:**
PostgreSQL sequences are designed for performance (no locking), not gap-freedom. Developers assume SERIAL = sequential = gap-free, which is wrong. PostgreSQL documentation explicitly states sequences can have gaps.

**How to avoid:**
Use a dedicated counter table with row-level locking:

```sql
CREATE TABLE invoice_counters (
  year INTEGER PRIMARY KEY,
  next_number INTEGER NOT NULL DEFAULT 1
);

-- In a transaction:
UPDATE invoice_counters SET next_number = next_number + 1
  WHERE year = 2026
  RETURNING next_number - 1 AS assigned_number;
```

Implementation in Payload CMS:
1. Create an `invoice_counters` Global or a raw SQL query via `payload.db.drizzle`
2. Wrap invoice creation in a single transaction: lock counter row -> get number -> create invoice -> commit
3. NEVER generate the invoice number outside the transaction
4. If the transaction fails (e.g., PDF generation fails), the counter was never incremented -- gap-free by design
5. The counter table must use `FOR UPDATE` or `UPDATE ... RETURNING` to serialize concurrent access

**Warning signs:**
- Gaps visible when sorting invoices by number
- Duplicate numbers under concurrent load (two Anfragen go to `bezahlt` simultaneously)
- Tax audit: Finanzamt asks about missing invoice numbers

**Phase to address:** Rechnung/MwSt phase -- must be designed before the first invoice is generated, cannot be retrofitted without renumbering

---

### Pitfall 4: MwSt Rundungsdifferenzen (VAT Rounding Errors)

**What goes wrong:**
The current system stores prices as `number` (JavaScript floating-point). When adding 19% MwSt, floating-point arithmetic causes rounding errors:

```javascript
// Example: Preis 119.99 EUR netto
119.99 * 0.19 = 22.7981  // rounds to 22.80
// But per-item calculation with Stueckzahl:
3 * 39.99 * 0.19 = 22.7943  // rounds to 22.79
// Difference: 0.01 EUR -- Rundungsdifferenz
```

Two legal methods exist in Germany:
1. **Positionsweise Rundung**: Calculate MwSt per line item, round each, sum
2. **Summenweise Rundung**: Sum all netto amounts first, then calculate MwSt on sum

Both are legally valid per ss 14 UStG, but you MUST be consistent. Mixing methods within one invoice creates Rundungsdifferenzen that look like calculation errors.

The current `createCheckoutSession()` uses `Math.round(gesamtpreis * 100)` to convert to Stripe cents -- but `gesamtpreis` is already a rounded EUR value, so this may introduce a second rounding step.

**Why it happens:**
JavaScript `number` is IEEE 754 double-precision float. `0.1 + 0.2 !== 0.3`. Financial calculations with floats are fundamentally unreliable.

**How to avoid:**
1. **Decide brutto vs. netto storage NOW** -- the todo asks this question. Recommendation: store netto in CMS, display brutto to customers. This matches B2C practice in Germany and avoids reverse-calculating netto from brutto
2. **Calculate in Cent (integer arithmetic):** Convert all prices to Cent integers immediately. `Math.round(nettoEUR * 100)` once, then all arithmetic in Cent
3. **Use summenweise Rundung** (simpler, fewer rounding operations): Sum all netto Cent amounts, then `mwstCent = Math.round(sumNettoCent * 0.19)`, then `bruttoCent = sumNettoCent + mwstCent`
4. **Create `src/lib/tax.ts`** as single source of truth for all MwSt calculations. Every component (Konfigurator, Warenkorb, PDF, Stripe) must call the same function
5. **Store MwSt-Satz in a configurable Global** (not hardcoded 19%) -- rate changed from 19% to 16% and back in 2020/2021

**Warning signs:**
- PDF Rechnung shows different total than Stripe charge
- Warenkorb total differs from Anfrage total by 1 Cent
- Customer complains about "wrong price" on invoice vs. what they saw in Konfigurator

**Phase to address:** MwSt/tax.ts must be built BEFORE PDF generation and BEFORE Stripe amount changes. It is a dependency for both.

---

### Pitfall 5: PDF Generation Memory/Timeout in Next.js App Router

**What goes wrong:**
`@react-pdf/renderer` has documented compatibility issues with Next.js App Router. `renderToBuffer()` throws `TypeError: ba.Component is not a constructor` in certain Next.js versions. Puppeteer requires ~250MB RAM for Chromium and 5-15s startup time, unsuitable for the target Netcup VPS 1000 G11 (likely 4-8GB RAM shared with PostgreSQL, N8N, and the app itself).

For Angebots-PDFs with multiple configured fenster products (each with 10+ attributes, SVG previews potentially), the PDF can easily exceed 5 pages. A complex invoice with 10 products, MwSt breakdown, and company letterhead takes 2-8 seconds to generate.

**Why it happens:**
Next.js App Router route handlers run in the Node.js runtime by default but have shared memory with the application. PDF libraries either need a headless browser (Puppeteer: heavy) or have React compatibility issues (@react-pdf/renderer: fragile with RSC). The VPS does not have unlimited memory like cloud functions.

**How to avoid:**
1. **Use `@react-pdf/renderer` with `renderToBuffer()`** -- it is the best fit for React-based invoice templates. BUT: add `@react-pdf/renderer` to `serverComponentsExternalPackages` in `next.config.js` (required for Next.js 15 compatibility)
2. **Generate PDFs in a dedicated API route** (`/api/pdf/generate`), not inside an afterChange hook -- hooks should be fast
3. **Store the generated PDF** in Payload's Media collection (binary storage) and link to it from the Anfrage/Rechnung document. Do not regenerate on every download
4. **Set `runtime = 'nodejs'`** explicitly on the PDF route handler (not edge runtime)
5. **Limit concurrent PDF generation**: use a simple in-memory semaphore (max 2-3 concurrent PDFs) to prevent OOM on the VPS
6. **Do NOT use Puppeteer** -- on a shared VPS with PostgreSQL and N8N, Chromium will consume too much RAM. @react-pdf/renderer is purely in-process and uses ~50MB per render

**Warning signs:**
- OOM kills on the VPS (Docker container restarts)
- PDF generation timeouts under concurrent load
- `TypeError: ba.Component is not a constructor` errors in production
- Blank PDFs or missing fonts

**Phase to address:** PDF infrastructure phase -- must be validated with a proof-of-concept before building all templates

---

### Pitfall 6: E-Mail Template Rendering -- Outlook Word Engine and Inline CSS

**What goes wrong:**
Outlook desktop (2016-2024) uses Microsoft Word's HTML rendering engine, not a browser engine. This means: no flexbox, no grid, no `<div>` layout (must use `<table>`), no `max-width`, no `background-image` on divs, no `display: none` on images. 2025-2026 is "peak dual-Outlook pain" because Business Standard/Premium users auto-migrated to the new Chromium-based Outlook while others still use the Word engine -- you must code for both simultaneously.

Gmail strips all `<style>` blocks and external CSS. Only inline `style=""` attributes survive. Gmail also strips `display: none` in some cases.

Dark mode inversion: pure `#FFFFFF` backgrounds and `#000000` text trigger aggressive color inversion in Gmail and Outlook dark mode, making logos invisible and text unreadable.

**Why it happens:**
E-mail rendering has not modernized like web rendering. Each client has its own quirks. Developers write HTML like web pages and expect it to work in email -- it does not.

**How to avoid:**
1. **Use MJML** (not raw HTML) for email templates. MJML compiles to email-safe HTML with all the table-layout, MSO conditional comments, and inline CSS handling done automatically. The todo mentions MJML as an option -- use it, it saves weeks of cross-client debugging
2. **MJML integrates with N8N**: Compile MJML to HTML at build time, store compiled HTML templates in `src/email-templates/compiled/`. N8N uses the compiled HTML with variable substitution (`{{kunde_name}}`, etc.)
3. **Dark mode**: Use off-white backgrounds (`#FAFAFA`) and dark grey text (`#222222`) instead of pure white/black
4. **Test with real clients**: Outlook desktop, Gmail web, Gmail app, Apple Mail, Thunderbird. At minimum test Outlook and Gmail -- they cover 80%+ of business email
5. **Do NOT use React Email** for this project: React Email cannot render MSO conditional comments (required for Outlook), and the project already uses N8N for sending (not Resend). MJML is the safer choice
6. **Include a preview route** (`/api/email-preview/[template]`) that renders compiled HTML for testing during development

**Warning signs:**
- Broken layout in Outlook (single-column content wrapping unexpectedly)
- Images not showing in Gmail (missing `alt` text, `display: none` stripping)
- Dark mode: logo disappears, text invisible against inverted background
- Variables showing as `{{undefined}}` in sent emails

**Phase to address:** E-Mail Template phase -- build MJML base template first, compile workflow second, individual templates third

---

### Pitfall 7: N8N Retry Storms and Duplicate E-Mails

**What goes wrong:**
The current `sendN8NWebhook()` function (line 28-72 in `src/lib/n8n-webhook.ts`) fires webhooks without any idempotency key. If N8N is temporarily down (e.g., during a Docker restart on the shared VPS), the webhook fails, and the `afterChange` hook logs the error but does NOT retry. The email is lost.

Conversely, if the Next.js app responds slowly (e.g., during PDF generation), N8N's webhook trigger may time out and N8N's retry mechanism will call the webhook again -- but N8N's `Remove Duplicates` node only deduplicates within a single execution, not across retries. Each retry is a new execution. Result: the customer receives the same email 2-5 times.

With v1.4 adding 18+ email events (from the Event-Matrix), the probability of at least one duplicate or lost email per week is near 100%.

**Why it happens:**
At-least-once delivery is the default for webhooks. Without idempotency keys and external deduplication, there is no way to guarantee exactly-once processing. The current architecture has no retry mechanism on the sender side and no deduplication on the receiver side.

**How to avoid:**
1. **Add an idempotency key** to every webhook payload: `idempotency_key: ${anfrage_id}_${event_type}_${new_status}_${timestamp_minute}`. The key should be unique per logical event but stable across retries
2. **In N8N**: Before the Send Email node, check if this `idempotency_key` has been processed before (use N8N's internal database or a Redis set with 24-hour TTL). If already processed, skip
3. **On the sender side**: Implement a simple webhook outbox pattern -- on failure, store the webhook payload in a `webhook_outbox` Payload collection and process it with a cron job (or N8N polling trigger)
4. **Set reasonable timeouts**: N8N webhook trigger should have a 10s timeout. The Next.js webhook sender should have a 5s fetch timeout
5. **Add a `sent_emails` log**: Track every email sent (anfrage_id, event_type, timestamp, recipient) to detect and diagnose duplicates

**Warning signs:**
- Customer receives the same status email twice
- Email not sent after N8N restart (webhook was lost)
- `[N8N Webhook] Network error: ECONNREFUSED` in logs during VPS maintenance
- Webhook error count in `webhook_errors` Global increases during peak hours

**Phase to address:** N8N E-Mail System phase -- idempotency keys must be added BEFORE the full email matrix is implemented

---

### Pitfall 8: afterChange Hook Cascading -- One Hook Triggers Another

**What goes wrong:**
The existing `afterChange` hook on Anfragen (line 175-249) sends N8N webhooks and creates Stripe Checkout Sessions. In v1.4, new afterChange hooks will be added for:
- Generating Rechnungs-PDF when status changes to `bezahlt`
- Generating Angebots-PDF when status changes to `angebot_versendet`
- Updating Stripe refund status when status changes to `storniert`
- Storing `stripe_payment_intent_id` when Checkout Session is created

If the PDF generation hook updates the Anfrage document (to store the PDF media reference), this triggers the afterChange hook again, which sends ANOTHER N8N webhook, which sends a DUPLICATE email. The edit-history hook already demonstrates the correct pattern (`context.skipEditHistory`), but the same pattern must be applied consistently to ALL hooks.

Worse: if two hooks both call `payload.update()` on the same Anfrage within the same afterChange execution, PostgreSQL can deadlock (both updates try to lock the same row). This is documented in Payload CMS issue discussions.

**Why it happens:**
Each `payload.update()` call triggers the full hook chain. The `context` guard pattern exists in the codebase (see `profile-edit-history.ts` line 39) but is easy to forget when adding new hooks under time pressure.

**How to avoid:**
1. **Establish a hook context convention**: Every afterChange hook that calls `payload.update()` on any collection must set AND check a context flag. Standardize naming: `context.skipPdfGeneration`, `context.skipWebhook`, `context.skipStripeSync`
2. **Never call `payload.update()` on the SAME document from an afterChange hook** -- use `beforeChange` to set fields on the document being saved, or use `context` flags to batch operations
3. **Queue side effects, do not execute inline**: Instead of generating PDFs in the afterChange hook, enqueue a job (e.g., write a row to a `pending_pdfs` collection) and process it asynchronously. This prevents hook cascading entirely
4. **Order hooks explicitly**: If multiple afterChange hooks exist on the same collection, they execute in array order. Place the webhook-sending hook LAST so that all fields are finalized before the webhook fires
5. **Write a test**: Create an Anfrage, change status to `bezahlt`, verify that exactly ONE webhook was sent and the PDF was generated without triggering a second afterChange cycle

**Warning signs:**
- `[Anfragen afterChange] Webhook error` appearing multiple times for one status change
- PostgreSQL deadlock errors in logs
- StatusHistorie shows phantom status changes (same status to same status)
- PDF generation triggers email, email triggers another PDF

**Phase to address:** Must be addressed in the FIRST phase that adds a new afterChange hook. Establish the convention early.

---

### Pitfall 9: CSRF Expansion -- Breaking Payload Admin Panel Requests

**What goes wrong:**
The current CSRF protection (`isSameOriginOrReferer()` in `src/lib/security.ts`) is applied only to `/api/stripe/checkout`. The todo `035_security-kritisch-sofort-fixen.md` calls for applying it to ALL mutating endpoints. But Payload CMS's own Admin Panel makes API requests to `/api/anfragen`, `/api/users`, etc. via the Payload REST API. If a global CSRF middleware is applied naively, it will block Payload Admin Panel requests when the Admin Panel is served from the same origin -- but NOT when it is accessed through a reverse proxy or different port.

Additionally, Payload CMS has its OWN built-in CSRF protection via the `csrf` config option (array of whitelisted domains). Doubling up with custom middleware creates confusion about which layer is responsible and can result in either too-permissive (both think the other handles it) or too-restrictive (both block legitimate requests) behavior.

**Why it happens:**
Developers add CSRF middleware without understanding Payload's existing protection. Payload checks the `Origin`/`Referer` header against the `csrf` whitelist for cookie-authenticated requests. Adding a second check on the same headers creates no additional security but doubles the maintenance burden and failure surface.

**How to avoid:**
1. **Use Payload's built-in `csrf` config** for Payload API routes (`/api/*` managed by Payload). Set `csrf: [process.env.NEXT_PUBLIC_SERVER_URL]` in the Payload config. This covers the Admin Panel and all Payload REST API endpoints
2. **Apply custom `isSameOriginOrReferer()` only to CUSTOM API routes** that are NOT managed by Payload: `/api/stripe/*`, `/api/anfrage/submit`, `/api/anfrage/calculate-price`, `/api/anfrage/validate-discount`, `/api/status-pruefen`
3. **Do NOT apply custom CSRF middleware in Next.js `middleware.ts`** -- the Edge Runtime cannot reliably access all request context. Apply CSRF checks inside each route handler (current pattern for `/api/stripe/checkout` is correct)
4. **Test the Admin Panel after CSRF changes** -- log in as admin, create/update/delete an Anfrage. If any operation fails with 403, the CSRF config is too restrictive

**Warning signs:**
- Admin Panel shows "Forbidden" errors on save
- Payload Admin returns 403 on collection operations after middleware change
- Customer-facing forms work but Admin Panel does not (or vice versa)

**Phase to address:** Security Hardening phase (first phase of v1.4) -- but test thoroughly against Admin Panel

---

### Pitfall 10: Payload Global Caching -- Stale MwSt-Satz and Email Settings

**What goes wrong:**
Payload Globals (e.g., `webhook_errors`, and the planned `settings` Global for MwSt-Satz, email config, etc.) are cached by Next.js. When an admin changes the MwSt-Satz from 19% to 7% (reduced rate for certain goods), the cached value in server components and API routes may still return 19%. Invoice PDFs generated after the change use the OLD rate. The customer is charged incorrect MwSt.

The current `webhook_errors` Global already has this issue -- but webhook error display is non-critical. MwSt-Satz and email settings are critical.

**Why it happens:**
Next.js caches `payload.findGlobal()` results when called from server components or route handlers with default caching. Payload does not automatically invalidate Next.js caches. Without explicit `revalidateTag()` calls in Global afterChange hooks, stale data persists until the next deployment or cache expiration.

**How to avoid:**
1. **Add revalidation hooks to ALL Globals** used in v1.4:
```typescript
// In the Global config:
hooks: {
  afterChange: [
    async () => {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('global_settings');
    },
  ],
}
```
2. **When reading Globals in API routes** (non-cached context), use `draft: false` and avoid `unstable_cache` for financial data. For MwSt calculations, always fetch fresh from database -- do not cache
3. **For the `settings` Global**: Tag it with a unique cache tag and revalidate on every change. Use `{ next: { tags: ['global_settings'] } }` when fetching
4. **Add a timestamp field** (`settings_updated_at`) to the Global. Log this in invoice PDFs as an audit trail ("MwSt-Satz: 19%, gueltig seit: 2026-01-01")

**Warning signs:**
- Admin changes MwSt-Satz, but new invoices still show old rate
- Email template variables show old values after admin update
- `webhook_errors` Global shows stale error list in Admin Panel
- Discrepancy between Payload Admin display (fresh) and frontend display (cached)

**Phase to address:** Settings/Global phase -- implement revalidation hooks before any Global is used for financial or email configuration

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing prices as EUR float instead of Cent integer | Less conversion code | 1-Cent rounding errors in invoices, Stripe amount mismatches | Never for financial data |
| Hardcoding MwSt 19% instead of configurable Global | Faster to implement | Must redeploy to change rate (happened in 2020 COVID rate reduction) | Never -- rate WILL change |
| Generating PDF in afterChange hook instead of async | Simpler architecture | Hook blocks for 2-8s, delays Payload response, cascading hook issues | Only for proof-of-concept |
| Using SERIAL for invoice numbers | Zero additional code | Gaps after rollbacks, tax audit risk | Never for legal documents |
| Skipping email deduplication ("N8N handles it") | Less code to write | Duplicate emails within 3 months guaranteed | Never |
| Storing email templates in N8N instead of git | Quick setup | Templates not version-controlled, lost on N8N migration | Only for initial testing |
| isSameOriginOrReferer without Payload csrf config | One-line addition per route | Payload Admin may break, double-checking same headers | Never -- use Payload's built-in csrf |
| No rate limiting ("will add later") | Ship faster | Brute-force attacks from day 1 of production | Never in production |

## Integration Gotchas

Common mistakes when connecting external services to the existing system.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Webhook | Returning 500 on business logic errors (causes Stripe to retry for 3 days) | Return 200 for successfully received events even if business logic rejects them. Return 500 ONLY for infrastructure failures |
| Stripe Webhook | Processing event without checking `event.type` exhaustively | Use a switch/case with explicit handling for each event type. Log and 200-ACK unknown events |
| Stripe Checkout | Creating session with `gesamtpreis * 100` where gesamtpreis has float precision | Convert to Cent integer (`Math.round()`) ONCE when price is first calculated, store as integer, pass integer to Stripe |
| Stripe Refund | Calling `stripe.refunds.create()` without storing the refund ID | Store `stripe_refund_id` on the Anfrage for reconciliation and customer support |
| N8N Webhook | Sending webhook payload without idempotency key | Include `idempotency_key` in every payload. N8N workflows must check before processing |
| N8N E-Mail | Hardcoding SMTP credentials in N8N workflow | Use N8N credentials (encrypted), never expose in workflow JSON. Document credential setup in deployment guide |
| N8N E-Mail Attachment | Sending PDF as base64 in webhook payload (exceeds N8N request size limit) | Send PDF URL or Media collection ID. N8N fetches the PDF from the app |
| Payload Global | Reading Global value in server component without cache tag | Use `revalidateTag()` in Global afterChange hook, and tag the fetch |
| Payload afterChange | Calling `payload.update()` without context guard | Always set and check `context.skipXxx` flags to prevent re-entry |
| Rate Limiting | Implementing rate limiting in Edge middleware | Edge Runtime cannot use Node.js-only packages. Implement in route handlers or use Edge-compatible store (Upstash) |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| PDF generation in afterChange hook | Status changes take 3-8s, admin UI feels sluggish | Async PDF generation via queue/collection | First complex invoice with 5+ products |
| Fetching all Anfragen client-side with `limit=0` (existing pattern) | Page load >3s, browser memory spike | Keep for < 500 Anfragen (documented acceptable), add pagination later | ~500 Anfragen |
| Sending all webhook payloads synchronously in afterChange | Hook execution time grows linearly with number of integrations | Queue webhooks, process asynchronously | When 3+ integrations fire on same status change |
| Gapless invoice counter with SELECT ... FOR UPDATE | Serializes all invoice creation, blocks concurrent requests | Acceptable at Christ Fensterhandel volume (max 10 invoices/day). Use pg_advisory_lock for lower contention | ~100 concurrent invoice requests/minute (unlikely) |
| Storing compiled MJML templates in `src/email-templates/compiled/` and reading from filesystem | File I/O on every email send | Cache compiled templates in memory on first read. Invalidate on deploy | ~100 emails/minute (unlikely at current scale) |
| N8N webhook_errors Global with `slice(0, 50)` | Race condition: two errors at the same time, one overwrites the other | Acceptable at current error volume. Switch to a collection if error logging becomes critical | ~10 concurrent webhook errors (unlikely) |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| `.env` with real Stripe keys committed to git (documented in todo 035) | Full payment system compromise, fraudulent charges | Remove from git history (BFG), rotate ALL keys, add to .gitignore |
| No rate limiting on `/api/anfrage/submit` | Anfrage spam -- attacker floods system with fake requests, drowning real ones | 3 requests/minute per IP using `rate-limiter-flexible` with in-memory store (single VPS, no need for Redis) |
| No rate limiting on `/api/users/login` (Payload Auth) | Brute-force password attacks | 5 attempts/minute per IP. Payload has built-in `maxLoginAttempts` config on auth-enabled collections -- USE IT |
| Seed script runs in production (todo 035) | `clearAllCollections()` deletes ALL data including invoices and customer data | `NODE_ENV === 'production'` guard at top of seed script |
| Invoice PDFs accessible without authentication | Anyone with the Media URL can download invoices | Use Payload's access control on the Media collection. Invoices must require authentication (admin or owning customer) |
| Stripe webhook secret not validated in development | Attacker can forge webhook events to set any Anfrage to "bezahlt" | Always validate webhook signatures, even in development. Use Stripe CLI for local testing |
| Email templates expose internal status values | Customer sees `hersteller_bestaetigt_mit_vorbehalt` instead of friendly text | Always use `STATUS_CUSTOMER_TEXT` mapping -- never pass raw status to email templates |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Success page shows old status after Stripe payment | Customer thinks payment failed, tries to pay again | Poll for updated status OR show "Zahlung wird verarbeitet..." spinner for 10s |
| PDF shows different price than Konfigurator preview | Customer loses trust, contacts support | Use same `tax.ts` calculation for preview and PDF |
| Email shows "Status: bezahlt" instead of customer-friendly text | Customer does not understand internal status terminology | Always use `kunden_text` from webhook payload, never raw status |
| No email confirmation for "Anfrage eingegangen" | Customer wonders if submission worked | Send immediate confirmation email (already planned in Event-Matrix) |
| Invoice PDF missing company address/USt-IdNr | Legally invalid invoice, customer cannot deduct VAT | Checklist: all ss 14 UStG required fields verified in template |
| Zahlungslink expires after 24h (Stripe default) without notification | Customer clicks expired link, gets error page | Monitor `checkout.session.expired` webhook, notify customer with new link |
| Dark mode email rendering inverts logo colors | Unprofessional appearance, brand inconsistency | Test in dark mode, use transparent PNG with dark-compatible colors |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Stripe Integration:** Often missing `checkout.session.expired` handler -- verify expired sessions are detected and customer is offered a new link
- [ ] **Stripe Integration:** Often missing `charge.dispute.created` handler -- verify disputes set status to `zahlungsproblem` and alert admin
- [ ] **Stripe Integration:** Often missing `stripe_payment_intent_id` storage -- verify payment can be traced back to Stripe Dashboard
- [ ] **Invoice PDF:** Often missing ss 14 UStG compliance fields -- verify: Steuernummer, Rechnungsdatum, Leistungsbeschreibung, Netto/MwSt/Brutto breakdown
- [ ] **Invoice PDF:** Often missing "Betrag dankend erhalten am ..." -- verify payment confirmation date is on the invoice
- [ ] **Invoice Numbering:** Often missing gap-free validation -- verify by cancelling a transaction mid-creation and checking the counter
- [ ] **MwSt Calculation:** Often missing consistency test -- verify Konfigurator preview, Warenkorb, Stripe amount, and PDF all show identical Brutto
- [ ] **Email Templates:** Often missing Outlook desktop testing -- verify layout in Outlook 2019/2021 (Word engine), not just web clients
- [ ] **Email Templates:** Often missing unsubscribe link -- legally required for marketing emails (not transactional, but good practice for status updates)
- [ ] **Rate Limiting:** Often missing `maxLoginAttempts` in Payload auth config -- verify brute-force protection is active
- [ ] **CSRF:** Often missing Payload `csrf` config option -- verify it is set in `payload.config.ts`
- [ ] **N8N Emails:** Often missing deduplication -- verify same webhook sent twice results in only one email
- [ ] **PDF Storage:** Often missing access control on Media -- verify unauthenticated users cannot download invoice PDFs by guessing URLs
- [ ] **Gutschrift/Stornorechnung:** Often missing when Refund is implemented -- verify Stornorechnung is generated, not just Stripe refund

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Stripe double-charge | MEDIUM | Refund duplicate via Stripe Dashboard, apologize to customer, add idempotency guard |
| Gapped invoice numbers | HIGH | Cannot renumber legally. Create Stornorechnung for missing numbers, document gap reason for Finanzamt |
| MwSt rounding errors on sent invoices | HIGH | Issue Korrekturrechnung (correction invoice) for each affected invoice. Update tax.ts to prevent recurrence |
| Duplicate emails sent | LOW | Apologize to customer. Add idempotency key to N8N workflow |
| Hook cascade caused phantom status changes | MEDIUM | Manually correct StatusHistorie entries. Add context guards to prevent recurrence |
| Stale MwSt rate in cached Global | HIGH | Regenerate all invoices created with wrong rate. Add revalidation hook |
| PDF generation OOM on VPS | LOW | Restart container. Add memory limit and concurrent generation cap |
| CSRF middleware blocks Admin Panel | LOW | Revert middleware change, use Payload's built-in csrf config instead |
| Webhook errors lost during N8N downtime | MEDIUM | Implement outbox pattern. Replay lost webhooks from outbox after N8N recovers |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Stripe webhook race condition (P1) | Stripe Zahlungslink | Integration test: complete Checkout, verify success page shows correct status within 5s |
| Stripe event ordering (P2) | Stripe Zahlungslink | Test: send `charge.refunded` then `checkout.session.completed` -- status must NOT regress |
| Gap-free invoice numbers (P3) | Rechnung/MwSt | Test: concurrent invoice creation (2 parallel requests), verify sequential numbers with no gaps |
| MwSt Rundungsdifferenzen (P4) | MwSt/tax.ts (BEFORE PDF and Stripe) | Test: calculate brutto for 3 items at 39.99 EUR each, verify Konfigurator = Warenkorb = PDF = Stripe |
| PDF memory/timeout (P5) | PDF Infrastructure | Load test: generate 3 PDFs simultaneously on VPS, verify no OOM |
| Email Outlook quirks (P6) | E-Mail Templates | Manual test: send test email to Outlook desktop, Gmail, Apple Mail |
| N8N duplicate emails (P7) | N8N E-Mail System | Test: send same webhook twice with same idempotency key, verify only 1 email sent |
| Hook cascading (P8) | First phase adding new afterChange hooks | Test: status change to bezahlt triggers exactly 1 webhook, 1 PDF generation, 0 re-entries |
| CSRF expansion breaks Admin (P9) | Security Hardening | Test: full CRUD in Admin Panel after CSRF changes |
| Global caching (P10) | Settings/Global phase | Test: change MwSt in Global, verify next invoice uses new rate without redeployment |

## Sources

- [Stripe Idempotent Requests Documentation](https://docs.stripe.com/api/idempotent_requests)
- [Stripe Webhooks: Solving Race Conditions](https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/)
- [The Race Condition You're Probably Shipping Right Now With Stripe Webhooks](https://dev.to/belazy/the-race-condition-youre-probably-shipping-right-now-with-stripe-webhooks-mj4)
- [Billing Webhook Race Condition Solution Guide](https://excessivecoding.com/blog/billing-webhook-race-condition-solution-guide)
- [Best Practices for Stripe Webhook Integration](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)
- [PostgreSQL: Sequences vs. Invoice Numbers (CYBERTEC)](https://www.cybertec-postgresql.com/en/postgresql-sequences-vs-invoice-numbers/)
- [No-gap Sequence in PostgreSQL](https://dev.to/yugabyte/no-gap-sequence-in-postgresql-and-yugabytedb-3feo)
- [Gapless Counter for Invoice Purposes (GitHub)](https://github.com/kimmobrunfeldt/howto-everything/blob/master/postgres-gapless-counter-for-invoice-purposes.md)
- [Kaufmaennische Rundungsdifferenz bei Brutto/Netto (sevdesk)](https://hilfe.sevdesk.de/de/articles/9423755-die-kaufmannische-rundungsdifferenz-darum-unterscheidet-sich-der-endbetrag-von-brutto-und-nettorechnungen)
- [MwSt Berechnungsvarianten (VEPOS)](https://vsoft.vepos.net/online-hilfe/berechnungsvarianten-der-mwst/)
- [react-pdf renderToBuffer Issues with Next.js App Router (GitHub #2460)](https://github.com/diegomura/react-pdf/issues/2460)
- [react-pdf Not Working with Next.js 15 (GitHub #3074)](https://github.com/diegomura/react-pdf/issues/3074)
- [Email Client Rendering Differences 2026](https://dev.to/aoifecarrigan/the-complete-guide-to-email-client-rendering-differences-in-2026-243f)
- [State of Email Markup in React 2025](https://voskoboinyk.com/posts/2025-01-29-state-of-email-markup)
- [MJML Framework](https://mjml.io/)
- [Preventing Duplicate Webhook Executions in N8N](https://community.n8n.io/t/preventing-duplicate-webhook-executions-in-n8n-idempotency-gate-workflow/275249)
- [Webhook Replays in N8N: The Duplicate Event Trap](https://medium.com/@duckweave/webhook-replays-in-n8n-the-duplicate-event-trap-43126d472d01)
- [N8N Webhook Idempotency GitHub](https://github.com/aari-ai/n8n-webhook-idempotency)
- [Payload CMS: Bypass Infinity Loop in Hooks (GitHub #816)](https://github.com/payloadcms/payload/discussions/816)
- [Payload CMS: Hook Context Documentation](https://payloadcms.com/docs/hooks/context)
- [Safely Manipulate Data in Payload CMS Hooks with PostgreSQL](https://www.buildwithmatija.com/blog/payload-cms-hooks-safe-data-manipulation-postgresql)
- [Payload CMS: Preventing API Abuse](https://payloadcms.com/docs/production/preventing-abuse)
- [Payload CMS: CSRF / Cookie Strategy](https://payloadcms.com/docs/authentication/cookies)
- [Payload CMS: Stale Data Issue (GitHub #9012)](https://github.com/payloadcms/payload/issues/9012)
- [Speed Up Payload CMS with unstable_cache](https://www.buildwithmatija.com/blog/how-to-speed-up-your-payload-cms-site-with-unstable_cache)
- [rate-limiter-flexible (GitHub)](https://github.com/animir/node-rate-limiter-flexible)
- [CSRF Tokens in React: When You Actually Need Them](https://cybersierra.co/blog/csrf-tokens-react-need-them/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [PostgreSQL: Explicit Locking / Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html)

---
*Pitfalls research for: v1.4 Bestellungsflow + Integrationen (Security, Stripe, N8N, PDF, MwSt, Kunden-Features)*
*Researched: 2026-03-27*
