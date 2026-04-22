# Phase 1: Fundação Docker, Prisma e API shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `01-CONTEXT.md`.

**Session:** 2026-04-22

## Gray area selection

- **Question:** Which areas to discuss for Phase 1?
- **Options presented:** (1) Pastas e Compose, (2) Banco e Prisma, (3) USR-01 proof, (4) Dev Docker UX
- **User response:** `todos` (all four areas)
- **Resolution:** Proceed with full coverage; apply **recommended** option from each area as documented in context (`D-01` through `D-11`).

## Area 1 — Estrutura de pastas e Compose

- **Options implied:** Monorepo workspaces vs três repos irmãos; Compose na raiz.
- **Chosen:** Monorepo `apps/api`, `apps/web-jogador`, `apps/web-admin`; `docker-compose.yml` na raiz; `packages/*` opcional/deferido.

## Area 2 — Banco e Prisma

- **Options implied:** Postgres vs outros; Prisma só na API vs pacote compartilhado.
- **Chosen:** PostgreSQL oficial no Compose; Prisma em `apps/api`; `DATABASE_URL` por env.

## Area 3 — Comprovar USR-01

- **Options implied:** `prisma db seed` vs endpoint HTTP dev.
- **Chosen:** Seed Prisma para utilizador de exemplo; sem obrigar POST público na fase 1.

## Area 4 — Dev Docker UX

- **Options implied:** Volumes/hot reload vs rebuild; pin Node LTS.
- **Chosen:** Bind mounts + volumes para `node_modules`; Node LTS fixo (20 ou 22) em todos os Dockerfiles; watch mode nos três apps.

---

*End of discussion log for Phase 1*
