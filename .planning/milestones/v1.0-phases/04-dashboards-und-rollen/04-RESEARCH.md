# Phase 4: Dashboards und Rollen - Research

**Researched:** 2026-03-10
**Domain:** Payload CMS 3.x Access Control, Custom Admin Views, Frontend Auth
**Confidence:** HIGH

## Summary

Phase 4 covers three distinct domains: (1) Security foundation with Payload access control policies and Zod validation on all endpoints, (2) Admin dashboard with custom Payload Admin views for Anfragen management, and (3) Customer-facing auth and dashboard. All three are well-supported by Payload CMS 3.79's built-in features.

Payload CMS 3.x provides a complete access control system with collection-level and field-level functions that return booleans or query constraints. Custom Admin Views allow replacing the dashboard and adding collection edit views via `admin.components.views` config. Authentication is built into any collection with `auth: true`, using HTTP-only cookies and JWT tokens.

**Primary recommendation:** Use Payload's native access control functions (not middleware), replace the Admin Dashboard via `admin.components.views.dashboard`, and use client-side fetch for frontend auth (not server actions) to properly handle HTTP-only cookies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Admin-Dashboard im Payload Admin Panel (kein eigenes Custom-Dashboard)
- Custom Dashboard-Startseite als Payload Admin Landing: Statistik-Karten, Status-Verteilung, letzte Anfragen
- Custom Anfrage-Detail-View: Status-Timeline links, Produktliste mit Mini-SVG Mitte, Kontaktdaten + Notizen rechts, Schnell-Status-Buttons oben
- Login/Register mit Email + Passwort (Payload Auth eingebaut, kein externer Provider)
- Gastverfolgung: Gaeste mit Anfrage-Nr + E-Mail auf /status-pruefen
- Kunden-Dashboard unter /kunden/dashboard mit Konfigurator-Style (Tailwind + Shadcn)
- Definierte Status-Uebergaenge (nicht frei waehlbar): NEU->IN_BEARBEITUNG->BESTAETIGT->BEZAHLT->ABGESCHLOSSEN + RUECKFRAGE/ABGELEHNT
- Kommentar Pflicht bei RUECKFRAGE und ABGELEHNT
- Payload Access Control Policies auf ALLEN Collections
- Rollen: Admin (alles), Mitarbeiter (Status+Notizen, kein Loeschen/Preise/Users/CMS), Viewer (lesen), Kunde (nur eigene)
- afterChange Hook Placeholder fuer spaetere N8N-Integration
- Gast-Anfragen beim Registrieren automatisch dem Account zuordnen (gleiche E-Mail)
- Kunde sieht: Status-Timeline, Produktkonfigurationen, Gesamtpreis. Sieht NICHT: interne Notizen, wer Status geaendert hat

### Claude's Discretion
- Payload Custom View Architektur (React Server Components vs. Client Components)
- Dashboard-Widget Layout und Responsive-Verhalten
- Exakte Access Control Policy Implementierung (Payload access functions)
- Gast-Tracking Formular Layout
- Kunden-Register Formular Felder (minimal vs. ausfuehrlich)
- Status-Timeline UI-Komponente Design
- Mini-SVG Groesse und Darstellung in der Anfrage-Detail-View
- afterChange Hook Struktur fuer spaetere N8N-Integration

