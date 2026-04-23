# Phase 5 — Technical Research

**Question:** What do we need to plan the Next.js jogador app well?

## Next.js 15 + App Router

- **Server Components** default: `fetch` em Server Components para listagem evita expor `NEXT_PUBLIC_*` só para leituras públicas; para ações **POST/DELETE** com corpo e cabeçalho dinâmico (`X-Player-User-Id`), usar **Server Actions** ou **Client Components** com `fetch` no browser.
- **v1 choice:** Lista e detalhe podem ser RSC com `fetch(API_URL + '/matches')` se `API_URL` for só servidor (`process.env.API_URL`); inscrição/cancelamento exigem **Client Component** (ou Server Action que encaminhe o header — mais complexo). Plano: **lista/detail em RSC** com env server-side; **bloco de inscrição** em client component com `NEXT_PUBLIC_API_BASE_URL` + CORS, ou tudo client na página de detalhe para simplicidade.
- **Simplificação aprovada no plano:** Página inicial e detalhe usam **Client fetch** com `NEXT_PUBLIC_API_BASE_URL` após `enableCors` na API — menos bifurcação server/client envs no Docker.

## CORS

- NestJS: `app.enableCors({ origin: [...] })` em `main.ts` condicionado a `NODE_ENV`/lista de origens — obrigatório para browser → API em portas distintas.

## DTOs e tipos

- Alinhar tipos TS ao JSON real (`Match`, `RegistrationStatus` string union). Gerar à mão interfaces em `apps/web-jogador/lib/types.ts` (sem openapi nesta fase).

## Docker

- `web-jogador` já monta volume e expõe `3002:3000`; injetar `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` no `docker-compose` para o serviço `web-jogador` (documentar que no host o browser usa localhost).

## Validation Architecture (Nyquist)

- **Dimensão funcional:** UAT manual — lista não vazia com seed; fluxo inscrever → estado CONFIRMED/SUBSTITUTE visível; cancelar → CANCELED ou promoção refletida após refresh.  
- **Dimensão regressão:** `pnpm --filter @peladas/web-jogador run build` obrigatório.

---

## RESEARCH COMPLETE

*Phase: 05-app-next-js-jogador*
