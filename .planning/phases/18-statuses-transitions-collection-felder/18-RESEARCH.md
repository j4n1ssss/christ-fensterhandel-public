# Phase 18: Statuses, Transitions und Collection-Felder - Research

**Researched:** 2026-03-25
**Domain:** Payload CMS 3.79 -- PostgreSQL enum extension, status-config expansion, collection field additions, webhook payload enrichment
**Confidence:** HIGH (all integration points verified against installed codebase, existing patterns confirmed)

## Summary

Phase 18 extends the existing 7-status Anfragen system to 20 statuses with a full order lifecycle from `neu` to `abgeschlossen`, including branching paths for `rueckfrage`, `storniert`, `hersteller_problem`, `reklamation`, and `wieder_geoeffnet`. The work is purely data-model and server-side: expanding `status-config.ts` (flat maps), `status-transitions.ts` (valid transitions + comment requirements), `anfragen.ts` (select field options + new collection fields + hook extensions), and `n8n-webhook.ts` (enriched WebhookPayload). No UI component changes are in scope -- this phase builds the foundation that Phases 19-21 consume.

The primary risk is PostgreSQL enum handling. The project uses `push: true` mode (Drizzle auto-push), which handles enum additions automatically in development. However, for production deployment, a proper migration will be needed. The phase should verify that `push: true` successfully applies the 13 new enum values on next `dev` startup, and document the production migration strategy.

**Primary recommendation:** Extend status-config.ts first (all 20 entries in every flat map), then status-transitions.ts, then anfragen.ts fields + select options, then hook modifications, then webhook payload. Run `npm run dev` after adding the select field options to verify PostgreSQL enum push succeeds. Run existing tests after each file change to catch regressions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **V1-Scope: Alle 20 Statuse** -- Kein V2-Deferral, ALLE Statuse kommen rein, einmal vollstaendig
- **20 Status-Keys, snake_case ohne Umlaute:**
  - Haupt-Flow (12): neu, in_bearbeitung, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, an_hersteller, hersteller_bestaetigt, in_produktion, versandbereit, geliefert, abgeschlossen
  - Abzweigungen (8): rueckfrage, abgelehnt, storniert, hersteller_problem, hersteller_bestaetigt_mit_vorbehalt, zahlungsproblem, wieder_geoeffnet, reklamation
- **Linearer Hauptflow:** neu -> in_bearbeitung -> angebot_versendet -> bestaetigt -> zahlungslink_versendet -> bezahlt -> an_hersteller -> hersteller_bestaetigt -> in_produktion -> versandbereit -> geliefert -> abgeschlossen
- **Abzweigungen (from CONTEXT.md):**
  - in_bearbeitung -> rueckfrage -> in_bearbeitung
  - in_bearbeitung -> abgelehnt -> neu
  - bezahlt -> storniert (Endstatus)
  - an_hersteller -> hersteller_problem
  - hersteller_bestaetigt -> hersteller_bestaetigt_mit_vorbehalt
  - bezahlt -> zahlungsproblem
  - abgeschlossen -> wieder_geoeffnet -> in_bearbeitung
  - geliefert -> reklamation -> in_bearbeitung ODER abgeschlossen
- **6 Kommentar-Pflicht Uebergaenge:** rueckfrage, abgelehnt, storniert, hersteller_problem, reklamation, wieder_geoeffnet
- **stornierung_grund ersetzt den Status-Kommentar** (kein doppeltes Eingabefeld)
- **rueckerstattung_betrag ist Pflicht NUR wenn vorher bezahlt** (conditional required)
- **Hersteller-Felder ab Status bezahlt sichtbar** (nicht erst ab an_hersteller -- Admin kann vorbereiten)
- **Stornierung-Felder nur bei Status storniert sichtbar**
- **last_status_change_at als readOnly-Feld** im Admin-Formular
- **customer_facing: true (14 Statuse):** neu, rueckfrage, angebot_versendet, bestaetigt, zahlungslink_versendet, bezahlt, hersteller_problem, in_produktion, versandbereit, geliefert, abgeschlossen, storniert, zahlungsproblem, reklamation
- **customer_facing: false (6 Statuse):** in_bearbeitung, an_hersteller, hersteller_bestaetigt, hersteller_bestaetigt_mit_vorbehalt, wieder_geoeffnet, abgelehnt
- **WebhookPayload Erweiterung:** customer_facing + kunden_text + kunden_phase direkt mitgeliefert

