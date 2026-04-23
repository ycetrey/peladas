---
phase: 03-inscricoes-fila-e-cancelamento
plan: 02
subsystem: api
tags: [nestjs, prisma, supertest, e2e, guards]

requires:
  - phase: 02-partidas-criacao-leitura-e-erros-de-negocio
    provides: Nest HTTP stack, Match CRUD, ERR-01 domain filter
provides:
  - POST/DELETE inscrições com X-Player-User-Id
  - cancelamento de titular com promoção do primeiro SUBSTITUTE (queueOrder)
  - e2e de duplicata e promoção
affects:
  - Phase 4 (geração de times depende de confirmados)

tech-stack:
  added: []
  patterns:
    - Guard de jogador por header UUID espelhando organizador

key-files:
  created:
    - apps/api/src/registrations/registrations.service.ts
    - apps/api/src/registrations/registrations.controller.ts
    - apps/api/src/registrations/registrations.module.ts
    - apps/api/src/registrations/player-user.guard.ts
    - apps/api/src/registrations/request-with-player.ts
    - apps/api/src/registrations/dto/register-player.dto.ts
    - apps/api/src/registrations/registrations.e2e-spec.ts
  modified:
    - apps/api/src/app.module.ts
    - README.md

key-decisions:
  - Sem inscrição ativa no cancelamento: InvalidMatchStateError com mensagem fixa acordada no plano

patterns-established:
  - Rotas aninhadas `matches/:matchId/registrations` e `.../me` para cancelar o contexto do jogador

requirements-completed: [REG-01, REG-02, REG-03, API-04, API-05]

duration: —
completed: 2026-04-22
---

# Phase 3 (plan 03-02): HTTP inscrições e cancelamento

**Endpoints Nest com `X-Player-User-Id`, inscrição com posição preferida, duplicata recusada e cancelamento transacional com promoção de reserva.**

## Performance

- **Duration:** —
- **Tasks:** conforme `03-02-PLAN.md`
- **Files modified:** vários em `registrations/`

## Accomplishments

- `POST /matches/:matchId/registrations` e `DELETE /matches/:matchId/registrations/me`.
- Teste e2e cobre duplicata (400) e promoção de SUBSTITUTE → CONFIRMED após cancelamento do titular.

## Task Commits

_A consolidar no repositório local._

## Files Created/Modified

- `apps/api/src/registrations/*` — módulo completo de inscrições
- `apps/api/src/app.module.ts` — importa `RegistrationsModule`
- `README.md` — secção API Inscrições com curl e cabeçalhos

## Decisions Made

- Retorno de `register` tipado com `{ registration: Registration }` do Prisma para simplicidade.
- Depende logicamente do plano **03-01** (`RegistrationRulesService`, `NoRegistrationSlotsError`) na mesma fase.

## Deviations from Plan

None - plan executed as specified.

## Issues Encountered

None no código; ambiente local pode falhar `pnpm` via Corepack (assinatura) — build/test com `npx` em `apps/api` validou.

## User Setup Required

E2e: `DATABASE_URL` para Postgres; `SKIP_E2E=1` para saltar em CI sem DB.

## Next Phase Readiness

API expõe inscrições confirmadas/reservas com `queueOrder` para fase de times.

---
*Phase: 03-inscricoes-fila-e-cancelamento*
*Completed: 2026-04-22*
