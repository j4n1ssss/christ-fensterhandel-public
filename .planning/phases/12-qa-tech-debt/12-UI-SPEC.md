---
phase: 12
slug: qa-tech-debt
status: draft
shadcn_initialized: true
preset: default (neutral base)
created: 2026-03-20
---

# Phase 12 -- UI Design Contract

> Visual and interaction contract for the Incomplete-Badge admin component. Phase 12 is primarily QA/documentation -- this contract covers the single new UI element (HUB-05) rendered inside the Payload Admin Panel.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (initialized, components.json present) |
| Preset | default, neutral base color |
| Component library | Not applicable -- Payload Admin uses inline styles, not shadcn components |
| Icon library | lucide-react 0.577.0 (already installed) |
| Font | Payload Admin default (system font stack) |

**Context:** Phase 12 adds exactly one visual element -- a Hub-Status Cell component in the Payload Admin list view. All admin components in this project use **inline styles with Payload CSS custom properties** (`var(--theme-elevation-*)`). No Tailwind classes are used inside admin components. This contract follows the established pattern.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Badge inline padding (vertical), gap between badges |
| sm | 8px | Badge inline padding (horizontal), gap between elements |
| md | 16px | Panel padding, section padding |
| lg | 24px | Not used in this phase |
| xl | 32px | Not used in this phase |
| 2xl | 48px | Not used in this phase |
| 3xl | 64px | Not used in this phase |

Exceptions: none

**Source:** Existing admin component patterns -- `profile-history-panel.tsx` uses `padding: "4px 8px"` for badges, `padding: 16` for panels, `gap: 8` for row elements.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Badge label | 12px | 600 (semibold) | 1.2 |
| Tooltip text | 12px | 400 (regular) | 1.4 |

**Note:** Only two typography roles are needed for this phase. The badge font sizing is consistent with existing admin badges:
- `EventBadge` in profile-history-panel.tsx: 11px / 600
- `FieldBadge` in profile-history-panel.tsx: 11px / 600
- `WebhookFehlerBadge`: 13px / implicit 400

The Hub-Status badge uses 12px to be slightly more prominent than field badges (11px) but smaller than body text (13px), matching its role as a status indicator in a list view column.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Complete background | #dcfce7 (green-100) | Background of "Vollstaendig" badge |
| Complete text | #166534 (green-800) | Text color of "Vollstaendig" badge |
| Incomplete background | #fed7aa (orange-200) | Background of "Unvollstaendig" badge |
| Incomplete text | #9a3412 (orange-800) | Text color of "Unvollstaendig" badge |
| Tooltip background | var(--theme-elevation-900) | Tooltip background (dark) |
| Tooltip text | var(--theme-elevation-0) | Tooltip text (light on dark) |

**60/30/10 split:** Not applicable -- this phase adds a single badge element inside the Payload Admin Panel. The Admin Panel controls its own surface/secondary/accent colors via `var(--theme-elevation-*)`. The badge colors above are semantic status indicators only.

**Accent reserved for:** The green/orange colors are used EXCLUSIVELY for the Hub-Status badge. No other element in this phase uses these colors.

**Source:** CONTEXT.md locked decision: "Gruener Tag 'Vollstaendig' vs. oranger/roter Tag 'Unvollstaendig'". Hex values chosen to match the project's existing semantic color patterns -- `WebhookFehlerBadge` uses `#fef2f2` / `#991b1b` (red). The green/orange pair provides clear differentiation from the red error pattern.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Complete badge label | "Vollstaendig" |
| Incomplete badge label | "Unvollstaendig" |
| Complete tooltip | "Alle Pflicht-Hub-Felder befuellt" |
| Incomplete tooltip | "Fehlend: {comma-separated field names}" |
| Column header | "Hub-Status" |
| Loading state | "Lade Historie..." (existing, no change) |
| Error state (history panel) | "Historie konnte nicht geladen werden." (existing, no change) |
| Empty state (history panel) | "Noch keine Aenderungen protokolliert." (existing, no change) |

**Incomplete tooltip example:** "Fehlend: erlaubte_oeffnungsarten, erlaubte_verglasungen"

**Destructive actions:** None in this phase. No delete, reset, or irreversible operations.

**Source:** CONTEXT.md locked decisions for badge labels and tooltip content.

---

## Component Inventory

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| ProfileHubStatusCell | New | src/components/admin/profile-hub-status-cell.tsx | Custom Cell for Hub-Status column in Profile list view |

### ProfileHubStatusCell Specification

**Render context:** Payload Admin list view table cell for the Profile collection.

**Props:** `CellComponentProps` from Payload (includes `rowData` with full document data).

**States:**

| State | Visual |
|-------|--------|
| Complete (all 5 required Hub fields populated) | Green badge: #dcfce7 background, #166534 text, "Vollstaendig" |
| Incomplete (1+ required Hub fields empty) | Orange badge: #fed7aa background, #9a3412 text, "Unvollstaendig" |

**Required Hub fields** (single source of truth -- import from validate-hub-fields.ts):
1. `erlaubte_fluegelanzahl`
2. `erlaubte_oeffnungsarten`
3. `erlaubte_fensterformen`
4. `erlaubte_farben`
5. `erlaubte_verglasungen`

**Completeness check:** A field is "populated" when `Array.isArray(value) && value.length > 0`. Hub fields with `maxDepth: 0` are stored as string ID arrays.

**Badge dimensions:**
- Padding: 2px 8px (vertical/horizontal)
- Border-radius: 4px
- Font: 12px, weight 600
- Display: inline-block

**Tooltip:**
- Native HTML `title` attribute (no custom tooltip component)
- Complete: "Alle Pflicht-Hub-Felder befuellt"
- Incomplete: "Fehlend: erlaubte_oeffnungsarten, erlaubte_verglasungen" (dynamic list)

**No interactions:** The badge is display-only. No click handler, no expand/collapse.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none (this phase) | not required |
| Third-party | none | not applicable |

**Note:** Phase 12 adds no shadcn components. The Hub-Status badge is a custom Payload Admin Cell component using inline styles, consistent with all other admin components in this project.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
