---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Bestellungsflow + Integrationen
status: completed
stopped_at: Completed 30-02-PLAN.md
last_updated: "2026-04-03T18:39:43.488Z"
last_activity: 2026-04-03 -- Plan 30-02 executed (Webhook Tab + Email Send Modal UI)
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 29
  completed_plans: 29
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Kunden konfigurieren Fenster/Tueren Schritt fuer Schritt mit intelligenter Hub-Filterung -- Christ bekommt strukturierte Anfragen ins Dashboard
**Current focus:** Phase 30 Admin Extras (Manueller Email-Versand, Dashboard Stats, Anfragen-Liste)

## Current Position

Phase: 30 of 30 (Admin Extras)
Plan: 4 of 4
Status: Complete
Last activity: 2026-04-03 -- Plan 30-02 executed (Webhook Tab + Email Send Modal UI)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- v1.0: 20 plans in 2 Tage
- v1.1: 14 plans in 6 Tage
- v1.2: 4 plans in 1 Tag
- v1.3: 15 plans in 4 Tage
- Total: 53 plans, 23 phases, 4 milestones

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table.

- [24-01] Settings Global hidden in Payload admin, Custom Admin Page provides the UI at /admin/einstellungen
- [24-01] getSettings() reads fresh from DB every call (no cache per user decision)
- [24-01] Upload fields shown as read-only links to media collection in Custom Admin Page
- [Phase 24]: Rate limiter uses in-memory Map with 5min cleanup (no Redis, single-server Coolify)
- [Phase 24]: CSRF only on mutating routes (submit, validate-discount, stripe/checkout) -- read-only routes get rate limiting only
- [Phase 24]: Seed guard before imports to prevent DB connection in production
- [24-02] calcNetFromGross(999,19)=839 not 840 (Math.round rounds 839.495 down)
- [24-02] Nummernkreise collection slug uses type assertions until payload-types regenerated
- [Phase 24]: calcNetFromGross(999,19)=839 not 840 (Math.round rounds .495 down)
- [24-04] VersionConflictError class (not APIError) in optimistic-lock.ts to avoid Payload ESM import in Jest
- [24-04] Rabattcodes wert field NOT migrated to cents (marked TODO for future cleanup)
- [24-04] Cart store formula unchanged (previewPrice * quantity works in cents)
- [25-01] EVENT_MATRIX follows status-config.ts pattern (Record<EmailEventType, EventConfig>)
- [25-01] All 20 events enabled_default: true, Admin disables via event toggles in Settings
- [25-01] email_queue create access returns true (server-side queuing has no user context)
- [25-02] renderToStaticMarkup instead of @react-email/render for CJS/Jest compatibility
- [25-02] Custom htmlToPlainText strips HTML for email plain-text fallback
- [25-02] Template registry with dynamic imports, TEMPLATE_SLUGS as static key list
- [25-02] buildTemplateProps switch maps EmailEventPayload to template-specific prop shapes
- [25-03] Dynamic Payload imports inside function body to avoid initialization issues in hooks and workers
- [25-03] Exponential backoff: Math.pow(2, attempts-1) * 60_000 ms (1,2,4,8 min), dead after 5 attempts
- [25-03] Queue entries use 'as never' type assertions on collection slug until payload-types.ts regenerated
- [25-04] Preview routes staff-protected: admin + mitarbeiter (viewer and kunde get 403)
- [25-04] Rate limiter for test-send: in-memory Map, 5/min per user, 5min cleanup
- [25-04] Email fields moved from Dokumente tab to dedicated 5th E-Mail tab
- [25-04] Event toggles default enabled (true) unless explicitly set to false
- [Phase 26]: [26-01] Rechnungen collection combines rechnung + gutschrift as typ select (not separate collections)
- [Phase 26]: [26-01] Immutability double-guard: access control (false) + beforeChange hook (APIError)
- [Phase 26]: [26-01] renderPDF uses renderToBuffer primary with renderToStream fallback
- [Phase 26]: [26-02] MwStBlock accepts optional labels prop for Gutschrift Erstattung overrides
- [Phase 26]: [26-02] Gutschrift passes negative cent values to MwStBlock for minus display
- [Phase 26]: [26-02] Rechnung includes static Entgeltminderung note for UStG requirement 10
- [Phase 26]: [26-03] PDF generation errors non-blocking in afterChange hooks (try/catch with console.error)
- [Phase 26]: [26-03] Kunden document query filters angebote by status=versendet (drafts hidden from customers)
- [Phase 27]: [27-00] Added npm test script (jest) to package.json -- was missing, blocking test execution
- [Phase 27]: [27-00] Pre-existing CSRF test failures deferred to Plan 27-02 (out of scope for scaffolding)
- [Phase 27]: [27-01] createCheckoutSession uses options object (not positional args) for extensibility
- [Phase 27]: [27-01] findOrCreateStripeCustomer: Users DB -> Stripe API by email -> create new (DSGVO-minimal)
- [Phase 27]: [27-01] rueckerstattung_abgeschlossen is terminal status (empty transitions, like storniert)
- [Phase 27]: [27-01] stripe_customer_id field restricted to admin/mitarbeiter read access
- [Phase 27]: [27-02] Redirect route uses inline checkRateLimit (withRateLimit HOF incompatible with dynamic route params)
- [Phase 27]: [27-02] Webhook idempotency checks stripe_payment_status (not anfrage status) to prevent race conditions
- [Phase 27]: [27-02] Refund route: rueckerstattung_ausstehend only for full refunds, partial refunds don't change anfrage status
- [Phase 27]: [27-02] Added rueckerstattung and zahlung_dispute to EmailEventType (needed by webhook handlers)
- [Phase 27]: [27-03] StripePayButton handles own visibility via status prop (returns null for irrelevant statuses)
- [Phase 27]: [27-03] gutschriftUrl derived from dokumente prop (not anfrage.rechnungen) matching existing data flow
- [Phase 27]: [27-03] Dashboard link uses /kunden/dashboard/{id} (actual route) not /kunden/anfragen/{id}
- [Phase 28]: [28-00] All test stubs use it.todo() pattern (consistent with Wave 0 stubs in test-stripe-webhook.test.ts)
- [Phase 28]: [28-00] Pricing test imports calcNetFromGross/calcGrossFromNet from existing @/lib/tax

