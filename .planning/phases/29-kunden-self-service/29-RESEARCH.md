# Phase 29: Kunden Self-Service - Research

**Researched:** 2026-04-02
**Domain:** Payload CMS customer-facing features, status system extension, file uploads, password reset
**Confidence:** HIGH

## Summary

Phase 29 adds four customer self-service features to the existing Christ Fensterhandel system: (1) reply to admin questions on Anfragen, (2) request cancellation, (3) submit complaints with photos, and (4) reset password. The project already has robust patterns for all four features -- the status system (`status-config.ts`, `status-transitions.ts`) is well-structured with 22 statuses and all required maps; the email system (event-matrix with queue) already has a `kundenantwort` slot pre-defined; the guest route pattern from Phase 28 (`/angebot/[anfrageId]`) provides a blueprint; and Payload's built-in `auth: true` on the Users collection provides forgot-password/reset-password API endpoints.

The primary technical challenge is the breadth of integration points: 2 new statuses must be added consistently to 10+ maps/arrays, a new `reklamationen` Collection must be created and registered, the StatusBanner needs to become interactive (expand to show forms), 4 new API routes must be built, 3 new Next.js pages created, and the StatusHistorie collection must be extended with an `anhaenge` field. All patterns are established -- this is integration work, not greenfield.

**Primary recommendation:** Split the work into 4 logical waves: (1) status system + transition foundation, (2) Rueckfrage-Antwort (KUND-01), (3) Stornierung + Reklamation (KUND-02/03), (4) Passwort-Reset (KUND-04). Each wave builds on established patterns and can be verified independently.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Rueckfrage-Antwort (KUND-01)
- Inline im bestehenden orange Rueckfrage-Banner (StatusBanner Component erweitern)
- "Jetzt antworten" Button klappt Formular-Bereich auf (toggle, kein Modal)
- Formular: Textarea (Pflicht, min 10 Zeichen) + optionaler Datei-Upload (max 3 Dateien, Bilder/PDF, max 10MB pro Datei)
- Nur sichtbar bei Status `rueckfrage`
- Gast-Route `/rueckfrage/[anfrageId]` (UUID-basiert, Rate Limited 5/min pro IP)
- Zeigt: Anfrage-Nummer, letzte Rueckfrage-Nachricht des Admin aus StatusHistorie, Antwort-Formular
- Neuer Status `kundenantwort` als 21. Status, Attention-Score 3, Kunden-Phase "Anfrage"
- Kundenantwort als StatusHistorie-Eintrag mit optionalem `anhaenge` Feld
- E-Mail an Staff via `kundenantwort` Event (Slot bereits vordefiniert in event-matrix.ts)
- Formular verschwindet nach Absenden (einmalige Antwort pro Rueckfrage-Zyklus)
- Transitions: `kundenantwort` -> `in_bearbeitung`, `kundenantwort` -> `rueckfrage`
- Splitbutton: Primary "Zurueck zur Bearbeitung", Chevron "Erneut Rueckfrage senden"

#### Stornierungsanfrage (KUND-02)
- Dezenter "Stornierung beantragen" Link am Seitenende der Anfrage-Detail-View
- Confirm-Dialog mit Begruendung Textarea (Pflicht, min 10 Zeichen) + Hinweistext
- Nur fuer eingeloggte Kunden (keine Gast-Route)
- Sichtbar bei ALLEN Status AUSSER: storniert, abgelehnt, abgeschlossen, geliefert, rueckerstattung_ausstehend, rueckerstattung_abgeschlossen
- Neuer Status `stornierung_beantragt` als 22. Status, Attention-Score 3
- Begruendung in `stornierung_grund` Feld gespeichert
- Transitions: `stornierung_beantragt` -> `storniert`, `stornierung_beantragt` -> `in_bearbeitung`
- COMMENT_REQUIRED bei `stornierung_beantragt` -> `in_bearbeitung`
- Dashboard zeigt gelbes Banner (orange-50 Styling)
- E-Mail an Staff via neuem `stornierung_beantragt` Event

#### Reklamation (KUND-03)
- Eigene Payload Collection `reklamationen` mit Status offen/in_bearbeitung/geloest
- Fotos: max 5 Dateien, max 10MB pro Datei, Typen: image/jpeg, png, webp, heic + pdf
- Dashboard: "Reklamation melden" Button nur bei Status `geliefert` oder `abgeschlossen`
- Gast-Route: `/reklamation/[anfrageId]` (UUID-basiert, Rate Limited 5/min)
- Auto-Status-Wechsel auf `reklamation` nach Einreichung
- Eigener "Ihre Reklamation" Bereich in Detail-View

