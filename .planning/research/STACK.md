# Technology Stack — v1.4 Additions

**Project:** Christ Fensterhandel Konfigurator-System
**Domain:** Security hardening, Stripe expansion, E-Mail system, PDF generation, MwSt/invoicing
**Researched:** 2026-03-27
**Confidence:** HIGH

## Scope of This Document

This document covers **only the stack additions and changes for v1.4**. The existing stack (Next.js 15.4.11, Payload CMS 3.79, PostgreSQL, React 19.2.4, Tailwind CSS 4, Shadcn UI, Zustand, Zod 4.3.6, React Hook Form, Stripe 20.4.1, N8N, Puck, date-fns, Radix UI primitives) is not re-researched -- it is validated and fixed.

---

## Core Finding: 5 New Dependencies

After surveying the full v1.4 feature set, **5 new npm packages are required**. One existing package (stripe) should be upgraded. Everything else is achievable with existing installed packages, the Stripe API (already installed), or zero-dependency TypeScript patterns.

---

## Recommended Stack Additions

### 1. Rate Limiting: `rate-limiter-flexible`

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `rate-limiter-flexible` | ^10.0.1 | Rate limiting on API routes (login, submit, discount validation) | In-memory rate limiting without external services. The project deploys to a single Coolify instance (not serverless/edge), so in-memory `RateLimiterMemory` is the correct choice -- no Redis needed. |

**Why NOT `@upstash/ratelimit`:** Upstash requires an external Redis instance (Upstash Cloud or self-hosted Redis). The project runs on a single Netcup VPS with Coolify -- adding Redis for rate limiting alone is over-engineered. `rate-limiter-flexible` with `RateLimiterMemory` stores counters in Node.js process memory, which is correct for a single-process deployment. If the project later scales to multiple server instances, a migration path to `RateLimiterPostgres` exists within the same library (no code changes needed -- swap the storage backend constructor).

**Why NOT custom middleware with `Map()`:** A custom implementation risks missing edge cases (counter expiry cleanup, burst handling, IP parsing behind proxies). `rate-limiter-flexible` handles all of this with 0.7ms average request overhead and is battle-tested at scale.

**Integration pattern:**

```typescript
// src/lib/rate-limit.ts
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible'

// Separate limiters per concern
export const loginLimiter = new RateLimiterMemory({
  points: 5,       // 5 attempts
  duration: 60,    // per 60 seconds
  blockDuration: 300, // block for 5 min after exceeded
})

export const submitLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60,
})

export const discountLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
})

// Helper for Next.js API route handlers
export async function checkRateLimit(
  limiter: RateLimiterMemory,
  key: string,
): Promise<{ limited: boolean; retryAfter?: number }> {
  try {
    await limiter.consume(key)
    return { limited: false }
  } catch (rlRes) {
    if (rlRes instanceof RateLimiterRes) {
      return { limited: true, retryAfter: Math.ceil(rlRes.msBeforeNext / 1000) }
    }
    return { limited: false } // fail open on unexpected errors
  }
}
```

**IP extraction for Next.js App Router:**
```typescript
// In API route handlers:
const forwarded = request.headers.get('x-forwarded-for')
const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
```

**Confidence: HIGH** -- verified via npm, compatible with Node.js 18/20, zero external dependencies, works in single-process deployments.

---

### 2. CSRF Protection: No New Package Needed

**The existing `src/lib/security.ts` already has `isSameOriginOrReferer()` and `validateCsrfToken()`.** The v1.4 task is to apply these consistently across all API routes -- no new library needed.

**Implementation approach:**
- Create a reusable `withCsrf()` wrapper or apply `isSameOriginOrReferer(request)` check at the top of every POST/PATCH/DELETE route handler
- Exclude the Stripe webhook route (it uses `stripe-signature` verification instead)
- The existing double-submit cookie pattern (`validateCsrfToken`) can be activated as an additional layer for sensitive operations

**Why NOT `csrf-csrf` or `csurf`:** The Origin/Referer check is the modern standard (recommended by OWASP for same-site cookie configurations). Double-submit tokens add complexity with minimal benefit when `SameSite=Lax` cookies are used (which Payload Auth cookies already use). The existing code is sufficient.

