---
phase: 06-website-und-compliance
verified: 2026-03-10T12:30:00Z
status: passed
score: 16/16 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 13/16
  gaps_closed:
    - "Live Preview im Puck Editor zeigt Breakpoint-Umschalter fuer Mobile, Tablet, Desktop"
    - "URL /de/ueber-uns zeigt die deutsche Version und /en/ueber-uns zeigt die englische Version -- layout html lang is dynamic"
    - "Navigation and Footer global queries use locale for localized labels"
  gaps_remaining: []
  regressions: []
---

# Phase 6: Website und Compliance Verification Report

**Phase Goal:** Geschaeftsinhaber kann Website-Seiten per Drag-and-Drop bauen, Inhalte sind auf DE/EN verfuegbar, DSGVO-Grundlagen sind umgesetzt
**Verified:** 2026-03-10T12:30:00Z
**Status:** passed
**Re-verification:** Yes -- after gap closure (previous score 13/16, now 16/16)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Puck Editor ist im Admin erreichbar und zeigt Component-Sidebar mit 5 Bloecken | VERIFIED | createPuckPlugin in payload.config.ts plugins array; 5 ComponentConfig exports in puck-blocks/ |
| 2 | Eine neue Seite kann per Drag-and-Drop mit Hero, TextBlock, FeatureGrid, CTA-Banner, Bild/Text Kombi gebaut werden | VERIFIED | puck-config.ts registers all 5 in extendConfig; each has fields, defaultProps, render |
| 3 | Gespeicherte Puck-Seite ist unter ihrem Slug im Frontend sichtbar | VERIFIED | [locale]/[...slug]/page.tsx queries pages collection with slug filter and _status: published |
| 4 | Draft-Seiten sind im Frontend NICHT sichtbar, erst nach Publish | VERIFIED | _status: { equals: 'published' } in both catch-all and homepage queries |
| 5 | Navigation-Global und Footer-Global sind im Admin editierbar und werden im Frontend angezeigt | VERIFIED | Globals registered in payload.config.ts; layout.tsx fetches and renders both |
| 6 | Homepage (/) zeigt die Puck-Seite mit slug 'home' | VERIFIED | [locale]/page.tsx loads Puck 'home' page, falls back to static landing; root page.tsx redirects to /de/ |
| 7 | Live Preview im Puck Editor zeigt Breakpoint-Umschalter (375/768/1280) | VERIFIED | PuckEditorViewWithViewports passes enableViewports={true} (line 232); registered in payload.config.ts at path /puck-editor/:segments* (lines 60-64) |
| 8 | CMS-Felder haben DE/EN Tabs im Admin | VERIFIED | localization config in payload.config.ts (lines 91-98); localized: true on Navigation label, Footer adresse, legal_links.label |
| 9 | URL /de/ueber-uns zeigt die deutsche Version der Puck-Seite | VERIFIED | [locale]/[...slug]/page.tsx passes locale to payload.find with fallbackLocale 'de' |
| 10 | URL /en/ueber-uns zeigt die englische Version (Fallback auf Deutsch) | VERIFIED | fallbackLocale: 'de' as any in locale catch-all route |
| 11 | Sprachumschalter im Header wechselt zwischen /de/ und /en/ | VERIFIED | LanguageToggle component uses pathname.replace logic; imported in layout.tsx |
| 12 | Besuch ohne Locale-Prefix wird zu /de/ redirected | VERIFIED | middleware.ts redirects bare paths to /${DEFAULT_LOCALE}${pathname} |
| 13 | Cookie-Banner erscheint beim ersten Besuch mit 3 Kategorien | VERIFIED | CookieBanner checks js-cookie on mount; 3 categories (Notwendig, Statistik, Marketing) |
| 14 | Nach Akzeptieren verschwindet der Banner und erscheint nicht mehr | VERIFIED | saveConsent sets cookie for 365 days; useEffect skips if cookie exists |
| 15 | Admin kann Kundendaten anonymisieren (Kontaktdaten werden zu GELOESCHT) | VERIFIED | POST route at /api/admin/anonymize-customer; admin auth check; replaces all kontaktdaten with GELOESCHT |
| 16 | Konfigurator/Warenkorb/Kunden-Routes bleiben ohne Locale-Prefix funktional | VERIFIED | SKIP_PREFIXES in middleware includes /konfigurator, /warenkorb, /kunden, /anfrage, /status-pruefen |

