# Phase 5 — Technical Research (refresh)

**Question:** What do we need to know to **implement** the Next.js jogador phase well (not only plan)?  
**When:** 2026-04-23 (`/gsd-plan-phase 5 --research`)  
**Sources:** Next.js 15 docs (env + data security + Server/Client Components), Nest CORS guides, estado atual do monorepo.

---

## 1. Arquitetura de dados: três opções

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| **A — Tudo cliente** | `NEXT_PUBLIC_API_BASE_URL` + `fetch` em páginas `'use client'` | Um só modelo mental; cabeçalhos `X-Player-User-Id` triviais; alinha com plano 05-01 atual | URL da API exposta no bundle; `NEXT_PUBLIC_*` fixo em **build time** (atenção Docker multi-stage) |
| **B — Híbrido** | Lista/detalhe em **Server Components** com `process.env.API_URL` (sem prefixo público) + ilha cliente só para inscrição | Menos JS no cliente; base URL interna em Docker pode ser `http://api:3001` | Duas bases URL (servidor vs browser); cuidado para não importar módulos com segredos em client; usar `server-only` no módulo de dados se misturar |
| **C — Server Actions** | Actions chamam API com `fetch` servidor-side | Esconde URL da API ao browser para mutações | Nest API não é “server action native”; serialização de erros de domínio; mais boilerplate para headers dinâmicos |

**Recomendação mantida (v1): Opção A** — coerente com PLAN 05-01/05-02 já aprovados, menor risco de regressão de boundaries. **Reavaliação v2:** Opção B quando existir autenticação cookie ou rate-limit por IP no servidor Next.

---

## 2. Next.js 15 — variáveis de ambiente

- Variáveis **sem** prefixo `NEXT_PUBLIC_` existem só no runtime Node do servidor (RSC, rotas, `generateMetadata`, etc.).
- `NEXT_PUBLIC_*` são **inlined em `next build`** no bundle cliente — **não mudam** só por alterar `.env` na imagem já construída sem rebuild. Para Compose com volume de código em dev (`next dev`), o valor pode ser lido ao arrancar o dev server; para **produção** documentar: build args ou rebuild quando a URL da API mudar.
- Para ler env **em runtime** no App Router sem expor ao cliente: usar RSC dinâmico; a doc sugere padrões com APIs dinâmicas (`connection()` de `next/server` onde aplicável) para avaliar env em request time em vez de só build time — ver [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables).

---

## 3. Next.js 15 — segurança e boundaries

- [Data Security](https://nextjs.org/docs/app/guides/data-security): código cliente não deve importar módulos que leem segredos; props de Server → Client Components passam por serialização — não passar objetos com dados sensíveis.
- Pacotes **`server-only`** / **`client-only`** (ou equivalente integrado no Next) reduzem risco de importar `lib/api.ts` server-only num client component por engano. **Sugestão de execução:** se existir `lib/api-server.ts` no futuro, marcar com `import "server-only"`.
- **Custom headers** (`X-Player-User-Id`) em `fetch` browser são permitidos por CORS só se a API os listar em `Access-Control-Allow-Headers`.

---

## 4. CORS (NestJS + browser)

- `app.enableCors({ origin, methods, allowedHeaders })` é o padrão; **evitar `origin: true` / `*`** em produção.
- Lista de origens via env (`WEB_JOGADOR_ORIGIN` ou `CORS_ORIGINS` CSV) permite dev + staging sem alterar código.
- Clientes **non-browser** (curl, Prisma) não enviam `Origin`; callbacks `origin: (origin, cb) =>` devem permitir `!origin` se testes precisarem — **não** é requisito para Peladas v1 se só browsers forem suportados na UI.
- Se no futuro `credentials: 'include'` no `fetch`, a API deve `credentials: true` em CORS e **não** usar `*` em `Access-Control-Allow-Origin`.

---

## 5. Docker Compose e rede

- Serviço `web-jogador` publica `3002:3000`; o **browser** no host fala com API em `http://localhost:3001` (porta publicada do serviço `api`).
- Dentro da rede Docker, outro nome seria `http://api:3001` — útil apenas para **fetch servidor** (Opção B); com Opção A, `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` continua correcto para o utilizador no host.

---

## 6. Contratos JSON (API existente)

- Partidas: `{ matches: Match[] }`, `{ match: Match }` — enums como strings.
- Erros: `{ error: { code: string, message: string } }` com 404 para `MatchNotFoundError`.
- Inscrições: POST corpo `{ preferredPosition }`; novo GET `me` (planeado em 05-02) deve devolver `{ registration: null | object }` estável para a UI fazer discriminated union TS.

---

## 7. UX técnica (mutações)

- `useTransition` (React 19) para marcar pending em botões Inscrever/Cancelar sem bloquear renderização de leitura.
- Após mutação bem-sucedida: **refetch** explícito do GET `me` e opcionalmente do GET match (se datas de janela puderem mudar — hoje não).
- `window.confirm` aceite para v1; substituir por `<dialog>` em v2.

---

## 8. Bibliotecas — deferidas

- **TanStack Query:** útil para cache/refetch; adiar para não aumentar superfície na fase 5.
- **OpenAPI / zod:** gerar tipos a partir da API; adiar — tipos manuais em `lib/types.ts` bastam v1.

---

## 9. Validação (extensão Nyquist-lite)

| Risco | Mitigação de pesquisa |
|-------|------------------------|
| Bundle cliente expõe URL API | Aceite v1; sem segredos em `NEXT_PUBLIC_*` |
| CORS mal configurado | Teste manual: abrir DevTools → rede → ver preflight `OPTIONS` 204 e header `Allow` |
| Regressão import type DTO | **Nunca** `import type` para classes usadas em decoradores Nest (`@Body()`) — já corrigido na API |

---

## 10. Referências externas (URLs)

- [Next.js — Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js — Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

---

## RESEARCH COMPLETE

*Phase: 05-app-next-js-jogador*  
*Changelog: 2026-04-23 — refresh explícito (`--research`); Opção A revalidada; acrescentadas secções env build-time, data security, CORS produção, UX mutação.*
