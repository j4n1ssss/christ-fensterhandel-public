---
phase: 04-dashboards-und-rollen
plan: 03
subsystem: auth
tags: [customer-auth, payload-auth, dashboard, status-timeline, guest-tracking, react-hook-form, zod]

requires:
  - phase: 04-dashboards-und-rollen
    plan: 01
    provides: "Access control functions, role checks, status transitions, field-level access on interne_notizen"
provides:
  - "Customer auth flow (register with rolle=kunde, login, logout)"
  - "getCurrentUser() server-side auth utility"
  - "Protected /kunden/dashboard showing own Anfragen filtered by email"
  - "Anfrage detail page with Status-Timeline and product list"
  - "Guest tracking page at /status-pruefen with API route"
  - "Navigation header with auth-aware links (Anmelden/Dashboard)"
affects: [05-stripe, 05-n8n, frontend-navigation]

tech-stack:
  added: []
  patterns: [server-component-auth-redirect, local-api-email-filter, guest-tracking-api, credentials-include-fetch]

key-files:
  created:
    - src/lib/auth.ts
    - src/components/kunden/login-form.tsx
    - src/components/kunden/register-form.tsx
    - src/components/kunden/logout-button.tsx
    - src/components/kunden/anfragen-liste.tsx
    - src/components/kunden/anfrage-detail.tsx
    - src/components/kunden/status-timeline.tsx
    - src/components/kunden/gast-tracking-form.tsx
    - src/app/(frontend)/kunden/login/page.tsx
    - src/app/(frontend)/kunden/register/page.tsx
    - src/app/(frontend)/kunden/layout.tsx
    - src/app/(frontend)/kunden/dashboard/page.tsx
    - src/app/(frontend)/kunden/dashboard/[id]/page.tsx
    - src/app/(frontend)/status-pruefen/page.tsx
    - src/app/api/status-pruefen/route.ts
  modified:
    - src/app/(frontend)/layout.tsx

key-decisions:
  - "getCurrentUser() uses payload.auth({ headers }) for server-side auth in RSC pages"
  - "Dashboard queries Anfragen via Local API with manual email filter (bypasses access control)"
  - "Guest tracking uses POST API route with Zod validation, returns no sensitive data"
  - "Register form sends rolle=kunde in request body to Payload auth registration"
  - "Status-Timeline excludes geaendert_von field per user decision"
  - "Disabled payment button on bestaetigt status as Phase 5 placeholder"

patterns-established:
  - "Server-component auth pattern: getCurrentUser() + redirect if null"
  - "Ownership check pattern: verify kontaktdaten.email === user.email before rendering"
  - "Credentials-include pattern: all auth fetches use credentials: 'include' for HTTP-only cookies"
  - "Guest tracking pattern: public API route validates with Zod, returns filtered data only"

requirements-completed: [KUND-01, KUND-02, KUND-03, KUND-04]

duration: 8min
completed: 2026-03-10
---

# Phase 4 Plan 3: Kunden-Auth und Dashboard Summary

**Customer auth flow with login/register, protected dashboard showing own Anfragen with Status-Timeline, and guest tracking via Anfrage-Nr + Email**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-10T07:02:00Z
- **Completed:** 2026-03-10T07:10:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 22

## Accomplishments
- Complete customer auth flow: register (rolle=kunde), login, logout with HTTP-only cookies
- Protected /kunden/dashboard showing only own Anfragen filtered by email via Local API
- Anfrage detail page with Status-Timeline (chronological, no geaendert_von), product list, and Gesamtpreis
- Guest tracking at /status-pruefen with POST API route returning filtered status data
- Auth-aware navigation header (Anmelden when logged out, Dashboard when logged in)
- Interne Notizen and geaendert_von never exposed to customers or guests

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth utility + Login/Register pages** - `94fb8ac` (feat)
2. **Task 2: Kunden-Dashboard + Anfrage Detail + Status-Timeline + Gast-Tracking** - `d9e5f49` (feat)
3. **Task 3: Verify Kunden-Auth and Dashboard end-to-end** - checkpoint (human-verify, approved)

## Files Created/Modified
- `src/lib/auth.ts` - Server-side getCurrentUser() utility using payload.auth()
- `src/components/kunden/login-form.tsx` - Client component with RHF + Zod, credentials: include
- `src/components/kunden/register-form.tsx` - Client component with rolle=kunde, auto-login after register
- `src/components/kunden/logout-button.tsx` - Client component calling /api/users/logout
- `src/components/kunden/anfragen-liste.tsx` - Card-based list with status badges and price
- `src/components/kunden/anfrage-detail.tsx` - Detail view with products, price, payment placeholder
- `src/components/kunden/status-timeline.tsx` - Vertical timeline with colored dots, reverse-chronological
- `src/components/kunden/gast-tracking-form.tsx` - Form with inline results display
- `src/app/(frontend)/kunden/login/page.tsx` - RSC with auth redirect if already logged in
- `src/app/(frontend)/kunden/register/page.tsx` - RSC with auth redirect if already logged in
- `src/app/(frontend)/kunden/layout.tsx` - Minimal layout wrapper for /kunden routes
- `src/app/(frontend)/kunden/dashboard/page.tsx` - Protected RSC, queries Anfragen by user email
- `src/app/(frontend)/kunden/dashboard/[id]/page.tsx` - Protected RSC with ownership email check
- `src/app/(frontend)/status-pruefen/page.tsx` - Public page with GastTrackingForm
- `src/app/api/status-pruefen/route.ts` - POST endpoint with Zod validation, filtered response
- `src/app/(frontend)/layout.tsx` - Updated navigation with auth-aware links
- `src/collections/business/anfragen.ts` - Added admin view registration
- `src/payload.config.ts` - Registered dashboard and detail admin views
- `src/components/admin/dashboard-overview.tsx` - Admin dashboard with stat cards
- `src/components/admin/anfrage-detail-view.tsx` - Admin anfrage detail with 3-column layout
- `src/components/admin/status-timeline.tsx` - Admin status timeline
- `src/components/admin/status-workflow.tsx` - Admin status workflow buttons

## Decisions Made
- getCurrentUser() uses payload.auth({ headers }) for server-side authentication in React Server Components
- Dashboard queries use Local API (bypasses access control) with manual email filtering for ownership enforcement
- Guest tracking POST route returns only non-sensitive data (no kontaktdaten, no interne_notizen, no geaendert_von)
- Register form sends rolle='kunde' directly in Payload auth registration request body
- Disabled "Zur Zahlung" button on bestaetigt status as placeholder for Stripe integration in Phase 5

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - build succeeded, all pages render correctly, checkpoint verification approved by user.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Customer auth flow complete, ready for Stripe payment integration in Phase 5
- Dashboard and detail pages ready for "Zur Zahlung" button activation when Stripe is configured
- Guest tracking functional, no additional setup needed
- Phase 4 (Dashboards und Rollen) is now fully complete (all 3 plans done)

## Self-Check: PASSED

All key files verified on disk. Both task commits (94fb8ac, d9e5f49) confirmed in git history.

---
*Phase: 04-dashboards-und-rollen*
*Completed: 2026-03-10*
