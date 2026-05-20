# Phase 5: Externe Integrationen - Research

**Researched:** 2026-03-10
**Domain:** Stripe Payments + N8N Email Automation (Next.js App Router + Payload CMS)
**Confidence:** HIGH

## Summary

Phase 5 integrates two external systems into the existing Next.js/Payload CMS application: Stripe for payment processing and N8N for email automation via webhooks. The codebase already has well-defined integration points: an `afterChange` hook placeholder in the Anfragen collection (line 93-101 of anfragen.ts), a disabled "Zur Zahlung" button in the Kunden-Dashboard AnfrageDetail component, and a `calculateServerPrice()` function for authoritative pricing. The status transition `bestaetigt -> bezahlt` is already defined in `status-transitions.ts`.

Stripe Checkout Sessions are the correct approach for one-time payments with automatic payment method selection. The `stripe` npm package (v20.x) provides server-side session creation, and webhook signature verification uses `stripe.webhooks.constructEvent()` with the raw request body accessed via `request.text()` in Next.js App Router routes. N8N runs as a Docker container with a single webhook endpoint; the app sends POST requests with a shared secret header, and N8N routes internally via Switch node on `event_type`.

**Primary recommendation:** Use Stripe Checkout Sessions (server-side only, no @stripe/stripe-js needed) with `request.text()` for webhook signature verification. N8N receives webhooks from Payload afterChange hooks -- keep it simple with fetch() calls and shared secret auth.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Checkout startet bei Status BESTAETIGT (Admin bestaetigt -> Kunde sieht "Jetzt bezahlen" im Dashboard)
- Voller Betrag (brutto inkl. MwSt) in einer Zahlung -- keine Teilzahlung/Anzahlung
- Stripe automatic payment methods (Karte, SEPA, Klarna etc. -- Stripe waehlt basierend auf Land/Betrag)
- App erstellt Stripe Checkout Session beim Status-Wechsel auf BESTAETIGT, URL wird im Webhook-Payload an N8N mitgesendet
- Nach erfolgreicher Zahlung: Redirect zurueck zum Kunden-Dashboard
- Stripe Webhook setzt Anfrage-Status automatisch auf BEZAHLT
- Test-Modus mit Karte 4242 4242 4242 4242
- Stripe Webhook: Signature-Pruefung mit stripe.webhooks.constructEvent() und WHSEC-Secret
- N8N Webhook: Shared Secret im x-webhook-secret Header (N8N prueft Wert)
- Webhook-Fehler werden geloggt (console.error), blockieren aber nicht den Hauptfluss
- Stripe hat eigene Retry-Logik (bis 3 Tage)
- Fehler-Badge im Admin-Dashboard wenn Webhooks fehlschlagen (sichtbar fuer Admin)
- E-Mail-Trigger: neue_anfrage, bestaetigt (mit Zahlungslink), rueckfrage (mit Kommentar), bezahlt, abgeschlossen
- E-Mail an Firma: Kompakte Uebersicht bei neuer Anfrage (Kundenname, E-Mail, Telefon, Anzahl Produkte, Gesamtbetrag, Link zum Admin-Dashboard)
- Branded HTML-Templates mit Logo, Farben aus Style Guide, styled Buttons
- Absender: noreply@christ-fensterhandel.de (oder .com)
- Ein N8N Workflow mit einem Webhook-Endpoint, Switch-Node routet nach event_type
- Event-Typen: neue_anfrage, status_aenderung, zahlung_eingegangen
- Webhook-Payload: event_type, anfrage_id, anfrage_nummer, status (neu/alt), kunde (name, email), gesamtbetrag, produkt_anzahl, optional stripe_checkout_url
- N8N lokal per Docker zum Entwickeln/Testen, spaeter auf Server importieren

### Claude's Discretion
- Stripe Checkout Session API-Aufruf Implementierung (server-side)
- N8N docker-compose Setup fuer lokale Entwicklung
- E-Mail HTML-Template Struktur und Styling-Details
- Webhook-Payload exakte JSON-Struktur
- Fehler-Badge Implementierung im Admin (Payload Custom Component oder Global)
- afterChange Hook Refactoring (aktueller Placeholder -> vollstaendige Implementierung)
- Stripe Webhook Endpoint Route und Event-Handling