### Deferred Ideas (OUT OF SCOPE)
- Metriken-Dashboard mit Recharts (Anfragen/Monat, Kategorien-Verteilung) -- v2 (ADMIN-V2-02)
- Produkt-Level Bestaetigung/Ablehnung mit Grund -- v2 (ADMIN-V2-01)
- PDF-Generierung (Angebots-PDF aus Anfrage) -- v2 (INT-V2-01)
- Rate-Limiting auf API-Endpoints -- v2 (INT-V2-02)
- Passwort-Reset per E-Mail -- braucht N8N, kommt mit Phase 5
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Server-seitige Zod-Validierung auf allen API-Endpoints | Zod v4 already in project; add validation schemas to Payload hooks and custom API routes |
| SEC-02 | Access Control: Admin darf alles, Mitarbeiter bearbeitet Anfragen, Viewer nur lesen | Payload collection-level access functions with role checking via `req.user.rolle` |
| SEC-03 | Rollen-Feld in Users Collection (admin/mitarbeiter/viewer) | Already exists in users.ts with `rolle` select field including 4 roles + `kunde` |
| ADMIN-01 | Anfragen-Liste mit Filter nach Status, Datum, Kategorie | Payload built-in list view with filters + custom beforeDashboard widget for overview |
| ADMIN-02 | Suchfunktion (Kundenname, E-Mail, Anfrage-Nr.) | Payload admin search configured via `admin.listSearchableFields` on Anfragen collection |
| ADMIN-03 | Anfrage-Detailansicht mit allen Konfigurationsdaten | Custom edit view tab or custom component with full Anfrage data display |
| ADMIN-04 | Status aendern mit definiertem Workflow | Status transition validation in beforeChange hook + custom admin UI buttons |
| ADMIN-05 | Status-Historie wer, wann, von/zu (unveraenderlich) | StatusHistorie collection already exists and is immutable; display as timeline |
| ADMIN-06 | Interne Notizen pro Anfrage (nur Admin/Mitarbeiter sichtbar) | Field-level access control on `interne_notizen` field |
| KUND-01 | Kunden-Collection mit auth: true (Login/Register) | Users collection already has auth:true; add kunde role handling + frontend pages |
| KUND-02 | Geschuetzte Route /kunden/dashboard (Redirect ohne Login) | Next.js middleware checking Payload JWT cookie or server-side auth check |
| KUND-03 | Kunde sieht nur eigene Anfragen (Access Control serverseitig) | Payload read access returning query constraint `{ 'kontaktdaten.email': { equals: user.email } }` |
| KUND-04 | Status-Timeline zeigt Anfrage-Fortschritt chronologisch | Frontend component fetching StatusHistorie filtered by anfrage ID |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | Access control, auth, custom views | Project foundation |
| @payloadcms/ui | 3.79.0 | Admin panel components (useDocumentInfo, useForm) | Already used in AnfrageEditButton |
| Next.js | 15.4.11 | App Router for frontend routes | Project foundation |
| Zod | 4.3.6 | Schema validation | Already used across project |
| React Hook Form | 7.71.2 | Form handling | Already used in konfigurator |
| Shadcn UI | (installed) | Frontend UI components | Already used in frontend |
| Tailwind CSS | 4.2.1 | Styling | Already used |
| Lucide React | 0.577.0 | Icons | Already installed |

### No New Dependencies Required

This phase requires NO new npm packages. Everything is achievable with existing dependencies:
- Access control: Payload built-in
- Custom admin views: Payload built-in
- Auth: Payload built-in (Users collection already has `auth: true`)
- Frontend forms: React Hook Form + Zod (already installed)
- UI: Shadcn + Tailwind (already installed)
- Icons: Lucide React (already installed)

## Architecture Patterns

### Recommended Project Structure (New Files)
```
src/
├── access/                          # Access control utility functions
│   ├── is-admin.ts                  # Admin check
│   ├── is-admin-or-mitarbeiter.ts   # Admin or Mitarbeiter check
│   ├── is-admin-field-access.ts     # Field-level admin access
│   └── is-own-anfrage.ts            # Kunde: only own Anfragen
├── lib/
│   └── status-transitions.ts        # Valid status transition map
├── components/
│   └── admin/
│       ├── anfrage-edit-button.tsx   # (exists)
│       ├── dashboard-overview.tsx    # Custom dashboard landing
│       ├── anfrage-detail-view.tsx   # Custom detail view
│       ├── status-workflow.tsx       # Status change buttons + comment
│       └── status-timeline.tsx       # Status history display (admin)
├── app/
│   └── (frontend)/
│       ├── kunden/
│       │   ├── login/page.tsx        # Login page
│       │   ├── register/page.tsx     # Register page
│       │   └── dashboard/
│       │       ├── page.tsx          # Anfragen list
│       │       └── [id]/page.tsx     # Anfrage detail
│       └── status-pruefen/page.tsx   # Guest tracking
```

