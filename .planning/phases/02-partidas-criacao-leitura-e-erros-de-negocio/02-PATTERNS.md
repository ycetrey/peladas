# Phase 2 — Pattern map

## Analogs in repo

| New concern | Closest existing | Notes |
|-------------|------------------|-------|
| HTTP module | `apps/api/src/health/health.module.ts` | `@Module`, `controllers`, `providers` |
| DI + DB | `apps/api/src/prisma/prisma.service.ts` | Inject `PrismaService` in match service |
| Entry wiring | `apps/api/src/app.module.ts` | Add `MatchesModule` to `imports` |

## Files to touch (expected)

- `apps/api/src/matches/**` (new)
- `apps/api/src/app.module.ts`
- `apps/api/package.json` (devDeps: jest, supertest, types)
- `README.md` (curl examples)
