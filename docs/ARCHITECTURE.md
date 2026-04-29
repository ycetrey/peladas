<!-- generated-by: gsd-doc-writer -->

# Arquitetura

## Visão geral

O **Peladas** é um monorepo para organizar partidas informais: uma **API NestJS** (domínio, Prisma, Postgres) e duas **apps Next.js** (jogador e admin) que autenticam via JWT (cookie httpOnly nos route handlers). O tráfego browser → API usa CORS com credenciais; em Docker, as apps Next podem proxy para a API via URL interna.

## Componentes

```text
┌──────────────┐     ┌──────────────┐
│ web-jogador  │     │  web-admin   │
│  (Next.js)   │     │  (Next.js)   │
└──────┬───────┘     └──────┬───────┘
       │ credentials        │ credentials
       ▼                    ▼
┌─────────────────────────────────────┐
│           API NestJS                 │
│  auth · matches · registrations ·   │
│  teams · venues · groups             │
└──────────────────┬──────────────────┘
                   │ Prisma
                   ▼
            ┌─────────────┐
            │  Postgres   │
            └─────────────┘
```

## Módulos da API (pastas em `apps/api/src`)

- **`auth`** — login JWT, `/auth/me`.
- **`matches`** — CRUD de partidas visíveis ao utilizador (filtro público/grupo), agregados (`titularSlotsRemaining`, contagens). Inclui `myRegistration` na listagem e no detalhe.
- **`registrations`** — inscrições do jogador sob `matches/:matchId/registrations`.
- **`teams`** — geração de times A/B no endpoint `POST /matches/:matchId/teams/generate` (admin).
- **`venues`**, **`groups`** — campos e grupos para visibilidade e organização.
- **`prisma`** — acesso à base; migrações em `apps/api/prisma`.

## Fluxo típico

1. Jogador faz login na app Next → cookie de sessão; pedidos à API via proxy/backend com o mesmo JWT.
2. `GET /matches` devolve partidas acessíveis e, por cada uma, `myRegistration` para pintar a UI (inscrito ou não).
3. Inscrição: `POST .../registrations` com regras de janela, vagas titular/reserva e fila (`queueOrder`).
4. Cancelamento pode promover o primeiro reserva a titular (transação).

## Frontends

- **`apps/web-jogador`** — lista com acções **Inscrever-me** / **Não irei**; detalhe com posição.
- **`apps/web-admin`** — painel organizador (criar partida, gerar equipas).

Documentação complementar: [GETTING-STARTED](./GETTING-STARTED.md), [API](./API.md).
