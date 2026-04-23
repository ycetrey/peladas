# Phase 5: App Next.js jogador — Context

**Gathered:** 2026-04-23  
**Research refresh:** 2026-04-23 (`--research`) — ver `05-RESEARCH.md` §1–3  
**Status:** Ready for execution (planning complete)  
**Depends on:** Phases 2–4 (API partidas, inscrições, times)

## Phase boundary

Entregar **`apps/web-jogador`** como interface usável pelo **jogador** contra a API existente: ver partidas, abrir detalhe, inscrever/cancelar com identidade explícita, ver estado **titular / reserva / cancelado / sem inscrição**.

Fora de âmbito desta fase: autenticação real (OAuth), app admin (fase 6), edição de perfil, notificações, PWA offline.

## Decisões (locked)

1. **Stack:** Next.js 15 App Router já no monorepo; manter React 19; sem biblioteca de dados global na v1 (fetch nativo + componentes server onde fizer sentido).
2. **Identidade do jogador (v1):** UUID guardado em **`localStorage`** (chave estável documentada, ex. `peladas_player_user_id`), editável num campo de “definições” mínimas na própria UI ou só via `localStorage` com instrução README — preferir **painel mínimo** no layout (input + guardar) para não obrigar DevTools.
3. **Leitura do estado da inscrição:** Expor **`GET /matches/:matchId/registrations/me`** na API (resposta JSON com `registration: null` ou objeto com `status`, `queueOrder`, `preferredPosition`) para a UI cumprir UIJ-03 sem adivinhar.
4. **CORS / origem:** API Nest deve permitir `http://localhost:3002` (e variável de ambiente opcional) em **`enableCors`** para o browser falar com `http://localhost:3001`; alternativa rejeitada para v1: apenas proxy Next sem tocar na API (duplica config Docker). Pesquisa: evitar `origin: *` em produção; cabeçalhos custom na lista `allowedHeaders`.
5. **`NEXT_PUBLIC_*`:** valores inlined no `next build` — documentar implicações para imagens Docker de produção (rebuild quando a URL da API mudar).
6. **Erros de negócio:** Reutilizar contrato `{ error: { code, message } }`; mostrar `message` ao utilizador e `code` em texto secundário ou tooltip.
7. **Posição na inscrição:** Select ou botões com valores do enum `PlayerPosition` alinhados ao DTO da API.

## Canonical references

- `.planning/ROADMAP.md` — Phase 5 goal e success criteria  
- `.planning/REQUIREMENTS.md` — UIJ-01, UIJ-02, UIJ-03  
- `README.md` — portas Compose, cabeçalhos API  
- `apps/api/src/registrations/registrations.controller.ts` — POST/DELETE atuais  
- `apps/api/src/matches/matches.controller.ts` — GET list/detail  
- `docker-compose.yml` — `web-jogador` porta host `3002` → container `3000`

## Deferred (v2)

- Sessão segura, refresh tokens, ligação `User` ao dispositivo.  
- i18n; temas além do claro.  
- Testes E2E Playwright no CI (opcional como stretch pós-fase 5).

---

*Phase: 05-app-next-js-jogador*