**Confidence: HIGH** -- existing implementation reviewed, OWASP-aligned.

---

### 3. Stripe Expansion: Upgrade Existing `stripe` Package

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `stripe` | ^21.0.1 (upgrade from ^20.4.1) | Payment Links API, Refund API, additional webhook events | Latest version includes all needed APIs. Stripe follows semver; v21 is a major version with potential breaking changes that should be reviewed. |

**Important: Evaluate major version upgrade.** The currently installed `stripe@20.4.1` already supports all needed APIs (Payment Links, Refunds, webhook event types). A major version bump to v21 should only happen if the changelog shows improvements relevant to the project. **If v21 introduces breaking changes, stay on ^20.4.1** -- it has everything needed.

**Decision: Stay on `stripe@^20.4.1` unless v21 changelog shows critical fixes.** The Refund API, Payment Links API, `checkout.session.expired`, `charge.dispute.created`, and `charge.refunded` events are all available in v20.

**New Stripe features to use (all in existing `stripe@20.4.1`):**

| Feature | API | Notes |
|---------|-----|-------|
| Payment Links | `stripe.paymentLinks.create()` | BUT: Use Checkout Sessions instead (see below) |
| Refunds | `stripe.refunds.create({ payment_intent: 'pi_...' })` | Supports partial refunds via `amount` param |
| Expire Session | `stripe.checkout.sessions.expire(sessionId)` | Invalidate old session before creating new one |
| Session expiry | `expires_at` param on `sessions.create()` | Set 48h expiry: `Math.floor(Date.now()/1000) + 172800` |

**Architecture decision: Checkout Sessions, NOT Payment Links.**

The project already uses Checkout Sessions. Payment Links are for no-code use cases (sharing a static link). Checkout Sessions are programmatic, support dynamic metadata (`anfrage_id`, `anfrage_nummer`), and integrate with the existing webhook handler. Switching to Payment Links would require reworking the entire flow for no benefit.

The term "Zahlungslink" in the todo docs refers to the *concept* of sending a payment URL to the customer -- this is achieved by storing `session.url` from `stripe.checkout.sessions.create()`, which already returns a shareable URL. No new API needed.

**New webhook events to handle:**

```typescript
// Extend existing src/app/api/stripe/webhook/route.ts
switch (event.type) {
  case 'checkout.session.completed':
    // existing: set status to 'bezahlt'
    break
  case 'checkout.session.expired':
    // NEW: set status back to 'zahlungslink_abgelaufen', notify admin
    break
  case 'charge.refunded':
    // NEW: update refund status on Anfrage, generate Gutschrift PDF
    break
  case 'charge.dispute.created':
    // NEW: set status to 'zahlungsproblem', alert admin urgently
    break
}
```

**New fields on Anfragen collection:**

| Field | Type | Purpose |
|-------|------|---------|
| `stripe_checkout_url` | text | Shareable payment URL from Checkout Session |
| `stripe_session_id` | text | For session management (expire old, create new) |
| `stripe_payment_intent_id` | text | For refund API (`stripe.refunds.create({ payment_intent })`) |
| `stripe_refund_status` | select | none / partial / full |
| `stripe_refund_amount` | number | Amount refunded in cents |

**Confidence: HIGH** -- Stripe API is stable, all features verified in official docs.

---

