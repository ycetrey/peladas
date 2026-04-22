FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json ./

# Stub stage for compose build before full Nest/Next wiring; replaced by multi-stage build in later commits.
CMD ["sleep", "infinity"]
