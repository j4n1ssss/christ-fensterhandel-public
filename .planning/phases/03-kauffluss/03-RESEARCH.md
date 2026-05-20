# Phase 3: Kauffluss - Research

**Researched:** 2026-03-09
**Domain:** Shopping Cart + Server-side Pricing + Inquiry Submission (Next.js App Router + Zustand + Payload CMS)
**Confidence:** HIGH

## Summary

Phase 3 builds the complete purchase flow: a Zustand-persisted shopping cart on a dedicated `/warenkorb` page, server-side price calculation via Next.js Route Handlers using Payload Local API, discount code validation against the existing `rabattcodes` collection, a multi-step inquiry submission flow (cart review, contact form, summary, confirmation), and storing the frozen inquiry in the existing `anfragen` collection.

All CMS collections needed (anfragen, rabattcodes, preisregeln, status_historie) already exist from Phase 1. The client-side price calculator (`calculatePreviewPrice`) and configurator types (`KonfiguratorSelections`, `CMSData`) exist from Phase 2. The core work is: (1) new Zustand cart store, (2) 3 new API routes for price calculation, discount validation, and inquiry submission, (3) 4 new pages (/warenkorb, /anfrage, /anfrage/zusammenfassung, /anfrage/danke), and (4) navigation badge integration.

**Primary recommendation:** Create a separate `useCartStore` (not extend the konfigurator store) with its own LocalStorage key. Reuse `calculatePreviewPrice` for client display, but duplicate the logic server-side in a `calculateServerPrice` function that reads CMS data via Payload Local API (not client REST calls). Use Zod v4 schemas shared between client forms and server validation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Eigene /warenkorb Seite (kein Drawer/Overlay)
- Warenkorb-Icon in der Navigation mit Badge-Zaehler (Anzahl Produkte)
- Kompakte Produktkarte mit Mini-SVG links (WindowSVG aus Phase 2 wiederverwenden) + Infos rechts (Profil, Masse, Farbe, Preis)
- Details per Aufklappen sichtbar (alle Konfigurations-Optionen)
- Stueckzahl direkt in der Karte aenderbar (+/- Buttons)
- "Bearbeiten" oeffnet Konfigurator mit allen Auswahlen vorausgefuellt, "Aktualisieren" ueberschreibt das Produkt im Warenkorb
- "Loeschen" entfernt Produkt mit Bestaetigung
- Warenkorb wird nach erfolgreichem Absenden komplett geleert
- Persistenz via Zustand + LocalStorage (gleicher Ansatz wie Konfigurator-Store)
- Gesamtpreis pro Produkt prominent sichtbar, aufklappbare Detail-Aufschluesselung
- Preis-Label: "Preisvorschau: 1.234,00 EUR*" mit Fussnote
- Einzelpreis + Zwischensumme bei Stueckzahl > 1
- MwSt separat ausgewiesen: Zwischensumme (netto), + 19% MwSt, = Gesamtbetrag (brutto)
- Server-seitige Preisberechnung beim Absenden liefert den verbindlichen Preis
- Rabattcode: Eingabefeld im Warenkorb, maximal ein Code pro Anfrage, spezifische Fehlermeldungen
- Erfolgreiche Rabatt-Anwendung: Alter Preis durchgestrichen + neuer Preis in Gruen
- 3-Schritt-Flow: (1) Warenkorb pruefen -> (2) Kontaktformular -> (3) Zusammenfassung + Absenden
- Kontaktformular Pflichtfelder: Vorname, Nachname, E-Mail, Datenschutz-Checkbox
- Kontaktformular optionale Felder: Telefon, Adresse (Strasse, PLZ, Ort), Nachricht
- Server-seitige Zod-Validierung aller Kontaktdaten
- Reiner Gast-Flow (kein Login/Account)
- Anfrage wird in CMS gespeichert mit Status "NEU" + eingefrorener Konfigurations-Snapshot (JSON)
- Danke-Seite: Anfrage-Nummer, Zusammenfassung, naechste Schritte, "Neue Konfiguration starten" Button

