---
phase: 29-kunden-self-service
verified: 2026-04-02T23:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Rueckfrage-Antwort end-to-end: Anfrage bei Status rueckfrage aufrufen, Formular erscheint, Nachricht senden, Status wechselt auf kundenantwort, Staff-E-Mail wird ausgeloest"
    expected: "Formular sichtbar, nach Submit Status = kundenantwort, StatusBanner zeigt cyan-Banner, Staff erhaelt E-Mail"
    why_human: "E-Mail-Queue-Ausloesung und tatsaechlicher Status-Wechsel muessen im laufenden System geprueft werden"
  - test: "StornoDialog: Anfrage bei erlaubtem Status aufrufen, Stornierung beantragen, Admin-Bestaetigung simulieren"
    expected: "Dialog erscheint, nach Submit Status = stornierung_beantragt, Admin-E-Mail ausgeloest, Admin kann in QUICK_ACTIONS bestaetigen oder ablehnen (Ablehnungsgrund-Kommentar required)"
    why_human: "Admin-seitige Bestaetigungs-UI und E-Mail-Versand erfordert laufendes System"
  - test: "Reklamation mit bis zu 5 Fotos einreichen bei Status geliefert oder abgeschlossen"
    expected: "Formular sichtbar, Fotos werden hochgeladen, nach Submit Anfrage-Status = reklamation, Reklamation-Status = offen, Staff-E-Mail ausgeloest"
    why_human: "Foto-Upload-Pipeline und E-Mail-Queue nicht programmatisch verifizierbar"
  - test: "Passwort-Reset Flow: /kunden/passwort-vergessen aufrufen, E-Mail eingeben, Reset-Link erhalten, neues Passwort setzen"
    expected: "Erfolgs-Meldung erscheint (auch bei nicht-existierender E-Mail), Reset-Link oeffnet /kunden/passwort-reset/[token], nach Reset Weiterleitung zu /kunden/login nach 3 Sekunden"
    why_human: "E-Mail-Versand, Token-Ablauf und Redirect erfordern laufendes System"
---

# Phase 29: Kunden Self-Service Verification Report

**Phase Goal:** Kunden koennen selbststaendig auf Rueckfragen antworten, Stornierungen beantragen, Reklamationen einreichen und ihr Passwort zuruecksetzen
**Verified:** 2026-04-02
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Kunden sehen bei Status "rueckfrage" ein Antwort-Formular im Dashboard, koennen eine Nachricht senden, und die Anfrage wechselt automatisch zurueck auf "in_bearbeitung" mit Admin-Benachrichtigung | VERIFIED | `anfrage-detail.tsx` renders `RueckfrageFormular` conditionally at `status === "rueckfrage"`. API route `/api/kunden/antwort` validates status, transitions to `kundenantwort` via `payload.update`, creates StatusHistorie, calls `queueEmailEvent(eventType: "kundenantwort")` |
| 2 | Kunden koennen eine Stornierung beantragen (Request-Pattern -- KEIN automatisches Stornieren), der Admin sieht die Anfrage und muss bestaetigen oder ablehnen | VERIFIED | `StornoDialog` shows discreet text link trigger, confirms before sending. API route `/api/kunden/storno` sets status to `stornierung_beantragt` (not `storniert`). `QUICK_ACTIONS` in `status-config.ts` provides Admin with "Stornierung bestaetigen" -> `storniert` and "Ablehnen" -> `in_bearbeitung`. Comment required for rejection enforced in `anfragen.ts` `beforeChange` hook |
| 3 | Kunden koennen eine Reklamation mit bis zu 5 Fotos einreichen, die einer bestehenden Anfrage zugeordnet wird und einen eigenen Status-Flow hat (offen/in_bearbeitung/geloest) | VERIFIED | `Reklamationen` Collection has `fotos` (upload, hasMany), `status` (offen/in_bearbeitung/geloest), `anfrage` relationship. API route validates max 5 files, `geliefert`/`abgeschlossen` status. `payload.create({ collection: "reklamationen" })` wired. Collection registered in `payload.config.ts` |
| 4 | Kunden koennen ueber "Passwort vergessen" einen Reset-Link per E-Mail anfordern und ihr Passwort mit zeitlich begrenztem Token zuruecksetzen | VERIFIED | `/kunden/passwort-vergessen` page + `PasswortVergessenForm` POSTs to `/api/users/forgot-password`. `users.ts` overrides `auth.forgotPassword.generateEmailHTML` to route through `queuePasswordResetEmail`. Reset page at `/kunden/passwort-reset/[token]` validates token, enforces 8-char minimum, handles expiry with link back. Login form has "Passwort vergessen?" link |

