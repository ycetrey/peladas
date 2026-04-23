# Peladas

Organização de peladas (partidas informais): API NestJS, apps Next.js (jogador + admin), Postgres, Prisma — tudo via **Docker Compose**.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (Desktop ou Engine)
- Opcional no host: [pnpm](https://pnpm.io/) 9.x (para `pnpm install` / Prisma CLI fora dos containers)

## Quick start (um comando)

Na raiz do repositório:

```bash
docker compose up --build
```

Na primeira execução o build pode demorar (imagens Node + dependências).

### URLs locais (portas por defeito)

| Serviço        | URL                          |
|----------------|--------------------------------|
| API (health)   | http://localhost:3001/health   |
| App jogador    | http://localhost:3002          |
| App admin      | http://localhost:3003          |
| Postgres       | `localhost:5432` (user/pass/db: ver `.env.example`) |

Copia `.env.example` para `.env` na raiz e ajusta portas se precisares.

### Depois do primeiro `docker compose up -d db`

Com Postgres a correr, cria **`apps/api/.env`** a partir de **`apps/api/.env.example`** (o Prisma lê `.env` em `apps/api`, não na raiz do repositório). Garante `pnpm install` na raiz para o CLI do Prisma existir no pacote da API.

```bash
npx pnpm@9.15.0 install
npx pnpm@9.15.0 --filter @peladas/api run db:migrate
npx pnpm@9.15.0 --filter @peladas/api run db:seed
```

(Alternativa: `npx pnpm@9.15.0 --filter @peladas/api exec prisma migrate deploy` — o mesmo binário; `run db:migrate` costuma evitar mensagens confusas se o `PATH` do `exec` falhar.)

## API — Partidas (fase 2)

Com a API a correr (ex.: `docker compose up -d db api` ou `pnpm --filter @peladas/api run start:dev`) e utilizadores em seed (`prisma db seed`), o organizador identifica-se com o cabeçalho **`X-Organizer-User-Id`** (UUID de um `User` existente, ex.: `00000000-0000-4000-8000-000000000001`).

**Criar partida** (`201`, corpo `{ "match": { ... } }`):

```bash
curl -sS -X POST "http://localhost:3001/matches" \
  -H "Content-Type: application/json" \
  -H "X-Organizer-User-Id: 00000000-0000-4000-8000-000000000001" \
  -d '{"title":"Pelada teste","dateTime":"2026-06-15T20:00:00.000Z","mode":"ALTERNATED","maxPlayers":10,"maxSubstitutes":2,"registrationOpensAt":"2026-06-01T10:00:00.000Z","registrationClosesAt":"2026-06-15T18:00:00.000Z"}'
```

**Listar** — `GET http://localhost:3001/matches` (opcional: `?status=OPEN&limit=50`).

**Detalhe** — `GET http://localhost:3001/matches/<id>`.

Erros de regra de negócio devolvem JSON `{ "error": { "code": "<NomeErro>", "message": "..." } }` (ex.: `MatchNotFoundError` com `404`).

**Testes e2e da API** (`pnpm --filter @peladas/api run test:e2e`): requerem `DATABASE_URL` (Postgres). Para saltar na CI: `SKIP_E2E=1`.

## API — Inscrições (fase 3)

O jogador identifica-se com **`X-Player-User-Id`** (UUID de um `User` existente).

**Inscrever** — `POST http://localhost:3001/matches/<matchId>/registrations` com JSON `{ "preferredPosition": "MIDFIELDER" }` (ou outro valor do enum `PlayerPosition`).

**Cancelar a própria inscrição** — `DELETE http://localhost:3001/matches/<matchId>/registrations/me` (mesmo cabeçalho `X-Player-User-Id`).

- Se cancelares um **titular** (`CONFIRMED`), o **primeiro reserva** (`SUBSTITUTE`, menor `queueOrder`) passa a `CONFIRMED` (transação atómica).
- Sem inscrição ativa para esse par jogador+partida: resposta de erro de domínio `InvalidMatchStateError` (HTTP **400**), mensagem *No active registration for this match*.
- Segunda inscrição ativa na mesma partida: `UserAlreadyRegisteredError` (**400**).
- Partida fechada ou fora da janela: `RegistrationClosedError` ou `MatchNotOpenError`.
- Sem vaga para titular nem reserva: `NoRegistrationSlotsError` (**400**).

## API — Gerar times A/B (fase 4)

Com **`maxPlayers`** titulares `CONFIRMED` (e janela/estado que permita as inscrições já feitas), o organizador gera os dois times:

**Gerar** — `POST http://localhost:3001/matches/<matchId>/teams/generate` com **`X-Organizer-User-Id`** (igual à criação de partidas).

Resposta **`201`** com `{ "teams": [ { "id", "matchId", "name", "players": [ { "order", "userId", "registrationId", "user": { ... } } ] } ] }` (dois elementos, nomes `A` e `B`).

- Número de confirmados **≠** `maxPlayers`: `WrongConfirmedCountForTeamsError` (**400**).
- Times **já** existentes para a partida: `TeamsAlreadyGeneratedError` (**400**).
- Partida inexistente: `MatchNotFoundError` (**404**).
- **`ALTERNATED`**: intercalação pela ordem de fila (`queueOrder` ascendente) — 1º e 3º titulares no time A, 2º e 4º no B, etc.
- **`DRAW_AT_END`**: baralhamento (Fisher–Yates com `Math.random`) e metade dos jogadores em cada time; v2 pode substituir por seed auditável (`DRAW-01`).

## Monorepo

- `apps/api` — NestJS + Prisma  
- `apps/web-jogador` — Next.js  
- `apps/web-admin` — Next.js  

Gestão de pacotes: **pnpm workspaces** (`pnpm-workspace.yaml`).

## Desenvolvimento sem Docker (opcional)

```bash
corepack enable
pnpm install
# apps/api/.env com DATABASE_URL=...@localhost:5432/...
pnpm --filter @peladas/api run db:migrate
pnpm --filter @peladas/api run start:dev
```

(Exige Postgres acessível na `DATABASE_URL`.)
