---
phase: 06-website-und-compliance
plan: 02
subsystem: i18n, compliance
tags: [i18n, dsgvo, cookie-consent, anonymization, middleware, next-js]

# Dependency graph
requires:
  - phase: 06-01
    provides: Puck page builder with catch-all routing, Navigation/Footer globals
provides:
  - i18n URL-prefix routing (middleware redirects bare paths to /de/)
  - Locale-prefixed Puck page rendering with fallback to German
  - DE/EN language toggle component in header
  - DSGVO cookie consent banner with 3 categories
  - Admin customer data anonymization endpoint
affects: [07-deployment]

# Tech tracking
tech-stack:
  added: [js-cookie (already installed)]
  patterns: [locale-prefix routing via middleware, locale param in Payload queries]

key-files:
  created:
    - src/lib/i18n.ts
    - src/middleware.ts
    - src/app/(frontend)/[locale]/[...slug]/page.tsx
    - src/app/(frontend)/[locale]/page.tsx
    - src/components/i18n/language-toggle.tsx
    - src/components/cookie-banner/cookie-banner.tsx
    - src/app/(payload)/api/admin/anonymize-customer/route.ts
  modified:
    - src/app/(frontend)/layout.tsx
    - src/app/(frontend)/[...slug]/page.tsx
    - src/app/(frontend)/page.tsx

key-decisions:
  - "Middleware skips non-CMS routes (konfigurator, warenkorb, kunden, admin, api) to avoid breaking existing functionality"
  - "Old catch-all and root page.tsx kept as redirect fallbacks rather than deleted"
  - "Locale passed as 'any' cast to Payload find() due to generated type mismatch with localization config"
  - "Custom toggle switches in cookie banner instead of shadcn Switch (no UI component library installed)"
  - "Anonymization replaces all kontaktdaten fields with GELOESCHT, keeps produkte/preis for statistics"

patterns-established:
  - "i18n locale detection: first URL segment after / checked against LOCALES constant"
  - "Payload locale queries: locale as any, fallbackLocale 'de' as any for generated type compatibility"

requirements-completed: [I18N-01, I18N-02, I18N-03, DSGVO-01, DSGVO-02, DSGVO-03]

# Metrics
duration: 4min
completed: 2026-03-10
---

# Phase 6 Plan 2: i18n + DSGVO Summary

**DE/EN locale-prefix routing with middleware, language toggle, 3-category cookie banner, and admin customer anonymization endpoint**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-10T10:33:42Z
- **Completed:** 2026-03-10T10:37:59Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- i18n middleware redirects bare CMS paths to /de/ prefix, skips all non-CMS routes
- Locale-prefixed catch-all and home routes render Puck pages with locale parameter and German fallback
- Language toggle (DE|EN) in header enables switching between locale-prefixed URLs
- Cookie banner with Notwendig/Statistik/Marketing categories, 365-day persistent consent
- Admin-only POST /api/admin/anonymize-customer replaces kontaktdaten with GELOESCHT
- Datenschutz checkbox in contact form verified still present (DSGVO-01)

## Task Commits

Each task was committed atomically:

1. **Task 1: i18n Middleware + Locale Route + Language Toggle + Layout Updates** - `4a5b8f4` (feat)
2. **Task 2: Cookie-Banner + Datenloeschung + DSGVO-01 Verification** - `5d1205d` (feat)

## Files Created/Modified
- `src/lib/i18n.ts` - Locale constants, type helpers, getAlternateLocale
- `src/middleware.ts` - i18n redirect middleware, skips non-CMS routes
- `src/app/(frontend)/[locale]/[...slug]/page.tsx` - Locale-prefixed Puck page rendering
- `src/app/(frontend)/[locale]/page.tsx` - Locale-prefixed homepage with Puck fallback
- `src/app/(frontend)/[...slug]/page.tsx` - Redirects to locale-prefixed version
- `src/app/(frontend)/page.tsx` - Redirects root to /de/
- `src/components/i18n/language-toggle.tsx` - DE/EN toggle client component
- `src/components/cookie-banner/cookie-banner.tsx` - DSGVO cookie consent with 3 categories
- `src/app/(payload)/api/admin/anonymize-customer/route.ts` - Admin data anonymization
- `src/app/(frontend)/layout.tsx` - Added LanguageToggle and CookieBanner

## Decisions Made
- Middleware skips non-CMS routes via prefix list to avoid breaking konfigurator/warenkorb/kunden
- Old catch-all kept as redirect fallback (safety net alongside middleware)
- Locale cast to `any` in Payload queries due to generated type mismatch with localization config
- Custom toggle switches built inline (no shadcn Switch component available)
- Anonymization replaces all kontaktdaten with GELOESCHT, keeps produkte/preis for business stats

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Payload locale type mismatch**
- **Found during:** Task 1
- **Issue:** Payload generated types only accept 'all' | null for locale param, not 'de' | 'en'
- **Fix:** Cast locale and fallbackLocale as `any` in find() calls
- **Files modified:** src/app/(frontend)/[locale]/[...slug]/page.tsx, src/app/(frontend)/[locale]/page.tsx
- **Verification:** npx tsc --noEmit passes
- **Committed in:** 4a5b8f4

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type cast necessary for Payload localization to work. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 (Website und Compliance) complete
- All i18n routing, DSGVO compliance, and Puck page builder features in place
- Ready for Phase 7 (Deployment) or further feature work

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (4a5b8f4, 5d1205d) verified in git log.

---
*Phase: 06-website-und-compliance*
*Completed: 2026-03-10*