### Claude's Discretion
- Warenkorb-Store Architektur (eigener Zustand-Store vs. Erweiterung des Konfigurator-Stores)
- API-Route Struktur fuer Server-seitige Preisberechnung und Anfrage-Erstellung
- Exakte Zod-Schemas fuer Server-Validierung
- Snapshot-JSON-Struktur (welche Felder eingefroren werden)
- Konfigurator-Wiederherstellung beim "Bearbeiten" (URL-Params vs. Store-Injection)
- Zusammenfassungs-Schritt Layout und Darstellung
- Loading-States beim Absenden

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CART-01 | User kann konfiguriertes Produkt zum Warenkorb hinzufuegen | Cart store with `addItem()`, cart item type holding full KonfiguratorSelections + preview price + unique ID |
| CART-02 | User kann Stueckzahl pro Produkt aendern | Cart store `updateQuantity(itemId, qty)`, +/- buttons in CartItemCard |
| CART-03 | User kann Produkt bearbeiten (zurueck in Konfigurator mit Daten) | Store-injection pattern: load cart item selections into konfigurator store, navigate to konfigurator, on complete replace cart item |
| CART-04 | User kann Produkt aus Warenkorb loeschen | Cart store `removeItem(itemId)` with confirmation dialog (Shadcn AlertDialog) |
| CART-05 | User kann weiteres Produkt hinzufuegen (neuer Konfigurator-Durchlauf) | Konfigurator resetAll() + navigate to konfigurator, on complete addItem to cart |
| CART-06 | Warenkorb zeigt Zwischensumme aller Produkte | Computed `getSubtotal()` derived from item prices * quantities |
| PREIS-01 | Client-seitige Preisvorschau | Reuse existing `calculatePreviewPrice()` from Phase 2 |
| PREIS-02 | Server-seitige verbindliche Preisberechnung | New API route `/api/anfrage/calculate-price` using Payload Local API + server price calculator |
| PREIS-03 | Preisregeln aus CMS | Already available via preisregeln collection; server reads via `payload.find()` |
| PREIS-04 | Rabattcode-Validierung | New API route `/api/anfrage/validate-discount` checking rabattcodes collection fields |
| PREIS-05 | Konfigurations-Snapshot wird bei Absenden als JSON eingefroren | Snapshot = KonfiguratorSelections + resolved display names + server-calculated price |
| SEND-01 | Kontaktformular | React Hook Form + Zod on `/anfrage` page |
| SEND-02 | Server-seitige Validierung aller Kontaktdaten | Shared Zod schema used in both client form and API route |
| SEND-03 | Anfrage wird in CMS gespeichert mit Status "NEU" und Snapshot | API route `/api/anfrage/submit` creates Anfragen doc via Payload Local API |
| SEND-04 | Weiterleitung zur Danke-Seite mit Bestaetigungs-Info | Return anfrage_nummer from API, redirect to `/anfrage/danke?nr={nummer}` |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | Cart state + LocalStorage persistence | Already used for konfigurator store, same pattern |
| zod | 4.3.6 | Server + client validation schemas | Already used in Phase 2, Zod v4 with `import { z } from 'zod'` |
| react-hook-form | 7.71.2 | Contact form | Already used in konfigurator steps |
| @hookform/resolvers | 5.2.2 | Zod resolver for RHF | Already installed |
| payload | 3.79.0 | Local API for server-side CMS operations | Payload Local API for create/find in Route Handlers |
| lucide-react | 0.577.0 | Icons (ShoppingCart, Plus, Minus, Trash, etc.) | Already installed |
| next | 15.4.11 | Route Handlers for API endpoints | Already the framework |

### Supporting (no new installs needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | 0.7.1 | Button/card variants | Cart item card styling |
| tailwind-merge | 3.5.0 | Class merging via cn() | All component styling |
| nuqs | 2.8.9 | URL state for danke page query param | `/anfrage/danke?nr=ANF-2026-001` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate cart store | Extend konfigurator store | Separate is cleaner - konfigurator store is already complex, cart has different lifecycle |
| Next.js Route Handlers | Server Actions | Route Handlers better for explicit REST-like endpoints with clear request/response; Server Actions are form-centric |
| LocalStorage (Zustand persist) | Cookie-based cart | LocalStorage is simpler, no server overhead, guest-only flow makes cookies unnecessary |

