# Phase 16: Session Persistence + Role Visibility - Research

**Researched:** 2026-03-23
**Domain:** sessionStorage persistence, role-based nav filtering, admin access control (Payload CMS)
**Confidence:** HIGH

## Summary

Phase 16 extends the Phase 15 custom navigation with two independent features: (1) sessionStorage-based dropdown state persistence and (2) role-based nav-link filtering. Both features modify the existing `custom-nav.tsx` component. Additionally, customer users (`rolle === 'kunde'`) must be blocked from accessing the admin panel entirely.

The sessionStorage feature is a pure client-side concern using standard browser APIs. The role-filtering feature uses the `user.rolle` field already available via `useAuth()` (the `rolle` field has `saveToJWT: true`). The customer admin block leverages Payload's `access.admin` function on the Users collection, which is a server-side configuration change. A secondary middleware layer handles the custom redirect to `/kunden/*` instead of Payload's default `/admin/unauthorized`.

**Primary recommendation:** Implement in three layers: (1) add `roles` property to nav config types and filter arrays, (2) wrap `openSections` state with sessionStorage read/write via useEffect, (3) add `access.admin` to Users collection + middleware redirect for customers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Eigene Rollen-Map pro Nav-Link in der Nav-Config -- kein Payload visibleEntities API-Call
- Jeder NavItem und jede NavSection erhaelt ein optionales `roles`-Array (z.B. `roles: ['admin']`)
- Fehlendes `roles`-Array = sichtbar fuer alle Staff-Rollen
- User-Rolle kommt aus `useAuth()` (bereits im Component vorhanden)
- Viewer und Mitarbeiter sehen identische Nav-Links -- keine Nav-Unterscheidung zwischen diesen Rollen
- Admin sieht alles -- alle Direktlinks, alle Dropdowns
- Mitarbeiter/Viewer sehen: Direktlinks (Dashboard, Bestellungen, Produkte), Dropdowns (Bestellungsverwaltung, Produktverwaltung)
- Admin-only Bereiche: Direktlink Benutzer, Dropdown Website, Dropdown System
- Kunden kein Zugang zum Admin-Panel -- harter Block
- Kunden-Redirect: `/kunden/login` (nicht eingeloggt) oder `/kunden/dashboard` (eingeloggt)
- Dual-Logik: URL-basiert bei SPA-Navigation, sessionStorage bei Reload/Tab-Wechsel
- Additiv oeffnen: Bei Navigation oeffnet sich das aktive Dropdown ZUSAETZLICH zu bereits offenen
- Alles speichern: Jedes manuelle Oeffnen UND Schliessen wird in sessionStorage geschrieben
- sessionStorage-Key: z.B. `admin-nav-sections` als JSON-Objekt `{ key: boolean }`
- Beim allerersten Laden (kein sessionStorage vorhanden): URL-basierte Logik als Fallback
- Leere Sektionen nach Rollen-Filterung: Dropdown komplett ausblenden (Header verschwindet)
- Separator zwischen Direktlinks und Dropdowns nur anzeigen wenn mindestens ein Dropdown sichtbar ist
- Gleiches Dashboard fuer alle Staff-Rollen

### Claude's Discretion
- Technische Entscheidung ob `admin.access` oder Middleware fuer Kunden-Block besser passt
- sessionStorage Key-Naming und Serialisierungs-Format
- Exakte Implementierung des Dual-Logik-Patterns (URL + sessionStorage)
- Ob `roles`-Array auf NavItem-Ebene oder NavSection-Ebene filtert (vermutlich beides)

