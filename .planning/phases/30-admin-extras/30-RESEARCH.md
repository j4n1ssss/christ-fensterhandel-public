# Phase 30: Admin-Extras - Research

**Researched:** 2026-04-03
**Domain:** Payload CMS Admin Custom Views, E-Mail Queue, Server-side Pagination, API Routes
**Confidence:** HIGH

## Summary

Phase 30 delivers four admin tooling improvements: (1) a Webhook/E-Mail Queue tab in the Anfrage-Detail-View, (2) manual email sending from the Kontakt tab, (3) server-side pagination for the Anfragen-Liste, and (4) dashboard performance optimization. All features build on established codebase patterns -- Payload Custom Views, the email_queue collection, React Email templates, and inline-style admin components.

The codebase is well-structured for these changes. The TabPanel component is extensible (adding a 5th tab is straightforward), the AngebotsModal provides a proven modal pattern, and list-view-helpers.ts is already a pure data module importable on the server. The main complexity lies in the Anfragen-Liste refactor from client-side `limit=0` to server-side pagination with a custom API route that computes attention scores, filter counts, and search server-side.

**Primary recommendation:** Build the custom API routes first (`/api/admin/anfragen-list`, `/api/admin/dashboard-stats`, `/api/admin/email-preview`, `/api/admin/send-email`), then layer the UI components on top. Extend `email_queue` schema early since multiple features depend on the new `anfrage` relationship field.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Webhook-Tab is 5th tab "Webhooks" in TabPanel, admin-only visibility
- Compact rows with expand-detail pattern (Event-Type, Status-Badge, Zeitstempel, Empfaenger)
- Stats bar: "12 gesendet . 1 fehlgeschlagen . 0 abgebrochen" as colored badges
- No filtering in webhook tab (chronological list, max 50 entries)
- Retry resets to 'pending', toast feedback, auto-refresh after retry
- Cleanup retention from 30 to 90 days
- E-Mail send button in Kontakt-Tab, modal dialog following AngebotsModal pattern
- All 9 customer templates + "Freitext (ohne Template)" as 10th option
- FreitextEmail React Email template: BaseLayout + greeting + body prop + anfrage ref + CTA + footer
- Betreff always visible and editable, pre-filled from Event-Matrix for templates
- Empfaenger pre-filled with customer email, optional alternative with "Statt Kunde"/"Zusaetzlich zu Kunde" radio
- Inline iframe preview via POST /api/admin/email-preview
- POST /api/admin/send-email with rate limit 10/min per user
- Event type: manuell_[templateSlug], StatusHistorie with 'email_gesendet' action type
- Offset-Pagination with page numbers, 25 per page
- Filter tabs as query parameters, server-side sort including attention-score
- Server-side search (anfrage_nummer, Kundenname, E-Mail)
- Tab counts in filter labels: "Offen (12) . Wartet (5)"
- URL-state: ?page=2&tab=offen&sort=attention&q=suchtext
- WebhookFehlerBadge counts 'dead' from email_queue, webhook_errors Global removed
- Nav label "Webhook Fehler" -> "E-Mail Queue"
- Dashboard API route /api/admin/dashboard-stats, new 5th stat card "Dringend"
- email_queue: new 'anfrage' relationship + 'sent_by' relationship fields

### Claude's Discretion
- Exact CSS/layout of Webhook-Tab stats bar and expand rows
- StatusHistorie 'email_gesendet' icon choice and timeline rendering
- FreitextEmail template internal structure (Props, rendering)
- Dashboard-Stats API aggregation strategy
- Anfragen-Liste URL-routing integration with Payload Admin Custom Views

