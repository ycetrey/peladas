FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json ./
COPY prisma ./prisma/

RUN pnpm install && pnpm exec prisma generate

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN pnpm exec nest build

EXPOSE 3001

ENV NODE_ENV=development

# With compose bind-mount of source, rebuild watch; named volume keeps node_modules.
CMD ["sh", "-c", "pnpm install && pnpm exec prisma generate && pnpm exec nest start --watch"]
