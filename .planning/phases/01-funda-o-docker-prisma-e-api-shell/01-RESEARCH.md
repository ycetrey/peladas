# Phase 1 — Technical research: Docker + monorepo + Nest + Prisma + Next

**Research date:** 2026-04-22  
**Phase:** 01 — Fundação Docker, Prisma e API shell  
**Question:** What do we need to know to plan this phase well?

## Executive summary

- **Monorepo:** `pnpm` workspaces with `apps/*` is a common pattern for Nest + multiple Next apps; single `docker-compose.yml` at repo root with per-service `build.context` keeps the ADR’s “one command up” story simple.
- **Prisma in Nest:** Prisma Client generated in `apps/api`; migrations run against Postgres via `DATABASE_URL`; `prisma db seed` for USR-01 proof (per `01-CONTEXT.md` D-07).
- **Docker dev:** Bind-mount sources + anonymous or named volumes for `node_modules` inside each Node image avoids host installs (D-09); use `target: development` or multi-stage Dockerfiles with dev dependencies only in dev stage.
- **Health:** Nest `@nestjs/terminus` or a minimal `GET /health` returning JSON `{ "status": "ok" }` is enough for INFRA-02 verification in containers.

## Stack choices (aligned with CONTEXT)

| Topic | Choice | Notes |
|-------|--------|--------|
| Package manager | pnpm workspaces | Lockfile `pnpm-lock.yaml`; `packageManager` field in root `package.json` |
| Node | 22 LTS (or 20 LTS) | Pin same major in all Dockerfiles (`node:22-bookworm-slim`) |
| DB | PostgreSQL 16 | Official image; healthcheck `pg_isready` |
| ORM | Prisma | `schema.prisma` under `apps/api/prisma/` |
| Compose | v2 plugin | `docker compose up --build` documented in README |

## Pitfalls

- **Prisma in Docker:** run `prisma generate` after `npm install` / `pnpm install` in image build; migrations need DB reachable — use `depends_on` + healthcheck on `db` before `api` starts migrate job.
- **Next in Docker:** set `output: 'standalone'` for smaller runtime images when moving beyond dev (phase 1 can use `next dev` in dev target).
- **Windows paths:** document WSL2 or Docker Desktop file sharing if bind mounts fail (host-specific, README note only).

## Environment availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Docker Desktop / Engine | INFRA-01 | ✓ assumed | 24+ | Podman Compose (document only if needed) |
| pnpm (optional on host) | local scripts | optional | 9+ | Run `corepack enable` inside container only |

## Validation Architecture

> Nyquist / Dimension 8 — `workflow.nyquist_validation: true` in `.planning/config.json`.

### Test framework

| Property | Value |
|----------|-------|
| Framework | **Jest** (Nest default) in `apps/api`; **none** yet for Next shells (Wave 0 or manual smoke) |
| Config file | `apps/api/package.json` jest block (created in plans) |
| Quick run command | `pnpm --filter @peladas/api test` (after Wave 0) |
| Full suite command | `pnpm --filter @peladas/api test` |

### Phase requirements → test map

| Req ID | Behavior | Test Type | Automated command | File exists? |
|--------|----------|-----------|---------------------|--------------|
| DATA-02 | Migrations apply on empty DB | integration | `pnpm --filter @peladas/api exec prisma migrate deploy` in CI container | ❌ Wave 0 |
| USR-01 | Seed creates user row | integration | `pnpm --filter @peladas/api exec prisma db seed` | ❌ Wave 0 |
| INFRA-02 | Health endpoint returns 200 | smoke | `curl -sf http://localhost:${API_PORT:-3001}/health` | ❌ manual until compose |

### Sampling rate

- **Per task commit:** `pnpm --filter @peladas/api test` when tests exist; else `pnpm --filter @peladas/api exec prisma validate`
- **Per wave:** full `pnpm -r build` where applicable
- **Phase gate:** `docker compose up --build` succeeds; `curl` health; seed runs

### Wave 0 gaps

- [ ] `apps/api/test/health.e2e-spec.ts` — smoke GET /health
- [ ] `apps/api/prisma/seed.ts` — USR-01 seed user
- [ ] Jest config if stripped from Nest default

## Security domain

### Applicable ASVS (L1-oriented)

| ASVS | Applies | Note |
|------|---------|------|
| V5 Input validation | Partial | Prisma parameterized queries; no user HTTP input in phase 1 beyond health |
| V9 Logging | Low | Health only; avoid secrets in logs |
| V12 Files / resources | Low | Docker bind mounts — do not mount `.env` with secrets into public images |

### Known patterns

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| SQL injection | Tampering | Prisma ORM only |
| Exposed DB port | Information disclosure | Bind Postgres to internal network only; optional host port for local debugging with warning |

## Sources

### Primary

- NestJS docs — Docker / standalone deployment patterns  
- Prisma docs — `migrate`, `db seed`, Nest integration  
- Next.js docs — Docker examples for development  

### Secondary

- pnpm workspace documentation  

## Metadata

**Confidence:** High for stack; Medium for exact Docker Desktop edge cases on Windows hosts.  
**Valid until:** 2026-05-22

---

## RESEARCH COMPLETE

Phase 1 planning can proceed with monorepo + Prisma-in-API + Compose-first dev.
