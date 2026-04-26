# Phase 08: base de dados mock e dependências de UI — Context

**Gathered:** 2026-04-26  
**Status:** Ready for planning

<domain>
## Phase boundary

Introduzir **dependências de UI** (Tailwind CSS + shadcn/ui) nos dois apps Next.js e criar uma base **reutilizável de dados de teste/demonstração** através de **`packages/fixtures`** alinhada ao contrato HTTP, mantendo o **seed Prisma** como fonte de verdade para ambiente com base de dados.

Fora de escopo desta fase (capacidades novas de produto): regras de negócio adicionais, autenticação real, notificações, alterações ao modelo de domínio além do necessário para consumir fixtures.

</domain>

<decisions>
## Implementation decisions

### Dados e fixtures

- **D-01:** Manter e evoluir o **seed Prisma** como cenário principal em desenvolvimento com Postgres.
- **D-02:** Criar **`packages/fixtures`** com dados **tipados** partilhados; o formato deve **espelhar respostas da API** (DTOs JSON que `web-jogador` e `web-admin` já consomem), não linhas internas de base de dados, para evitar desvio entre mock e integração real.
- **D-03:** Fixtures e documentação associada devem suportar **CI**: desenvolvimento local, **testes E2E** (ex. Playwright) e **jobs de UI** (ex. build Storybook), todos com dados estáveis derivados do mesmo pacote.

### UI stack

- **D-04:** Adoptar **Tailwind CSS** + **shadcn/ui** (Radix) em ambos os frontends; migrar do CSS vanilla actual de forma **incremental** (ecrãs/componentes prioritários primeiro — discricionaridade de ordem no plano).

### Monorepo

- **D-05:** **Começar** Tailwind/shadcn **dentro de cada app** (`web-jogador`, `web-admin`); **extrair** `packages/ui` (ou equivalente) **só quando** a duplicação se tornar problemática.

### Claude's discretion

- Ordem concreta de migração visual (lista vs detalhe vs admin) e nível mínimo de cobertura Storybook na primeira entrega.
- Estratégia exacta de tipagem dos fixtures (reexport de tipos dos apps vs duplicação mínima) desde que o contrato permaneça o da API.

</decisions>

<canonical_refs>
## Canonical references

**Downstream agents MUST read these before planning or implementing.**

### Planning & prior phases

- `.planning/ROADMAP.md` — Phase 8 boundary; dependency on Phase 7
- `.planning/REQUIREMENTS.md` — REQ-IDs when assigned to this phase
- `.planning/phases/07-leitura-e-organiza-o-dos-dados/07-CONTEXT.md` — ausência vs inscrição; agregados
- `.planning/phases/05-app-next-js-jogador/05-CONTEXT.md` — fetch nativo, erros `{ code, message }`, ports

### Implementation touchpoints

- `pnpm-workspace.yaml` — **must** passar a incluir `packages/*` quando `packages/fixtures` for criado
- `apps/api/prisma/seed.ts` — seed existente a alinhar conceitualmente com cenários dos fixtures quando útil
- `apps/web-jogador/app/globals.css` — estilos actuais a reconciliar com Tailwind (migração incremental)
- `apps/web-admin/` — mesmo padrão de migração

</canonical_refs>

<code_context>
## Existing code insights

### Reusable assets

- **Prisma seed:** cenários ricos já documentados no README; continua como referência para “estado real” da API.
- **Componentes actuais** (`match-card`, shells, páginas admin/jogador): candidatos a refactor para Tailwind/shadcn sem mudar contratos da API.

### Established patterns

- **Next.js 15 App Router**, React 19, **fetch nativo** (sem React Query na v1 — Phase 5).
- **Erros de domínio** mapeados para mensagens PT na UI do jogador.

### Integration points

- Novo pacote `packages/fixtures` referenciado por `apps/web-jogador`, `apps/web-admin`, e futuros testes E2E; workspaces pnpm a actualizar.
- Documentação em `README.md` para comandos de seed vs uso de fixtures em CI.

</code_context>

<specifics>
## Specific ideas

- Utilizador escolheu discussão completa das quatro áreas (estratégia de dados, stack UI, monorepo, abrangência CI).
- **MSW** não foi seleccionado como requisito inicial; pode ser reavaliado no plano se fixtures + API real não cobrirem um caso (ex. offline forçado).

</specifics>

<deferred>
## Deferred ideas

- Pacote `packages/ui` partilhado desde o dia zero (rejeitado em favor de extrair após duplicação).
- Estratégia “seed apenas” sem pacote de fixtures (rejeitada).

### Reviewed todos (not folded)

- Nenhum todo pendente associado pela ferramenta `todo match-phase` para a fase 8.

</deferred>

---

*Phase: 08-base-de-dados-mock-e-depend-ncias-de-ui*  
*Context gathered: 2026-04-26*
