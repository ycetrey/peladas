# Build context = raiz do monorepo (ver docker-compose: context: .)
FROM node:22-bookworm-slim

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/fixtures ./packages/fixtures
COPY apps/api/package.json ./apps/api/
COPY apps/web-admin/package.json ./apps/web-admin/
COPY apps/web-jogador/package.json ./apps/web-jogador/
COPY apps/api/prisma ./apps/api/prisma/
COPY apps/api/scripts ./apps/api/scripts/

RUN pnpm install --frozen-lockfile

WORKDIR /repo/apps/api
RUN pnpm exec prisma generate

COPY apps/api/nest-cli.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./
COPY apps/api/src ./src

RUN pnpm exec nest build

EXPOSE 3001
ENV NODE_ENV=development
WORKDIR /repo/apps/api

# migrate deploy aplica migrações pendentes (ex.: email/passwordHash) antes do Nest — idempotente.
CMD ["sh", "-c", "cd /repo && pnpm install --frozen-lockfile && cd /repo/apps/api && pnpm exec prisma migrate deploy && pnpm exec prisma generate && pnpm exec nest start --watch"]
