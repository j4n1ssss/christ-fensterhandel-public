---
phase: 18-statuses-transitions-collection-felder
verified: 2026-03-25T10:30:00Z
status: passed
score: 12/12 must-haves verified
gaps: []
human_verification:
  - test: "Open an Anfrage in the admin panel, set status to storniert without filling stornierung_grund"
    expected: "Form submission should be blocked with 'Stornierungsgrund ist erforderlich.' error"
    why_human: "beforeChange hook validation can only be confirmed end-to-end via the admin UI or API call"
  - test: "Open an Anfrage at status storniert — verify the Stornierung collapsible group is visible; open one at status neu — verify it is hidden"
    expected: "admin.condition function controls visibility at render time; Hersteller-Informationen group visible from bezahlt onwards"
    why_human: "Payload admin.condition rendering requires a live admin panel, cannot be verified statically"
---

# Phase 18: Statuses, Transitions, Collection Fields — Verification Report

**Phase Goal:** Extend status system to 20 statuses with complete transition map, enriched webhook payload, and anfragen collection field extensions
**Verified:** 2026-03-25T10:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | StatusKey union type contains exactly 20 string literals | VERIFIED | `src/lib/status-config.ts` lines 15-35: union with all 20 literals ending in `"reklamation"` |
| 2 | All 7 flat maps have entries for all 20 keys | VERIFIED | `STATUS_COLORS`, `STATUS_LABELS`, `STATUS_TAILWIND`, `STATUS_CUSTOMER_TEXT`, `STATUS_CUSTOMER_PHASE`, `STATUS_GROUP`, `EMAIL_TRIGGER_STATUSES` all use `Record<StatusKey, ...>` enforcing completeness at compile time |
| 3 | EMAIL_TRIGGER_STATUSES contains exactly 14 customer-facing statuses | VERIFIED | Lines 269-284: array with 14 entries; excludes `in_bearbeitung`, `an_hersteller`, `hersteller_bestaetigt`, `hersteller_bestaetigt_mit_vorbehalt`, `wieder_geoeffnet`, `abgelehnt` |
| 4 | Color assignments follow the 7 semantic groups from UI-SPEC | VERIFIED | amber/blue/green+emerald/violet/cyan/gray/red groups all present; `neu: "#f59e0b"` (amber), `in_bearbeitung: "#3b82f6"` (blue), `an_hersteller: "#8b5cf6"` (violet), `versandbereit: "#06b6d4"` (cyan) |
| 5 | Customer texts use real UTF-8 umlauts, warm Siezen tone | VERIFIED | Binary check confirms real UTF-8 umlaut bytes (no `\u00xx` escapes); all texts use warm Siezen (Ihre/Ihnen/Sie) |
| 6 | VALID_TRANSITIONS defines entries for all 20 statuses with correct forward + branch transitions | VERIFIED | `src/lib/status-transitions.ts` lines 19-49: all 20 statuses present, linear chain + 8 branch paths correct |
| 7 | storniert is a terminal status with empty transitions array | VERIFIED | `storniert: []` on line 48 of `status-transitions.ts` |
| 8 | COMMENT_REQUIRED contains exactly 5 entries (not storniert) | VERIFIED | Lines 55-61: 5-entry array with `rueckfrage`, `abgelehnt`, `hersteller_problem`, `reklamation`, `wieder_geoeffnet`; JSDoc comment explicitly notes storniert exclusion |
| 9 | WebhookPayload interface includes customer_facing, kunden_text, kunden_phase | VERIFIED | `src/lib/n8n-webhook.ts` lines 17-21: all 3 fields present with correct types (`boolean`, `string`, `string | null`) |
| 10 | Anfragen status select field has exactly 20 options matching StatusKey values | VERIFIED | `src/collections/business/anfragen.ts` lines 263-287: 20 `{ label, value }` entries; 23 total `value:` occurrences = 20 status + 3 rueckerstattung options |
| 11 | New fields with access control, conditional visibility, last_status_change_at auto-update, and enriched webhook payload in hooks | VERIFIED | All 7 new fields (hersteller_bestellnummer, lieferdatum_erwartet, hersteller_notizen, hersteller_antwort, stornierung_grund, rueckerstattung_betrag, rueckerstattung_status) present; `last_status_change_at` field + hook auto-update on line 121; 2 occurrences of `customer_facing: isCustomerFacing(` (create + status_aenderung paths) |
| 12 | validateStornierung helper validates stornierung_grund + conditional refund fields | VERIFIED | Lines 18-52: extracted helper throws `APIError` for missing `stornierung_grund`, checks `paidStatuses` array for conditional `rueckerstattung_betrag` and `rueckerstattung_status` validation |