### Pattern 1: Payload Access Control Functions
**What:** Centralized access control utilities reused across all collections.
**When to use:** Every collection in the project.

```typescript
// src/access/is-admin.ts
import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.rolle === 'admin'
}

// src/access/is-admin-or-mitarbeiter.ts
export const isAdminOrMitarbeiter: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.rolle === 'admin' || user.rolle === 'mitarbeiter'
}

// src/access/is-own-anfrage.ts — returns query constraint
export const isOwnAnfrage: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.rolle === 'admin' || user.rolle === 'mitarbeiter' || user.rolle === 'viewer') return true
  // Kunde: only see own Anfragen matched by email
  return {
    'kontaktdaten.email': { equals: user.email },
  }
}
```

**Confidence:** HIGH — This pattern is documented in official Payload docs and the Payload skills repo.

### Pattern 2: Status Transition Validation
**What:** A transition map enforced in the Anfragen beforeChange hook.
**When to use:** Whenever status is updated.

```typescript
// src/lib/status-transitions.ts
export const VALID_TRANSITIONS: Record<string, string[]> = {
  neu: ['in_bearbeitung'],
  in_bearbeitung: ['bestaetigt', 'rueckfrage', 'abgelehnt'],
  bestaetigt: ['bezahlt'],
  bezahlt: ['abgeschlossen'],
  rueckfrage: ['in_bearbeitung'],
  abgelehnt: ['neu'],
  abgeschlossen: ['in_bearbeitung'],
}

export const COMMENT_REQUIRED: string[] = ['rueckfrage', 'abgelehnt']

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}
```

**Confidence:** HIGH — Pure business logic, no external dependency.

### Pattern 3: Custom Admin Dashboard View
**What:** Replace default Payload dashboard with custom overview.
**When to use:** Admin landing page.

Configuration in `payload.config.ts`:
```typescript
admin: {
  user: Users.slug,
  components: {
    views: {
      dashboard: {
        Component: '@/components/admin/dashboard-overview',
      },
    },
  },
}
```

The dashboard component is a React Server Component by default in Payload 3.x, which means it can use the Local API directly:

```typescript
// src/components/admin/dashboard-overview.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function DashboardOverview() {
  const payload = await getPayload({ config })
  const anfragen = await payload.find({
    collection: 'anfragen',
    limit: 10,
    sort: '-createdAt',
  })
  // ... render stats cards, status badges, recent list
}
```

**Confidence:** HIGH — `admin.components.views.dashboard` is documented in official Payload docs for v3.

### Pattern 4: Frontend Auth with Client-Side Fetch
**What:** Login/Register via Payload REST API, cookies handled by browser.
**When to use:** Customer login/register pages.

```typescript
// Login
const res = await fetch('/api/users/login', {
  method: 'POST',
  credentials: 'include',  // CRITICAL for HTTP-only cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

// Register
const res = await fetch('/api/users', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, rolle: 'kunde', vorname, nachname }),
})

// Get current user (server component)
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

async function getCurrentUser() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()
  const { user } = await payload.auth({ headers: headersList })
  return user
}
```

**Confidence:** HIGH — Official Payload blog post documents this pattern explicitly for Next.js App Router.

### Pattern 5: Collection Edit View Customization
**What:** Add custom tab or replace edit view for Anfragen with detail layout.
**When to use:** Admin Anfrage detail page.

```typescript
// In Anfragen collection config
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '@/components/admin/anfrage-detail-view',
        },
      },
    },
  },
}
```

**Confidence:** MEDIUM — Edit view replacement is documented, but complex layouts (3-column with timeline) require careful implementation within Payload's admin CSS scope.