### Deferred Ideas (OUT OF SCOPE)
- ADMN-F04: Attention-Score weights configurable in Settings
- E-Mail settings page with active/inactive toggles per event (ADMN-F01)
- Mobile/Tablet optimization for Admin Panel
- Dark Mode for email templates
- HTML-Preview in Webhook-Tab expand row (only error-log + metadata)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMN-01 | Webhook-Tab Redesign (chronological list, details, retry, filtering, success rate) | TabPanel extension pattern, email_queue schema with anfrage relationship, EmailQueueRetryButton reuse |
| ADMN-02 | Manual email send from Anfrage-Detail-View (template selection, freetext, alt recipient) | AngebotsModal pattern for dialog, template registry for dropdown, renderEmailForEvent for preview/send, StatusHistorie for logging |
| ADMN-03 | Webhook-Logging erweitern (success logging, not just errors) | email_queue already stores all statuses (pending/sent/failed/dead); retention change from 30->90 days in cleanupSentEvents |
| ADMN-04 | Server-side pagination for Anfragen-Liste (replace limit=0) | list-view-helpers.ts pure data module for server import, Payload find() with pagination, custom API route pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.x | CMS, API, Auth, Custom Views | Already embedded in Next.js, provides find/count/update APIs |
| Next.js | 15.x (App Router) | API routes, server components | Framework base |
| React Email | 3.x | Email template rendering | Existing 9 templates + BaseLayout |
| Zod | 3.x | Request validation | Established pattern in all API routes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | latest | Icons | Dashboard stat cards, timeline icons |
| @payloadcms/ui | 3.x | toast, useAuth, useDocumentInfo | Admin component integration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom offset pagination | Payload cursor pagination | Payload natively supports offset (page/limit), no cursor needed |
| SWR/React Query for list | Manual fetch + state | Overkill for admin panel, keep consistent with existing fetch pattern |

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/(payload)/api/admin/
    anfragen-list/route.ts       # Server-side paginated list API
    dashboard-stats/route.ts     # Dashboard statistics API
    email-preview/route.ts       # Manual email preview API
    send-email/route.ts          # Manual email send API
  components/admin/
    webhook-tab.tsx              # New 5th tab component
    email-send-modal.tsx         # Manual email send dialog
    anfragen-list-view.tsx       # Refactored with server pagination
    dashboard-overview.tsx       # Refactored with API route
    webhook-fehler-badge.tsx     # Migrated to email_queue
  collections/system/
    email-queue.ts               # Extended with anfrage + sent_by fields
  emails/templates/
    freitext.tsx                 # New freetext email template
  lib/email/
    render-email.ts              # Extended registry with freitext template
    types.ts                     # Extended EmailEventType (optional)
    queue.ts                     # Retention updated to 90 days
```

### Pattern 1: Admin API Route with Auth + Rate Limit
**What:** Server-side route that validates auth, applies rate limiting, and returns JSON
**When to use:** All four new API routes
**Example:**
```typescript
// Pattern from existing anonymize-customer/route.ts and email-preview route
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { isSameOriginOrReferer } from '@/lib/security'

// In-memory rate limiter (Phase 25 pattern)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) || []
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(userId, recent)
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  return false
}

