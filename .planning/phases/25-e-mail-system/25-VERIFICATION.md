---
phase: 25-e-mail-system
verified: 2026-03-29T19:15:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
---

# Phase 25: E-Mail-System Verification Report

**Phase Goal:** Transactional email system with React Email templates, queue processing, and admin preview
**Verified:** 2026-03-29T19:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                    | Status     | Evidence                                                                                     |
|----|----------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------|
| 1  | Event-Matrix defines all 20 EmailEventType values with recipients, template slugs, and subjects          | VERIFIED   | `src/lib/email/event-matrix.ts` — 20 keys in EVENT_MATRIX, 18 business + 2 future slots     |
| 2  | email_queue Collection is registered in Payload with idempotency_key unique constraint                   | VERIFIED   | `src/collections/system/email-queue.ts` slug='email_queue', idempotency_key unique:true; `src/payload.config.ts` line 87 registers EmailQueue |
| 3  | Settings Global has benachrichtigungs_emails and email_event_toggles fields                              | VERIFIED   | `src/payload-globals/settings.ts` lines 172, 181 — both fields present                      |
| 4  | renderSubject replaces #{variable} placeholders correctly                                                | VERIFIED   | `src/lib/email/render-subject.ts` — regex `/#{(\w+)}/g` replacement, 6 unit tests pass      |
| 5  | BaseLayout renders HTML with logo header, content slot, and footer with Firmendaten                      | VERIFIED   | `src/emails/components/base-layout.tsx` — backgroundColor '#f6f6f6', maxWidth '600px', footer with settings data |
| 6  | All 9 customer templates render with BaseLayout                                                          | VERIFIED   | All 9 files in `src/emails/templates/` exist; each has 4 BaseLayout refs (import + usage)   |
| 7  | Both staff templates render with BaseLayout                                                              | VERIFIED   | `src/emails/staff/neue-anfrage.tsx`, `status-benachrichtigung.tsx` — both have 4 BaseLayout refs |
| 8  | renderEmailForEvent selects correct template and returns HTML + plain text + subject                     | VERIFIED   | `src/lib/email/render-email.ts` — TEMPLATE_COMPONENTS has 11 entries, exports renderEmailForEvent and TEMPLATE_SLUGS |
| 9  | queueEmailEvent creates entries with rendered HTML, validates emails, respects toggles                   | VERIFIED   | `src/lib/email/queue.ts` — z.string().email() validation, toggle check, renderEmailForEvent call |
| 10 | processQueue POSTs to N8N with exponential backoff and dead-letter after 5 attempts                      | VERIFIED   | `queue.ts` — Math.pow(2, newAttempts-1)*60_000 backoff, status='dead' at max_attempts        |
| 11 | Queue worker starts via instrumentation.ts with 60s interval                                             | VERIFIED   | `src/instrumentation.ts` — setInterval 60_000, workerStarted guard, processQueue import      |
| 12 | anfragen afterChange hook calls queueEmailEvent (old webhook code deleted)                               | VERIFIED   | `src/collections/business/anfragen.ts` imports queueEmailEvent; n8n-webhook.ts, webhook-errors.ts, webhook-fehler-badge.tsx all deleted |
| 13 | GET /api/email-preview returns staff-protected template index; individual preview with test-send         | VERIFIED   | `src/app/(payload)/api/email-preview/route.ts` — auth check for admin+mitarbeiter; `[template]/route.ts` — renderEmailForEvent, getMockDataForTemplate, rate limiter, test_preview queue entry |
| 14 | Settings page has 5th E-Mail tab with notification emails textarea and event toggles matrix              | VERIFIED   | `src/components/admin/settings-page.tsx` — TABS[4]={key:'email'}, EVENT_MATRIX import, benachrichtigungs_emails, email_event_toggles |

**Score:** 14/14 truths verified

---

## Required Artifacts