### Deferred Ideas (OUT OF SCOPE)
- PDF-Generierung (Angebots-PDF als E-Mail-Anhang) -- v2 (INT-V2-01)
- Automatische Erinnerungs-E-Mail bei unbezahlten Anfragen nach X Tagen -- v2
- N8N Cron-Workflow fuer alte unbearbeitete Anfragen -- v2 (INT-V2-03)
- Anzahlung/Teilzahlung Option -- spaetere Erweiterung
- E-Mail-Tracking (geoeffnet/geklickt) -- v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-01 | Stripe Checkout Session erstellen aus Anfrage | Stripe SDK v20.x, `stripe.checkout.sessions.create()` with EUR currency, metadata for anfrage_id, success/cancel URLs |
| PAY-02 | Stripe Webhook empfangen und Status auf "BEZAHLT" setzen | Next.js App Router route with `request.text()` for raw body, `stripe.webhooks.constructEvent()` signature verification, Payload Local API for status update |
| PAY-03 | Test-Modus mit Karte 4242 4242 4242 4242 | Stripe test mode via `STRIPE_SECRET_KEY=sk_test_...`, test card works automatically |
| N8N-01 | Payload afterChange Hook sendet Webhook an N8N bei neuer Anfrage | Extend existing afterChange hook in anfragen.ts, detect `operation === 'create'` for neue_anfrage |
| N8N-02 | Webhook-Security mit Secret/Token (ohne Secret -> 401) | `x-webhook-secret` header validation in N8N workflow (HTTP Header Auth node or IF node) |
| N8N-03 | Formatierte E-Mail an Firma (Produktliste, Kundendaten) | N8N Email node with HTML template, triggered on neue_anfrage event_type |
| N8N-04 | Bestaetigungs-E-Mail an Kunde | N8N Email node with branded HTML template, triggered on neue_anfrage event_type |
| N8N-05 | Status-Aenderung triggert passende E-Mail | afterChange hook detects status change, sends webhook with old/new status, N8N Switch node routes to correct email template |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^20.4.1 | Server-side Stripe API (Checkout Sessions, Webhooks) | Official Stripe Node.js SDK, actively maintained |
| n8n | latest (Docker) | Workflow automation for email sending | Self-hosted, no vendor lock-in, visual workflow editor |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | No @stripe/stripe-js required | Checkout Session redirect is server-generated URL, no client-side Stripe Elements |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Checkout Sessions | Stripe Payment Intents + Elements | Checkout is simpler for one-time payments, handles payment method selection automatically |
| N8N for emails | Resend/SendGrid direct from app | N8N gives visual workflow editing, non-dev can modify email flows later |
| Shared Secret (N8N) | HMAC signature | Shared secret is simpler, sufficient for server-to-server on same network |

**Installation:**
```bash
npm install stripe
```

No additional client-side packages needed. N8N runs via Docker, not npm.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/api/
│   ├── stripe/
│   │   ├── checkout/route.ts      # POST: Create Checkout Session
│   │   └── webhook/route.ts       # POST: Receive Stripe webhooks
│   └── ...
├── lib/
│   ├── stripe.ts                  # Stripe client singleton
│   └── n8n-webhook.ts             # N8N webhook sender utility
├── collections/business/
│   └── anfragen.ts                # Extended afterChange hook
└── components/
    ├── kunden/
    │   └── anfrage-detail.tsx     # Updated payment button
    └── admin/
        └── webhook-fehler-badge.tsx  # Admin error badge
```

### Pattern 1: Stripe Client Singleton
**What:** Single Stripe instance initialized with secret key
**When to use:** Every server-side Stripe operation
**Example:**
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-18.acacia', // Use latest stable API version
  typescript: true,
})
```

### Pattern 2: Checkout Session Creation (API Route)
**What:** POST endpoint creates Stripe Checkout Session, returns URL
**When to use:** When customer clicks "Jetzt bezahlen" button
**Example:**
```typescript
// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  const { anfrage_id } = await request.json()

  const payload = await getPayload({ config })
  const anfrage = await payload.findByID({
    collection: 'anfragen',
    id: anfrage_id,
  })

  if (!anfrage || anfrage.status !== 'bestaetigt') {
    return NextResponse.json({ error: 'Anfrage nicht bezahlbar' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'eur',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: Math.round((anfrage.gesamtpreis || 0) * 100), // Cents
        product_data: {
          name: `Anfrage ${anfrage.anfrage_nummer}`,
          description: `${anfrage.produkte?.length || 0} Produkt(e)`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      anfrage_id: anfrage.id,
      anfrage_nummer: anfrage.anfrage_nummer || '',
    },
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/kunden/dashboard/${anfrage.id}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/kunden/dashboard/${anfrage.id}?payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
```

