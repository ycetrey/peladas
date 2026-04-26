# Phase 08 — Technical research

**Date:** 2026-04-26  
**Question:** O que é preciso saber para planear bem **fixtures partilhados**, **Tailwind + shadcn** em **dois** Next.js 15 (App Router) no monorepo **pnpm**, e **CI** (Storybook + E2E)?

---

## Findings

### Monorepo e `packages/fixtures`

- Acrescentar `packages/*` a `pnpm-workspace.yaml` para o pacote `@peladas/fixtures`.
- O pacote deve exportar apenas **tipos/DTOs espelhando JSON da API** e **constantes estáveis** (IDs de utilizador/partida do `seed`) — não exportar SQL nem entidades Prisma, para não acoplar o front ao ORM.
- Versão TypeScript alinhada à dos apps (`~5.7`); `main`/`types` em `package.json` apontando para `src/index.ts`.

### Tailwind + shadcn/ui em Next.js 15 (existente)

- Instalar Tailwind v4 ou v3 conforme CLI shadcn detectar; a documentação oficial usa `npx shadcn init` para detectar o framework e gerar `components.json`, `tailwind` config e aliases.
- Ficheiros típicos: `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css` com `@tailwind base/components/utilities` (ou equivalente v4 `@import "tailwindcss"` se o init escolher v4).
- **Aliases:** `components.json` deve definir `@/components`, `@/lib/utils`, etc.; o `tsconfig.json` de cada app precisa de `paths` coerentes (`@/*` → `./*`).
- **RSC:** manter `rsc: true` nos apps onde componentes servidor forem padrão; componentes shadcn com `"use client"` quando usarem estado/Radix.
- **Coexistência:** durante a migração incremental, manter regras `.legacy` no Tailwind `content` para ficheiros que ainda usam classes CSS antigas, ou preservar folhas não-Tailwind até refactor.

### Storybook

- `@storybook/nextjs` (Storybook 8+) com framework Next; `stories` ao lado de componentes ou em `*.stories.tsx`.
- Stories de apresentação devem importar dados de `@peladas/fixtures` para alinhar com a forma da API.

### Playwright (CI)

- Configurar `playwright.config.ts` na raiz (ou por app) com `baseURL` via env (`PLAYWRIGHT_BASE_URL`).
- Em CI sem stack Docker completa, usar `test.skip` condicional ou job separado que faz `docker compose up` — documentar no README; smoke mínimo: homepage responde ou Storybook já valida render.

### Segurança

- Sem segredos em fixtures ou Storybook; apenas UUIDs públicos de desenvolvimento já presentes no seed.

---

## Validation Architecture

- **Build gates:** `pnpm --filter @peladas/web-jogador build` e `pnpm --filter @peladas/web-admin build` após integração Tailwind/shadcn.
- **Storybook:** `pnpm --filter @peladas/web-jogador exec storybook build` (e admin quando configurado) em CI para validar compilação de stories.
- **E2E:** Playwright com dataset estável (`@peladas/fixtures`); comandos documentados; job CI opcionalmente depende de API + seed (mesma stack que desenvolvimento).

---

## Recommendations (para o planner)

1. **Plano 08-01:** workspace + `packages/fixtures` + Tailwind + shadcn init em ambos os apps + prova mínima (`Button` + um ecrã ou header com utility Tailwind).
2. **Plano 08-02:** Storybook + stories baseadas em fixtures + Playwright smoke + workflow CI (build + storybook build; E2E condicional).
3. Ordem de migração visual (Phase 08): **shell/layout** → **lista de partidas (jogador)** → **detalhe** → **dashboard admin** — alinhado ao impacto do utilizador.

---

## RESEARCH COMPLETE