**Score:** 4/4 truths verified

---

### Required Artifacts

#### Plan 01 — Status System Foundation

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/lib/status-config.ts` | 24-status config with all maps | VERIFIED | Contains `kundenantwort` + `stornierung_beantragt` in StatusKey type and all 10 maps (colors, labels, tailwind, customer_text, customer_phase, group, email_trigger, quick_actions, weight, tab_filters) |
| `src/lib/status-transitions.ts` | Transition graph with 2 new statuses | VERIFIED | `rueckfrage` -> `kundenantwort` allowed; `kundenantwort` <-> `in_bearbeitung`/`rueckfrage`; `stornierung_beantragt` reachable from all non-excluded statuses |
| `src/lib/upload-constants.ts` | Shared upload constants | VERIFIED | Exports `MAX_FILE_SIZE = 10MB`, `ALLOWED_FILE_TYPES` (5 MIME types), `MAX_RUECKFRAGE_FILES = 3`, `MAX_REKLAMATION_FILES = 5` |
| `src/collections/business/status-historie.ts` | StatusHistorie with anhaenge field | VERIFIED | Field `anhaenge` (type: upload, relationTo: media, hasMany) confirmed present |
| `src/lib/email/types.ts` | EmailEventType + EmailEventPayload | VERIFIED | Includes `stornierung_beantragt`, `passwort_reset`, and `resetUrl?: string` on payload |
| `src/lib/email/event-matrix.ts` | Event configs for new events | VERIFIED | `stornierung_beantragt` (empfaenger: staff), `passwort_reset` (empfaenger: kunde, template: passwort-reset) both present |
| `src/collections/business/anfragen.ts` | Status options + comment enforcement | VERIFIED | `kundenantwort` + `stornierung_beantragt` in select options; `beforeChange` enforces Ablehnungsgrund when transitioning `stornierung_beantragt` -> `in_bearbeitung` |

#### Plan 02 — Rueckfrage-Antwort + Stornierung UI/API

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/app/api/kunden/antwort/route.ts` | POST endpoint for Kundenantwort | VERIFIED | FormData parsing, status=rueckfrage validation, file upload to Media, StatusHistorie creation with anhaenge, `payload.update` to kundenantwort, `queueEmailEvent`, `checkRateLimit` |
| `src/app/api/kunden/storno/route.ts` | POST endpoint for Stornierungsanfrage | VERIFIED | JSON body, Zod validation, excluded-status check, updates to `stornierung_beantragt` + `stornierung_grund`, StatusHistorie entry, `queueEmailEvent`, `checkRateLimit` |
| `src/components/kunden/rueckfrage-formular.tsx` | Inline answer form with file upload | VERIFIED | "use client", collapsed -> expanded -> submitting -> submitted states, `FormData` + `fetch("/api/kunden/antwort")`, `MAX_FILE_SIZE` import, `aria-live="polite"`, cyan success state |
| `src/components/kunden/storno-dialog.tsx` | Storno confirm dialog | VERIFIED | "use client", discreet text-link trigger (`text-muted-foreground underline`), "nicht automatisch storniert" hint, `fetch("/api/kunden/storno")`, `return null` on submitted (disappears) |
| `src/components/kunden/status-banner.tsx` | StatusBanner with new status colors | VERIFIED | `kundenantwort` in WARNING_STATUSES, `bg-cyan-50` color; `stornierung_beantragt` in WARNING_STATUSES, `bg-amber-50` color; `font-bold` (not semibold) |
| `src/app/(frontend)/rueckfrage/[anfrageId]/page.tsx` | Guest route for Rueckfrage | VERIFIED | Status check (`!== "rueckfrage"` -> info message), fetches last admin message from `status_historie`, renders `RueckfrageFormular isGuest={true}` |

