---
phase: 1
slug: funda-o-docker-prisma-e-api-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 1 — Validation strategy

> Per-phase validation contract (Nyquist / Dimension 8).

## Test infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (Nest default) in `apps/api` |
| **Config file** | `apps/api/package.json` (jest block) — Wave 0 if missing |
| **Quick run** | `pnpm --filter @peladas/api test` |
| **Full suite** | `pnpm --filter @peladas/api test` + `pnpm --filter @peladas/api exec prisma validate` |
| **Est. runtime** | ~30–120 s |

## Sampling rate

- After every task commit: quick run where tests exist; else `prisma validate`
- After each plan wave: `pnpm -r --filter './apps/*' build` when Docker not required
- Before `/gsd-verify-work`: `docker compose config` + `docker compose build` green

## Per-task verification map

| Task ID | Plan | Wave | Requirement | Test type | Automated command | Status |
|---------|------|------|---------------|-----------|-------------------|--------|
| T-01-01-a | 01-01 | 1 | INFRA-01 | manual | `docker compose config` exits 0 | ⬜ |
| T-01-02-a | 01-02 | 2 | DATA-01, DATA-02 | integration | `pnpm --filter @peladas/api exec prisma migrate deploy` | ⬜ |
| T-01-02-seed | 01-02 | 2 | USR-01 | integration | `pnpm --filter @peladas/api exec prisma db seed` | ⬜ |
| T-01-03-a | 01-03 | 3 | INFRA-02 | smoke | `curl -sf http://127.0.0.1:${API_PORT:-3001}/health` | ⬜ |
| T-01-04-a | 01-04 | 3 | INFRA-03 | smoke | `curl -sf http://127.0.0.1:${WEB_JOGADOR_PORT:-3002}` | ⬜ |

## Wave 0 requirements

- [ ] `apps/api/test/health.e2e-spec.ts` — covers health route
- [ ] `apps/api/prisma/seed.ts` — covers USR-01
- [ ] Root `README.md` — documents single compose command

## Manual-only verifications

| Behavior | Requirement | Why manual | Steps |
|----------|-------------|------------|-------|
| All containers healthy | INFRA-01 | Host Docker UI / timing | Run `docker compose up --build`, open jogador/admin URLs in browser |

## Validation sign-off

- [ ] All plans executed with verify steps
- [ ] `nyquist_compliant: true` after Wave 0 closed

**Approval:** pending
