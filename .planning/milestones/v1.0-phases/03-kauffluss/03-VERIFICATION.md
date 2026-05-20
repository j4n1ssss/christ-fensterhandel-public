---
phase: 03-kauffluss
verified: 2026-03-09T20:00:00Z
status: passed
score: 16/16 must-haves verified
---

# Phase 3: Kauffluss Verification Report

**Phase Goal:** Kompletter Kauffluss — Warenkorb, Preisberechnung (Server), Anfrage absenden (inkl. Rabattcodes)
**Verified:** 2026-03-09T20:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User kann konfiguriertes Produkt zum Warenkorb hinzufuegen | VERIFIED | `step-zusammenfassung.tsx:420` calls `cartStore.addItem(cartItem)` with full CartItem from konfigurator selections |
| 2 | User kann Stueckzahl pro Produkt aendern (+/- Buttons) | VERIFIED | `cart-item-card.tsx:164-186` renders +/- buttons calling `updateQuantity`, min 1 enforced |
| 3 | User kann Produkt bearbeiten (zurueck in Konfigurator mit Daten) | VERIFIED | `cart-item-card.tsx:34-68` injects all selections into konfigurator store, marks steps 1-9 complete, sets editingCartItemId, navigates to `/konfigurator/fenster` |
| 4 | User kann Produkt aus Warenkorb loeschen (mit Bestaetigung) | VERIFIED | `cart-item-card.tsx:206-232` inline delete confirmation with "Ja, loeschen" / "Abbrechen" pattern |
| 5 | User kann weiteres Produkt hinzufuegen (neuer Konfigurator-Durchlauf) | VERIFIED | `cart-summary.tsx:114-120` "Weitere Konfiguration" button calls `resetAll()` then navigates to `/` |
| 6 | Warenkorb zeigt Zwischensumme aller Produkte | VERIFIED | `cart-summary.tsx:17,44-55` computes subtotal via `getSubtotal()` and renders with `formatEUR` |
| 7 | Client-seitige Preisvorschau zeigt Flaeche * Grundpreis + Aufpreise | VERIFIED | `cart-item-card.tsx:106` displays `formatEUR(item.previewPrice)*` with asterisk; price from existing `calculatePreviewPrice` |
| 8 | Server-seitige Preisberechnung liefert verbindlichen Preis (nicht manipulierbar) | VERIFIED | `price-server.ts:52-134` uses `payload.find` for CMS data; `submit/route.ts:67` calls `calculateServerPrice` server-side |
| 9 | Preisregeln werden aus CMS gelesen (Grundpreis pro m2 nach Produkttyp/Material/Profil) | VERIFIED | `price-server.ts:67-83` queries `preisregeln` collection via `payload.find` and matches by produkttyp/material/profil |
| 10 | Rabattcode-Validierung deckt alle Faelle ab | VERIFIED | `discount-validator.ts:36-76` has 5-case validation chain: ungueltig, abgelaufen, aufgebraucht, min_bestellwert, valid |
| 11 | Konfigurations-Snapshot wird als JSON eingefroren mit IDs + aufgeloesten Namen + Server-Preis | VERIFIED | `submit/route.ts:70-74` builds snapshot with `selections`, `resolvedNames`, `serverPrice` and stores as `konfiguration_snapshot` |
| 12 | Kontaktformular zeigt alle Pflichtfelder und optionale Felder | VERIFIED | `contact-form.tsx:81-270` renders vorname, nachname, email (required), telefon, strasse, plz, ort, nachricht (optional), datenschutz (required) with Zod validation |
| 13 | Server-seitige Zod-Validierung lehnt ungueltige Kontaktdaten ab | VERIFIED | `submit/route.ts:28-34` uses `kontaktSchema.safeParse()` and returns 400 with issues on failure |
| 14 | Anfrage wird in CMS gespeichert mit Status NEU und eingefrorener Konfiguration | VERIFIED | `submit/route.ts:169-179` calls `payload.create({ collection: 'anfragen', data: { status: 'neu', produkte, ... }})` |
| 15 | Danke-Seite zeigt Anfrage-Nummer und Zusammenfassung | VERIFIED | `danke-content.tsx:55-70` shows anfrageNummer from URL param + produktCount/gesamtpreis from sessionStorage |
| 16 | Rabattcode-Eingabe im Warenkorb validiert und zeigt spezifische Fehlermeldungen | VERIFIED | `discount-input.tsx:56-68` maps error codes to German messages; calls `/api/anfrage/validate-discount` |

