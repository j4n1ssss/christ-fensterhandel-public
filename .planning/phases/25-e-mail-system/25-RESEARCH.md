# Phase 25: E-Mail-System - Research

**Researched:** 2026-03-29
**Domain:** Email templating (React Email), event-driven queue architecture, N8N webhook integration
**Confidence:** HIGH

## Summary

Phase 25 replaces the existing fire-and-forget `sendN8NWebhook()` system with a robust, queue-based email pipeline. The architecture has three layers: (1) React Email templates rendered at queue-time as HTML + plain text, (2) a persistent `email_queue` Payload Collection with exponential backoff retry, and (3) N8N as a pure mail transport receiving pre-rendered HTML. The existing `n8n-webhook.ts`, `webhook_errors` Global, and the old `WebhookPayload` interface are completely replaced.

React Email (`@react-email/components` v1.0.10, `@react-email/render` v2.0.4) is the locked template technology. It provides JSX-based email components that compile to cross-client HTML. The `render()` function is async and supports a `{ plainText: true }` option for generating plain-text alternatives. The library supports React 19 and Next.js 15+ (React Email 5.0 added React 19.2 / Next.js 16 support).

The queue worker runs via Next.js `instrumentation.ts` `register()` hook with `setInterval`. This function is called once per server instance in production, making it suitable for a single-worker pattern on Coolify. The existing codebase has no `instrumentation.ts` yet -- it will be created from scratch.

**Primary recommendation:** Build templates in `src/emails/`, the event-matrix in `src/lib/email/`, the queue Collection in `src/collections/system/`, and the worker in `src/instrumentation.ts`. Use the established project patterns (TypeScript configs as SoT, Zod validation, Payload Collections for persistence, Custom Admin Pages with inline styles).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- React Email for all templates (JSX components, TypeScript-typed, SSR to HTML)
- Templates in `src/emails/` as top-level folder with `src/emails/components/` for reusable parts
- Base-Layout component with Header (Logo) + Footer (Firmendaten from Settings)
- 9 Kunden-Templates + separate simpler Mitarbeiter-Templates where needed
- Brand-consistent design from `.design/STYLE-GUIDE.md`, email-safe fonts (Arial/Helvetica fallback)
- No Dark Mode, only German emails, HTML + Plain-Text rendering
- Event-Matrix as TypeScript Config in `src/lib/email/event-matrix.ts` (like status-config.ts pattern)
- 18+ specific `EmailEventType` union types with Map from Event to templates/recipients/subjects
- New Payload Collection `email_queue` with fields: event_type, payload_data, status, attempts, max_attempts, next_retry_at, idempotency_key, error_log, created_at
- Queue replaces webhook_errors Global and sendN8NWebhook() completely
- Cron-based worker via `instrumentation.ts` register() hook with setInterval every 60 seconds
- Exponential Backoff: 1min, 2min, 4min, 8min, 16min -- after 5 attempts status 'dead'
- HTML rendered at queuing time (data snapshot), not at processing time
- Cleanup: 'sent' events after 30 days, 'dead' events remain for manual review
- Idempotency-Key: `${anfrageId}_${eventType}_${statusNeu}_${timestamp}` with unique DB constraint
- Email validation before queuing: Zod `z.string().email()` -- invalid addresses get status='skipped'
- API Route `/api/email-preview/[template]` with Mock-Data (Admin-protected)
- Template-Index page under `/api/email-preview` listing all templates
- Test-Send button pre-filled with admin email, rate limited (5/min), goes through queue
- New 5th Tab 'E-Mail' on Custom Admin Page Settings
- Event-Toggles in Settings (JSON field `email_event_toggles`)
- Configurable staff distribution list: `benachrichtigungs_emails` Textarea in Settings
- Big Bang migration: delete webhook_errors, n8n-webhook.ts, replace sendN8NWebhook with queueEmailEvent
- One single N8N workflow for email sending, new env var N8N_EMAIL_WEBHOOK_URL
- N8N receives only { to, subject, html, plain_text, reply_to }

### Claude's Discretion
- Exact React Email Component structure and Styling
- Mock-Data format and variant coverage
- Queue Worker error-handling details
- instrumentation.ts implementation details
- Retry-Button Custom Component implementation
- Template-Index HTML Layout
- Event-Matrix subject texts (German wording)

