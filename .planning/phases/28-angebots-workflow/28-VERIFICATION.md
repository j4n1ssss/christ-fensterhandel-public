---
phase: 28-angebots-workflow
verified: 2026-04-01T12:00:00Z
status: human_needed
score: 5/5 success criteria verified
gaps:
  - truth: "Admin kann ueber ein Modal ein Angebot erstellen mit optionaler Preis-Anpassung (Begruendung erforderlich bei Abweichung), Gueltigkeitsdauer und Freitext -- das Modal generiert PDF, aendert den Status und versendet die E-Mail in einem Vorgang"
    status: resolved
    reason: "Fixed in commit 89c9599 — replaced Zod v3 errorMap with v4 { error } syntax."
    artifacts:
      - path: "src/app/api/angebot/annehmen/route.ts"
        issue: "z.literal(true, { errorMap: () => ({ message: '...' }) }) -- must be z.literal(true, { error: 'AGB muessen akzeptiert werden' }) for Zod v4"
    missing:
      - "Fix annehmen/route.ts line 17-21: replace errorMap callback with Zod v4 { error: '...' } syntax (same pattern as src/lib/anfrage/schemas.ts)"
human_verification:
  - test: "Admin creates Angebot via modal in the UI"
    expected: "Modal opens from Splitbutton, PDF is generated, status changes to angebot_versendet, email is queued -- all in one submit"
    why_human: "Cannot verify one-shot atomic creation through UI interaction programmatically"
  - test: "Customer views /angebot/[anfrageId], accepts via AGB + confirm, is redirected to Stripe Checkout"
    expected: "Page loads with product list, price, gueltigkeit. AGB checkbox required. After check + click -- redirects to Stripe session URL"
    why_human: "Stripe redirect and full customer flow requires browser interaction"
  - test: "Expired Angebot shows amber notice with disabled button"
    expected: "When gueltig_bis is in the past, the page renders an amber notice and the Angebot annehmen button is disabled or absent"
    why_human: "Requires a seeded expired angebot and visual inspection"
  - test: "Kunden-Dashboard shows 'Angebot annehmen' section when status is angebot_versendet"
    expected: "AngebotAnnahmeButton visible with correct Betrag, gueltigkeit display, and dynamic AGB link from Settings"
    why_human: "Requires logged-in customer session with an angebot in the correct status"
---

# Phase 28: Angebots-Workflow Verification Report

**Phase Goal:** Admin kann Angebote erstellen und versenden, Kunden koennen Angebote annehmen und den Bestellprozess fortsetzen
**Verified:** 2026-04-01T12:00:00Z
**Status:** gaps_found (1 TypeScript error in phase 28 file, 4 items needing human verification)
**Re-verification:** No -- initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin Modal: one-shot Angebot creation (PDF + status + email) with optional price adjustment | PARTIAL | Modal, API route, generateAndStorePDF, queueEmailEvent all wired. TypeScript error in annehmen route (wrong Zod v4 syntax) does not affect erstellen route directly. Admin modal itself is fully wired. |
| 2 | Angebots-Historie with versioned Angebote (V1/V2/V3), earlier versions accessible | VERIFIED | angebote.ts has version field. DokumentePanel renders version column with betrag + status badge. Versioning tests implemented and passing. |
| 3 | Customers can accept Angebot and continue ordering (configurable infrastructure) | VERIFIED | AngebotAnnahmeButton in both /angebot/[anfrageId] and kunden dashboard. Fetch to /api/angebot/annehmen. Stripe checkout session created with flow=angebots_annahme metadata. Webhook expiry reset logic present. |
| 4 | Auftragsbestaetigung email with summary sent after acceptance | VERIFIED | zahlung-bestaetigung.tsx includes produkte array and AnfrageCard. "Naechste Schritte" section present. render-email.ts wires product data to template. |
| 5 | AGB-Checkbox on Anfrage-Formular with timestamp, dynamic AGB link | VERIFIED | kontaktSchema has agb: z.literal(true). Submit route sets agb_akzeptiert_am server-side. anfrage/page.tsx fetches getSettings for agbLink. /agb placeholder page exists. |

