---
phase: 29-kunden-self-service
plan: 04
subsystem: auth
tags: [payload-auth, password-reset, react-email, email-queue, next-auth]

# Dependency graph
requires:
  - phase: 25-email-system
    provides: email queue, render pipeline, event matrix, template registry
  - phase: 29-kunden-self-service/01
    provides: status system extension, anfrage-detail view patterns
provides:
  - Custom password reset flow with branded email template
  - Passwort-vergessen page with anti-leak success message
  - Passwort-reset page with token validation and redirect
  - Payload auth forgotPassword override routing through email queue
  - Login page "Passwort vergessen?" link
affects: [kunden-dashboard, auth, email-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payload auth forgotPassword override with generateEmailHTML returning empty string to suppress built-in transport"
    - "Anti-leak pattern: always show success on forgot-password regardless of email existence"
    - "Password reset email routed through project email queue instead of Payload default"

key-files:
  created:
    - src/lib/email/password-reset.ts
    - src/emails/templates/passwort-reset.tsx
    - src/components/kunden/passwort-vergessen-form.tsx
    - src/components/kunden/passwort-reset-form.tsx
    - src/app/(frontend)/kunden/passwort-vergessen/page.tsx
    - src/app/(frontend)/kunden/passwort-reset/[token]/page.tsx
  modified:
    - src/lib/email/types.ts
    - src/lib/email/event-matrix.ts
    - src/lib/email/render-email.ts
    - src/collections/system/users.ts
    - src/components/kunden/login-form.tsx

key-decisions:
  - "Payload auth override returns empty string from generateEmailHTML to suppress built-in email sending"
  - "Password reset email uses project email queue (Phase 25) instead of Payload default transport"
  - "EmailEventPayload extended with optional resetUrl field (no type assertions needed)"
  - "Template follows BaseLayout + EmailButton pattern (consistent with all other project emails)"
  - "Anti-leak: forgot-password always shows success regardless of response status"

patterns-established:
  - "Auth override pattern: auth object with forgotPassword.generateEmailHTML for custom email routing"
  - "Password reset token URL pattern: /kunden/passwort-reset/{token}"

requirements-completed: [KUND-04]

# Metrics
duration: 5min
completed: 2026-04-02
---

# Phase 29 Plan 04: Passwort-Reset Summary

**Custom password reset flow with Payload auth override routing branded emails through project email queue, anti-leak forgot-password UI, and token-based reset with 3-second redirect**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-02T22:02:50Z
- **Completed:** 2026-04-02T22:07:59Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Password reset emails routed through project email queue (not Payload default transport)
- Branded React Email template with BaseLayout wrapper and "Neues Passwort setzen" CTA button
- Forgot-password page with anti-leak success message (never reveals if email exists)
- Reset page with token validation, password match check, min 8 chars, and 3-second redirect to login
- Login page now has "Passwort vergessen?" link

## Task Commits

Each task was committed atomically:

1. **Task 1: Email infrastructure + Users auth override + Template** - `77ca62c` (feat)
2. **Task 2: Custom UI Pages + Login Link** - `d1d6912` (feat)

## Files Created/Modified
- `src/lib/email/password-reset.ts` - Queue helper that routes password reset emails through email queue
- `src/emails/templates/passwort-reset.tsx` - React Email template with BaseLayout, reset URL button, 1h expiry notice
- `src/lib/email/types.ts` - Added passwort_reset to EmailEventType, resetUrl to EmailEventPayload
- `src/lib/email/event-matrix.ts` - Added passwort_reset event config (empfaenger: kunde, template: passwort-reset)
- `src/lib/email/render-email.ts` - Registered passwort-reset template and buildTemplateProps case
- `src/collections/system/users.ts` - Changed auth from true to object with forgotPassword override
- `src/components/kunden/passwort-vergessen-form.tsx` - Email input form with anti-leak success pattern
- `src/components/kunden/passwort-reset-form.tsx` - New password form with validation and token expiry handling
- `src/app/(frontend)/kunden/passwort-vergessen/page.tsx` - Server page with centered card layout
- `src/app/(frontend)/kunden/passwort-reset/[token]/page.tsx` - Server page with Promise params pattern
- `src/components/kunden/login-form.tsx` - Added "Passwort vergessen?" link

## Decisions Made
- Payload auth override returns empty string from generateEmailHTML to suppress built-in email sending (Payload sends email with empty HTML body, but email queue handles the real sending)
- Password reset email uses project email queue (Phase 25) instead of Payload default transport for consistent branding and queue features (retry, dead-letter)
- EmailEventPayload extended with optional resetUrl field to avoid type assertions
- Template follows BaseLayout + EmailButton pattern for visual consistency with all other project emails
- Anti-leak: forgot-password always shows success regardless of API response status (security best practice)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Password reset flow complete and integrated with email queue
- All KUND-04 requirements fulfilled
- Phase 29 plans 02 and 03 (Rueckfrage-Antwort, Stornierung+Reklamation) still pending

## Self-Check: PASSED

All 6 created files verified on disk. Both task commits (77ca62c, d1d6912) found in git log.

---
*Phase: 29-kunden-self-service*
*Completed: 2026-04-02*