### Pattern 3: Stripe Webhook with Raw Body (CRITICAL)
**What:** Webhook endpoint that correctly verifies Stripe signature
**When to use:** Receiving Stripe webhook events
**Example:**
```typescript
// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  // CRITICAL: Use request.text() NOT request.json()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const anfrageId = session.metadata?.anfrage_id

    if (anfrageId && session.payment_status === 'paid') {
      const payload = await getPayload({ config })
      await payload.update({
        collection: 'anfragen',
        id: anfrageId,
        data: { status: 'bezahlt' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
```

### Pattern 4: N8N Webhook Sender Utility
**What:** Reusable function to send webhooks to N8N with error handling
**When to use:** In afterChange hooks
**Example:**
```typescript
// src/lib/n8n-webhook.ts
interface WebhookPayload {
  event_type: 'neue_anfrage' | 'status_aenderung' | 'zahlung_eingegangen'
  anfrage_id: string
  anfrage_nummer: string
  status: { neu: string; alt?: string }
  kunde: { name: string; email: string }
  gesamtbetrag: number
  produkt_anzahl: number
  stripe_checkout_url?: string
}

export async function sendN8NWebhook(payload: WebhookPayload): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_URL
  const secret = process.env.N8N_WEBHOOK_SECRET

  if (!url) {
    console.error('N8N_WEBHOOK_URL not configured')
    return false
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': secret || '',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`N8N webhook failed: ${response.status} ${response.statusText}`)
      return false
    }

    return true
  } catch (error) {
    console.error('N8N webhook error:', error)
    return false
  }
}
```

### Pattern 5: afterChange Hook (Complete Implementation)
**What:** Extend existing Anfragen afterChange hook for webhooks
**When to use:** On every Anfrage create/update
**Example:**
```typescript
// Inside anfragen.ts afterChange hook
afterChange: [
  async ({ doc, previousDoc, operation }) => {
    // New Anfrage created
    if (operation === 'create') {
      await sendN8NWebhook({
        event_type: 'neue_anfrage',
        anfrage_id: doc.id,
        anfrage_nummer: doc.anfrage_nummer || '',
        status: { neu: doc.status || 'neu' },
        kunde: {
          name: `${doc.kontaktdaten?.vorname || ''} ${doc.kontaktdaten?.nachname || ''}`.trim(),
          email: doc.kontaktdaten?.email || '',
        },
        gesamtbetrag: doc.gesamtpreis || 0,
        produkt_anzahl: doc.produkte?.length || 0,
      })
      return
    }

    // Status changed
    if (previousDoc && previousDoc.status !== doc.status) {
      const payload: WebhookPayload = {
        event_type: 'status_aenderung',
        anfrage_id: doc.id,
        anfrage_nummer: doc.anfrage_nummer || '',
        status: { neu: doc.status || '', alt: previousDoc.status || '' },
        kunde: {
          name: `${doc.kontaktdaten?.vorname || ''} ${doc.kontaktdaten?.nachname || ''}`.trim(),
          email: doc.kontaktdaten?.email || '',
        },
        gesamtbetrag: doc.gesamtpreis || 0,
        produkt_anzahl: doc.produkte?.length || 0,
      }

      // Include Stripe checkout URL when transitioning to bestaetigt
      // (Checkout Session created separately, URL stored or passed)
      if (doc.status === 'bestaetigt') {
        // Generate Stripe Checkout Session here or in separate step
      }

      await sendN8NWebhook(payload)
    }
  },
],
```

### Anti-Patterns to Avoid
- **Parsing webhook body as JSON before signature check:** Stripe signature verification REQUIRES the raw body string. Using `request.json()` will break verification.
- **Creating Checkout Sessions client-side:** Secret key must never be exposed. Always create sessions server-side.
- **Blocking afterChange hooks on webhook failures:** Use try/catch and log errors; never let webhook failures prevent the main operation.
- **Hardcoding Stripe API version in multiple places:** Use a single Stripe client singleton.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment processing | Custom payment form | Stripe Checkout Sessions | PCI compliance, automatic payment methods, fraud detection |
| Webhook signature verification | Custom HMAC check | `stripe.webhooks.constructEvent()` | Handles timing attacks, version differences |
| Email sending | SMTP from Node.js | N8N workflow with Email node | Visual editing, retry logic, template management without deploys |
| Email templates | React Email or custom HTML builder | N8N HTML template nodes | Non-developers can edit templates, no code deploy needed |

