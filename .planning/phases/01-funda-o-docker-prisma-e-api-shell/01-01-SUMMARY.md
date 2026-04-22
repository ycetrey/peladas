---
phase: 01-funda-o-docker-prisma-e-api-shell
plan: 01
subsystem: infra
tags: docker, pnpm, monorepo, compose

requires: []
provides:
  - Root pnpm workspace with three apps
  - docker-compose.yml with db, api, web-jogador, web-admin
  - README quick start
affects:
  - phase-02

tech-stack:
  added: ["pnpm@9.15.0 workspaces", "Docker Compose v2", "postgres:16-alpine", "node:22-bookworm-slim"]
  patterns: ["Per-app Docker build context", "Named volumes for node_modules in dev"]

key-files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - docker-compose.yml
    - README.md
    - apps/api/package.json
    - apps/web-jogador/package.json
    - apps/web-admin/package.json
  modified: []

key-decisions:
  - "Compose network peladas-internal + healthcheck on Postgres before api starts"

patterns-established:
  - "Single docker compose up --build documented in README"

requirements-completed:
  - INFRA-01

duration: 15min
completed: 2026-04-22
---

# Phase 1 — Plan 01 summary

**Monorepo pnpm e Compose na raiz com Postgres, API e dois frontends preparados para build.**

## Performance

- **Tasks:** 3
- **Files created:** 12+

## Accomplishments

- `pnpm-workspace.yaml` com `apps/*`
- `docker-compose.yml` com `postgres:16-alpine`, healthcheck, serviços `api`, `web-jogador`, `web-admin`, volumes para `node_modules`
- `README.md` com `docker compose up --build` e tabela de URLs
- Dockerfiles stub em cada app (`FROM node:22-bookworm-slim`)

## Verification

- `docker compose config` — exit 0

## Self-Check: PASSED

## Deviations

- `pnpm install` executado via `npx pnpm@9.15.0` em vez de `corepack` (erro de assinatura do corepack no host).
