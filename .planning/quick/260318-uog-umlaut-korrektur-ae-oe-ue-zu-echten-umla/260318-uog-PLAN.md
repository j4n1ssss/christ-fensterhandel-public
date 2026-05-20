---
phase: quick
plan: 260318-uog
type: execute
wave: 1
depends_on: []
files_modified:
  # src/collections/ (11 files)
  - src/collections/business/rabattcodes.ts
  - src/collections/business/anfragen.ts
  - src/collections/business/status-historie.ts
  - src/collections/produkte/fensterformen.ts
  - src/collections/produkte/fluegelanzahl.ts
  - src/collections/produkte/oeffnungsarten.ts
  - src/collections/produkte/profile.ts
  - src/collections/ausstattung/extras.ts
  - src/collections/ausstattung/farben.ts
  - src/collections/ausstattung/sicherheitsglas.ts
  - src/collections/system/edit-history.ts
  # src/components/ (39 files)
  - src/components/konfigurator/steps/step-produkttyp.tsx
  - src/components/konfigurator/steps/step-material.tsx
  - src/components/konfigurator/steps/step-profil.tsx
  - src/components/konfigurator/steps/step-fluegel.tsx
  - src/components/konfigurator/steps/step-oeffnungsart.tsx
  - src/components/konfigurator/steps/step-form.tsx
  - src/components/konfigurator/steps/step-masse.tsx
  - src/components/konfigurator/steps/step-farben.tsx
  - src/components/konfigurator/steps/step-verglasung-extras.tsx
  - src/components/konfigurator/steps/step-zusammenfassung.tsx
  - src/components/konfigurator/step-content.tsx
  - src/components/konfigurator/ui/step-navigation.tsx
  - src/components/konfigurator/ui/mobile-step-header.tsx
  - src/components/konfigurator/preview/window-svg.tsx
  - src/components/konfigurator/preview/selection-summary.tsx
  - src/components/cart/cart-empty.tsx
  - src/components/cart/cart-item-card.tsx
  - src/components/cart/cart-summary.tsx
  - src/components/cart/discount-input.tsx
  - src/components/anfrage/contact-form.tsx
  - src/components/anfrage/danke-content.tsx
  - src/components/anfrage/anfrage-summary.tsx
  - src/components/admin/anfrage-edit-button.tsx
  - src/components/admin/status-timeline.tsx
  - src/components/admin/status-workflow.tsx
  - src/components/admin/dashboard-overview.tsx
  - src/components/admin/anfrage-detail-view.tsx
  - src/components/kunden/login-form.tsx
  - src/components/kunden/register-form.tsx
  - src/components/kunden/status-timeline.tsx
  - src/components/kunden/gast-tracking-form.tsx
  - src/components/kunden/stripe-pay-button.tsx
  - src/components/kunden/anfrage-detail.tsx
  - src/components/puck-blocks/hero-block.tsx
  - src/components/puck-blocks/text-block.tsx
  - src/components/puck-blocks/feature-grid-block.tsx
  - src/components/puck-blocks/cta-banner-block.tsx
  - src/components/puck-blocks/image-text-block.tsx
  - src/components/cookie-banner/cookie-banner.tsx
  # src/lib/ (4 files)
  - src/lib/konfigurator/schemas.ts
  - src/lib/konfigurator/step-config.ts
  - src/lib/konfigurator/persistence.ts
  - src/lib/anfrage/schemas.ts
  # src/seed/ (16 files)
  - src/seed/data/fluegelanzahl.ts
  - src/seed/data/produkttypen.ts
  - src/seed/data/materialien.ts
  - src/seed/data/profile.ts
  - src/seed/data/oeffnungsarten.ts
  - src/seed/data/fensterformen.ts
  - src/seed/data/zusatzlichter.ts
  - src/seed/data/farben.ts
  - src/seed/data/dichtungsfarben.ts
  - src/seed/data/verglasungen.ts
  - src/seed/data/schallschutz.ts
  - src/seed/data/sicherheitsglas.ts
  - src/seed/data/glasdekore.ts
  - src/seed/data/sprossen.ts
  - src/seed/data/extras.ts
  # src/app/ (15 files)
  - src/app/(frontend)/layout.tsx
  - src/app/(frontend)/[locale]/page.tsx
  - src/app/(frontend)/konfigurator/fenster/page.tsx
  - src/app/(frontend)/konfigurator/tueren/page.tsx
  - src/app/(frontend)/konfigurator/rolllaeden/page.tsx
  - src/app/(frontend)/anfrage/page.tsx
  - src/app/(frontend)/anfrage/zusammenfassung/page.tsx
  - src/app/(frontend)/kunden/dashboard/[id]/page.tsx
  - src/app/(frontend)/status-pruefen/page.tsx
  - src/app/api/status-pruefen/route.ts
  - src/app/api/anfrage/validate-discount/route.ts
  - src/app/api/anfrage/calculate-price/route.ts
  - src/app/api/anfrage/submit/route.ts
  - src/app/api/stripe/checkout/route.ts
  - src/app/(payload)/api/admin/anonymize-customer/route.ts
  # src/migrations/ (1 file)
  - src/migrations/backfill-erlaubte-farben.ts
  # src/payload-globals/ (1 file)
  - src/payload-globals/navigation.ts
  # tests/ (5 files)
  - tests/unit/test-cascade-reset.test.ts
  - tests/unit/test-schemas.test.ts
  - tests/unit/test-filters.test.ts
  - tests/unit/test-cart-store.test.ts
  - tests/unit/test-snapshot.test.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "All user-facing labels, descriptions, placeholders, error messages, and UI strings use real German umlauts (ä, ö, ü, ß instead of ae, oe, ue, ss)"
    - "The anonymization sentinel 'GELÖSCHT' (with ö) is consistent between anonymize-customer/route.ts and anfrage-detail-view.tsx"
    - "No variable names, field names, slugs, or DB columns are changed"
    - "payload-types.ts is not modified"
    - "All existing tests pass with updated mock data"
  artifacts:
    - path: "docs/todos/010_2026-03-18_umlaut-audit.md"
      provides: "Complete audit with all ~297 locations documented"
  key_links:
    - from: "src/app/(payload)/api/admin/anonymize-customer/route.ts"
      to: "src/components/admin/anfrage-detail-view.tsx"
      via: "Anonymization sentinel string must match — both must use 'GELÖSCHT' (with ö)"
      pattern: "GELÖSCHT"