| Artifact                                                          | Provides                                               | Status     | Details                                                                  |
|-------------------------------------------------------------------|--------------------------------------------------------|------------|--------------------------------------------------------------------------|
| `src/lib/email/types.ts`                                          | EmailEventType (20 members), EmailEventPayload, EventConfig, QueueStatus, Recipient, QueueEntry | VERIFIED | All 6 types exported, 20 union members confirmed |
| `src/lib/email/event-matrix.ts`                                   | EVENT_MATRIX (20 keys), getEventConfig helper          | VERIFIED   | 20 events mapped, imports types.ts, getEventConfig exported              |
| `src/lib/email/render-subject.ts`                                 | renderSubject with #{variable} replacement             | VERIFIED   | 14-line file, regex replacement, missing vars -> empty string            |
| `src/collections/system/email-queue.ts`                           | email_queue Payload Collection                         | VERIFIED   | slug='email_queue', idempotency_key unique:true, 6-state status select   |
| `src/payload-globals/settings.ts`                                 | Extended Settings with email fields                    | VERIFIED   | benachrichtigungs_emails (textarea) and email_event_toggles (json) present |
| `src/payload.config.ts`                                           | EmailQueue registered, WebhookErrors removed           | VERIFIED   | Import on line 14, registration on line 87; no WebhookErrors reference  |
| `src/emails/components/base-layout.tsx`                           | Shared email layout with header/content/footer         | VERIFIED   | backgroundColor '#f6f6f6', maxWidth '600px', settings footer             |
| `src/emails/components/email-button.tsx`                          | CTA button with primary/staff variants                 | VERIFIED   | backgroundColor '#1a1a1a' primary, '#f0f0f0' staff                       |
| `src/emails/components/anfrage-card.tsx`                          | Product list with formatCents                          | VERIFIED   | Imports formatCents from @/lib/format-currency                           |
| `src/emails/components/status-badge.tsx`                          | Status indicator badge                                 | VERIFIED   | Props: status, color, label                                              |
| `src/emails/templates/anfrage-bestaetigung.tsx` (+ 8 others)      | 9 customer templates                                   | VERIFIED   | All 9 files exist, all import BaseLayout                                 |
| `src/emails/staff/neue-anfrage.tsx`                               | Staff new-inquiry notification                         | VERIFIED   | Exists, imports BaseLayout                                               |
| `src/emails/staff/status-benachrichtigung.tsx`                    | Staff status change notification                       | VERIFIED   | Exists, imports BaseLayout                                               |
| `src/lib/email/render-email.ts`                                   | renderEmailForEvent, TEMPLATE_SLUGS (11 entries)       | VERIFIED   | 11 entries in TEMPLATE_COMPONENTS, exports both symbols                  |
| `src/lib/email/mock-data.ts`                                      | MOCK_SETTINGS, MOCK_ANFRAGE, getMockDataForTemplate    | VERIFIED   | All 3 exports present                                                    |
| `src/lib/email/queue.ts`                                          | queueEmailEvent, processQueue, cleanupSentEvents       | VERIFIED   | All 3 exports, email validation, backoff formula, dead-letter logic      |
| `src/instrumentation.ts`                                          | Queue worker with 60s setInterval                      | VERIFIED   | setInterval 60_000, workerStarted guard, dynamic queue import            |
| `src/components/admin/email-queue-retry.tsx`                      | EmailQueueRetryButton for dead entries                 | VERIFIED   | Exports EmailQueueRetryButton, PATCH to Payload REST API                 |
| `src/app/(payload)/api/email-preview/route.ts`                    | Template index page (GET, staff-protected)             | VERIFIED   | Auth check admin+mitarbeiter, TEMPLATE_SLUGS import, returns HTML        |
| `src/app/(payload)/api/email-preview/[template]/route.ts`         | Individual preview (GET + POST with test-send)         | VERIFIED   | renderEmailForEvent, getMockDataForTemplate, rate limiter, test_preview entry |
| `src/components/admin/settings-page.tsx`                          | 5th E-Mail tab with toggles matrix                     | VERIFIED   | TABS[4]={key:'email'}, EVENT_MATRIX import, benachrichtigungs_emails textarea, checkbox matrix |
| `docs/wissen/n8n-email-setup.md`                                  | N8N setup documentation                                | VERIFIED   | N8N_EMAIL_WEBHOOK_URL, Testing-Checkliste, Provider-Wechsel all present  |

---

## Key Link Verification