**Score:** 16/16 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/cart/types.ts` | CartItem, ResolvedNames, DiscountResult interfaces | VERIFIED | 46 lines, exports all 3 interfaces |
| `src/lib/cart/store.ts` | Zustand cart store with persist + LocalStorage | VERIFIED | 104 lines, key `christ-warenkorb`, skipHydration:true, all CRUD actions |
| `src/lib/cart/format.ts` | EUR formatting and MwSt calculation | VERIFIED | 29 lines, `formatEUR` + `calculateMwSt` with cent rounding |
| `src/lib/anfrage/schemas.ts` | Zod schemas for contact + submission | VERIFIED | 48 lines, exports kontaktSchema, snapshotItemSchema, submissionSchema, KontaktFormData |
| `src/lib/anfrage/price-server.ts` | Server-side price via Payload Local API | VERIFIED | 134 lines, uses `payload.find` for preisregeln + aufpreis collections |
| `src/lib/anfrage/anfrage-nummer.ts` | ANF-YYYY-NNN generator | VERIFIED | 44 lines, queries anfragen, increments, padStart(3) |
| `src/lib/anfrage/discount-validator.ts` | Pure discount validation function | VERIFIED | 77 lines, 5-case chain as pure function |
| `src/app/api/anfrage/calculate-price/route.ts` | POST price calculation endpoint | VERIFIED | 64 lines, uses getPayload + calculateServerPrice |
| `src/app/api/anfrage/validate-discount/route.ts` | POST discount validation endpoint | VERIFIED | 59 lines, queries rabattcodes + calls validateDiscountCode |
| `src/app/api/anfrage/submit/route.ts` | POST submit endpoint creating Anfrage in CMS | VERIFIED | 193 lines, full pipeline: validate kontakt, calculate prices, apply discount, generate nummer, payload.create |
| `src/app/(frontend)/warenkorb/page.tsx` | Cart page with products + summary | VERIFIED | 72 lines, renders CartItemCard list + DiscountInput + CartSummary |
| `src/app/(frontend)/anfrage/page.tsx` | Contact form page (Step 2) | VERIFIED | 65 lines, step indicator, redirect if empty cart |
| `src/app/(frontend)/anfrage/zusammenfassung/page.tsx` | Summary + submit page (Step 3) | VERIFIED | 72 lines, redirect guards for cart + kontaktdaten |
| `src/app/(frontend)/anfrage/danke/page.tsx` | Thank you page | VERIFIED | 27 lines, Suspense-wrapped DankeContent |
| `src/components/cart/discount-input.tsx` | Discount code input UI | VERIFIED | 146 lines, fetch + German error messages + success state |
| `src/components/anfrage/contact-form.tsx` | RHF + Zod contact form | VERIFIED | 272 lines, all fields, sessionStorage persistence |
| `src/components/anfrage/anfrage-summary.tsx` | Full summary with submit handler | VERIFIED | 280 lines, product list, prices, kontaktdaten, submit to API |
| `src/components/anfrage/danke-content.tsx` | Thank you page content | VERIFIED | 90 lines, displays anfrageNummer, cleans up sessionStorage |
| `src/components/cart/cart-badge.tsx` | Navigation cart icon with count | VERIFIED | 31 lines, hydration guard, rehydrate on mount |
| `src/components/cart/cart-empty.tsx` | Empty cart state | VERIFIED | 27 lines, ShoppingBag icon + CTA link |
| `src/components/cart/cart-item-card.tsx` | Product card with controls | VERIFIED | 246 lines, mini WindowSVG, collapsible details, quantity, edit, delete |
| `src/components/cart/cart-summary.tsx` | Price summary with MwSt | VERIFIED | 124 lines, netto/discount/MwSt/brutto, action buttons |
| `tests/unit/test-cart-store.test.ts` | Cart store unit tests | VERIFIED | Exists, 7.7KB |
| `tests/unit/test-anfrage-schemas.test.ts` | Schema tests | VERIFIED | Exists, 4KB |
| `tests/unit/test-server-price.test.ts` | Server price tests | VERIFIED | Exists, 4.3KB |
| `tests/unit/test-anfrage-nummer.test.ts` | Anfrage nummer tests | VERIFIED | Exists, 1.5KB |
| `tests/unit/test-discount-validation.test.ts` | Discount validation tests | VERIFIED | Exists, 3.1KB |
| `tests/unit/test-snapshot.test.ts` | Snapshot structure tests | VERIFIED | Exists, 2.3KB |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `warenkorb/page.tsx` | `cart/store.ts` | `useCartStore` hook | WIRED | Line 4: import, lines 21,17: usage |
| `cart-item-card.tsx` | `konfigurator/store.ts` | `useKonfiguratorStore.getState` | WIRED | Line 7: import, line 36: `.getState()` for edit mode |
| `layout.tsx` | `cart-badge.tsx` | CartBadge in navigation | WIRED | Line 4: import, line 36: rendered in header nav |
| `price-server.ts` | `payload.find (preisregeln)` | Payload Local API | WIRED | Line 67-72: `payload.find({ collection: 'preisregeln' })` |
| `validate-discount/route.ts` | `payload.find (rabattcodes)` | Payload Local API | WIRED | Line 34-40: `payload.find({ collection: 'rabattcodes' })` |
| `submit/route.ts` | `payload.create (anfragen)` | Payload Local API | WIRED | Line 169: `payload.create({ collection: 'anfragen' })` |
| `submit/route.ts` | `price-server.ts` | calculateServerPrice | WIRED | Line 5: import, line 67: called per product |
| `contact-form.tsx` | `schemas.ts` | kontaktSchema (inline mirror) | PARTIAL | Uses inline copy of kontaktSchema (Zod v4 zodResolver compat), not direct import. Logic is identical. |
| `danke/page.tsx` | `clearCart()` | Cart cleanup | WIRED | `anfrage-summary.tsx:91` calls `clearCart()` before navigating to danke page |
| `step-zusammenfassung.tsx` | `cart/store.ts` | addItem/updateItem | WIRED | Line 6: import, lines 412-421: addItem/updateItem with edit mode check |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CART-01 | 03-01 | User kann konfiguriertes Produkt zum Warenkorb hinzufuegen | SATISFIED | `step-zusammenfassung.tsx:420` addItem |
| CART-02 | 03-01 | User kann Stueckzahl pro Produkt aendern | SATISFIED | `cart-item-card.tsx:164-186` +/- buttons |
| CART-03 | 03-01 | User kann Produkt bearbeiten (zurueck in Konfigurator) | SATISFIED | `cart-item-card.tsx:34-68` edit flow |
| CART-04 | 03-01 | User kann Produkt aus Warenkorb loeschen | SATISFIED | `cart-item-card.tsx:206-232` delete with confirm |
| CART-05 | 03-01 | User kann weiteres Produkt hinzufuegen | SATISFIED | `cart-summary.tsx:114-120` "Weitere Konfiguration" |
| CART-06 | 03-01 | Warenkorb zeigt Zwischensumme | SATISFIED | `cart-summary.tsx:17,44-55` subtotal display |
| PREIS-01 | 03-02 | Client-seitige Preisvorschau | SATISFIED | Pre-existing `calculatePreviewPrice` + cart display |
| PREIS-02 | 03-02 | Server-seitige verbindliche Preisberechnung | SATISFIED | `price-server.ts` + `calculate-price/route.ts` |
| PREIS-03 | 03-02 | Preisregeln aus CMS | SATISFIED | `price-server.ts:67-83` queries preisregeln |
| PREIS-04 | 03-02 | Rabattcode-Validierung | SATISFIED | `discount-validator.ts` 5-case chain |
| PREIS-05 | 03-02 | Konfigurations-Snapshot JSON | SATISFIED | `submit/route.ts:70-74` frozen snapshot |
| SEND-01 | 03-03 | Kontaktformular | SATISFIED | `contact-form.tsx` full form with all fields |
| SEND-02 | 03-03 | Server-seitige Validierung Kontaktdaten | SATISFIED | `submit/route.ts:28-34` kontaktSchema.safeParse |
| SEND-03 | 03-03 | Anfrage in CMS mit Status NEU + Snapshot | SATISFIED | `submit/route.ts:169-179` payload.create with status 'neu' |
| SEND-04 | 03-03 | Weiterleitung zur Danke-Seite | SATISFIED | `anfrage-summary.tsx:92` navigates to `/anfrage/danke?nr=...` |

No orphaned requirements found. All 16 requirement IDs from plans are mapped and satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | No anti-patterns detected |

No TODO, FIXME, placeholder, or stub patterns found in any phase 3 files.

### Human Verification Required

### 1. Complete Kauffluss E2E Flow

**Test:** Configure a window through all 10 steps, click "In den Warenkorb", verify cart page shows product with correct data, change quantity, edit product (returns to konfigurator with data), delete product (confirmation dialog), add second product
**Expected:** All cart operations work smoothly, data persists across page reloads (LocalStorage), WindowSVG mini preview renders correctly
**Why human:** Requires running app with database, visual verification of SVG rendering, interaction testing

### 2. Discount Code Validation Flow

**Test:** Enter valid/invalid/expired/used-up discount codes in the Warenkorb discount input
**Expected:** Specific German error messages for each case; valid code shows green success state with "Entfernen" link; discount reflected in CartSummary (old price struck through, discount line in green)
**Why human:** Requires running app with seeded rabattcodes data in database

### 3. Anfrage Submit Flow

**Test:** Complete the 3-step flow: Warenkorb -> Kontakt (fill form) -> Zusammenfassung -> click "Verbindlich absenden"
**Expected:** Anfrage appears in Payload Admin Panel with status "neu", frozen snapshot, server-calculated prices, and generated ANF-YYYY-NNN number. Danke page shows the number. Cart is cleared.
**Why human:** Requires running app with database, checking Payload Admin Panel

### 4. Contact Form Validation

**Test:** Submit contact form with missing required fields, invalid email, unchecked datenschutz
**Expected:** German error messages appear inline per field, form does not submit until all validations pass
**Why human:** Visual verification of error message placement and styling

---

_Verified: 2026-03-09T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