**Installation:** No new packages needed. Everything is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── cart/
│       ├── store.ts              # Zustand cart store with persist
│       ├── types.ts              # CartItem, CartState interfaces
│       └── format.ts             # Price formatting helpers (EUR, MwSt)
├── lib/
│   └── anfrage/
│       ├── schemas.ts            # Shared Zod schemas (contact, submission)
│       ├── price-server.ts       # Server-side price calculation
│       └── anfrage-nummer.ts     # Generate unique ANF-YYYY-NNN numbers
├── components/
│   └── cart/
│       ├── cart-item-card.tsx     # Single product card with mini-SVG
│       ├── cart-summary.tsx       # Subtotal, MwSt, total, discount
│       ├── discount-input.tsx     # Rabattcode input + validation
│       ├── cart-badge.tsx         # Navigation badge (item count)
│       └── cart-empty.tsx         # Empty state
│   └── anfrage/
│       ├── contact-form.tsx       # RHF contact form
│       ├── anfrage-summary.tsx    # Final summary before submit
│       └── danke-content.tsx      # Thank you page content
├── app/
│   └── (frontend)/
│       ├── warenkorb/
│       │   └── page.tsx           # Cart page (Step 1 of flow)
│       ├── anfrage/
│       │   ├── page.tsx           # Contact form (Step 2)
│       │   ├── zusammenfassung/
│       │   │   └── page.tsx       # Summary + submit (Step 3)
│       │   └── danke/
│       │       └── page.tsx       # Thank you page
│       └── layout.tsx             # Add navigation with cart badge
│   └── api/
│       └── anfrage/
│           ├── calculate-price/
│           │   └── route.ts       # Server price calculation
│           ├── validate-discount/
│           │   └── route.ts       # Discount code validation
│           └── submit/
│               └── route.ts       # Submit inquiry (create Anfrage)
```

### Pattern 1: Separate Cart Store (Zustand + persist)
**What:** Independent Zustand store for cart items, separate from konfigurator store
**When to use:** Always -- cart has different lifecycle than configurator
**Example:**
```typescript
// src/lib/cart/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartStore {
  items: CartItem[]
  discountCode: string | null
  discountResult: DiscountResult | null
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateItem: (itemId: string, updated: CartItem) => void
  setDiscount: (code: string | null, result: DiscountResult | null) => void
  clearCart: () => void
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,
      discountResult: null,
      // ... actions
    }),
    {
      name: 'christ-warenkorb',
      skipHydration: true,  // Same SSR pattern as konfigurator store
    }
  )
)
```

### Pattern 2: Server-side Price Calculation via Payload Local API
**What:** API Route Handler that uses Payload Local API to fetch CMS data and calculate authoritative price
**When to use:** When submitting inquiry -- client prices are preview only
**Example:**
```typescript
// src/app/api/anfrage/calculate-price/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const body = await request.json()
  // Validate with Zod, then calculate using CMS data from payload.find()
  const preisregeln = await payload.find({ collection: 'preisregeln', limit: 100 })
  // ... calculate price server-side
  return Response.json({ preis: calculatedPrice })
}
```

### Pattern 3: Cart Item Edit via Store Injection
**What:** When user clicks "Bearbeiten", inject cart item selections into konfigurator store, navigate to konfigurator with edit mode flag
**When to use:** CART-03 (edit product in cart)
**Example:**
```typescript
// In cart-item-card.tsx "Bearbeiten" handler:
const handleEdit = (item: CartItem) => {
  const konfStore = useKonfiguratorStore.getState()
  // Load all selections from cart item into konfigurator store
  Object.entries(item.selections).forEach(([key, value]) => {
    konfStore.setSelection(key as keyof KonfiguratorSelections, value)
  })
  konfStore.setStep(10) // Go to summary to review
  // Store editingItemId so konfigurator knows to update instead of add
  cartStore.getState().setEditingItemId(item.id)
  router.push('/konfigurator/fenster')
}
```

### Pattern 4: Anfrage-Nummer Generation
**What:** Sequential, human-readable inquiry number like ANF-2026-001
**When to use:** When creating new Anfrage in CMS
**Example:**
```typescript
// src/lib/anfrage/anfrage-nummer.ts
export async function generateAnfrageNummer(payload: Payload): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `ANF-${year}-`
  const latest = await payload.find({
    collection: 'anfragen',
    where: { anfrage_nummer: { like: prefix } },
    sort: '-createdAt',
    limit: 1,
  })
  const lastNum = latest.docs[0]
    ? parseInt(latest.docs[0].anfrage_nummer.replace(prefix, ''), 10)
    : 0
  return `${prefix}${String(lastNum + 1).padStart(3, '0')}`
}
```

### Pattern 5: Shared Zod Schema (Client + Server)
**What:** Define Zod schemas in a shared file, import in both RHF form and Route Handler
**When to use:** Contact form validation (SEND-01 + SEND-02)
**Example:**
```typescript
// src/lib/anfrage/schemas.ts
import { z } from 'zod'

