# Phase 4: Geração de times A/B — Context

## Goal

Persistir **dois times** (`Team` A e B) e `TeamPlayer` quando existem exatamente `maxPlayers` inscrições `CONFIRMED`, respeitando `MatchMode`:

- **ALTERNATED** — intercalar pela ordem de fila (`queueOrder` ascendente).
- **DRAW_AT_END** — baralhar o conjunto confirmado e partir ao meio (v1: `Math.random`; v2: `DRAW-01` seed).

## Preconditions

- Fase 3 entrega inscrições e contagens corretas de titulares.
- `maxPlayers` par (RULE-01) garante divisão equilibrada em dois times.

## API

- `POST /matches/:matchId/teams/generate` com `X-Organizer-User-Id` (mesmo contrato que criar partida).
- Erros: `WrongConfirmedCountForTeamsError`, `TeamsAlreadyGeneratedError`, `MatchNotFoundError`.

## Out of scope (v1)

- Mudança automática de `MatchStatus` após gerar times.
- Atribuição de organizador “dono” da partida (não existe no schema).

---
*Phase: 04-geracao-de-times-a-b*
