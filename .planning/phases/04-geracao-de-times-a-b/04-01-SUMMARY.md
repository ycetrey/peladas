---
phase: 04-geracao-de-times-a-b
plan: 01
subsystem: api
tags: [nestjs, jest, prisma-enums]

requires:
  - phase: 03-inscricoes-fila-e-cancelamento
    provides: CONFIRMED registrations com queueOrder
provides:
  - TeamAssignmentService (lógica RULE-04)
  - Erros WrongConfirmedCountForTeamsError, TeamsAlreadyGeneratedError (pré-condições)
affects:
  - 04-02 HTTP + Prisma write

tech-stack:
  added: []
  patterns:
    - Alocação pura antes de persistência; rng injetável para testes DRAW_AT_END

key-files:
  created:
    - apps/api/src/teams/team-assignment.service.ts
    - apps/api/src/teams/team-assignment.service.spec.ts
  modified:
    - apps/api/src/common/errors/domain-errors.ts

key-decisions:
  - Fisher–Yates com callback rng() para DRAW_AT_END (v1 não auditável)

patterns-established:
  - Intercalação ALTERNATED pelo índice na lista já ordenada por queueOrder

requirements-completed: [RULE-04, ERR-01]

duration: —
completed: 2026-04-22
---

# Phase 4 (04-01): alocação A/B

**Serviço puro que mapeia titulares confirmados para slots A/B conforme `MatchMode`, mais erros de domínio para pré-condições de geração.**

## Accomplishments

- ALTERNATED determinístico na ordem da fila.
- DRAW_AT_END com partição equilibrada pós-baralhamento.

## Deviations from Plan

None.

---
*Phase: 04-geracao-de-times-a-b*
