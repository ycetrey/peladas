# Peladas — Web jogador (`apps/web-jogador`)

Next.js (App Router) para o jogador: lista de partidas, detalhe e inscrições contra a API.

## Requisitos

- Node 22+ e `pnpm`
- API a correr (por defeito `http://localhost:3001`)

## Variáveis de ambiente

- **`NEXT_PUBLIC_API_BASE_URL`** — URL base da API **no browser** (ex.: `http://localhost:3001`). Em Docker Compose já vem definida para o host alcançar a API na porta exposta.

## Correr em desenvolvimento

```bash
pnpm --filter @peladas/web-jogador run dev
```

A app sobe em **`http://localhost:3002`** (alinhado com CORS por defeito na API: `WEB_JOGADOR_ORIGIN=http://localhost:3002`).

Garante que a API aceita o origin desta app (ver README na raiz do repositório).

## Painel «O teu ID»

O jogador escolhe um **UUID** de utilizador já existente na base (modo v1 sem login). O valor fica em `localStorage` com a chave `peladas_player_user_id`. Sem UUID válido guardado, a secção de inscrição pede para preencher o topo.

## UAT rápido (5 passos)

1. Arranca Postgres + API (Compose ou local) com utilizadores de teste na base.
2. `pnpm --filter @peladas/web-jogador run dev` e abre `http://localhost:3002`.
3. Cola um UUID de jogador existente no painel e clica **Guardar**.
4. Na lista, abre uma partida **OPEN** com inscrições abertas; verifica título, datas e estado.
5. Escolhe posição, **Inscrever**; confirma estado **Titular** ou **Reserva**; **Cancelar inscrição** com confirmação e verifica **Sem inscrição ativa**.
