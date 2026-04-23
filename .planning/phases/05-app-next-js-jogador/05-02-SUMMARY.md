---
phase: 05-app-next-js-jogador
plan: 02
subsystem: api, web-jogador
tags: [nestjs, supertest, nextjs, registrations]

requires:
  - phase: 05-app-next-js-jogador
    provides: 05-01 lista/detalhe/CORS/cliente
  - phase: 03-inscricoes-fila-e-cancelamento
    provides: POST/DELETE inscrições
provides:
  - GET `/matches/:matchId/registrations/me` (inscrição ativa ou `null`)
  - e2e + README raiz para o contrato
  - `getMyRegistration`, `registerForMatch`, `cancelMyRegistration` na UI
  - Secção «A tua inscrição» no detalhe com erros mapeados
  - `apps/web-jogador/README.md`

key-files:
  modified:
    - apps/api/src/registrations/registrations.service.ts
    - apps/api/src/registrations/registrations.controller.ts
    - apps/api/src/registrations/registrations.e2e-spec.ts
    - apps/web-jogador/lib/api.ts
    - apps/web-jogador/app/matches/[id]/page.tsx
    - README.md
  created:
    - apps/web-jogador/README.md

requirements-completed: [UIJ-02, UIJ-03]

duration: —
completed: 2026-04-22
---

# Phase 5 (05-02): GET me + inscrição na UI

**API expõe estado da inscrição do jogador; página de detalhe permite inscrever, cancelar e ver titular/reserva; contrato testado em e2e e documentado.**

## Deviations from Plan

Nenhuma relevante.

## Issues Encountered

Nenhum.

---
*Phase: 05-app-next-js-jogador*