---

<objective>
Replace all ASCII-encoded German umlauts with real umlauts in ~297 locations across ~57 files, as documented in docs/todos/010_2026-03-18_umlaut-audit.md.

Replacements: ae→ä, oe→ö, ue→ü, Ae→Ä, Oe→Ö, Ue→Ü, ss→ß (only in specific words like Strasse→Straße, Masse→Maße, Aussen→Außen, Weiss→Weiß).

Purpose: All user-facing text should display correct German characters.
Output: All files corrected, tests passing.
</objective>

<execution_context>
@/Users/janisjankewitz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/janisjankewitz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@docs/todos/010_2026-03-18_umlaut-audit.md — THE source of truth. Contains every file, line number, exact before/after for all ~297 corrections. Read this file COMPLETELY before starting. Work through it file-by-file, section-by-section.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply all umlaut corrections across src/ files</name>
  <files>All ~52 src/ files listed in files_modified above</files>
  <action>
Read docs/todos/010_2026-03-18_umlaut-audit.md completely. Then work through EVERY file listed in the audit, applying the EXACT corrections from the "Aktuell" column to the "Korrektur" column.

**Strategy:** Process the audit file-by-file in the order listed. For each file:
1. Read the file
2. Apply ALL corrections listed for that file using the Edit tool
3. Move to the next file

**Replacement patterns (ae→ä, oe→ö, ue→ü, ss→ß in specific words):**
- Gueltig → Gültig, Fluegelanzahl → Flügelanzahl, Fluegel → Flügel
- Oeffnungsart → Öffnungsart, Hoehe → Höhe, loeschen → löschen, erhoehen → erhöhen, moechten → möchten, koennen → können, moeglich → möglich
- waehlen → wählen, Aenderung → Änderung, Flaeche → Fläche, Qualitaet → Qualität, Waermedaemmung → Wärmedämmung, Erklaerung → Erklärung, Bestaetigung → Bestätigung, Bestaetigt → Bestätigt
- Masse → Maße, Aussen → Außen, Strasse → Straße, Weiss → Weiß, schliessen → schließen
- Zurueck → Zurück, verfuegbar → verfügbar, hinzufuegen → hinzufügen, gewuenscht → gewünscht, endgueltig → endgültig, pruefen → prüfen, gueltig → gültig, Ueberschrift → Überschrift
- fuer → für, ueber → über, Tueren → Türen, Beschlaege → Beschläge, Rueckfrage → Rückfrage
- GELOESCHT → GELÖSCHT

