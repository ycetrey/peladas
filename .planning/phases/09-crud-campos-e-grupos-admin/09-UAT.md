---
status: testing
phase: 09-crud-campos-e-grupos-admin
source:
  - .planning/ROADMAP.md (Phase 9 success criteria)
  - 09-UI-SPEC.md
  - 09-01-PLAN.md / 09-02-PLAN.md (must_haves)
started: 2026-04-26T00:00:00Z
updated: 2026-04-26T00:00:00Z
---

## Static checks (agent, 2026-04-26)

- `apps/web-admin/lib/api.ts` expõe `getVenue`, `updateVenue`, `deleteVenue`, `getGroup`, `updateGroup`, `deleteGroup`.
- Rotas Next: `venues/page`, `venues/nova`, `venues/[id]/editar`, `groups/page`, `groups/nova`, `groups/[id]/editar`.
- API: `VenueHasMatchesError` / `GroupHasMatchesError` mapeados a 409 em `domain-exception.filter.ts`; e2e em `venues.e2e-spec.ts` (requer `DATABASE_URL` / ambiente e2e).
- Playwright MCP: browser indisponível nesta sessão — UI abaixo fica **pending** até confirmação manual ou smoke local.

## Current Test

number: 1
name: Listagem Campos (`/venues`)
expected: |
  Com admin autenticado, abrir `/venues`. Deve ver título estilo painel, cartões (`panel-card`), link ou botão para **Novo campo** (`/venues/nova`) e cada item leva a `/venues/[id]/editar`.
awaiting: user response

## Tests

### 1. Listagem Campos (`/venues`)
expected: Lista em cartões; links para `/venues/nova` e edição por item.
result: pending

### 2. Novo campo (`/venues/nova`)
expected: Fluxo de criação; após sucesso, redireciona coerente com partidas (ex.: listagem).
result: pending

### 3. Editar campo (`/venues/[id]/editar`)
expected: Voltar, Salvar, Deletar; nome/localidade; erro em `alert`; 409 com mensagem clara se DELETE com partidas.
result: pending

### 4. API / DELETE campo sem partidas
expected: DELETE remove; com partidas, 409 e corpo `{ error: { code: VenueHasMatchesError, message } }`.
result: pending

### 5. Listagem Grupos (`/groups`)
expected: Igual padrão a campos; `/groups/nova` e `/groups/[id]/editar`.
result: pending

### 6. Novo grupo (`/groups/nova`)
expected: Criação por nome; redirecionamento coerente.
result: pending

### 7. Editar grupo (`/groups/[id]/editar`)
expected: Nome, bloco Membros (add/remove), Salvar/Deletar, alertas e 409 em conflito.
result: pending

### 8. API / DELETE grupo com partidas
expected: 409 `GroupHasMatchesError` quando aplicável.
result: pending

### 9. Proxy `/api/backend` e credenciais
expected: Chamadas get/patch/delete passam pelo proxy com `credentials` como nas partidas.
result: pending

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps

<!-- Preencher quando houver falhas reportadas -->
