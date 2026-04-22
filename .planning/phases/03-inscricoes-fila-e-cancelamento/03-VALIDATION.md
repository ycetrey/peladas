---
phase: 3
slug: 03-inscricoes-fila-e-cancelamento
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-23
---

# Phase 3 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + supertest (existente em `apps/api`) |
| **Quick run** | `pnpm --filter @peladas/api run test` |
| **E2E** | `pnpm --filter @peladas/api run test:e2e` |

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Automated |
|------|------|------|-------------|-----------|
| Rules spec | 03-01 | 1 | RULE-02, RULE-03 | `jest registration-rules.service.spec.ts` |
| E2E registrations | 03-02 | 2 | API-04, API-05 | `jest registrations.e2e-spec.ts` |

## Manual-Only

| Behavior | Why |
|----------|-----|
| Explorar curl à mão | Opcional se e2e cobre |

## Validation Sign-Off

- [ ] Todos os planos com `<automated>` ou justificação
- [ ] `nyquist_compliant: true` após execução

**Approval:** pending