### Claude's Discretion
- Exakte Transition-Map fuer hersteller_problem und hersteller_bestaetigt_mit_vorbehalt (wohin danach)
- PostgreSQL-Migration-Strategie (push:true in dev vs explicit migration for prod)
- Reihenfolge der Felder im Admin-Formular innerhalb der Collapsible Groups
- Implementation der conditional required Logik fuer Stornierung-Felder
- Kunden-Texte fuer die 13 neuen Statuse (im Stil der bestehenden: warm, Siezen)
- Farb-Zuordnung fuer neue Statuse (Farb-Gruppen aus Todo 017 als Basis)
- STATUS_GROUP Zuordnung fuer die neuen Statuse

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope. Alle Statuse inklusive REKLAMATION, ZAHLUNGSPROBLEM und WIEDER_GEOEFFNET sind V1-Scope.
</user_constraints>

**IMPORTANT NOTE -- REQUIREMENTS.md Conflict:** REQUIREMENTS.md Out of Scope lists `hersteller_bestaetigt_mit_vorbehalt`, `zahlungsproblem`, and `reklamation_notizen` as out of scope for v1.3. However, the CONTEXT.md (gathered 2026-03-25, after REQUIREMENTS.md) explicitly overrides this: "Kein V2-Deferral -- ALLE Statuse kommen rein." The CONTEXT.md is the authoritative user decision for this phase. All 20 statuses are in scope.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-03 | 15+ neue Status-Werte im Anfragen-Collection Select-Feld mit PostgreSQL-Migration | 20 status keys defined in CONTEXT.md; push:true handles dev enum; production migration documented in Pitfalls section |
| STAT-04 | Erweiterte Status-Transitions mit linearem Hauptflow und Abzweigungen | Full transition map documented below with typed VALID_TRANSITIONS extension; COMMENT_REQUIRED expansion to 6 entries |
| STAT-06 | last_status_change_at Feld auf Anfragen-Collection mit automatischem Update via beforeChange Hook | Field definition + hook extension pattern documented; existing hook already handles status change detection |
| FELD-01 | Hersteller-Felder: hersteller_bestellnummer, lieferdatum_erwartet, hersteller_notizen, hersteller_antwort | Collapsible group with admin.condition pattern; access control via isAdminOrMitarbeiter |
| FELD-02 | Stornierung-Felder: stornierung_grund, rueckerstattung_betrag, rueckerstattung_status | Conditional visibility + conditional required validation in beforeChange hook |
| FELD-03 | customer_facing Flag auf WebhookPayload + kunden_text + kunden_phase | isCustomerFacing() helper already exists; WebhookPayload interface extension documented |
</phase_requirements>

## Standard Stack

### Core (no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Payload CMS | 3.79.0 | Collection config, hooks, field definitions | Already installed, embedded in Next.js |
| @payloadcms/db-postgres | 3.79.0 | PostgreSQL adapter with push mode | Already configured with `push: true` |
| TypeScript | 5.7.3 | Type-safe status key unions, Record types | Already installed |

### Supporting (no new dependencies)

This phase requires zero new npm packages. All work is extending existing TypeScript modules and Payload collection config.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flat `Record<string, string[]>` transitions | XState state machine | Overkill -- existing plain-object pattern is a project decision (see STATE.md) |
| `push: true` for enum changes | Explicit migration files | push:true works for dev; migration needed for production but is a deployment concern, not a code concern |
| Separate `validate-status-transition.ts` utility | All logic in beforeChange hook | Extract ONLY if hook exceeds 30 lines (per Pitfall 4) -- monitor during implementation |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended File Change Structure

```
src/
+-- lib/
|   +-- status-config.ts          [MODIFY -- extend StatusKey + all 7 flat maps]
|   +-- status-transitions.ts     [MODIFY -- extend VALID_TRANSITIONS + COMMENT_REQUIRED]
|   +-- n8n-webhook.ts            [MODIFY -- extend WebhookPayload interface]
|
+-- collections/
    +-- business/
        +-- anfragen.ts           [MODIFY -- select options + new fields + hook extensions]
```

4 files modified, 0 new files created.

### Pattern 1: Extending StatusKey Union Type

**What:** Add 13 new string literals to the existing StatusKey union type. All flat maps (STATUS_COLORS, STATUS_LABELS, STATUS_TAILWIND, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE, STATUS_GROUP, EMAIL_TRIGGER_STATUSES) must get entries for all 20 keys. TypeScript's `Record<StatusKey, ...>` guarantees compile-time completeness.

**When to use:** Always -- this is the foundation. Every other change depends on StatusKey being complete.

