---
phase: 02-partidas-criacao-leitura-e-erros-de-negocio
plan: 03
subsystem: api
tags: nestjs, prisma, supertest

requires:
  - phase: 02-01
    provides: Error filter
  - phase: 02-02
    provides: MatchRulesService
provides:
  - POST/GET matches + organizer guard
  - E2E smoke + README curl examples
affects:
  - phase-03

tech-stack:
  added: ["@types/express"]
  patterns: ["X-Organizer-User-Id guard on POST only", "List GET before :id"]

key-files:
  created:
    - apps/api/src/matches/matches.module.ts
    - apps/api/src/matches/matches.controller.ts
    - apps/api/src/matches/matches.service.ts
    - apps/api/src/matches/organizer-user.guard.ts
    - apps/api/src/matches/dto/create-match.dto.ts
    - apps/api/src/matches/request-with-organizer.ts
    - apps/api/src/matches/matches.e2e-spec.ts
  modified:
    - apps/api/src/app.module.ts
    - README.md

key-decisions:
  - "Create match persists status OPEN"
  - "GET list/detail public; POST requires organizer header"

patterns-established:
  - "RequestWithOrganizer typing for guard + controller"

requirements-completed:
  - MAT-01
  - MAT-02
  - API-01
  - API-02
  - API-03

duration: 25min
completed: 2026-04-23
---

# Phase 2 — Plan 03 summary

**Módulo HTTP de partidas com Prisma, guard de organizador, e2e e documentação.**

## Verification

- `pnpm --filter @peladas/api run build` — OK
- `pnpm --filter @peladas/api run test:e2e` — OK (com `DATABASE_URL`)

## Self-Check: PASSED
