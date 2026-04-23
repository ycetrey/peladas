---
phase: 03-inscricoes-fila-e-cancelamento
plan: 01
subsystem: api
tags: [nestjs, prisma, jest, domain-errors]

requires:
  - phase: 02-partidas-criacao-leitura-e-erros-de-negocio
    provides: MatchStatus, domain error base + HTTP mapping, match rules patterns
provides:
  - NoRegistrationSlotsError (ERR-01)
  - RegistrationRulesService (RULE-02, RULE-03) testável
affects:
  - 03-02 HTTP inscrições

tech-stack:
  added: []
  patterns:
    - Regras de inscrição isoladas em serviço puro antes da camada HTTP/Prisma write

key-files:
  created:
    - apps/api/src/registrations/registration-rules.service.ts
    - apps/api/src/registrations/registration-rules.service.spec.ts
  modified:
    - apps/api/src/common/errors/domain-errors.ts

key-decisions:
  - decideStatusForNewRegistration devolve RegistrationStatus (enum Prisma), não strings soltas

patterns-established:
  - assertMatchOpenForRegistration + assertNoActiveDuplicate + decideStatusForNewRegistration como API única para 03-02

requirements-completed: [ERR-01, RULE-02, RULE-03]

duration: —
completed: 2026-04-22
---

# Phase 3 (plan 03-01): regras de inscrição e fila

**Serviço puro de regras (`RegistrationRulesService`) com `NoRegistrationSlotsError`, validação OPEN/janela, duplicata ativa e decisão titular vs reserva.**

## Performance

- **Duration:** —
- **Tasks:** conforme `03-01-PLAN.md`
- **Files modified:** 3

## Accomplishments

- Erro de domínio `NoRegistrationSlotsError` alinhado a ERR-01.
- Cobertura Jest para janela, estado da partida, duplicata e lotação titular/reserva.

## Task Commits

_A consolidar no repositório local (hashes quando existir commit único da fase)._

## Files Created/Modified

- `apps/api/src/common/errors/domain-errors.ts` — `NoRegistrationSlotsError`
- `apps/api/src/registrations/registration-rules.service.ts` — regras RULE-02/RULE-03
- `apps/api/src/registrations/registration-rules.service.spec.ts` — casos de teste

## Decisions Made

- Seguir mensagens e códigos de erro existentes do filtro HTTP para novos `DomainError`.

## Deviations from Plan

None - plan executed as specified.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

Regras prontas para `RegistrationsService` e rotas em 03-02.

---
*Phase: 03-inscricoes-fila-e-cancelamento*
*Completed: 2026-04-22*