**What to change:** label values, description values, UI text strings, placeholder strings, error messages, aria-label values, singular/plural collection names, seed data name/beschreibung values, German-text comments (including JSX comments).

**What NOT to change (CRITICAL):**
- Variable names (fluegelanzahl, oeffnungsart, fuer_aussen etc.) — stay ASCII
- Field slug values (value: 'bestaetigt', value: 'rueckfrage', value: 'beschlaege', value: 'vsg_aussen') — stay ASCII
- DB column names, import names, function names — stay ASCII
- src/payload-types.ts — auto-generated, never touch
- Error keys as machine identifiers (e.g. 'ungueltig' in discount-validator.ts)

**CRITICAL SPECIAL CASE — GELOESCHT → GELÖSCHT sentinel (must be atomic):**

In `src/app/(payload)/api/admin/anonymize-customer/route.ts`:
- Change ALL 21 instances of the string 'GELOESCHT' to 'GELÖSCHT' (lines 70-71, 94-101, 121-128, 149-150)
- Change line 11 comment text from 'GELOESCHT' to 'GELÖSCHT'
- Also fix: 'Nur Admins koennen Kundendaten anonymisieren' → 'Nur Admins können Kundendaten anonymisieren' (line 26)
- Also fix: 'Ungueltige Eingabe' → 'Ungültige Eingabe' (line 44)

In `src/components/admin/anfrage-detail-view.tsx`:
- Change line 68 confirm dialog text from "GELOESCHT" to "GELÖSCHT"
- Change line 376 comparison from !== 'GELOESCHT' to !== 'GELÖSCHT'
- Plus all other fixes in this file (Bestätigt, Rückfrage, Zurück, Maße, Flügel, Außen)

These MUST be changed together or the anonymization detection breaks.

**Line number note:** The audit documented line numbers at time of writing. Some have drifted (documented in Runde-3 corrections). Use the TEXT CONTENT (Aktuell column) to locate the correct line, not just the line number.
  </action>
  <verify>
    <automated>cd "/Users/janisjankewitz/Desktop/Arbeitsbereich/02_Programmierung/Christ Fensterhandel/playground/02-christ-fensterhandel-gsd" && rg -l "Gueltig|Fluegelanzahl|Oeffnungsart[^a-z]|Stueckzahl|Aenderung|Bestaetigt|Rueckfrage|Zurueck[^a-z]|Aussenfarbe|GELOESCHT|Datenschutzerklaerung|Ungueltige|endgueltige|verfuegbar[^a-z]|hinzufuegen|waehlen[^a-z]|Waehlen|fuer Ihr|Qualitaet|Ueberschrift|Beschlaege|Hoehe \(mm\)|Masse eingeben|Strasse \+" -- src/ 2>/dev/null | grep -v payload-types.ts || echo "ALL CLEAN - no remaining ASCII umlauts in src/"</automated>
  </verify>
  <done>All ~271 locations in src/ files have real German umlauts. The GELÖSCHT sentinel value is consistent between anonymize-customer/route.ts and anfrage-detail-view.tsx. No variable names, field names, slugs, or DB columns were modified. payload-types.ts untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Fix test mock data and verify all tests pass</name>
  <files>tests/unit/test-cascade-reset.test.ts, tests/unit/test-schemas.test.ts, tests/unit/test-filters.test.ts, tests/unit/test-cart-store.test.ts, tests/unit/test-snapshot.test.ts</files>
  <action>
Apply umlaut corrections to all 5 test files as documented in the audit (26 fixes total).

**tests/unit/test-cascade-reset.test.ts** (3 comment fixes):
- Line 6: Fluegel → Flügel, Oeffnung → Öffnung in comment
- Line 12: Masse → Maße in comment
- Line 18: Fluegel → Flügel, Oeffnung → Öffnung in comment

**tests/unit/test-schemas.test.ts** (1 fix):
- Line 5: 'Step 7 - Masse validation' → 'Step 7 - Maße validation'