export const kontaktSchema = z.object({
  vorname: z.string().min(1, 'Vorname ist erforderlich'),
  nachname: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.email('Bitte gueltige E-Mail eingeben'),
  telefon: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  nachricht: z.string().optional(),
  datenschutz: z.literal(true, { message: 'Datenschutzerklaerung muss akzeptiert werden' }),
})

export type KontaktFormData = z.infer<typeof kontaktSchema>
```

### Anti-Patterns to Avoid
- **Extending konfigurator store with cart logic:** The konfigurator store handles step navigation, CMS data, and selections for one configuration. Cart needs to hold multiple completed configurations. Keep them separate.
- **Client-side price as source of truth:** Client-calculated prices are labeled "Preisvorschau" explicitly. The server recalculates on submission. Never trust client prices for the stored Anfrage.
- **Storing CMS IDs without display names in snapshot:** The snapshot must be self-contained. If a CMS item is later renamed or deleted, the snapshot should still show what was ordered. Include both IDs and resolved names.
- **Using Server Actions for the submit flow:** Route Handlers are more explicit for this use case. Server Actions are better for simple form mutations, not multi-step flows with complex response handling.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Price formatting (EUR) | Custom string concatenation | `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })` | Handles thousands separator, decimal comma, edge cases |
| Confirmation dialog | Custom modal | Shadcn AlertDialog | Already in the project UI kit |
| Form validation | Manual if/else | Zod v4 schema + RHF zodResolver | Already established pattern |
| Unique IDs for cart items | Custom counter | `crypto.randomUUID()` | Built into browser and Node, no dependency |
| Collapsible details | Custom accordion | Shadcn Collapsible or Accordion | Already available |
| Loading spinner | Custom animation | Shadcn Button with `disabled` + Lucide Loader2 icon | Consistent with existing UI |

**Key insight:** This phase introduces no new libraries. Every tool needed is already installed. The work is wiring existing patterns (Zustand persist, Zod, RHF, Payload Local API) into new pages and routes.

## Common Pitfalls

### Pitfall 1: Zustand Hydration Mismatch with Cart Badge in Navigation
**What goes wrong:** Cart badge shows item count in SSR (0) but different count after hydration from LocalStorage, causing flash.
**Why it happens:** Zustand persist loads from LocalStorage only on client. During SSR, store is empty.
**How to avoid:** Use `skipHydration: true` (already the established pattern) and call `useCartStore.persist.rehydrate()` in a client-side useEffect. Show badge only after hydration.
**Warning signs:** Console hydration mismatch warning, badge flickering between 0 and actual count.

### Pitfall 2: Race Condition on Discount Code Validation
**What goes wrong:** User applies discount, then changes cart (removes item), discount min_bestellwert no longer met but UI still shows discount.
**Why it happens:** Discount validation result cached in store, not re-validated when cart changes.
**How to avoid:** Clear discount result when cart items change. Re-validate on submission server-side regardless. Server is the authority.
**Warning signs:** Discount shown but server rejects on submit.

### Pitfall 3: Stale CMS Data in Client Price Preview
**What goes wrong:** Client shows preview price based on CMS data loaded when configurator started. If session is long, prices may have changed in CMS.
**Why it happens:** CMS data is loaded once into konfigurator store and cached.
**How to avoid:** Label as "Preisvorschau" (already decided). Server recalculates on submission with fresh CMS data. No fix needed for preview, just clear labeling.
**Warning signs:** None visible to user -- this is by design.

### Pitfall 4: Snapshot Not Self-Contained
**What goes wrong:** Snapshot stores only CMS IDs. Admin later views Anfrage but CMS item was renamed/deleted. Display breaks.
**Why it happens:** Snapshot referenced live CMS data instead of freezing values.
**How to avoid:** Snapshot must include: all selection IDs, all resolved display names (Produkttyp name, Material name, Profil name, etc.), dimensions, colors with names, all option names, and the final calculated price. The snapshot is the permanent record.
**Warning signs:** Any CMS ID in the snapshot without an accompanying human-readable name.

### Pitfall 5: Anfrage-Nummer Collision Under Concurrent Requests
**What goes wrong:** Two users submit at the same time, both get the same ANF-2026-XXX number.
**Why it happens:** Read-then-write pattern without locking.
**How to avoid:** Use Payload's `unique: true` constraint on anfrage_nummer (already set). If creation fails with duplicate, retry with incremented number. Alternatively, generate based on timestamp + random suffix (e.g., `ANF-2026-0309-A7B3`).
**Warning signs:** Payload throws unique constraint error on create.

### Pitfall 6: Zod v4 API Differences
**What goes wrong:** Using Zod v3 patterns that changed in v4.
**Why it happens:** Most online examples are for Zod v3.
**How to avoid:** The project already uses `import { z } from 'zod'` with v4 successfully. Key v4 pattern: `z.email()` instead of `z.string().email()`. Stick to patterns already established in `schemas.ts`. The `zodResolver` from `@hookform/resolvers/zod` at v5.2.2 supports Zod v4.
**Warning signs:** TypeScript errors on schema definitions, runtime validation failures.

## Code Examples

### Cart Item Type Definition
```typescript
// src/lib/cart/types.ts
import type { KonfiguratorSelections } from '@/lib/konfigurator/types'