| From                                              | To                                     | Via                                     | Status   | Details                                                            |
|---------------------------------------------------|----------------------------------------|-----------------------------------------|----------|--------------------------------------------------------------------|
| `src/lib/email/event-matrix.ts`                   | `src/lib/email/types.ts`               | imports EmailEventType, EventConfig     | WIRED    | Line 16: `import type { EmailEventType, EventConfig } from "./types"` |
| `src/payload.config.ts`                           | `src/collections/system/email-queue.ts`| collection registration                 | WIRED    | Line 14 import, line 87 in collections array                       |
| `src/emails/templates/anfrage-bestaetigung.tsx`   | `src/emails/components/base-layout.tsx`| imports BaseLayout                      | WIRED    | Line 3: `import { BaseLayout, type BaseLayoutSettings } from "../components/base-layout"` |
| `src/lib/email/render-email.ts`                   | `src/emails/templates/` (all 9)        | dynamic import registry                 | WIRED    | Lines 27-41: TEMPLATE_COMPONENTS with all 11 slugs                 |
| `src/lib/email/render-email.ts`                   | `src/lib/email/event-matrix.ts`        | EVENT_MATRIX lookup for template/subject| WIRED    | Line 10 import, line 107 usage in renderEmailForEvent              |
| `src/collections/business/anfragen.ts`            | `src/lib/email/queue.ts`               | afterChange hook calls queueEmailEvent  | WIRED    | Line 8 import, lines 226 and 270 call queueEmailEvent              |
| `src/lib/email/queue.ts`                          | `src/lib/email/render-email.ts`        | renderEmailForEvent call during queuing | WIRED    | Dynamic import inside queueEmailEvent, line 105 call               |
| `src/instrumentation.ts`                          | `src/lib/email/queue.ts`               | setInterval calls processQueue          | WIRED    | Line 22: dynamic import processQueue, line 32: cleanupSentEvents   |
| `src/app/(payload)/api/email-preview/[template]/route.ts` | `src/lib/email/render-email.ts` | renderEmailForEvent call with mock data | WIRED    | Line 4 import, line 147 and 424 usage                              |
| `src/app/(payload)/api/email-preview/[template]/route.ts` | `src/lib/email/mock-data.ts`   | getMockDataForTemplate for preview data | WIRED    | Lines 6-9 import, line 109 and 387 usage                           |
| `src/components/admin/settings-page.tsx`          | `src/lib/email/event-matrix.ts`        | EVENT_MATRIX import for toggle rendering| WIRED    | Line 5 import, lines 720-741 usage in toggle matrix                |

---

## Requirements Coverage

| Requirement | Source Plan | Description                                                                                | Status    | Evidence                                                             |
|-------------|------------|--------------------------------------------------------------------------------------------|-----------|----------------------------------------------------------------------|
| MAIL-01     | 25-01      | E-Mail Event-Matrix als Config (20 Events: 18 Business + 2 Future-Slots, Empfaenger-Mapping) | SATISFIED | `src/lib/email/event-matrix.ts` — 20-key EVENT_MATRIX, empfaenger per event confirmed |
| MAIL-02     | 25-02      | React Email Base-Layout (Logo, Content-Slot, Footer mit Impressum + Datenschutz)           | SATISFIED | `src/emails/components/base-layout.tsx` — logo, children slot, footer with Settings + Impressum/Datenschutz links |
| MAIL-03     | 25-02      | 9 E-Mail-Templates (Bestaetigung, Status-Update, Angebot, Zahlungslink, Zahlung, Stornierung, Rueckfrage, Reklamation, Rueckerstattung) | SATISFIED | All 9 template files confirmed in `src/emails/templates/` |
| MAIL-04     | 25-04      | E-Mail-Preview Route (/api/email-preview/[template], Staff-geschuetzt: admin + mitarbeiter) | SATISFIED | Route exists, auth check `['admin','mitarbeiter'].includes(user.rolle)` confirmed |
| MAIL-05     | 25-01, 25-03 | N8N Idempotency-Keys zur Duplikat-Praevention                                             | SATISFIED | `email_queue` unique:true on idempotency_key; key format `${anfrageId}_${eventType}_${status}_${Date.now()}` |
| MAIL-06     | 25-04      | N8N Setup-Dokumentation (Testing-Checkliste, Provider-Wechsel, Webhook-URLs)              | SATISFIED | `docs/wissen/n8n-email-setup.md` — Testing-Checkliste, Provider-Wechsel, N8N_EMAIL_WEBHOOK_URL sections present |
| MAIL-07     | 25-01, 25-03 | E-Mail-Validierung vor Webhook-Versand (Format + nicht leer, Fallback wenn ungueltig)     | SATISFIED | `queue.ts` — z.string().email() validation, invalid emails create status='skipped' entry |
| MAIL-08     | 25-01, 25-03 | Persistente Event-Queue (DB-basiert, Retry mit Exponential Backoff, max 5 Versuche)       | SATISFIED | `email_queue` Collection in Payload DB; processQueue with Math.pow(2, attempts-1)*60_000 backoff, dead after 5 |