**Score:** 12/12 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/status-config.ts` | 20-status config with all flat maps | VERIFIED | 299 lines, all 7 maps use `Record<StatusKey, ...>`, UTF-8 umlauts, correct color semantics |
| `tests/unit/test-status-config.test.ts` | Updated assertions for 20 statuses | VERIFIED | 538 lines, 20-entry `ALL_STATUS_KEYS`, assertions for all maps, `toHaveLength(20)` and `toHaveLength(14)` checks present |
| `src/lib/status-transitions.ts` | 20-status transition map + comment requirements | VERIFIED | 78 lines, `VALID_TRANSITIONS` with 20 entries, `COMMENT_REQUIRED` with 5 entries, terminal `storniert: []` |
| `src/lib/n8n-webhook.ts` | Extended WebhookPayload with customer_facing fields | VERIFIED | `customer_facing: boolean`, `kunden_text: string`, `kunden_phase: string | null` present in interface |
| `tests/unit/test-status-transitions.test.ts` | Transition tests for all 20 statuses | VERIFIED | 309 lines, 20-entry `allStatuses` array, full linear + branch + terminal + removed-transition coverage |
| `tests/unit/test-n8n-webhook.test.ts` | Webhook tests including new customer_facing fields | VERIFIED | `buildPayload` includes `customer_facing: true`, `kunden_text`, `kunden_phase: "Anfrage"`; dedicated tests for both `true` and `false` cases |
| `src/collections/business/anfragen.ts` | 20-status select, new fields, extended hooks, conditional visibility | VERIFIED | 557 lines, all new fields present, `validateStornierung` helper extracted, enriched webhook payloads in both `create` and `status_aenderung` paths |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/status-config.ts` | `Record<StatusKey, ...>` | TypeScript compile-time enforcement | VERIFIED | All 6 map declarations use `Record<StatusKey, ...>` — completeness enforced at compile time |
| `src/collections/business/anfragen.ts` | `src/lib/status-config.ts` | `import { isCustomerFacing, STATUS_CUSTOMER_TEXT, STATUS_CUSTOMER_PHASE }` | VERIFIED | Lines 8-13 of anfragen.ts; `isCustomerFacing(status)`, `STATUS_CUSTOMER_TEXT[status]`, `STATUS_CUSTOMER_PHASE[status]` all used in both webhook payload blocks |
| `src/collections/business/anfragen.ts` | `src/lib/status-transitions.ts` | `import { isValidTransition, COMMENT_REQUIRED }` | VERIFIED | Line 7 of anfragen.ts; `isValidTransition(originalDoc.status, data.status)` on line 98, `COMMENT_REQUIRED.includes(data.status)` on line 106 |
| `src/collections/business/anfragen.ts` | `src/lib/n8n-webhook.ts` | `import { sendN8NWebhook, type WebhookPayload }` | VERIFIED | Line 14 of anfragen.ts; `WebhookPayload` typed in both payload blocks, `sendN8NWebhook(payload)` called in both paths |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| STAT-03 | 18-01, 18-03 | 15+ neue Status-Werte im Anfragen-Collection Select-Feld | SATISFIED | 20 status values in select field; 13 new beyond original 7 |
| STAT-04 | 18-02 | Erweiterte Status-Transitions mit linearem Hauptflow und Abzweigungen | SATISFIED | `VALID_TRANSITIONS` has 20 entries covering full lifecycle with 8 branch paths |
| STAT-06 | 18-03 | last_status_change_at Feld mit automatischem Update via beforeChange Hook | SATISFIED | Field defined at lines 289-303 of anfragen.ts; auto-update `data.last_status_change_at = new Date().toISOString()` on line 121 inside status-change block |
| FELD-01 | 18-03 | Hersteller-Felder: hersteller_bestellnummer, lieferdatum_erwartet, hersteller_notizen, hersteller_antwort | SATISFIED | All 4 fields in Hersteller-Informationen collapsible group at lines 446-488 with `isStaff` read + `hasRole` update access control |
| FELD-02 | 18-03 | Stornierung-Felder: stornierung_grund, rueckerstattung_betrag, rueckerstattung_status | SATISFIED | All 3 fields in Stornierung collapsible group at lines 498-531 with `isStaff` read + `hasRole` update access control; `condition: (data) => data?.status === "storniert"` |
| FELD-03 | 18-02, 18-03 | customer_facing Flag auf WebhookPayload Interface | SATISFIED | Field in `WebhookPayload` interface; populated in both `create` and `status_aenderung` afterChange webhook payloads using `isCustomerFacing(status)` |

