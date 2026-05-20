# Phase 24: Foundation - Research

**Researched:** 2026-03-28
**Domain:** Payload CMS Globals, Cent-Integer Arithmetic, Counter Tables, Rate Limiting, CSRF, Optimistic Locking
**Confidence:** HIGH

## Summary

Phase 24 builds infrastructure (not business values) for all downstream finance and document features. The codebase already has strong patterns established: 3 Payload Globals (WebhookErrors, Navigation, Footer) serve as templates for a Settings Global, 37 Jest unit tests demonstrate the testing convention, and the existing `security.ts` provides a CSRF foundation that needs extension. The primary technical challenges are: (1) migrating all price fields from float EUR to integer cents without breaking existing data, (2) implementing gap-free counters using Payload transactions with PostgreSQL, and (3) adding rate limiting to the existing Next.js middleware that currently only handles i18n and role-based redirects.

All required libraries are already installed. No new npm dependencies are needed -- the in-memory rate limiter uses standard JavaScript Map, CSRF uses the existing cookie/header pattern, and Payload CMS 3.79 natively supports PostgreSQL transactions via `payload.db.beginTransaction()` / `commitTransaction()` / `rollbackTransaction()`.

**Primary recommendation:** Build in this order: (1) Settings Global + helper, (2) lib/tax.ts cent arithmetic, (3) Nummernkreise collection + helper, (4) Rate limiting + CSRF hardening, (5) Optimistic locking on Anfragen, (6) Seed guard + .env hygiene, (7) Cent migration of all existing prices.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Payload Global as data layer + Custom Admin Page as frontend UI (like anfrage-detail-view and dashboard-overview pattern)
- Navigation: Under System dropdown (not as top-level link)
- 4 Tabs on Custom Page: Firmendaten | Steuer | Stripe | Dokumente
- Access: Only Admin may edit (Mitarbeiter/Viewer read-only or no access)
- Changes take effect immediately (no cache, every API call reads current value from DB)
- Single-language (no i18n for factual company data)
- "Last updated on [date] by [user]" display (no full history tracking)
- Firmendaten: Firmenname, Adresse, Telefon, E-Mail, Steuernummer, USt-IdNr, Bankverbindung (IBAN, BIC, Bank-Name as optional fields)
- Steuer: MwSt-Satz (Default 19%), Price display gross/net (configurable)
- Stripe: Payment link expiry (Default 24h), Currency (configurable, EUR default), Test/Live info (keys stay in .env)
- Dokument: Angebots-Gueltigkeit (Default 30 days), Widerrufsbelehrung text, AGB link/PDF, Logo for PDFs (upload via Payload Media)
- E-Mail fields: Absender-Name, Reply-To, Signatur -- prepared for Phase 25
- lib/tax.ts with functional helpers (no OOP): calcNetFromGross, calcGrossFromNet, calcTax, splitLine
- Cent-Integer arithmetic throughout (no floats for money)
- MwSt rate read from Settings Global via getSettings() helper (lib/settings.ts)
- Complete migration of all existing prices to cents
- formatCents(cents: number) function in lib/format-currency.ts
- Nummernkreise Collection with counter pattern: { typ, jahr, letzteNummer, prefix }
- 4-digit: ANG-2026-0001, RE-2026-0042, GS-2026-0003
- Automatic year rollover in getNextNumber()
- Atomic increment via Payload Transaction
- Rate Limiting: In-Memory Map (no Redis, single-server Coolify)
- Per-route withRateLimit(handler, {limit, windowMs}) wrapper
- Middleware matcher for /api/users/login (5/min per IP)
- Limits: Login 5/min, Anfrage-Submit 3/min, Status-Pruefen 10/min, Rabattcode 10/min
- Response: HTTP 429 + Retry-After header + German error message, no IP block
- X-Forwarded-For header correct reading for reverse proxy
- CSRF: Origin-Check (existing) + Double-Submit Cookie Token
- Scope: All 7 Custom API Routes + /api/users/login (rate limiting)
- Seed-Guard: NODE_ENV check + warning for non-localhost DB URL
- .env hygiene: rotate secrets, check .gitignore, update .env.example
- Optimistic Locking: version number field on Anfragen (starts at 1, admin readOnly)
- beforeChange hook: check data.version === existing.version, on mismatch: 409 Conflict
- UI: Toast warning + Reload button
- Only relevant in Admin, not Kunden-Dashboard

