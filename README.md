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

Copia `.env.example` para `.env` e ajusta portas se precisares.

## Monorepo

- `apps/api` — NestJS + Prisma  
- `apps/web-jogador` — Next.js  
- `apps/web-admin` — Next.js  

Gestão de pacotes: **pnpm workspaces** (`pnpm-workspace.yaml`).

## Desenvolvimento sem Docker (opcional)

```bash
corepack enable
pnpm install
pnpm --filter @peladas/api exec prisma migrate deploy
pnpm --filter @peladas/api run start:dev
```

(Exige Postgres acessível na `DATABASE_URL`.)
