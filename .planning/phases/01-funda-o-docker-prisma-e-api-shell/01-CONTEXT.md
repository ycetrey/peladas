# Phase 1: Fundação Docker, Prisma e API shell - Context

**Gathered:** 2026-04-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Subir **PostgreSQL + API NestJS + Next.js (jogador) + Next.js (admin)** apenas com **Docker Compose** documentado; **Prisma** com modelo inicial (User, Match, Registration, Team, TeamPlayer) e **migrations** aplicáveis em BD vazio; comprovar **USR-01** com dados persistidos; API expõe **health** mínima. Não inclui fluxos completos de partidas/inscrições/times na API (fases seguintes).

</domain>

<decisions>
## Implementation Decisions

### Área 1 — Estrutura de pastas e Compose

- **D-01:** **Monorepo** na raiz do repositório com workspaces (**pnpm** preferido; **npm workspaces** aceitável se preferir menos tooling). Pastas: `apps/api` (NestJS), `apps/web-jogador` (Next.js), `apps/web-admin` (Next.js).
- **D-02:** Um **`docker-compose.yml`** na raiz (e opcionalmente `docker-compose.override.yml` só para dev) com **build context** por serviço apontando para cada `apps/*`; nomes de serviços sugeridos: `db`, `api`, `web-jogador`, `web-admin`.
- **D-03:** Pacote **`packages/*` na fase 1:** não obrigatório; só introduzir se surgir duplicação real de tipos/código entre apps. Evitar complexidade prematura.

### Área 2 — Banco e Prisma

- **D-04:** Base de dados **PostgreSQL** no Compose (imagem oficial, **major fixo**, ex.: `postgres:16-alpine` ou equivalente documentado).
- **D-05:** **`schema.prisma` e pasta `prisma/migrations`** residem no **`apps/api`**; a API é o único serviço que corre `prisma migrate` / `db seed` na fase 1.
- **D-06:** **`DATABASE_URL`** injetado via Compose (env); rede interna para `api` ↔ `db`; frontends recebem URL pública da API via variável (ex.: `NEXT_PUBLIC_API_URL`).

### Área 3 — Comprovar USR-01

- **D-07:** Validar persistência com **`prisma db seed`** (script idempotente ou tolerante a re-execução) criando pelo menos um **User** com nome, `preferredPositions` e `isAdmin`, conforme modelo lógico em `REQUIREMENTS.md` / constraints ingeridos.
- **D-08:** **Não** exigir endpoint HTTP de criação de utilizador na fase 1 para fechar USR-01; endpoint de utilizador pode entrar na fase 2 com auth se necessário.

### Área 4 — Experiência de desenvolvimento em Docker

- **D-09:** **Dev:** bind mount do código-fonte + **volume nomeado** por app para `node_modules` (evitar instalação no host e acelerar installs em Linux container).
- **D-10:** **Node LTS** fixo nos Dockerfiles (ex.: **Node 22** ou **20** bookworm-slim — manter uma versão só em todo o monorepo; alinhar `engines` no `package.json` raiz).
- **D-11:** Hot reload ativado nos Dockerfiles/entrypoints dos três apps em modo dev conforme padrão de cada framework (Nest `--watch`, Next dev).

### Sessão de discussão

- **D-12:** Utilizador escolheu discutir **todas** as áreas cinzentas (`todos`); decisões **D-01–D-11** aplicam as opções **recomendadas** na orquestração da discussão (alinhadas a `PROJECT.md` e ADR Docker/Prisma).

### Claude's Discretion

- Nomes exatos de serviços Compose, portas host (`5432`, `3000`, etc.) e detalhes de `pnpm` vs `npm` se o utilizador não tiver preferência.
- Formato exato do endpoint de health (`/health` vs `/api/health`) desde que documentado e verificável no critério de sucesso da fase.

</decisions>

<specifics>
## Specific Ideas

- Prioridade: **reprodutibilidade** — um comando documentado sobe tudo; README na raiz com pré-requisitos (só Docker + opcionalmente pnpm local se scripts o usarem no host).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e projeto

- `.planning/REQUIREMENTS.md` — REQ-IDs da fase 1: INFRA-01..03, DATA-01..02, USR-01
- `.planning/PROJECT.md` — visão, stack locked, out of scope
- `.planning/ROADMAP.md` — critérios de sucesso da Phase 1

### Decisões e domínio ingeridos

- `.planning/ingest-sources/stack-intent.md` — ADR Accepted: Docker, 3 serviços, Prisma only
- `.planning/intel/constraints.md` — modelo lógico e enums (fonte derivada de `peladas_business_rules_base.md`)
- `peladas_business_rules_base.md` — documento fonte de regras e exemplos (TypeORM nos exemplos está **supersedido** por Prisma)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- Nenhum código de aplicação ainda — repositório contém sobretudo `.planning/` e tooling `.cursor/`.

### Established Patterns

- Greenfield: estabelecer padrões nesta fase (Compose + monorepo + Prisma na API).

### Integration Points

- Futuras fases ligam à API Nest em `apps/api` e consomem o mesmo `DATABASE_URL` / rede Compose.

</code_context>

<deferred>
## Deferred Ideas

- **Pacote `packages/database` compartilhado** entre Next e API — só se na fase 5/6 for necessário partilhar tipos Prisma/client no frontend (cuidado com bundle); fora do mínimo da fase 1.

</deferred>

---

*Phase: 01-funda-o-docker-prisma-e-api-shell*  
*Context gathered: 2026-04-22*