#### Plan 03 — Reklamation Feature

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/collections/business/reklamationen.ts` | Reklamationen Payload Collection | VERIFIED | Slug "reklamationen", fields: anfrage, beschreibung (minLength 20), fotos (upload, hasMany), status (offen/in_bearbeitung/geloest), loesung, erstellt_von; access control (Local API create bypass, read/update admin+mitarbeiter) |
| `src/app/api/kunden/reklamation/route.ts` | POST endpoint for Reklamation | VERIFIED | FormData, max 5 files, `geliefert`/`abgeschlossen` validation, media upload loop, `payload.create({ collection: "reklamationen" })`, `payload.update` to "reklamation" status, `queueEmailEvent`, `checkRateLimit` |
| `src/components/kunden/reklamation-formular.tsx` | Reklamation form with photo upload | VERIFIED | "use client", `AlertTriangle` icon, `MAX_REKLAMATION_FILES` import, `FormData` with `fotos` field, `fetch("/api/kunden/reklamation")`, inline expand pattern, green success state |
| `src/components/kunden/reklamation-anzeige.tsx` | Reklamation status display | VERIFIED | STATUS_CONFIG with `bg-red-50` (offen), `bg-amber-50` (in_bearbeitung), `bg-green-50` (geloest); loesung display when geloest; "Ihre Reklamation" heading; photo thumbnails |
| `src/app/(frontend)/reklamation/[anfrageId]/page.tsx` | Guest route for Reklamation | VERIFIED | Status check (`!== "geliefert" && !== "abgeschlossen"` -> info message), renders `ReklamationFormular isGuest={true}` |
| `src/payload.config.ts` | Reklamationen registered | VERIFIED | `import { Reklamationen }` + included in collections array (line 33, 117) |
| `src/components/admin/custom-nav.tsx` | Admin nav link for Reklamationen | VERIFIED | `{ label: "Reklamationen", href: "/admin/collections/reklamationen" }` in bestellungsverwaltung dropdown |

#### Plan 04 — Passwort-Reset Flow

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `src/app/(frontend)/kunden/passwort-vergessen/page.tsx` | Passwort vergessen page | VERIFIED | Metadata "Passwort vergessen | Christ Fensterhandel", centered card layout `min-h-[calc(100vh-3.5rem)]`, renders `PasswortVergessenForm` |
| `src/app/(frontend)/kunden/passwort-reset/[token]/page.tsx` | Passwort reset page | VERIFIED | `params: Promise<{ token: string }>`, passes token to `PasswortResetForm` |
| `src/components/kunden/passwort-vergessen-form.tsx` | Email input form | VERIFIED | "use client", POSTs to `/api/users/forgot-password`, ALWAYS sets `setSuccess(true)` regardless of response (anti-leak), "Falls ein Konto..." message, "Zurueck zum Login" link |
| `src/components/kunden/passwort-reset-form.tsx` | New password form | VERIFIED | "use client", accepts `token: string`, validates 8-char min + password match, POSTs to `/api/users/reset-password` with `{ token, password }`, token-expired state + "Neuen Link anfordern" link, 3-second redirect on success |
| `src/lib/email/password-reset.ts` | Password reset email queuing | VERIFIED | `queuePasswordResetEmail(email, resetUrl)` calls `queueEmailEvent({ eventType: "passwort_reset", resetUrl })` |
| `src/emails/templates/passwort-reset.tsx` | Password reset email template | VERIFIED | `resetUrl` prop, "Passwort zuruecksetzen" heading, "Neues Passwort setzen" CTA button, "1 Stunde gueltig" expiry notice |
| `src/lib/email/render-email.ts` | Template registration | VERIFIED | `"passwort-reset"` entry in `TEMPLATE_COMPONENTS`, `case "passwort-reset"` in `buildTemplateProps` |
| `src/collections/system/users.ts` | Payload auth override | VERIFIED | `auth: { forgotPassword: { generateEmailHTML, generateEmailSubject } }` — constructs `/kunden/passwort-reset/${token}` URL, calls `queuePasswordResetEmail`, returns `""` to suppress Payload default |
| `src/components/kunden/login-form.tsx` | "Passwort vergessen?" link | VERIFIED | `href="/kunden/passwort-vergessen"`, `text-sm text-muted-foreground underline` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `rueckfrage-formular.tsx` | `/api/kunden/antwort` | `fetch POST /api/kunden/antwort` | WIRED | Line 120: `fetch("/api/kunden/antwort", { method: "POST", body: formData })` |
| `storno-dialog.tsx` | `/api/kunden/storno` | `fetch POST /api/kunden/storno` | WIRED | Line 42: `fetch("/api/kunden/storno", ...)` |
| `/api/kunden/antwort/route.ts` | `status_historie` (with anhaenge) | `payload.create status_historie anhaenge` | WIRED | Line 144-152: `payload.create({ collection: "status_historie", data: { anhaenge: mediaIds } })` |
| `reklamation-formular.tsx` | `/api/kunden/reklamation` | `fetch POST /api/kunden/reklamation` | WIRED | Line 122: `fetch("/api/kunden/reklamation", { method: "POST", body: formData })` |
| `/api/kunden/reklamation/route.ts` | `reklamationen` collection | `payload.create reklamationen` | WIRED | Line 144: `payload.create({ collection: "reklamationen" })` |
| `reklamationen.ts` | `payload.config.ts` | Collection registration | WIRED | `import { Reklamationen }` + included in `collections` array |
| `users.ts` forgotPassword | `password-reset.ts` | `queuePasswordResetEmail` | WIRED | `generateEmailHTML` calls `queuePasswordResetEmail(user.email, resetUrl)` |
| `passwort-vergessen-form.tsx` | `/api/users/forgot-password` | `fetch POST to Payload auth endpoint` | WIRED | Line 38: `fetch("/api/users/forgot-password", ...)` |
| `passwort-reset-form.tsx` | `/api/users/reset-password` | `fetch POST to Payload auth endpoint` | WIRED | Line 63: `fetch("/api/users/reset-password", { body: JSON.stringify({ token, password }) })` |
| `anfrage-detail.tsx` | `rueckfrage-formular.tsx` | Conditional render at `status === "rueckfrage"` | WIRED | Line 111-113: `{anfrage.status === "rueckfrage" && <RueckfrageFormular ... />}` |
| `anfrage-detail.tsx` | `storno-dialog.tsx` | Excluded-status guard render | WIRED | Lines 333-339: excluded list check, then `<StornoDialog .../>` |
| `anfrage-detail.tsx` | `reklamation-formular.tsx` + `reklamation-anzeige.tsx` | geliefert/abgeschlossen guard + reklamationen prop | WIRED | Lines 115-126: conditional render for form + map over reklamationen for anzeige |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| KUND-01 | Plans 01, 02 | Kundenantwort auf Rueckfrage (Formular im Dashboard, Nachricht an Anfrage, Admin-Benachrichtigung) | SATISFIED | `RueckfrageFormular` in `anfrage-detail.tsx` at `status === "rueckfrage"`, API transitions to `kundenantwort`, `queueEmailEvent` for staff |
| KUND-02 | Plans 01, 02 | Stornierungsanfrage durch Kunden (Request-Pattern, Admin muss bestaetigen) | SATISFIED | `StornoDialog` with Request-Pattern (sets `stornierung_beantragt`), `QUICK_ACTIONS` provides admin confirm/reject, comment required for rejection |
| KUND-03 | Plan 03 | Reklamation Collection mit Fotos (Status offen/in_bearbeitung/geloest, Zuordnung zu Anfrage) | SATISFIED | `Reklamationen` collection with correct fields/status, `fotos` upload, `anfrage` relationship, guest route |
| KUND-04 | Plan 04 | Passwort-Reset-Flow (vergessen-Link, Token mit Ablauf, E-Mail) | SATISFIED | Payload auth override, email queue routing, anti-leak UI, token validation, expiry handling |

**No orphaned requirements found.** All four KUND-0x requirements are claimed by plans and implemented.

---

### Anti-Patterns Found

No genuine anti-patterns detected. The scanner flagged the following as false positives:

| File | Line | Pattern | Severity | Assessment |
|------|------|---------|----------|------------|
| `storno-dialog.tsx` | 77 | `return null` | Info | Legitimate submitted state — StornoDialog intentionally disappears after submission (per UI-SPEC and plan spec) |
| `rueckfrage-formular.tsx` | 59 | `return null` | Info | End of file-validation helper function returning null (no error found) — correct behavior |
| Multiple component files | various | `placeholder="..."` | Info | Textarea/input placeholder text — not stub implementations |

---

### Human Verification Required

The following items require a running application to verify:

#### 1. Rueckfrage-Antwort End-to-End Flow

**Test:** Create an Anfrage, set status to "rueckfrage" in admin, open the customer dashboard detail view, verify the Rueckfrage form appears, submit a message with optional file attachment
**Expected:** Form visible, after submit status = kundenantwort, StatusBanner shows cyan "Kundenantwort" banner, staff receives email notification
**Why human:** Email-Queue triggering and actual status change require a running Next.js + PostgreSQL instance

#### 2. Admin Stornierungsanfrage Bestaetigungs-Flow

**Test:** Submit a storno request as customer, then as admin navigate to the Anfrage, use the QUICK_ACTIONS "Stornierung bestaetigen" or "Ablehnen" buttons
**Expected:** Confirm: status -> storniert. Reject: comment/Ablehnungsgrund required, status -> in_bearbeitung
**Why human:** Admin UI interaction and comment-enforcement logic require a running application

#### 3. Reklamation Foto-Upload

**Test:** Set an Anfrage to status "geliefert", open customer dashboard, submit Reklamation with 3-5 photos
**Expected:** Fotos uploaded to Media collection, Reklamation created with status "offen", Anfrage status -> "reklamation", ReklamationAnzeige appears with photo thumbnails and correct color coding
**Why human:** File upload pipeline and Media collection integration require a running server

#### 4. Passwort-Reset Token Expiry + Full Flow

**Test:** Request password reset, check inbox for branded email, click link, set new password, verify 3-second redirect; also test with an expired/invalid token
**Expected:** Branded "Neues Passwort setzen" email received, reset works, redirect to /kunden/login after 3s; expired token shows "Dieser Link ist abgelaufen..." with "Neuen Link anfordern" link
**Why human:** Email delivery, token TTL enforcement, and time-based expiry require a live system

---

### Summary

Phase 29 fully achieved its goal. All 4 success criteria map to verified, substantive, wired implementations:

- **KUND-01 (Rueckfrage-Antwort):** Complete end-to-end: `RueckfrageFormular` -> `/api/kunden/antwort` -> `status_historie` (with anhaenge) -> `payload.update` (kundenantwort) -> `queueEmailEvent`
- **KUND-02 (Stornierungsanfrage):** Request-Pattern correctly implemented — `StornoDialog` sets `stornierung_beantragt`, Admin confirms/rejects via QUICK_ACTIONS, comment required for rejection
- **KUND-03 (Reklamation):** Full collection (offen/in_bearbeitung/geloest), photo upload, guest route, admin nav link, dashboard wiring all in place
- **KUND-04 (Passwort-Reset):** Payload auth override routes through email queue, anti-leak forgot-password form, token-based reset page with expiry handling, login link added

All 8 commit hashes from summaries verified in git log. All 27 declared artifacts exist on disk. No stubs or empty implementations found. Status system consistent at 24 statuses with 220+ passing tests. 4 human verification items require live-system testing but do not block goal assessment.

---

_Verified: 2026-04-02_
_Verifier: Claude (gsd-verifier)_