### Anti-Patterns to Avoid
- **Using Next.js middleware for Payload auth:** Payload's auth relies on HTTP-only cookies that need the Payload API to validate. Use server-side `payload.auth()` instead of trying to read JWT in middleware.
- **Server Actions for login/logout:** Server actions don't properly handle Set-Cookie headers from Payload. Use client-side fetch with `credentials: 'include'`.
- **Separate Kunden collection:** Don't create a separate `kunden` collection. Use the existing `users` collection with `rolle: 'kunde'`. Payload auth is already configured on `users`.
- **Hardcoding role checks inline:** Always use centralized access functions from `src/access/` — never inline `req.user.rolle === 'admin'` checks in collection configs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Access control | Custom middleware | Payload `access` config on collections | Payload handles API + Admin Panel uniformly |
| Authentication | Custom JWT/session | Payload `auth: true` on Users collection | HTTP-only cookies, CSRF, password hashing built-in |
| Admin list filtering | Custom admin page | Payload `admin.listSearchableFields` | Built-in search + filter UI in Admin Panel |
| Status history | Custom change tracking | Existing `beforeChange` hook + StatusHistorie collection | Already implemented in Phase 1 |
| Admin panel styling | Custom CSS framework | Payload CSS variables (`--theme-*`) | Consistent with Payload's admin theme |

**Key insight:** Payload CMS 3.x already provides 80% of what this phase needs out of the box. The custom work is: (1) access control function declarations, (2) status transition validation, (3) custom admin view components, and (4) frontend customer pages.

## Common Pitfalls

### Pitfall 1: Cookie Auth Not Working on Frontend
**What goes wrong:** Login succeeds (200 response) but subsequent API calls return 401.
**Why it happens:** Missing `credentials: 'include'` on fetch calls, or `serverURL` not set correctly in Payload config, or frontend domain not in `csrf` array.
**How to avoid:**
1. Always use `credentials: 'include'` on all client-side fetch calls
2. Set `serverURL` in payload.config.ts to match actual server URL
3. Add frontend domain to `csrf` array if different from admin
**Warning signs:** Login returns 200 but dashboard shows "not authenticated"

### Pitfall 2: Access Control Not Applied to Direct API Calls
**What goes wrong:** Access control works in Admin Panel but not on REST API endpoints like `/api/anfragen`.
**Why it happens:** Forgetting to add `access` config to the collection. Payload's default is open access if no access functions are defined.
**How to avoid:** Add `access` block to EVERY collection, not just Anfragen. Use a helper function that defaults to `isAdmin` for destructive operations.
**Warning signs:** Unauthenticated users can read collections via `/api/{slug}`

### Pitfall 3: Query Constraints and Nested Fields
**What goes wrong:** Filtering Anfragen by `kontaktdaten.email` doesn't work as expected.
**Why it happens:** Nested field paths in query constraints use dot notation, but the exact behavior depends on database adapter.
**How to avoid:** Test the query constraint with PostgreSQL adapter specifically. Use `where` queries manually first to verify the path works.
**Warning signs:** Kunde sees all Anfragen or no Anfragen instead of just their own.

### Pitfall 4: Custom View Import Path
**What goes wrong:** Custom admin components don't load, admin panel shows blank.
**Why it happens:** Payload 3.x uses string import paths (not React component imports) for admin components. The path must be resolvable from the project root.
**How to avoid:** Use `@/components/admin/component-name` format (same as existing AnfrageEditButton pattern). Run `generate:importmap` after adding new admin components.
**Warning signs:** Admin panel shows blank page or missing component

### Pitfall 5: Rolle Field Not in JWT
**What goes wrong:** Access control functions can't read `req.user.rolle` — it's undefined.
**Why it happens:** By default, Payload only includes `email` and `id` in JWT. Custom fields need `saveToJWT: true`.
**How to avoid:** Add `saveToJWT: true` to the `rolle` field in Users collection. This is CRITICAL.
**Warning signs:** `req.user` exists but `req.user.rolle` is undefined in access functions.

