# Architecture Patterns: v1.4 Integration

**Domain:** v1.4 Feature Integration into existing Next.js + Payload CMS App
**Researched:** 2026-03-27
**Overall confidence:** HIGH (based on existing codebase analysis + official docs)

## Executive Summary

v1.4 introduces 10 distinct feature areas into an established codebase with 23k+ LOC, 17+ collections, and well-defined patterns (afterChange hooks, Zustand stores, status-config Single Source of Truth, role-based access). The architecture challenge is NOT greenfield design but surgical integration: each new feature must slot into existing patterns without breaking established conventions.

The codebase already has strong conventions: security helpers in `src/lib/security.ts`, Stripe utilities in `src/lib/stripe.ts`, webhook sending in `src/lib/n8n-webhook.ts`, and status management in `src/lib/status-config.ts`. New features extend these modules rather than creating parallel systems.

---

## Recommended Architecture

### High-Level Integration Map

```
EXISTING                          NEW (v1.4)
========                          ==========

middleware.ts ..................... + Rate limiting (sliding window)
                                   + CSRF token generation (cookie)

src/lib/security.ts .............. + rateLimit() helper
                                   + applyCsrf() helper
                                   + seed guard (NODE_ENV check)

src/lib/stripe.ts ................ + createPaymentLink()
                                   + createRefund()

src/lib/n8n-webhook.ts ........... + Extended WebhookPayload types
                                   + email_template field
                                   + attachment_urls field

src/lib/                          + tax.ts (MwSt calculation)
                                   + pdf/angebot.tsx (React-PDF)
                                   + pdf/rechnung.tsx (React-PDF)
                                   + pdf/shared.tsx (shared components)

src/collections/business/         + angebote.ts (new collection)
                                   + rechnungen.ts (new collection)
                                   + reklamationen.ts (new collection)

src/payload-globals/              + einstellungen.ts (Settings global)

src/collections/business/
  anfragen.ts .................... + kundenantwort array field
                                   + angebot relationship
                                   + rechnung relationship

src/app/api/                      + /api/pdf/angebot/[id]/route.ts
                                   + /api/pdf/rechnung/[id]/route.ts
                                   + /api/admin/send-email/route.ts
                                   + /api/anfrage/kundenantwort/route.ts

src/email-templates/              + New folder: base, status, invoice
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `middleware.ts` | Rate limiting + CSRF token generation + i18n + customer redirect | All incoming requests |
| `src/lib/security.ts` | Rate limit store, CSRF validation, origin checks | middleware.ts, API routes |
| `src/lib/stripe.ts` | Payment Link creation, refund execution, Stripe client | API routes, Anfragen hooks |
| `src/lib/tax.ts` | MwSt calculation, net/gross conversion, tax line items | price-server.ts, PDF generators |
| `src/lib/pdf/` | PDF document generation (Angebot, Rechnung) | tax.ts, Payload API (read data) |
| `src/lib/n8n-webhook.ts` | Extended webhook payloads with email templates + attachments | Anfragen afterChange hook |
| `einstellungen` Global | App-wide settings (company info, tax rate, email flags) | PDF generators, tax.ts, admin UI |
| `angebote` Collection | Angebot documents with PDF reference, versioning | Anfragen (relationship), Media |
| `rechnungen` Collection | Rechnung documents with PDF, MwSt breakdown | Anfragen (relationship), Media |
| `reklamationen` Collection | Reklamation cases with media uploads, resolution tracking | Anfragen (relationship), Media |

### Data Flow

```
1. SECURITY LAYER (all requests)
   Request -> middleware.ts
   -> Rate limit check (in-memory Map, keyed by IP)
   -> CSRF cookie set (if not present, for non-GET)
   -> Pass through to route

2. STRIPE PAYMENT LINK FLOW
   Admin clicks "Zahlungslink senden" (splitbutton)
   -> Anfragen beforeChange: status = zahlungslink_versendet (validated)
   -> Anfragen afterChange: createPaymentLink() -> URL in webhook payload
   -> N8N receives payload with payment_link_url
   -> N8N sends email to customer with link

3. PDF GENERATION FLOW
   Admin clicks "Angebot erstellen" or status transitions to angebot_versendet
   -> API route /api/pdf/angebot/[id] called
   -> Fetch Anfrage data + Einstellungen global (company info, MwSt rate)
   -> tax.ts calculates net/gross/MwSt amounts
   -> React-PDF renders document to buffer
   -> Upload to Payload Media collection
   -> Create/update Angebote document with media reference
   -> Return PDF URL