**Key insight:** Stripe handles all PCI-sensitive operations. The app never touches card numbers. Checkout Sessions redirect the customer to Stripe's hosted page, then redirect back.

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Fails
**What goes wrong:** `stripe.webhooks.constructEvent()` throws "No signatures found matching the expected signature"
**Why it happens:** Using `request.json()` instead of `request.text()` in Next.js App Router. The JSON parse/stringify roundtrip changes whitespace.
**How to avoid:** Always use `const body = await request.text()` for the raw body.
**Warning signs:** Webhook returns 401/400 in Stripe Dashboard, but endpoint works fine with manual POST requests.

### Pitfall 2: Stripe Amount in Wrong Unit
**What goes wrong:** Customer is charged 1/100th of the actual price (e.g., EUR 12.50 instead of EUR 1250.00)
**Why it happens:** Stripe expects amounts in the smallest currency unit (cents for EUR). `gesamtpreis` is stored as EUR with decimals.
**How to avoid:** Always `Math.round(amount * 100)` when passing to Stripe. Always `amount / 100` when reading from Stripe.
**Warning signs:** Test payments showing wrong amounts in Stripe Dashboard.

### Pitfall 3: Duplicate Webhook Events
**What goes wrong:** Status set to BEZAHLT multiple times, duplicate emails sent.
**Why it happens:** Stripe retries webhooks if response is not 2xx within timeout. Network issues can cause retries.
**How to avoid:** Make webhook handler idempotent -- check if status is already `bezahlt` before updating. Return 200 quickly.
**Warning signs:** Multiple StatusHistorie entries for the same transition.

### Pitfall 4: N8N Webhook URL Not Reachable from App
**What goes wrong:** afterChange hook fetch() fails with ECONNREFUSED or timeout.
**Why it happens:** N8N runs in Docker, app runs on host. `localhost` from app does not reach Docker container.
**How to avoid:** Use `host.docker.internal` if app is also in Docker, or use the Docker host IP. For local dev with app on host and N8N in Docker, use `http://localhost:5678/webhook/...` (N8N maps port to host).
**Warning signs:** Console errors about connection refused on webhook calls.

### Pitfall 5: Checkout Session Created But URL Not Sent to Customer
**What goes wrong:** Admin sets status to BESTAETIGT but customer email has no payment link.
**Why it happens:** Checkout Session is created in afterChange hook (async), but N8N webhook fires before session URL is available.
**How to avoid:** Two approaches: (A) Create Checkout Session in the status change API endpoint BEFORE updating status, then pass URL to afterChange hook via data. (B) Create Checkout Session in afterChange hook, then send N8N webhook after session is created. Approach B is simpler.
**Warning signs:** E-Mails with empty/missing Stripe checkout URL.

### Pitfall 6: Payload Local API Bypass in Webhook
**What goes wrong:** Stripe webhook updates Anfrage status but beforeChange hook validation blocks it.
**Why it happens:** Webhook handler uses Local API which still runs hooks.
**How to avoid:** The transition `bestaetigt -> bezahlt` is already defined in VALID_TRANSITIONS, so this should work. But ensure no auth-related checks block the update (Local API bypasses access control by default, which is correct here).
**Warning signs:** Webhook returns 200 but status not updated.

## Code Examples

### Stripe Checkout Button (Client Component Update)
```typescript
// In anfrage-detail.tsx, replace disabled button
{anfrage.status === 'bestaetigt' && (
  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="text-sm font-medium text-green-800">
      Ihre Anfrage wurde bestaetigt!
    </p>
    <p className="mt-1 text-sm text-green-700">
      Bitte bezahlen Sie den Gesamtbetrag, um die Bestellung abzuschliessen.
    </p>
    <button
      type="button"
      onClick={async () => {
        setLoading(true)
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anfrage_id: anfrage.id }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        }
        setLoading(false)
      }}
      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
    >
      Jetzt bezahlen ({formatPrice(anfrage.gesamtpreis)})
    </button>
  </div>
)}
```

