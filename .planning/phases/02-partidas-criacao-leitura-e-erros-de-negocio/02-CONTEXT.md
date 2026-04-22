# Phase 2: Partidas — criação, leitura e erros de negócio - Context

**Gathered:** 2026-04-22  
**Status:** Ready for planning  
**Source:** `/gsd-plan-phase 2 --all` (sem discuss-phase prévio — decisões inferidas de `ROADMAP.md`, `REQUIREMENTS.md`, `intel/constraints.md` e `01-CONTEXT.md`)

<domain>
## Phase Boundary

API NestJS expõe **criar partida** (MAT-01, API-01, RULE-01), **obter por id** (API-02), **listar partidas** (API-03) e respostas de **erro de negócio estáveis** (ERR-01). Estados `MatchStatus` coerentes com MAT-02 (mínimo: criar em estado utilizável por inscrições na fase 3). Sem UI, sem inscrições, sem geração de times.

</domain>

<decisions>
## Implementation Decisions

### Identidade do chamador (v1 / dev)

- **D-01:** Cabeçalho HTTP **`X-Organizer-User-Id`** com UUID de um `User` existente (ex.: seed). Guard Nest rejeita pedido sem cabeçalho ou com UUID inválido / utilizador inexistente (`401` ou `403` — escolher um e documentar).
- **D-02:** Não introduzir JWT nem sessão nesta fase; alinhar com D-08 da fase 1 (identidade explícita documentada para dev e integração).

### Contrato de erros (ERR-01)

- **D-03:** Corpo JSON único para erros de domínio: `{ "error": { "code": "<PascalCaseClassName>", "message": "<string>" } }` com `Content-Type: application/json`. Os códigos incluem no mínimo: `MatchNotOpenError`, `RegistrationClosedError`, `UserAlreadyRegisteredError`, `InvalidMatchStateError` (contrato global); na fase 2 acrescentar erros usados pela criação/leitura, p.ex. `MatchNotFoundError`, `InvalidMatchCreationError` (ou nomes alinhados a C-SPEC-005), sempre com o mesmo envelope.
- **D-04:** Mapeamento HTTP: regras de validação / regra de negócio → `400` ou `422` (fixar uma política no filtro); recurso inexistente → `404`; conflito de estado → `409` quando aplicável.

### Listagem (API-03)

- **D-05:** `GET /matches` sem paginação obrigatória no v1: query opcionais `status` (enum `MatchStatus`), `limit` (default `50`, máx `100`), ordenação por `dateTime` ascendente por defeito.

### Estado inicial da partida (MAT-02)

- **D-06:** `POST /matches` cria partida com `status: OPEN` após validar RULE-01 (alinhado a C-SPEC-010 — partida utilizável para inscrição na fase 3). Transições adicionais (`DRAFT`, `CLOSED`, …) ficam para fases posteriores salvo se o roadmap exigir apenas “disponível” — aqui **OPEN** na criação satisfaz o critério de sucesso.

### Claude's Discretion

- Nomes exatos de classes/DTO e pasta (`matches` vs `match`) desde que consistentes com Nest e Prisma existentes.
- Uso de `class-validator` / pipes built-in vs serviço puro de regras — preferir uma camada `MatchRulesService` testável chamada pelo use case.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e projeto

- `.planning/REQUIREMENTS.md` — MAT-01, MAT-02, RULE-01, API-01, API-02, API-03, ERR-01
- `.planning/ROADMAP.md` — Phase 2 goal e success criteria
- `.planning/phases/01-funda-o-docker-prisma-e-api-shell/01-CONTEXT.md` — stack, Prisma em `apps/api`, D-08

### Domínio

- `.planning/intel/constraints.md` — C-SPEC-004 (CreateMatchDto), C-SPEC-005 (erros), C-SPEC-007 (regras de criação)
- `peladas_business_rules_base.md` — detalhe de negócio (TypeORM nos exemplos supersedido por Prisma)
- `apps/api/prisma/schema.prisma` — modelo `Match` e enums

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `apps/api/src/prisma/prisma.module.ts` + `PrismaService` — persistência de `Match`.
- `apps/api/src/health/*` — padrão de módulo Nest mínimo.

### Integration Points

- `AppModule` importa novo `MatchesModule`.
- README raiz: documentar cabeçalho e exemplos `curl` para criar/listar/detalhar.

</code_context>

<specifics>
## Specific Ideas

- Respostas de sucesso JSON claras: objeto `match` na criação e no detalhe; lista `{ "matches": [...] }` ou array — documentar escolha.

</specifics>

<deferred>
## Deferred Ideas

- Autenticação real (JWT/sessão) — fase futura.
- Paginação por cursor — v2 ou fase com volume.

</deferred>

---

*Phase: 02-partidas-criacao-leitura-e-erros-de-negocio*  
*Context gathered: 2026-04-22*
