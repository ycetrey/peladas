# Phase 9: CRUD campos e grupos (admin) — Context

**Gathered:** 2026-04-26  
**Status:** Ready for execution (plans below)  
**Source:** Pedido explícito — mesma lógica de CRUD/navegação das telas de partidas para **Campos** (`/venues`) e **Grupos** (`/groups`).

<domain>

## Phase Boundary

- **API (Nest):** Completar CRUD além de list/create: `GET /venues/:id`, `PATCH /venues/:id`, `DELETE /venues/:id`; `GET /groups/:id`, `PATCH /groups/:id`, `DELETE /groups/:id`. Respeitar dono (`createdByUserId`) e `AdminGuard`. Membros de grupo mantêm endpoints existentes (`POST/DELETE .../members`).
- **Admin (Next):** Reorganizar UX para espelhar **Painel de partidas** + **Nova partida** + **Editar partida**: listagem com `panel-card`, rotas `nova` e `[id]/editar`, ações explícitas Salvar/Deletar na edição.
- **Fora de âmbito:** Alterar modelo Prisma (não obrigatório); Google Places (manter como hoje); jogador app.

</domain>

<decisions>

## Implementation Decisions

### D-01 — Paridade com partidas (UX)

- Listagem principal (`/venues`, `/groups`) usa **dashboard-layout** / **sidebar** opcional ou conteúdo único com **panel-card** por secção, como em `app/(app)/page.tsx` para partidas.
- Criação em **`/venues/nova`** e **`/groups/nova`** (extrair formulários da página monolítica actual).
- Edição em **`/venues/[id]/editar`** e **`/groups/[id]/editar`**: cabeçalho com `← Voltar`, botões **Salvar** (submit PATCH) e **Deletar** (DELETE com `confirm`).

### D-02 — DELETE com partidas associadas

- Antes de `delete` em `Venue` ou `Group`, contar `matches` com `venueId` / `groupId`.
- Se `count > 0`, lançar erro de domínio dedicado (ex.: `VenueHasMatchesError`, `GroupHasMatchesError`) mapeado a **HTTP 409** no `DomainExceptionFilter`.

### D-03 — PATCH venue

- Campos editáveis: `name`, `locality` (opcional). **`googlePlaceId`** não exposto em PATCH (imutável após criação) salvo decisão futura explícita.

### D-04 — PATCH group

- Campo editável: `name` apenas.

### D-05 — GET :id

- **Venue:** mesmo shape que entradas de listagem (`Venue`).
- **Group:** mesmo shape que em `findMany` (grupo + `members`).

### D-06 — Testes

- Pelo menos um teste e2e (Supertest) por recurso: patch ok, delete bloqueado com partida (seed ou setup mínimo), 404 se id alheio.

</decisions>

<canonical_refs>

## Canonical References

- `apps/web-admin/app/(app)/page.tsx` — listagem partidas + filtros
- `apps/web-admin/app/(app)/partidas/nova/page.tsx` — fluxo criação
- `apps/web-admin/app/(app)/partidas/[id]/editar/page.tsx` — barra de acções
- `apps/web-admin/app/(app)/venues/page.tsx` — estado actual (monopágina)
- `apps/web-admin/app/(app)/groups/page.tsx` — estado actual
- `apps/web-admin/lib/api.ts` — cliente HTTP
- `apps/api/src/venues/venues.controller.ts` / `venues.service.ts`
- `apps/api/src/groups/groups.controller.ts` / `groups.service.ts`
- `apps/api/src/common/filters/domain-exception.filter.ts`
- `apps/api/prisma/schema.prisma` — `Venue`, `Group`, `Match`

</canonical_refs>

---

*Phase: 09-crud-campos-e-grupos-admin*
