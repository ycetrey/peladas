# Phase 08: base de dados mock e dependências de UI — Discussion log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `08-CONTEXT.md`.

**Date:** 2026-04-26  
**Phase:** 08 — base de dados mock e dependências de UI  
**Areas discussed:** Área selection, estratégia de dados, stack UI, monorepo, abrangência CI

---

## Área selection

| Option | Description | Selected |
|--------|-------------|----------|
| Estratégia de dados | Seed vs MSW vs fixtures vs combinações | ✓ |
| Stack de UI | Tailwind/shadcn vs alternativas | ✓ |
| Monorepo | Pacote partilhado vs por app | ✓ |
| Abrangência | Dev-only vs CI completa | ✓ |
| Todas as acima | Discussão completa | ✓ (user choice) |

**User's choice:** Todas as quatro áreas.

---

## Estratégia de dados (dev/CI)

| Option | Description | Selected |
|--------|-------------|----------|
| Seed apenas | Seed Prisma + docs | |
| Seed + MSW | + interceptação HTTP nos Next | |
| Seed + fixtures | Seed + `packages/fixtures` partilhado | ✓ |
| Combinação full | Seed + fixtures + MSW opcional | |

**User's choice:** Seed + `packages/fixtures` (tipado, partilhado).  
**Notes:** MSW não exigido na decisão inicial; seed mantém-se como fonte com DB.

---

## Stack de UI

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind + shadcn | Design system Radix-based | ✓ |
| Tailwind only | Sem shadcn | |
| Vanilla + tokens | Manter CSS actual | |

**User's choice:** Tailwind CSS + shadcn/ui.

---

## Monorepo

| Option | Description | Selected |
|--------|-------------|----------|
| `packages/ui` desde já | Componentes + tokens centralizados | |
| Por app primeiro | Implementar nos dois apps; extrair depois | ✓ |
| Tokens só partilhados | Mínimo partilhado | |

**User's choice:** Começar por app; extrair pacote quando duplicação doer.

---

## Abrangência fixtures/mocks na CI

| Option | Description | Selected |
|--------|-------------|----------|
| Dev apenas | CI sem obrigatoriedade de fixtures | |
| Dev + E2E | + Playwright estável | |
| Dev + CI UI completa | + E2E + jobs tipo Storybook | ✓ |

**User's choice:** Desenvolvimento + E2E + jobs de UI na pipeline.

---

## Claude's discretion

- Ordem de migração incremental Tailwind/shadcn por ecrã.  
- Detalhe de tipagem interna de `packages/fixtures` desde que alinhado à API.

## Deferred ideas

- MSW como follow-up se necessário após fixtures.