export interface CartItem {
  id: string                           // crypto.randomUUID()
  selections: KonfiguratorSelections   // Full configurator selections
  resolvedNames: ResolvedNames         // Human-readable names for display
  previewPrice: number                 // Client-calculated preview price
  quantity: number                     // Default 1
  addedAt: string                      // ISO timestamp
}

export interface ResolvedNames {
  produkttyp: string
  material: string
  profil: string
  fluegelanzahl: string
  fensterform: string
  farbeAussen: string
  farbeInnen: string
  verglasung: string
  masse: { breite: number; hoehe: number }
  // ... other resolved display names
}

export interface DiscountResult {
  valid: boolean
  code: string
  typ: 'prozent' | 'festbetrag'
  wert: number
  error?: string  // 'abgelaufen' | 'aufgebraucht' | 'min_bestellwert' | 'ungueltig'
}
```

### Server-side Discount Validation
```typescript
// src/app/api/anfrage/validate-discount/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { code, subtotal } = await request.json()

  const result = await payload.find({
    collection: 'rabattcodes',
    where: { code: { equals: code }, aktiv: { equals: true } },
    limit: 1,
  })

  if (result.docs.length === 0) {
    return Response.json({ valid: false, error: 'ungueltig' })
  }

  const rabatt = result.docs[0]
  const now = new Date()

  if (rabatt.gueltig_bis && new Date(rabatt.gueltig_bis) < now) {
    return Response.json({ valid: false, error: 'abgelaufen' })
  }
  if (rabatt.max_nutzungen && rabatt.aktuelle_nutzungen! >= rabatt.max_nutzungen) {
    return Response.json({ valid: false, error: 'aufgebraucht' })
  }
  if (rabatt.min_bestellwert && subtotal < rabatt.min_bestellwert) {
    return Response.json({ valid: false, error: 'min_bestellwert', minWert: rabatt.min_bestellwert })
  }

  return Response.json({
    valid: true,
    code: rabatt.code,
    typ: rabatt.typ,
    wert: rabatt.wert,
  })
}
```

### Price Formatting Helper
```typescript
// src/lib/cart/format.ts
const eurFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount)
}

