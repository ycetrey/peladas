---
phase: 05-app-next-js-jogador
plan: 01
subsystem: web-jogador, api
tags: [nextjs, cors, fetch]

requires:
  - phase: 02-partidas-criacao-leitura-e-erros-de-negocio
    provides: GET /matches, GET /matches/:id
provides:
  - CORS na API para origin do web-jogador (`WEB_JOGADOR_ORIGIN`)
  - `NEXT_PUBLIC_API_BASE_URL` no Compose para o browser
  - Cliente `lib/api.ts` + tipos; lista `/` e detalhe `/matches/[id]` (leitura)
  - Painel UUID `peladas_player_user_id` no layout

key-files:
  created:
    - apps/web-jogador/lib/types.ts
    - apps/web-jogador/lib/api.ts
    - apps/web-jogador/app/globals.css
    - apps/web-jogador/app/components/player-id-settings.tsx
    - apps/web-jogador/app/matches/[id]/page.tsx
  modified:
    - apps/api/src/main.ts
    - docker-compose.yml
    - apps/web-jogador/app/layout.tsx
    - apps/web-jogador/app/page.tsx
    - apps/web-jogador/package.json
    - apps/web-jogador/Dockerfile
    - README.md

requirements-completed: [UIJ-01]

duration: —
completed: 2026-04-22
---

# Phase 5 (05-01): Lista, detalhe leitura, CORS, cliente HTTP

**App jogador consome a API no browser com origem permitida e variável pública de base URL; lista e página de detalhe só leitura; identidade local no header preparada.**

## Deviations from Plan

- `web-jogador` `dev` e documentação alinham porta **3002** (CORS por defeito); Docker continua a mapear `3002:3000` no container.
- `Dockerfile` do jogador passa a copiar `lib/` para builds de imagem.

## Issues Encountered

Nenhum bloqueante; `pnpm` via Corepack no ambiente do agente falhou assinatura — validação com `npx next build` em `apps/web-jogador`.

---
*Phase: 05-app-next-js-jogador*