#### Passwort-Reset (KUND-04)
- Custom UI Pages: `/kunden/passwort-vergessen` + `/kunden/passwort-reset/[token]`
- Nutzt Payload API Endpoints (POST /api/users/forgot-password, POST /api/users/reset-password)
- E-Mail ueber E-Mail-Queue (NICHT Payload's eingebauten Versand)
- Payload's generateEmailHTML/generateEmailSubject Override in Users Collection Config
- "Falls ein Konto mit dieser E-Mail existiert..." (kein E-Mail-Leak)
- Token-Ablauf: 1 Stunde (Payload Default)
- Rate Limited (5/min pro IP auf forgot-password)
- Login-Seite: "Passwort vergessen?" Link
- Dashboard: "Passwort aendern" im Profil-Bereich (mit altem Passwort)

### Claude's Discretion
- Exakte Tailwind-Klassen und Spacing fuer alle neuen UI-Elemente
- StatusBanner Component-Erweiterung Implementierungsdetails
- Reklamation-Thumbnails Darstellung und Lightbox-Verhalten
- Passwort-Staerke-Anforderungen (min 8 Zeichen etc.)
- Upload-Component Implementierung (Drag&Drop vs. File-Input)
- Error-Handling und Loading-States fuer alle Formulare
- Neue Status-Farben fuer kundenantwort und stornierung_beantragt in STATUS_TAILWIND

### Deferred Ideas (OUT OF SCOPE)
- Chat-aehnliche Mehrfach-Antworten auf Rueckfragen (aktuell einmalig pro Zyklus)
- Kunden-Profil-Seite mit Adresse/Kontakt bearbeiten
- Reklamation-Fotos Lightbox/Gallery im Admin
- Automatische Stornierung nach X Tagen ohne Zahlung
- Gast-Stornierung
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KUND-01 | Kundenantwort auf Rueckfrage (Formular im Dashboard, Nachricht an Anfrage, Admin-Benachrichtigung) | Status system extension pattern (10+ maps), StatusBanner -> interactive expansion, Gast-Route pattern from Phase 28 (/angebot/[anfrageId]), email event-matrix slot already pre-defined, StatusHistorie `anhaenge` field pattern, API route pattern from annehmen route |
| KUND-02 | Stornierungsanfrage durch Kunden (Request-Pattern, Admin muss bestaetigen) | Confirm-Dialog pattern from AngebotAnnahmeButton, stornierung_grund field already exists on Anfrage, new status `stornierung_beantragt` follows same pattern as other status additions, COMMENT_REQUIRED array extension |
| KUND-03 | Reklamation Collection mit Fotos (Status offen/in_bearbeitung/geloest, Zuordnung zu Anfrage) | New Payload Collection pattern, Media Collection for uploads, existing `reklamation` status already in system (just auto-transition to it), Gast-Route pattern reusable from KUND-01 |
| KUND-04 | Passwort-Reset-Flow (vergessen-Link, Token mit Ablauf, E-Mail) | Payload built-in auth endpoints (forgot-password, reset-password), generateEmailHTML override pattern, email queue integration, custom UI pages matching login form pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.x | Auth API (forgot-password, reset-password), Collections, Upload | Already embedded in project, provides auth endpoints out-of-the-box |
| Next.js | 15.x (App Router) | API Routes, Server Components, Dynamic Routes | Project framework |
| React Hook Form | 7.x | Form handling for all customer forms | Already used in LoginForm |
| Zod | 4.x | Schema validation for API routes and forms | Already used in all API routes |
| Tailwind CSS | 3.x | Styling for all customer-facing components | Project styling system |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | latest | Icons (Paperclip, Upload, X, AlertTriangle) | All UI components |
| @react-email/components | latest | Email template for password reset, kundenantwort notification | New email templates |

### No New Dependencies Needed
This phase uses exclusively existing libraries. No new npm installs required.

## Architecture Patterns

### Recommended Project Structure (New Files)
```
src/
├── app/
│   ├── api/kunden/
│   │   ├── antwort/route.ts          # POST: Kundenantwort (auth OR guest-UUID)
│   │   ├── storno/route.ts           # POST: Stornierungsanfrage (auth required)
│   │   └── reklamation/route.ts      # POST: Reklamation einreichen (auth OR guest-UUID)
│   └── (frontend)/
│       ├── rueckfrage/[anfrageId]/page.tsx     # Gast-Route Rueckfrage-Antwort
│       ├── reklamation/[anfrageId]/page.tsx     # Gast-Route Reklamation
│       └── kunden/
│           ├── passwort-vergessen/page.tsx       # Passwort vergessen Formular
│           └── passwort-reset/[token]/page.tsx   # Passwort reset mit Token
├── collections/
│   └── business/reklamationen.ts                # Neue Collection
├── components/kunden/
│   ├── rueckfrage-formular.tsx        # Inline-Antwort im Banner (Client)
│   ├── storno-dialog.tsx              # Stornierung Confirm-Dialog (Client)
│   ├── reklamation-formular.tsx       # Reklamation einreichen (Client)
│   ├── reklamation-anzeige.tsx        # Reklamation Status anzeigen
│   ├── passwort-vergessen-form.tsx    # E-Mail Formular (Client)
│   └── passwort-reset-form.tsx        # Neues Passwort Formular (Client)
├── emails/
│   ├── templates/passwort-reset.tsx   # Passwort-Reset E-Mail
│   └── staff/kundenantwort.tsx        # Staff-Benachrichtigung (oder reuse status-benachrichtigung)
└── lib/
    └── (status-config.ts + status-transitions.ts -- extended, not new)
```

### Pattern 1: Status System Extension (10+ Maps)
**What:** Adding 2 new statuses (`kundenantwort`, `stornierung_beantragt`) requires updating EVERY map in status-config.ts
**When to use:** Every time a new status is added
**Critical -- complete list of maps to update:**

```typescript
// In status-config.ts (ALL of these must get entries for both new statuses):
// 1. StatusKey type union
// 2. STATUS_COLORS record
// 3. STATUS_LABELS record
// 4. STATUS_TAILWIND record
// 5. STATUS_CUSTOMER_TEXT record
// 6. STATUS_CUSTOMER_PHASE record
// 7. STATUS_GROUP record
// 8. EMAIL_TRIGGER_STATUSES array (add kundenantwort, stornierung_beantragt)
// 9. QUICK_ACTIONS record
// 10. STATUS_WEIGHT record
// 11. LIST_TAB_FILTERS record (add to appropriate tabs)

// In status-transitions.ts:
// 12. VALID_TRANSITIONS record (new entries + update rueckfrage transitions)
// 13. COMMENT_REQUIRED array (add stornierung_beantragt -> in_bearbeitung rule)

// In anfragen.ts collection config:
// 14. status field options array (add 2 new options)

// In event-matrix.ts:
// 15. Add stornierung_beantragt event config

// In types.ts:
// 16. EmailEventType union (add stornierung_beantragt)

// In status-banner.tsx (kunden):
// 17. WARNING_STATUSES array (add kundenantwort, stornierung_beantragt)
```

**Verification:** Count test expects "exactly 22 keys" in status-config.test.ts -- must update to 24. Count test for transitions must also update.

### Pattern 2: Interactive StatusBanner (Existing Pattern Extension)
**What:** StatusBanner currently renders static text. Must become a Client Component that accepts callbacks and renders inline forms.
**When to use:** KUND-01 (Rueckfrage-Antwort in banner)
**Key decision:** StatusBanner must get `"use client"` directive OR the form must be a separate Client Component rendered alongside it.

```typescript
// Recommended: Keep StatusBanner as server/shared, add RueckfrageFormular as separate client component
// AnfrageDetail renders both:
<StatusBanner status={anfrage.status} />
{anfrage.status === "rueckfrage" && (
  <RueckfrageFormular anfrageId={anfrage.id} />
)}
```

This matches the existing pattern where `StripePayButton` and `AngebotAnnahmeButton` are separate client components alongside the server-rendered detail view.

### Pattern 3: Gast-Route (Phase 28 Pattern)
**What:** Public page accessible via UUID in URL, no auth required, rate-limited
**When to use:** `/rueckfrage/[anfrageId]` and `/reklamation/[anfrageId]`
**Source:** Verified from existing `src/app/(frontend)/angebot/[anfrageId]/page.tsx`

```typescript
// Server Component pattern:
export default async function GuestPage({ params }: { params: Promise<{ anfrageId: string }> }) {
  const { anfrageId } = await params;
  const payload = await getPayload({ config });

  let anfrage;
  try {
    anfrage = await payload.findByID({
      collection: "anfragen",
      id: anfrageId,
      depth: 1,
    });
  } catch {
    notFound();
  }

  if (!anfrage) notFound();

  // Render form...
}
```

### Pattern 4: API Route with Zod + Rate Limiting (Phase 28 Pattern)
**What:** POST endpoint with Zod validation, inline rate limiting, dynamic Payload import
**When to use:** All 3 new API routes (/api/kunden/antwort, /storno, /reklamation)
**Source:** Verified from `src/app/api/angebot/annehmen/route.ts`

```typescript
// Standard API route pattern:
const schema = z.object({
  anfrageId: z.string().min(1),
  nachricht: z.string().min(10, "Mindestens 10 Zeichen"),
});

export async function POST(request: Request) {
  // 1. Parse + validate body
  // 2. Rate limit (inline checkRateLimit)
  // 3. Dynamic Payload import
  // 4. Load + validate Anfrage (status check)
  // 5. Business logic (create entries, update status)
  // 6. Queue email event
  // 7. Return response
}
```

### Pattern 5: Payload generateEmailHTML Override for Password Reset
**What:** Override Payload's built-in email sending to route through the email queue
**When to use:** KUND-04 password reset
**Key insight:** Payload's `auth: true` generates forgot-password/reset-password endpoints automatically. The built-in email sender must be overridden to use the project's email queue instead.

```typescript
// In Users collection config, add auth object:
auth: {
  forgotPassword: {
    generateEmailHTML: async ({ token, user }) => {
      // Queue email via email queue instead of Payload's built-in
      // Return empty string to prevent Payload from sending its own email
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/kunden/passwort-reset/${token}`;
      // Queue the email event
      await queuePasswordResetEmail(user.email, resetUrl, token);
      return ""; // Empty string prevents Payload's default email
    },
    generateEmailSubject: () => {
      return "Passwort zuruecksetzen | Christ Fensterhandel";
    },
  },
},
```

**IMPORTANT:** Returning empty string from `generateEmailHTML` may still trigger Payload's transport. An alternative approach is to render the custom template HTML and let Payload send it (if the email transport is configured). Research indicates Payload 3.x uses `generateEmailHTML` and `generateEmailSubject` hooks. The safest approach: render the custom template HTML with the reset URL, return it from `generateEmailHTML`, and configure Payload's email transport to use the same SMTP/provider. However, per CONTEXT.md decision, the email MUST go through the E-Mail-Queue (Phase 25 system). This means the override must queue the email AND return empty/null to suppress Payload's own sending. Validation needed during implementation.

### Pattern 6: File Upload in API Routes
**What:** Handle multipart file uploads for Rueckfrage-Antwort and Reklamation
**When to use:** KUND-01 (max 3 files), KUND-03 (max 5 files)
**Approach:** Use Payload Media Collection for storage. Upload files first via Payload API, then reference the media IDs.

```typescript
// Client-side: FormData with files
const formData = new FormData();
formData.append("nachricht", text);
files.forEach(f => formData.append("dateien", f));

