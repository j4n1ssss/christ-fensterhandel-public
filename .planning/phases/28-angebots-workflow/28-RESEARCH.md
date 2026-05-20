# Phase 28: Angebots-Workflow - Research

**Researched:** 2026-04-01
**Domain:** Admin Angebots-Erstellung, Kunden-Annahme-Flow, Stripe-Integration, Status-Transitions
**Confidence:** HIGH

## Summary

Phase 28 builds the complete Angebots-Workflow on top of existing infrastructure from Phases 24-27. The Angebote Collection, PDF generation, Stripe Checkout, and E-Mail system are fully operational. This phase connects them into an end-to-end flow: Admin creates an Angebot via a modal (with price adjustment), the system generates a PDF + sends an email in one API call, the customer views and accepts the Angebot (via public route or dashboard), Stripe payment is triggered, and upon payment receipt an Auftragsbestaetigung email is sent.

The codebase is highly consistent in its patterns: inline styles + admin-custom.css for Payload Admin UI, Radix primitives for dialogs, Zod validation on API routes, dynamic Payload imports in server functions, `queueEmailEvent()` for email dispatch, `checkRateLimit()` for public routes, and `calcNetFromGross()`/`calcTax()` for MwSt calculations. Phase 28 follows these exact patterns -- no new libraries needed.

**Primary recommendation:** Build as a pure integration phase. Every building block exists. The work is: (1) new API route for Angebots-Erstellung, (2) Angebots-Modal in Admin, (3) new API route for Angebots-Annahme, (4) public /angebot/[anfrageId] page, (5) status transition additions, (6) AGB-Checkbox on Anfrage-Formular, (7) Preishinweis text additions, (8) email template updates.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Angebots-Erstellungs-Modal:** Grosses scrollbares Modal (max-height 85vh), sticky Footer. Dual-Preis-Modus: Gesamtpreis oben (Brutto editierbar, Netto+MwSt live berechnet read-only), Einzelpreise pro Position aufklappbar. Letztes Edit gewinnt. Begruendung Pflichtfeld bei JEDER Abweichung. Gueltigkeit als Preset-Dropdown (14/30/60/90 Tage, Default aus Settings). Freitext optional. One-Click "Angebot erstellen & senden" (PDF + Status + E-Mail in einem API-Call).
- **Annahme-Flow:** Annehmen = sofort Zahlung. Confirm-Dialog vor Redirect (Betrag, Widerrufs-Hinweis Massanfertigung Paragraph 312g, AGB-Checkbox). Eigene AGB-Checkbox im Confirm-Dialog mit eigenem Zeitstempel. Gast-Zugang ueber /angebot/[anfrageId] (UUID als Auth-Token, Rate Limited 5/min). Dashboard-Zugang fuer eingeloggte Kunden. E-Mail-Link zeigt auf /angebot/[anfrageId].
- **Status-Flow:** Neue Transition angebot_versendet -> zahlungslink_versendet (Kunden-Annahme). bestaetigt bleibt als Admin-Option. Checkout expired -> Status zurueck auf angebot_versendet. Abgelaufenes Angebot: Button deaktiviert, PDF-Download bleibt.
- **Annahme API-Route:** POST /api/angebot/annehmen mit { anfrageId, agb_akzeptiert: true }. Server validiert Status + Gueltigkeit + AGB. Erstellt Checkout Session. Status -> zahlungslink_versendet. Return checkout_url.
- **Angebots-Historie:** Versionen im Dokumente-Bereich (rechte Spalte). "+ Neues Angebot erstellen" Button JEDERZEIT verfuegbar. Neues Angebot setzt Status IMMER auf angebot_versendet. Modal vorausgefuellt mit letztem Preis. Kunden sehen NUR aktuelles Angebot.
- **AGB-Checkbox:** Neue Checkbox unter Datenschutz-Checkbox auf Anfrage-Formular. AGB-Link dynamisch aus Settings Global (agb_link). Initial /agb als Platzhalter. Akzeptanz-Zeitstempel (agb_akzeptiert_am). Pflichtfeld.
- **Auftragsbestaetigung:** Kein neues Template -- bestehende zahlung-bestaetigung erweitern um Produktliste, Gesamtbetrag, naechste Schritte. Rechnung als PDF-Attachment (bereits gebaut). Wird bei Zahlungseingang gesendet.
- **Preishinweis:** Konfigurator Zusammenfassung + Anfrage-Formular: "Preise sind unverbindlich. Der endgueltige Preis steht im Angebot." Dezent, grauer Text.
- **Splitbutton:** "Angebot erstellen" bei in_bearbeitung oeffnet Modal statt Status-Wechsel.