export function calculateMwSt(netto: number, rate = 0.19): { mwst: number; brutto: number } {
  const mwst = Math.round(netto * rate * 100) / 100
  return { mwst, brutto: Math.round((netto + mwst) * 100) / 100 }
}
```

### Submit Anfrage API Route
```typescript
// src/app/api/anfrage/submit/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { kontaktSchema } from '@/lib/anfrage/schemas'
import { generateAnfrageNummer } from '@/lib/anfrage/anfrage-nummer'
import { calculateServerPrice } from '@/lib/anfrage/price-server'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const body = await request.json()

  // 1. Validate contact data server-side
  const kontaktResult = kontaktSchema.safeParse(body.kontaktdaten)
  if (!kontaktResult.success) {
    return Response.json({ error: 'validation', issues: kontaktResult.error.issues }, { status: 400 })
  }

  // 2. Calculate authoritative prices server-side
  const produkte = await Promise.all(
    body.produkte.map(async (item: any) => {
      const serverPrice = await calculateServerPrice(item.selections, payload)
      return {
        konfiguration_snapshot: {
          selections: item.selections,
          resolvedNames: item.resolvedNames,
          serverPrice,
        },
        stueckzahl: item.quantity,
        einzelpreis: serverPrice,
      }
    })
  )

  // 3. Apply discount if provided
  // ... validate discount server-side again

  // 4. Create Anfrage in CMS
  const anfrageNummer = await generateAnfrageNummer(payload)
  const anfrage = await payload.create({
    collection: 'anfragen',
    data: {
      anfrage_nummer: anfrageNummer,
      status: 'neu',
      produkte,
      kontaktdaten: kontaktResult.data,
      gesamtpreis: totalPrice,
      rabattcode: discountId || undefined,
    },
  })

  return Response.json({ anfrageNummer: anfrage.anfrage_nummer })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod v3 `z.string().email()` | Zod v4 `z.email()` | Zod 4.0 (2025) | Project already on v4; use direct validators |
| `getServerSideProps` | App Router Route Handlers | Next.js 13+ | All API endpoints use Route Handlers |
| Redux for cart state | Zustand with persist | Industry trend 2023+ | Already established in this project |
| API Routes in pages/ | Route Handlers in app/ | Next.js 13+ | Use `export async function POST()` pattern |

**Deprecated/outdated:**
- Zod v3 chaining patterns (`.string().email()`) -- project uses v4 direct validators
- `getStaticProps` / `getServerSideProps` -- project uses App Router exclusively

## Open Questions

1. **Anfrage-Nummer Format**
   - What we know: Must be human-readable, sequential, unique
   - What's unclear: Exact format preference (ANF-2026-001 vs ANF-20260309-001 vs custom)
   - Recommendation: Use `ANF-YYYY-NNN` format, simple and sortable. The Anfragen collection already has `unique: true` on anfrage_nummer.

2. **Discount Code aktuelle_nutzungen Increment**
   - What we know: rabattcodes has `aktuelle_nutzungen` field with `readOnly: true` in admin
   - What's unclear: When to increment -- on submit or on successful "payment" (Phase 5)?
   - Recommendation: Increment on submit (Phase 3). If Anfrage is later rejected, admin can manually adjust. Keep it simple for now.

3. **Cart Edit Mode: How to Signal "Update" vs "Add New"**
   - What we know: User clicks "Bearbeiten" in cart, konfigurator opens with data, then "Aktualisieren" should replace the item
   - What's unclear: Best mechanism to track which cart item is being edited
   - Recommendation: Store `editingCartItemId: string | null` in the cart store. When konfigurator completes, check this ID: if set, replace item; if null, add new item. Clear the ID after.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | jest.config.ts (exists) |
