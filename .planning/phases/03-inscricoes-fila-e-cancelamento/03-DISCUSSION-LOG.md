# Phase 3: Inscrições, fila e cancelamento — Discussion Log

> Audit trail. Decisions captured in `03-CONTEXT.md`.

**Date:** 2026-04-23  
**Mode:** Batch (user invoked `/gsd-discuss-phase 3` together with verify + plan)

## Summary of captured decisions

| Area | Choice |
|------|--------|
| Player identity (v1) | Header **`X-Player-User-Id`** (UUID of existing `User`), same dev pattern as Phase 2 organizer |
| HTTP shape | Controller base `matches/:matchId/registrations` — `POST /` register, `DELETE /me` cancel own |
| Promotion (REG-03) | Prisma **`$transaction`**: cancel titular `CONFIRMED`, then promote first `SUBSTITUTE` by `queueOrder` ascending |
| Concurrency | v1 sequential transaction (no extra locking); v2 `REG-TX-01` noted in deferred |
| Full slots | New **`NoRegistrationSlotsError`** (domain, HTTP 400) for RULE-03 reject when titular + substitute pools full |

## Deferred ideas

- Transacional anti-overbooking sob concorrência pesada — `REG-TX-01` (v2)
