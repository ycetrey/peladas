---
status: testing
phase: 01-funda-o-docker-prisma-e-api-shell
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
started: 2026-04-22T23:32:00Z
updated: 2026-04-22T23:32:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Stop peladas-related containers/processes if running. Start fresh: bring Postgres (and optionally the full stack) up from a clean or restarted state so the app is not relying on a long-warmed session. Migrations apply without errors, seed completes if you run it, and a primary check (e.g. GET /health or a homepage load) returns live data — no silent startup failures.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Fresh start — compose/db up, migrations/seed succeed if run, primary health or page returns live data without startup errors
result: pending

### 2. Host-side Prisma migrate and seed
expected: With Postgres reachable on localhost, `apps/api/.env` containing `DATABASE_URL` for localhost, from repo root `pnpm run db:migrate` then `pnpm run db:seed` (or `npx pnpm@9.15.0 …` equivalents) exit 0; output shows migrations applied and seed finishes without Prisma errors
result: pending

### 3. API GET /health
expected: With API on port 3001, `GET http://localhost:3001/health` returns 200 and JSON including `"status":"ok"` and `"service":"peladas-api"`
result: pending

### 4. Web jogador home
expected: At `http://localhost:3002` (or the port mapped for web-jogador), the page visibly shows the heading **Peladas — Jogador** and copy describing the jogador Next.js app
result: pending

### 5. Web admin home
expected: At `http://localhost:3003` (or mapped admin port), the page visibly shows **Peladas — Admin** and copy for the admin area
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

[none yet]