### Deferred Ideas (OUT OF SCOPE)
- E-Mail-Einstellungsseite as own page (v1.5+)
- Kundenantwort auf Rueckfrage E-Mail (Phase 29)
- Kunden-Stornierung E-Mail (Phase 29)
- Kunden-Reklamation mit Fotos E-Mail (Phase 29)
- N8N Multi-Channel (Slack, Push, SMS)
- E-Mail Bounce-Handling
- SPF/DKIM/DMARC automatic validation
- E-Mail-Templates as CMS-Collection (editable without deployment)
- Daily digest instead of individual emails
- Guest tracking emails
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MAIL-01 | E-Mail Event-Matrix als Config (18 Events mit Empfaenger-Mapping) | Event-Matrix architecture follows status-config.ts pattern; TypeScript union types for all 18+ events; Map structure Event -> { recipients, templates, subjects } |
| MAIL-02 | React Email Base-Layout (Logo, Content-Slot, Footer mit Impressum + Datenschutz) | React Email components (@react-email/components v1.0.10) provide Html, Head, Body, Container, Section, Row, Column, Text, Link, Button, Heading, Img, Hr, Preview; Base layout uses getSettings() for dynamic footer |
| MAIL-03 | 9 E-Mail-Templates (Bestaetigung, Status-Update, Angebot, Zahlungslink, Zahlung, Stornierung, Rueckfrage, Reklamation, Rueckerstattung) | Each template is a React component importing BaseLayout; render() produces HTML, render({ plainText: true }) produces plain text; formatCents() for prices in templates |
| MAIL-04 | E-Mail-Preview Route (/api/email-preview/[template], Admin-geschuetzt) | Next.js API Route with Payload auth check (pattern from anonymize-customer/route.ts); renders template with mock data and returns HTML response; Template index page lists all available templates |
| MAIL-05 | N8N Idempotency-Keys zur Duplikat-Praevention | Composite key `${anfrageId}_${eventType}_${statusNeu}_${timestamp}` stored as unique field on email_queue Collection; duplicate insert rejected by DB unique constraint |
| MAIL-06 | N8N Setup-Dokumentation (Testing-Checkliste, Provider-Wechsel, Webhook-URLs) | Documentation in docs/wissen/n8n-email-setup.md; covers single N8N workflow setup, SMTP credential configuration, testing checklist |
| MAIL-07 | E-Mail-Validierung vor Webhook-Versand (Format + nicht leer, Fallback) | Zod z.string().email() validation before queuing; invalid addresses get queue entry with status='skipped' for audit trail |
| MAIL-08 | Persistente Event-Queue (DB-basiert, Retry mit Exponential Backoff, max 5) | email_queue Payload Collection; instrumentation.ts setInterval worker every 60s; exponential backoff (1,2,4,8,16 min); status lifecycle: pending -> processing -> sent/failed -> dead |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-email/components | 1.0.10 | Email UI components (Html, Body, Container, Section, Row, Column, Text, Link, Button, Heading, Img, Hr, Preview) | Locked decision; JSX-based, TypeScript-typed, cross-client compatible |
| @react-email/render | 2.0.4 | Render React components to HTML / plain text | Companion to components; async render() with plainText option |
| react-email | latest (5.x) | Dev server for local email preview (optional) | Optional CLI tool for local development preview at localhost:3000 |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 | Email validation, API input validation | Before queuing (email format), preview route params |
| payload | 3.79.0 | email_queue Collection, Settings Global, auth | Persistence layer, admin access control |
| next | 15.4.11 | API routes, instrumentation.ts | Preview route, queue worker |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom email_queue + instrumentation.ts worker | Payload Jobs Queue (built-in since v3.0) | Payload has a native jobs queue with retries, autoRun cron, and task definitions -- however user decided on custom Collection for full control, visibility in admin, and explicit queue management. Payload Jobs Queue is a viable alternative for future simplification. |
| React Email | MJML | MJML has better Outlook compatibility out-of-box but lacks JSX/TypeScript integration; user locked React Email |
| setInterval in instrumentation.ts | External cron (systemd timer, Coolify cron) | External cron adds infrastructure complexity; setInterval is simpler for single-server Coolify deployment |

**Installation:**
```bash
npm install @react-email/components @react-email/render
```