### Claude's Discretion
- Angebots-Modal Inline Styles + admin-custom.css Layout (Radix Dialog)
- Scrollbares Modal responsive Verhalten
- /angebot/[anfrageId] Page Layout und Styling (Frontend Design Skill)
- Confirm-Dialog Component-Struktur
- Exakte Validierung der Annahme-Route (Edge Cases)
- Preis-Konflikt-Logik Implementierung (Gesamt vs. Einzelpreise)
- Angebots-E-Mail Template Anpassung (Link zu /angebot/[anfrageId] statt Dashboard)

### Deferred Ideas (OUT OF SCOPE)
- Manueller E-Mail-Versand fuer Angebots-Link -- Phase 30
- Angebots-PDF mit eingebettetem Zahlungslink/QR-Code -- v2
- Angebots-Vergleich fuer Kunden (V1 vs V2 Diff) -- v2
- Automatische Erinnerungs-Mail bei baldigem Ablauf -- eigenes Feature
- Angebots-Templates (vordefinierte Texte/Rabatte) -- v2
- Teilzahlung / Anzahlung nach Annahme -- STRP-F03 (v1.5+)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANG-01 | "Angebot erstellen" Modal in Admin (Konfiguration, Preis-Anpassung mit Begruendung, Gueltigkeit, Freitext) | Existing Angebote Collection, generateAndStorePDF(), Radix Dialog pattern, calcNetFromGross()/calcTax() for live MwSt calculation, getSettings() for default Gueltigkeit |
| ANG-02 | Angebots-Historie mit Versionen (V1, V2, V3 pro Anfrage) | Existing DokumentePanel fetches angebote by anfrage, version field on Angebote Collection, getNextNumber('ANG') for new numbers |
| ANG-03 | Angebots-Annahme Infrastruktur im Kunden-Dashboard (Button + Status-Wechsel) | createCheckoutSession() for Stripe, StripePayButton pattern, /api/stripe/redirect/[anfrageId] as public route template, checkRateLimit() for rate limiting |
| ANG-04 | Auftragsbestaetigung nach Annahme (E-Mail mit Zusammenfassung) | Existing zahlung-bestaetigung.tsx template to extend, AnfrageCard component for product list, afterChange hook already handles bezahlt event |
| ANG-05 | AGB-Checkbox auf Anfrage-Formular (Akzeptanz-Zeitstempel, AGB als Link/PDF) | Existing ContactForm with datenschutz checkbox pattern, kontaktSchema in schemas.ts, Settings Global has agb_link field |
</phase_requirements>

## Standard Stack

### Core (all existing -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.x | Collections, Admin UI, Hooks | Core CMS -- all business logic lives here |
| Next.js App Router | 15.x | API routes, pages, server components | Framework -- all routes follow App Router pattern |
| @radix-ui/react-dialog | existing | Modal for Angebots-Erstellung | Already used in admin -- Payload Admin includes Radix |
| zod | 4.x | API route validation | All API routes use Zod schemas |
| React Hook Form | existing | Contact form + AGB checkbox | Already used in ContactForm |
| @react-email/components | existing | Email template extension | All email templates use this |
| @react-pdf/renderer | existing | PDF generation | Already used for Angebots-PDF |

### Supporting (all existing)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| stripe | existing | Checkout Session creation | Annahme-Flow creates checkout |
| lucide-react | existing | Icons in UI | All components use lucide icons |

