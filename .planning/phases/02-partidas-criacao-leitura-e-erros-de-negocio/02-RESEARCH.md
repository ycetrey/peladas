# Phase 2 — Technical Research

**Phase:** Partidas — criação, leitura e erros de negócio  
**Date:** 2026-04-22

## RESEARCH COMPLETE

## Stack and patterns

- **NestJS 10** já no monorepo; extensão natural: `MatchesModule`, controller dedicado, serviço de domínio + Prisma.
- **Validação RULE-01:** implementar regras em serviço puro (`MatchRulesService.validateCreate`) invocado antes de `prisma.match.create` — facilita testes unitários sem HTTP.
- **DTO:** `class-validator` + `ValidationPipe` global ou por rota para campos de entrada; regras compostas (datas, paridade `maxPlayers`) no serviço de regras para mensagens de erro alinhadas a ERR-01.

## Error handling (ERR-01)

- **Opção escolhida (ver CONTEXT D-03):** classes de erro que estendem `Error` (ou base comum `DomainError`) + `ExceptionFilter` Nest que captura instâncias e serializa `{ error: { code, message } }`.
- **Alternativa descartada nesta fase:** RFC 7807 completo — mais verboso; pode evoluir em v2.

## Prisma

- Modelo `Match` já cobre campos MAT-01; **sem alteração de schema** esperada se o modelo atual já inclui `recurringRule` opcional e janelas — confirmar no `schema.prisma` antes de planear migração.

## Testing

- Introduzir **Jest** + `@nestjs/testing` + `supertest` em `apps/api` para testes de integração HTTP do módulo de partidas e unitários do `MatchRulesService`.

---

## Validation Architecture

| Dimension | How this phase satisfies it |
|-----------|-------------------------------|
| 1 Contract | Plans reference REQ-IDs and D-XX; acceptance criteria cite strings HTTP e JSON |
| 2 Coverage | MatchRulesService unit tests + e2e smoke POST/GET |
| 3 Isolation | DB tests use test container ou SQLite dev-only — **v1:** documentar execução contra Postgres compose com DB de teste opcional |
| 4 Determinism | Fixed seed users for organizer id in tests |
| 5 Speed | `pnpm --filter @peladas/api test` target &lt; 60s |
| 6 CI | Same command as local |
| 7 Security | threat_model em cada PLAN; não logar UUIDs sensíveis em prod |
| 8 Feedback | Após cada onda: `nest build` + `test` |

**Wave 0:** Adicionar dependências de teste e um spec mínimo que falha se o filtro de erros não estiver registado (opcional: smoke).

---

## References consulted

- NestJS Exception filters: https://docs.nestjs.com/exception-filters
- class-validator: https://github.com/typestack/class-validator