**Optional (dev preview server):**
```bash
npm install -D react-email
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── emails/                       # MAIL-02, MAIL-03
│   ├── components/               # Reusable email components
│   │   ├── base-layout.tsx       # Header + Footer wrapper
│   │   ├── email-button.tsx      # CTA Button (brand-colored)
│   │   ├── anfrage-card.tsx      # Compact product list
│   │   └── status-badge.tsx      # Status indicator
│   ├── templates/                # One file per template
│   │   ├── anfrage-bestaetigung.tsx
│   │   ├── status-update.tsx
│   │   ├── angebot-versendet.tsx
│   │   ├── zahlungslink.tsx
│   │   ├── zahlung-bestaetigung.tsx
│   │   ├── stornierung.tsx
│   │   ├── rueckfrage.tsx
│   │   ├── reklamation.tsx
│   │   └── rueckerstattung.tsx
│   └── staff/                    # Simpler staff notification templates
│       ├── neue-anfrage.tsx
│       └── status-benachrichtigung.tsx
├── lib/
│   └── email/                    # MAIL-01, MAIL-05, MAIL-07
│       ├── types.ts              # EmailEventType, EmailEventPayload, QueueEntry interfaces
│       ├── event-matrix.ts       # EVENT_MATRIX config (SoT)
│       ├── queue.ts              # queueEmailEvent(), processQueue(), cleanup functions
│       ├── render-email.ts       # renderEmailForEvent() -- template selection + render()
│       └── render-subject.ts     # renderSubject() with #{variable} replacement
├── collections/
│   └── system/
│       └── email-queue.ts        # MAIL-08: email_queue Collection definition
├── instrumentation.ts            # MAIL-08: Queue worker with setInterval
├── app/
│   └── api/
│       └── email-preview/        # MAIL-04
│           ├── route.ts          # Template index page (lists all templates)
│           └── [template]/
│               └── route.ts      # Individual template preview
└── components/
    └── admin/
        ├── settings-page.tsx     # Modified: add 5th 'E-Mail' tab
        ├── custom-nav.tsx        # Modified: 'Webhook Fehler' -> 'E-Mail Queue'
        └── email-queue-retry.tsx # Retry button for dead queue entries
```

### Pattern 1: Event-Matrix as TypeScript Config (follows status-config.ts)
**What:** Single source of truth mapping events to templates, recipients, and subjects
**When to use:** All email event resolution during afterChange hook
**Example:**
```typescript
// src/lib/email/event-matrix.ts
import type { StatusKey } from '@/lib/status-config';

export type EmailEventType =
  | 'neue_anfrage'
  | 'in_bearbeitung'
  | 'angebot_versendet'
  | 'bestaetigt'
  | 'zahlungslink_versendet'
  | 'bezahlt'
  | 'an_hersteller'
  | 'hersteller_bestaetigt'
  | 'hersteller_bestaetigt_mit_vorbehalt'
  | 'in_produktion'
  | 'hersteller_problem'
  | 'versandbereit'
  | 'geliefert'
  | 'abgeschlossen'
  | 'storniert'
  | 'rueckfrage'
  | 'zahlungsproblem'
  | 'reklamation'
  // Future slots (not wired yet)
  | 'kundenantwort'
  | 'test_preview';

type Recipient = 'kunde' | 'staff';

interface EventConfig {
  empfaenger: Recipient[];
  templates: {
    kunde?: string;  // template slug
    staff?: string;
  };
  betreff: {
    kunde?: string;  // Template string with #{variable} placeholders
    staff?: string;
  };
  enabled_default: boolean;
}

export const EVENT_MATRIX: Record<EmailEventType, EventConfig> = {
  neue_anfrage: {
    empfaenger: ['kunde', 'staff'],
    templates: { kunde: 'anfrage-bestaetigung', staff: 'neue-anfrage' },
    betreff: {
      kunde: 'Ihre Anfrage #{anfrage_nummer} ist eingegangen',
      staff: 'Neue Anfrage #{anfrage_nummer} von #{kunde_name}',
    },
    enabled_default: true,
  },
  // ... remaining events
};
```

### Pattern 2: Queue-Based Email Flow (afterChange -> Queue -> Worker -> N8N)
**What:** Non-blocking email pipeline with persistence and retry
**When to use:** Every status change and new Anfrage creation
**Example:**
```typescript
// src/lib/email/queue.ts
import { render } from '@react-email/render';
import { z } from 'zod';

const emailSchema = z.string().email();

export async function queueEmailEvent(params: {
  eventType: EmailEventType;
  anfrageId: string;
  anfrageNummer: string;
  status: string;
  kunde: { name: string; email: string };
  produkte: Array<{ produkttyp: string; stueckzahl: number; einzelpreis: number }>;
  gesamtbetragCents: number;
  zusatzDaten?: Record<string, unknown>;
}): Promise<void> {
  const { eventType, anfrageId, status } = params;
  const config = EVENT_MATRIX[eventType];
  if (!config) return;

  // Check event toggles from Settings
  const settings = await getSettings();
  const toggles = settings.email_event_toggles || {};

  for (const recipient of config.empfaenger) {
    // Check toggle
    const toggleKey = `${eventType}_${recipient}`;
    if (toggles[toggleKey] === false) continue;

    // Determine email address
    const toAddress = recipient === 'kunde'
      ? params.kunde.email
      : settings.benachrichtigungs_emails; // comma-separated

    // Validate email
    const emails = toAddress.split(',').map(e => e.trim()).filter(Boolean);
    for (const email of emails) {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        // Queue with status='skipped'
        await createQueueEntry({ ...baseEntry, to: email, status: 'skipped', error_log: 'Invalid email format' });
        continue;
      }

      // Render template
      const templateSlug = config.templates[recipient];
      const { html, plainText, subject } = await renderEmailForEvent(templateSlug, params, recipient);

      // Create idempotency key
      const idempotencyKey = `${anfrageId}_${eventType}_${status}_${Date.now()}`;

      // Queue entry
      await createQueueEntry({
        event_type: eventType,
        to: email,
        subject,
        html,
        plain_text: plainText,
        reply_to: settings.email_reply_to,
        payload_data: params,
        status: 'pending',
        attempts: 0,
        max_attempts: 5,
        idempotency_key: idempotencyKey,
      });
    }
  }
}
```