### Alternatives Considered
None -- this is a pure integration phase using existing stack.

**Installation:**
No new packages needed.

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
  app/
    api/
      angebot/
        erstellen/route.ts     # POST: Create Angebot (PDF + Status + Email)
        annehmen/route.ts      # POST: Accept Angebot (Checkout + Status)
    (frontend)/
      angebot/
        [anfrageId]/
          page.tsx             # Public Angebots-Ansicht (Guest + Logged-in)
      agb/
        page.tsx               # AGB Platzhalter-Seite
  components/
    admin/
      angebots-modal.tsx       # Angebots-Erstellungs-Modal (Radix Dialog)
      angebots-confirm-dialog.tsx  # Optional: separate confirm component
    kunden/
      angebots-annahme.tsx     # Annahme-Button + Confirm-Dialog for Dashboard
```

### Pattern 1: One-Click API Route (Angebots-Erstellung)
**What:** Single POST route that creates Angebot entry, generates PDF, updates status, and queues email
**When to use:** When multiple sequential operations must succeed or fail together
**Example:**
```typescript
// POST /api/angebot/erstellen
// Source: Existing pattern from anfrage/submit/route.ts + generate-and-store.ts
export async function POST(request: Request) {
  const body = await request.json();
  // 1. Validate with Zod
  // 2. Load Anfrage + Settings
  // 3. Calculate prices (custom or from Anfrage)
  // 4. Determine next version
  // 5. Get next ANG number
  // 6. Create Angebot (status: entwurf)
  // 7. Generate PDF + store
  // 8. Update Angebot (status: versendet, pdf link)
  // 9. Update Anfrage status -> angebot_versendet
  // 10. Queue email with PDF attachment
  // 11. Return success
}
```

### Pattern 2: Public UUID Route (Angebots-Ansicht)
**What:** Public page accessible via UUID (no auth required), with rate limiting
**When to use:** When guests need access via email link
**Example:**
```typescript
// Source: /api/stripe/redirect/[anfrageId]/route.ts pattern
// Rate limit: 5/min per IP (same as stripe redirect)
// UUID is cryptographically random -> sufficient auth
// Page shows: Angebots-Details, PDF-Download, "Annehmen & zahlen" Button
// Expired: Show "Abgelaufen" message, disable button, keep PDF download
```

### Pattern 3: Splitbutton Modal Integration
**What:** QUICK_ACTIONS entry opens a modal instead of changing status directly
**When to use:** When status change requires user input first (price, notes, etc.)
**Example:**
```typescript
// In splitbutton.tsx, detect "Angebot erstellen" action
// Instead of: submitStatusChange("angebot_versendet", "")
// Do: openModal() -> modal handles API call -> onStatusChanged()
```

### Pattern 4: Dual-Price Calculation (Brutto-first)
**What:** User edits Brutto amount, Netto + MwSt are computed live
**When to use:** Admin enters prices in Brutto (customer perspective), system derives Netto
**Example:**
```typescript
// Source: lib/tax.ts
import { calcNetFromGross, calcTax } from '@/lib/tax';
// User types 999 (brutto cents) -> calcNetFromGross(999, 19) = 839 -> calcTax(839, 19) = 159
// Display: Brutto 999, Netto 839, MwSt 159
```

### Anti-Patterns to Avoid
- **Direct Status Change from Splitbutton for "Angebot erstellen":** Must open modal first, not change status directly. The current afterChange hook on anfragen.ts auto-generates PDF on status=angebot_versendet -- this needs to be BYPASSED when the new modal API handles everything.
- **Double PDF Generation:** The afterChange hook in anfragen.ts already generates a PDF when status changes to angebot_versendet. The new Angebots-API handles PDF with custom prices. Must prevent the hook from also generating one. Solution: either (a) mark the update to skip PDF generation, or (b) remove the auto-trigger from the hook and always use the API route.
- **CSRF on Public Routes:** The /api/angebot/annehmen route serves BOTH logged-in users (with CSRF token) AND guests (without). Need conditional CSRF: check auth first, apply CSRF only for authenticated requests. For guests, UUID + rate limiting is sufficient.
- **Floating Point Money:** ALL amounts in integer cents. No .toFixed(2). Use calcNetFromGross/calcTax from lib/tax.ts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MwSt Berechnung | Custom math | `calcNetFromGross()`, `calcTax()` from lib/tax.ts | Rounding edge cases (839.495 -> 839) |
| Angebotsnummer | Custom counter | `getNextNumber('ANG')` from lib/nummernkreise.ts | Transaction-safe, gap-free |
| PDF Generation | Custom render | `renderPDF('angebot', props, filename)` from lib/pdf/ | Consistent with existing PDFs |
| Email Dispatch | Direct SMTP | `queueEmailEvent()` from lib/email/queue.ts | Queue with retry, idempotency |
| Stripe Checkout | Custom integration | `createCheckoutSession()` from lib/stripe.ts | Customer lookup, session management |
| Rate Limiting | Custom middleware | `checkRateLimit()` from lib/rate-limit.ts | In-memory, consistent limits |
| Status Validation | Custom checks | `isValidTransition()` from lib/status-transitions.ts | Central source of truth |
| Currency Display | Manual formatting | `formatCents()` from lib/format-currency.ts | German locale, EUR |

**Key insight:** This phase is 95% integration of existing modules. The only truly new logic is the Dual-Price-Mode in the modal (Gesamt vs. Einzelpreise conflict resolution) and the Confirm-Dialog before Annahme.

## Common Pitfalls

### Pitfall 1: Double PDF Generation on Status Change
**What goes wrong:** afterChange hook on anfragen.ts generates PDF when status changes to angebot_versendet. The Angebots-API ALSO generates PDF with custom prices. Result: two PDFs, wrong prices on the auto-generated one.
**Why it happens:** The existing hook was designed for simple status-driven PDF generation before custom pricing existed.
**How to avoid:** Add a `_skip_auto_pdf` transient field to the anfrage update in the API route, and check for it in the afterChange hook. Strip before save (like `_status_kommentar`).
**Warning signs:** Two Angebot entries in DB for the same version, wrong prices in customer email.

### Pitfall 2: Angebots-Gueltigkeit Timezone Issues
**What goes wrong:** `gueltig_bis` compared incorrectly when server and client are in different timezones.
**Why it happens:** Dates stored as ISO strings, comparison uses `new Date()` which depends on server timezone.
**How to avoid:** Store `gueltig_bis` as end-of-day ISO string (23:59:59Z). Compare server-side only, never trust client's Date.now().
**Warning signs:** Angebot appears expired on day of expiry even though it should be valid all day.

### Pitfall 3: Checkout Session Expired -> Wrong Status Reset
**What goes wrong:** checkout.session.expired webhook resets status, but doesn't know the previous status was from Angebots-Annahme (angebot_versendet -> zahlungslink_versendet).
**Why it happens:** Current webhook handler only updates stripe_payment_status, not anfrage status. CONTEXT.md says "Status zurueck auf angebot_versendet" when checkout expires after Annahme.
**How to avoid:** Store the "pre-checkout status" on the anfrage or use metadata on the Stripe session to identify the flow. Then the webhook can conditionally reset to angebot_versendet.
**Warning signs:** After expired checkout, anfrage stuck in zahlungslink_versendet with no way for customer to re-accept.

### Pitfall 4: Gesamt vs. Einzelpreise Conflict
**What goes wrong:** Admin edits Einzelpreis for Position 1, then edits Gesamtpreis. Which wins?
**Why it happens:** Dual-edit mode without clear precedence.
**How to avoid:** CONTEXT.md is clear: "Letztes Edit gewinnt." Track which was last edited. If Einzelpreise changed -> recalculate Gesamt. If Gesamt changed manually -> store as-is, display on PDF as Zwischensumme + Rabattzeile + Gesamt.
**Warning signs:** PDF shows inconsistent prices.

### Pitfall 5: AGB-Checkbox Validation on Submit Route
**What goes wrong:** AGB checkbox added to form but submit API route doesn't validate or store it.
**Why it happens:** The current kontaktSchema strips `datenschutz` before saving. If `agb` is treated the same way, the timestamp is lost.
**How to avoid:** Add `agb_akzeptiert_am` as a dedicated field on the Anfrage (not in kontaktdaten). Set it server-side in the submit route when agb=true. Don't trust client-provided timestamps.
**Warning signs:** No `agb_akzeptiert_am` on Anfrage records despite checkbox being filled.

### Pitfall 6: Angebote Collection Access for Kunden
**What goes wrong:** Kunden-Dashboard detail page fetches angebote with `status: { equals: "versendet" }` (already implemented). But the public /angebot/[anfrageId] route needs to find the LATEST versendet angebot. If access control blocks the query, no angebot is shown.
**Why it happens:** Angebote Collection read access currently allows only admin/mitarbeiter. Kunden and public routes can't query it.
**How to avoid:** The public route should use the Payload Local API (server-side, no user context = bypasses access control). Same pattern used in the kunden dashboard page. For the Kunden Dashboard detail page, it already uses Local API.
**Warning signs:** Empty angebote on public route, "Noch keine Dokumente" on dashboard.

## Code Examples

### Verified: Angebote Collection Fields and Immutability
```typescript
// Source: src/collections/business/angebote.ts
// Fields: nummer, version, anfrage (relationship), status (entwurf|versendet),
// gueltig_bis, freitext, pdf (relationship to pdf_uploads),
// betrag_netto_cents, betrag_brutto_cents, mwst_cents, mwst_satz
// Immutability: beforeChange hook blocks update if status !== 'entwurf'
```

### Verified: generateAndStorePDF for Angebote
```typescript
// Source: src/lib/pdf/generate-and-store.ts
// Auto-determines next version from existing angebote for this anfrage
// Calculates prices from anfrage.produkte (standard calculation)
// Creates angebote entry with status='versendet'
// Returns { buffer, filename, dokumentId, dokumentNummer }
```
**Important:** The current `generateAndStorePDF` calculates prices from anfrage.produkte, NOT custom prices. For the Angebots-Modal with custom pricing, we need a NEW function or extended options parameter that accepts custom prices and passes them to the PDF template and Angebote entry.

### Verified: Tax Calculation (Brutto -> Netto)
```typescript
// Source: src/lib/tax.ts
calcNetFromGross(999, 19); // -> 839 (Math.round rounds 839.495 down)
calcTax(839, 19);          // -> 159
// So: Brutto 999 = Netto 839 + MwSt 159 = 998. Off by 1 cent!
// This is a known rounding artifact. Use calcGrossFromNet for inverse.
calcGrossFromNet(839, 19); // -> 998 (Math.round(839 * 1.19) = Math.round(998.41) = 998)
```
**Important:** When admin enters Brutto=999, show Netto=839 and MwSt=160 (999-839=160). Don't use calcTax separately -- derive MwSt as `brutto - netto` for consistency.

### Verified: Status Transition System
```typescript
// Source: src/lib/status-transitions.ts
VALID_TRANSITIONS['angebot_versendet'] = ['bestaetigt', 'rueckfrage'];
// NEED TO ADD: 'zahlungslink_versendet' to this array
// Also need: Splitbutton QUICK_ACTIONS update for angebot_versendet
```

### Verified: Public Route Pattern (Stripe Redirect)
```typescript
// Source: src/app/api/stripe/redirect/[anfrageId]/route.ts
// - Uses checkRateLimit inline (not withRateLimit HOF)
// - UUID is auth token (no session required)
// - Loads anfrage via Payload Local API
// - Rate limit: 5/min per IP
// - Follows same pattern for /angebot/[anfrageId]
```

### Verified: Email Template Props Building
```typescript
// Source: src/lib/email/render-email.ts
// buildTemplateProps for 'angebot-versendet':
// - angebotUrl: currently uses urls.anfrageUrl (dashboard URL)
// - NEED TO CHANGE: use /angebot/[anfrageId] URL instead
// - gueltigBis from payload.zusatzDaten?.gueltigBis
```

### Verified: DokumentePanel Pattern
```typescript
// Source: src/components/admin/dokumente-panel.tsx
// - Fetches angebote + rechnungen for this anfrage
// - handleCreateAngebot: POST to /api/pdf/angebot/{anfrageId}
// - NEED TO CHANGE: "Angebot erstellen" button opens modal instead
// - Show versions with status badge, download link
```

### Verified: ContactForm AGB Pattern
```typescript
// Source: src/components/anfrage/contact-form.tsx
// Existing datenschutz checkbox:
// - z.literal(true, { error: '...' })
// - Stored in sessionStorage
// - Stripped by submit route before CMS save
// AGB follows EXACT same pattern: new field in schema, checkbox in form,
// but server-side: save agb_akzeptiert_am timestamp on Anfrage
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct status change for Angebot | Modal with price adjustment first | Phase 28 | Splitbutton "Angebot erstellen" opens modal instead of PATCH |
| Auto-PDF on status change | API-driven PDF with custom prices | Phase 28 | afterChange hook needs skip-guard for angebot_versendet |
| Dashboard-only Angebots-Link | Public /angebot/[anfrageId] route | Phase 28 | Email links point to public route, not dashboard |
| One-step Annahme (just status) | Annahme + Stripe Checkout in one | Phase 28 | Annahme creates checkout session directly |