### Claude's Discretion
- Exact Payload Global field configuration (field names, validation)
- Custom Admin Page layout details and styling
- Payload migration for cent conversion (migration script structure)
- Concurrency strategy for Nummernkreise (Transaction vs. findOneAndUpdate)
- Rate-limit store cleanup interval (memory leak prevention)
- CSRF token generation and cookie configuration (httpOnly, sameSite, secure)

### Deferred Ideas (OUT OF SCOPE)
- E-Mail settings page with toggles (ADMN-F01) -- v1.5+
- Security events collection for auditable logs -- later phase, console.warn sufficient for now
- Modal with diff on optimistic locking conflict -- overkill for current volume
- IP blocklisting after repeated rate-limit hits -- not needed for current threat model
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Admin kann .env aus Git-History entfernen, alle Secrets rotieren und .env.example bereitstellen | .env is NOT in git history (verified). .env.example IS tracked but incorrectly listed in .gitignore. Fix .gitignore, update .env.example with categories and comments, document secret rotation procedure. |
| SEC-02 | System hat Rate Limiting auf Login (5/min), Anfrage-Submit (3/min), Status-Pruefen (10/min), Rabattcode (10/min) | In-memory Map with sliding window. Middleware approach for /api/users/login, withRateLimit wrapper for custom routes. 6 API routes + 1 Payload route to protect. |
| SEC-03 | Alle mutierenden API-Routes haben CSRF-Schutz (nicht nur Stripe Checkout) | Existing isSameOriginOrReferer + validateCsrfToken in security.ts. Only /api/stripe/checkout uses CSRF currently. Need to add to: anfrage/submit, anfrage/validate-discount, anfrage/calculate-price, status-pruefen. Stripe webhook excluded (uses Stripe signature). |
| SEC-04 | Seed-Script bricht in Production ab (NODE_ENV-Guard) | Add guard at top of src/seed/index.ts. Check NODE_ENV and DATABASE_URL hostname. |
| BASE-01 | Einstellungen als Payload Global (Firmendaten, MwSt-Satz, Stripe-Config, Zahlungslink-Ablaufzeit, Angebots-Gueltigkeit) | Payload Global pattern proven (3 existing globals). Settings Global + Custom Admin Page with 4 tabs. getSettings() helper caching per-request. |
| BASE-02 | Zentrale MwSt-Berechnung in lib/tax.ts (Cent-Integer-Arithmetik, konfigurierbarer Satz aus Settings) | Pure functional helpers with Math.round for cent arithmetic. Migration of all existing price fields (preisregeln, seed data, anfragen.gesamtpreis, produkte.einzelpreis, calculate-price API, cart store, stripe integration). |
| BASE-03 | Nummernkreise als Counter-Table (ANG-YYYY-NNN, RE-YYYY-NNN, GS-YYYY-NNN -- fortlaufend, lueckenlos) | Payload Collection with Payload Transaction for atomic increment. Existing generateAnfrageNummer pattern (query-max+1) is NOT gap-free under concurrency -- Nummernkreise replaces this pattern. |
| BASE-04 | Optimistic Locking bei Status-Aenderung (Versionsnummer auf Anfrage, Konflikt-Warnung bei gleichzeitiger Bearbeitung) | version field on Anfragen collection, beforeChange hook comparison. Custom admin UI toast for 409 responses. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.79.0 | CMS framework (Globals, Collections, Hooks, Transactions) | Already installed, project foundation |
| @payloadcms/db-postgres | 3.79.0 | PostgreSQL adapter with transaction support | Already installed, provides beginTransaction/commit/rollback |
| next | 15.4.11 | Framework (Middleware for rate limiting, API routes) | Already installed |
| zod | 4.3.6 | Schema validation for API inputs | Already installed, used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.11 | Cart store (needs cent migration) | Already installed, existing cart store |
| stripe | 20.4.1 | Payment integration (unit_amount already expects cents) | Already installed, already uses Math.round(price*100) |
| jest | 30.2.0 | Unit testing | Already installed with 37 existing tests |
| ts-jest | 29.4.6 | TypeScript transform for Jest | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory Map rate limiter | @upstash/ratelimit + Redis | Redis needed. Decision locked: single-server Coolify, no Redis. In-memory is correct for this deployment. |
| Payload Transaction for counters | Raw SQL `UPDATE ... RETURNING` | More performant but bypasses Payload hooks/access. Transaction approach stays within Payload API. |
| csrf-csrf npm package | Custom double-submit implementation | Extra dependency. Existing security.ts already has the foundation -- extend it. |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  payload-globals/
    settings.ts             # NEW: Settings Global config (Firmendaten, Steuer, Stripe, Dokumente, E-Mail)
  collections/
    system/
      nummernkreise.ts      # NEW: Counter collection for ANG/RE/GS
  lib/
    settings.ts             # NEW: getSettings() helper -- reads Settings Global
    tax.ts                  # NEW: calcNetFromGross, calcGrossFromNet, calcTax, splitLine
    format-currency.ts      # EXTEND: add formatCents()
    security.ts             # EXTEND: add withCsrf wrapper, generateCsrfToken
    rate-limit.ts           # NEW: in-memory rate limiter with withRateLimit wrapper
    nummernkreise.ts        # NEW: getNextNumber(typ) with atomic transaction
  middleware.ts             # EXTEND: add rate limiting for /api/users/login
  seed/
    index.ts                # EXTEND: add production guard at top
  components/admin/
    settings-page.tsx       # NEW: Custom Admin Page with 4 tabs
    custom-nav.tsx          # EXTEND: add "Einstellungen" to System dropdown
