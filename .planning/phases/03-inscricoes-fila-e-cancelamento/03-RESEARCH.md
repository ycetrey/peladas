# Phase 3 — Technical Research

**Phase:** Inscrições, fila e cancelamento  
**Date:** 2026-04-23

## RESEARCH COMPLETE

## Nest + Prisma

- Segundo `@Controller('matches/:matchId/registrations')` evita colisão com `GET /matches/:id` do `MatchesController`.
- **`$transaction`** com callbacks interactivos Prisma 6 é o padrão para cancelar + promover sem estado intermédio visível fora do TX.
- Guards por header reutilizam o padrão da fase 2 (`OrganizerUserGuard` → `PlayerUserGuard`).

## Regras (C-SPEC-008)

- Contar `CONFIRMED` titulares vs `match.maxPlayers`; `SUBSTITUTE` vs `maxSubstitutes`.
- `UserAlreadyRegisteredError` quando existe registo ativo (`CONFIRMED` ou `SUBSTITUTE`) para o par `(matchId, userId)`.

## Testing

- Unit: `RegistrationRulesService` puro com inputs fabricados (datas, contagens).
- E2E: Postgres + seed users + `POST /matches` (organizer) + múltiplos `POST .../registrations` + `DELETE .../me`.

---

## Validation Architecture

| Dimension | Approach |
|-----------|----------|
| Contract | Plans cite REG/RULE/API IDs; acceptance criteria grepável |
| Coverage | Rules unit + registrations e2e |
| Isolation | E2E uses dedicated match titles prefix `E2E-REG-` + `deleteMany` cleanup |
| Determinism | Fixed UUIDs from seed |
| Speed | `jest --runInBand` for e2e |
| Feedback | `nest build` + `jest` after each wave |

**Wave 0:** Não necessário se Jest já existe na API (fase 2).

---

## References

- [NestJS Transactions](https://docs.nestjs.com/techniques/database#transactions)
- Prisma `$transaction`: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