### 4. PDF Generation: `@react-pdf/renderer`

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@react-pdf/renderer` | ^4.3.2 | Server-side PDF generation for Angebote + Rechnungen + Gutschriften | React-based declarative PDF creation. Produces deterministic output without headless browser. Compatible with React 19 (since v4.1.0). |

**Why `@react-pdf/renderer` over alternatives:**

| Alternative | Why NOT |
|-------------|---------|
| Puppeteer / puppeteer-core | Requires headless Chromium (~50-170MB). The Coolify VPS has limited resources. Puppeteer is slow (2-5s per PDF vs 200-500ms for @react-pdf). Docker image size bloat. |
| PDFKit | Imperative API (`doc.text('Hello', 100, 200)`) -- manual positioning of every element. No component reuse pattern. For an invoice with variable line items, header, footer, page breaks, the imperative approach becomes unwieldy. |
| jsPDF | Client-side focused. No CSS rendering. Not suitable for professional Angebot/Rechnung PDFs with precise layout requirements. |
| pdfmake | JSON-based declarative API -- decent, but the team already works in React/TSX. @react-pdf/renderer lets you write PDF templates as React components with JSX, reusing the same mental model as the rest of the codebase. |

**Next.js 15 + React 19 compatibility:**

The `renderToBuffer`/`renderToStream` issue with Next.js 15 (GitHub issue #3074, #2994) **is resolved when using React 19**. The project already runs React 19.2.4. The workaround is confirmed: upgrading to React 19 resolves the "PDFDocument is not a constructor" error. Additionally, add `@react-pdf/renderer` to `serverComponentsExternalPackages` in `next.config.ts` for safety:

```typescript
// next.config.ts
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // ... existing config
}
```

**Usage pattern for API route:**

```typescript
// src/app/api/angebot/generate/route.ts
import { renderToBuffer } from '@react-pdf/renderer'
import { AngebotDocument } from '@/lib/pdf/angebot-template'

export async function POST(request: Request) {
  // ... auth, validation, data fetching ...
  const pdfBuffer = await renderToBuffer(
    <AngebotDocument anfrage={anfrage} firmenDaten={firmenDaten} />
  )
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Angebot-${angebotNummer}.pdf"`,
    },
  })
}
```

**PDF templates to build (in `src/lib/pdf/`):**

| Template | Trigger | Key Content |
|----------|---------|-------------|
| `angebot-template.tsx` | Status -> "angebot_versendet" | Firmenlogo, Kundendaten, Produkte mit Konfiguration, Netto + MwSt + Brutto, Gueltigkeitsdauer, AGB-Verweis |
| `rechnung-template.tsx` | Status -> "bezahlt" | Pflichtangaben nach Paragraph 14 UStG: Steuernummer, Rechnungsnummer (lueckenlos), Leistungsbeschreibung, MwSt-Ausweis, Zahlungsvermerk |
| `gutschrift-template.tsx` | Stripe Refund | Referenz auf Original-Rechnung, Erstattungsbetrag, Stornogrund |
| `shared-styles.ts` | -- | Gemeinsame Styles (Farben aus Style Guide, Fonts, Spacing) |

**Confidence: HIGH** -- React 19 compatibility confirmed by multiple users and the maintainer. Version 4.3.2 is current. Server-side `renderToBuffer` works in Next.js 15 with React 19.

---

### 5. E-Mail Templates: `@react-email/components` + `@react-email/render`

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@react-email/components` | ^1.0.10 | Pre-built responsive email components (Html, Head, Body, Container, Text, Button, Hr, Img, Section, Row, Column) | Battle-tested components that produce inline CSS compatible with Gmail, Outlook, Apple Mail. |
| `@react-email/render` | ^2.0.4 | Render React email components to HTML strings server-side | The `render()` function converts JSX to HTML with inlined CSS. Output is a plain HTML string that N8N sends via any SMTP provider. |
| `react-email` | ^5.2.10 (devDependency) | Local email preview dev server | `npx email dev` starts a local preview server at `localhost:3000` for developing/testing templates. Dev-only -- not shipped to production. |

**Why React Email over MJML:**

| Criterion | React Email | MJML |
|-----------|-------------|------|
| Developer experience | JSX/TSX -- same as rest of codebase | Custom `mj-*` tags, different mental model |
| Tailwind support | Built-in Tailwind 4 support (project already uses TW4) | No native Tailwind support |
| Responsive | Components handle responsive tables/columns | Built-in responsive |
| Inline CSS | Automatic via `render()` function | Automatic via MJML compiler |
| React 19 compat | Yes (peerDep: `^19.0`) | N/A (MJML is not React-based; mjml-react is unmaintained) |
| Bundle size | Only components used are imported | Entire MJML compiler needed |

**React Email wins because:** The codebase is 100% React/TSX. Writing email templates in JSX means the same developers, same patterns, same tooling. MJML would introduce a second markup language. React Email also has native Tailwind 4 support, which matches the project's existing design system.