```

### Pattern 1: Payload Global for Settings
**What:** Single-document Global for app-wide configuration
**When to use:** System settings that affect multiple features (tax rate, company data, document config)
**Example:**
```typescript
// Source: Existing pattern in src/payload-globals/webhook-errors.ts
import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Einstellungen',
  admin: {
    group: 'System',
    // Hide default Payload admin view -- we use Custom Page
    hidden: true,
  },
  access: {
    read: ({ req }) => ['admin', 'mitarbeiter', 'viewer'].includes(req.user?.rolle || ''),
    update: ({ req }) => req.user?.rolle === 'admin',
  },
  fields: [
    // Firmendaten group, Steuer group, Stripe group, Dokumente group, E-Mail group
    // Each as a named group field
  ],
}
```

### Pattern 2: getSettings() Helper with No Caching
**What:** Thin helper that reads the current Settings Global value from DB
**When to use:** Any server-side code needing tax rate, company data, etc.
**Example:**
```typescript
// src/lib/settings.ts
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'settings' })
}

// Usage in other files:
const settings = await getSettings()
const taxRate = settings.mwst_satz / 100 // e.g. 19 -> 0.19
```

### Pattern 3: Cent-Integer Arithmetic
**What:** All monetary amounts stored as integer cents, never floats
**When to use:** Every price calculation, storage, display
**Example:**
```typescript
// src/lib/tax.ts
export function calcGrossFromNet(netCents: number, ratePercent: number): number {
  return Math.round(netCents * (1 + ratePercent / 100))
}

export function calcNetFromGross(grossCents: number, ratePercent: number): number {
  return Math.round(grossCents / (1 + ratePercent / 100))
}

export function calcTax(netCents: number, ratePercent: number): number {
  return Math.round(netCents * ratePercent / 100)
}

