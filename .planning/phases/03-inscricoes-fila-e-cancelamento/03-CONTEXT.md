# Phase 3: Inscrições, fila e cancelamento - Context

**Gathered:** 2026-04-23  
**Status:** Ready for planning  
**Source:** `/gsd-discuss-phase 3` (batch — decisões inferidas de `ROADMAP.md`, `REQUIREMENTS.md`, `intel/constraints.md`, `02-CONTEXT.md`)

<domain>
## Phase Boundary

API NestJS: **inscrever** jogador em partida `OPEN` dentro da janela (REG-01, RULE-02, RULE-03, API-04); **bloquear** segunda inscrição ativa (REG-02, `UserAlreadyRegisteredError`); **cancelar** inscrição com promoção do primeiro reserva (REG-03, API-05). Sem UI Next.js, sem geração de times.

</domain>

<decisions>
## Implementation Decisions

### Identidade do jogador (v1)

- **D-01:** Cabeçalho **`X-Player-User-Id`** (UUID de `User` existente). Guard dedicado (`PlayerUserGuard`) valida presença, formato e existência em Prisma; falhas → `401` Nest (igual ao padrão do organizador na fase 2).

### Rotas HTTP (API-04 / API-05)

- **D-02:** `RegistrationsController` com prefixo de rota **`matches/:matchId/registrations`**: `POST` corpo `{ "preferredPosition": "<enum>" }` cria inscrição; **`DELETE me`** cancela a inscrição **ativa** do jogador autenticado pelo header nesta partida.
- **D-03:** Não expor `PATCH` genérico de estado nesta fase; cancelamento é o único mutador além do `POST`.

### Regras e erros

- **D-04:** Reutilizar **`RegistrationRulesService`** (ou nome equivalente) para RULE-02 e RULE-03 (contagens de `CONFIRMED` / `SUBSTITUTE`, janela temporal, `MatchStatus.OPEN`), testável com Jest sem HTTP.
- **D-05:** Quando não há vaga para titular nem reserva, lançar **`NoRegistrationSlotsError`** (novo `DomainError`, código estável, HTTP **400**) mensagem explícita.
- **D-06:** `UserAlreadyRegisteredError` quando já existe registo com `status` ∈ {`CONFIRMED`, `SUBSTITUTE`} para o par `(matchId, userId)`.

### `queueOrder` e promoção

- **D-07:** Novo registo: `queueOrder = (max queueOrder deste matchId entre todos os registos) + 1` (simples e determinístico na v1).
- **D-08:** Promoção: após `CANCELED` num titular `CONFIRMED`, selecionar **primeiro** `SUBSTITUTE` por `queueOrder` ascendente, atualizar para `CONFIRMED`; cancelamento de `SUBSTITUTE` não promove ninguém.

### Transações

- **D-09:** Operações cancel + promote numa única **`prisma.$transaction`** para consistência lógica (v1 sem retry elaborado).

### Claude's Discretion

- Nomes de ficheiros (`registrations` vs `registration`) desde que consistentes com `matches/*`.
- DTO `RegisterPlayerDto` apenas `preferredPosition` no body (match e user vêm da rota e do header).

</decisions>

<canonical_refs>
## Canonical References

### Requisitos e roadmap

- `.planning/REQUIREMENTS.md` — REG-01, REG-02, REG-03, RULE-02, RULE-03, API-04, API-05, ERR-01
- `.planning/ROADMAP.md` — Phase 3 goal e success criteria

### Fases anteriores

- `.planning/phases/02-partidas-criacao-leitura-e-erros-de-negocio/02-CONTEXT.md` — erros, headers dev, padrões Nest
- `.planning/phases/01-funda-o-docker-prisma-e-api-shell/01-CONTEXT.md` — Prisma em `apps/api`

### Domínio

- `.planning/intel/constraints.md` — C-SPEC-005, C-SPEC-007, C-SPEC-008, C-SPEC-010 (use cases)
- `apps/api/prisma/schema.prisma` — `Registration`, `Match`, enums

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `apps/api/src/matches/*` — padrão de módulo, `PrismaService`, guards por header
- `apps/api/src/common/errors/domain-errors.ts` + `DomainExceptionFilter` — estender com `NoRegistrationSlotsError` se necessário

### Integration Points

- Novo `RegistrationsModule` importado em `AppModule`; rotas sob `matches/:matchId/registrations` sem alterar `MatchesController` existente (segundo `@Controller` com prefixo compatível ou controlador dedicado com path completo).

</code_context>

<specifics>
## Specific Ideas

- E2E: criar partida `OPEN`, dois jogadores seed, inscrever até titular+reserva, cancelar titular e assert reserva promovida a `CONFIRMED`.

</specifics>

<deferred>
## Deferred Ideas

- **REG-TX-01** — locking / serialização forte contra overbooking em alta concorrência (v2).

</deferred>

---

*Phase: 03-inscricoes-fila-e-cancelamento*  
*Context gathered: 2026-04-23*