4. KUNDENANTWORT FLOW
   Customer on dashboard sees Rueckfrage status
   -> Submits answer via /api/anfrage/kundenantwort
   -> New entry added to kundenantworten array on Anfrage
   -> N8N webhook fires (event_type: kundenantwort)
   -> Admin sees answer in Anfrage detail view
```

---

## 1. Rate Limiting: Middleware vs Per-Route

### Decision: Hybrid approach -- middleware for global + per-route for sensitive endpoints

**Confidence:** HIGH

**Rationale:** The existing `middleware.ts` already handles all requests (i18n, customer redirect). Adding rate limiting here provides baseline protection. But sensitive endpoints (login, submit, checkout) need stricter per-route limits.

### Architecture

```
middleware.ts (global layer)
  |
  +-- General rate limit: 60 req/min per IP (lenient)
  |   Only for non-static, non-API paths
  |   Uses in-memory Map (single VPS = no Redis needed)
  |
  +-- CSRF cookie generation (see section 2)

Per-route (strict limits):
  /api/anfrage/submit     -> 5 req/min per IP
  /api/stripe/checkout    -> 10 req/min per IP
  /api/anfrage/kundenantwort -> 10 req/min per IP
  (payload)/api/users/login -> 5 req/min per IP (Payload built-in endpoint)
```

### Implementation Pattern

```typescript
// src/lib/security.ts (extend existing file)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): (ip: string) => { allowed: boolean; remaining: number; resetAt: number } {
  if (!stores.has(key)) stores.set(key, new Map());
  const store = stores.get(key)!;

  return (ip: string) => {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    entry.count++;
    const allowed = entry.count <= limit;
    return { allowed, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
  };
}

// Periodic cleanup (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [ip, entry] of store) {
      if (now > entry.resetAt) store.delete(ip);
    }
  }
}, 60_000);
```

**Why in-memory, not Redis:**
- Single VPS deployment (Netcup VPS 1000 G11)
- No horizontal scaling planned
- Redis would add operational complexity for zero benefit
- If scaling later, swap Map for Redis adapter (same interface)

### Middleware Integration

```typescript
// middleware.ts -- add before existing logic
import { rateLimit } from '@/lib/security';

const globalLimiter = rateLimit('global', 120, 60_000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (pathname.includes('.')) return forwardPathname();

  // Rate limit (skip for admin panel -- Payload handles its own auth)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';
    const result = globalLimiter(ip);
    if (!result.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // ... existing middleware logic unchanged ...
}
```

### Per-Route Helper

```typescript
// In each sensitive API route:
import { rateLimit } from '@/lib/security';

const submitLimiter = rateLimit('anfrage-submit', 5, 60_000);

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const { allowed } = submitLimiter(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Zu viele Anfragen' }, { status: 429 });
  }
  // ... rest of handler
}
```

**IMPORTANT caveat for middleware.ts:** Next.js middleware runs in the Edge Runtime. The in-memory Map will work on a single server but the store is NOT shared across Edge Runtime instances. Since this deploys to Coolify (single Docker container, not Vercel Edge), this is fine. The middleware matcher already skips `_next/static` and `_next/image`, so only actual page/API requests are rate-limited.

---

## 2. CSRF Protection: Global Middleware vs Per-Endpoint

### Decision: Middleware sets cookie, per-route validates (double-submit pattern)

**Confidence:** HIGH

**Rationale:** The existing `isSameOriginOrReferer()` in `security.ts` and `validateCsrfToken()` are already implemented but only used in `/api/stripe/checkout`. The approach should be:

1. **Middleware** generates CSRF token cookie on first visit (if not present)
2. **Each mutating API route** validates using existing `isSameOriginOrReferer()` + optionally `validateCsrfToken()`
3. **Stripe webhook** is exempt (uses signature verification instead)
4. **Payload built-in endpoints** are exempt (Payload handles its own CSRF via JWT)

### Architecture

```
middleware.ts
  |
  +-- Set csrf_token cookie (random, HttpOnly=false so JS can read)
  |   Only if not already set
  |   SameSite=Strict, Secure in production