**Score:** 16/16 truths verified

### Gap Closure Details

**Gap 1: puckViewports orphaned (was BLOCKER for WEB-03)**
- **Fix:** Orphaned `puckViewports` array removed from `puck-config.ts`. New component `src/components/admin/puck-editor-wrapper.tsx` created with `PuckEditorViewWithViewports` that passes `enableViewports={true}` to `PuckEditor` (line 232).
- **Wiring:** Registered in `payload.config.ts` admin.components.views as `puckEditorWithViewports` at path `/puck-editor/:segments*` (lines 60-64).
- **Status:** VERIFIED -- enableViewports is now wired through the custom admin view.

**Gap 2: Hardcoded html lang="de" (was WARNING)**
- **Fix:** `layout.tsx` now detects locale from `x-pathname` header (lines 46-49) and uses `<html lang={locale}>` (line 75).
- **Wiring:** `middleware.ts` sets `x-pathname` header via `forwardPathname()` helper (lines 25-29) on all responses.
- **Status:** VERIFIED -- html lang attribute is now dynamic based on URL locale.

**Gap 3: Missing locale in findGlobal calls (was WARNING)**
- **Fix:** Both `findGlobal` calls now pass `locale: locale as any` and `fallbackLocale: 'de' as any` (lines 58-60 for navigation, lines 64-66 for footer).
- **Status:** VERIFIED -- navigation and footer globals will return locale-appropriate content.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/payload.config.ts` | Puck plugin, localization, globals, viewport view | VERIFIED | createPuckPlugin, locales de/en, Navigation+Footer globals, puckEditorWithViewports view |
| `src/components/puck-blocks/*.tsx` | 5 block components | VERIFIED | hero, text, feature-grid, cta-banner, image-text all present |
| `src/lib/puck-config.ts` | Extended config with blocks | VERIFIED | extendConfig with 5 components, orphaned puckViewports removed |
| `src/components/admin/puck-editor-wrapper.tsx` | Custom editor view with viewports | VERIFIED | PuckEditorViewWithViewports with enableViewports={true} (246 lines) |
| `src/app/(frontend)/[locale]/[...slug]/page.tsx` | Locale-prefixed catch-all | VERIFIED | Queries pages with slug, _status: published, locale param |
| `src/app/(frontend)/layout.tsx` | Dynamic locale, global queries with locale | VERIFIED | Dynamic html lang, findGlobal with locale param |
| `src/middleware.ts` | i18n routing + x-pathname header | VERIFIED | Redirects bare paths, sets x-pathname header on all responses |
| `src/payload-globals/navigation.ts` | Editable header navigation | VERIFIED | GlobalConfig with localized fields |
| `src/payload-globals/footer.ts` | Editable footer | VERIFIED | GlobalConfig with localized fields |
| `src/components/i18n/language-toggle.tsx` | DE/EN toggle | VERIFIED | Client component with pathname.replace logic |
| `src/components/cookie-banner/cookie-banner.tsx` | DSGVO cookie consent | VERIFIED | 3 categories, 365-day cookie |
| `src/app/(payload)/api/admin/anonymize-customer/route.ts` | Admin anonymization endpoint | VERIFIED | Admin auth check, replaces kontaktdaten with GELOESCHT |
| `src/lib/i18n.ts` | Locale constants and helpers | VERIFIED | LOCALES, DEFAULT_LOCALE, isValidLocale, getAlternateLocale |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| payload.config.ts | Puck Editor admin | createPuckPlugin in plugins array | WIRED | Line 111 |
| payload.config.ts | PuckEditorViewWithViewports | admin.components.views registration | WIRED | Lines 60-64, path /puck-editor/:segments* |
| puck-editor-wrapper.tsx | PuckEditor | enableViewports={true} prop | WIRED | Line 232 |
| [locale]/[...slug]/page.tsx | payload.find pages | slug filter + _status published + locale | WIRED | Lines 45-54 |
| layout.tsx | findGlobal navigation + footer | locale param from x-pathname | WIRED | Lines 57-69 with locale and fallbackLocale |
| middleware.ts | layout.tsx | x-pathname header | WIRED | forwardPathname sets header, layout reads it |
| language-toggle.tsx | URL pathname | Replaces /de/ with /en/ | WIRED | pathname.replace with router.push |
| anonymize-customer/route.ts | payload.update | Overwrites kontaktdaten with GELOESCHT | WIRED | Lines 51-90 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| WEB-01 | 06-01 | Puck Editor Plugin installiert und im Admin integriert | SATISFIED | createPuckPlugin in payload.config.ts |
| WEB-02 | 06-01 | Mindestens 3 Puck Components (Hero, TextBlock, FeatureGrid) | SATISFIED | 5 components in puck-blocks/ |
| WEB-03 | 06-01 | Live Preview im Admin mit Breakpoints (Mobile/Tablet/Desktop) | SATISFIED | PuckEditorViewWithViewports with enableViewports={true} |
| WEB-04 | 06-01 | Draft Mode (Entwurf vs. veroeffentlicht) | SATISFIED | _status: published filter in frontend routes |
| I18N-01 | 06-02 | Payload i18n konfiguriert fuer DE + EN | SATISFIED | localization config with de/en locales |
| I18N-02 | 06-02 | Lokalisierte Felder in CMS Collections (DE/EN Tabs) | SATISFIED | localized: true on Navigation, Footer fields |
| I18N-03 | 06-02 | Frontend-Sprachumschalter wechselt DE/EN | SATISFIED | LanguageToggle component in header |
| DSGVO-01 | 06-02 | Datenschutz-Checkbox ist Pflichtfeld bei Anfrage-Absenden | SATISFIED | z.literal(true) in contact-form schema |
| DSGVO-02 | 06-02 | Cookie-Banner erscheint beim ersten Besuch | SATISFIED | CookieBanner with js-cookie check, 3 categories |
| DSGVO-03 | 06-02 | Datenloeschung im Admin moeglich | SATISFIED | POST /api/admin/anonymize-customer with admin auth |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/(frontend)/[locale]/[...slug]/page.tsx` | 21 | `collection: 'pages' as 'users'` type cast | INFO | Works but brittle; should regenerate Payload types |
| `src/app/(frontend)/layout.tsx` | 57,64 | `(payload as any).findGlobal` | INFO | Works but loses type safety; should regenerate Payload types |

No blocker or warning anti-patterns remain.

### Human Verification Required

### 1. Puck Editor Viewport Breakpoints

**Test:** Log into Payload Admin, navigate to Pages, open a page in the Puck editor. Look for a breakpoint toggle (Mobile/Tablet/Desktop) in the editor toolbar.
**Expected:** Breakpoint toggle appears and switches the preview canvas between 360px, 768px, and 1280px widths.
**Why human:** The enableViewports prop is wired, but the actual UI toggle rendering depends on the @delmaredigital/payload-puck plugin version behavior that cannot be verified without running the admin.

### 2. Language Toggle with Localized Content

**Test:** Create a Navigation global entry with a label in both DE and EN. Visit /de/ and /en/ pages. Check that nav labels switch.
**Expected:** Navigation labels show German text on /de/ routes and English text on /en/ routes.
**Why human:** Requires running server with database populated with localized content.

### 3. Cookie Banner Interaction

**Test:** Visit the site in an incognito window. Check banner appears. Toggle categories, save. Reload.
**Expected:** Banner appears initially, does not reappear after saving preferences.
**Why human:** Client-side cookie behavior requires browser interaction.

---

_Verified: 2026-03-10T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