### Deferred Ideas (OUT OF SCOPE)
- NAV-P2-02: Animierte Dropdown-Uebergaenge (AnimateHeight)
- NAV-P2-03: Cross-Session Dropdown-Persistenz via usePreferences (DB-backed)
- Keyboard Navigation: Arrow Keys, Escape-Close innerhalb Dropdowns
- Rollenspezifisches Dashboard: Verschiedene Dashboard-Ansichten pro Rolle
- Benutzer-Trennung Team/Kunden: Eigenes Todo 011, nicht Teil von v1.2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-02 | Dropdown-Auf/Zu-Zustand bleibt waehrend der Session erhalten | sessionStorage dual-logic pattern (URL + storage), integration points at lines 396-408 of custom-nav.tsx |
| UX-03 | Nav-Links werden basierend auf User-Rolle gefiltert | `roles` property on NavItem/NavSection types, useAuth() provides `user.rolle` via JWT, access.admin on Users collection for customer block |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sessionStorage (Web API) | N/A | Persist dropdown open/close state within browser session | Native browser API, no dependencies, cleared on tab close |
| @payloadcms/ui `useAuth` | 3.79.0 | Access `user.rolle` client-side | Already imported in custom-nav.tsx, rolle is in JWT via saveToJWT |
| Payload `access.admin` | 3.79.0 | Block customers from admin panel server-side | Built-in Payload collection access control, returns canAccessAdmin flag |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js Middleware | 15.x | Custom redirect for customers accessing /admin | Redirect to /kunden/* instead of Payload's /admin/unauthorized |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sessionStorage | Payload usePreferences (DB-backed) | DEFERRED -- usePreferences persists cross-session which is out of scope |
| Own roles map | Payload visibleEntities API | Locked decision: own roles map, no API call |
| access.admin | Middleware-only | access.admin is the canonical Payload way and blocks API access too; middleware alone only blocks UI |

## Architecture Patterns

### Recommended Changes Structure
```
src/
  components/admin/
    custom-nav.tsx           # MODIFY: add roles filtering, sessionStorage, empty-section hiding
  collections/system/
    users.ts                 # MODIFY: add access.admin function
  middleware.ts              # MODIFY: add customer redirect logic for /admin routes
  access/
    is-staff.ts              # CREATE: reusable isStaff access function (or reuse existing)
```

### Pattern 1: Roles Property on Nav Config
**What:** Add optional `roles?: string[]` to both `NavItem` and `NavSection` types. Items/sections without `roles` are visible to all staff. Items with `roles: ['admin']` are visible only to admin.
**When to use:** For every entry in DIRECT_LINKS, DROPDOWN_SECTIONS, and SYSTEM_SECTION that needs role restriction.
**Example:**
```typescript
// Source: CONTEXT.md locked decisions + existing custom-nav.tsx types
type NavItem = { label: string; href: string; roles?: string[] };
type NavSection = {
  key: string;
  label: string;
  items?: NavItem[];
  subgroups?: NavSubgroup[];
  roles?: string[];
};

const DIRECT_LINKS: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bestellungen", href: "/admin/collections/anfragen" },
  { label: "Produkte", href: "/admin/collections/profile" },
  { label: "Benutzer", href: "/admin/collections/users", roles: ["admin"] },
];

// Filter function
function filterByRole<T extends { roles?: string[] }>(items: T[], userRole: string): T[] {
  return items.filter((item) => !item.roles || item.roles.includes(userRole));
}
```

### Pattern 2: Dual-Logic sessionStorage Persistence
**What:** On first load, check sessionStorage. If present, restore state. If absent, use URL-based logic (active section detection). On SPA navigation, ADDITIVELY open the active section on top of existing state. On every toggle, write to sessionStorage.
**When to use:** In the `custom-nav.tsx` component replacing the current simple useEffect.
**Example:**
```typescript
// Source: CONTEXT.md + existing custom-nav.tsx lines 396-408
const STORAGE_KEY = "admin-nav-sections";

// Initial state: read from sessionStorage or null
const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
  // SSR-safe: return empty object, hydrate in useEffect
  return {};
});

// On mount + pathname change
useEffect(() => {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored && pathname === prevPathnameRef.current) {
    // Reload/tab-switch: restore from storage
    try {
      setOpenSections(JSON.parse(stored));
    } catch {
      // Corrupt data, fall through to URL logic
    }
    return;
  }
  // SPA navigation or first load without storage:
  // Open the active section ADDITIVELY
  setOpenSections((prev) => {
    const next = stored ? { ...JSON.parse(stored) } : { ...prev };
    for (const section of allSections) {
      if (sectionHasActiveLink(pathname, section)) {
        next[section.key] = true;
      }
    }
    return next;
  });
  prevPathnameRef.current = pathname;
}, [pathname]);

// Persist on every change
useEffect(() => {
  if (Object.keys(openSections).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
  }
}, [openSections]);
```

### Pattern 3: Payload access.admin for Customer Block
**What:** Add `access.admin` function to the Users collection. When it returns `false`, Payload sets `canAccessAdmin = false` and redirects logged-in users to `/admin/unauthorized`.
**When to use:** Server-side block preventing customers from interacting with the admin panel at all.
**Example:**
```typescript
// Source: Payload source code node_modules/payload/dist/auth/getAccessResults.js line 12
// + node_modules/payload/dist/collections/config/types.d.ts line 437
access: {
  admin: ({ req }) => {
    // Block customers from admin panel
    if (!req.user) return false;
    return req.user.rolle !== 'kunde';
  },
  // ... existing read, create, update, delete
},
```

### Pattern 4: Middleware Customer Redirect
**What:** Extend existing `middleware.ts` to detect customer users accessing `/admin` and redirect to `/kunden/*`. This provides a friendlier UX than Payload's generic unauthorized page.
**When to use:** After the `access.admin` block, as a UX enhancement layer.
**Example:**
```typescript
// In middleware.ts, within the /admin prefix check:
// Read the payload JWT cookie to determine user role
// If rolle === 'kunde', redirect to /kunden/dashboard or /kunden/login
```

### Anti-Patterns to Avoid
- **Setting sessionStorage during SSR render:** Always read sessionStorage in useEffect, never in useState initializer or during render. Next.js SSR will crash or cause hydration mismatch.
- **Replacing open state on SPA nav:** The CONTEXT.md specifies ADDITIVE opening. Do NOT reset all sections to closed and only open the active one -- that would lose manually opened sections.
- **Filtering nav in the JSX render only:** Filter BEFORE passing to DropdownSection components, so that empty sections never render at all (including their wrapper/spacing).
- **Using Payload's visibleEntities API:** Locked decision says own roles map, not API calls. visibleEntities would also require async fetching.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin panel access blocking | Custom route guard in every /admin page | `access.admin` on Users collection | Payload's built-in mechanism, covers API + UI, single config point |
| JWT role reading in middleware | Custom JWT decoding with jsonwebtoken | Parse payload-token cookie with jose or simple JSON.parse of payload's JWT format | Payload stores role in JWT, no need for external crypto libs |
| sessionStorage serialization | Custom binary encoding | JSON.stringify/parse | Simple key-value map, JSON is perfectly adequate |

**Key insight:** The heavy lifting (auth, JWT, admin panel routing) is handled by Payload. This phase only adds a thin layer on top.

## Common Pitfalls

### Pitfall 1: sessionStorage SSR Crash
**What goes wrong:** Accessing `sessionStorage` during server-side rendering causes `ReferenceError: sessionStorage is not defined`.
**Why it happens:** Next.js renders components on the server first. `sessionStorage` is a browser-only API.
**How to avoid:** Only access sessionStorage inside `useEffect` (which only runs client-side). Never in useState initializer, useMemo, or render body.
**Warning signs:** Hydration mismatch errors, build-time crashes.

### Pitfall 2: Additive vs. Replacement Open Logic
**What goes wrong:** On SPA navigation, all dropdowns get reset to only show the active section. User loses their manually opened sections.
**Why it happens:** The current Phase 15 useEffect replaces `openSections` entirely based on pathname.
**How to avoid:** Use spread operator to merge: `setOpenSections(prev => ({ ...prev, [activeKey]: true }))`. Never replace the full state.
**Warning signs:** "I opened Produktverwaltung, navigated to Medien, and Produktverwaltung closed."

### Pitfall 3: stale sessionStorage on Role Change
**What goes wrong:** User's role changes (admin demoted to viewer), but sessionStorage still has sections like "system" marked as open. After filtering, these keys are harmless (section won't render), but the storage contains stale keys.
**Why it happens:** sessionStorage persists within the tab session regardless of role changes.
**How to avoid:** This is a non-issue -- filtered sections simply won't render even if their key is `true` in storage. No cleanup needed. Role changes require re-login anyway.
**Warning signs:** None; this is a theoretical concern that resolves itself.

### Pitfall 4: Empty Sections After Filtering
**What goes wrong:** A dropdown section header renders with no items inside, creating visual gaps.
**Why it happens:** Section-level filtering is done but the Collapsible wrapper still renders.
**How to avoid:** Filter sections BEFORE the JSX map. Check if filtered items/subgroups length > 0. Also conditionally render the separator.
**Warning signs:** Visible "Bestellungsverwaltung" header with nothing underneath for viewers.

### Pitfall 5: Middleware JWT Parsing Complexity
**What goes wrong:** Attempting to decode the full JWT in middleware using crypto libraries fails because middleware runs in the Edge Runtime with limited Node.js APIs.
**Why it happens:** The Payload JWT is a standard JWT. To read the `rolle` claim, you need to decode it. Full verification requires `jsonwebtoken` which is not Edge-compatible.
**How to avoid:** For middleware redirect purposes, decode the JWT payload without verification (base64 decode the middle segment). The actual security enforcement is in Payload's `access.admin` on the server side. Middleware is purely a UX redirect layer.
**Warning signs:** `Module not found: Can't resolve 'crypto'` errors in middleware.

### Pitfall 6: Payload access.admin Redirect Destination
**What goes wrong:** Payload redirects blocked users to `/admin/unauthorized`, not to `/kunden/*`.
**Why it happens:** Payload's built-in redirect behavior goes to the `unauthorized` route configured in admin.routes.
**How to avoid:** Use BOTH `access.admin` (server-side block, catches API calls too) AND middleware (redirect to `/kunden/*` before Payload's route handler fires). The middleware intercepts first in Next.js request lifecycle.
**Warning signs:** Customer sees a generic "Unauthorized" page instead of being redirected to the customer area.

## Code Examples

### Existing Code: Current custom-nav.tsx State Management (lines 396-408)
```typescript
// Source: src/components/admin/custom-nav.tsx
const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

useEffect(() => {
  const newOpen: Record<string, boolean> = {};
  for (const section of [...DROPDOWN_SECTIONS, SYSTEM_SECTION]) {
    newOpen[section.key] = sectionHasActiveLink(pathname, section);
  }
  setOpenSections(newOpen);
}, [pathname]);

const toggleSection = (key: string) => {
  setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
};
```

### Existing Code: Users Collection Access (src/collections/system/users.ts)
```typescript
// Source: src/collections/system/users.ts
access: {
  read: ({ req }) => { /* ... */ },
  create: () => true,
  update: ({ req }) => { /* ... */ },
  delete: isAdmin,
  // NOTE: No access.admin yet -- this is where we add the customer block
},
```

### Existing Code: Middleware (src/middleware.ts)
```typescript
// Source: src/middleware.ts
// Currently skips /admin routes entirely (passes through)
const SKIP_PREFIXES = ['/admin', '/api', /* ... */]
// For customer block: need to intercept /admin BEFORE skipping
```

### Payload access.admin Type Signature
```typescript
// Source: node_modules/payload/dist/collections/config/types.d.ts line 437
access?: {
  admin?: ({ req }: { req: PayloadRequest }) => boolean | Promise<boolean>;
  // ... other access functions
};
```

### Payload canAccessAdmin Resolution
```typescript
// Source: node_modules/payload/dist/auth/getAccessResults.js line 12
results.canAccessAdmin = userCollectionConfig.access.admin
  ? await userCollectionConfig.access.admin({ req })
  : isLoggedIn; // defaults to true for any logged-in user