// Server-side API route:
export async function POST(request: Request) {
  const formData = await request.formData();
  const nachricht = formData.get("nachricht") as string;
  const dateien = formData.getAll("dateien") as File[];

  // Upload each file to Media collection
  const mediaIds: string[] = [];
  for (const datei of dateien) {
    const buffer = Buffer.from(await datei.arrayBuffer());
    const media = await payload.create({
      collection: "media",
      data: { alt: `Anhang zu Anfrage ${anfrageId}` },
      file: { data: buffer, mimetype: datei.type, name: datei.name, size: datei.size },
    });
    mediaIds.push(media.id);
  }
}
```

**Media Collection access concern:** Currently `create: isAdmin` on Media. This must be relaxed for customer uploads. Options:
1. Create a separate `kunden_uploads` collection with customer-level create access
2. Modify Media access to allow authenticated customers to create
3. Use the API route's server-side context (bypass access) to create media entries

**Recommendation:** Create uploads through the API route using `payload.create()` which bypasses access control (Local API). The API route itself handles auth/rate-limiting. No Media collection access changes needed.

### Anti-Patterns to Avoid
- **Adding status to some maps but not all:** The system has 10+ maps that must stay in sync. Missing entries cause runtime errors (undefined keys).
- **Using Modals for customer forms:** CONTEXT.md explicitly says toggle/inline, not Modal. Follow the AngebotAnnahmeButton pattern.
- **Direct status change on stornierung:** MUST use request pattern (stornierung_beantragt -> admin confirms). Never auto-stornieren.
- **Payload's built-in email for password reset:** MUST route through email queue for consistent branding and tracking.
- **Allowing stornierung from terminal statuses:** The excluded statuses list in CONTEXT.md is explicit -- do not show for storniert, abgelehnt, abgeschlossen, geliefert, rueckerstattung_ausstehend, rueckerstattung_abgeschlossen.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File validation (type, size) | Custom MIME detection | Zod + File API (type, size props) | Browser File API already provides type/size; server validates with Payload |
| Rate limiting | New limiter | `checkRateLimit()` from `@/lib/rate-limit.ts` | Already battle-tested, used in 4+ routes |
| Email sending | Direct SMTP | `queueEmailEvent()` from `@/lib/email/queue.ts` | Retry, idempotency, queue, consistent branding |
| Password reset tokens | Custom tokens | Payload's built-in `auth.forgotPassword` | Payload handles token generation, expiry, validation |
| Status transition validation | Custom checks | `isValidTransition()` from `@/lib/status-transitions.ts` | Already enforced in beforeChange hook |
| UUID-based auth for guest routes | Custom token system | Payload ID (UUID) as auth | Phase 28 pattern, UUID is unpredictable enough for guest access |

**Key insight:** Every infrastructure component needed for Phase 29 already exists. This phase is about wiring existing systems together with new UI and business logic.

## Common Pitfalls

### Pitfall 1: Incomplete Status Map Updates
**What goes wrong:** Adding a new status to StatusKey type but forgetting one of the 10+ maps/arrays/records
**Why it happens:** Many maps are in different files, easy to miss one
**How to avoid:** Use a checklist of ALL 17 integration points listed in Pattern 1. Run existing tests -- `test-status-config.test.ts` will fail with "expected 22 keys, got X" if maps are incomplete.
**Warning signs:** TypeScript errors about missing properties, runtime "undefined" for status labels/colors

### Pitfall 2: StatusHistorie Access Control Blocks Customer Writes
**What goes wrong:** StatusHistorie has `create: isAdminOrMitarbeiter` access. Kundenantwort needs to create entries.
**Why it happens:** StatusHistorie was designed for admin-only writes (status changes happen in beforeChange hooks with admin context)
**How to avoid:** Customer API routes should create StatusHistorie entries via Payload Local API (bypasses access control), similar to how the Anfragen beforeChange hook already does it (`req.payload.create()`). Do NOT change StatusHistorie access control.
**Warning signs:** 403 errors when customers submit responses

### Pitfall 3: Transition Graph Must Be Updated Bidirectionally
**What goes wrong:** Adding `kundenantwort` transitions but forgetting to update `rueckfrage` transitions
**Why it happens:** `rueckfrage` currently only allows `-> in_bearbeitung`. Must now also allow `-> kundenantwort` (customer answers).
**How to avoid:** When adding a new status, check BOTH directions: what transitions TO the new status AND what transitions FROM the new status. For this phase:
- `rueckfrage` transitions: ADD `kundenantwort` (customer answers)
- `kundenantwort` transitions: `in_bearbeitung`, `rueckfrage` (admin handles)
- ALL statuses (except excluded list) must transition to `stornierung_beantragt` (customer requests cancel)
- `stornierung_beantragt` transitions: `storniert`, `in_bearbeitung` (admin decides)
**Warning signs:** "Ungultiger Statusubergang" errors

### Pitfall 4: Stornierung Transition Complexity
**What goes wrong:** `stornierung_beantragt` must be reachable from MANY statuses (all except terminal/excluded). This means updating VALID_TRANSITIONS for ~15 statuses.
**Why it happens:** Unlike other statuses that have 1-3 source statuses, stornierung is a cross-cutting concern
**How to avoid:** Systematically iterate ALL statuses, check the excluded list, add `stornierung_beantragt` to each allowed source.
**Warning signs:** Customer clicks "Stornierung beantragen" but gets transition error for certain statuses

### Pitfall 5: File Upload Size/Type Validation on Both Client and Server
**What goes wrong:** Client validates, server doesn't (or vice versa), allowing oversized/wrong-type files
**Why it happens:** Validation logic duplicated between client form and API route
**How to avoid:** Define constants (`MAX_FILE_SIZE = 10 * 1024 * 1024`, `ALLOWED_TYPES = [...]`) in a shared module. Validate on client for UX, validate on server for security.
**Warning signs:** Large file uploads succeeding when they shouldn't, or cryptic server errors

### Pitfall 6: Password Reset Email Must Go Through Queue, Not Payload Transport
**What goes wrong:** Payload's built-in auth sends the reset email through its own transport (nodemailer), bypassing the project's email queue
**Why it happens:** `generateEmailHTML` returns HTML that Payload then sends. Returning empty string may not suppress sending in all Payload versions.
**How to avoid:** Two-pronged approach: (1) Override `generateEmailHTML` to queue the email, (2) Either configure Payload's email transport to a null/no-op transport, OR accept that Payload may send a plain email and the queued email is the "real" one. Test this interaction carefully.
**Warning signs:** Customer receives two reset emails, or no reset email at all

### Pitfall 7: Test Expectations Hardcoded to Current Status Count
**What goes wrong:** Tests in `test-status-config.test.ts` assert exact counts: "has exactly 22 keys", "has exactly 15 entries". Adding 2 statuses breaks ALL these tests.
**Why it happens:** Tests are properly strict about exhaustiveness
**How to avoid:** Update ALL count assertions in test files when adding new statuses. Search for `22` and `15` in test files.
**Warning signs:** Test suite fails with "expected 22, got 24"

## Code Examples

### StatusKey Extension (2 new statuses)
```typescript
// Source: Existing src/lib/status-config.ts pattern
export type StatusKey =
  | "neu"
  // ... existing 22 statuses ...
  | "kundenantwort"       // NEW: Kunde hat auf Rueckfrage geantwortet
  | "stornierung_beantragt"; // NEW: Kunde hat Stornierung beantragt