API routes (manual validation):
  /api/anfrage/submit         -> isSameOriginOrReferer (existing pattern)
  /api/stripe/checkout        -> isSameOriginOrReferer (already done)
  /api/anfrage/kundenantwort  -> isSameOriginOrReferer + validateCsrfToken
  /api/admin/send-email       -> isSameOriginOrReferer (admin-only)
  /api/pdf/*                  -> isSameOriginOrReferer (admin-only)

Exempt:
  /api/stripe/webhook         -> Stripe signature verification (existing)
  /api/status-pruefen         -> Read-only GET endpoint
```

### Why NOT full middleware CSRF enforcement

The existing codebase has a clear pattern: CSRF is checked per-route via `isSameOriginOrReferer()`. Forcing it in middleware would:
- Break the Stripe webhook (no origin header, uses signature instead)
- Require an exemption list that grows with every new endpoint
- Fight against Payload's own auth/CSRF handling

The per-route pattern is already established and works well. Extend it to new routes.

---

## 3. Stripe Service Layer

### Decision: Extend existing `src/lib/stripe.ts` with Payment Link + Refund functions

**Confidence:** HIGH

**Rationale:** The existing `stripe.ts` already has `getStripe()` (lazy singleton) and `createCheckoutSession()`. New Stripe features follow the same pattern: exported async functions that use `getStripe()`.

### New Functions

```typescript
// src/lib/stripe.ts (extend existing file)

/**
 * Creates a Stripe Payment Link for a confirmed Anfrage.
 * Unlike Checkout Sessions, Payment Links are reusable and shareable.
 */
export async function createPaymentLink(
  anfrageNummer: string,
  gesamtpreis: number,
  produktAnzahl: number,
): Promise<{ url: string; id: string }> {
  const paymentLink = await getStripe().paymentLinks.create({
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(gesamtpreis * 100),
        product_data: {
          name: `Anfrage ${anfrageNummer}`,
          description: `${produktAnzahl} Produkt(e)`,
        },
      },
      quantity: 1,
    }],
    metadata: { anfrage_nummer: anfrageNummer },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/kunden/dashboard?payment=success`,
      },
    },
  });
  return { url: paymentLink.url, id: paymentLink.id };
}

/**
 * Creates a Stripe Refund (full or partial).
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // cents, omit for full refund
): Promise<{ id: string; status: string; amount: number }> {
  const params: Record<string, unknown> = {
    payment_intent: paymentIntentId,
  };
  if (amount !== undefined) {
    params.amount = amount;
  }
  const refund = await getStripe().refunds.create(params as any);
  return { id: refund.id, status: refund.status || 'unknown', amount: refund.amount };
}
```

### Webhook Handler Extensions

The existing webhook handler in `/api/stripe/webhook/route.ts` handles only `checkout.session.completed`. Extend it for:

```typescript
// Additional event handling in existing webhook route:

// Handle payment_intent.payment_failed
if (event.type === 'payment_intent.payment_failed') {
  // Update Anfrage to zahlungsproblem
}

// Handle charge.refunded
if (event.type === 'charge.refunded') {
  // Update rueckerstattung_status to durchgefuehrt
}

// Handle checkout.session.expired
if (event.type === 'checkout.session.expired') {
  // Log, possibly notify admin
}
```

### Integration with Anfragen Hook

The existing `afterChange` hook on Anfragen already generates a Stripe Checkout URL when status changes to `bestaetigt`. Modify this to use Payment Links instead:

```
Status: bestaetigt -> zahlungslink_versendet
  Hook: createPaymentLink() instead of createCheckoutSession()
  Webhook payload gets: payment_link_url (replaces stripe_checkout_url)
```

### Fields to Add to Anfragen

```typescript
// New fields on Anfragen collection:
{
  name: 'stripe_payment_intent_id',
  type: 'text',
  admin: { readOnly: true, condition: (data) => !!data?.stripe_payment_intent_id },
  access: { read: ({ req }) => isStaff(req.user) },
},
{
  name: 'stripe_payment_link_id',
  type: 'text',
  admin: { readOnly: true, condition: (data) => !!data?.stripe_payment_link_id },
  access: { read: ({ req }) => isStaff(req.user) },
},
```

---

## 4. PDF Generation

### Decision: `@react-pdf/renderer` with server-side rendering in API routes

**Confidence:** HIGH

**Rationale:**
- Already using React -- team knows JSX
- No Chromium binary needed (unlike Puppeteer, which adds 150-400MB to Docker image)
- Lightweight (~5MB), works on Node.js server-side
- Perfect for structured documents (invoices, quotes) where pixel-perfect HTML rendering is NOT needed
- German invoice format is tabular/structured, not free-form HTML

### Module Structure

```
src/lib/pdf/
  shared.tsx          -- Company header, address block, footer, table components
  angebot.tsx         -- AngebotDocument React component
  rechnung.tsx        -- RechnungDocument React component
  render.ts           -- renderToBuffer() wrapper for server-side use
```

### API Routes

```
src/app/api/pdf/angebot/[id]/route.ts   -- GET: Generate + return Angebot PDF
src/app/api/pdf/rechnung/[id]/route.ts  -- GET: Generate + return Rechnung PDF
```

### Pattern

