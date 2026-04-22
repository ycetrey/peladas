---
phase: 02-partidas-criacao-leitura-e-erros-de-negocio
plan: 01
subsystem: api
tags: nestjs, errors, jest

requires:
  - phase: 01
    provides: Nest shell + Prisma
provides:
  - DomainError hierarchy + DomainExceptionFilter
  - Jest + smoke unit test for error JSON
affects:
  - phase-02-plans-02-02-03

tech-stack:
  added: ["jest", "ts-jest", "@nestjs/testing", "supertest", "class-validator", "class-transformer"]
  patterns: ["Global DomainExceptionFilter", "Stable { error: { code, message } }"]

key-files:
  created:
    - apps/api/src/common/errors/domain-errors.ts
    - apps/api/src/common/filters/domain-exception.filter.ts
    - apps/api/src/common/filters/domain-exception.filter.spec.ts
    - apps/api/jest.config.cjs
    - apps/api/jest-e2e.config.cjs
  modified:
    - apps/api/src/main.ts
    - apps/api/package.json
    - apps/api/tsconfig.build.json

key-decisions:
  - "MatchNotFoundError maps to HTTP 404; other DomainError to 400"

patterns-established:
  - "Business errors extend DomainError with readonly code matching class name"

requirements-completed:
  - ERR-01

duration: 15min
completed: 2026-04-23
---

# Phase 2 — Plan 01 summary

**Contrato ERR-01 implementado com filtro global e testes Jest mínimos.**

## Performance

- **Tasks:** 3
- **Files created:** 5+

## Accomplishments

- Classes de erro nomeadas e `DomainExceptionFilter` com JSON estável
- `ValidationPipe` global + filtro em `main.ts`
- Scripts `test` / `test:e2e` e exclusão de specs do `tsconfig.build.json`

## Verification

- `pnpm --filter @peladas/api run build` — OK
- `pnpm --filter @peladas/api run test` — OK

## Self-Check: PASSED