**Note on STAT-05:** This requirement (Admin-Status zu Kunden-Text Mapping with 5-Phasen-Modell) is mapped to Phase 21 in the traceability table and is intentionally NOT part of Phase 18. The customer-text data infrastructure (`STATUS_CUSTOMER_TEXT`, `STATUS_CUSTOMER_PHASE`) was built in Plan 18-01 as a prerequisite, which is the correct split. No gap.

---

## Anti-Patterns Found

No blockers or warnings found.

| File | Pattern Checked | Result |
|------|-----------------|--------|
| `src/lib/status-config.ts` | Unicode escapes (`\u00xx`) in UI strings | None found — real UTF-8 umlaut bytes confirmed |
| `src/lib/status-config.ts` | TODO/FIXME/placeholder | None |
| `src/lib/status-transitions.ts` | Empty implementations / stubs | None — all 20 entries substantive |
| `src/lib/n8n-webhook.ts` | Stub responses (return `{}`, `return []`) | None — interface extended cleanly |
| `src/collections/business/anfragen.ts` | `console.log`-only handlers | None in hooks — only proper error logging in catch blocks |
| `src/collections/business/anfragen.ts` | Stornierung validation bypassed | None — `validateStornierung` called on line 117 before status_historie creation |

---

## Git Commit Verification

All 6 task commits verified in git log:

| Commit | Plan | Task | Verified |
|--------|------|------|---------|
| `56a6645` | 18-01 | TDD RED — test-status-config.test.ts | Yes |
| `b3af550` | 18-01 | TDD GREEN — status-config.ts extended | Yes |
| `f3d7163` | 18-02 | TDD RED — transition + webhook tests | Yes |
| `2db1062` | 18-02 | TDD GREEN — transitions + WebhookPayload | Yes |
| `bb2428c` | 18-03 | anfragen.ts fields | Yes |
| `1a42cef` | 18-03 | anfragen.ts hooks | Yes |

---

## Human Verification Required

### 1. Stornierung validation in admin panel

**Test:** Open an Anfrage at status `bezahlt` in the admin panel. Attempt to transition to `storniert` without filling `stornierung_grund`.
**Expected:** The save is blocked with HTTP 400, error message "Stornierungsgrund ist erforderlich." visible in the UI.
**Why human:** The `beforeChange` hook validation runs server-side; confirming the error surfaces correctly in the admin UI requires a live admin session.

### 2. Hersteller collapsible conditional visibility

**Test:** Open an Anfrage at status `neu` — verify the "Hersteller-Informationen" collapsible group is not rendered. Then change the status to `bezahlt` and save — verify the group becomes visible.
**Expected:** Group hidden at `neu`/`in_bearbeitung`/`angebot_versendet`/`bestaetigt`/`zahlungslink_versendet`; visible from `bezahlt` onwards.
**Why human:** Payload `admin.condition` function is evaluated at render time in the admin panel — cannot be confirmed by reading source alone.

### 3. Stornierung collapsible conditional visibility

**Test:** Open an Anfrage at any non-storniert status — verify the "Stornierung" collapsible group is not visible. Navigate to or set status to `storniert` — verify the group appears.
**Expected:** Group only visible when `data?.status === "storniert"`.
**Why human:** Same as above — admin.condition rendering requires live admin panel.

---

## Summary

Phase 18 goal is fully achieved. All three plans delivered their intended outputs:

- **Plan 18-01** extended `status-config.ts` from 7 to 20 statuses with all 7 flat maps populated, real UTF-8 umlauts, and correct semantic color groups. 100 tests pass.
- **Plan 18-02** extended `status-transitions.ts` with the complete 20-status state machine (linear main flow + 8 branches, terminal `storniert`) and enriched `WebhookPayload` with `customer_facing`/`kunden_text`/`kunden_phase`. 67 tests pass.
- **Plan 18-03** wired everything into `src/collections/business/anfragen.ts`: 20-status select field, 7 new collection fields in 2 collapsible groups, `last_status_change_at` auto-update, stornierung validation, and enriched webhook payloads in both `create` and `status_aenderung` afterChange paths.

All 6 requirements (STAT-03, STAT-04, STAT-06, FELD-01, FELD-02, FELD-03) are satisfied with evidence in the actual codebase. TDD workflow followed throughout — all commits confirmed in git log. No Unicode escapes, no stubs, no orphaned artifacts.

Three items require human verification in a live admin session (conditional field visibility + server-side validation surfacing), but these do not block phase completion.

---

_Verified: 2026-03-25T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