```typescript
// src/lib/pdf/render.ts
import { renderToBuffer } from '@react-pdf/renderer';

export async function generateAngebotPdf(
  anfrage: AnfrageData,
  einstellungen: EinstellungenData,
): Promise<Buffer> {
  const { AngebotDocument } = await import('./angebot');
  return renderToBuffer(
    <AngebotDocument anfrage={anfrage} settings={einstellungen} />
  );
}
```

### Storage in Payload Media

After generating the PDF buffer:

1. Upload to Payload Media collection using Local API
2. Store media ID on Angebote/Rechnungen document
3. PDF URL accessible via Media collection's built-in file serving

```typescript
// Upload PDF to Media collection
const mediaDoc = await payload.create({
  collection: 'media',
  data: { alt: `Angebot ${anfrageNummer}` },
  file: {
    data: pdfBuffer,
    mimetype: 'application/pdf',
    name: `angebot-${anfrageNummer}.pdf`,
    size: pdfBuffer.length,
  },
});
```

### API Route Pattern

```typescript
// src/app/api/pdf/angebot/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check: admin/mitarbeiter only
  // Fetch Anfrage + Einstellungen
  // Generate PDF
  // Upload to Media if not cached
  // Create/update Angebote document
  // Return PDF as download or redirect to Media URL
}
```

---

## 5. E-Mail Templates

### Decision: `src/email-templates/` folder with template functions, preview via dev route

**Confidence:** MEDIUM (N8N is the actual email sender, templates are data payloads)

**Rationale:** N8N handles email sending. The app's responsibility is:
1. Provide the right data in the webhook payload
2. Define template IDs/keys so N8N picks the right template
3. Optionally: provide HTML content directly in payload for N8N to forward

### Architecture

```
src/email-templates/
  types.ts              -- EmailTemplate type, EmailData interface
  base-layout.ts        -- Shared HTML wrapper (header, footer, brand)
  templates/
    neue-anfrage.ts     -- Template for neue_anfrage event
    status-update.ts    -- Template for status_aenderung events
    zahlungslink.ts     -- Template with payment link button
    rechnung.ts         -- Template with invoice attachment reference
    rueckfrage.ts       -- Template for customer Rueckfrage
    reklamation.ts      -- Template for Reklamation acknowledgment
  render.ts             -- renderTemplate(templateId, data) -> HTML string
  preview/              -- Dev-only preview routes
```

### WebhookPayload Extension

```typescript
// Extended WebhookPayload in src/lib/n8n-webhook.ts
export interface WebhookPayload {
  // ... existing fields ...
  event_type: "neue_anfrage" | "status_aenderung" | "zahlung_eingegangen"
    | "kundenantwort" | "reklamation_erstellt";  // NEW events
  email_template?: string;        // NEW: template key for N8N routing
  email_html?: string;            // NEW: pre-rendered HTML body
  attachment_urls?: string[];     // NEW: PDF URLs to attach
  payment_link_url?: string;      // NEW: replaces stripe_checkout_url
  // Keep stripe_checkout_url for backward compat
}
```

### Preview Route (dev only)

```
src/app/api/email-preview/[template]/route.ts
  -> Only active when NODE_ENV !== 'production'
  -> Renders template with mock data
  -> Returns HTML for browser preview
```

---

## 6. MwSt / Tax Module

### Decision: Central `src/lib/tax.ts` module, tax rate from Einstellungen Global

**Confidence:** HIGH

### Architecture

```typescript
// src/lib/tax.ts

export interface TaxBreakdown {
  netto: number;      // Net amount (without tax)
  mwst_satz: number;  // Tax rate (e.g. 19)
  mwst_betrag: number; // Tax amount
  brutto: number;     // Gross amount (with tax)
}

/**
 * Calculate tax breakdown from a gross amount.
 * German MwSt: Brutto / 1.19 = Netto, then MwSt = Brutto - Netto
 */
export function calculateTax(brutto: number, mwstSatz: number = 19): TaxBreakdown {
  const netto = Math.round((brutto / (1 + mwstSatz / 100)) * 100) / 100;
  const mwst_betrag = Math.round((brutto - netto) * 100) / 100;
  return { netto, mwst_satz: mwstSatz, mwst_betrag, brutto };
}

/**
 * Calculate tax breakdown from a net amount.
 */
export function calculateTaxFromNetto(netto: number, mwstSatz: number = 19): TaxBreakdown {
  const mwst_betrag = Math.round((netto * mwstSatz / 100) * 100) / 100;
  const brutto = Math.round((netto + mwst_betrag) * 100) / 100;
  return { netto, mwst_satz: mwstSatz, mwst_betrag, brutto };
}
```

### Integration Points

