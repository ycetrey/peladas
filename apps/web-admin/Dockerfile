# Build context = raiz do monorepo (ver docker-compose: context: .)
FROM node:22-bookworm-slim

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/fixtures ./packages/fixtures
COPY apps/api/package.json ./apps/api/
COPY apps/web-admin/package.json ./apps/web-admin/
COPY apps/web-jogador/package.json ./apps/web-jogador/

RUN pnpm install --frozen-lockfile --filter @peladas/web-admin...

# Sem COPY de app/lib/components: em dev o código vem só do bind mount (.:/repo).
# Isto evita confusão com CSS/TS “antigo” baked na imagem quando o hot reload falha.

EXPOSE 3000
ENV NODE_ENV=development
ENV DOCKER=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
WORKDIR /repo/apps/web-admin

CMD ["sh", "-c", "cd /repo && pnpm install --frozen-lockfile && cd /repo/apps/web-admin && pnpm exec next dev --hostname 0.0.0.0 --port 3000"]