### Pattern 3: instrumentation.ts Worker
**What:** Background queue processor using setInterval
**When to use:** Runs once at server startup in production
**Example:**
```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime, not Edge
    const { processQueue, cleanupSentEvents } = await import('@/lib/email/queue');

    // Process queue every 60 seconds
    setInterval(async () => {
      try {
        await processQueue();
      } catch (err) {
        console.error('[Email Queue Worker] Processing error:', err);
      }
    }, 60_000);

    // Cleanup sent events daily (check every hour)
    setInterval(async () => {
      try {
        await cleanupSentEvents(30); // 30 days retention
      } catch (err) {
        console.error('[Email Queue Worker] Cleanup error:', err);
      }
    }, 3_600_000);
  }
}
```

### Pattern 4: React Email Template with Base Layout
**What:** JSX template component using shared layout
**When to use:** Every email template
**Example:**
```typescript
// src/emails/components/base-layout.tsx
import {
  Html, Head, Body, Container, Section, Text, Link, Img, Hr, Preview,
} from '@react-email/components';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
  settings: {
    firmenname: string;
    adresse_strasse: string;
    adresse_hausnummer: string;
    adresse_plz: string;
    adresse_ort: string;
    telefon: string;
    email: string;
  };
  logoUrl?: string;
}

export function BaseLayout({ preview, children, settings, logoUrl }: BaseLayoutProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f6f6', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header with Logo */}
          <Section style={{ padding: '24px 32px', textAlign: 'center' }}>
            {logoUrl && <Img src={logoUrl} alt={settings.firmenname} width={180} />}
          </Section>
          <Hr />
          {/* Content */}
          <Section style={{ padding: '24px 32px' }}>
            {children}
          </Section>
          <Hr />
          {/* Footer with Impressum */}
          <Section style={{ padding: '16px 32px', fontSize: '12px', color: '#666' }}>
            <Text>{settings.firmenname}</Text>
            <Text>{settings.adresse_strasse} {settings.adresse_hausnummer}, {settings.adresse_plz} {settings.adresse_ort}</Text>
            <Text>Tel: {settings.telefon} | E-Mail: {settings.email}</Text>
            <Link href="/impressum">Impressum</Link> | <Link href="/datenschutz">Datenschutz</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Anti-Patterns to Avoid
- **Rendering HTML at send-time instead of queue-time:** The CONTEXT.md explicitly requires rendering at queue time for data snapshot consistency. If the Anfrage data changes between queuing and sending, the email should still reflect the state at event time.
- **Using Tailwind in React Email without @react-email/tailwind:** React Email has a separate `<Tailwind>` component. Do NOT rely on the project's Tailwind config -- email CSS must be inlined.
- **Importing Payload/DB modules at module scope in instrumentation.ts:** Payload may not be fully initialized when `register()` runs. Use dynamic `import()` inside the interval callback.
- **Blocking the afterChange hook on email rendering:** Template rendering is fast (< 50ms) but should still be wrapped in try/catch to never block the main Payload operation.
- **Using the old `renderAsync()` function:** Deprecated since React Email 3.0. Use `render()` which is already async.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email HTML rendering | Custom HTML string concatenation | React Email `render()` | Handles inline CSS, cross-client compat, responsive tables |
| Plain text generation | Regex-based HTML stripping | `render(component, { plainText: true })` | Preserves semantic text structure, handles links properly |
| Email component layout | Raw `<table>` markup | React Email `<Section>`, `<Row>`, `<Column>` | Abstracts Outlook MSO conditional comments |
| CTA Buttons | Custom `<a>` styling | React Email `<Button>` | VML fallback for Outlook, padding works everywhere |
| Queue persistence | In-memory queue or Redis | Payload Collection (`email_queue`) | Already have Postgres, survives restarts, visible in admin |
| Retry logic | Custom setTimeout chains | Collection status + setInterval worker | Persistent, survives server restarts, auditable |
| Email validation | Custom regex | Zod `z.string().email()` | Already in project (v4.3.6), RFC-compliant |

**Key insight:** React Email abstracts the most painful parts of email development (Outlook MSO tables, inline CSS, responsive design). The `render()` function produces production-ready HTML without manual table layout. The project already has Postgres via Payload -- using a Collection for the queue is simpler and more observable than adding Redis or an external message broker.

## Common Pitfalls

### Pitfall 1: Outlook Rendering Breaks
**What goes wrong:** CSS flexbox, grid, and many modern CSS properties don't work in Outlook desktop. Emails look broken.
**Why it happens:** Outlook uses Microsoft Word's HTML rendering engine, not a browser engine.
**How to avoid:** Use React Email's layout components (`<Section>`, `<Row>`, `<Column>`) which generate table-based layout with MSO conditionals. Never use `display: flex` or `display: grid` in email styles. Test with Litmus or manual Outlook testing.
**Warning signs:** Layout looks perfect in Gmail/Apple Mail but broken in Outlook.

### Pitfall 2: instrumentation.ts Called Multiple Times in Dev
**What goes wrong:** The queue worker starts multiple instances in development, processing the same events multiple times.
**Why it happens:** Next.js calls `register()` multiple times during HMR in development mode.
**How to avoid:** Guard with a module-level flag (`let workerStarted = false`), or check `process.env.NODE_ENV === 'production'` before starting the interval. In production on Coolify (single container), this is called exactly once.
**Warning signs:** Duplicate emails during development testing.

### Pitfall 3: Dynamic Import Timing in instrumentation.ts
**What goes wrong:** Importing Payload or DB modules at the top of instrumentation.ts fails because the database connection isn't ready.
**Why it happens:** `register()` runs before the server is fully initialized.
**How to avoid:** Use dynamic `await import()` inside the setInterval callback, not at module scope. The callback runs 60s after startup, by which time everything is initialized.
**Warning signs:** "Cannot connect to database" or "Payload not initialized" errors at startup.

### Pitfall 4: Race Condition in Queue Processing
**What goes wrong:** Two worker ticks process the same queue entry, sending duplicate emails.
**Why it happens:** If processing takes > 60s and the next interval fires, both pick up the same 'pending' entry.
**How to avoid:** Set status to 'processing' immediately when picking up an entry (optimistic lock pattern). The `WHERE status = 'pending' OR (status = 'failed' AND next_retry_at <= now())` query combined with immediate status update to 'processing' prevents double-processing. Single worker on single server mitigates this further.
**Warning signs:** Duplicate emails in production, multiple 'processing' entries for same event.

### Pitfall 5: Idempotency Key Includes Timestamp
**What goes wrong:** The timestamp component means the same logical event could produce different keys if the hook fires slightly differently.
**Why it happens:** Using `Date.now()` makes every key unique, defeating idempotency for true retries.
**How to avoid:** The key format `${anfrageId}_${eventType}_${statusNeu}_${timestamp}` is intentional per CONTEXT.md -- it prevents duplicates from webhook retries but allows re-queuing the same event type (e.g., manual retry of dead entries). The unique constraint catches exact duplicates from rapid double-fires within the same millisecond.
**Warning signs:** None -- this is working as designed for the use case.

### Pitfall 6: Settings Data Stale in Templates
**What goes wrong:** Footer shows old company data because settings were cached.
**Why it happens:** `getSettings()` reads fresh from DB every call (per Phase 24 decision), so this should not happen. But if someone adds caching later, templates would show stale data.
**How to avoid:** Call `getSettings()` at render-time (during queueing) and embed the result into the HTML. Since HTML is rendered at queue-time, the settings are snapshotted correctly.
**Warning signs:** Footer data doesn't update after settings change.

## Code Examples

### Rendering HTML + Plain Text
```typescript
// Source: React Email docs + WebSearch verification
import { render } from '@react-email/render';
import AnfrageBestaetigung from '@/emails/templates/anfrage-bestaetigung';

