FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json ./

RUN pnpm install

COPY next.config.ts tsconfig.json next-env.d.ts ./
COPY app ./app
COPY lib ./lib

EXPOSE 3000

CMD ["pnpm", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]
