---
phase: 2
slug: 02-partidas-criacao-leitura-e-erros-de-negocio
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 2 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + supertest |
| **Config file** | `apps/api/package.json` (`jest` section) |
| **Quick run command** | `pnpm --filter @peladas/api exec jest --passWithNoTests` |
| **Full suite command** | `pnpm --filter @peladas/api exec jest` |
| **Estimated runtime** | ~30 seconds |

## Sampling Rate

- **After every task commit:** `pnpm --filter @peladas/api exec nest build`
- **After every plan wave:** Quick Jest command above
- **Before `/gsd-verify-work`:** Full Jest + build green

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 02-01 | 1 | ERR-01 | T-02-01 | No stack in JSON body | unit | `pnpm --filter @peladas/api exec jest errors` | ⬜ W0 | ⬜ pending |
| 02-02-01 | 02-02 | 2 | RULE-01 | T-02-02 | Reject odd maxPlayers | unit | `pnpm --filter @peladas/api exec jest match-rules.service.spec` | ⬜ | ⬜ pending |
| 02-03-01 | 02-03 | 3 | API-01..03 | T-02-03 | Header on POST | e2e | `pnpm --filter @peladas/api exec jest matches.e2e-spec` | ⬜ | ⬜ pending |

## Wave 0 Requirements

- [ ] `apps/api` Jest + ts-jest (ou preset Nest) configurado
- [ ] Primeiro ficheiro `*.spec.ts` para filtro de erros

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| curl contra API em Docker | API-01 | Opcional se CI sem compose | `docker compose up -d db api` + `curl` com `X-Organizer-User-Id` |

## Validation Sign-Off

- [ ] Todos os planos têm `<automated>` ou nota manual
- [ ] `nyquist_compliant: true` após execução bem-sucedida

**Approval:** pending
