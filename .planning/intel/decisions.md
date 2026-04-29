# Decisions (from ingested ADRs)

## ADR: Docker-first dev e topologia de serviços (Peladas)

- **source:** `d:\Fontes\peladas\.planning\ingest-sources\stack-intent.md`
- **status:** locked (Accepted in front matter)
- **title:** ADR: Docker-first dev e topologia de serviços (Peladas)
- **decision statement:** (1) Local environment is Docker-first with minimal host tooling; build and runtime in containers. (2) Three services: NestJS API; Next.js player frontend; Next.js admin frontend; each with its own Dockerfile/target and explicit orchestration (e.g. Compose). (3) **Prisma** is the only ORM/migration layer; **TypeORM must not** be used in this project. (4) API on **NestJS**; both frontends on **Next.js**.
- **scope:** Docker, Docker Compose, NestJS, Next.js, Prisma, API, player/admin frontends, monorepo, CI