export async function POST(request: NextRequest) {
  if (!isSameOriginOrReferer(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !['admin', 'mitarbeiter'].includes(user.rolle as string)) {
    return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }
  if (checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Zu viele Anfragen' }, { status: 429 })
  }
  // ... business logic
}
```

### Pattern 2: TabPanel Extension
**What:** Adding a 5th tab to the existing TabPanel component
**When to use:** Webhook-Tab integration
**Key considerations:**
- `availableTabs` array is dynamically built based on conditions -- add "webhooks" conditionally for admin role
- `TAB_LABELS` record needs "webhooks" entry
- Tab component renders conditionally in the content area
- `STORAGE_KEY` for sessionStorage persistence already works generically
- Pass `userRole` prop to TabPanel (currently not passed, needs addition from AnfrageDetailView which already has `userRole`)

### Pattern 3: Modal Dialog (AngebotsModal Pattern)
**What:** Overlay + dialog with sticky header/footer, scrollable body, focus trap, escape handling
**When to use:** Email send modal
**Key structure from existing angebots-modal.tsx:**
- Overlay div with click-to-close
- Dialog div with ref for focus trap
- Sticky header with title + close button
- Scrollable body with form sections
- Sticky footer with cancel + submit buttons
- Escape key handler + focus trap
- Settings fetch on open
- Error state display
- Loading/submitting state management
- CSS classes: `angebots-modal__overlay`, `angebots-modal__dialog`, `angebots-modal__header`, etc.

### Pattern 4: Server-side Pagination API
**What:** Custom API route that replaces client-side limit=0 fetch
**When to use:** Anfragen-Liste refactor
**Key approach:**
```typescript
// /api/admin/anfragen-list
// Input: { page, limit, tab, sort, dir, q }
// Returns: { docs, totalDocs, totalPages, page, tabCounts }

// 1. Build Payload where clause from tab filter (use LIST_TAB_FILTERS from status-config)
// 2. Add search conditions (anfrage_nummer contains, kontaktdaten.nachname contains, kontaktdaten.email contains)
// 3. For attention_score sort: fetch all matching docs (limit=0), compute scores, sort, paginate in JS
//    OR: for other sorts, use Payload native sort + pagination
// 4. Parallel count queries for tab counts
```
**Important:** Attention-score sort CANNOT use Payload's native sort (it's a computed field). For attention-score sorting, fetch relevant docs server-side, compute scores, sort, and return the paginated slice. For other sort keys, use Payload's native pagination.

### Pattern 5: StatusHistorie Extension for Non-Status Events
**What:** Using StatusHistorie for email_gesendet action type (not a status change)
**When to use:** Logging manual email sends in the timeline
**Key consideration:**
- StatusHistorie currently has `von_status` and `zu_status` as required text fields
- For email_gesendet events: set both to current status (no change), use `kommentar` to store template/subject info
- Alternative: add an optional `aktion` field to StatusHistorie (more explicit, but schema change)
- The kommentar field approach is simpler and requires no schema change: prefix with "[E-Mail gesendet] Template: ..., Betreff: ..., An: ..."
- StatusTimeline component renders kommentar with left-border accent -- visually distinct enough

### Anti-Patterns to Avoid
- **limit=0 on production APIs:** Current Anfragen-Liste does this. The entire point of ADMN-04 is to eliminate this pattern.
- **Client-side filtering of large datasets:** Move filter logic to server-side where clauses.
- **Direct Payload queries in React components:** Dashboard currently does server component queries. Move to API route for better caching and error handling.
- **Mixing "use client" and server data fetching:** Dashboard is currently a server component. It will need to become client-side (or stay server with API route called at render time).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email rendering | Custom HTML builder | React Email + renderEmailForEvent() | 9 templates already use this pipeline, consistency |
| Rate limiting | Custom middleware | In-memory Map pattern (Phase 25) | Proven pattern, single-server Coolify deployment |
| CSRF protection | Custom token logic | isSameOriginOrReferer() from lib/security | Already used across all mutating routes |
| Queue entry creation | Direct DB insert | queueEmailEvent() or Payload API create | Handles idempotency keys, email validation, toggle checks |
| Status badge rendering | Custom badge logic | getStatusColor/getStatusLabel from status-config | Single Source of Truth for all status visualization |
| Pagination UI | Custom pagination | Extend existing list-pagination pattern | Already has "Seite X von Y" + Zurueck/Weiter buttons |

**Key insight:** Every feature in this phase builds on existing infrastructure. The email system (Phase 25), the admin custom views (Phase 19), and the status config are all mature. The risk is in the integration seams, not in the individual features.

## Common Pitfalls

### Pitfall 1: Attention-Score Sort with Pagination
**What goes wrong:** Attention score is a computed value (waitingDays x STATUS_WEIGHT), not a database field. Payload's native sort cannot sort by it.
**Why it happens:** Developers assume all sort columns can use database-level sorting.
**How to avoid:** When sort=attention_score, fetch ALL matching documents (with filters applied), compute scores in JS, sort, then return the requested page slice. For other sort keys, use Payload's native `sort` + `page` + `limit`.
**Warning signs:** Results appear unsorted or scores don't match the displayed order.

### Pitfall 2: email_queue Schema Change Requires Migration
**What goes wrong:** Adding `anfrage` and `sent_by` relationship fields to email_queue means existing rows have null values.
**Why it happens:** PostgreSQL allows nullable new columns, but queries filtering by `anfrage` must handle the null case.
**How to avoid:** Make both new fields optional (not required). Webhook tab query uses `where: { anfrage: { equals: anfrageId } }` which naturally excludes entries without the field set. Future entries from queueEmailEvent will set the anfrage field.
**Warning signs:** Empty webhook tab even though emails were sent.

### Pitfall 3: useSearchParams() SSR Hydration
**What goes wrong:** useSearchParams() can throw during SSR in Payload admin custom views.
**Why it happens:** Payload admin renders custom views server-side before hydration.
**How to avoid:** The existing anfragen-list-view.tsx already wraps useSearchParams in try/catch -- maintain this pattern.
**Warning signs:** Hydration errors, flash of wrong state on page load.

### Pitfall 4: iframe Preview Security
**What goes wrong:** iframe preview of email HTML can be blocked by CSP or display incorrectly.
**Why it happens:** The rendered HTML contains external resources (logo URL), inline styles, and email-specific CSS.
**How to avoid:** Use `srcdoc` attribute on the iframe instead of `src`. Render HTML server-side via the preview API route, return it as a string, set it as iframe srcdoc. This avoids CSP issues with blob URLs.
**Warning signs:** Blank iframe, broken styles in preview.

### Pitfall 5: Dashboard Server Component to API Route Migration
**What goes wrong:** Current dashboard-overview.tsx is a Server Component that directly uses `getPayload`. Moving to an API route requires making it a client component.
**Why it happens:** Server components can't fetch from internal API routes (they run on the server).
**How to avoid:** Two options: (A) Keep as server component but extract query logic into a shared function, or (B) Convert to client component that fetches from /api/admin/dashboard-stats. Option B is what CONTEXT.md specifies. The dashboard-overview.tsx must become "use client" with useEffect data loading.
**Warning signs:** Hydration mismatch, double-fetching, stale data.

### Pitfall 6: Manual Email Event Type Not in EmailEventType Union
**What goes wrong:** `manuell_bestaetigung` is not a valid EmailEventType value.
**Why it happens:** The union type is closed (24 values), and manual email types are dynamic.
**How to avoid:** For manual emails, bypass the event matrix. Render the template directly via renderEmailForEvent with a known template slug, but store the event_type as a plain string in email_queue (the field is `type: "text"`, not a select). The queueEmailEvent function uses the event matrix for recipient resolution -- for manual sends, create the queue entry directly via Payload API instead.
**Warning signs:** TypeScript errors on event type, template not found.

### Pitfall 7: Concurrent Tab Count Queries
**What goes wrong:** Multiple parallel count queries for filter tabs slow down the API response.
**Why it happens:** Each tab has different status filters requiring separate queries.
**How to avoid:** Use Promise.all for parallel execution. Consider a single query that fetches all docs (with search filter applied) and counts locally -- but only if the total is small. For >500 anfragen, the individual count queries are faster than fetching all docs.
**Warning signs:** Slow page loads, visible delay in tab count updates.

## Code Examples

### email_queue Schema Extension
```typescript
// Add after existing fields in email-queue.ts
{
  name: "anfrage",
  type: "relationship",
  relationTo: "anfragen",
  index: true,
  admin: {
    description: "Zugehoerige Anfrage (fuer Tab-Filterung)",
  },
},
{
  name: "sent_by",
  type: "relationship",
  relationTo: "users",
  admin: {
    description: "Manuell gesendet von (null bei automatischen)",
  },
},
```

### Webhook Tab Query
```typescript
// Fetch queue entries for a specific anfrage
const res = await fetch(
  `/api/email_queue?where[anfrage][equals]=${anfrageId}&sort=-createdAt&limit=50`,
  { credentials: "include" }
);
```

### Manual Email Send Flow
```typescript
// 1. Client: POST /api/admin/email-preview
//    { anfrageId, templateSlug, freitext?, subject? }
//    Returns: { html: string } (rendered HTML for iframe preview)

// 2. Client: POST /api/admin/send-email
//    { anfrageId, templateSlug, subject, freitext?, to, mode: 'replace' | 'additional' }
//    Server: renders template -> creates email_queue entry -> creates StatusHistorie entry
//    Returns: { success: true }
```

### FreitextEmail Template Props
```typescript
interface FreitextEmailProps {
  settings: BaseLayoutSettings;
  logoUrl?: string;
  anfrageNummer: string;
  kunde: { vorname: string; nachname: string };
  freitext: string;
  subject: string;
  anfrageUrl: string;
}
```

### Server-side Anfragen-List Route
```typescript
// GET /api/admin/anfragen-list?page=1&limit=25&tab=offen&sort=attention&dir=desc&q=mueller
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  // ... auth check ...

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const tab = url.searchParams.get('tab') || 'alle';
  const sort = url.searchParams.get('sort') || 'attention';
  const dir = url.searchParams.get('dir') || 'desc';
  const q = url.searchParams.get('q') || '';

  // Build where clause from tab + search
  const tabStatuses = LIST_TAB_FILTERS[tab];
  const whereConditions: any[] = [];
  if (tabStatuses && tabStatuses.length > 0) {
    whereConditions.push({ status: { in: tabStatuses } });
  }
  if (q.trim()) {
    whereConditions.push({
      or: [
        { anfrage_nummer: { contains: q } },
        { 'kontaktdaten.nachname': { contains: q } },
        { 'kontaktdaten.email': { contains: q } },
      ],
    });
  }

  // For attention sort: fetch all matching, compute, sort, paginate in JS
  // For other sorts: use Payload native pagination
  // ... implementation details ...

  // Parallel tab counts
  const tabCounts = await Promise.all(
    Object.entries(LIST_TAB_FILTERS).map(async ([tabKey, statuses]) => {
      const count = statuses.length > 0
        ? await payload.count({ collection: 'anfragen', where: { status: { in: statuses } } })
        : await payload.count({ collection: 'anfragen' });
      return [tabKey, count.totalDocs] as const;
    })
  );

  return NextResponse.json({
    docs: paginatedDocs,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit),
    page,
    tabCounts: Object.fromEntries(tabCounts),
  });
}
```

### WebhookFehlerBadge Migration
```typescript
// Before: fetch("/api/globals/webhook_errors") -> count errors in last 24h
// After: fetch("/api/email_queue?where[status][equals]=dead&limit=0") -> use totalDocs
useEffect(() => {
  async function fetchDeadCount() {
    try {
      const res = await fetch(
        "/api/email_queue?where[status][equals]=dead&limit=0",
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setErrorCount(data.totalDocs || 0);
    } catch {
      // Silently fail
    }
  }
  fetchDeadCount();
  const interval = setInterval(fetchDeadCount, 60_000);
  return () => clearInterval(interval);
}, []);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| webhook_errors Global | email_queue collection | Phase 25 | Queue already logs all events; Global was pre-Phase-25 legacy |
| limit=0 client-side sort | Server-side pagination API | Phase 30 (this phase) | Critical for >500 anfragen performance |
| Dashboard direct Payload queries | API route with parallel queries | Phase 30 (this phase) | Eliminates limit=0 umsatz query |

**Deprecated/outdated:**
- `webhook_errors` Global: No longer needed. Was superseded by email_queue. Badge reads from a Global that may not even exist as a registered Payload Global (not found in payload.config.ts globals array). Must be removed.
- `limit=0` in anfragen-list-view.tsx: Performance bottleneck. Must be replaced with server-side pagination.
- `limit: 0, pagination: false` in dashboard-overview.tsx: Umsatz query loads all paid/completed anfragen. Must aggregate server-side.

## Open Questions

1. **Attention-score sort performance at scale**
   - What we know: getAttentionScore is a simple multiplication (waitingDays x STATUS_WEIGHT). For attention sort, all matching docs must be fetched.
   - What's unclear: Performance with >1000 anfragen when sorting by attention score (requires fetching all).
   - Recommendation: For the initial implementation, fetch all matching docs for attention sort. Monitor performance. If it degrades, consider adding a computed `attention_score` field to the anfragen collection updated via afterChange hook.

2. **StatusHistorie schema for email_gesendet**
   - What we know: StatusHistorie requires von_status and zu_status (both required). email_gesendet is not a status change.
   - What's unclear: Whether to add an optional `aktion` field or reuse existing fields.
   - Recommendation: Use kommentar field with a structured prefix: `[E-Mail gesendet] Template: {slug}, An: {email}`. Set von_status and zu_status to the current anfrage status. The StatusTimeline already renders kommentar with visual distinction. An `aktion` field would be cleaner but requires a schema change and potential migration.

3. **Dashboard as server component vs client component**
   - What we know: Currently a server component with direct Payload queries. CONTEXT.md specifies an API route.
   - What's unclear: Whether to keep the server component calling the shared function or convert to client.
   - Recommendation: Convert to client component ("use client") with useEffect + fetch to /api/admin/dashboard-stats. This matches the CONTEXT.md decision and enables future dynamic refresh.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.x + ts-jest 29.x |
| Config file | jest.config.ts (project root) |
| Quick run command | `npm test -- --testPathPattern=test-admin` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-01 | Webhook tab shows queue entries filtered by anfrage | unit | `npm test -- tests/unit/test-webhook-tab.test.ts -x` | Wave 0 |
| ADMN-01 | Retry button resets entry to pending | unit | `npm test -- tests/unit/test-email-queue-retry.test.ts -x` | Wave 0 |
| ADMN-02 | Send-email route validates input, creates queue entry + StatusHistorie | unit | `npm test -- tests/unit/test-send-email.test.ts -x` | Wave 0 |
| ADMN-02 | Email preview route renders template with freitext | unit | `npm test -- tests/unit/test-email-preview-manual.test.ts -x` | Wave 0 |
| ADMN-03 | Cleanup retention is 90 days for sent events | unit | `npm test -- tests/unit/test-email-queue.test.ts -x` | Existing |
| ADMN-04 | Anfragen-list API returns paginated results with tab counts | unit | `npm test -- tests/unit/test-anfragen-list-api.test.ts -x` | Wave 0 |
| ADMN-04 | Attention score sort works server-side | unit | `npm test -- tests/unit/test-list-view-helpers.test.ts -x` | Existing |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=test-{module} -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-webhook-tab.test.ts` -- covers ADMN-01 webhook tab rendering
- [ ] `tests/unit/test-send-email.test.ts` -- covers ADMN-02 send route validation
- [ ] `tests/unit/test-email-preview-manual.test.ts` -- covers ADMN-02 preview route
- [ ] `tests/unit/test-anfragen-list-api.test.ts` -- covers ADMN-04 pagination logic
- [ ] `tests/unit/test-freitext-template.test.ts` -- covers ADMN-02 FreitextEmail template

## Sources

### Primary (HIGH confidence)
- Codebase analysis: src/collections/system/email-queue.ts -- existing schema, access control
- Codebase analysis: src/lib/email/queue.ts -- queueEmailEvent, processQueue, cleanupSentEvents
- Codebase analysis: src/lib/email/render-email.ts -- template registry, renderEmailForEvent, buildTemplateProps
- Codebase analysis: src/lib/email/event-matrix.ts -- 24 event types, betreff templates
- Codebase analysis: src/components/admin/tab-panel.tsx -- extensible tab system
- Codebase analysis: src/components/admin/angebots-modal.tsx -- modal dialog pattern
- Codebase analysis: src/components/admin/anfragen-list-view.tsx -- current limit=0 client-side approach
- Codebase analysis: src/components/admin/dashboard-overview.tsx -- current server component with direct queries
- Codebase analysis: src/lib/list-view-helpers.ts -- pure data module, getAttentionScore
- Codebase analysis: src/lib/status-config.ts -- LIST_TAB_FILTERS, STATUS_WEIGHT
- Codebase analysis: src/components/admin/email-queue-retry.tsx -- existing retry button pattern
- Codebase analysis: src/components/admin/webhook-fehler-badge.tsx -- legacy webhook_errors fetch
- Codebase analysis: src/components/admin/custom-nav.tsx -- navigation structure, badge integration
- Codebase analysis: src/app/(payload)/api/admin/anonymize-customer/route.ts -- admin API route auth pattern
- Codebase analysis: src/app/(payload)/api/email-preview/[template]/route.ts -- rate limiter pattern

### Secondary (MEDIUM confidence)
- .planning/phases/30-admin-extras/30-CONTEXT.md -- all user decisions and implementation details
- .planning/phases/25-e-mail-system/25-CONTEXT.md (referenced, not re-read) -- email system architecture

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- all patterns exist in codebase, extension not greenfield
- Pitfalls: HIGH -- identified from direct code analysis of existing implementations

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- all internal codebase patterns)
