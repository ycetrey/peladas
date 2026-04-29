# Peladas — Web admin (`apps/web-admin`)

Next.js (App Router): login de administrador, criação de partidas e geração de equipas contra a API.

## Requisitos

- Node 22+ e `pnpm`
- API a correr

## Variáveis de ambiente

- **`NEXT_PUBLIC_API_BASE_URL`** — URL da API no browser (ex.: `http://localhost:3001`).
- **`API_INTERNAL_BASE_URL`** — (opcional, Docker) URL da API vista **pelos Route Handlers** no servidor, ex.: `http://api:3001` quando o browser usa `localhost`.
- **`JWT_SECRET`** — Igual ao da API; usado no middleware e no layout para ler o JWT do cookie httpOnly.

## Desenvolvimento

```bash
pnpm --filter @peladas/web-admin run dev
```

Por defeito a app usa a porta **`3003`** (alinhado com `WEB_ADMIN_ORIGIN` na API).

## Autenticação

1. Abre `/login`.
2. Inicia sessão com conta **admin** (seed: `admin@peladas.local` / `password` após `db:seed`).
3. Rotas da área autenticada exigem JWT válido com `isAdmin: true`.

## Estrutura de UI

- `components/atoms` — elementos mínimos (ex.: `Spinner`).
- `components/molecules` — compostos simples (ex.: `TextField`).
- `components/organisms` — shell (`AppShellRoot`, `AppShellHeaderBar`, `AppShellMain`; objeto `AppShell` opcional para agrupar).
- Rotas públicas em `app/(public)/`, área autenticada em `app/(app)/`.