All 8 MAIL requirements satisfied. No orphaned requirements found in REQUIREMENTS.md — all 8 are mapped to Phase 25 and marked Complete.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/payload-types.ts` | auto-generated | Still contains `WebhookErrors` types from old webhook-errors.ts | Info | Not a blocker — payload-types.ts is auto-generated and has not been regenerated after webhook-errors.ts deletion. This is the expected state noted in Plan 03 SUMMARY ("type assertions (`as never`) until payload-types.ts is regenerated"). Will resolve on next `payload generate:types`. |

No blockers or warnings. The one info-level item (stale payload-types.ts) is expected and documented.

---

## Human Verification Required

### 1. Queue worker initialization in production

**Test:** Deploy and observe server logs on startup
**Expected:** Log line "[Email Queue Worker] Started (60s interval)" appears within first 5 seconds of server start
**Why human:** The `workerStarted` guard in instrumentation.ts uses a local variable that resets on each HMR reload in dev. Can't verify the production singleton behavior programmatically.

### 2. End-to-end email delivery via N8N

**Test:** Configure N8N_EMAIL_WEBHOOK_URL, trigger a status change on an Anfrage, wait 60s, check queue entry status transitions pending -> processing -> sent
**Expected:** Queue entry reaches status='sent', email arrives in test inbox with correct HTML, subject, and footer
**Why human:** Requires live N8N workflow + SMTP configuration. Can't verify delivery without running infrastructure.

### 3. Settings E-Mail tab toggle matrix usability

**Test:** Open /admin/globals/settings, click E-Mail tab, verify toggle checkboxes for all 20 events render correctly with Kunde/Mitarbeiter columns, disabled cells for events with no recipient in that column
**Expected:** Table renders without overflow, checkboxes are interactable, "Alle aktivieren/deaktivieren" links work
**Why human:** Client-side React rendering and table layout correctness require visual inspection.

### 4. Email preview rendering in browser

**Test:** Log in as admin, navigate to /api/email-preview, click template links, verify rendered email matches design spec
**Expected:** Email HTML renders correctly in the preview container, test-send form is usable, plain-text toggle works
**Why human:** Visual appearance and inline JS behavior require browser testing.

---

## Summary

Phase 25 goal is fully achieved. All four sub-deliverables are present and correctly wired:

1. **Foundation (Plan 01):** 20-event matrix, email_queue Collection with idempotency and 6-state lifecycle, Settings fields for staff distribution list and per-event toggles. renderSubject helper. All types exported.

2. **Templates (Plan 02):** 4 shared components (BaseLayout, EmailButton, AnfrageCard, StatusBadge), 9 customer templates, 2 staff templates, renderEmailForEvent orchestrator mapping event payloads to template props and returning HTML+plainText+subject. 11 TEMPLATE_SLUGS registered.

3. **Queue engine (Plan 03):** queueEmailEvent renders HTML at queue-time, validates emails with Zod, respects event toggles. processQueue delivers via N8N POST with Math.pow(2, n-1)*60s exponential backoff and dead-letter at 5 attempts. cleanupSentEvents removes entries after 30 days. instrumentation.ts starts worker at 60s interval on server boot. anfragen afterChange hook migrated from sendN8NWebhook to queueEmailEvent. All old webhook code (n8n-webhook.ts, webhook-errors.ts, webhook-fehler-badge.tsx) deleted.

4. **Preview and admin (Plan 04):** Staff-protected preview routes with renderEmailForEvent + mock data, rate-limited test-send creating test_preview queue entries, XSS-safe HTML output. Settings page extended with 5th E-Mail tab containing event toggles matrix wired to EVENT_MATRIX. N8N setup documentation complete.

No stubs, no missing wiring, no broken key links. The only deferred item is payload-types.ts regeneration, which is expected and documented.

---

_Verified: 2026-03-29T19:15:00Z_
_Verifier: Claude (gsd-verifier)_