### Pitfall 6: Gast-Anfragen Zuordnung Race Condition
**What goes wrong:** User registers but existing Anfragen with matching email are not linked.
**Why it happens:** No afterChange hook on Users collection to update existing Anfragen.
**How to avoid:** Add an `afterChange` hook on Users collection (operation === 'create') that queries Anfragen by email and updates them with the new user ID. Or simply filter Anfragen by email at read time (simpler approach).
**Warning signs:** Registered user sees empty dashboard despite having submitted Anfragen as guest.

## Code Examples

### Access Control for Anfragen Collection
```typescript
// Complete access config for Anfragen
access: {
  create: ({ req: { user } }) => {
    if (!user) return true  // Public can create (submit Anfrage)
    return true
  },
  read: ({ req: { user } }) => {
    if (!user) return false
    if (['admin', 'mitarbeiter', 'viewer'].includes(user.rolle)) return true
    // Kunde: only own
    return { 'kontaktdaten.email': { equals: user.email } }
  },
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.rolle === 'admin') return true
    if (user.rolle === 'mitarbeiter') return true  // field-level restricts what
    return false
  },
  delete: ({ req: { user } }) => {
    if (!user) return false
    return user.rolle === 'admin'
  },
}
```

### Field-Level Access for Interne Notizen
```typescript
{
  name: 'interne_notizen',
  type: 'textarea',
  label: 'Interne Notizen',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return ['admin', 'mitarbeiter', 'viewer'].includes(user.rolle)
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return ['admin', 'mitarbeiter'].includes(user.rolle)
    },
  },
}
```

### Protected Route Pattern (Server Component)
```typescript
// src/app/(frontend)/kunden/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function KundenDashboard() {
  const payload = await getPayload({ config })
  const headersList = await getHeaders()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.rolle !== 'kunde') {
    redirect('/kunden/login')
  }

  const anfragen = await payload.find({
    collection: 'anfragen',
    where: { 'kontaktdaten.email': { equals: user.email } },
    sort: '-createdAt',
  })

  return <KundenDashboardView anfragen={anfragen.docs} />
}
```

### Status Transition Validation in beforeChange Hook
```typescript
// Addition to existing beforeChange hook in anfragen.ts
import { VALID_TRANSITIONS, COMMENT_REQUIRED } from '@/lib/status-transitions'

// Inside the hook:
if (originalDoc.status !== data.status) {
  if (!isValidTransition(originalDoc.status, data.status)) {
    throw new APIError(
      `Ungueltiger Statuswechsel: ${originalDoc.status} -> ${data.status}`,
      400
    )
  }
  // Comment required for certain transitions
  if (COMMENT_REQUIRED.includes(data.status) && !data._status_kommentar) {
    throw new APIError(
      `Kommentar ist Pflicht bei Status "${data.status}"`,
      400
    )
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate admin dashboard app | Payload Admin Custom Views (embedded React) | Payload 3.0 (2024) | No separate app needed |
| External auth (NextAuth/Clerk) | Payload built-in auth with auth:true | Payload 3.0 native | Zero additional dependencies |
| REST API middleware for access | Payload access control config | Always in Payload | Declarative, covers API + Admin |
| localStorage JWT | HTTP-only cookie JWT | Payload 3.0 | More secure, browser manages cookies |

## Open Questions

1. **Nested field query constraints with PostgreSQL adapter**
   - What we know: Dot notation for nested fields (e.g., `kontaktdaten.email`) is documented for Payload query constraints
   - What's unclear: Whether the PostgreSQL adapter with UUID IDs handles nested group field queries correctly
   - Recommendation: Test early in Plan 04-01 by manually querying with Local API

2. **Custom Dashboard View: Server or Client Component?**
   - What we know: Payload 3.x defaults to React Server Components for admin views, which enables Local API
   - What's unclear: Whether interactive elements (filter dropdowns, quick-action buttons) need client components
   - Recommendation: Use Server Component for dashboard (data-heavy), Client Component for interactive parts (status buttons). Split accordingly.

3. **saveToJWT on rolle field**
   - What we know: Custom fields need `saveToJWT: true` to be available in access control functions via `req.user`
   - What's unclear: Whether the current users.ts already has this (it does NOT based on code review)
   - Recommendation: MUST add `saveToJWT: true` to the `rolle` field in Plan 04-01. This is a prerequisite for all access control.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest |
| Config file | `jest.config.ts` (exists) |
| Quick run command | `npx jest --testPathPattern="tests/unit" --no-coverage -x` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Zod validates all API endpoints | unit | `npx jest tests/unit/test-access-control.test.ts -x` | Wave 0 |
| SEC-02 | Access control blocks unauthorized access | unit | `npx jest tests/unit/test-access-control.test.ts -x` | Wave 0 |
| SEC-03 | Rolle field exists with correct values | unit | `npx jest tests/unit/test-access-control.test.ts -x` | Wave 0 |
| ADMIN-04 | Status transitions follow defined rules | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | Wave 0 |
| ADMIN-05 | StatusHistorie is immutable | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | Wave 0 |
| KUND-03 | Query constraint filters own Anfragen | unit | `npx jest tests/unit/test-access-control.test.ts -x` | Wave 0 |
| ADMIN-01 | Anfragen list renders with filter | manual-only | Visual verification in Admin Panel | N/A |
| ADMIN-02 | Search by name/email/nr works | manual-only | Visual verification in Admin Panel | N/A |
| ADMIN-03 | Detail view shows all config data | manual-only | Visual verification in Admin Panel | N/A |
| ADMIN-06 | Interne Notizen only for Admin/Mitarbeiter | unit | `npx jest tests/unit/test-access-control.test.ts -x` | Wave 0 |
| KUND-01 | Login/Register works | manual-only | Browser test: /kunden/login | N/A |
| KUND-02 | Protected route redirects | manual-only | Browser test: /kunden/dashboard without login | N/A |
| KUND-04 | Status-Timeline renders chronologically | manual-only | Visual verification | N/A |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="tests/unit" --no-coverage -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-access-control.test.ts` -- covers SEC-01, SEC-02, SEC-03, ADMIN-06, KUND-03
- [ ] `tests/unit/test-status-transitions.test.ts` -- covers ADMIN-04, ADMIN-05

