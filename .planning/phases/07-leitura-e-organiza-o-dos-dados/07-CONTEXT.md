# Phase 7: leitura e organização dos dados — Context

**Gathered:** 2026-04-26  
**Status:** Discussed (ready for planning)  
**Depends on:** Phase 6

## Phase boundary

Evoluir o fluxo de leitura/organização das partidas para incluir um estado de intenção de ausência:

- jogador pode marcar **"Não irei"** mesmo sem estar inscrito;
- jogador inscrito mantém ação de **desinscrever da partida**;
- UI e APIs devem refletir claramente diferença entre "ausente" e "inscrito".

Fora de escopo desta fase:

- nova lógica de formação de times baseada em ausências;
- notificações push/e-mail;
- mudanças de autenticação.

## Decisões (locked)

1. **Nova ação de ausência na UI:** adicionar opção "Não irei" para partidas visíveis ao usuário.
2. **Pré-inscrição permitida:** usuário pode votar ausência sem inscrição prévia.
3. **Pós-inscrição mantém desinscrição:** após inscrito, ação principal continua sendo desinscrever da partida.
4. **Convivência de estados proibida:** o mesmo usuário não deve ficar simultaneamente "inscrito" e "não irei" na mesma partida.

## Assumptions to validate in planning

- Persistência do "Não irei": novo status em `Registration` vs nova entidade dedicada.
- Regra de precedência de ações quando usuário alterna entre "Não irei" e "Inscrever".
- Impacto de ausência em contadores mostrados na lista (se entra ou não na noção de "vai dar jogo").
- Exibição de agregados por partida (ex.: "X vão / Y não vão / Z indefinidos").

## Canonical references

- `.planning/ROADMAP.md` — Phase 7
- `apps/web-jogador/app/(app)/page.tsx` — listagem com ações
- `apps/web-jogador/components/organisms/match-card.tsx` — botões por item
- `apps/api/src/registrations/registrations.controller.ts` — endpoints de inscrição/cancelamento
- `apps/api/prisma/schema.prisma` — modelos e enums de persistência

## Deferred ideas

- RSVP com mais estados ("talvez", "atrasado", etc.).
- Fecho automático por quórum mínimo de presença.

---

*Phase: 07-leitura-e-organiza-o-dos-dados*