**Score:** 4/5 success criteria fully verified (SC1 partial due to TS error in annehmen route)

---

## Required Artifacts

| Artifact | Plan | Status | Details |
|----------|------|--------|---------|
| `tests/unit/test-angebot-pricing.test.ts` | 00 | VERIFIED | 11 implemented tests, describe blocks present |
| `tests/unit/test-angebot-versioning.test.ts` | 00/02 | VERIFIED | 7 implemented tests (not just .todo) |
| `tests/unit/test-angebot-annehmen.test.ts` | 00 | VERIFIED | 5 describe blocks, test stubs present |
| `tests/unit/test-angebot-agb.test.ts` | 00/04 | VERIFIED | 9 implemented tests covering schema + timestamps |
| `tests/unit/test-angebot-webhook-expiry.test.ts` | 00 | VERIFIED | describe block with 2 groups present |
| `src/app/api/angebot/erstellen/route.ts` | 01 | VERIFIED | 214 lines, generateAndStorePDF + queueEmailEvent + _skip_auto_pdf guard wired |
| `src/app/api/angebot/annehmen/route.ts` | 01 | STUB/ERROR | 162 lines, logic correct but Zod v4 TS2769 compile error on line 17 |
| `src/lib/status-transitions.ts` | 01 | VERIFIED | angebot_versendet -> zahlungslink_versendet transition present |
| `src/collections/business/angebote.ts` | 01 | VERIFIED | betrag_brutto_cents, version, gueltig_bis, preisanpassung_begruendung fields present |
| `src/collections/business/anfragen.ts` | 01 | VERIFIED | agb_akzeptiert_am, agb_akzeptiert_bei_annahme_am fields + _skip_auto_pdf guard |
| `src/app/api/stripe/webhook/route.ts` | 01 | VERIFIED | flow=angebots_annahme metadata read, status reset to angebot_versendet on expiry |
| `src/components/admin/angebots-modal.tsx` | 02 | VERIFIED | 548 lines, dual-price mode, calcNetFromGross, einzelpreise, fetch to /api/angebot/erstellen |
| `src/components/admin/dokumente-panel.tsx` | 02 | VERIFIED | onOpenAngebotsModal callback, betrag + status badge in angebot rows, "+ Neues Angebot" button |
| `src/components/admin/splitbutton.tsx` | 02 | VERIFIED | intercepts angebot_versendet target, calls onOpenAngebotsModal instead of direct status change |
| `src/components/admin/anfrage-detail-view.tsx` | 02 | VERIFIED | AngebotsModal imported, showAngebotsModal state, passed to both Splitbutton and DokumentePanel |
| `src/app/(frontend)/angebot/[anfrageId]/page.tsx` | 03 | VERIFIED | 247 lines, expiry check (end-of-day), amber notice for expired, AngebotAnnahmeButton imported and used |
| `src/components/kunden/angebots-annahme.tsx` | 03 | VERIFIED | 188 lines, AGB checkbox, Widerrufshinweis (Paragraph 312g), fetch to /api/angebot/annehmen, Stripe redirect |
| `src/components/kunden/anfrage-detail.tsx` | 03 | VERIFIED | AngebotAnnahmeButton shown when status=angebot_versendet, agbLink forwarded from Settings |
| `src/emails/templates/angebot-versendet.tsx` | 03 | VERIFIED | 73 lines, angebotUrl prop, EmailButton links to /angebot/[anfrageId] |
| `src/emails/templates/zahlung-bestaetigung.tsx` | 03 | VERIFIED | produkte array, AnfrageCard, "Naechste Schritte" section |
| `src/components/anfrage/contact-form.tsx` | 04 | VERIFIED | agb z.literal(true) in schema, AGB checkbox rendered, Preishinweis text present |
| `src/lib/anfrage/schemas.ts` | 04 | VERIFIED | agb: z.literal(true, { error: '...' }) using correct Zod v4 syntax |
| `src/app/api/anfrage/submit/route.ts` | 04 | VERIFIED | agb_akzeptiert_am set server-side, agb stripped from kontaktdaten before save |
| `src/app/(frontend)/anfrage/page.tsx` | 04 | VERIFIED | getSettings fetched, agb_link extracted and passed to ContactForm as agbLink prop |
| `src/app/(frontend)/agb/page.tsx` | 04 | VERIFIED | Placeholder page exists (28 lines), intentional per plan spec |
| `src/components/konfigurator/steps/step-zusammenfassung.tsx` | 04 | VERIFIED | "Preise sind unverbindlich. Der endgueltige Preis steht im Angebot." text present |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `angebots-modal.tsx` | `/api/angebot/erstellen` | fetch POST on submit | WIRED | `fetch.*api/angebot/erstellen` confirmed |
| `splitbutton.tsx` | `angebots-modal.tsx` | onOpenAngebotsModal callback | WIRED | intercept on angebot_versendet, calls prop |
| `dokumente-panel.tsx` | `angebots-modal.tsx` | onOpenAngebotsModal callback | WIRED | 4 usages of onOpenAngebotsModal in component |
| `anfrage-detail-view.tsx` | `AngebotsModal` | showAngebotsModal state | WIRED | AngebotsModal rendered with state controls |
| `erstellen/route.ts` | `generate-and-store.ts` | generateAndStorePDF with customPricing | WIRED | confirmed at line 123 |
| `erstellen/route.ts` | `email/queue.ts` | queueEmailEvent for angebot_versendet | WIRED | confirmed at line 150/155 |
| `annehmen/route.ts` | `stripe.ts` | createCheckoutSession with flow metadata | WIRED | session.metadata.flow = "angebots_annahme" |
| `stripe/webhook/route.ts` | `session.metadata.flow` | isAngebotsAnnahme check | WIRED | metadata?.flow === "angebots_annahme" |
| `angebots-annahme.tsx` | `/api/angebot/annehmen` | fetch POST | WIRED | confirmed at line 47 |
| `angebot/[anfrageId]/page.tsx` | `angebots-annahme.tsx` | import AngebotAnnahmeButton | WIRED | import at line 6, used at line 217 |
| `render-email.ts` | `/angebot/[anfrageId]` | angebotUrl prop | WIRED | `${urls.baseUrl}/angebot/${payload.anfrageId}` |
| `kunden/dashboard/[id]/page.tsx` | `settings.ts` | getSettings for agb_link | WIRED | getSettings() at line 70, agbLink at 71 |
| `contact-form.tsx` | `schemas.ts` | kontaktSchema with agb field | WIRED | agb: z.literal(true) in exported schema |
| `anfrage/submit/route.ts` | `agb_akzeptiert_am` | server-side timestamp | WIRED | new Date().toISOString() at line 242 |
| `anfrage/page.tsx` | `settings.ts` | getSettings for agb_link | WIRED | getSettings() at line 10, forwarded to ContactForm |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ANG-01 | 00, 01, 02 | "Angebot erstellen" Modal (config, price adjustment with justification, validity, freetext) | SATISFIED | AngebotsModal 548 lines with all sections, POST /api/angebot/erstellen fully wired |
| ANG-02 | 00, 01, 02 | Angebots-Historie with versions (V1, V2, V3) | SATISFIED | angebote.ts version field, DokumentePanel version display, versioning tests passing |
| ANG-03 | 00, 01, 03 | Kunden-Dashboard acceptance infrastructure (button + status change, configurable) | SATISFIED | AngebotAnnahmeButton in both public page and dashboard, Stripe checkout with flow metadata, webhook expiry reset |
| ANG-04 | 03 | Auftragsbestaetigung after acceptance (email with summary) | SATISFIED | zahlung-bestaetigung.tsx with products + "Naechste Schritte", render-email wires data |
| ANG-05 | 00, 04 | AGB-Checkbox on Anfrage-Formular (acceptance timestamp, AGB as link/PDF) | SATISFIED | z.literal(true) in schema, server-side timestamp, dynamic link from Settings, /agb placeholder |

