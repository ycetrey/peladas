# Phase 9 — Research

## RESEARCH COMPLETE

### Estado actual

| Recurso | API hoje | Admin hoje |
|--------|----------|------------|
| Venue | `GET /venues`, `POST /venues`, Google suggest + `from-google-place` | Uma página: criar + listar sem editar/apagar |
| Group | `GET /groups`, `POST /groups`, members POST/DELETE | Uma página: criar + membros sem editar nome/apagar grupo |

### Relações Prisma

- `Venue.matches` e `Group.matches` impedem apagar linha sem estratégia; usar verificação explícita + erro 409 (não depender só de FK se o schema já restringir — hoje `Match.venueId` é obrigatório, logo `onDelete` em `Venue` não está em cascade; confirmar migration: apagar venue com matches pode falhar a nível DB — preferir erro de domínio **antes** do delete para mensagem estável).

### Padrão HTTP existente

- Erros de domínio mapeados em `DomainExceptionFilter`: 404 / 403 / 400. Acrescentar conjunto `conflictCodes` → **409** para `VenueHasMatchesError` e `GroupHasMatchesError`.

### Risco

- E2e precisa de dados: reutilizar seed ou criar match mínimo ligado a venue/group para teste de conflito.

---

*Fim da pesquisa — suficiente para planear sem bloqueios.*
