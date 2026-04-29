# Peladas — Web jogador (`apps/web-jogador`)

Next.js (App Router): lista de partidas, detalhe e inscrições contra a API, com **login por email/palavra-passe** e cookie httpOnly (proxy autenticado para a API).

## Requisitos

- Node 22+ e `pnpm`
- API a correr (por defeito `http://localhost:3001`)

## Variáveis de ambiente

- **`NEXT_PUBLIC_API_BASE_URL`** — URL base da API **no browser** para leituras públicas (lista/detalhe de partidas). Em Docker Compose já vem definida para o host alcançar a API na porta exposta.
- **`API_INTERNAL_BASE_URL`** — (opcional, Docker) URL da API para **Route Handlers** no servidor (`http://api:3001` dentro da rede Compose).
- **`JWT_SECRET`** — O mesmo segredo configurado na API (`JWT_SECRET`); usado no middleware e no layout para validar o token no cookie.

## Correr em desenvolvimento

```bash
pnpm --filter @peladas/web-jogador run dev
```

A app sobe em **`http://localhost:3002`** (alinhado com CORS por defeito na API: `WEB_JOGADOR_ORIGIN=http://localhost:3002`).

Garante que a API aceita o origin desta app (ver README na raiz do repositório).

## Autenticação

1. Abre `/login` e inicia sessão (seed de jogador: `player@peladas.local` / `password` após `db:seed`).
2. Inscrições e estado `registrations/me` passam pelo proxy `/api/backend/...` com o JWT do cookie.

## Estrutura de UI

- `components/atoms` — ex.: `Spinner`.
- `components/molecules` — ex.: `TextField`.
- `components/organisms` — `AppShellRoot` / `AppShellHeaderBar` / `AppShellMain` e `MatchCard` (`MatchCard.Root` + `LinkRow`, etc.); o layout do servidor importa os símbolos **nomeados** (evita `undefined` com módulos `"use client"`).
- `app/(public)/` — rotas sem sessão (login).
- `app/(app)/` — área autenticada (middleware + cookie).

## UAT rápido (5 passos)

1. Arranca Postgres + API com migrações e `db:seed`.
2. `pnpm --filter @peladas/web-jogador run dev` e abre `http://localhost:3002/login`.
3. Entra com `player@peladas.local` / `password`.
4. Na lista, abre uma partida **OPEN** com inscrições abertas; verifica título, datas e estado.
5. Escolhe posição, **Inscrever**; confirma estado **Titular** ou **Reserva**; **Cancelar inscrição** com confirmação e verifica **Sem inscrição ativa**.