**Deprecated/outdated:**
- `handleCreateAngebot` in DokumentePanel: Currently POSTs to `/api/pdf/angebot/{anfrageId}` directly. Will be replaced by modal-based creation.

## Open Questions

1. **PDF Custom Pricing: Rabattzeile Format**
   - What we know: When Gesamtpreis manually differs from sum of Einzelpreise, PDF should show Zwischensumme + Rabattzeile + Gesamt
   - What's unclear: Exact layout/wording of the Rabattzeile on the existing AngebotPDF template
   - Recommendation: Add optional `rabatt_cents` and `rabatt_begruendung` fields to AngebotPDFProps. If rabatt_cents > 0, render extra line. Implementation is Claude's discretion.

2. **Webhook Handler: checkout.session.expired Status Reset**
   - What we know: CONTEXT says expired checkout after Annahme should reset to angebot_versendet
   - What's unclear: How to identify "this expired session was from Angebots-Annahme" vs "normal Admin-triggered zahlungslink"
   - Recommendation: Add metadata `flow: 'angebots_annahme'` to the Stripe checkout session. Webhook reads this to decide reset target (angebot_versendet vs no change). Alternatively, store `pre_checkout_status` on the anfrage.

3. **Angebote Collection: Additional Fields for Custom Pricing**
   - What we know: Current Angebote has betrag_netto_cents, betrag_brutto_cents, mwst_cents, mwst_satz. No per-position pricing.
   - What's unclear: Whether to store per-position custom prices on the Angebot or just the totals
   - Recommendation: Store only totals + optional `preisanpassung_begruendung` (text) and `preisanpassung_positionen` (JSON) fields. The PDF renders from these. Keep it simple.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | jest.config.ts |