1. **Price calculation** (`price-server.ts`): Currently returns gross prices. Tax module extracts net + MwSt for display.
2. **PDF generation**: Angebot shows MwSt line, Rechnung requires full breakdown per UStG 14.
3. **Anfragen display**: Admin detail view shows net + MwSt + gross.
4. **Einstellungen Global**: MwSt rate stored there (default 19%, configurable for edge cases).

### Tax Rate Source

```
Einstellungen Global -> mwst_satz field (number, default 19)
  |
  +-> tax.ts reads from Global on each PDF generation
  +-> Admin can change rate without code deploy
  +-> Historical documents keep their own mwst_satz snapshot
```

---

## 7. New Payload Collections: Angebote + Rechnungen

### Angebote Collection

```
src/collections/business/angebote.ts

Fields:
  - angebots_nummer (text, unique, auto-generated: ANG-YYYY-NNN)
  - anfrage (relationship -> anfragen)
  - version (number, default 1, auto-increment per Anfrage)
  - status (select: entwurf | versendet | akzeptiert | abgelehnt | abgelaufen)
  - gueltig_bis (date, default: +30 days)
  - positionen (array: description, menge, einzelpreis, gesamtpreis)
  - netto_summe (number, readOnly, calculated)
  - mwst_satz (number, snapshot from Einstellungen)
  - mwst_betrag (number, readOnly, calculated)
  - brutto_summe (number, readOnly, calculated)
  - pdf (relationship -> media)
  - erstellt_von (relationship -> users)
  - notizen (textarea)

Access: isAdminOrMitarbeiter (CRUD), isOwnAnfrage (read for customers)
Admin group: Business
```

### Rechnungen Collection

```
src/collections/business/rechnungen.ts

Fields:
  - rechnungs_nummer (text, unique, auto-generated: RE-YYYY-NNN)
  - anfrage (relationship -> anfragen)
  - angebot (relationship -> angebote, optional)
  - status (select: entwurf | versendet | bezahlt | storniert | mahnung)
  - faellig_am (date)
  - positionen (array: same as Angebot)
  - netto_summe, mwst_satz, mwst_betrag, brutto_summe (same as Angebot)
  - pdf (relationship -> media)

  -- UStG 14 Pflichtangaben (from Einstellungen Global):
  - steuernummer (text, auto-filled from Einstellungen)
  - ust_id (text, auto-filled from Einstellungen)
  - lieferdatum (date or text, "Lieferdatum = Rechnungsdatum")

  - zahlungsinformationen (group: bank, iban, bic, verwendungszweck)
  - erstellt_von (relationship -> users)

Access: isAdminOrMitarbeiter (CRUD), isOwnAnfrage-style (read for customers)
Admin group: Business
```

### Relationship to Anfragen

```
Anfragen
  +-- angebot (relationship -> angebote, optional)
  +-- rechnung (relationship -> rechnungen, optional)
```

This is a 1:1 relationship in the simple case but could be 1:N for revised Angebote. Use `hasMany: false` initially; the Angebote collection has its own `version` field to track revisions.

### Number Generation Pattern

Reuse the existing `generateAnfrageNummer()` pattern from `src/lib/anfrage/anfrage-nummer.ts`, adapted for ANG- and RE- prefixes.

---

## 8. Settings as Payload Global (Einstellungen)

### Decision: Single `einstellungen` Global with grouped fields

**Confidence:** HIGH

### Architecture

```typescript
// src/payload-globals/einstellungen.ts

export const Einstellungen: GlobalConfig = {
  slug: 'einstellungen',
  label: 'Einstellungen',
  admin: {
    group: 'System',
  },
  access: {
    read: () => true,  // All server code reads settings
    update: ({ req }) => req.user?.rolle === 'admin',
  },
  fields: [
    // Firmen-Informationen (used in PDFs, emails)
    {
      type: 'group',
      name: 'firma',
      label: 'Firmen-Informationen',
      fields: [
        { name: 'name', type: 'text', defaultValue: 'Christ Fensterhandel' },
        { name: 'strasse', type: 'text' },
        { name: 'plz_ort', type: 'text' },
        { name: 'telefon', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'website', type: 'text' },
        { name: 'steuernummer', type: 'text' },
        { name: 'ust_id', type: 'text', label: 'USt-IdNr.' },
      ],
    },
    // Bank-Informationen (for Rechnung)
    {
      type: 'group',
      name: 'bank',
      label: 'Bankverbindung',
      fields: [
        { name: 'bank_name', type: 'text' },
        { name: 'iban', type: 'text' },
        { name: 'bic', type: 'text' },
      ],
    },
    // Steuer
    {
      type: 'group',
      name: 'steuer',
      label: 'Steuer-Einstellungen',
      fields: [
        { name: 'mwst_satz', type: 'number', defaultValue: 19, label: 'MwSt-Satz (%)' },
      ],
    },
    // Angebot-Defaults
    {
      type: 'group',
      name: 'angebot',
      label: 'Angebots-Einstellungen',
      fields: [
        { name: 'gueltigkeitsdauer_tage', type: 'number', defaultValue: 30 },
        { name: 'fussnote', type: 'textarea', label: 'Angebots-Fussnote' },
      ],
    },
    // E-Mail Flags (architecture prep, UI later)
    {
      type: 'group',
      name: 'email',
      label: 'E-Mail-Einstellungen',
      admin: { condition: () => false }, // Hidden for now, UI comes later
      fields: [
        { name: 'neue_anfrage_aktiv', type: 'checkbox', defaultValue: true },
        { name: 'status_update_aktiv', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
};
```

