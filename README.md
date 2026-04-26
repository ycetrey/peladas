# Peladas

Organização de peladas (partidas informais): API NestJS, apps Next.js (jogador + admin), Postgres, Prisma — tudo via **Docker Compose**.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (Desktop ou Engine)
- [Node.js](https://nodejs.org/) 20+ no host (para `npx pnpm@9.15.0` no **seed** ou migrações se correres a API fora do Docker)
- Opcional: [pnpm](https://pnpm.io/) 9.x via Corepack (podes usar `pnpm` em vez de `npx pnpm@9.15.0` nos mesmos comandos)

## Quick start (um comando)

Na raiz do repositório:

```bash
docker compose up --build
```

Na primeira execução o build pode demorar (imagens Node + dependências).

**Importante:** com **Docker Compose**, o contentor da API corre **`prisma migrate deploy`** ao arranque (depois de `pnpm install`), para o schema na Postgres do Compose ficar alinhado com o código. O **seed** (`db:seed`) continua a ser manual na primeira vez (ou quando quiseres repor utilizadores de teste) — ver secção seguinte.

O serviço **api** no Compose monta a **raiz do repositório** em `/repo` e corre `pnpm install --frozen-lockfile` no arranque, para as dependências alinharem com o `pnpm-lock.yaml` do monorepo (incl. `@nestjs/jwt`, `bcrypt`, etc.). Se mudares dependências, `docker compose up --build` reconstrói a imagem; em caso raro de `node_modules` antigo no volume anónimo, `docker compose down` e volta a subir, ou `docker compose build --no-cache api`.

### Primeira vez — base de dados e seed

**Só Docker Compose:** ao subires a stack, a API corre **`prisma migrate deploy`** no arranque (schema atualizado). Falta **popular utilizadores** uma vez:

```bash
npm install
npm run db:seed
```

(Isto usa `apps/api/.env` ou `.env.example` com `DATABASE_URL` em **`localhost:5432`** enquanto a Postgres do Compose está exposta no host. **Nota:** se `pnpm` falhar com erro do Corepack (`Cannot find matching keyid`), usa `npm run db:seed` na raiz ou, dentro de `apps/api`, `node scripts/run-prisma.cjs db seed`.)

Alternativa com pnpm (se o Corepack estiver a funcionar):

```bash
npx pnpm@9.15.0 install
npx pnpm@9.15.0 --filter @peladas/api run db:seed
```

Alternativa sem pnpm no host, com a stack já a correr:

```bash
docker compose exec api sh -c "cd /repo/apps/api && pnpm exec prisma db seed"
```

**API ou migrações no host** (sem depender do `migrate deploy` do contentor): copia `apps/api/.env.example` → `apps/api/.env`, ajusta `DATABASE_URL`, depois `pnpm --filter @peladas/api run db:migrate` e `db:seed` como antes.

Se apagares o volume Docker da Postgres (`postgres_data`), volta a correr o **seed** (e as migrações aplicam-se outra vez ao arranque da API).

O seed cria **vários jogadores**, **dois grupos**, **três campos**, **sete partidas de exemplo** (públicas e de grupo) e **inscrições** (titulares, reservas, janela a fechar, etc.). Todos os utilizadores do seed usam a palavra-passe **`password`**. Lista completa no final da saída do comando `db:seed` (emails `*@peladas.local`).

### URLs locais (portas por defeito)

| Serviço        | URL                          |
|----------------|--------------------------------|
| API (health)   | http://localhost:3001/health   |
| App jogador    | http://localhost:3002          |
| App admin      | http://localhost:3003          |
| Postgres       | `localhost:5432` (user/pass/db: ver `.env.example`) |

As portas da tabela seguem os valores por defeito em `.env.example` (sobrescreves em `.env` na raiz).

## API — Autenticação (JWT)

Com utilizadores em seed (`db:seed`), obténs um token com **`POST /auth/login`** (JSON `{ "email", "password" }`). Resposta **`200`**: `{ "access_token", "user": { "id", "email", "name", "isAdmin" } }`.

- **`GET /auth/me`** — requer cabeçalho **`Authorization: Bearer <access_token>`**; devolve o mesmo objeto `user`.
- **`POST /matches`** — requer Bearer de utilizador com **`isAdmin: true`**.
- **`POST /matches/:matchId/registrations`** e **`GET/DELETE .../registrations/me`** — requerem Bearer de **qualquer** utilizador autenticado (o `sub` do JWT é o jogador).
- **`POST /matches/:matchId/teams/generate`** — requer Bearer de **admin**.

Variável de ambiente na API: **`JWT_SECRET`** (HS256). Define o mesmo valor nas apps Next (`JWT_SECRET`) para validarem o cookie httpOnly.

## API — Partidas (fase 2)

Com a API a correr (ex.: `docker compose up -d db api` ou `npx pnpm@9.15.0 --filter @peladas/api run start:dev`) e utilizadores em seed (`db:seed`), **criar partida** (`201`, corpo `{ "match": { ... } }`) usa Bearer de admin (ex.: `admin@peladas.local` / `password`):

1. `POST http://localhost:3001/auth/login` com `{"email":"admin@peladas.local","password":"password"}` e copia o campo **`access_token`** da resposta.
2. Cria a partida:

```bash
curl -sS -X POST "http://localhost:3001/matches" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title":"Pelada teste","dateTime":"2026-06-15T20:00:00.000Z","mode":"ALTERNATED","maxPlayers":10,"maxSubstitutes":2,"registrationOpensAt":"2026-06-01T10:00:00.000Z","registrationClosesAt":"2026-06-15T18:00:00.000Z"}'
```

**Listar** — `GET http://localhost:3001/matches` (opcional: `?status=OPEN&limit=50`).

**Detalhe** — `GET http://localhost:3001/matches/<id>`.

Em **ambas** as respostas, cada `match` inclui **`myRegistration`**: a inscrição ativa do utilizador autenticado (`status` `CONFIRMED` ou `SUBSTITUTE`) ou `null` se não tiver inscrição ativa — evita pedidos extra por partida na listagem.

Erros de regra de negócio devolvem JSON `{ "error": { "code": "<NomeErro>", "message": "..." } }` (ex.: `MatchNotFoundError` com `404`).

**Testes e2e da API** (`npx pnpm@9.15.0 --filter @peladas/api run test:e2e`): requerem `DATABASE_URL` no ambiente (Postgres acessível, p.ex. o mesmo `apps/api/.env` com `localhost`). Para saltar: `SKIP_E2E=1`.

## API — Inscrições (fase 3)

O jogador autentica-se com **`Authorization: Bearer <token>`** (token de `POST /auth/login` com email do jogador, ex.: `player@peladas.local`).

**Inscrever** — `POST http://localhost:3001/matches/<matchId>/registrations` com JSON `{ "preferredPosition": "MIDFIELDER" }` (ou outro valor do enum `PlayerPosition`).

**Cancelar a própria inscrição** — `DELETE http://localhost:3001/matches/<matchId>/registrations/me` com o mesmo Bearer.

**Marcar ausência ("Não irei")** — `POST http://localhost:3001/matches/<matchId>/registrations/me/absence`.

**Remover ausência** — `DELETE http://localhost:3001/matches/<matchId>/registrations/me/absence`.

**Estado da própria inscrição** — `GET http://localhost:3001/matches/<matchId>/registrations/me` com Bearer: resposta `200` e `{ "registration": null }` se não houver inscrição ativa, ou `{ "registration": { ... } }` com `status`, `queueOrder`, `preferredPosition`, etc. (O mesmo estado ativo também vem em `match.myRegistration` no detalhe/listagem da partida.)

**App jogador (lista)** — Na página inicial, cada partida expõe **Inscrever-me**, **Não irei** (sem inscrição prévia), **Desinscrever** (quando inscrito) e **Remover ausência** (quando já marcou "Não irei"). No detalhe da partida continua a poder escolher-se a posição preferida.

Comportamento extra útil para testar na API:

- Se cancelares um **titular** (`CONFIRMED`), o **primeiro reserva** (`SUBSTITUTE`, menor `queueOrder`) passa a `CONFIRMED` (transação atómica).
- Sem inscrição ativa para esse par jogador+partida: resposta de domínio `InvalidMatchStateError` (HTTP **400**), mensagem *No active registration for this match*.
- Segunda inscrição ativa na mesma partida: `UserAlreadyRegisteredError` (**400**).
- Com ausência ativa, nova inscrição é recusada: `RegistrationBlockedByAbsenceError` (**400**).
- Se já estiver inscrito, marcar ausência é recusado: `AbsenceBlockedByRegistrationError` (**400**).
- Partida fechada ou fora da janela: `RegistrationClosedError` ou `MatchNotOpenError`.
- Sem vaga para titular nem reserva: `NoRegistrationSlotsError` (**400**).

### CORS (apps Next no browser)

A API aceita pedidos com **`credentials: true`** dos origins **web-jogador** e **web-admin** (por defeito `http://localhost:3002` e `http://localhost:3003`). Variáveis na **API**: `WEB_JOGADOR_ORIGIN` e `WEB_ADMIN_ORIGIN` — listas separadas por vírgulas se precisares de mais origens.

Cabeçalhos permitidos incluem **`Authorization`**. No Compose, `NEXT_PUBLIC_API_BASE_URL` no web-jogador aponta por defeito para `http://localhost:3001` para o **browser no host** falar com a API exposta na máquina; o **web-admin** também pode definir `NEXT_PUBLIC_API_BASE_URL`. Para Route Handlers no Docker, define **`API_INTERNAL_BASE_URL=http://api:3001`** nos serviços Next.

## API — Gerar times A/B (fase 4)

Com **`maxPlayers`** titulares `CONFIRMED` (e janela/estado que permita as inscrições já feitas), o organizador gera os dois times:

**Gerar** — `POST http://localhost:3001/matches/<matchId>/teams/generate` com **`Authorization: Bearer`** de **admin** (igual à criação de partidas).

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
- `packages/fixtures` — dados estáticos (UUIDs iguais ao `seed`, exemplos no formato da API) para Storybook e testes UI  

Gestão de pacotes: **pnpm workspaces** (`pnpm-workspace.yaml` inclui `apps/*` e `packages/*`).

### `@peladas/fixtures` vs seed

- **`pnpm db:seed`** continua a ser a forma de popular **Postgres** em desenvolvimento (fonte de verdade com API real).
- **`@peladas/fixtures`** espelha **respostas JSON** e **IDs estáveis** definidos em `apps/api/prisma/seed.ts`, sem credenciais. Importação: `import { SEED_USER_ID, sampleMatchListItem } from "@peladas/fixtures"`.
- Typecheck do pacote: `pnpm --filter @peladas/fixtures run typecheck`.

### Frontends — Tailwind, shadcn, Storybook

- Ambos os Next.js usam **Tailwind CSS** + **shadcn/ui** (preset `base-nova` via CLI). Componente de exemplo: `components/ui/button.tsx`.
- **Storybook** (build estático `storybook-static`, ignorado no git):  
  - Jogador: `pnpm --filter @peladas/web-jogador run storybook` (porta 6006) ou `build-storybook`.  
  - Admin: `pnpm --filter @peladas/web-admin run storybook` (porta 6007) ou `build-storybook`.  
  - Usa **`@storybook/nextjs`** (webpack) por compatibilidade com Windows; não usar `nextjs-vite` neste repo sem validar bindings nativos.

### E2E UI (Playwright)

- Na raiz: `pnpm run test:e2e:install` (instala Chromium uma vez).
- Com **web-jogador** a correr no host (ex. `http://localhost:3002`):  
  `PLAYWRIGHT_BASE_URL=http://localhost:3002 pnpm exec playwright test`  
  Sem `PLAYWRIGHT_BASE_URL`, os testes em `e2e/` marcam-se como **skipped**.

### CI (GitHub Actions)

- Workflow **`.github/workflows/ui-ci.yml`**: `pnpm install`, build dos dois Next.js, `build-storybook` em ambos. Job **e2e** está `if: false` até haver stack estável na CI.

Documentação adicional em **`docs/`** (arquitetura, API, configuração, testes, deploy).

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