## Sources

### Primary (HIGH confidence)
- [Payload CMS Collection Access Control](https://payloadcms.com/docs/access-control/collections) -- access function signatures, query constraints
- [Payload CMS Custom Views](https://payloadcms.com/docs/custom-components/custom-views) -- dashboard replacement, edit views
- [Payload CMS Root Components](https://payloadcms.com/docs/custom-components/root-components) -- beforeDashboard, afterDashboard
- [Payload CMS Edit View](https://payloadcms.com/docs/custom-components/edit-view) -- collection edit customization
- [Payload CMS Auth Operations](https://payloadcms.com/docs/authentication/operations) -- login, register, me endpoints

### Secondary (MEDIUM confidence)
- [Payload Blog: Next.js Auth](https://payloadcms.com/posts/blog/nextjs-payload-cms-auth) -- client-side fetch pattern, cookie handling
- [Payload Guide: Auth + RBAC](https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload) -- complete RBAC setup
- [Payload Blog: Build Your Own RBAC](https://payloadcms.com/posts/blog/build-your-own-rbac) -- role patterns, saveToJWT
- [Dev.to: Access Control Cheat Sheet](https://dev.to/aaronksaunders/access-control-in-payload-cms-cheat-sheet-4fn) -- function examples verified against docs

### Tertiary (LOW confidence)
- [Dev.to: Auth Client vs Server](https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a) -- server action limitations (needs validation with current Payload version)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, no new deps
- Architecture (Access Control): HIGH -- official docs + multiple sources confirm patterns
- Architecture (Custom Views): HIGH -- documented in Payload 3.x docs, existing AnfrageEditButton proves pattern works
- Architecture (Frontend Auth): HIGH -- official blog post + guide cover exact use case
- Pitfalls: HIGH -- based on official troubleshooting docs (cookie auth issues are well-documented)
- Status Transitions: HIGH -- pure business logic, no external dependency risk

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- Payload 3.x patterns are established)