### Registration in payload.config.ts

```typescript
// Add to globals array:
globals: [WebhookErrors, Navigation, Footer, Einstellungen],
```

### Access Pattern

```typescript
// Reading settings in server code:
const settings = await payload.findGlobal({ slug: 'einstellungen' });
const mwstSatz = settings.steuer?.mwst_satz ?? 19;
const firmaName = settings.firma?.name ?? 'Christ Fensterhandel';
```

---

## 9. Reklamation as New Collection

### Decision: Separate `reklamationen` Collection (NOT just a status on Anfragen)

**Confidence:** HIGH

**Rationale:** "reklamation" already exists as a STATUS on Anfragen (one of 20 statuses). But a Reklamation as a business object needs its own data: description, photos, resolution, timeline. This cannot be shoe-horned into Anfragen fields.

### Architecture

```typescript
// src/collections/business/reklamationen.ts

Fields:
  - reklamations_nummer (text, unique, RK-YYYY-NNN)
  - anfrage (relationship -> anfragen, required)
  - status (select: offen | in_bearbeitung | geloest | abgelehnt)
  - beschreibung (textarea, required)
  - fotos (array of upload -> media)  // Customer uploads damage photos
  - kategorie (select: beschaedigung | falsche_lieferung | qualitaetsmangel | sonstiges)
  - loesung (textarea)  // How it was resolved
  - erstellt_von (relationship -> users)
  - geloest_am (date)

Access:
  create: isAdminOrMitarbeiter OR isOwnAnfrage (customer can create)
  read: isAdminOrMitarbeiter OR isOwnAnfrage
  update: isAdminOrMitarbeiter
  delete: isAdmin

Hooks:
  afterChange (create): Set Anfrage status to 'reklamation' if not already
```

### Media Uploads for Reklamation

The existing Media collection has `upload: true` but access is admin-only for create. For customer uploads, two approaches:

**Option A (Recommended):** Dedicated API route `/api/reklamation/upload` that:
1. Validates the customer owns the Anfrage
2. Accepts file upload
3. Creates Media document with system-level access
4. Returns media ID for the Reklamation form

**Option B:** Relax Media create access to include customers. Too broad -- gives customers access to upload arbitrary media.

---

## 10. Kundenantwort: Array Field on Anfragen

### Decision: `kundenantworten` array field on Anfragen collection (NOT a sub-collection)

**Confidence:** HIGH

**Rationale:** A Kundenantwort is a simple message in response to a Rueckfrage. It does not need its own collection -- it is contextually bound to one Anfrage and is always displayed inline in the Anfrage detail view.

### Architecture

```typescript
// New field on Anfragen collection:
{
  name: 'kundenantworten',
  type: 'array',
  label: 'Kundenantworten',
  admin: {
    readOnly: true,
    condition: (data) => data?.kundenantworten?.length > 0,
  },
  fields: [
    { name: 'nachricht', type: 'textarea', required: true },
    { name: 'erstellt_am', type: 'date', admin: { readOnly: true } },
    { name: 'erstellt_von_email', type: 'email', admin: { readOnly: true } },
  ],
},
```

### API Route

```typescript
// src/app/api/anfrage/kundenantwort/route.ts
// POST: Customer submits answer to Rueckfrage
// Validates: customer owns Anfrage, Anfrage status is 'rueckfrage'
// Appends to kundenantworten array
// Fires N8N webhook (event_type: 'kundenantwort')
// Does NOT auto-transition status (admin decides when to move back to in_bearbeitung)
```

### Customer Dashboard Integration

- Show "Antworten" button on Anfrage detail when status is `rueckfrage`
- Display previous Kundenantworten in the timeline
- Disable "Antworten" when status is NOT `rueckfrage`