**Provider-agnostic architecture:**

React Email's `render()` produces a plain HTML string. This string is sent to N8N via the existing webhook payload. N8N then sends it via whatever SMTP provider is configured (Gmail SMTP, custom SMTP, SendGrid, Mailgun -- N8N supports all of them). The React Email components have zero coupling to any specific email-sending service.

```typescript
// src/lib/email/render-email.ts
import { render } from '@react-email/render'
import { ZahlungsbestatigungEmail } from '@/lib/email/templates/zahlungsbestaetigung'

export async function renderEmail(
  template: string,
  data: Record<string, unknown>,
): Promise<string> {
  switch (template) {
    case 'zahlungsbestaetigung':
      return await render(<ZahlungsbestatigungEmail {...data} />)
    case 'angebot_versendet':
      return await render(<AngebotVersendetEmail {...data} />)
    // ... other templates
  }
}
```

**Template files to create (in `src/lib/email/templates/`):**

| Template | Event | Recipients |
|----------|-------|------------|
| `base-layout.tsx` | -- | Shared wrapper (logo, footer, Impressum) |
| `neue-anfrage.tsx` | neue_anfrage | Kunde + Mitarbeiter |
| `status-update.tsx` | status_aenderung (generic) | Kunde |
| `angebot-versendet.tsx` | angebot_versendet | Kunde |
| `zahlungslink.tsx` | zahlungslink_versendet | Kunde |
| `zahlungsbestaetigung.tsx` | bezahlt | Kunde + Mitarbeiter |
| `stornierung.tsx` | storniert | Kunde + Mitarbeiter |
| `rueckfrage.tsx` | rueckfrage | Kunde |
| `reklamation.tsx` | reklamation_eingereicht | Mitarbeiter + Admin |
| `rueckerstattung.tsx` | rueckerstattung | Kunde + Mitarbeiter |

**Webhook payload extension for HTML email content:**

```typescript
// Extend existing WebhookPayload in src/lib/n8n-webhook.ts
export interface WebhookPayload {
  // ... existing fields ...
  /** Pre-rendered HTML email body for N8N to send */
  email_html?: string
  /** Email subject line */
  email_subject?: string
  /** PDF attachment as base64 (for Angebot/Rechnung emails) */
  email_attachment_base64?: string
  email_attachment_filename?: string
}
```

**Confidence: HIGH** -- versions verified via npm, React 19 compatible, Tailwind 4 support confirmed.

---

### 6. MwSt Calculation: No New Package Needed

**MwSt/tax calculation is pure arithmetic -- no library required.**

German MwSt is a flat 19% rate (7% reduced for food/books -- not applicable to windows). The calculation is:

```typescript
// src/lib/tax.ts

export const MWST_RATE = 0.19  // 19%

export interface TaxBreakdown {
  netto: number      // Price without tax
  mwst: number       // Tax amount
  brutto: number     // Total with tax
  mwstRate: number   // Tax rate (0.19)
}

/**
 * Calculate tax breakdown from a brutto (gross) price.
 * Uses banker's rounding to nearest cent.
 *
 * Decision: CMS prices are stored as BRUTTO (gross, including MwSt).
 * This matches German consumer expectation and simplifies Konfigurator display.
 */
export function calculateTaxFromBrutto(brutto: number): TaxBreakdown {
  const netto = Math.round((brutto / (1 + MWST_RATE)) * 100) / 100
  const mwst = Math.round((brutto - netto) * 100) / 100
  return { netto, mwst, brutto, mwstRate: MWST_RATE }
}

/**
 * Calculate tax breakdown from a netto (net) price.
 */
export function calculateTaxFromNetto(netto: number): TaxBreakdown {
  const mwst = Math.round(netto * MWST_RATE * 100) / 100
  const brutto = Math.round((netto + mwst) * 100) / 100
  return { netto, mwst, brutto, mwstRate: MWST_RATE }
}

/**
 * Format tax amount for display: "inkl. 19% MwSt (X,XX EUR)"
 */
export function formatMwstHinweis(brutto: number): string {
  const { mwst } = calculateTaxFromBrutto(brutto)
  return `inkl. 19% MwSt (${formatCurrency(mwst)})`
}
```

