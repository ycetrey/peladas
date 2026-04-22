---
phase: 01-funda-o-docker-prisma-e-api-shell
plan: 04
subsystem: ui
tags: nextjs, docker

requires:
  - phase: 01-01
    provides: compose service names and ports
provides:
  - Next.js 15 apps for jogador and admin with App Router
  - Dev Dockerfiles with pnpm + next dev
affects:
  - phase-05
  - phase-06

tech-stack:
  added: ["Next.js 15.2.4", "React 19"]
  patterns: ["App router layout + page per app"]

key-files:
  created:
    - apps/web-jogador/app/layout.tsx
    - apps/web-jogador/app/page.tsx
    - apps/web-admin/app/layout.tsx
    - apps/web-admin/app/page.tsx
  modified:
    - apps/web-jogador/Dockerfile
    - apps/web-admin/Dockerfile
    - apps/web-jogador/package.json
    - apps/web-admin/package.json

key-decisions:
  - "Next dev binds 0.0.0.0:3000 inside container; host ports 3002/3003"

patterns-established:
  - "Identical Next toolchain in both front apps"

requirements-completed:
  - INFRA-03

duration: 30min
completed: 2026-04-22
---

# Phase 1 — Plan 04 summary

**Dois apps Next.js com build de produção local OK; Dockerfiles dev com `pnpm dev`.**

## Verification

- `pnpm --filter @peladas/web-jogador exec next build` — OK
- `pnpm --filter @peladas/web-admin exec next build` — OK
- `docker compose build web-jogador web-admin` — **NOT RUN** (no Docker daemon)

## Self-Check: PARTIAL

## Deviations

- Docker image builds not verified in CI/agent environment.