```

### VALID_TRANSITIONS Extension (Critical: bidirectional)
```typescript
// Source: Existing src/lib/status-transitions.ts pattern
export const VALID_TRANSITIONS: Record<string, string[]> = {
  // ... existing transitions ...

  // UPDATE existing: rueckfrage now allows -> kundenantwort
  rueckfrage: ["in_bearbeitung", "kundenantwort"],

  // NEW: kundenantwort transitions (admin handles)
  kundenantwort: ["in_bearbeitung", "rueckfrage"],

  // NEW: stornierung_beantragt transitions (admin confirms/rejects)
  stornierung_beantragt: ["storniert", "in_bearbeitung"],

  // UPDATE existing: all non-excluded statuses must allow -> stornierung_beantragt
  // Add "stornierung_beantragt" to: neu, in_bearbeitung, angebot_versendet,
  // bestaetigt, zahlungslink_versendet, bezahlt, an_hersteller,
  // hersteller_bestaetigt, hersteller_bestaetigt_mit_vorbehalt,
  // in_produktion, hersteller_problem, versandbereit, rueckfrage,
  // wieder_geoeffnet, zahlungsproblem, kundenantwort, reklamation
};
```

### Reklamationen Collection Config
```typescript
// Source: Established Collection pattern from src/collections/business/anfragen.ts
import type { CollectionConfig } from "payload";

