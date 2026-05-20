---
phase: 15-core-navigation
plan: 02
status: complete
started: 2026-03-23
completed: 2026-03-23
---

# Plan 15-02 Summary: Custom Admin Sidebar Navigation

## What was built

Complete custom admin sidebar navigation replacing Payload's default Nav component.

### Features
- 4 direct links at top (Dashboard, Bestellungen, Produkte, Benutzer)
- 4 collapsible dropdown sections (Bestellungsverwaltung, Produktverwaltung, Website, System)
- Gray non-clickable subgroup headings (HAUPTPRODUKTE, AUSSTATTUNG, KONFIGURATION, PREISE)
- Active link highlighting with rounded background (dark-theme pill style)
- Doppel-Highlight: direct link + dropdown item both active on same path
- WebhookFehlerBadge next to System header AND Webhook Fehler link
- Logout button at bottom
- No emojis, text-only labels

### Config changes
- `payload.config.ts`: Added `Nav: '@/components/admin/custom-nav#default'`, removed `afterNavLinks`
- ImportMap regenerated with custom-nav entry

### Styling approach
- Inline styles + scoped `<style>` block (Payload Admin does NOT use Tailwind)
- Dark-theme reference design: rgba white colors, 8px border-radius, 42px item height
- WebhookFehlerBadge: inline-styled span instead of Shadcn Badge (Tailwind incompatible)
- App header restyled to 64px height with larger logo
- Consistent content paddings via `custom.scss` using Payload's `--gutter-h` variable
- Dashboard container class renamed from inline style to `.admin-content`

## Commits

| Hash | Message |
|------|---------|
| fe3fcf9 | feat(15-02): build complete custom admin sidebar navigation component |
| 925001f | feat(15-02): wire custom nav into payload.config.ts, remove afterNavLinks |
| c21fdaf | fix(15-02): restyle admin nav and header for Payload compatibility |

## Key files

### Created
- `src/components/admin/custom-nav.tsx` — Complete custom sidebar navigation

### Modified
- `src/payload.config.ts` — Nav registration, afterNavLinks removed
- `src/components/admin/webhook-fehler-badge.tsx` — Inline styles instead of Shadcn Badge
- `src/components/admin/dashboard-overview.tsx` — `.admin-content` class instead of inline maxWidth
- `src/app/(payload)/custom.scss` — Consistent admin content paddings
- `tests/unit/test-webhook-badge.test.tsx` — Updated for inline-styled badge

## Deviations

1. **Tailwind to inline styles**: Entire nav component rewritten from Tailwind classes to inline styles + scoped CSS because Payload Admin Panel uses its own CSS system, not Tailwind.
2. **Shadcn Badge replaced**: WebhookFehlerBadge uses inline-styled `<span>` instead of Shadcn `<Badge>` for same reason.
3. **Reference design applied**: User provided dark-theme reference screenshot — rounded pill active states instead of left accent bar.
4. **Header restyled**: App header height increased to 64px, logo sizing fixed.
5. **Dashboard container refactored**: Removed inline `maxWidth: 1200px`, replaced with CSS class using `--gutter-h`.

## Test results

- 315/315 tests passing
- 20 custom-nav tests green
- 4 nav-config tests green
- 7 webhook-badge tests green

## Self-Check: PASSED