| Quick run command | `npx jest --testPathPattern=tests/unit` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CART-01 | addItem adds product to cart store | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | No -- Wave 0 |
| CART-02 | updateQuantity changes qty, getSubtotal recalculates | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | No -- Wave 0 |
| CART-03 | editItem loads selections into konfigurator store | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | No -- Wave 0 |
| CART-04 | removeItem deletes product from cart | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | No -- Wave 0 |
| CART-06 | getSubtotal sums items * quantities correctly | unit | `npx jest tests/unit/test-cart-store.test.ts -x` | No -- Wave 0 |
| PREIS-01 | Client preview price uses calculatePreviewPrice | unit | `npx jest tests/unit/test-price-calculator.test.ts -x` | Yes (existing) |
| PREIS-02 | Server price calculation matches expected formula | unit | `npx jest tests/unit/test-server-price.test.ts -x` | No -- Wave 0 |
| PREIS-04 | Discount validation covers all error cases | unit | `npx jest tests/unit/test-discount-validation.test.ts -x` | No -- Wave 0 |
| PREIS-05 | Snapshot contains all required fields | unit | `npx jest tests/unit/test-snapshot.test.ts -x` | No -- Wave 0 |
| SEND-02 | Contact form Zod schema validates correctly | unit | `npx jest tests/unit/test-anfrage-schemas.test.ts -x` | No -- Wave 0 |
| SEND-03 | Anfrage nummer generation is sequential | unit | `npx jest tests/unit/test-anfrage-nummer.test.ts -x` | No -- Wave 0 |
| CART-05 | New konfigurator run adds to existing cart | manual-only | Manual: complete configurator with items in cart | N/A |
| SEND-01 | Contact form renders all fields | manual-only | Manual: visual check of form page | N/A |
| SEND-04 | Redirect to danke page with anfrage nummer | manual-only | Manual: submit flow end-to-end | N/A |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=tests/unit -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-cart-store.test.ts` -- covers CART-01 through CART-06
- [ ] `tests/unit/test-server-price.test.ts` -- covers PREIS-02
- [ ] `tests/unit/test-discount-validation.test.ts` -- covers PREIS-04
- [ ] `tests/unit/test-snapshot.test.ts` -- covers PREIS-05
- [ ] `tests/unit/test-anfrage-schemas.test.ts` -- covers SEND-02
- [ ] `tests/unit/test-anfrage-nummer.test.ts` -- covers SEND-03

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/konfigurator/store.ts` -- Zustand + persist pattern with skipHydration
- Existing codebase: `src/lib/konfigurator/price-calculator.ts` -- Price calculation formula
- Existing codebase: `src/lib/konfigurator/types.ts` -- KonfiguratorSelections interface
- Existing codebase: `src/collections/business/anfragen.ts` -- Anfragen collection schema
- Existing codebase: `src/collections/business/rabattcodes.ts` -- Rabattcodes collection schema
- Existing codebase: `src/collections/business/preisregeln.ts` -- Preisregeln collection schema
- Existing codebase: `src/app/my-route/route.ts` -- Payload Local API in Route Handler pattern

### Secondary (MEDIUM confidence)
- [Zustand + Next.js persist pattern](https://github.com/pmndrs/zustand/discussions/2897) -- Verified matches existing project pattern
- [Zod API validation in Next.js Route Handlers](https://dub.co/blog/zod-api-validation) -- Pattern confirmed with project's Zod v4 usage
- [Shopping cart with Zustand](https://hackernoon.com/how-to-build-a-shopping-cart-with-nextjs-and-zustand-state-management-with-typescript) -- Architecture patterns

### Tertiary (LOW confidence)
- None -- all patterns are well-established in this codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and proven in Phase 1-2
- Architecture: HIGH -- follows established patterns (Zustand persist, Payload Local API, Zod)
- Pitfalls: HIGH -- derived from concrete codebase analysis (hydration, race conditions, snapshots)

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable stack, no fast-moving dependencies)