---

## Build Order (Dependency-Aware)

### Layer 0: Foundation (no dependencies)

```
1. Security hardening (rate limiting, CSRF, seed guard)
   - Modifies: middleware.ts, src/lib/security.ts
   - Blocked by: nothing
   - Blocks: nothing (all routes work without it, it just hardens)

2. Einstellungen Global
   - Modifies: payload.config.ts, new file src/payload-globals/einstellungen.ts
   - Blocked by: nothing
   - Blocks: PDF generation, tax calculation (they read from Einstellungen)

3. Tax module (src/lib/tax.ts)
   - Blocked by: nothing (uses passed-in rate, not Global directly)
   - Blocks: PDF generation, Rechnungen
```

### Layer 1: Core Business Logic (depends on Layer 0)

```
4. Angebote Collection + number generation
   - Depends on: Einstellungen (company info), tax.ts
   - Modifies: payload.config.ts, new collection file
   - Blocks: Angebot PDF generation

5. Rechnungen Collection + number generation
   - Depends on: Einstellungen (UStG fields), tax.ts, Angebote (optional link)
   - Modifies: payload.config.ts, new collection file
   - Blocks: Rechnung PDF generation

6. Stripe extensions (Payment Link, Refund)
   - Depends on: nothing new (extends existing stripe.ts)
   - Modifies: src/lib/stripe.ts, webhook route, Anfragen fields
   - Blocks: Zahlungslink-Automatisierung in afterChange hook

7. Kundenantwort field + API route
   - Depends on: nothing new (extends Anfragen)
   - Modifies: anfragen.ts (new field), new API route
   - Blocks: Customer dashboard UI
```

### Layer 2: Document Generation (depends on Layer 1)

```
8. PDF generation module (src/lib/pdf/)
   - Depends on: Einstellungen, tax.ts, Angebote/Rechnungen collections
   - New files: shared.tsx, angebot.tsx, rechnung.tsx, render.ts
   - New API routes: /api/pdf/angebot/[id], /api/pdf/rechnung/[id]
   - Blocks: E-Mail attachments

9. Reklamationen Collection
   - Depends on: Media upload pattern
   - Modifies: payload.config.ts, new collection + API route
   - Blocks: nothing (standalone feature)
```

### Layer 3: Communication (depends on Layer 2)

```
10. E-Mail templates + webhook extensions
    - Depends on: PDF URLs (for attachments), Payment Link URLs
    - Modifies: n8n-webhook.ts (extended payload), new email-templates/
    - Blocks: nothing (N8N handles actual sending)

11. Admin features (manual email, webhook tab, settings page)
    - Depends on: Einstellungen Global, email templates
    - New components in src/components/admin/
    - Blocks: nothing
```

### Suggested Phase Execution Order