**Key architectural decision: Prices in CMS are BRUTTO (gross).**
This is the German standard for B2C commerce. The Konfigurator shows "inkl. MwSt" prices. The Rechnung then breaks down Netto + MwSt + Brutto. No configuration for different tax rates needed -- German windows are always 19%.

**Why NOT a tax library (`taxjar`, `avalara`, `tax.js`):** Those libraries handle multi-jurisdiction tax (US sales tax with 11,000+ rates, EU VAT reverse charge, etc.). Christ Fensterhandel sells in Germany at 19% MwSt. A single constant and two functions is the entire "tax engine."

**Make MwSt rate configurable in Settings (Todo 034):** Store it in a Payload Global (`einstellungen`) so it can be changed without code deployment if the rate changes (last changed in Germany: 2021, temporarily to 16% during COVID).

**Confidence: HIGH** -- this is basic arithmetic, not a library question.

---

### 7. Sequential Invoice Numbering: PostgreSQL Pattern, No Package Needed

**Gap-free sequential numbering requires a PostgreSQL counter table with row-level locking.** This is a database pattern, not a library.

**Why NOT PostgreSQL SEQUENCE:** PostgreSQL sequences (`nextval()`) are designed for performance and will skip numbers on transaction rollback. This creates gaps. German tax law (Paragraph 14 UStG, GoBD) requires lueckenlose (gap-free) invoice numbers.

**Implementation as Payload CMS Global:**

```typescript
// src/globals/nummernkreise.ts (Payload Global)
{
  slug: 'nummernkreise',
  access: { read: isAdmin, update: isAdmin },
  fields: [
    { name: 'rechnung_counter', type: 'number', defaultValue: 0 },
    { name: 'rechnung_jahr', type: 'number', defaultValue: 2026 },
    { name: 'angebot_counter', type: 'number', defaultValue: 0 },
    { name: 'angebot_jahr', type: 'number', defaultValue: 2026 },
    { name: 'gutschrift_counter', type: 'number', defaultValue: 0 },
    { name: 'gutschrift_jahr', type: 'number', defaultValue: 2026 },
  ],
}
```

**Concurrency-safe number allocation:**

```typescript
// src/lib/nummernkreis.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type Nummernkreis = 'rechnung' | 'angebot' | 'gutschrift'
const PREFIXES: Record<Nummernkreis, string> = {
  rechnung: 'RE',
  angebot: 'ANG',
  gutschrift: 'GS',
}

/**
 * Allocates the next sequential number for a given Nummernkreis.
 * Uses Payload's updateGlobal which runs inside a PostgreSQL transaction.
 * The Payload Global acts as the counter table.
 *
 * Format: RE-2026-001, ANG-2026-042, GS-2026-003
 *
 * IMPORTANT: Call this ONLY when the document (Rechnung/Angebot) is
 * definitely being created -- never speculatively. Numbers cannot be
 * returned once allocated.
 */
export async function allocateNummer(kreis: Nummernkreis): Promise<string> {
  const payload = await getPayload({ config: configPromise })
  const currentYear = new Date().getFullYear()

  // Read current counter
  const global = await payload.findGlobal({ slug: 'nummernkreise' })
  const jahrField = `${kreis}_jahr` as keyof typeof global
  const counterField = `${kreis}_counter` as keyof typeof global

  let counter = (global[counterField] as number) || 0
  const storedYear = (global[jahrField] as number) || currentYear

  // Reset counter on year change
  if (storedYear !== currentYear) {
    counter = 0
  }

  const nextCounter = counter + 1

  // Atomic update
  await payload.updateGlobal({
    slug: 'nummernkreise',
    data: {
      [counterField]: nextCounter,
      [jahrField]: currentYear,
    },
  })

  const padded = String(nextCounter).padStart(3, '0')
  return `${PREFIXES[kreis]}-${currentYear}-${padded}`
}
```

**Concurrency note:** Payload's `updateGlobal` runs as a single PostgreSQL UPDATE statement within a transaction. For the volume this project handles (tens of invoices per day at most), this is safe without explicit `SELECT FOR UPDATE`. If concurrent invoice creation becomes an issue, wrap in a raw SQL transaction with `FOR UPDATE` on the globals row.