**tests/unit/test-filters.test.ts** (16 fixes):
- Line 89: name: 'Balkontuer' → 'Balkontür' (mock data display name)
- Line 168: name: 'Weiss' → 'Weiß' (mock data display name)
- Line 248: 'Fluegelanzahl' → 'Flügelanzahl' in describe()
- Line 249: '1- and 2-fluegelig' → '1- and 2-flügelig' in it()
- Line 255: '1-fluegelig for Balkontuer' → '1-flügelig for Balkontür' in it()
- Line 263: 'Oeffnungsarten' → 'Öffnungsarten' in describe()
- Line 264: 'fuer_fenster' → 'für_fenster' in it() description (but NOT the actual property access)
- Line 270: 'Balkontuer (Kipp is fuer_balkontuer=false)' → 'Balkontür (Kipp is für_balkontür=false)' in it()
- Line 278: 'Fluegel + Oeffnungsart' → 'Flügel + Öffnungsart' in describe()
- Line 279: '1-fluegel + Dreh' → '1-flügel + Dreh' in it()
- Line 289: '2-fluegel (Rundbogen only allows 1-fluegel)' → '2-flügel (Rundbogen only allows 1-flügel)' in it()
- Line 304: 'Material + aussen/innen' → 'Material + außen/innen' in describe()
- Line 305: 'Kunststoff fuer_aussen' → 'Kunststoff für_außen' in it()
- Line 308: 'Weiss + Anthrazit both fuer_aussen + Kunststoff' → 'Weiß + Anthrazit both für_außen + Kunststoff' in comment
- Line 309: 'Only Weiss fuer_innen' → 'Only Weiß für_innen' in comment
- Line 312: 'only Weiss for Aluminium' → 'only Weiß for Aluminium' in it()

**tests/unit/test-cart-store.test.ts** (3 fixes):
- Line 39: fluegelanzahl: '2-fluegelig' → '2-flügelig' (resolvedNames display value)
- Line 41: farbeAussen: 'Weiss' → 'Weiß'
- Line 42: farbeInnen: 'Weiss' → 'Weiß'

**tests/unit/test-snapshot.test.ts** (3 fixes):
- Line 29: fluegelanzahl: '1-fluegelig' → '1-flügelig'
- Line 32: farbeAussen: 'Weiss' → 'Weiß'
- Line 33: farbeInnen: 'Weiss' → 'Weiß'

IMPORTANT: Only change display text, describe/it strings, and comment text. Do NOT change actual mock data property KEYS or values that represent DB field names/slugs (those stay ASCII).

After all test files are updated, run `npm test` to verify everything passes. If snapshot tests fail because snapshots reference old strings, update the snapshots with `npm test -- -u`.
  </action>
  <verify>
    <automated>cd "/Users/janisjankewitz/Desktop/Arbeitsbereich/02_Programmierung/Christ Fensterhandel/playground/02-christ-fensterhandel-gsd" && npm test 2>&1 | tail -30</automated>
  </verify>
  <done>All 5 test files have corrected umlauts in mock data display values and descriptive strings. npm test passes with 0 failures.</done>
</task>

</tasks>

<verification>
1. Scan for remaining ASCII umlauts: `rg "Gueltig|Fluegelanzahl|Oeffnungsart[^a-z]|GELOESCHT|Bestaetigt|Zurueck|waehlen|Ueberschrift|Strasse \+" -- src/ tests/ | grep -v payload-types.ts` should return 0 matches
2. Verify GELÖSCHT consistency: `rg "GELÖSCHT" src/` should match ONLY in anonymize-customer/route.ts and anfrage-detail-view.tsx. `rg "GELOESCHT" src/` should return 0 matches.
3. Verify no code breakage: `npm test` passes
4. Verify scope: `git diff --stat` shows only the ~57 documented files, NOT payload-types.ts
</verification>

<success_criteria>
- All ~297 documented umlaut corrections applied across ~57 files
- GELÖSCHT (with ö) sentinel is consistent in both anonymize-customer/route.ts and anfrage-detail-view.tsx
- payload-types.ts untouched
- No variable names, field names, slugs, or DB columns modified
- npm test passes with 0 failures
- rg scan for common ASCII-umlaut patterns returns 0 hits in src/ and tests/ (excluding payload-types.ts)
</success_criteria>

<output>
After completion, create `.planning/quick/260318-uog-umlaut-korrektur-ae-oe-ue-zu-echten-umla/260318-uog-SUMMARY.md`
</output>
