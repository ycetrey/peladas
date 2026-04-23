---
phase: 04-geracao-de-times-a-b
plan: 02
subsystem: api
tags: [nestjs, prisma, supertest, transactions]

requires:
  - phase: 02-partidas-criacao-leitura-e-erros-de-negocio
    provides: OrganizerUserGuard, criação de partidas
  - phase: 03-inscricoes-fila-e-cancelamento
    provides: Inscrições CONFIRMED com queueOrder
provides:
  - POST /matches/:matchId/teams/generate (API-06)
  - Persistência Team + TeamPlayer (TEAM-01)
affects:
  - Phase 5 UI jogador (visualização de times, se exposta)
  - Phase 6 UI admin

tech-stack:
  added: []
  patterns:
    - Transação Prisma isolation Serializable para evitar dupla geração concorrente

key-files:
  created:
    - apps/api/src/teams/teams.service.ts
    - apps/api/src/teams/teams.controller.ts
    - apps/api/src/teams/teams.module.ts
    - apps/api/src/teams/teams.e2e-spec.ts
  modified:
    - apps/api/src/app.module.ts
    - apps/api/src/matches/matches.module.ts
    - README.md

key-decisions:
  - Organizador qualquer (header válido) pode gerar — mesmo modelo que POST /matches sem dono no schema

patterns-established:
  - Controller secundário no prefixo `matches` para sub-recurso `teams/generate`

requirements-completed: [API-06, TEAM-01]

duration: —
completed: 2026-04-22
---

# Phase 4 (04-02): HTTP gerar times

**Endpoint autenticado por organizador que cria dois `Team` e `TeamPlayer` numa transação, com e2e para ALTERNATED e contagens DRAW_AT_END.**

## Deviations from Plan

None. Depende do plano **04-01** na mesma fase (`TeamAssignmentService`).

## Issues Encountered

None no código.

---
*Phase: 04-geracao-de-times-a-b*