**Example:**
```typescript
// src/lib/status-config.ts -- extended
export type StatusKey =
  | "neu"
  | "in_bearbeitung"
  | "angebot_versendet"      // NEW
  | "bestaetigt"
  | "zahlungslink_versendet"  // NEW
  | "bezahlt"
  | "an_hersteller"           // NEW
  | "hersteller_bestaetigt"   // NEW
  | "hersteller_bestaetigt_mit_vorbehalt"  // NEW
  | "in_produktion"           // NEW
  | "hersteller_problem"      // NEW
  | "versandbereit"           // NEW
  | "geliefert"               // NEW
  | "abgeschlossen"
  | "rueckfrage"
  | "abgelehnt"
  | "storniert"               // NEW
  | "zahlungsproblem"         // NEW
  | "wieder_geoeffnet"        // NEW
  | "reklamation";            // NEW
```

**Key constraint:** `Record<StatusKey, ...>` enforces that EVERY map has ALL 20 keys. A missing key is a TypeScript compilation error. This is the primary safety net.

### Pattern 2: Collapsible Field Groups with Conditional Visibility

**What:** Payload's `type: "collapsible"` combined with `admin.condition` on individual fields or on the collapsible wrapper.

**When to use:** Hersteller-Felder (visible from `bezahlt` onwards) and Stornierung-Felder (visible only at `storniert`).

**Existing precedent:** `anfragen.ts` already uses `type: "collapsible"` at line 254 for "Technische Konfiguration (JSON)" and `admin.condition` at line 337 for `_status_kommentar`.

**Example:**
```typescript
// Hersteller-Infos collapsible group
{
  type: "collapsible",
  label: "Hersteller-Informationen",
  admin: {
    initCollapsed: true,
    condition: (data) => {
      const herstellerStatuses = [
        "bezahlt", "an_hersteller", "hersteller_bestaetigt",
        "hersteller_bestaetigt_mit_vorbehalt", "in_produktion",
        "hersteller_problem", "versandbereit", "geliefert", "abgeschlossen",
      ];
      return herstellerStatuses.includes(data?.status);
    },
  },
  fields: [
    { name: "hersteller_bestellnummer", type: "text", label: "Hersteller-Bestellnummer" },
    { name: "lieferdatum_erwartet", type: "date", label: "Erwartetes Lieferdatum" },
    { name: "hersteller_notizen", type: "textarea", label: "Hersteller-Notizen" },
    { name: "hersteller_antwort", type: "textarea", label: "Hersteller-Antwort" },
  ],
}
```

**Important:** The `condition` function on a collapsible field hides/shows the entire group. Individual fields inside do NOT need their own condition -- the wrapper handles it.

### Pattern 3: Conditional Required Validation in beforeChange Hook

**What:** Some fields are required only under specific conditions (e.g., `rueckerstattung_betrag` is required only when transitioning to `storniert` AND the Anfrage was previously `bezahlt`).

**When to use:** Stornierung-Felder conditional required logic.

**Implementation approach:** In the beforeChange hook, after validating the transition itself:

```typescript
// Inside beforeChange hook, after transition validation
if (data.status === "storniert") {
  if (!data.stornierung_grund) {
    throw new APIError("Stornierungsgrund ist erforderlich.", 400);
  }
  // Conditional: only require refund fields if previously paid
  const paidStatuses = ["bezahlt", "an_hersteller", "hersteller_bestaetigt",
    "hersteller_bestaetigt_mit_vorbehalt", "in_produktion", "hersteller_problem",
    "versandbereit", "geliefert"];
  if (paidStatuses.includes(originalDoc.status)) {
    if (data.rueckerstattung_betrag === undefined || data.rueckerstattung_betrag === null) {
      throw new APIError("Rückerstattungsbetrag ist erforderlich bei stornierter bezahlter Anfrage.", 400);
    }
    if (!data.rueckerstattung_status) {
      throw new APIError("Rückerstattungsstatus ist erforderlich bei stornierter bezahlter Anfrage.", 400);
    }
  }
}
```

**Design decision:** `stornierung_grund` replaces `_status_kommentar` for the `storniert` transition. When transitioning to `storniert`, the hook should NOT require `_status_kommentar` separately -- `stornierung_grund` IS the comment. The COMMENT_REQUIRED array should include `storniert`, but the hook should check `data.stornierung_grund` instead of `data._status_kommentar` for this specific status.

### Pattern 4: WebhookPayload Enrichment

**What:** Add `customer_facing`, `kunden_text`, and `kunden_phase` to the WebhookPayload interface. Derive these from existing status-config.ts helpers in the afterChange hook.