**Why NOT Payload auto-increment or `anfrage-nummer.ts` pattern:** The existing `anfrage-nummer.ts` generates ANF-NNN by counting existing documents. This approach has a race condition (two requests count the same number) and is unsuitable for legally-required gap-free numbers. The counter-table approach is the standard solution.

**Confidence: HIGH** -- this is a well-documented PostgreSQL pattern (CYBERTEC, multiple PostgreSQL mailing list threads confirm).

---

## Existing Package Upgrade

| Package | Current | Recommended | Why |
|---------|---------|-------------|-----|
| `stripe` | ^20.4.1 | **Keep ^20.4.1** | v21.0.1 is available but is a major version bump. All needed APIs (Payment Links, Refunds, webhook events) work in v20. Upgrade only after reviewing v21 changelog for breaking changes. |

**Note on `nodemailer`:** NOT needed. Email sending is handled by N8N (which has its own SMTP configuration). The Next.js app renders HTML email templates and sends them as part of the webhook payload to N8N. N8N handles actual SMTP delivery. Adding nodemailer would create a parallel email-sending path, which is architecturally wrong for this project.

---

## New Payload Collections and Globals

| Entity | Type | Purpose |
|--------|------|---------|
| `rechnungen` | Collection | Immutable invoice records (never updated/deleted after creation). Fields: rechnung_nummer, rechnung_datum, anfrage (relationship), netto, mwst, brutto, pdf (upload), storniert (boolean) |
| `nummernkreise` | Global | Counter table for sequential numbers (RE/ANG/GS). Accessed only via `allocateNummer()` |
| `einstellungen` | Global | Business settings: MwSt rate, Angebot validity days, company details for PDFs |

**Existing `anfragen` collection -- new fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `stripe_checkout_url` | text | Shareable Stripe payment URL |
| `stripe_session_id` | text | For expiring old sessions |
| `stripe_payment_intent_id` | text | For refund API |
| `stripe_refund_status` | select (none/partial/full) | Refund tracking |
| `stripe_refund_amount` | number | Refunded amount in EUR |
| `angebot_nummer` | text | ANG-YYYY-NNN |
| `angebot_pdf` | upload (relationship to media) | Generated PDF |
| `angebot_gueltig_bis` | date | Validity deadline |
| `rechnung_nummer` | text | RE-YYYY-NNN |
| `rechnung_pdf` | upload (relationship to media) | Generated PDF |

---

## Installation

```bash
# New runtime dependencies (5 packages)
npm install rate-limiter-flexible@^10.0.1
npm install @react-pdf/renderer@^4.3.2
npm install @react-email/components@^1.0.10 @react-email/render@^2.0.4

# Dev dependency (email template preview server)
npm install -D react-email@^5.2.10
```

**Next.js config change required:**

```typescript
// next.config.ts -- add to existing config
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // ... rest of existing config
}
```

**After adding new Payload collections/fields:**

