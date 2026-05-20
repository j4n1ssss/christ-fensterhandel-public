---
phase: 01-fundament
plan: 01
subsystem: infra
tags: [nextjs, payload-cms, postgresql, tailwindcss, shadcn-ui, typescript]

# Dependency graph
requires: []
provides:
  - "Next.js 15.4.11 + Payload CMS 3.79.0 running with PostgreSQL (UUID IDs)"
  - "Users collection with auth and role field (admin/mitarbeiter/viewer/kunde)"
  - "Media collection with upload support"
  - "Tailwind CSS 4 + Shadcn UI initialized with CSS variable theming"
  - "TypeScript strict mode, ESLint, path aliases @/* configured"
affects: [01-02, 01-03, 01-04, 02-01]

# Tech tracking
tech-stack:
  added: [payload@3.79.0, next@15.4.11, "@payloadcms/db-postgres@3.79.0", "@payloadcms/richtext-lexical@3.79.0", tailwindcss@4.2.1, sharp, clsx, tailwind-merge, class-variance-authority]
  patterns: [payload-collection-config, admin-group-organization, css-variable-theming]

key-files:
  created:
    - src/payload.config.ts
    - src/collections/system/users.ts
    - src/collections/system/media.ts
    - src/app/globals.css
    - src/lib/utils.ts
    - components.json
    - tailwind.config.ts
  modified: []

key-decisions:
  - "Used degit to clone Payload blank template instead of create-payload-app (TTY issues in non-interactive environment)"
  - "Tailwind CSS 4 with CSS-based @theme config instead of JS config (TW4 default)"
  - "DATABASE_URL uses local macOS user (janisjankewitz) instead of postgres role"
  - "Users collection includes rolle field with 4 roles for future access control"

patterns-established:
  - "Collection files organized by admin group: system/, produkte/, ausstattung/, business/"
  - "German labels on all collection fields, English slugs/field names"
  - "Shadcn CSS variables in globals.css via @theme directive (TW4 pattern)"

requirements-completed: [SETUP-01, SETUP-02, SETUP-03]

# Metrics
duration: 8min
completed: 2026-03-09
---

# Phase 1 Plan 01: Projekt-Setup Summary

**Next.js 15.4.11 + Payload CMS 3.79.0 with PostgreSQL UUID adapter, Tailwind CSS 4, and Shadcn UI initialized for Christ Fensterhandel Konfigurator**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-09T13:42:06Z
- **Completed:** 2026-03-09T13:50:25Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Payload CMS 3.79.0 embedded in Next.js 15.4.11 with PostgreSQL adapter (UUID IDs), dev server starts cleanly
- Users collection with auth, German labels, and role select field (admin/mitarbeiter/viewer/kunde)
- Media collection with upload support and German labels
- Tailwind CSS 4 with PostCSS plugin and Shadcn UI initialized (components.json, cn() utility, CSS variable tokens)
- TypeScript strict mode compiles without errors, ESLint configured

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Payload CMS project with PostgreSQL and base collections** - `b1eb72e` (feat)
2. **Task 2: Initialize Tailwind CSS and Shadcn UI with project Design Tokens** - `db87062` (feat)

## Files Created/Modified
- `src/payload.config.ts` - Payload CMS config with PostgreSQL adapter, UUID IDs, lexical editor
- `src/collections/system/users.ts` - Users collection with auth, German labels, role field
- `src/collections/system/media.ts` - Media collection with upload, German labels
- `src/app/globals.css` - Tailwind CSS 4 directives with Shadcn CSS variable tokens
- `src/lib/utils.ts` - cn() utility function (clsx + tailwind-merge)
- `components.json` - Shadcn UI configuration
- `tailwind.config.ts` - Tailwind config for tooling compatibility
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss plugin
- `package.json` - All dependencies (Payload 3.79.0, Next.js 15.4.11, TW4, etc.)
- `tsconfig.json` - TypeScript strict mode with @/* and @payload-config paths
- `next.config.mjs` - Next.js config with Payload integration
- `eslint.config.mjs` - ESLint flat config with Next.js rules
- `.env.example` - Environment variable template
- `.gitignore` - Ignore patterns for Next.js + Payload project
- `src/app/(frontend)/layout.tsx` - Frontend root layout with globals.css import
- `src/app/(frontend)/page.tsx` - Placeholder home page
- `src/app/(payload)/` - Payload admin routes (auto-generated structure)

## Decisions Made
- Used degit to clone the Payload blank template because create-payload-app requires TTY interaction for database selection. Manually adapted from MongoDB to PostgreSQL adapter.
- Tailwind CSS 4 (installed latest) uses CSS-based configuration via @theme in globals.css instead of JavaScript config. Created tailwind.config.ts for Shadcn UI and tooling compatibility.
- DATABASE_URL adapted to local macOS PostgreSQL setup (user janisjankewitz, no password) since default postgres role doesn't exist.
- Added role field to Users collection early (admin/mitarbeiter/viewer/kunde) to prepare for Phase 4 access control.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-payload-app TTY failure**
- **Found during:** Task 1 (project scaffolding)
- **Issue:** create-payload-app requires interactive TTY for database selection prompt, fails with EINVAL in non-interactive environment
- **Fix:** Used degit to clone the blank template from payloadcms/payload monorepo, then manually created package.json with real npm versions (replacing workspace:* references) and switched from mongooseAdapter to postgresAdapter
- **Files modified:** package.json, src/payload.config.ts
- **Verification:** npm install succeeds, npx tsc --noEmit passes, dev server starts
- **Committed in:** b1eb72e (Task 1 commit)

**2. [Rule 3 - Blocking] PostgreSQL user mismatch**
- **Found during:** Task 1 (database setup)
- **Issue:** Plan specified postgres:postgres@localhost but local PostgreSQL only has janisjankewitz user
- **Fix:** Adapted DATABASE_URL to use local user, .env.example keeps standard postgres format for production
- **Files modified:** .env
- **Verification:** Database connection successful, Payload admin loads at /admin
- **Committed in:** b1eb72e (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for basic functionality. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required. PostgreSQL must be running locally.

## Next Phase Readiness
- Foundation complete: Next.js + Payload CMS + PostgreSQL + Tailwind + Shadcn all operational
- Ready for Plan 01-02 (Produkt-Collections): collection file structure established, admin group pattern set
- Collections go into src/collections/{produkte,ausstattung,business}/ directories
- All collections should follow the pattern from users.ts: German labels, admin.group, standard fields

## Self-Check: PASSED

All 8 key files verified present. Both task commits (b1eb72e, db87062) verified in git log.

---
*Phase: 01-fundament*
*Completed: 2026-03-09*