export const Reklamationen: CollectionConfig = {
  slug: "reklamationen",
  labels: { singular: "Reklamation", plural: "Reklamationen" },
  admin: {
    group: "Business",
    useAsTitle: "id",
    defaultColumns: ["anfrage", "status", "createdAt"],
  },
  access: {
    create: () => true, // API route handles auth
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.rolle === "admin" || req.user.rolle === "mitarbeiter") return true;
      // Kunden: only their own (via anfrage ownership check in API)
      return false; // Handled via API route, not direct collection access
    },
    update: ({ req }) => req.user?.rolle === "admin" || req.user?.rolle === "mitarbeiter",
    delete: ({ req }) => req.user?.rolle === "admin",
  },
  fields: [
    { name: "anfrage", type: "relationship", relationTo: "anfragen", required: true },
    { name: "beschreibung", type: "textarea", required: true },
    { name: "fotos", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "status",
      type: "select",
      defaultValue: "offen",
      options: [
        { label: "Offen", value: "offen" },
        { label: "In Bearbeitung", value: "in_bearbeitung" },
        { label: "Geloest", value: "geloest" },
      ],
    },
    { name: "loesung", type: "textarea", label: "Loesung/Massnahme" },
    { name: "erstellt_von", type: "relationship", relationTo: "users" },
  ],
};
```

### Payload Password Reset Override
```typescript
// Source: Payload CMS auth configuration pattern
// In Users collection config, change auth: true to:
auth: {
  forgotPassword: {
    generateEmailHTML: async ({ token, user }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/kunden/passwort-reset/${token}`;

      // Queue email through project's email system
      // Dynamic import to avoid initialization issues
      const { queuePasswordResetEmail } = await import("@/lib/email/password-reset");
      await queuePasswordResetEmail(user.email as string, resetUrl);

      // Return empty string -- email is sent via queue, not Payload transport
      return "";
    },
    generateEmailSubject: () => {
      return "Passwort zuruecksetzen | Christ Fensterhandel";
    },
  },
},
```

### Customer Answer API Route Structure
```typescript
// Source: Established pattern from src/app/api/angebot/annehmen/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const antwortSchema = z.object({
  anfrageId: z.string().min(1),
  nachricht: z.string().min(10, "Mindestens 10 Zeichen erforderlich"),
});

export async function POST(request: Request) {
  try {
    // FormData for file uploads
    const formData = await request.formData();
    const anfrageId = formData.get("anfrageId") as string;
    const nachricht = formData.get("nachricht") as string;
    const dateien = formData.getAll("dateien") as File[];

    // Validate text fields
    const parsed = antwortSchema.safeParse({ anfrageId, nachricht });
    if (!parsed.success) { /* return 400 */ }

    // Validate files
    if (dateien.length > 3) { /* return 400: max 3 files */ }
    for (const d of dateien) {
      if (d.size > 10 * 1024 * 1024) { /* return 400: max 10MB */ }
      if (!ALLOWED_TYPES.includes(d.type)) { /* return 400: invalid type */ }
    }

    // Rate limit
    const { checkRateLimit } = await import("@/lib/rate-limit");
    // ...

    // Dynamic Payload import
    const { getPayload } = await import("payload");
    const payloadConfig = (await import("@payload-config")).default;
    const payload = await getPayload({ config: payloadConfig });

    // Load anfrage, validate status === "rueckfrage"
    // Upload files to Media collection
    // Create StatusHistorie entry with anhaenge
    // Update anfrage status to "kundenantwort"
    // Queue email event

    return NextResponse.json({ success: true });
  } catch { /* 500 */ }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static StatusBanner | Interactive StatusBanner with inline forms | Phase 29 | StatusBanner becomes expandable for rueckfrage answers |
| 22 statuses | 24 statuses | Phase 29 | kundenantwort + stornierung_beantragt added |
| StatusHistorie text-only | StatusHistorie with optional file attachments | Phase 29 | anhaenge field on StatusHistorie collection |
| No customer self-service | Full self-service (answer, cancel, complain, reset) | Phase 29 | Customers become active participants |

**Important state observations from codebase:**
- `kundenantwort` event is ALREADY pre-defined in `event-matrix.ts` (line 202-207) with staff-only recipient and `status-benachrichtigung` template. Just needs the actual template content updated for kundenantwort-specific information.
- `reklamation` status ALREADY exists in the status system (one of the 22). The auto-transition to it from Reklamation submission is straightforward.
- `stornierung_grund` field ALREADY exists on Anfragen collection (line 671-679). Ready for customer use.
- Media collection has `upload: true` with `create: isAdmin` -- customer uploads go through API routes using Local API (bypasses access).
- StatusHistorie has `create: isAdminOrMitarbeiter` access -- customer submissions create entries through API routes using Local API (bypasses access).

## Open Questions

1. **Payload generateEmailHTML return value behavior**
   - What we know: Payload 3.x calls `generateEmailHTML` and uses its return value as the email body, then sends via its configured transport
   - What's unclear: Whether returning empty string/null actually suppresses Payload's email sending, or just sends an empty email
   - Recommendation: Test empirically during implementation. If Payload still sends an empty email, either: (a) configure Payload's email transport to a no-op, or (b) return the rendered HTML and let Payload send it (skipping the queue for this one event type). The queue approach is preferred per CONTEXT.md but may need pragmatic adjustment.

2. **stornierung_beantragt transitions breadth**
   - What we know: Per CONTEXT.md, stornierung is available from ALL statuses except 6 excluded ones. That's ~16 source statuses.
   - What's unclear: Should transitions be added to ALL 16 at once, or only to the customer-accessible ones? Backend enforcement vs. UI visibility may differ.
   - Recommendation: Add `stornierung_beantragt` to all non-excluded statuses in VALID_TRANSITIONS (comprehensive). The UI button visibility check handles which statuses actually show the option. This is safer for edge cases.

3. **StatusHistorie anhaenge field type**
   - What we know: Need to add upload attachments to StatusHistorie entries
   - What's unclear: Whether to use `type: "upload", relationTo: "media", hasMany: true` or `type: "array"` with upload fields inside
   - Recommendation: Use `type: "upload", relationTo: "media", hasMany: true` -- simpler, consistent with how Reklamation fotos work, and Payload handles the relationship automatically.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | `jest.config.ts` |
| Quick run command | `npm test -- --testPathPattern=test-name -x` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KUND-01 | Status `kundenantwort` in all maps (24 keys) | unit | `npm test -- --testPathPattern=test-status-config -x` | Exists (update counts) |
| KUND-01 | Transition rueckfrage -> kundenantwort valid | unit | `npm test -- --testPathPattern=test-status-transitions -x` | Exists (add cases) |
| KUND-01 | Kundenantwort API validates input | unit | `npm test -- --testPathPattern=test-kundenantwort -x` | Wave 0 |
| KUND-02 | Status `stornierung_beantragt` in all maps | unit | `npm test -- --testPathPattern=test-status-config -x` | Exists (update counts) |
| KUND-02 | Stornierung excluded statuses not showing | unit | `npm test -- --testPathPattern=test-storno -x` | Wave 0 |
| KUND-02 | COMMENT_REQUIRED for stornierung_beantragt -> in_bearbeitung | unit | `npm test -- --testPathPattern=test-status-transitions -x` | Exists (add case) |
| KUND-03 | Reklamation collection fields correct | unit | `npm test -- --testPathPattern=test-reklamation -x` | Wave 0 |
| KUND-04 | Password reset schema validation | unit | `npm test -- --testPathPattern=test-passwort-reset -x` | Wave 0 |
| ALL | Event matrix has new events | unit | `npm test -- --testPathPattern=test-event-matrix -x` | Exists (update) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<relevant-test> -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/test-kundenantwort.test.ts` -- covers KUND-01 API validation
- [ ] `tests/unit/test-storno.test.ts` -- covers KUND-02 excluded statuses logic
- [ ] `tests/unit/test-reklamation.test.ts` -- covers KUND-03 collection fields
- [ ] `tests/unit/test-passwort-reset.test.ts` -- covers KUND-04 schema validation
- [ ] Update `tests/unit/test-status-config.test.ts` -- change count from 22 to 24
- [ ] Update `tests/unit/test-status-transitions.test.ts` -- add new transition cases
- [ ] Update `tests/unit/test-event-matrix.test.ts` -- add stornierung_beantragt event

## Sources

### Primary (HIGH confidence)
- Project source code: `src/lib/status-config.ts`, `src/lib/status-transitions.ts`, `src/lib/email/event-matrix.ts`, `src/lib/email/types.ts`, `src/lib/email/queue.ts`, `src/lib/email/render-email.ts` -- all directly read and analyzed
- Project source code: `src/collections/business/anfragen.ts`, `src/collections/business/status-historie.ts`, `src/collections/system/users.ts`, `src/collections/system/media.ts` -- Collection configs verified
- Project source code: `src/components/kunden/anfrage-detail.tsx`, `src/components/kunden/status-banner.tsx`, `src/components/kunden/angebots-annahme.tsx` -- UI patterns verified
- Project source code: `src/app/(frontend)/angebot/[anfrageId]/page.tsx` -- Gast-Route pattern verified
- Project source code: `src/app/api/angebot/annehmen/route.ts` -- API route pattern verified
- Project source code: `src/components/admin/splitbutton.tsx` -- Admin action pattern verified
- `payload-types.ts` -- Confirms `resetPasswordToken` and `resetPasswordExpiration` fields exist on Users (Payload auth built-in)

### Secondary (MEDIUM confidence)
- Payload CMS auth configuration: `generateEmailHTML` and `generateEmailSubject` hooks confirmed by payload-types.ts field presence. Exact suppression behavior (returning empty string) needs empirical validation during implementation.

### Tertiary (LOW confidence)
- None. All findings verified from source code.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns established in codebase
- Architecture: HIGH -- every pattern is a direct extension of existing code (verified by reading source)
- Pitfalls: HIGH -- identified from actual code analysis (access control patterns, test count assertions, transition graph structure)
- Password reset email routing: MEDIUM -- generateEmailHTML suppression behavior unverified empirically

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable -- all patterns are internal to the project, no external dependencies changing)