```bash
npm run payload migrate:create -- --name v14-stripe-pdf-fields
npm run payload migrate
npm run generate:types
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Rate limiting | `rate-limiter-flexible` (in-memory) | `@upstash/ratelimit` | Requires external Redis service. Over-engineered for single-VPS deployment. |
| Rate limiting | `rate-limiter-flexible` (in-memory) | Custom `Map()` with `setTimeout` | Misses edge cases: cleanup, burst protection, IP parsing. Library is battle-tested. |
| CSRF | Existing `isSameOriginOrReferer()` | `csrf-csrf` npm package | Existing code already implements the OWASP-recommended pattern. No new dependency needed. |
| PDF | `@react-pdf/renderer` | Puppeteer / puppeteer-core | Headless Chrome adds 50-170MB to Docker image. 10x slower. Overkill for structured documents (invoices/quotes). |
| PDF | `@react-pdf/renderer` | PDFKit | Imperative API (`doc.text(x, y)`) -- no component reuse, manual positioning. The team works in React. |
| PDF | `@react-pdf/renderer` | pdfmake | JSON-based -- decent but foreign to a TSX codebase. @react-pdf uses JSX natively. |
| E-Mail | React Email | MJML | MJML introduces a second markup language (`mj-*` tags). Team is 100% React/TSX. `mjml-react` is unmaintained. React Email has native Tailwind 4 support. |
| E-Mail | React Email | Handlebars/EJS templates | String-based templating with no type safety. React Email gives TypeScript props validation on email templates. |
| E-Mail sending | N8N (existing) | nodemailer in Next.js | Adding nodemailer creates a parallel email path. N8N already handles SMTP and allows non-developer configuration of email routing. Keep email delivery in N8N. |
| Invoice numbers | PostgreSQL counter table | PostgreSQL SEQUENCE | Sequences skip numbers on rollback. German tax law requires gap-free numbers. |
| Invoice numbers | Payload Global as counter | Raw SQL function | Payload Global is simpler to manage, migrates with the rest of the schema, accessible in the Admin UI for debugging. |
| MwSt | Plain TypeScript functions | tax calculation library | German B2C at fixed 19%. A library for a single multiplication is absurd. |
| Stripe approach | Checkout Sessions (existing) | Payment Links API | Payment Links are static/reusable links. Checkout Sessions are dynamic, support metadata, integrate with existing webhook handler. No benefit to switching. |

---

## What NOT to Add for v1.4

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redis / Upstash | No external service needed for single-VPS rate limiting | `rate-limiter-flexible` with `RateLimiterMemory` |
| `nodemailer` | Email delivery is N8N's responsibility, not the Next.js app's | Render HTML via React Email, send via webhook to N8N |
| `csrf-csrf` / `csurf` | Existing security.ts already implements Origin/Referer check | Apply existing `isSameOriginOrReferer()` to all routes |
| Puppeteer / `@sparticuz/chromium` | 50-170MB Docker image bloat for structured PDF generation | `@react-pdf/renderer` (200-500ms, zero browser dependency) |
| `taxjar` / `avalara` | Multi-jurisdiction tax engines for a single-country, single-rate business | `src/lib/tax.ts` with `MWST_RATE = 0.19` |
| `uuid` for invoice numbers | UUIDs are not sequential or human-readable | PostgreSQL counter pattern with `RE-YYYY-NNN` format |
| `mjml` / `mjml-react` | Second markup language in a React project; mjml-react is unmaintained | `@react-email/components` + `@react-email/render` |
| `html-to-pdf` / `html2pdf.js` | Client-side focused, poor server-side support | `@react-pdf/renderer` server-side |
| Stripe Payment Links API | Already using Checkout Sessions which are more flexible | Continue with `stripe.checkout.sessions.create()` |
| `decimal.js` / `dinero.js` | Money math library for simple EUR calculations at 2 decimal places | `Math.round(x * 100) / 100` for cent-precision |

---

## Version Compatibility Matrix

| Package | Version | React 19 | Next.js 15 | TypeScript 5.7 | Node.js 20 |
|---------|---------|----------|------------|----------------|------------|
| `rate-limiter-flexible` | 10.0.1 | N/A (no React) | N/A | Yes | Yes |
| `@react-pdf/renderer` | 4.3.2 | Yes (since 4.1.0) | Yes (with `serverExternalPackages`) | Yes | Yes (18, 20, 21) |
| `@react-email/components` | 1.0.10 | Yes (`^19.0`) | Yes | Yes | Yes |
| `@react-email/render` | 2.0.4 | Yes (`^19.0`) | Yes | Yes | Yes |
| `react-email` (dev) | 5.2.10 | Yes | Yes | Yes | Yes |
| `stripe` | 20.4.1 (keep) | N/A (server-only) | Yes | Yes | Yes |

---

## File Structure for New Code

```
src/
  lib/
    rate-limit.ts           # Rate limiter instances + helper
    tax.ts                  # MwSt calculation (brutto/netto)
    nummernkreis.ts         # Sequential number allocation
    pdf/
      angebot-template.tsx  # Angebot PDF (@react-pdf components)
      rechnung-template.tsx # Rechnung PDF
      gutschrift-template.tsx # Gutschrift/Stornorechnung PDF
      shared-styles.ts      # Shared PDF styles (colors, fonts)
    email/
      render-email.ts       # Template dispatcher
      templates/
        base-layout.tsx     # Shared header/footer wrapper
        neue-anfrage.tsx    # Anfrage confirmation
        status-update.tsx   # Generic status change
        zahlungslink.tsx    # Payment link with CTA button
        zahlungsbestaetigung.tsx
        stornierung.tsx
        rueckfrage.tsx
        reklamation.tsx
        rueckerstattung.tsx
        angebot-versendet.tsx
  collections/
    business/
      rechnungen.ts         # NEW: Immutable invoice collection
  globals/
    nummernkreise.ts        # NEW: Counter table for sequential numbers
    einstellungen.ts        # NEW: Business settings (MwSt, company data)
  app/
    api/
      angebot/generate/route.ts  # NEW: PDF generation endpoint
      rechnung/generate/route.ts # NEW: Invoice PDF endpoint
      stripe/refund/route.ts     # NEW: Refund initiation
