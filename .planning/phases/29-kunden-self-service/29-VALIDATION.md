---
phase: 29
slug: kunden-self-service
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (via Next.js) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern=kunden` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=kunden`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | KUND-01 | unit | `grep -c 'kundenantwort' src/lib/status-config.ts` | TBD | ⬜ pending |
| 29-01-02 | 01 | 1 | KUND-02 | unit | `grep -c 'stornierung_beantragt' src/lib/status-config.ts` | TBD | ⬜ pending |
| 29-02-01 | 02 | 1 | KUND-01 | integration | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/kunden/antwort` | TBD | ⬜ pending |
| 29-02-02 | 02 | 1 | KUND-02 | integration | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/kunden/storno` | TBD | ⬜ pending |
| 29-03-01 | 03 | 2 | KUND-03 | unit | `test -f src/collections/business/reklamationen.ts` | TBD | ⬜ pending |
| 29-03-02 | 03 | 2 | KUND-03 | integration | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/kunden/reklamation` | TBD | ⬜ pending |
| 29-04-01 | 04 | 2 | KUND-04 | unit | `test -f src/app/\\(frontend\\)/kunden/passwort-vergessen/page.tsx` | TBD | ⬜ pending |
| 29-04-02 | 04 | 2 | KUND-04 | integration | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/kunden/passwort-vergessen` | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test framework setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rueckfrage-Banner Formular toggle | KUND-01 | UI interaction | Open dashboard with status rueckfrage, click "Jetzt antworten", verify form appears inline |
| Gast-Route Rueckfrage | KUND-01 | E2E with UUID | Navigate to /rueckfrage/[valid-uuid], verify form renders with admin message |
| Storno Confirm-Dialog | KUND-02 | UI interaction | Open detail view, click "Stornierung beantragen", verify dialog with textarea |
| Reklamation Foto-Upload | KUND-03 | File upload | Submit reklamation with 5 photos, verify thumbnails appear |
| Passwort-Reset E-Mail | KUND-04 | Email delivery | Request reset, verify email arrives via E-Mail-Queue with correct template |
| Passwort-Reset Token-Ablauf | KUND-04 | Time-based | Use expired token, verify error message + "Neuen Link anfordern" link |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