export function splitLine(unitCents: number, qty: number, ratePercent: number): {
  netCents: number
  taxCents: number
  grossCents: number
} {
  const netCents = unitCents * qty
  const taxCents = calcTax(netCents, ratePercent)
  const grossCents = netCents + taxCents
  return { netCents, taxCents, grossCents }
}
```

### Pattern 4: Atomic Counter with Payload Transaction
**What:** Gap-free sequential number generation using DB transaction
**When to use:** Document numbers (Angebote, Rechnungen, Gutschriften)
**Example:**
```typescript
// src/lib/nummernkreise.ts
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getNextNumber(typ: 'ANG' | 'RE' | 'GS'): Promise<string> {
  const payload = await getPayload({ config })
  const jahr = new Date().getFullYear()
  const transactionID = await payload.db.beginTransaction()

  try {
    // Find or create counter for this type+year
    const existing = await payload.find({
      collection: 'nummernkreise',
      where: {
        typ: { equals: typ },
        jahr: { equals: jahr },
      },
      limit: 1,
      req: { transactionID } as any,
    })

    let nextNum: number
    if (existing.docs.length > 0) {
      const counter = existing.docs[0]
      nextNum = (counter.letzte_nummer || 0) + 1
      await payload.update({
        collection: 'nummernkreise',
        id: counter.id,
        data: { letzte_nummer: nextNum },
        req: { transactionID } as any,
      })
    } else {
      nextNum = 1
      await payload.create({
        collection: 'nummernkreise',
        data: { typ, jahr, letzte_nummer: 1, prefix: `${typ}-${jahr}-` },
        req: { transactionID } as any,
      })
    }

    await payload.db.commitTransaction(transactionID)
    return `${typ}-${jahr}-${String(nextNum).padStart(4, '0')}`
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
```

### Pattern 5: In-Memory Rate Limiter
**What:** Sliding window rate limiter using JavaScript Map
**When to use:** API route protection on single-server deployment
**Example:**
```typescript
// src/lib/rate-limit.ts
interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}

// Higher-order wrapper for API route handlers
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  opts: { limit: number; windowMs: number; keyPrefix: string },
) {
  return async (request: Request): Promise<Response> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const key = `${opts.keyPrefix}:${ip}`
    const result = checkRateLimit(key, opts.limit, opts.windowMs)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
          },
        },
      )
    }

    return handler(request)
  }
}
```

### Pattern 6: CSRF Double-Submit Cookie
**What:** Generate token in cookie + validate via X-CSRF-Token header
**When to use:** All mutating custom API routes (not Stripe webhook which uses its own signature)
**Example:**
```typescript
// Extend src/lib/security.ts

import { randomBytes } from 'crypto'

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