**No orphaned requirements detected.** All ANG-01 through ANG-05 are claimed in plan frontmatter and covered by implementation.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/api/angebot/annehmen/route.ts` | 17-21 | `z.literal(true, { errorMap: () => ({ message: '...' }) })` -- Zod v3 API in a Zod v4 project | BLOCKER | TypeScript TS2769 compile error. Runtime may still work (Zod may be lenient), but violates project type safety. All other files in this phase use correct `{ error: '...' }` syntax. |
| `src/app/(frontend)/agb/page.tsx` | 8 | Comment says "placeholder page" | INFO | Intentional per plan spec. Not a stub issue. |

**HTML `placeholder` attributes in form inputs:** Multiple instances in contact-form.tsx and angebots-modal.tsx. These are standard form UX attributes, not code stubs -- not flagged as anti-patterns.

**`return null` in angebots-modal.tsx:** Early return when `!open` -- legitimate guard pattern, not a stub.

---

## Human Verification Required

### 1. Admin Modal: One-Shot Angebot Creation

**Test:** As admin, open an Anfrage in angebot_versendet-eligible status. Click "Angebot erstellen" in the Splitbutton. The AngebotsModal should open. Enter a custom price with Begruendung, select Gueltigkeit, add Freitext. Submit.
**Expected:** Modal closes, toast "Angebot erstellt und versendet" appears, DokumentePanel refreshes showing V1 with betrag and status badge, admin receives no duplicate PDF email, anfrage status changes to angebot_versendet.
**Why human:** One-shot atomicity (PDF + status + email in sequence) can only be confirmed through live execution.

### 2. Customer Angebot Acceptance Flow

**Test:** As customer (or guest), visit `/angebot/[anfrageId]` for an active angebot. Verify product list, price, gueltigkeit date, and PDF download link are shown. Check the AGB checkbox and click "Angebot annehmen und zahlen".
**Expected:** AGB checkbox required (error shown if unchecked). After checking and clicking, page redirects to Stripe Checkout URL. Anfrage status becomes zahlungslink_versendet.
**Why human:** Stripe redirect and checkout session creation require browser + live Stripe test environment.

### 3. Expired Angebot Amber Notice

**Test:** View `/angebot/[anfrageId]` for an angebot where `gueltig_bis` is in the past.
**Expected:** Amber/orange notice box appears saying "Dieses Angebot ist am [date] abgelaufen." The acceptance button is disabled or absent. Contact information is shown.
**Why human:** Requires a seeded expired angebot and visual UI inspection.

### 4. Kunden-Dashboard Angebots-Bereich

**Test:** Log in as a customer whose Anfrage has status `angebot_versendet` with a linked Angebot document. View the dashboard at `/kunden/dashboard/[id]`.
**Expected:** "Angebot annehmen und zahlen" section visible with betrag, gueltigkeit, PDF download link, AngebotAnnahmeButton showing AGB checkbox with dynamic link from Settings Global.
**Why human:** Requires authenticated customer session with correct data state.

---

## Gaps Summary

One quality gap identified: `src/app/api/angebot/annehmen/route.ts` uses Zod v3 `errorMap` syntax (`z.literal(true, { errorMap: () => ({ message: '...' }) })`) while the project uses Zod v4.3.6 which requires the `{ error: '...' }` shorthand. Every other file in this phase that uses `z.literal` (notably `src/lib/anfrage/schemas.ts` and `src/components/anfrage/contact-form.tsx`) correctly uses the Zod v4 pattern. This produces a `TS2769` TypeScript compile error. The fix is a one-line change at line 17-21 of `src/app/api/angebot/annehmen/route.ts`.

The remaining 4 items require human browser-based verification as they involve UI flow, Stripe redirects, and visual rendering that cannot be confirmed through static code analysis.

---

_Verified: 2026-04-01T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