**Example:**
```typescript
// src/lib/n8n-webhook.ts -- extended interface
export interface WebhookPayload {
  event_type: "neue_anfrage" | "status_aenderung" | "zahlung_eingegangen";
  anfrage_id: string;
  anfrage_nummer: string;
  status: { neu: string; alt?: string };
  kunde: { name: string; email: string };
  gesamtbetrag: number;
  produkt_anzahl: number;
  stripe_checkout_url?: string;
  customer_facing: boolean;         // NEW
  kunden_text: string;              // NEW
  kunden_phase: string | null;      // NEW
}
```

**In afterChange hook:**
```typescript
import { isCustomerFacing, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE } from "@/lib/status-config";

const payload: WebhookPayload = {
  // ... existing fields ...
  customer_facing: isCustomerFacing(doc.status),
  kunden_text: STATUS_CUSTOMER_TEXT[doc.status as StatusKey] ?? "",
  kunden_phase: STATUS_CUSTOMER_PHASE[doc.status as StatusKey] ?? null,
};
```

### Anti-Patterns to Avoid

- **Adding status values to anfragen.ts select options without updating all 7 maps in status-config.ts:** TypeScript will catch this if Record<StatusKey, ...> is used, but only if the StatusKey type is updated first.
- **Merging status-config.ts and status-transitions.ts:** Keep them separate (project decision from STATE.md).
- **Using _status_kommentar for storniert transitions:** Use stornierung_grund instead (CONTEXT.md decision).
- **Storing kunden_phase on the Anfrage document:** Compute it at display/webhook time from status-config.ts (see Pitfall 8 in PITFALLS.md).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Enum migration | Manual SQL ALTER TYPE | `push: true` in dev, `payload generate:migration` for prod | Drizzle handles enum push in dev; migration files for production |
| Conditional field visibility | Custom React admin panel logic | Payload `admin.condition` API | Built-in, client-side, no server round-trip |
| Status transition validation | Custom middleware | Existing `isValidTransition()` from status-transitions.ts | Already works, just needs expanded data |
| customer_facing derivation | N8N-side filtering logic | `isCustomerFacing()` from status-config.ts | Single source of truth in the codebase, not in N8N |

## Common Pitfalls

### Pitfall 1: PostgreSQL Enum Push Failure in Development

**What goes wrong:** Adding 13 new values to the status select field options may cause `push: true` to fail if Drizzle's auto-push cannot handle the enum extension in a single transaction.

**Why it happens:** PostgreSQL's `ALTER TYPE ... ADD VALUE` cannot be used within a transaction alongside statements that reference the new value. Drizzle's push mode may wrap operations in a transaction.

**How to avoid:** After modifying the select field options in anfragen.ts:
1. Stop the dev server
2. Start with `npm run dev`
3. Watch for PostgreSQL errors in the console
4. If push fails, temporarily set `push: false` in payload.config.ts, run `npx payload generate:migration`, inspect the migration file, run `npx payload migrate`, then re-enable push
5. The `push: true` mode in this project (Payload 3.79 with @payloadcms/db-postgres 3.79) has historically worked for enum additions. But monitor for the "unsafe use of new value" error.

**Warning signs:** Console error containing `invalid input value for enum` or `unsafe use of new value`.

**Confidence:** MEDIUM -- push:true has worked before in this project, but 13 new values at once is unprecedented.

### Pitfall 2: Transition Map Inconsistency with CONTEXT.md

**What goes wrong:** CONTEXT.md defines transitions but leaves some edges vague (e.g., "hersteller_problem -- Admin entscheidet naechsten Schritt"). If the transition map is incomplete, certain statuses become dead ends.

**Why it happens:** Branching statuses like `hersteller_problem` and `hersteller_bestaetigt_mit_vorbehalt` need explicit exit paths.