- [Phase 28]: [28-04] Server component wrapper pattern: anfrage/page.tsx fetches Settings, passes agbLink to client component
- [Phase 28]: [28-04] AGB link uses native <a> tag (not Next Link) for external URL compatibility from Settings
- [Phase 28]: [28-01] _skip_auto_pdf transient field prevents double PDF generation when API sets angebot_versendet
- [Phase 28]: [28-01] Stripe session metadata.flow=angebots_annahme identifies checkout for webhook expiry reset
- [Phase 28]: [28-01] Annehmen route uses inline checkRateLimit (public route, no CSRF)
- [Phase 28]: [28-01] Webhook resets to angebot_versendet only when anfrage.status=zahlungslink_versendet (race-safe)
- [Phase 28]: AngebotAnnahmeButton uses inline confirm section (not modal) for lighter single-page pattern
- [Phase 28]: [28-03] AGB link passed as prop from server (dynamic from Settings), /agb fallback only when undefined
- [Phase 28]: CSS file is src/app/(payload)/custom.scss not src/styles/custom.scss
- [Phase 28]: [28-02] DokumentePanel uses local ANGEBOT_STATUS_COLORS for angebot-specific display (entwurf/versendet)
- [Phase 29]: stornierung_beantragt -> in_bearbeitung comment check is source-specific in anfragen.ts beforeChange (not COMMENT_REQUIRED array)
- [Phase 29]: geliefert/abgeschlossen excluded from stornierung_beantragt transitions (too late in lifecycle)
- [29-04] Payload auth override returns empty string from generateEmailHTML to suppress built-in email sending
- [29-04] Password reset email uses project email queue (Phase 25) instead of Payload default transport
- [29-04] EmailEventPayload extended with optional resetUrl field (no type assertions needed)
- [29-04] Anti-leak: forgot-password always shows success regardless of response status
- [Phase 29]: [29-02] Antwort route uses FormData (not JSON) for multipart file uploads alongside text
- [Phase 29]: [29-02] StatusHistorie geaendert_von undefined for guest submissions; email in kommentar prefix
- [Phase 29]: [29-02] StornoDialog triggers window.location.reload() on success for StatusBanner refresh
- [29-03] Admin nav file is custom-nav.tsx not navigation.tsx -- Reklamationen added to bestellungsverwaltung dropdown
- [29-03] ReklamationFormular follows RueckfrageFormular inline-expand pattern with image thumbnail previews
- [29-03] queueEmailEvent uses full EmailEventPayload shape for reklamation event
- [30-03] Attention sort requires server-side fetch all + compute + sort + paginate (computed value, not DB field)
- [30-03] Tab counts include search filter for accurate contextual counts
- [30-03] Umsatz uses paginated iteration (100/batch) instead of limit=0
- [30-03] Dringend count uses server-side Payload date query (no JS filter)
- [30-03] Where type uses Where | undefined for Payload compatibility
- [30-00] Used Jest it.todo() pattern (project standard) instead of vitest test.todo() specified in plan
- [Phase 30]: [30-01] event_type for manual sends is manuell_[templateSlug] (plain text, not in EmailEventType union)
- [Phase 30]: [30-01] Queue entries created directly via Payload API (not queueEmailEvent since EVENT_MATRIX does not know manual events)
- [Phase 30]: [30-01] StatusHistorie kommentar prefix [E-Mail gesendet] for manual email tracking (no schema change)
- [Phase 30]: [30-01] send-email rate limit 10/min per user (higher than preview 5/min for batch operations)
- [Phase 30]: [30-01] WebhookFehlerBadge shows all dead entries (no time window, unlike previous 24h)
- [Phase 30]: [30-03] Attention sort requires server-side fetch all + compute + sort + paginate (computed value, not DB field)
- [Phase 30]: [30-03] Umsatz uses paginated iteration (100/batch) instead of limit=0 for memory safety
- [Phase 30]: [30-02] EVENT_MATRIX reverse-lookup iterates entries to find kunde template matching slug (keys=underscores, slugs=hyphens)
- [Phase 30]: [30-02] Email timeline entries detected by [E-Mail gesendet] prefix in kommentar field

### Pending Todos

- Todo 043: Kundenabsprache offene Fragen -- blockiert Details von Phase 28 (Angebots-Annahme-Flow, AGB-Text)
- MwSt brutto/netto Entscheidung ausstehend -- Phase 24 baut konfigurierbar

### Blockers/Concerns

- Angebots-Annahme-Flow (3 Optionen) noch nicht entschieden -- Phase 28 baut flexible Infrastruktur
- AGB-Text nicht finalisiert -- Phase 28 baut Checkbox + Platzhalter
- React Email vs MJML: Empirischer Test in Phase 25 noetig (Outlook-Kompatibilitaet)
- @react-pdf/renderer VPS-Speicherverbrauch: Validierung in Phase 26 noetig

## Session Continuity

Last session: 2026-04-03T15:36:01.891Z
Stopped at: Completed 30-02-PLAN.md
Resume file: None
Next step: Execute Plan 30-04 (remaining plan in Phase 30)
