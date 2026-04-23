# Peladas

Organização de peladas (partidas informais): API NestJS, apps Next.js (jogador + admin), Postgres, Prisma — tudo via **Docker Compose**.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (Desktop ou Engine)
- [Node.js](https://nodejs.org/) 20+ no host (para `npx pnpm@9.15.0` nas migrações/seed da **primeira vez**; o Compose não aplica migrações sozinho)
- Opcional: [pnpm](https://pnpm.io/) 9.x via Corepack (podes usar `pnpm` em vez de `npx pnpm@9.15.0` nos mesmos comandos)

## Quick start (um comando)

Na raiz do repositório:

```bash
docker compose up --build
```

Na primeira execução o build pode demorar (imagens Node + dependências).

**Importante:** o contentor da API **não aplica migrações Prisma ao arranque** (só `prisma generate` + Nest). Na **primeira vez**, tens de correr **migrate + seed** a partir da tua máquina (com Postgres acessível em `localhost`), antes de a API servir dados com schema correto — ver secção seguinte.

### Primeira vez — base de dados (obrigatório uma vez)

1. Na raiz: copia `.env.example` → `.env` (portas e credenciais; o Compose lê este ficheiro).
2. Arranca só a base de dados e espera ficar saudável:
   ```bash
   docker compose up -d db
   ```
3. Em **`apps/api/`**: copia `apps/api/.env.example` → **`apps/api/.env`** e confirma que `DATABASE_URL` usa **`localhost:5432`** (porta exposta pelo Compose no host), por exemplo:
   `postgresql://peladas:peladas@localhost:5432/peladas?schema=public`
4. Na **raiz do repositório**, instala dependências do monorepo e aplica migrações + seed (usa `npx pnpm@9.15.0` para não precisares de pnpm global):
   ```bash
   npx pnpm@9.15.0 install
   npx pnpm@9.15.0 --filter @peladas/api run db:migrate
   npx pnpm@9.15.0 --filter @peladas/api run db:seed
   ```
   (Equivalente na raiz, se já tiveres Corepack/pnpm 9: `pnpm install` depois `pnpm run db:migrate` e `pnpm run db:seed`.)
5. Agora sobe o resto (API + apps) ou tudo de uma vez:
   ```bash
   docker compose up --build
   ```

Se apagares o volume Docker da Postgres (`postgres_data`), repete os passos 4–5.

### URLs locais (portas por defeito)

| Serviço        | URL                          |
|----------------|--------------------------------|
| API (health)   | http://localhost:3001/health   |
| App jogador    | http://localhost:3002          |
| App admin      | http://localhost:3003          |
| Postgres       | `localhost:5432` (user/pass/db: ver `.env.example`) |

As portas da tabela seguem os valores por defeito em `.env.example` (sobrescreves em `.env` na raiz).

## API — Partidas (fase 2)

Com a API a correr (ex.: `docker compose up -d db api` ou `npx pnpm@9.15.0 --filter @peladas/api run start:dev`) e utilizadores em seed (`db:seed`), o organizador identifica-se com o cabeçalho **`X-Organizer-User-Id`** (UUID de um `User` existente, ex.: `00000000-0000-4000-8000-000000000001`).

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

**Testes e2e da API** (`npx pnpm@9.15.0 --filter @peladas/api run test:e2e`): requerem `DATABASE_URL` no ambiente (Postgres acessível, p.ex. o mesmo `apps/api/.env` com `localhost`). Para saltar: `SKIP_E2E=1`.

## API — Inscrições (fase 3)

O jogador identifica-se com **`X-Player-User-Id`** (UUID de um `User` existente).

**Inscrever** — `POST http://localhost:3001/matches/<matchId>/registrations` com JSON `{ "preferredPosition": "MIDFIELDER" }` (ou outro valor do enum `PlayerPosition`).

**Cancelar a própria inscrição** — `DELETE http://localhost:3001/matches/<matchId>/registrations/me` (mesmo cabeçalho `X-Player-User-Id`).

**Estado da própria inscrição** — `GET http://localhost:3001/matches/<matchId>/registrations/me` com `X-Player-User-Id`: resposta `200` e `{ "registration": null }` se não houver inscrição ativa, ou `{ "registration": { ... } }` com `status`, `queueOrder`, `preferredPosition`, etc.

Comportamento extra útil para testar na API:

- Se cancelares um **titular** (`CONFIRMED`), o **primeiro reserva** (`SUBSTITUTE`, menor `queueOrder`) passa a `CONFIRMED` (transação atómica).
- Sem inscrição ativa para esse par jogador+partida: resposta de domínio `InvalidMatchStateError` (HTTP **400**), mensagem *No active registration for this match*.
- Segunda inscrição ativa na mesma partida: `UserAlreadyRegisteredError` (**400**).
- Partida fechada ou fora da janela: `RegistrationClosedError` ou `MatchNotOpenError`.
- Sem vaga para titular nem reserva: `NoRegistrationSlotsError` (**400**).

### CORS (app jogador no browser)

A API aceita pedidos do origin do **web-jogador** (por defeito `http://localhost:3002`). Variável opcional na **API**: `WEB_JOGADOR_ORIGIN` — lista separada por vírgulas se precisares de mais origens (ex.: `http://localhost:3002,https://app.example.com`).

No serviço **web-jogador** do Compose, `NEXT_PUBLIC_API_BASE_URL` aponta por defeito para `http://localhost:3001` para o **browser no host** falar com a API exposta na máquina.

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

Com Postgres já a correr (local ou só o serviço `db` do Compose):

```bash
corepack enable
pnpm install
# apps/api/.env com DATABASE_URL=...@localhost:5432/...
pnpm --filter @peladas/api run db:migrate
pnpm --filter @peladas/api exec prisma generate
pnpm --filter @peladas/api run db:seed
pnpm --filter @peladas/api run start:dev
```

Para as apps Next no host, vê `apps/web-jogador/README.md` (porta **3002** alinhada com CORS por defeito).

**App jogador no browser:** `http://localhost:3002` com `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` (ou o valor definido no teu `.env` / Compose).
