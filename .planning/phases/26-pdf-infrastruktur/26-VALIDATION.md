---
phase: 26
slug: pdf-infrastruktur
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) + manual API testing |
| **Config file** | `vitest.config.ts` (existing) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | PDF-01 | unit | `npx vitest run src/lib/pdf` | ❌ W0 | ⬜ pending |
| 26-01-02 | 01 | 1 | PDF-01 | unit | `npx vitest run src/lib/pdf` | ❌ W0 | ⬜ pending |
| 26-02-01 | 02 | 1 | PDF-02 | unit | `npx vitest run src/lib/pdf` | ❌ W0 | ⬜ pending |
| 26-02-02 | 02 | 1 | PDF-03 | unit | `npx vitest run src/lib/pdf` | ❌ W0 | ⬜ pending |
| 26-02-03 | 02 | 1 | PDF-04 | unit | `npx vitest run src/lib/pdf` | ❌ W0 | ⬜ pending |
| 26-03-01 | 03 | 2 | PDF-05 | integration | `npx vitest run src/collections` | ❌ W0 | ⬜ pending |
| 26-04-01 | 04 | 2 | PDF-06 | manual | Manual: Download via Admin UI | N/A | ⬜ pending |
| 26-05-01 | 05 | 3 | PDF-07 | integration | `npx vitest run src/lib/email` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/pdf/__tests__/render-pdf.test.ts` — stubs for PDF-01 (renderPDF helper)
- [ ] `src/lib/pdf/__tests__/templates.test.ts` — stubs for PDF-02, PDF-03, PDF-04 (template rendering)
- [ ] `src/collections/__tests__/rechnungen.test.ts` — stubs for PDF-05 (collection immutability)
- [ ] `src/lib/email/__tests__/attachments.test.ts` — stubs for PDF-07 (base64 attachment)

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF visual layout correct | PDF-02, PDF-03, PDF-04 | Visual verification of layout, fonts, alignment | Open PDF-Preview route /api/pdf-preview/angebot, /rechnung, /gutschrift and visually inspect |
| Admin download button works | PDF-06 | UI interaction in Payload Admin | Navigate to Anfrage Detail View, click download button, verify PDF opens |
| Kunden-Dashboard download | PDF-06 | UI interaction in customer portal | Log in as customer, navigate to documents, click download |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