**How to avoid:** The recommended complete transition map (Claude's Discretion area):
```
hersteller_problem -> [in_bearbeitung, storniert]
  - in_bearbeitung: Admin resolved with customer, restarting process
  - storniert: Unresolvable, cancel the order

hersteller_bestaetigt_mit_vorbehalt -> [in_produktion, storniert]
  - in_produktion: Customer accepted the deviation, proceed
  - storniert: Customer rejected, cancel

zahlungsproblem -> [bezahlt, storniert]
  - bezahlt: Payment issue resolved
  - storniert: Payment unrecoverable

reklamation -> [in_bearbeitung, abgeschlossen]
  - in_bearbeitung: Rework needed
  - abgeschlossen: Reklamation resolved, close again

storniert -> [] (terminal -- no exits)
```

**Warning signs:** A status with no outgoing transitions (other than intentional terminal statuses like `storniert`).

### Pitfall 3: stornierung_grund vs _status_kommentar Collision

**What goes wrong:** The existing COMMENT_REQUIRED mechanism checks for `data._status_kommentar`. If `storniert` is added to COMMENT_REQUIRED, the hook will require `_status_kommentar` -- but CONTEXT.md says `stornierung_grund` IS the comment for storniert transitions.

**Why it happens:** Two different comment mechanisms for the same logical concept.

**How to avoid:** Special-case `storniert` in the beforeChange hook: when transitioning to `storniert`, check `data.stornierung_grund` instead of `data._status_kommentar`. Either:
  - Remove `storniert` from COMMENT_REQUIRED and add explicit validation in the hook, OR
  - Keep `storniert` in COMMENT_REQUIRED but modify the check to accept either `_status_kommentar` or `stornierung_grund`

**Recommendation:** Remove `storniert` from COMMENT_REQUIRED and add an explicit block in the hook that validates stornierung-specific fields. This is cleaner and avoids ambiguity.

### Pitfall 4: beforeChange Hook Exceeding 30 Lines

**What goes wrong:** Adding stornierung validation, last_status_change_at update, and potentially reklamation/zahlungsproblem validation to the existing hook pushes it past maintainability limits.

**How to avoid:** Extract validation into a helper function ONLY if the hook body exceeds ~40 lines after all changes. The current hook is ~35 lines. Adding `data.last_status_change_at = new Date().toISOString()` (1 line) and stornierung validation (~10 lines) brings it to ~46 lines. This is borderline -- extract if it feels unmaintainable, but don't pre-optimize.

### Pitfall 5: Forgetting Access Control on New Fields

**What goes wrong:** New hersteller and stornierung fields are internal business data. Without `access: { read: isAdminOrMitarbeiter }`, customers can see manufacturer order numbers and refund amounts via the REST API.

**How to avoid:** Every new field (hersteller_bestellnummer, lieferdatum_erwartet, hersteller_notizen, hersteller_antwort, stornierung_grund, rueckerstattung_betrag, rueckerstattung_status) MUST have field-level access control.

**Existing pattern:**
```typescript
access: {
  read: ({ req }) => isStaff(req.user),
  update: ({ req }) => hasRole(req.user, ["admin", "mitarbeiter"]),
},
```

## Code Examples

### Complete Extended VALID_TRANSITIONS Map

```typescript
// src/lib/status-transitions.ts -- full replacement of VALID_TRANSITIONS
export const VALID_TRANSITIONS: Record<string, string[]> = {
  // Linear main flow
  neu: ["in_bearbeitung"],
  in_bearbeitung: ["angebot_versendet", "rueckfrage", "abgelehnt"],
  angebot_versendet: ["bestaetigt", "rueckfrage"],
  bestaetigt: ["zahlungslink_versendet"],
  zahlungslink_versendet: ["bezahlt"],
  bezahlt: ["an_hersteller", "storniert", "zahlungsproblem"],
  an_hersteller: ["hersteller_bestaetigt", "hersteller_bestaetigt_mit_vorbehalt", "hersteller_problem"],
  hersteller_bestaetigt: ["in_produktion"],
  hersteller_bestaetigt_mit_vorbehalt: ["in_produktion", "storniert"],
  in_produktion: ["versandbereit"],
  versandbereit: ["geliefert"],
  geliefert: ["abgeschlossen", "reklamation"],
  abgeschlossen: ["wieder_geoeffnet"],

  // Branch returns
  rueckfrage: ["in_bearbeitung"],
  abgelehnt: ["neu"],
  wieder_geoeffnet: ["in_bearbeitung"],
  hersteller_problem: ["in_bearbeitung", "storniert"],
  zahlungsproblem: ["bezahlt", "storniert"],
  reklamation: ["in_bearbeitung", "abgeschlossen"],

  // Terminal
  storniert: [],
};

export const COMMENT_REQUIRED: string[] = [
  "rueckfrage",
  "abgelehnt",
  "hersteller_problem",
  "reklamation",
  "wieder_geoeffnet",
  // NOTE: storniert NOT included -- stornierung_grund field is used instead
];
```

### Recommended Color Assignments (Claude's Discretion)

Based on Todo 017 color groups:

```typescript
export const STATUS_COLORS: Record<StatusKey, string> = {
  // Aktionsbedarf -- Amber
  neu: "#f59e0b",
  rueckfrage: "#f97316",
  hersteller_problem: "#ef4444",
  hersteller_bestaetigt_mit_vorbehalt: "#f59e0b",
  zahlungsproblem: "#ef4444",
  reklamation: "#ef4444",

  // In Bearbeitung -- Blau
  in_bearbeitung: "#3b82f6",
  angebot_versendet: "#3b82f6",

  // Bestaetigt/Bezahlt -- Gruen
  bestaetigt: "#22c55e",
  zahlungslink_versendet: "#10b981",
  bezahlt: "#10b981",

  // Bei Hersteller -- Violett
  an_hersteller: "#8b5cf6",
  hersteller_bestaetigt: "#8b5cf6",
  in_produktion: "#8b5cf6",

  // Lieferung -- Cyan
  versandbereit: "#06b6d4",
  geliefert: "#06b6d4",

  // Abgeschlossen -- Grau
  abgeschlossen: "#6b7280",
  wieder_geoeffnet: "#6b7280",

  // Problem/Terminal -- Rot
  storniert: "#ef4444",
  abgelehnt: "#ef4444",
};
```

**Note:** The existing colors for `neu` (#3b82f6 blue), `in_bearbeitung` (#eab308 yellow), `bestaetigt` (#22c55e green), `bezahlt` (#10b981 emerald), `abgeschlossen` (#6b7280 gray), `rueckfrage` (#f97316 orange), `abgelehnt` (#ef4444 red) will change to match the new color-group scheme from Todo 017. This is intentional -- the old color assignments were for 7 statuses; the new 20-status scheme uses semantic grouping.

### Recommended STATUS_GROUP Assignments (Claude's Discretion)

```typescript
export const STATUS_GROUP: Record<StatusKey, StatusGroup> = {
  neu: "offen",
  in_bearbeitung: "offen",
  angebot_versendet: "offen",
  rueckfrage: "offen",
  bestaetigt: "zahlung",
  zahlungslink_versendet: "zahlung",
  bezahlt: "zahlung",
  zahlungsproblem: "zahlung",
  an_hersteller: "produktion",
  hersteller_bestaetigt: "produktion",
  hersteller_bestaetigt_mit_vorbehalt: "produktion",
  in_produktion: "produktion",
  hersteller_problem: "produktion",
  versandbereit: "lieferung",
  geliefert: "lieferung",
  abgeschlossen: "abgeschlossen",
  wieder_geoeffnet: "offen",
  storniert: "abgeschlossen",
  abgelehnt: "abgeschlossen",
  reklamation: "offen",
};
```

### Recommended Kunden-Texte for 13 New Statuses (Claude's Discretion)

Following the established warm Siezen style from Phase 17:

```typescript
export const STATUS_CUSTOMER_TEXT: Record<StatusKey, string> = {
  // Existing 7 (unchanged)
  neu: "Wir haben Ihre Anfrage erhalten und pruefen sie sorgfaeltig.",
  in_bearbeitung: "Ihre Anfrage wird gerade von unserem Team bearbeitet.",
  bestaetigt: "Ihr Angebot ist fertig -- Sie koennen es jetzt einsehen.",
  bezahlt: "Danke, Ihre Zahlung ist bei uns eingegangen.",
  abgeschlossen: "Ihre Bestellung ist erfolgreich abgeschlossen.",
  rueckfrage: "Wir haben eine Rueckfrage zu Ihrer Anfrage.",
  abgelehnt: "Ihre Anfrage konnte leider nicht beruecksichtigt werden.",

  // 13 New
  angebot_versendet: "Ihr Angebot ist bereit -- bitte pruefen Sie es in Ruhe.",
  zahlungslink_versendet: "Wir haben Ihnen den Zahlungslink zugesendet.",
  an_hersteller: "Ihre Fenster werden jetzt beim Hersteller bestellt.",
  hersteller_bestaetigt: "Der Hersteller hat Ihre Bestellung bestaetigt.",
  hersteller_bestaetigt_mit_vorbehalt: "Wir melden uns bei Ihnen bezueglich einer Anpassung.",
  in_produktion: "Ihre Fenster werden jetzt hergestellt.",
  hersteller_problem: "Wir melden uns bei Ihnen bezueglich Ihrer Bestellung.",
  versandbereit: "Ihre Fenster sind fertig und werden fuer die Lieferung vorbereitet.",
  geliefert: "Ihre Fenster wurden geliefert.",
  storniert: "Ihre Bestellung wurde storniert.",
  zahlungsproblem: "Es gibt ein Problem mit Ihrer Zahlung -- wir melden uns bei Ihnen.",
  wieder_geoeffnet: "Ihre Anfrage wurde erneut geoeffnet und wird bearbeitet.",
  reklamation: "Ihre Reklamation wird von unserem Team bearbeitet.",
};
```

**IMPORTANT:** The actual implementation MUST use real UTF-8 umlauts (ae -> a with umlaut, oe -> o with umlaut, ue -> u with umlaut, ss -> sharp s) per project feedback rule (see MEMORY: `feedback_unicode_escapes.md`). The ASCII representations above are for RESEARCH.md readability only.

### Recommended STATUS_CUSTOMER_PHASE Assignments

```typescript
export const STATUS_CUSTOMER_PHASE: Record<StatusKey, CustomerPhase | null> = {
  neu: "Anfrage",
  in_bearbeitung: "Anfrage",
  angebot_versendet: "Angebot",
  bestaetigt: "Angebot",
  zahlungslink_versendet: "Zahlung",
  bezahlt: "Zahlung",
  an_hersteller: "Produktion",
  hersteller_bestaetigt: "Produktion",
  hersteller_bestaetigt_mit_vorbehalt: "Produktion",
  in_produktion: "Produktion",
  hersteller_problem: "Produktion",
  versandbereit: "Lieferung",
  geliefert: "Lieferung",
  abgeschlossen: "Lieferung",
  rueckfrage: "Anfrage",
  abgelehnt: null,           // Endstatus, kein Fortschrittsbalken
  storniert: null,            // Endstatus, kein Fortschrittsbalken
  zahlungsproblem: "Zahlung",
  wieder_geoeffnet: "Anfrage",
  reklamation: "Lieferung",
};
```

### Recommended EMAIL_TRIGGER_STATUSES

```typescript
// customer_facing: true (14 statuses) -- triggers N8N email
export const EMAIL_TRIGGER_STATUSES: StatusKey[] = [
  "neu",
  "rueckfrage",
  "angebot_versendet",
  "bestaetigt",
  "zahlungslink_versendet",
  "bezahlt",
  "hersteller_problem",
  "in_produktion",
  "versandbereit",
  "geliefert",
  "abgeschlossen",
  "storniert",
  "zahlungsproblem",
  "reklamation",
];
```

### last_status_change_at Field Definition

```typescript
// In anfragen.ts fields array
{
  name: "last_status_change_at",
  type: "date",
  label: "Letzte Statusaenderung",
  admin: {
    readOnly: true,
    date: {
      displayFormat: "dd.MM.yyyy HH:mm",
    },
  },
  access: {
    read: () => true, // All users can see when last updated
  },
}
```

### beforeChange Hook Extension for last_status_change_at

```typescript
// Inside the existing status change detection block:
if (originalDoc.status !== data.status) {
  // ... existing transition validation ...
  // ... existing comment required check ...

  // NEW: Update last_status_change_at
  data.last_status_change_at = new Date().toISOString();

  // ... existing status_historie creation ...
}
```

## State of the Art

| Old Approach (7 statuses) | New Approach (20 statuses) | Impact |
|---------------------------|---------------------------|--------|
| EMAIL_TRIGGER_STATUSES includes all 7 | 14 of 20 are customer-facing, 6 are internal | afterChange hook must filter using isCustomerFacing() |
| `bezahlt -> abgeschlossen` direct | 7 intermediate statuses between bezahlt and abgeschlossen | Full production/delivery lifecycle tracked |
| `abgeschlossen -> in_bearbeitung` direct | `abgeschlossen -> wieder_geoeffnet -> in_bearbeitung` | Audit trail shows reopen intent |
| COMMENT_REQUIRED: 2 entries | COMMENT_REQUIRED: 5 entries + special stornierung_grund | More structured accountability |
| WebhookPayload: event_type + status only | + customer_facing + kunden_text + kunden_phase | N8N can filter without reverse-engineering status meaning |

## Open Questions

1. **Stripe Checkout Trigger Status**
   - What we know: Current code creates Stripe Checkout Session on `bestaetigt` (line 155-173 in anfragen.ts afterChange hook). The new flow adds `zahlungslink_versendet` between `bestaetigt` and `bezahlt`.
   - What's unclear: Should the Stripe trigger move to `zahlungslink_versendet` or stay on `bestaetigt`?
   - Recommendation: Keep on `bestaetigt` for now. The `zahlungslink_versendet` status represents "link was sent to customer" -- the Stripe session creation logically happens when the Angebot is confirmed, and the resulting URL is sent in the webhook. Moving the trigger can be done in a later phase if needed.

2. **Existing Test Expectations**
   - What we know: `test-status-config.test.ts` asserts exactly 7 keys and specific color values. `test-status-transitions.test.ts` asserts specific transitions including `bezahlt -> abgeschlossen` which will no longer be valid.
   - What's unclear: Nothing -- these tests MUST be updated alongside the code changes.
   - Recommendation: Update test assertions as part of each file modification. Tests are the validation mechanism.

3. **Color Change for Existing Statuses**
   - What we know: `neu` changes from blue (#3b82f6) to amber (#f59e0b) in the new grouping scheme. This changes the visual appearance of existing data in the admin panel.
   - What's unclear: Will the user expect continuity of colors for existing statuses?
   - Recommendation: Apply the new color scheme as defined in Todo 017. The purpose is semantic grouping, which is more important than color continuity. Flag this as a visual change the user should review.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.2 with ts-jest |
| Config file | `jest.config.ts` |
| Quick run command | `npx jest --testPathPattern="status" --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-03 | 20 status values in all maps | unit | `npx jest tests/unit/test-status-config.test.ts -x` | Exists -- needs update from 7 to 20 |
| STAT-04 | Extended transitions with branches | unit | `npx jest tests/unit/test-status-transitions.test.ts -x` | Exists -- needs expansion |
| STAT-06 | last_status_change_at set on status change | unit | manual-only (requires Payload runtime) | N/A |
| FELD-01 | Hersteller fields exist on collection | manual | TypeScript compile check | N/A |
| FELD-02 | Stornierung fields with conditional required | unit | New test in test-status-transitions.test.ts or dedicated file | Needs creation |
| FELD-03 | WebhookPayload has customer_facing + kunden_text + kunden_phase | unit | `npx jest tests/unit/test-n8n-webhook.test.ts -x` | Exists -- needs update |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern="status|webhook" --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/unit/test-status-config.test.ts` -- update from 7 to 20 status assertions
- [ ] `tests/unit/test-status-transitions.test.ts` -- expand transition tests for all 20 statuses + new branches
- [ ] `tests/unit/test-n8n-webhook.test.ts` -- add assertions for customer_facing, kunden_text, kunden_phase fields

## Sources

### Primary (HIGH confidence)
- `src/lib/status-config.ts` -- current 7-status implementation with all flat maps (verified directly)
- `src/lib/status-transitions.ts` -- current VALID_TRANSITIONS and COMMENT_REQUIRED (verified directly)
- `src/collections/business/anfragen.ts` -- current select field options, beforeChange/afterChange hooks, collapsible pattern at line 254, condition pattern at line 337 (verified directly)
- `src/lib/n8n-webhook.ts` -- current WebhookPayload interface (verified directly)
- `src/payload.config.ts` -- confirms `push: true` configuration at line 124 (verified directly)
- `.planning/phases/18-statuses-transitions-collection-felder/18-CONTEXT.md` -- user decisions for all 20 statuses, transitions, fields, and webhook enrichment
- `.planning/research/ARCHITECTURE.md` -- build order, integration points, anti-patterns
- `.planning/research/PITFALLS.md` -- Pitfall 2 (PostgreSQL enum), Pitfall 3 (transition map), Pitfall 4 (hook monolith), Pitfall 5 (N8N spam), Pitfall 8 (customer mapping layer)
- `docs/todos/017_2026-03-22_bestellungs-flow-verbesserung.md` -- complete 15+ status flow specification, new fields, email triggers, color groups

### Secondary (MEDIUM confidence)
- [Payload CMS Postgres documentation](https://payloadcms.com/docs/database/postgres) -- push mode behavior with enum changes
- [Payload CMS Migrations documentation](https://payloadcms.com/docs/database/migrations) -- migration workflow for production
- [GitHub Issue #15071](https://github.com/payloadcms/payload/issues/15071) -- PostgreSQL enum migration "unsafe use of new value" issue and DROP/RECREATE workaround

### Tertiary (LOW confidence)
- [Discussion #8544](https://github.com/payloadcms/payload/discussions/8544) -- Community discussion about getting rid of enums; relevant context but no actionable guidance for this phase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns verified in existing codebase
- Architecture: HIGH -- extending existing patterns (flat maps, hooks, collection fields) with well-defined data from CONTEXT.md
- Pitfalls: HIGH -- PostgreSQL enum risk is documented with mitigation; stornierung_grund collision identified with clear resolution
- Transitions map: HIGH for main flow, MEDIUM for branch exits (Claude's Discretion items -- recommended map provided)
- Colors/Groups/Texts: MEDIUM -- recommendations based on Todo 017 color scheme, but user may want adjustments

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable domain -- Payload 3.79 pinned, no external API changes)
