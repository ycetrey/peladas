<!-- generated-by: gsd-doc-writer -->

# Primeiros passos

## Pré-requisitos

- Docker (Desktop ou Engine) com Compose
- Node.js 20+ no host (opcional, para seed/migrações sem recurso ao container)

## Arranque rápido

1. Na raiz do repositório:

   ```bash
   docker compose up --build
   ```

2. Na primeira vez, popular utilizadores de teste (Postgres acessível em `localhost:5432` com a stack a correr):

   ```bash
   npx pnpm@9.15.0 install
   npx pnpm@9.15.0 --filter @peladas/api run db:seed
   ```

   Ou, com a API já no Docker:

   ```bash
   docker compose exec api sh -c "cd /repo/apps/api && pnpm exec prisma db seed"
   ```

3. Abrir no browser:

   - Jogador: `http://localhost:3002` (porta mapeada no `docker-compose.yml`)
   - Admin: `http://localhost:3003`
   - API: `http://localhost:3001/health`

Credenciais de exemplo: ver saída do seed / `apps/api/prisma/seed.ts`.

Mais detalhes: [README.md](../README.md), [DEVELOPMENT](./DEVELOPMENT.md), [DEPLOYMENT](./DEPLOYMENT.md).