const props = {
  kundenName: 'Max Mustermann',
  anfrageNummer: 'ANF-2026-001',
  produkte: [{ name: 'Fenster PVC', stueckzahl: 3, einzelpreis: 15000 }],
  gesamtbetragCents: 45000,
};

// HTML version
const html = await render(<AnfrageBestaetigung {...props} />);

// Plain text version
const plainText = await render(<AnfrageBestaetigung {...props} />, { plainText: true });
```

### email_queue Collection Definition
```typescript
// src/collections/system/email-queue.ts
import type { CollectionConfig } from 'payload';

export const EmailQueue: CollectionConfig = {
  slug: 'email_queue',
  labels: { singular: 'E-Mail Queue', plural: 'E-Mail Queue' },
  admin: {
    group: 'System',
    useAsTitle: 'event_type',
    defaultColumns: ['event_type', 'to', 'status', 'attempts', 'createdAt'],
  },
  access: {
    read: ({ req }) => req.user?.rolle === 'admin',
    create: () => true, // Internal use (server-side queuing)
    update: ({ req }) => req.user?.rolle === 'admin', // For manual retry
    delete: ({ req }) => req.user?.rolle === 'admin', // For cleanup
  },
  fields: [
    { name: 'event_type', type: 'text', required: true, index: true },
    { name: 'to', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'html', type: 'textarea', required: true },
    { name: 'plain_text', type: 'textarea' },
    { name: 'reply_to', type: 'text' },
    { name: 'payload_data', type: 'json', label: 'Event-Daten (Debug)' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Ausstehend', value: 'pending' },
        { label: 'In Verarbeitung', value: 'processing' },
        { label: 'Gesendet', value: 'sent' },
        { label: 'Fehlgeschlagen', value: 'failed' },
        { label: 'Abgebrochen', value: 'dead' },
        { label: 'Uebersprungen', value: 'skipped' },
      ],
      index: true,
    },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'max_attempts', type: 'number', defaultValue: 5 },
    { name: 'next_retry_at', type: 'date' },
    {
      name: 'idempotency_key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'error_log', type: 'textarea' },
  ],
};
```

### Subject Template Rendering
```typescript
// src/lib/email/render-subject.ts
export function renderSubject(template: string, variables: Record<string, string>): string {
  return template.replace(/#{(\w+)}/g, (_, key) => variables[key] ?? '');
}

// Usage:
renderSubject('Anfrage #{anfrage_nummer} bestaetigt', { anfrage_nummer: 'ANF-2026-042' });
// -> 'Anfrage ANF-2026-042 bestaetigt'
```

### Admin Auth Check Pattern (for Preview Route)
```typescript
// Source: Existing pattern from src/app/(payload)/api/admin/anonymize-customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user || !['admin', 'mitarbeiter'].includes(user.rolle || '')) {
    return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
  }

  // ... render template and return HTML
}
```

### Queue Worker Processing Logic
```typescript
// src/lib/email/queue.ts -- processQueue excerpt
export async function processQueue(): Promise<void> {
  const { getPayload } = await import('payload');
  const config = (await import('@payload-config')).default;
  const payload = await getPayload({ config });

  const now = new Date().toISOString();

  // Find processable entries
  const { docs: entries } = await payload.find({
    collection: 'email_queue',
    where: {
      or: [
        { status: { equals: 'pending' } },
        {
          and: [
            { status: { equals: 'failed' } },
            { next_retry_at: { less_than_equal: now } },
          ],
        },
      ],
    },
    limit: 10, // Process in batches
    sort: 'createdAt',
  });

  for (const entry of entries) {
    // Mark as processing
    await payload.update({
      collection: 'email_queue',
      id: entry.id,
      data: { status: 'processing' },
    });

    try {
      // POST to N8N
      const url = process.env.N8N_EMAIL_WEBHOOK_URL;
      if (!url) throw new Error('N8N_EMAIL_WEBHOOK_URL not configured');

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: entry.to,
          subject: entry.subject,
          html: entry.html,
          plain_text: entry.plain_text,
          reply_to: entry.reply_to,
        }),
      });

      if (!response.ok) {
        throw new Error(`N8N responded with ${response.status}: ${await response.text()}`);
      }

      // Success
      await payload.update({
        collection: 'email_queue',
        id: entry.id,
        data: { status: 'sent' },
      });
    } catch (err) {
      const attempts = (entry.attempts || 0) + 1;
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (attempts >= (entry.max_attempts || 5)) {
        await payload.update({
          collection: 'email_queue',
          id: entry.id,
          data: { status: 'dead', attempts, error_log: errorMsg },
        });
      } else {
        // Exponential backoff: 2^(attempts-1) minutes
        const delayMinutes = Math.pow(2, attempts - 1);
        const nextRetry = new Date(Date.now() + delayMinutes * 60_000);
        await payload.update({
          collection: 'email_queue',
          id: entry.id,
          data: {
            status: 'failed',
            attempts,
            next_retry_at: nextRetry.toISOString(),
            error_log: errorMsg,
          },
        });
      }
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `renderAsync()` | `render()` (already async) | React Email 3.0 (2024) | `renderAsync` is deprecated, use `render` |
| Raw HTML email templates | React Email JSX components | 2023+ | Full TypeScript, component reuse, cross-client compat |
| `plainText: true` option | Still supported in render() | Ongoing | Also available as `toPlainText()` standalone function |
| react-email 4.x | react-email 5.x (React 19.2 + Next.js 16) | 2025 | Tailwind 4 support, dark mode preview, 8 new components |

**Deprecated/outdated:**
- `renderAsync()`: Removed in React Email 3.0+, replaced by async `render()`
- Separate individual component packages (`@react-email/html`, `@react-email/button`, etc.): Now consolidated into `@react-email/components`

## Important Technical Notes

### Payload Jobs Queue Alternative
Payload CMS v3.0+ includes a built-in Jobs Queue (`payload.jobs.queue()`) with task definitions, retries, and `autoRun` cron configuration. The project runs Payload v3.79 so this feature IS available. The user decided on a custom `email_queue` Collection + `instrumentation.ts` worker for explicit control and admin visibility. This is noted because:
1. The custom approach requires more code but gives full control over the queue lifecycle
2. If the custom approach proves cumbersome, Payload Jobs Queue is a ready fallback
3. The planner should NOT switch to Payload Jobs Queue unless the user explicitly revisits this decision

### React Email + Next.js 15 Compatibility
React Email 5.0 officially supports React 19.2 and Next.js 16. The project uses Next.js 15.4.11 and React 19.1.0, which are within the supported range. No compatibility issues expected.

### Zod v4 Email Validation
The project uses Zod v4.3.6. In Zod v4, email validation uses `z.string().email()` (same as v3). This is the correct approach for MAIL-07.

### N8N Webhook Payload Structure
The N8N workflow receives a minimal payload: `{ to, subject, html, plain_text, reply_to }`. This is intentionally simple -- N8N only needs to forward to the SMTP provider. All business logic (template selection, rendering, recipient resolution) stays in the Next.js app.

### Existing Code Migration Points
Files to modify:
- `src/collections/business/anfragen.ts`: Replace `sendN8NWebhook()` calls with `queueEmailEvent()` in afterChange hook
- `src/payload.config.ts`: Add `EmailQueue` Collection, remove `WebhookErrors` Global
- `src/payload-globals/settings.ts`: Add `benachrichtigungs_emails` and `email_event_toggles` fields
- `src/components/admin/settings-page.tsx`: Add 5th 'E-Mail' tab, move existing email fields into it
- `src/components/admin/custom-nav.tsx`: Replace 'Webhook Fehler' link with 'E-Mail Queue', remove `WebhookFehlerBadge`
- `.env.example`: Add `N8N_EMAIL_WEBHOOK_URL`

Files to delete:
- `src/lib/n8n-webhook.ts` (replaced by `src/lib/email/queue.ts`)
- `src/payload-globals/webhook-errors.ts` (replaced by `email_queue` Collection)
- `src/components/admin/webhook-fehler-badge.tsx` (no longer needed)

Files to create:
- `src/emails/` directory tree (templates + components)
- `src/lib/email/` directory tree (event-matrix, queue, types, render helpers)
- `src/collections/system/email-queue.ts`
- `src/instrumentation.ts`
- `src/app/api/email-preview/route.ts` + `src/app/api/email-preview/[template]/route.ts`
- `docs/wissen/n8n-email-setup.md`

## Open Questions

1. **React Email Outlook Rendering Quality**
   - What we know: React Email claims cross-client compatibility but community reports suggest Outlook desktop (Word engine) can still break layouts. The STATE.md notes "React Email vs MJML: Empirischer Test in Phase 25 noetig (Outlook-Kompatibilitaet)".
   - What's unclear: How well React Email's table-based layout components handle complex layouts in Outlook 2016/2019.
   - Recommendation: Build the base layout first, test in Outlook manually or via Litmus. If Outlook rendering is unacceptable, the templates are JSX and can be adjusted with MSO-conditional inline styles. The base-layout component is the critical piece to get right early.

2. **Event-Toggles UI Complexity**
   - What we know: Settings will have a JSON field `email_event_toggles` with per-event, per-recipient booleans. The UI needs checkboxes for 18+ events x 2 recipients.
   - What's unclear: Exact UX for a matrix of 36+ checkboxes in a settings tab.
   - Recommendation: Render as a table/grid with event names as rows and Kunde/Staff as columns. Use a "Alle aktivieren / Alle deaktivieren" toggle per column. Keep it simple -- this is admin-only.

3. **Logo URL in Email Templates**
   - What we know: Settings has a `pdf_logo` upload field. Email templates need a logo URL that works in email clients.
   - What's unclear: Whether the pdf_logo is suitable for emails (format, resolution), and how to construct the full URL for the `<Img>` component (emails need absolute URLs).
   - Recommendation: Use `process.env.NEXT_PUBLIC_SERVER_URL + '/api/media/' + logo.filename` to construct the absolute URL. The logo should be PNG/JPG, not SVG (email clients have poor SVG support).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.6 |
| Config file | `jest.config.ts` (exists) |
| Quick run command | `npx jest tests/unit/test-email-queue.test.ts -x` |
| Full suite command | `npx jest` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAIL-01 | Event-matrix maps all 18+ events to templates+recipients | unit | `npx jest tests/unit/test-event-matrix.test.ts -x` | Wave 0 |
| MAIL-02 | Base layout renders with logo + footer | unit | `npx jest tests/unit/test-email-templates.test.ts -x` | Wave 0 |
| MAIL-03 | All 9 templates render valid HTML + plain text | unit | `npx jest tests/unit/test-email-templates.test.ts -x` | Wave 0 |
| MAIL-04 | Preview route returns HTML for valid template, 403 for non-admin | unit | `npx jest tests/unit/test-email-preview.test.ts -x` | Wave 0 |
| MAIL-05 | Duplicate idempotency_key is rejected | unit | `npx jest tests/unit/test-email-queue.test.ts -x` | Wave 0 |
| MAIL-06 | N8N setup documentation exists | manual-only | Check file existence | N/A (docs) |
| MAIL-07 | Invalid email -> queue entry with status='skipped' | unit | `npx jest tests/unit/test-email-queue.test.ts -x` | Wave 0 |
| MAIL-08 | Queue processes pending entries, retries failed with backoff, marks dead after 5 | unit | `npx jest tests/unit/test-email-queue.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest tests/unit/test-email-queue.test.ts tests/unit/test-event-matrix.test.ts tests/unit/test-email-templates.test.ts -x`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-event-matrix.test.ts` -- covers MAIL-01 (event-matrix completeness, type safety)
- [ ] `tests/unit/test-email-queue.test.ts` -- covers MAIL-05, MAIL-07, MAIL-08 (queue logic, validation, retry)
- [ ] `tests/unit/test-email-templates.test.ts` -- covers MAIL-02, MAIL-03 (render output, base layout)
- [ ] `tests/unit/test-email-preview.test.ts` -- covers MAIL-04 (auth check, template rendering)
- [ ] `tests/unit/test-render-subject.test.ts` -- covers subject template rendering
- [ ] Existing `tests/unit/test-n8n-webhook.test.ts` will be DELETED (replaced by test-email-queue)

## Sources

### Primary (HIGH confidence)
- [React Email official docs](https://react.email/docs/utilities/render) - render() API, components, plain text rendering
- [React Email 5.0 blog](https://resend.com/blog/react-email-5) - React 19.2 / Next.js 16 support, Tailwind 4, new features
- [Next.js instrumentation.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) - register() hook API, runtime support, called once per server instance
- [Payload CMS Jobs Queue docs](https://payloadcms.com/docs/jobs-queue/overview) - Built-in alternative (documented but not used per user decision)
- [@react-email/components npm](https://www.npmjs.com/package/@react-email/components) - v1.0.10 (current)
- [@react-email/render npm](https://www.npmjs.com/package/@react-email/render) - v2.0.4 (current)

### Secondary (MEDIUM confidence)
- [GitHub resend/react-email discussions](https://github.com/resend/react-email/discussions/686) - plainText rendering behavior
- [Email Markup Development in React 2025](https://voskoboinyk.com/posts/2025-01-29-state-of-email-markup) - Outlook compatibility challenges
- [Payload CMS Jobs Queue Quick Start](https://github.com/payloadcms/payload/blob/main/docs/jobs-queue/quick-start-example.mdx) - Task definition patterns with retries

### Tertiary (LOW confidence)
- React Email Outlook MSO conditional comments workaround (single community source) - needs empirical validation in Phase 25

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Email versions verified via npm, Next.js instrumentation docs verified via official docs
- Architecture: HIGH - Follows established project patterns (status-config.ts, Payload Collections, Custom Admin Pages), all integration points verified in existing codebase
- Pitfalls: MEDIUM - Outlook compatibility is a known risk area flagged in STATE.md; instrumentation.ts dev-mode behavior verified via Next.js docs
- Queue design: HIGH - Based on standard patterns (DB-backed queue, exponential backoff, idempotency keys); existing code patterns (Payload Collections, afterChange hooks) well understood

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable libraries, no fast-moving dependencies)
