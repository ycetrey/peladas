<!-- generated-by: gsd-doc-writer -->

# Deploy e Docker Compose

## Compose de desenvolvimento

O ficheiro `docker-compose.yml` na raiz define:

- **`db`** — Postgres 16, volume persistente `postgres_data`, healthcheck.
- **`api`** — build `apps/api/Dockerfile`, `migrate deploy` no arranque, variáveis `DATABASE_URL`, `JWT_SECRET`, CORS, polling para hot-reload em volumes montados.
- **`web-jogador`** / **`web-admin`** — build por Dockerfile em cada app; `API_INTERNAL_BASE_URL=http://api:3001`; portas publicadas configuráveis via `.env` da raiz.

Mapeamento típico de portas (ver `.env.example`): API `3001`, jogador `3002`, admin `3003`, Postgres `5432`.

## Build da API

Contexto de build: **raiz do monorepo** (`docker-compose` usa `context: .` e `dockerfile: apps/api/Dockerfile`) para o lockfile e workspaces.

## Segredos

<!-- VERIFY: Em produção, definir `JWT_SECRET` forte e credenciais Postgres fora do repositório; o Compose de desenvolvimento usa valores por defeito visíveis no `docker-compose.yml`. -->

Não commitar ficheiros `.env` com segredos reais.

## Produção

<!-- VERIFY: Orquestração em produção (Kubernetes, PaaS, HTTPS, secrets manager) não está definida neste repositório — alinhar com a equipa de infraestrutura. -->
