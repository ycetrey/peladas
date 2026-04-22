---
phase: 01-funda-o-docker-prisma-e-api-shell
plan: 02
subsystem: database
tags: prisma, postgresql, migrations, seed

requires:
  - phase: 01-01
    provides: monorepo and compose
provides:
  - Prisma schema for User, Match, Registration, Team, TeamPlayer
  - Initial SQL migration
  - Seed script for USR-01
affects:
  - phase-01-03

tech-stack:
  added: ["Prisma 6.x", "PostgreSQL enums + arrays"]
  patterns: ["Domain enums mirrored from business rules doc"]

key-files:
  created:
    - apps/api/prisma/schema.prisma
    - apps/api/prisma/migrations/20260422120000_init_domain/migration.sql
    - apps/api/prisma/seed.ts
    - apps/api/prisma/migrations/migration_lock.toml
  modified: []

key-decisions:
  - "Used prisma migrate diff --from-empty to author initial migration SQL"

patterns-established:
  - "Seed uses fixed UUIDs for idempotent upserts"

requirements-completed:
  - DATA-01
  - DATA-02
  - USR-01

duration: 20min
completed: 2026-04-22
---

# Phase 1 — Plan 02 summary

**Modelo Prisma completo com migration SQL versionada e seed para utilizadores de exemplo.**

## Verification

- `npx prisma validate` — OK (schema)
- `prisma migrate deploy` — **NOT RUN** (Docker engine unavailable on agent host)
- `prisma db seed` — **NOT RUN** (requires applied migration)

## Self-Check: PARTIAL

## Deviations

- Docker Desktop / engine not running → could not verify `migrate deploy` / `db seed` against live Postgres. User should run: `docker compose up -d db` then `pnpm --filter @peladas/api exec prisma migrate deploy` and `pnpm --filter @peladas/api exec prisma db seed`.