| Quick run command | `npm test -- --testPathPattern=test-angebot` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANG-01 | Angebots-Erstellungs-API validates input, creates PDF, updates status, queues email | unit | `npm test -- --testPathPattern=test-angebot-erstellen -x` | Wave 0 |
| ANG-01 | Dual-price logic: Brutto -> Netto+MwSt calculation | unit | `npm test -- --testPathPattern=test-angebot-pricing -x` | Wave 0 |
| ANG-02 | Version numbering increments correctly, latest version query | unit | `npm test -- --testPathPattern=test-angebot-versioning -x` | Wave 0 |
| ANG-03 | Annahme-Route validates status, gueltigkeit, creates checkout | unit | `npm test -- --testPathPattern=test-angebot-annehmen -x` | Wave 0 |
| ANG-03 | Rate limiting on Annahme route | unit | Covered by existing test-rate-limit.test.ts | Exists |
| ANG-04 | zahlung-bestaetigung template renders product list | unit | `npm test -- --testPathPattern=test-email-templates -x` | Exists (extend) |
| ANG-05 | AGB checkbox validation, timestamp stored | unit | `npm test -- --testPathPattern=test-anfrage-schemas -x` | Exists (extend) |
| ANG-05 | Submit route stores agb_akzeptiert_am | unit | `npm test -- --testPathPattern=test-agb-submit -x` | Wave 0 |
| ALL | Status transitions include new angebot_versendet -> zahlungslink_versendet | unit | `npm test -- --testPathPattern=test-status-transitions -x` | Exists (extend) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=test-angebot -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-angebot-erstellen.test.ts` -- covers ANG-01 API validation and flow
- [ ] `tests/unit/test-angebot-pricing.test.ts` -- covers ANG-01 dual-price mode calculations
- [ ] `tests/unit/test-angebot-versioning.test.ts` -- covers ANG-02 version increment logic
- [ ] `tests/unit/test-angebot-annehmen.test.ts` -- covers ANG-03 acceptance validation
- [ ] Extend `tests/unit/test-status-transitions.test.ts` -- add angebot_versendet -> zahlungslink_versendet
- [ ] Extend `tests/unit/test-anfrage-schemas.test.ts` -- add AGB field validation
- [ ] Extend `tests/unit/test-email-templates.test.ts` -- add zahlung-bestaetigung with product list

## Sources

### Primary (HIGH confidence)
- Source code analysis: All files listed in CONTEXT.md canonical_refs section, read and verified
- src/collections/business/angebote.ts -- Collection structure, fields, immutability hooks
- src/collections/business/anfragen.ts -- Full collection with hooks, fields, status transitions
- src/lib/pdf/generate-and-store.ts -- PDF generation pipeline
- src/lib/stripe.ts -- Checkout session creation, customer management
- src/lib/status-config.ts -- QUICK_ACTIONS, STATUS_LABELS for Splitbutton integration
- src/lib/status-transitions.ts -- VALID_TRANSITIONS map
- src/lib/email/queue.ts -- Email queuing with queueEmailEvent()
- src/lib/email/render-email.ts -- Template props building (buildTemplateProps)
- src/lib/email/event-matrix.ts -- angebot_versendet event config
- src/lib/tax.ts -- MwSt calculation functions
- src/lib/rate-limit.ts -- Rate limiting for public routes
- src/lib/security.ts -- CSRF validation (withCsrf HOF)
- src/components/admin/anfrage-detail-view.tsx -- Admin detail view layout
- src/components/admin/splitbutton.tsx -- Status action button
- src/components/admin/dokumente-panel.tsx -- Document list with create button
- src/components/kunden/anfrage-detail.tsx -- Kunden dashboard detail
- src/components/kunden/stripe-pay-button.tsx -- Payment button pattern
- src/components/anfrage/contact-form.tsx -- ContactForm with datenschutz checkbox
- src/lib/anfrage/schemas.ts -- Zod schemas for anfrage submission
- src/app/api/stripe/redirect/[anfrageId]/route.ts -- Public UUID route pattern
- src/app/api/stripe/webhook/route.ts -- Webhook handler for checkout events
- src/payload-globals/settings.ts -- Settings fields (agb_link, angebots_gueltigkeit_tage)
- src/emails/templates/angebot-versendet.tsx -- Angebots email template
- src/emails/templates/zahlung-bestaetigung.tsx -- Payment confirmation template

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions -- User-confirmed implementation details
- REQUIREMENTS.md -- ANG-01 through ANG-05 requirement definitions

### Tertiary (LOW confidence)
- None -- all findings verified from source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- all patterns verified from existing code, every integration point inspected
- Pitfalls: HIGH -- identified from actual code analysis (double PDF, timezone, webhook, rounding)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable -- no external dependency changes expected)