export function withCsrf(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    // Origin check first (existing)
    if (!isSameOriginOrReferer(request)) {
      console.warn('[CSRF] Origin check failed:', request.headers.get('origin'))
      return new Response(JSON.stringify({ error: 'CSRF-Validierung fehlgeschlagen' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    // Double-submit token check
    if (!validateCsrfToken(request)) {
      console.warn('[CSRF] Token validation failed')
      return new Response(JSON.stringify({ error: 'CSRF-Token ungueltig' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return handler(request)
  }
}
```

### Anti-Patterns to Avoid
- **Float arithmetic for money:** `0.1 + 0.2 !== 0.3` in JavaScript. Always use integer cents with Math.round.
- **Query-max-plus-one for sequence numbers:** The existing `generateAnfrageNummer` approach is NOT gap-free under concurrency -- two simultaneous requests can get the same max and collide. Use a transaction-locked counter row instead.
- **Global caching of Settings:** The user explicitly decided "no cache, every API call reads current value from DB." Do not introduce a settings cache.
- **Redis dependency for rate limiting:** Single-server Coolify deployment. In-memory Map is the correct choice. Do not add Redis.
- **Tailwind in Admin components:** Payload Admin Panel does not support Tailwind. Use inline styles or admin-custom.css only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cent rounding | Custom rounding logic | `Math.round()` on integer arithmetic | Standard JS Math.round works perfectly for integer-to-integer operations. No need for a rounding library. |
| Sequential numbers | Query + increment pattern | Payload Transaction with counter row | Existing generateAnfrageNummer is susceptible to race conditions. Transaction-locked counter row is the proven pattern for gap-free sequences. |
| CSRF tokens | Custom crypto scheme | `crypto.randomBytes(32).toString('hex')` | Node.js built-in crypto is sufficient. No need for external CSRF library. |
| .env secret scanning | Manual grep | `git log --all -p -- .env` check | Standard git approach to verify no secrets in history |

**Key insight:** This phase is infrastructure-heavy but uses exclusively built-in capabilities (Node.js crypto, Payload transactions, JavaScript Map, Math.round). Zero new dependencies needed.

## Common Pitfalls

### Pitfall 1: Float-to-Cent Migration Breaking Existing Data
**What goes wrong:** Multiplying float prices by 100 can produce non-integer results (e.g., 249.99 * 100 = 24998.999999...)
**Why it happens:** IEEE 754 floating point representation
**How to avoid:** Always wrap conversion in `Math.round(floatPrice * 100)` during migration
**Warning signs:** Prices displaying as X.99999 or X.00001 after migration

### Pitfall 2: Rate Limiter Memory Leak
**What goes wrong:** Map grows indefinitely with unique IPs, consuming server memory
**Why it happens:** Entries are created but never cleaned up
**How to avoid:** Run a cleanup interval (every 5 minutes) that removes expired entries
**Warning signs:** Slowly increasing memory usage on the Coolify VPS over days/weeks

### Pitfall 3: Transaction Deadlock on Nummernkreise
**What goes wrong:** Two concurrent requests both try to read-then-update the same counter row, causing deadlock or serialization failure
**Why it happens:** PostgreSQL row-level locking during transactions
**How to avoid:** Use a retry loop (2-3 attempts) around the transaction. PostgreSQL will raise a serialization error that can be caught and retried.
**Warning signs:** Intermittent 500 errors on document creation

### Pitfall 4: Middleware Rate Limiting Blocking Legitimate Traffic
**What goes wrong:** Rate limiter uses wrong IP (gets proxy IP instead of client IP)
**Why it happens:** X-Forwarded-For not read correctly behind Coolify/Docker reverse proxy
**How to avoid:** Read `x-forwarded-for` header, split on comma, take first entry (client IP). Coolify uses Traefik which sets this header.
**Warning signs:** All requests appearing to come from the same IP (e.g., 172.17.0.1)

### Pitfall 5: CSRF Token Not Accessible to Frontend
**What goes wrong:** Frontend cannot read the CSRF cookie to send it in the header
**Why it happens:** Cookie set with httpOnly flag, but frontend needs to read it via JavaScript
**How to avoid:** The CSRF cookie must NOT be httpOnly (it needs to be readable by JS). The auth cookie (payload-token) stays httpOnly. Set CSRF cookie with: `httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/'`
**Warning signs:** All POST requests failing with 403 CSRF error

### Pitfall 6: Optimistic Locking Version Mismatch After Save
**What goes wrong:** After successfully saving, the admin UI still has the old version number and subsequent saves fail
**Why it happens:** The UI needs to update its local version after successful save
**How to avoid:** The Payload response includes the updated document -- the UI must read the new version from the response
**Warning signs:** Every second save attempt fails with 409

### Pitfall 7: .env.example in .gitignore
**What goes wrong:** New developers cannot see required environment variables
**Why it happens:** Current .gitignore includes `.env.example` -- this is wrong
**How to avoid:** Remove `.env.example` from .gitignore. It should be committed to git.
**Warning signs:** .env.example not visible in repository clone

## Code Examples

### Settings Global Field Configuration
```typescript
// Source: Pattern from existing webhook-errors.ts + navigation.ts
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Einstellungen',
  admin: {
    group: 'System',
    hidden: true, // We use a custom admin page, not the default global view
  },
  access: {
    read: ({ req }) => ['admin', 'mitarbeiter', 'viewer'].includes(req.user?.rolle || ''),
    update: ({ req }) => req.user?.rolle === 'admin',
  },
  fields: [
    // --- Firmendaten ---
    { name: 'firmenname', type: 'text', label: 'Firmenname' },
    { name: 'adresse_strasse', type: 'text', label: 'Strasse' },
    { name: 'adresse_plz', type: 'text', label: 'PLZ' },
    { name: 'adresse_ort', type: 'text', label: 'Ort' },
    { name: 'adresse_land', type: 'text', label: 'Land', defaultValue: 'Paraguay' },
    { name: 'telefon', type: 'text', label: 'Telefon' },
    { name: 'email', type: 'email', label: 'E-Mail' },
    { name: 'steuernummer', type: 'text', label: 'Steuernummer' },
    { name: 'ust_id', type: 'text', label: 'USt-IdNr.' },
    { name: 'bank_iban', type: 'text', label: 'IBAN' },
    { name: 'bank_bic', type: 'text', label: 'BIC' },
    { name: 'bank_name', type: 'text', label: 'Bank-Name' },

    // --- Steuer ---
    { name: 'mwst_satz', type: 'number', label: 'MwSt-Satz (%)', defaultValue: 19, required: true },
    {
      name: 'preisanzeige',
      type: 'select',
      label: 'Preisanzeige',
      defaultValue: 'brutto',
      options: [
        { label: 'Brutto (inkl. MwSt)', value: 'brutto' },
        { label: 'Netto (zzgl. MwSt)', value: 'netto' },
      ],
    },

    // --- Stripe ---
    { name: 'stripe_zahlungslink_ablauf_stunden', type: 'number', label: 'Zahlungslink-Ablaufzeit (Stunden)', defaultValue: 24 },
    {
      name: 'stripe_waehrung',
      type: 'select',
      label: 'Waehrung',
      defaultValue: 'eur',
      options: [
        { label: 'EUR', value: 'eur' },
        { label: 'USD', value: 'usd' },
        { label: 'PYG', value: 'pyg' },
      ],
    },
    { name: 'stripe_modus_info', type: 'text', label: 'Stripe-Modus', admin: { readOnly: true, description: 'Keys werden in .env konfiguriert' } },

    // --- Dokumente ---
    { name: 'angebots_gueltigkeit_tage', type: 'number', label: 'Angebots-Gueltigkeit (Tage)', defaultValue: 30 },
    { name: 'widerrufsbelehrung', type: 'textarea', label: 'Widerrufsbelehrung' },
    { name: 'agb_link', type: 'text', label: 'AGB-Link' },
    { name: 'agb_pdf', type: 'upload', label: 'AGB als PDF', relationTo: 'media' },
    { name: 'pdf_logo', type: 'upload', label: 'Logo fuer PDFs', relationTo: 'media' },

    // --- E-Mail (vorbereitet fuer Phase 25) ---
    { name: 'email_absender_name', type: 'text', label: 'E-Mail Absender-Name' },
    { name: 'email_reply_to', type: 'email', label: 'Reply-To Adresse' },
    { name: 'email_signatur', type: 'textarea', label: 'E-Mail-Signatur' },

    // --- Meta ---
    { name: 'zuletzt_aktualisiert_am', type: 'date', label: 'Zuletzt aktualisiert', admin: { readOnly: true } },
    { name: 'zuletzt_aktualisiert_von', type: 'relationship', label: 'Aktualisiert von', relationTo: 'users', admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data) {
          data.zuletzt_aktualisiert_am = new Date().toISOString()
          data.zuletzt_aktualisiert_von = req.user?.id
        }
        return data
      },
    ],
  },
}
```

### Nummernkreise Collection
```typescript
// Source: Designed for this project based on Payload Collection pattern
import type { CollectionConfig } from 'payload'

export const Nummernkreise: CollectionConfig = {
  slug: 'nummernkreise',
  labels: { singular: 'Nummernkreis', plural: 'Nummernkreise' },
  admin: {
    group: 'System',
    useAsTitle: 'prefix',
    hidden: false, // Visible via URL but not in main nav
  },
  access: {
    read: ({ req }) => req.user?.rolle === 'admin',
    create: ({ req }) => req.user?.rolle === 'admin',
    update: ({ req }) => req.user?.rolle === 'admin',
    delete: () => false, // Never delete counters
  },
  fields: [
    { name: 'typ', type: 'select', required: true, options: [
      { label: 'Angebot', value: 'ANG' },
      { label: 'Rechnung', value: 'RE' },
      { label: 'Gutschrift', value: 'GS' },
    ]},
    { name: 'jahr', type: 'number', required: true },
    { name: 'letzte_nummer', type: 'number', required: true, defaultValue: 0 },
    { name: 'prefix', type: 'text', required: true }, // e.g. "ANG-2026-"
  ],
}
```

### Optimistic Locking beforeChange Hook
```typescript
// Inside Anfragen collection hooks.beforeChange
async ({ data, originalDoc, operation }) => {
  if (operation !== 'update' || !originalDoc || !data) return data

  // Optimistic Locking: compare versions
  if (data.version !== undefined && originalDoc.version !== undefined) {
    if (data.version !== originalDoc.version) {
      throw new APIError(
        'Diese Anfrage wurde zwischenzeitlich geaendert. Bitte laden Sie die Seite neu.',
        409,
      )
    }
  }

  // Increment version on every update
  data.version = (originalDoc.version || 1) + 1

  return data
}
```

### Production Guard for Seed Script
```typescript
// Top of src/seed/index.ts (before any imports that connect to DB)
if (process.env.NODE_ENV === 'production') {
  console.error('FATAL: Seed-Script darf nicht in Production ausgefuehrt werden!')
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL || ''
if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
  console.warn(
    'WARNUNG: DATABASE_URL zeigt nicht auf localhost. Sind Sie sicher? (Ctrl+C zum Abbrechen, 5 Sekunden Wartezeit...)'
  )
  await new Promise(resolve => setTimeout(resolve, 5000))
}
```

### formatCents Helper
```typescript
// Extension to src/lib/format-currency.ts
export function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Float EUR prices | Integer cent prices | Phase 24 | All price fields, calculations, display, and Stripe integration must use cents |
| Query-max+1 for ANF numbers | Transaction-locked counter table | Phase 24 | generateAnfrageNummer replaced by getNextNumber via Nummernkreise |
| CSRF only on Stripe checkout | CSRF on all mutating routes | Phase 24 | 4 additional API routes get CSRF protection |
| No rate limiting | Per-route rate limiting | Phase 24 | Login, submit, status-check, discount routes protected |
| No optimistic locking | Version-based locking on Anfragen | Phase 24 | Concurrent edit conflicts detected and surfaced to user |

**Deprecated/outdated:**
- `generateAnfrageNummer()` in `src/lib/anfrage/anfrage-nummer.ts`: Will be replaced by `getNextNumber('ANG')` from `lib/nummernkreise.ts`. The old function uses non-atomic query-max-plus-one pattern.
- `Math.round(gesamtpreis * 100)` in `src/lib/stripe.ts`: After cent migration, `gesamtpreis` will already be in cents. The Stripe `unit_amount` assignment changes from `Math.round(gesamtpreis * 100)` to just `gesamtpreis` (already cents).
- `Math.round(preis * 100) / 100` in `src/lib/anfrage/price-server.ts`: After cent migration, all arithmetic is in integer cents. No more float rounding at the end.

## Open Questions

1. **ANF nummer migration to Nummernkreise**
   - What we know: Existing anfrage_nummer uses format `ANF-YYYY-NNN` (3-digit). Nummernkreise uses 4-digit `ANG-YYYY-NNNN`. The prefix also changes from `ANF` to `ANG`.
   - What's unclear: Should existing ANF-prefixed numbers be migrated or kept as-is? Should the Nummernkreise counter be initialized to the max existing ANF number?
   - Recommendation: Keep existing ANF numbers as-is (immutable historical data). Initialize the ANG counter to 0 (new system starts fresh). The anfrage submission route switches to getNextNumber('ANG'). This is a clean break.

2. **Preisanzeige brutto/netto impact on frontend**
   - What we know: Settings will have a `preisanzeige` toggle. Prices in DB are stored as net cents.
   - What's unclear: Does this toggle affect the Konfigurator display in this phase, or only future phases?
   - Recommendation: Phase 24 builds the toggle and the formatting helpers. Actual integration into Konfigurator/Cart display is deferred to when those components are next touched. The helpers should support both modes.

3. **Existing Anfragen gesamtpreis migration**
   - What we know: Existing Anfragen have float EUR gesamtpreis values. Need to become cent integers.
   - What's unclear: How many existing Anfragen are in the database? Can we do a DB migration or is a Payload script better?
   - Recommendation: Use a Payload migration script that reads all Anfragen and updates gesamtpreis = Math.round(gesamtpreis * 100). Same for produkte[].einzelpreis. Run before deploying the new code.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` (exists) |
| Quick run command | `npx jest --testPathPattern="test-name" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | .env.example exists, .gitignore correct | manual | Manual verification | N/A |
| SEC-02 | Rate limiter enforces limits per IP | unit | `npx jest --testPathPattern="test-rate-limit" --no-coverage -x` | Wave 0 |
| SEC-03 | CSRF rejects requests without valid token | unit | `npx jest --testPathPattern="test-csrf" --no-coverage -x` | Wave 0 |
| SEC-04 | Seed guard rejects production environment | unit | `npx jest --testPathPattern="test-seed-guard" --no-coverage -x` | Wave 0 |
| BASE-01 | getSettings() returns Settings Global data | unit | `npx jest --testPathPattern="test-settings" --no-coverage -x` | Wave 0 |
| BASE-02 | Tax calculations are cent-precise | unit | `npx jest --testPathPattern="test-tax" --no-coverage -x` | Wave 0 |
| BASE-03 | getNextNumber produces sequential gap-free numbers | unit | `npx jest --testPathPattern="test-nummernkreise" --no-coverage -x` | Wave 0 |
| BASE-04 | Optimistic locking rejects stale version | unit | `npx jest --testPathPattern="test-optimistic-lock" --no-coverage -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="<relevant-test>" --no-coverage -x`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-tax.test.ts` -- covers BASE-02 (calcNetFromGross, calcGrossFromNet, calcTax, splitLine)
- [ ] `tests/unit/test-rate-limit.test.ts` -- covers SEC-02 (checkRateLimit, withRateLimit wrapper)
- [ ] `tests/unit/test-csrf.test.ts` -- covers SEC-03 (withCsrf, generateCsrfToken, validateCsrfToken)
- [ ] `tests/unit/test-seed-guard.test.ts` -- covers SEC-04 (production guard logic)
- [ ] `tests/unit/test-settings.test.ts` -- covers BASE-01 (getSettings helper)
- [ ] `tests/unit/test-nummernkreise.test.ts` -- covers BASE-03 (getNextNumber, year rollover)
- [ ] `tests/unit/test-optimistic-lock.test.ts` -- covers BASE-04 (version comparison logic)
- [ ] `tests/unit/test-format-cents.test.ts` -- covers BASE-02 (formatCents function)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/payload-globals/webhook-errors.ts`, `src/payload-globals/navigation.ts`, `src/payload-globals/footer.ts` -- Payload Global pattern
- Existing codebase: `src/lib/security.ts` -- CSRF foundation (isSameOriginOrReferer, validateCsrfToken)
- Existing codebase: `src/lib/format-currency.ts` -- Currency formatting pattern
- Existing codebase: `src/middleware.ts` -- Existing middleware structure for rate limiting integration
- Existing codebase: `src/seed/index.ts` -- Seed script needing production guard
- Existing codebase: `src/collections/business/anfragen.ts` -- Anfragen collection (price fields, hooks)
- Existing codebase: `src/lib/anfrage/price-server.ts` -- Server-side price calculation (float, needs cent migration)
- Existing codebase: `src/payload.config.ts` -- Payload config (globals array, collections array)
- Existing codebase: 6 API route files verified -- all candidates for CSRF/rate limiting
- [Payload CMS Transactions docs](https://payloadcms.com/docs/database/transactions) -- beginTransaction, commitTransaction, rollbackTransaction, req.transactionID pattern
- [Payload CMS Local API](https://payloadcms.com/docs/local-api/overview) -- findGlobal, updateGlobal API
- [Payload CMS Globals Config](https://payloadcms.com/docs/configuration/globals) -- GlobalConfig type, fields, access, hooks

### Secondary (MEDIUM confidence)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) -- Double-submit cookie pattern
- [Next.js middleware rate limiting patterns](https://www.freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs/) -- In-memory Map approach, IP extraction from X-Forwarded-For
- Git verification: `.env` is NOT in git history (verified via `git log --all -- .env`), `.env.example` IS tracked, `.gitignore` incorrectly includes `.env.example`

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use, versions verified from package.json
- Architecture: HIGH -- patterns directly derived from existing codebase (3 globals, 37 tests, 6 API routes)
- Pitfalls: HIGH -- derived from examining actual code (float prices in price-server.ts, non-atomic anfrage-nummer generation, CSRF only on 1 of 6 routes)
- Validation: HIGH -- Jest 30.2.0 already configured with 37 tests, tsconfig.jest.json exists

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- Payload 3.79, no major version changes expected)
