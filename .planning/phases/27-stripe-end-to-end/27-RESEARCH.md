# Phase 27: Stripe End-to-End - Research

**Researched:** 2026-03-31
**Domain:** Stripe Payments Integration (Checkout, Webhooks, Refunds, Customer Management)
**Confidence:** HIGH

## Summary

Phase 27 integrates the complete Stripe payment lifecycle into the Christ Fensterhandel system. The existing codebase already has a basic Stripe integration (checkout session creation, a single webhook handler for `checkout.session.completed`, and a customer-facing pay button), but it is incomplete: sessions are created at the wrong status trigger, no Stripe fields are stored on the Anfrage, there is no session expiry handling, no refund capability, no customer object management, and the webhook handler only covers one of four needed event types.

The Stripe Node.js SDK v20.4.1 is already installed and the `getStripe()` lazy-initializer pattern is established. The project uses Payload CMS 3.79 with PostgreSQL, Next.js 15.4 App Router, and has a mature e-mail queue system (Phase 25) and PDF generation pipeline (Phase 26) ready to be wired into the post-payment flow. Settings Global already has `stripe_zahlungslink_ablauf_stunden` and `stripe_waehrung` fields from Phase 24.

**Primary recommendation:** Extend the existing Stripe integration incrementally: add Stripe fields to the Anfrage collection, refactor the afterChange hook to trigger at `zahlungslink_versendet` (not `bestaetigt`), build the redirect route pattern for email links, expand the webhook handler to 4 event types, and add the refund API route and admin UI as separate waves. All Stripe API calls use the already-installed `stripe` v20 SDK.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Admin Zahlungslink-Anzeige: Kombinierte Darstellung -- AttentionBar Badge (farbcodiert) + separater Zahlungs-Panel in rechter Spalte
- AttentionBar Badge-Farben: Gruen=bezahlt, Gelb=offen, Rot=abgelaufen, Lila=rueckerstattet
- Zahlungs-Panel sichtbar ab Status "zahlungslink_versendet" und bei allen Folge-Status
- Panel zeigt: Status-Badge, Zahlungslink (kopierbar), Ablaufdatum, Betrag, aufklappbarer Detail-Bereich mit Session-ID, Payment-Intent-ID, Stripe Customer-ID (klickbar zum Stripe Dashboard)
- Stripe Dashboard Link: Automatisch korrekte URL (test.stripe.com vs dashboard.stripe.com, Erkennung via STRIPE_SECRET_KEY Prefix)
- "Neuen Link erstellen" Button im Zahlungs-Panel bei abgelaufenem Link
- Bei Regenerierung wird automatisch eine neue Zahlungslink-E-Mail gequeued
- Preis-Guard: Status-Wechsel auf "zahlungslink_versendet" wird blockiert wenn gesamtpreis = 0 oder null
- Kein manueller E-Mail-Versand-Button fuer Zahlungslink (kommt Phase 30)
- Checkout-Session: Ablaufzeit aus Settings Global, Waehrung aus Settings Global, Stripe waehlt Zahlungsarten automatisch
- E-Mails enthalten KEINE direkte Stripe URL, sondern /api/stripe/redirect/[anfrageId]
- Redirect-Route prueft Session-Status und regeneriert automatisch bei abgelaufener Session
- Nur Status "zahlungslink_versendet" gilt als zahlbar
- Bei nicht-zahlbarem Status: Redirect zu /zahlung/fehler
- Redirect-Route braucht keinen Login (UUID ist kryptographisch random), Rate Limited 5/min pro IP
- Bestehende POST /api/stripe/checkout Route wird ENTFERNT und durch GET Redirect-Route ersetzt
- Danke-Seite: /zahlung/[status] (erfolgreich, abgebrochen, fehler) -- noindex
- Login-Awareness auf Danke-Seite: Eingeloggt = Dashboard-Link, Nicht eingeloggt = Info-Text
- Polling auf Danke-Seite: GET /api/stripe/payment-status?session_id=cs_... alle 2 Sekunden
- Polling Phasen: 0-30s Spinner, dann gruener Banner bei bezahlt, Timeout nach 30s mit Fallback-Text
- Post-Payment Webhook Flow: sequenziell im afterChange -- Rechnung generieren, Zahlungsbestaetigung + Rechnung per E-Mail queuen, Staff-E-Mail queuen
- checkout.session.expired: Nur stripe_payment_status auf "abgelaufen" setzen, keine E-Mail
- charge.dispute.created: stripe_payment_status auf "dispute" setzen + Staff-E-Mail sofort senden (zeitkritisch)
- Rueckerstattung: Modal mit Betragswahl, Radio Voll/Teil, Eingabefeld fuer Teilbetrag, Pflicht-Begruendung
- Doppelte Bestaetigung bei Refund: Modal + Confirm-Dialog
- Rueckerstatten-Button im Zahlungs-Panel, NICHT im Splitbutton
- Nur Admin darf erstatten (Mitarbeiter sehen Button nicht)
- Moeglich bei allen Post-Bezahlt-Status, nicht bei fruehen oder rueckerstattung_*
- Mehrfache Teilerstattungen: stripe_refunded_amount_cents kumuliert
- Neuer Status "rueckerstattung_ausstehend" (amber, nicht customer_facing)
- Teilerstattungen aendern Anfrage-Status NICHT -- nur Betrag hochzaehlen + StatusHistorie + Gutschrift-PDF
- Jede Erstattung generiert Gutschrift-PDF mit GS-Nummer
- API-Route POST /api/stripe/refund + charge.refunded Webhook-Sync
- Rueckerstattungs-E-Mail an Kunden bei charge.refunded (mit Gutschrift-PDF)
- Keine zeitliche Begrenzung fuer Refunds
- Stripe Felder: stripe_checkout_url, stripe_session_id, stripe_payment_intent_id, stripe_payment_status (Select), stripe_expires_at, stripe_refunded_amount_cents
- Stripe Customer bei Checkout-Session-Erstellung (nicht bei Registrierung)
- stripe_customer_id als Feld auf Users-Collection
- Gaeste ohne Account: Stripe Customer trotzdem erstellen
- DSGVO-minimal: Nur E-Mail + Name an Stripe
- Neuer Status: rueckerstattung_ausstehend (amber #f59e0b, Phase stornierung, nicht customer_facing)
- Alle console.log im Stripe-Code durch strukturiertes Logging ersetzen

### Claude's Discretion
- Exakte Stripe API-Aufrufe und Error-Handling-Details
- Zahlungs-Panel Inline Styles + admin-custom.css Layout
- Polling-Endpunkt Implementierung (Stripe Session Lookup vs. lokales DB-Feld)
- Redirect-Route Rate-Limit-Konfiguration und Fehlerseiten-Layout
- Danke-Seite Design und responsive Layout
- Refund-Modal Component-Struktur (Radix Dialog im Admin)
- stripe_payment_status Select-Werte und Transitions

### Deferred Ideas (OUT OF SCOPE)
- Manueller E-Mail-Versand fuer Zahlungslink (Phase 30)
- Stripe Live-Modus Setup + Umschaltung (STRP-F01, v1.5+)
- Weitere Zahlungsarten SEPA, PayPal (STRP-F02, v1.5+)
- Teilzahlungen / Anzahlungs-Flow (STRP-F03, v1.5+)
- Countdown bis Link-Ablauf im Kunden-Dashboard
- Lazy Migration alter Anfragen zu Stripe Customers
- E-Mail an Kunden bei abgelaufenem Zahlungslink
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STRP-01 | Automatische Checkout Session bei Status "zahlungslink_versendet" (afterChange Hook) | Existing afterChange hook in anfragen.ts must be refactored: currently triggers at "bestaetigt", must move to "zahlungslink_versendet". createCheckoutSession() must be extended with customer, expires_at, and Settings values. Stripe API `checkout.sessions.create` supports `expires_at` (Unix timestamp, 30min-24h window). |
| STRP-02 | Stripe-Felder auf Anfrage (checkout_url, session_id, payment_intent_id, expires_at) | 6 new fields on anfragen collection: stripe_checkout_url (text), stripe_session_id (text), stripe_payment_intent_id (text), stripe_payment_status (select), stripe_expires_at (date), stripe_refunded_amount_cents (number). All admin:readOnly, staff-only access. |
| STRP-03 | Zahlungslink in Admin-Detail-View (sichtbar, kopierbar, Status offen/bezahlt/abgelaufen) | New ZahlungsPanel component in right column of detail-view. Uses established admin CSS patterns (custom.scss). AttentionBar gets payment badge. |
| STRP-04 | "Jetzt bezahlen" Button im Kunden-Dashboard mit Stripe-Weiterleitung | Existing StripePayButton must be refactored: instead of POST /api/stripe/checkout, use window.location to /api/stripe/redirect/[anfrageId]. Show at "zahlungslink_versendet" (not "bestaetigt"). |
| STRP-05 | Session Expiry + Regenerierung (checkout.session.expired Webhook, Admin kann neuen Link erstellen) | Stripe `checkout.session.expired` webhook event. New link creation via API route. Redirect route auto-regenerates expired sessions transparently. |
| STRP-06 | Doppelzahlung verhindern (max 1 aktive Session pro Anfrage) | Before creating new session: expire old session via `stripe.checkout.sessions.expire(sessionId)`. Only one stripe_session_id stored per Anfrage. |
| STRP-07 | Webhook-Idempotenz + Transition-Validierung fuer 4 Event-Types | Webhook handler must check current state before updating. Use stripe_payment_status field for idempotency. Stripe retries on 5xx, so handler must be safe for duplicates. |
| STRP-08 | Rueckerstattung ueber Stripe API (voll + teilweise, Admin-triggered) | `stripe.refunds.create({ payment_intent, amount?, reason, metadata })`. Amount in cents. Omit amount for full refund. POST /api/stripe/refund route with admin-only access. |
| STRP-09 | charge.refunded + charge.dispute.created Webhook-Handler | Two new event handlers in webhook route. charge.refunded updates stripe_payment_status + stripe_refunded_amount_cents. charge.dispute.created sets stripe_payment_status to "dispute" + sends immediate staff email. |
| STRP-10 | zahlung_eingegangen Event an N8N + console.log Cleanup | Replace all console.log with structured console.info('[Stripe Webhook]', { event, anfrageId, ... }). E-mail queuing for bezahlt status already wired via afterChange hook. |
| STRP-11 | Stripe Customer-Objekt erstellen und mit Kunden-E-Mail verknuepfen | `stripe.customers.list({ email })` to find existing, `stripe.customers.create({ email, name, metadata })` if not found. Store stripe_customer_id on Users collection. Pass customer to checkout.sessions.create. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^20.4.1 | Stripe API client (already installed) | Official Node.js SDK, types included |
| next | 15.4.11 | App Router API routes | Already installed, powers all routes |
| payload | 3.79.0 | CMS, DB access, hooks, auth | Already installed, core framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | (installed) | Request validation for API routes | Refund route body validation |
| @payloadcms/ui | (installed) | Admin UI hooks (useDocumentInfo, useAuth, toast) | ZahlungsPanel, RefundModal |

### No New Dependencies
This phase requires zero new npm packages. Everything needed is already installed:
- `stripe` for Stripe API calls
- `zod` for input validation
- `@payloadcms/ui` for admin component hooks
- Rate limiting and CSRF via existing `src/lib/rate-limit.ts` and `src/lib/security.ts`

## Architecture Patterns

### Recommended File Structure
```
src/
  app/
    api/stripe/
      checkout/route.ts        # REMOVE (replaced by redirect route)
      webhook/route.ts         # EXTEND: 4 event handlers
      redirect/[anfrageId]/
        route.ts               # NEW: GET redirect to Stripe Checkout
      refund/
        route.ts               # NEW: POST admin-only refund
      payment-status/
        route.ts               # NEW: GET polling for danke-page
    (frontend)/
      zahlung/
        [status]/
          page.tsx             # NEW: Danke/Abbruch/Fehler pages
  collections/
    business/
      anfragen.ts              # EXTEND: 6 Stripe fields + hook refactor
    system/
      users.ts                 # EXTEND: stripe_customer_id field
  components/
    admin/
      zahlungs-panel.tsx       # NEW: Payment details panel
      refund-modal.tsx         # NEW: Refund dialog
      attention-bar.tsx        # EXTEND: Payment badge
      anfrage-detail-view.tsx  # EXTEND: Mount ZahlungsPanel
      splitbutton.tsx          # EXTEND: Preis-Guard
    kunden/
      stripe-pay-button.tsx    # REFACTOR: Use redirect route
      anfrage-detail.tsx       # EXTEND: Show at zahlungslink_versendet
  lib/
    stripe.ts                  # EXTEND: Customer mgmt, extended session creation
    stripe-helpers.ts          # NEW: Shared helpers (dashboard URL, status colors)
    status-config.ts           # EXTEND: rueckerstattung_ausstehend
    status-transitions.ts      # EXTEND: New transitions for refund flow
```

### Pattern 1: Stripe Field Updates via Payload API (not direct DB)
**What:** All Stripe field updates go through Payload's `update()` API, never direct SQL.
**When to use:** Every webhook handler, every session creation, every refund.
**Why:** Payload's hooks (afterChange) fire correctly, triggering email queuing and PDF generation.

```typescript
// Source: Existing pattern in webhook/route.ts
await payload.update({
  collection: 'anfragen',
  id: anfrageId,
  data: {
    status: 'bezahlt',
    stripe_payment_status: 'bezahlt',
    stripe_payment_intent_id: session.payment_intent,
  },
});
```

### Pattern 2: Checkout Session Creation with Customer + Expiry
**What:** Extended `createCheckoutSession()` that handles customer lookup/creation, configurable expiry, and Settings-driven currency.
**When to use:** On status change to `zahlungslink_versendet` and on session regeneration.

```typescript
// Source: Stripe API docs - checkout.sessions.create
const expiresAt = Math.floor(Date.now() / 1000) + (ablaufStunden * 3600);
// Stripe enforces: min 30 minutes, max 24 hours from now

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  customer: stripeCustomerId, // from findOrCreateCustomer()
  currency: settings.stripe_waehrung || 'eur',
  line_items: [{ price_data: { ... }, quantity: 1 }],
  metadata: { anfrage_id: anfrageId, anfrage_nummer },
  expires_at: expiresAt,
  success_url: `${baseUrl}/zahlung/erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/zahlung/abgebrochen`,
});
```

### Pattern 3: Webhook Handler Switch Pattern
**What:** Single webhook route handling 4 event types with individual handler functions.
**When to use:** All Stripe webhook processing.

```typescript
// Source: Stripe docs - webhook handling best practices
switch (event.type) {
  case 'checkout.session.completed':
    await handleCheckoutCompleted(event.data.object, payload);
    break;
  case 'checkout.session.expired':
    await handleCheckoutExpired(event.data.object, payload);
    break;
  case 'charge.refunded':
    await handleChargeRefunded(event.data.object, payload);
    break;
  case 'charge.dispute.created':
    await handleDisputeCreated(event.data.object, payload);
    break;
}
return NextResponse.json({ received: true });
```

### Pattern 4: Customer Find-or-Create
**What:** Look up existing Stripe customer by email, create if not found.
**When to use:** Before creating a Checkout Session.

```typescript
// Source: Stripe API docs - customers/list, customers/create
async function findOrCreateCustomer(
  email: string,
  name: string,
  userId?: string,
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { user_id: userId || 'guest' },
  });
  return customer.id;
}
```

### Pattern 5: Redirect Route (Public, No Auth)
**What:** GET route that looks up Anfrage by ID, checks status, and redirects to Stripe Checkout URL.
**When to use:** All payment links in emails and customer dashboard.
**Why:** Decouples payment URL from Stripe session lifecycle -- auto-regenerates expired sessions.

```typescript
// GET /api/stripe/redirect/[anfrageId]
// 1. Rate limit (5/min per IP)
// 2. Find Anfrage by ID
// 3. Check status === 'zahlungslink_versendet'
// 4. If stripe_checkout_url exists and not expired: redirect
// 5. If expired: create new session, update Anfrage, redirect
// 6. If wrong status: redirect to /zahlung/fehler
```

### Pattern 6: Admin Components with Inline Styles + custom.scss
**What:** Payload admin custom components use inline styles for dynamic values and CSS classes from `custom.scss` for layout.
**When to use:** ZahlungsPanel, RefundModal, AttentionBar badge.

```typescript
// Source: Established pattern in attention-bar.tsx, tab-panel.tsx
// Dynamic colors via inline style:
<span style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
  {label}
</span>
// Layout via custom.scss classes:
<div className="zahlungs-panel">...</div>
```

### Anti-Patterns to Avoid
- **Direct Stripe URL in emails:** Never put `checkout.stripe.com` URLs in emails. Use `/api/stripe/redirect/[anfrageId]` so expired sessions can be auto-regenerated.
- **Optimistic refund status:** Never set `rueckerstattung_abgeschlossen` from the API route. Use `rueckerstattung_ausstehend` and wait for `charge.refunded` webhook to confirm.
- **Webhook without idempotency:** Always check current `stripe_payment_status` before updating. Stripe may deliver the same event multiple times.
- **console.log in Stripe code:** Use structured logging: `console.info('[Stripe Webhook]', { event: event.type, anfrageId, status })`.
- **Creating Stripe Customer at user registration:** Only create at Checkout Session time (per CONTEXT decision).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Checkout session creation | Custom payment form | `stripe.checkout.sessions.create()` | PCI compliance, 3DS, payment method selection all handled by Stripe |
| Webhook signature verification | Manual HMAC | `stripe.webhooks.constructEvent()` | Timing-safe comparison, replay protection |
| Refund processing | Custom refund logic | `stripe.refunds.create()` | Handles partial refunds, currency conversion, dispute protection |
| Customer deduplication | Email matching logic | `stripe.customers.list({ email })` | Stripe's own deduplication, handles edge cases |
| Rate limiting | New middleware | `withRateLimit()` from `src/lib/rate-limit.ts` | Already built and tested in Phase 24 |
| CSRF protection | New token system | `withCsrf()` from `src/lib/security.ts` | Already built and tested in Phase 24 |
| Email queuing | Direct SMTP | `queueEmailEvent()` from `src/lib/email/queue.ts` | Already built with retry, idempotency in Phase 25 |
| PDF generation | Custom PDF builder | `generateAndStorePDF()` from `src/lib/pdf/generate-and-store.ts` | Already built for rechnung/gutschrift in Phase 26 |

**Key insight:** All supporting infrastructure (rate limiting, CSRF, email queuing, PDF generation, status transitions, optimistic locking) was built in Phases 24-26. This phase wires Stripe into that infrastructure.

## Common Pitfalls

### Pitfall 1: expires_at Range Enforcement
**What goes wrong:** Stripe rejects `expires_at` values outside 30 minutes to 24 hours from now.
**Why it happens:** Settings allows arbitrary hours, but Stripe has a hard cap at 24h.
**How to avoid:** Clamp the value: `Math.min(Math.max(ablaufStunden, 0.5), 24)` before computing Unix timestamp. Log a warning if Settings value exceeds 24h.
**Warning signs:** Stripe API error "expires_at must be between 30 minutes and 24 hours from now".

### Pitfall 2: Webhook Event Ordering
**What goes wrong:** `charge.refunded` may arrive before your API route finishes updating the DB.
**Why it happens:** Stripe sends webhooks asynchronously; your refund API route and webhook may race.
**How to avoid:** The refund API route sets `rueckerstattung_ausstehend` (intermediate status). The webhook handler checks if the Anfrage is in a valid state before updating to final. Use `stripe_payment_status` field for tracking, separate from Anfrage `status`.
**Warning signs:** Status stuck at `rueckerstattung_ausstehend` or double Gutschrift-PDFs generated.

### Pitfall 3: afterChange Hook Recursion
**What goes wrong:** Webhook updates Anfrage status to "bezahlt", which triggers afterChange, which tries to queue emails and generate PDFs. If the afterChange hook also runs business logic on Stripe field changes, infinite loops can occur.
**Why it happens:** Payload's afterChange fires on every `update()` call, including from webhooks.
**How to avoid:** Guard all Stripe-related logic in afterChange with `previousDoc.status !== doc.status` (only trigger on actual status changes, not Stripe field updates). The webhook handler should update status AND Stripe fields in a single `payload.update()` call.
**Warning signs:** Duplicate emails, multiple PDF generations, or timeout errors.

### Pitfall 4: Missing Webhook Secret in Stripe Dashboard
**What goes wrong:** Webhook signature verification fails on all events.
**Why it happens:** Stripe webhook endpoints must be registered in Dashboard with correct URL and secret.
**How to avoid:** Document the required Stripe Dashboard configuration. Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` for local testing.
**Warning signs:** All webhook POSTs return 401 "Invalid signature".

### Pitfall 5: Redirect Route Without Existing Session
**What goes wrong:** Customer clicks payment link but no Checkout Session exists yet (race condition between status change and session creation).
**Why it happens:** If afterChange hook fails to create session (Stripe API error), the Anfrage status is "zahlungslink_versendet" but stripe_checkout_url is null.
**How to avoid:** Redirect route must handle null checkout URL gracefully -- create a new session on-the-fly if Anfrage status is valid but no session exists.
**Warning signs:** Customer sees error page after clicking payment link in email.

### Pitfall 6: Gutschrift PDF for Partial Refunds
**What goes wrong:** Gutschrift PDF shows full invoice amount instead of partial refund amount.
**Why it happens:** `generateAndStorePDF('gutschrift', ...)` uses Anfrage total, not refund amount.
**How to avoid:** Pass refund amount to the Gutschrift generation. The existing `GutschriftPDFProps` has `erstattungNettoCents` etc. which must be set to the refund amount, not the invoice total.
**Warning signs:** Gutschrift shows wrong amount, tax calculation is off.

### Pitfall 7: Stripe Test/Live Mode Confusion
**What goes wrong:** Stripe Dashboard link in admin points to wrong environment.
**Why it happens:** Hardcoded URL to test.stripe.com or dashboard.stripe.com.
**How to avoid:** Detect mode from STRIPE_SECRET_KEY prefix: `sk_test_` = test mode, `sk_live_` = live mode. Build URL accordingly.
**Warning signs:** Admin clicks link and sees wrong Stripe account or 404.

## Code Examples

### Checkout Session with Customer + Expiry + Settings

```typescript
// Source: Stripe API docs + project patterns
export async function createCheckoutSession(opts: {
  anfrageId: string;
  anfrageNummer: string;
  gesamtpreis: number;
  produktAnzahl: number;
  kundenEmail: string;
  kundenName: string;
  userId?: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const settings = await getSettings();
  const ablaufStunden = Math.min(
    Math.max((settings as any).stripe_zahlungslink_ablauf_stunden || 24, 0.5),
    24,
  );
  const waehrung = (settings as any).stripe_waehrung || 'eur';
  const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(ablaufStunden * 3600);

  // Find or create Stripe Customer
  const customerId = await findOrCreateStripeCustomer(
    stripe,
    opts.kundenEmail,
    opts.kundenName,
    opts.userId,
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    currency: waehrung,
    line_items: [{
      price_data: {
        currency: waehrung,
        unit_amount: opts.gesamtpreis,
        product_data: {
          name: `Anfrage ${opts.anfrageNummer}`,
          description: `${opts.produktAnzahl} Produkt(e)`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      anfrage_id: opts.anfrageId,
      anfrage_nummer: opts.anfrageNummer,
    },
    expires_at: expiresAt,
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/zahlung/erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/zahlung/abgebrochen`,
  });

  return session;
}
```

### Refund API Route Pattern

```typescript
// Source: Stripe API docs - refunds/create + project API route patterns
// POST /api/stripe/refund
const refundSchema = z.object({
  anfrage_id: z.string().uuid(),
  amount_cents: z.number().int().positive().optional(), // omit for full refund
  reason: z.string().min(1).max(500),
  version: z.number().int(),
});

// Admin-only: check req.user.rolle === 'admin'
// Validate: anfrage exists, has stripe_payment_intent_id, status is post-bezahlt
// Create refund:
const refund = await stripe.refunds.create({
  payment_intent: anfrage.stripe_payment_intent_id,
  amount: amountCents, // omit for full refund
  reason: 'requested_by_customer',
  metadata: { anfrage_id, anfrage_nummer, admin_reason: reason },
});
```

### Webhook Idempotency Pattern

```typescript
// Source: Stripe docs - webhook best practices
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  payload: any,
) {
  const anfrageId = session.metadata?.anfrage_id;
  if (!anfrageId) return;

  const anfrage = await payload.findByID({
    collection: 'anfragen',
    id: anfrageId,
  });

  // Idempotency: skip if already processed
  if (anfrage.stripe_payment_status === 'bezahlt') {
    console.info('[Stripe Webhook] Skipping duplicate checkout.session.completed', {
      anfrageId,
    });
    return;
  }

  await payload.update({
    collection: 'anfragen',
    id: anfrageId,
    data: {
      status: 'bezahlt',
      stripe_payment_status: 'bezahlt',
      stripe_payment_intent_id: session.payment_intent as string,
    },
  });
}
```

### Stripe Dashboard URL Helper

```typescript
// Source: Stripe docs + CONTEXT.md decision
export function getStripeDashboardUrl(
  objectType: 'payments' | 'customers',
  objectId: string,
): string {
  const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
  const base = isTestMode
    ? 'https://dashboard.stripe.com/test'
    : 'https://dashboard.stripe.com';
  return `${base}/${objectType}/${objectId}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual payment method list | `payment_method_types: undefined` (Stripe auto-selects) | Stripe default since 2023 | Simpler config, more payment methods |
| `stripe-signature` raw verification | `stripe.webhooks.constructEvent()` | Always the recommended approach | Timing-safe, handles key rotation |
| Inline product creation per session | `price_data` in line_items | Current Stripe standard | No need to pre-create products in Dashboard |
| Separate redirect page per outcome | `{CHECKOUT_SESSION_ID}` template variable in success_url | Available since Checkout v2 | Session ID available on success page for polling |

**Deprecated/outdated:**
- `Charges API` for payments: Use `PaymentIntents` (Checkout Sessions use PaymentIntents internally)
- `stripe.charges.refund()`: Use `stripe.refunds.create()` with `payment_intent` parameter

## Open Questions

1. **Polling: Stripe Session Lookup vs Local DB Field**
   - What we know: Danke-Seite needs to know when payment is confirmed. Two approaches: (a) poll Stripe API with session_id, (b) poll local DB field `stripe_payment_status`.
   - What's unclear: Which is simpler and more reliable?
   - Recommendation: Use **local DB field polling** via `/api/stripe/payment-status?session_id=cs_...`. The route looks up the Anfrage by stripe_session_id and returns the current stripe_payment_status. Advantages: no extra Stripe API call, works even if webhook is delayed (shows "processing" state), simpler error handling. The webhook updates the DB field, and the polling endpoint reads it.

2. **Gutschrift PDF for Partial Refunds: Amount Calculation**
   - What we know: `generateAndStorePDF('gutschrift', anfrageId)` currently uses the full Anfrage total for the Gutschrift.
   - What's unclear: How to pass the partial refund amount to the PDF generator.
   - Recommendation: Extend `generateAndStorePDF` options to accept `refundAmountCents`. When provided, use this instead of computing from Anfrage products. The Gutschrift shows the refund amount, not the original invoice amount.

3. **Rueckerstattung Status Transition from Multiple Source Statuses**
   - What we know: `rueckerstattung_ausstehend` can be reached from bezahlt, an_hersteller, hersteller_bestaetigt, in_produktion, lieferung, montage, abgeschlossen. But the refund API route (not the Splitbutton) triggers this.
   - What's unclear: Should these transitions be in VALID_TRANSITIONS or handled separately since they bypass the Splitbutton?
   - Recommendation: Add the transitions to VALID_TRANSITIONS for consistency, but the refund API route performs the transition programmatically (not via admin PATCH). The Splitbutton never shows "Rueckerstattung" as an option (per CONTEXT decision).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via jest.config.ts) |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern=stripe -x` |
| Full suite command | `npx jest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STRP-01 | Checkout Session created on zahlungslink_versendet status | unit | `npx jest tests/unit/test-stripe-checkout.test.ts -x` | Needs update (currently tests at bestaetigt) |
| STRP-02 | Stripe fields stored on Anfrage after session creation | unit | `npx jest tests/unit/test-stripe-fields.test.ts -x` | Wave 0 |
| STRP-03 | ZahlungsPanel renders correct status/data | unit | `npx jest tests/unit/test-zahlungs-panel.test.tsx -x` | Wave 0 |
| STRP-04 | StripePayButton redirects via redirect route | unit | `npx jest tests/unit/test-stripe-pay-button.test.tsx -x` | Wave 0 |
| STRP-05 | Expired session regeneration via redirect route | unit | `npx jest tests/unit/test-stripe-redirect.test.ts -x` | Wave 0 |
| STRP-06 | Only one active session per Anfrage | unit | `npx jest tests/unit/test-stripe-checkout.test.ts -x` | Needs update |
| STRP-07 | Webhook idempotency for all 4 event types | unit | `npx jest tests/unit/test-stripe-webhook.test.ts -x` | Needs update (currently only checkout.session.completed) |
| STRP-08 | Refund API validates inputs, calls Stripe, updates status | unit | `npx jest tests/unit/test-stripe-refund.test.ts -x` | Wave 0 |
| STRP-09 | charge.refunded + charge.dispute.created handlers | unit | `npx jest tests/unit/test-stripe-webhook.test.ts -x` | Needs update |
| STRP-10 | Structured logging replaces console.log | manual-only | Code review | N/A |
| STRP-11 | Customer find-or-create before checkout | unit | `npx jest tests/unit/test-stripe-customer.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=stripe -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-stripe-fields.test.ts` -- covers STRP-02
- [ ] `tests/unit/test-zahlungs-panel.test.tsx` -- covers STRP-03
- [ ] `tests/unit/test-stripe-pay-button.test.tsx` -- covers STRP-04 (refactored button)
- [ ] `tests/unit/test-stripe-redirect.test.ts` -- covers STRP-05, STRP-06
- [ ] `tests/unit/test-stripe-refund.test.ts` -- covers STRP-08
- [ ] `tests/unit/test-stripe-customer.test.ts` -- covers STRP-11
- [ ] Update `tests/unit/test-stripe-webhook.test.ts` -- extend to 4 event types (STRP-07, STRP-09)
- [ ] Update `tests/unit/test-stripe-checkout.test.ts` -- trigger at zahlungslink_versendet, not bestaetigt (STRP-01)
- [ ] `tests/unit/test-status-transitions.test.ts` -- add rueckerstattung_ausstehend transitions

## Sources

### Primary (HIGH confidence)
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create) - expires_at, customer, customer_creation, success_url template
- [Stripe Refunds API](https://docs.stripe.com/api/refunds/create) - amount (cents), partial refund, reason values
- [Stripe Checkout Session object](https://docs.stripe.com/api/checkout/sessions/object) - payment_intent, payment_status, status, url, expires_at fields
- [Stripe Customers API](https://docs.stripe.com/api/customers/list) - email-based lookup pattern
- [Stripe Custom Success Page](https://docs.stripe.com/payments/checkout/custom-success-page) - {CHECKOUT_SESSION_ID} template variable
- Existing project code (HIGH confidence): `src/lib/stripe.ts`, `src/app/api/stripe/webhook/route.ts`, `src/collections/business/anfragen.ts`, `src/lib/status-config.ts`, `src/lib/status-transitions.ts`, `src/components/admin/attention-bar.tsx`, `src/app/(payload)/custom.scss`

### Secondary (MEDIUM confidence)
- [Stripe Webhook Handling](https://docs.stripe.com/webhooks/handling-payment-events) - best practices for idempotency, response timing (2xx within 20s)
- [Stripe Event Types](https://docs.stripe.com/api/events/types) - checkout.session.completed, checkout.session.expired, charge.refunded, charge.dispute.created

### Tertiary (LOW confidence)
- None - all findings verified against official Stripe documentation and existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in package.json
- Architecture: HIGH - patterns directly extend established codebase patterns (afterChange hooks, admin components, API routes)
- Stripe API: HIGH - verified against official Stripe API documentation
- Pitfalls: HIGH - based on known Stripe behaviors documented officially + real codebase analysis

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (Stripe SDK stable, project patterns established)
