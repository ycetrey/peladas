# Phase 5 — UI-SPEC (Jogador)

**App:** `apps/web-jogador`  
**Audience:** Jogador informal (telefone / desktop)

## Visual language

- **Base:** claro, alto contraste, sem marca corporativa definida — usar neutros (fundo `#f8fafc`, texto `#0f172a`, acento `#16a34a` para ações positivas, `#dc2626` para cancelar/destrutivo).
- **Tipografia:** stack sistema (`system-ui, sans-serif`); `h1` página ≤ `1.75rem`; corpo `1rem`, `line-height` 1.5.
- **Espaçamento:** escala 4/8/16/24 px; largura máxima conteúdo `42rem` centrado.

## Layout

- **Shell:** `<header>` com título “Peladas”, link “Partidas” → `/`, bloco **“O teu ID”** (input UUID + botão Guardar) persistente no topo ou rodapé fixo discreto.
- **Lista (`/`):** cartões ou linhas com título, data/hora formatada em **timezone local** (ISO da API → `toLocaleString('pt-PT')`), estado `status` da partida (badge).
- **Detalhe (`/matches/[id]`):** resumo da partida; secção **“A tua inscrição”** com estado (Sem inscrição / Titular / Reserva / Cancelado), `queueOrder` se relevante; botões Inscrever (com posição) e Cancelar inscrição quando aplicável; mensagens de erro da API inline vermelho.

## Interação

- **Inscrever:** obrigatório escolher `PlayerPosition` antes de confirmar; loading nos botões; após sucesso, refetch estado.
- **Cancelar:** confirmação nativa `window.confirm` mínima v1.
- **Erros:** toast simples ou `role="alert"` abaixo do botão com `error.message`.

## Acessibilidade (mínimo v1)

- Botões com `type="button"` onde não submeter form global; foco visível; labels associados aos inputs.

## Fora de âmbito UI v1

- Animações elaboradas; internacionalização; dark mode.

---

*Phase: 05-app-next-js-jogador*