```

---

## Sources

- **npm registry** -- `rate-limiter-flexible@10.0.1`, `@react-pdf/renderer@4.3.2`, `@react-email/render@2.0.4`, `@react-email/components@1.0.10`, `react-email@5.2.10`, `nodemailer@8.0.4` (NOT recommended), `stripe@21.0.1` (NOT upgrading) -- all verified via `npm view` on 2026-03-27 (HIGH confidence)
- **[rate-limiter-flexible GitHub](https://github.com/animir/node-rate-limiter-flexible)** -- RateLimiterMemory, PostgreSQL backend, 0.7ms overhead (HIGH confidence)
- **[Stripe API Docs: Create Refund](https://docs.stripe.com/api/refunds/create?lang=node)** -- `stripe.refunds.create({ payment_intent })`, partial refund support (HIGH confidence)
- **[Stripe API Docs: Expire Checkout Session](https://stripe.com/docs/api/checkout/sessions/expire?lang=node)** -- `stripe.checkout.sessions.expire(id)` (HIGH confidence)
- **[Stripe API Docs: Create Checkout Session](https://docs.stripe.com/api/checkout/sessions/create?lang=node)** -- `expires_at` parameter, metadata support (HIGH confidence)
- **[Stripe: Payment Links vs Checkout](https://support.stripe.com/questions/choosing-between-payment-links-invoicing-checkout-and-payment-element)** -- Checkout Sessions recommended for programmatic use (HIGH confidence)
- **[@react-pdf/renderer GitHub #3074](https://github.com/diegomura/react-pdf/issues/3074)** -- renderToBuffer works with React 19, "PDFDocument is not a constructor" resolved by upgrading React (HIGH confidence)
- **[@react-pdf/renderer compatibility page](https://react-pdf.org/compatibility)** -- React 19 supported since v4.1.0, Next.js 14.1.1+ compatible (HIGH confidence)
- **[React Email 5.0 announcement](https://resend.com/blog/react-email-5)** -- Tailwind 4 support, 920K weekly downloads (MEDIUM confidence -- from Resend blog)
- **[@react-email/render npm](https://www.npmjs.com/package/@react-email/render)** -- `render()` function, peerDep `react@^18.0 || ^19.0` (HIGH confidence)
- **[CYBERTEC: PostgreSQL Sequences vs Invoice Numbers](https://www.cybertec-postgresql.com/en/postgresql-sequences-vs-invoice-numbers/)** -- Counter table with row lock for gap-free sequences (HIGH confidence)
- **[PostgreSQL gap-free counter pattern](https://github.com/kimmobrunfeldt/howto-everything/blob/master/postgres-gapless-counter-for-invoice-purposes.md)** -- Transactional counter implementation (HIGH confidence)
- **Existing codebase** -- `src/lib/stripe.ts`, `src/lib/security.ts`, `src/lib/n8n-webhook.ts`, `src/app/api/stripe/webhook/route.ts`, `package.json` -- reviewed 2026-03-27 (HIGH confidence)

---

*Stack research for: v1.4 Bestellungsflow + Integrationen*
*Researched: 2026-03-27*