```

### JWT Cookie Decoding in Middleware (Edge-safe)
```typescript
// Pattern for reading rolle from JWT without crypto verification
function getRoleFromToken(request: NextRequest): string | null {
  const token = request.cookies.get('payload-token')?.value;
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    return decoded.rolle || null;
  } catch {
    return null;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload usePreferences (DB-backed) | sessionStorage (browser-only) | Locked decision | Simpler, no DB calls, session-scoped not permanent |
| NavGroup with built-in persistence | Custom DropdownSection + manual persistence | Phase 15 decision | Full control over behavior, no NavGroup coupling |
| visibleEntities API call | Static roles map in nav config | Locked decision | Zero async overhead, explicit control, no API dependency |

**Deprecated/outdated:**
- `admin.hidden` on collections: Still works but only hides from default Payload nav, irrelevant since we use custom Nav component
- `afterNavLinks` slot: Skipped when `admin.components.Nav` is set (already handled in Phase 15)

## Open Questions

1. **Middleware JWT Cookie Name**
   - What we know: Payload uses `payload-token` as the default JWT cookie name
   - What's unclear: Whether the cookie name is customized in this project
   - Recommendation: Check if `PAYLOAD_SECRET` or cookie config overrides exist. Default `payload-token` is almost certainly correct given no custom auth config is visible in payload.config.ts

2. **Middleware Edge Runtime Compatibility**
   - What we know: The existing middleware uses basic NextRequest/NextResponse which works in Edge Runtime
   - What's unclear: Whether base64 `atob` decoding of JWT payload works reliably in Edge Runtime for all JWT formats
   - Recommendation: Use `atob` which is available in Edge Runtime. If issues arise, use `Buffer.from(payload, 'base64').toString()` in Node.js middleware runtime

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2 + ts-jest 29.4 + @testing-library/react 16.3 |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest tests/unit/test-custom-nav.test.tsx --no-cache` |
| Full suite command | `npx jest --no-cache` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-02 | sessionStorage persistence: state restored after simulated reload | unit | `npx jest tests/unit/test-session-persistence.test.tsx -x` | Wave 0 |
| UX-02 | Additive open: navigating to new section does not close others | unit | `npx jest tests/unit/test-session-persistence.test.tsx -x` | Wave 0 |
| UX-02 | First load without storage falls back to URL-based logic | unit | `npx jest tests/unit/test-session-persistence.test.tsx -x` | Wave 0 |
| UX-03 | Admin sees all nav items (4 direct links, 4 dropdowns) | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | Wave 0 |
| UX-03 | Viewer sees filtered nav (3 direct links, 2 dropdowns) | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | Wave 0 |
| UX-03 | Empty sections after filtering are completely hidden | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | Wave 0 |
| UX-03 | Separator hidden when no dropdowns visible | unit | `npx jest tests/unit/test-role-visibility.test.tsx -x` | Wave 0 |
| UX-03 | access.admin blocks customers (server-side) | unit | `npx jest tests/unit/test-access-admin-block.test.ts -x` | Wave 0 |
| UX-03 | Middleware redirects customers to /kunden/* | unit | `npx jest tests/unit/test-middleware-redirect.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-custom-nav.test.tsx tests/unit/test-role-visibility.test.tsx tests/unit/test-session-persistence.test.tsx --no-cache`
- **Per wave merge:** `npx jest --no-cache`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-session-persistence.test.tsx` -- covers UX-02 (sessionStorage dual-logic, additive open, first-load fallback)
- [ ] `tests/unit/test-role-visibility.test.tsx` -- covers UX-03 (admin vs. viewer nav filtering, empty section hiding, separator logic)
- [ ] `tests/unit/test-access-admin-block.test.ts` -- covers UX-03 (access.admin function returns correct boolean per role)
- [ ] `tests/unit/test-middleware-redirect.test.ts` -- covers UX-03 (middleware customer redirect logic)
- [ ] sessionStorage mock in jest-setup.ts or per-test (jsdom provides sessionStorage, verify it works)

## Claude's Discretion Recommendations

### 1. Customer Block: Use BOTH access.admin AND middleware
**Recommendation:** Implement `access.admin` on the Users collection as the primary security layer, PLUS extend middleware for the customer-friendly redirect.

**Rationale:**
- `access.admin` is Payload's canonical mechanism. It sets `canAccessAdmin = false` which blocks not just the UI but also API interactions within the admin context. This is the security layer.
- Middleware fires before Payload's route handler. By checking the JWT cookie role in middleware, we can redirect customers to `/kunden/dashboard` (or `/kunden/login`) before they ever see Payload's generic "/admin/unauthorized" page. This is the UX layer.
- Together they provide defense-in-depth: middleware for nice UX, access.admin for real security.

### 2. sessionStorage Key and Format
**Recommendation:** Use key `admin-nav-sections` with value `{"bestellungsverwaltung":true,"produktverwaltung":false,"website":true,"system":false}`.
- JSON object with section keys as properties, boolean values.
- Simple, human-readable, easy to debug in DevTools.
- Wrap JSON.parse in try/catch to handle corrupt data gracefully (fall back to URL logic).

### 3. Dual-Logic Implementation
**Recommendation:** Use a `useRef` to track the previous pathname. On pathname change, distinguish between:
- **Mount (no previous pathname):** Read sessionStorage. If exists, restore. If not, compute from URL.
- **SPA navigation (pathname changed):** Additively open the active section on top of current state, then write to sessionStorage.
- **toggleSection:** Update state and write to sessionStorage.
- **Separate useEffect for storage writes:** Every time openSections changes, persist to sessionStorage. This keeps the write logic in one place.

### 4. Roles Filtering on Both Levels
**Recommendation:** Apply `roles` on BOTH NavItem and NavSection levels:
- **NavSection.roles:** If set, the entire dropdown is hidden for non-matching roles (e.g., Website and System dropdowns are admin-only).
- **NavItem.roles:** If set within a visible section, individual items are hidden. If all items in a section are filtered out, the section header disappears too.
- In practice for this project: Section-level roles suffice for Website (`roles: ['admin']`) and System (`roles: ['admin']`). Item-level roles are needed for the "Benutzer" direct link (`roles: ['admin']`). No item-level filtering needed within Bestellungsverwaltung or Produktverwaltung since those are visible to all staff.

## Sources

### Primary (HIGH confidence)
- `node_modules/payload/dist/collections/config/types.d.ts` line 437 -- `access.admin` type signature: `({ req }: { req: PayloadRequest }) => boolean | Promise<boolean>`
- `node_modules/payload/dist/auth/getAccessResults.js` line 12 -- canAccessAdmin resolution logic
- `node_modules/@payloadcms/next/dist/utilities/handleAuthRedirect.js` -- redirect to `/admin/unauthorized` when canAccessAdmin is false
- `src/components/admin/custom-nav.tsx` -- existing nav component, integration points at lines 15-22 (types), 24-121 (config arrays), 396-408 (state management)
- `src/collections/system/users.ts` -- existing access config, rolle field with saveToJWT: true
- `src/middleware.ts` -- existing middleware structure with SKIP_PREFIXES pattern

### Secondary (MEDIUM confidence)
- [Payload CMS Access Control Docs](https://payloadcms.com/docs/access-control/overview) -- overview of access control patterns
- [Payload CMS Collection Access Control](https://payloadcms.com/docs/access-control/collections) -- collection-level access.admin documentation
- [Payload Community: Restrict Admin Panel by Role](https://payloadcms.com/community-help/discord/restrict-access-to-admin-panel-unless-role-is-admin) -- community pattern for role restriction

### Tertiary (LOW confidence)
- [GitHub Discussion #4606: Prevent user login to /admin](https://github.com/payloadcms/payload/discussions/4606) -- community question, no answers but confirms the use case is common

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all APIs verified against actual node_modules type definitions and source code
- Architecture: HIGH -- patterns directly derived from existing codebase + CONTEXT.md locked decisions
- Pitfalls: HIGH -- verified against Payload source (getAccessResults.js, handleAuthRedirect.js) and Next.js SSR constraints
- Validation: HIGH -- test framework already established, patterns from existing test-custom-nav.test.tsx

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable -- Payload 3.79.0 pinned, browser APIs don't change)
