---
phase: 08
slug: base-de-dados-mock-e-depend-ncias-de-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 08 — Validation Strategy

> Validação focada em **build**, **Storybook** e **smoke E2E** com dados estáveis de `@peladas/fixtures`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js build + Storybook 8 + Playwright |
| **Config file** | `playwright.config.ts` (raiz), `.storybook/main.ts` (por app) |
| **Quick run command** | `pnpm --filter @peladas/web-jogador build` e `pnpm --filter @peladas/web-admin build` |
| **Full suite command** | Quick + `pnpm exec playwright test` (com `PLAYWRIGHT_BASE_URL` definido) + storybook build |
| **Estimated runtime** | ~2–6 min (local; CI varia com cache) |

---

## Sampling Rate

- **Após ondas do plano 08-01:** Quick run em ambos os apps.
- **Após plano 08-02:** Storybook build + Playwright (quando env disponível).
- **Antes de UAT:** Builds verdes + storybook build verde.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-T1 | 01 | 1 | — | T-08-01 | Sem segredos em fixtures | manual grep | `rg -i secret packages/fixtures` | ⬜ | ⬜ pending |
| 08-01-Tn | 01 | 1 | — | — | N/A | build | `pnpm --filter @peladas/web-jogador build` | ⬜ | ⬜ pending |
| 08-02-T1 | 02 | 1 | — | — | N/A | storybook | `pnpm --filter @peladas/web-jogador exec storybook build` | ⬜ | ⬜ pending |
| 08-02-Tn | 02 | 1 | — | — | N/A | e2e | `pnpm exec playwright test` | ⬜ | ⬜ pending |

---

## Wave 0 Requirements

- **Existing infrastructure:** Jest/e2e na API não cobre front; Wave 0 = instalar Storybook + Playwright conforme plano 08-02.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual parity migração | UI-SPEC | Olho humano / Percy futuro | Comparar lista e detalhe jogador antes/depois da migração incremental |

---

## Validation Sign-Off

- [ ] Todos os planos têm `<automated>` verify ou nota manual explícita
- [ ] Storybook build na CI
- [ ] `nyquist_compliant: true` após execução

**Approval:** pending