```
Phase 1: Security + Einstellungen + Tax         (3 items, independent)
Phase 2: Stripe + Kundenantwort + Collections    (4 items, Layer 1)
Phase 3: PDF Generation + Reklamation            (2 items, Layer 2)
Phase 4: E-Mail System + Admin Features          (2 items, Layer 3)
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Stripe Service Class
**What:** Creating a `StripeService` class with constructor, state, and methods.
**Why bad:** The existing pattern uses pure functions with a lazy singleton (`getStripe()`). A class adds unnecessary complexity and fights the established pattern.
**Instead:** Add exported functions to the existing `stripe.ts` file.

### Anti-Pattern 2: PDF via Puppeteer/Playwright
**What:** Installing Chromium for HTML-to-PDF conversion.
**Why bad:** Adds 150-400MB to Docker image, requires browser binary management, slow cold starts.
**Instead:** Use `@react-pdf/renderer` which is lightweight (~5MB) and renders PDFs programmatically.

### Anti-Pattern 3: Reklamation as Fields on Anfragen
**What:** Adding reklamation_beschreibung, reklamation_fotos, etc. directly to the Anfragen collection.
**Why bad:** Anfragen already has 20+ fields. Reklamation is a separate business entity that can have its own lifecycle.
**Instead:** Separate `reklamationen` collection with relationship back to Anfragen.

### Anti-Pattern 4: Redis for Rate Limiting
**What:** Adding Redis dependency for rate limiting on a single VPS.
**Why bad:** Operational overhead (another service to manage, health check, restart) for a single-server deployment where in-memory works perfectly.
**Instead:** In-memory Map with periodic cleanup. If scaling later, swap store implementation.

### Anti-Pattern 5: Einstellungen in .env
**What:** Putting company info, tax rates, email flags in environment variables.
**Why bad:** Requires code deploy to change. No admin UI. No audit trail.
**Instead:** Payload Global with admin access, type-safe, version-trackable.

### Anti-Pattern 6: Global CSRF Enforcement in Middleware
**What:** Blocking all POST/PUT/DELETE in middleware unless CSRF token present.
**Why bad:** Breaks Stripe webhooks, fights Payload's own auth, requires growing exemption list.
**Instead:** Per-route validation using existing `isSameOriginOrReferer()` pattern.

---

## Scalability Considerations

| Concern | Current (< 500 Anfragen) | At 5K Anfragen | At 50K Anfragen |
|---------|--------------------------|----------------|-----------------|
| Rate limiting | In-memory Map | In-memory Map (still fine) | Redis or rate-limiter-flexible |
| PDF generation | On-demand, synchronous | On-demand, consider queue | Background job queue (BullMQ) |
| Media storage | Payload Media (local disk) | Local disk (fine for PDFs) | S3/MinIO adapter |
| Webhook delivery | Synchronous in hook | Synchronous (still fine) | Queue-based with retries |
| Tax calculation | Synchronous, in-request | Synchronous (still fine) | Synchronous (always fast) |

---

## Files Modified vs New

### Modified (existing files)

| File | Change |
|------|--------|
| `src/middleware.ts` | + Rate limiting logic, + CSRF cookie generation |
| `src/lib/security.ts` | + rateLimit() function, + seed guard |
| `src/lib/stripe.ts` | + createPaymentLink(), + createRefund() |
| `src/lib/n8n-webhook.ts` | + Extended WebhookPayload type, new event types |
| `src/collections/business/anfragen.ts` | + kundenantworten field, + angebot/rechnung relationships, + stripe fields |
| `src/payload.config.ts` | + Einstellungen global, + new collections (angebote, rechnungen, reklamationen) |
| `src/app/api/stripe/webhook/route.ts` | + Handle payment_failed, charge.refunded, session.expired events |

### New files

| File | Purpose |
|------|---------|
| `src/lib/tax.ts` | MwSt calculation module |
| `src/lib/pdf/shared.tsx` | Shared PDF components (header, footer, table) |
| `src/lib/pdf/angebot.tsx` | Angebot PDF document |
| `src/lib/pdf/rechnung.tsx` | Rechnung PDF document |
| `src/lib/pdf/render.ts` | Server-side PDF rendering wrapper |
| `src/payload-globals/einstellungen.ts` | Settings global config |
| `src/collections/business/angebote.ts` | Angebote collection |
| `src/collections/business/rechnungen.ts` | Rechnungen collection |
| `src/collections/business/reklamationen.ts` | Reklamationen collection |
| `src/app/api/pdf/angebot/[id]/route.ts` | Angebot PDF generation endpoint |
| `src/app/api/pdf/rechnung/[id]/route.ts` | Rechnung PDF generation endpoint |
| `src/app/api/anfrage/kundenantwort/route.ts` | Customer answer submission |
| `src/app/api/admin/send-email/route.ts` | Manual email sending for admin |
| `src/app/api/reklamation/upload/route.ts` | Customer file upload for Reklamation |
| `src/email-templates/` | Email template functions (whole folder) |
| `src/lib/anfrage/angebots-nummer.ts` | ANG- number generator |
| `src/lib/anfrage/rechnungs-nummer.ts` | RE- number generator |

---

## Sources

- [Next.js Security Best Practices 2026 - Authgear](https://www.authgear.com/post/nextjs-security-best-practices)
- [How to Think About Security in Next.js - Official Blog](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Stripe Payment Links API Documentation](https://stripe.com/docs/payment-links/api)
- [Stripe Refunds API Reference](https://docs.stripe.com/api/refunds/create)
- [Payload CMS Global Configs Documentation](https://payloadcms.com/docs/configuration/globals)
- [Top JavaScript PDF Generator Libraries 2026 - Nutrient](https://www.nutrient.io/blog/top-js-pdf-libraries/)
- [@react-pdf/renderer - npm](https://www.npmjs.com/package/@react-pdf/renderer)
- [UStG 14 - Gesetze im Internet](https://www.gesetze-im-internet.de/ustg_1980/__14.html)
- [IHK Stuttgart - Pflichtangaben Rechnungen](https://www.ihk.de/stuttgart/fuer-unternehmen/recht-und-steuern/steuerrecht/umsatzsteuer-national/neue-pflichtangaben-fuer-rechnungen-684834)
- [How to Build an In-Memory Rate Limiter in Next.js - freeCodeCamp](https://www.freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs/)
- [Edge-CSRF Discussion - Next.js GitHub](https://github.com/vercel/next.js/discussions/59660)