### N8N Docker Compose for Local Development
```yaml
# docker-compose.n8n.yml
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - WEBHOOK_URL=http://localhost:5678/
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### Environment Variables Needed
```bash
# .env additions
STRIPE_SECRET_KEY=sk_test_... # Stripe test secret key
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI or Dashboard
N8N_WEBHOOK_URL=http://localhost:5678/webhook/christ-fensterhandel
N8N_WEBHOOK_SECRET=a-secure-random-string-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Stripe CLI for Local Webhook Testing
```bash
# Install Stripe CLI, then forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook
# This prints the webhook signing secret (whsec_...)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Charges API | Stripe Checkout Sessions | 2019+ | Simplified PCI compliance, hosted payment page |
| Manual payment_method_types list | automatic_payment_methods / Dashboard config | 2022+ | Stripe auto-selects best methods for currency/country |
| Pages Router API routes (req.body buffer) | App Router (request.text()) | Next.js 13+ | Different raw body access pattern |
| N8N basic auth only | N8N with webhook auth nodes | Recent | Better security for webhook endpoints |

**Deprecated/outdated:**
- `stripe.charges.create()`: Use Checkout Sessions or PaymentIntents instead
- `payment_method_types: ['card']`: Use automatic payment methods (Stripe Dashboard controls which methods are shown)

## Open Questions

1. **Stripe API Version**
   - What we know: Latest Stripe SDK is v20.4.x, API versions are date-based strings
   - What's unclear: Exact latest API version string for the `apiVersion` parameter
   - Recommendation: Omit `apiVersion` in Stripe constructor to use SDK default (latest stable), or check Stripe Dashboard for account API version

2. **Checkout Session Creation Timing**
   - What we know: User decision says "App erstellt Checkout Session beim Status-Wechsel auf BESTAETIGT"
   - What's unclear: Whether to pre-create session in afterChange hook or create on-demand when customer clicks button
   - Recommendation: Create on-demand when customer clicks "Jetzt bezahlen" -- sessions expire after 24h, and the customer might not pay immediately. The afterChange hook sends the N8N webhook with a dashboard URL instead of a direct checkout URL, and the BESTAETIGT email includes both the dashboard link and a note to pay online.

3. **Fehler-Badge Storage**
   - What we know: Admin should see when webhooks fail
   - What's unclear: Whether to use a Payload Global, a separate collection, or in-memory tracking
   - Recommendation: Use a Payload Global `webhook_errors` with a JSON field storing last N errors. Simple, queryable, persists across restarts.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.x + ts-jest |
| Config file | jest.config.ts (exists) |
| Quick run command | `npx jest --testPathPattern=test-name -x` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | Checkout Session creation returns URL for bestaetigt Anfrage, rejects other statuses | unit | `npx jest tests/unit/test-stripe-checkout.test.ts -x` | Wave 0 |
| PAY-02 | Webhook verifies signature, updates status to bezahlt, handles duplicates idempotently | unit | `npx jest tests/unit/test-stripe-webhook.test.ts -x` | Wave 0 |
| PAY-03 | Test mode configuration (covered by PAY-01/PAY-02 using test keys) | unit | (covered by PAY-01/PAY-02) | N/A |
| N8N-01 | sendN8NWebhook sends correct payload for neue_anfrage | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | Wave 0 |
| N8N-02 | Webhook includes x-webhook-secret header, fails without URL config | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | Wave 0 |
| N8N-03 | N8N workflow sends firma email (manual E2E) | manual-only | Manual: trigger test webhook, verify email in N8N execution log | N/A |
| N8N-04 | N8N workflow sends kunde email (manual E2E) | manual-only | Manual: trigger test webhook, verify email in N8N execution log | N/A |
| N8N-05 | afterChange hook sends status_aenderung event with correct old/new status | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=<relevant-test> -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-stripe-checkout.test.ts` -- covers PAY-01 (mock Stripe SDK, test session creation logic)
- [ ] `tests/unit/test-stripe-webhook.test.ts` -- covers PAY-02 (mock constructEvent, test idempotency)
- [ ] `tests/unit/test-n8n-webhook.test.ts` -- covers N8N-01, N8N-02, N8N-05 (mock fetch, test payload structure and headers)

## Sources

### Primary (HIGH confidence)
- [stripe npm v20.4.1](https://www.npmjs.com/package/stripe) - Latest version verified
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create) - Official API reference
- [Stripe Webhook Signature](https://docs.stripe.com/webhooks/signature) - Signature verification docs
- [N8N Docker Compose](https://docs.n8n.io/hosting/installation/server-setups/docker-compose/) - Official N8N hosting docs

### Secondary (MEDIUM confidence)
- [Next.js App Router Stripe Webhook raw body](https://github.com/vercel/next.js/issues/60002) - Confirmed request.text() pattern
- [Stripe + Next.js 15 Guide](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) - Community verified pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Stripe SDK well-documented, N8N Docker setup straightforward
- Architecture: HIGH - Patterns derived from official Stripe docs + existing codebase patterns
- Pitfalls: HIGH - Well-known issues (raw body, cents conversion) documented in multiple sources

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain, Stripe API changes slowly)
