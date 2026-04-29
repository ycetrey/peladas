# Peladas

## What This Is

Peladas é software para organizar **peladas** (partidas informais de futebol): criar partidas com janela de inscrição, fila de titulares e reservas, e montar os dois times (modo alternado ou sorteio ao final). Há um app para o **jogador** acompanhar e se inscrever, e um **admin** para criar partidas e acionar a formação dos times quando a lista fecha.

## Core Value

**Organizar uma pelada do “quem vai?” até os dois times prontos**, com regras claras de inscrição, fila e erro previsível quando algo não pode ser feito.

## Requirements

### Validated

(None yet — ship to validate)

### Active

High-level alignment with `.planning/REQUIREMENTS.md` (REQ-IDs). Current v1 focus:

- [ ] Fundação Docker + Prisma + modelo de domínio persistido
- [ ] Partidas criáveis com validação de janela e estados coerentes
- [ ] Inscrição, cancelamento com promoção de reserva, erros de negócio estáveis na API
- [ ] Geração de times A/B conforme modo da partida
- [ ] Interfaces Next.js (jogador e admin) consumindo a API em ambiente containerizado

### Out of Scope

- **TypeORM** — ADR: apenas Prisma para ORM/migrations
- **App mobile nativo** — web primeiro (Next.js)
- **Hardening transacional de inscrição, sorteio auditável com seed, jobs de status automáticos, regras avançadas de posição** — explicitamente v2 / follow-ups (ver `REQUIREMENTS.md` v2 e `intel/context.md`)

## Context

Domínio e contratos vêm do SPEC ingerido (`peladas_business_rules_base.md` via `intel/constraints.md`): enums (`MatchMode`, `MatchStatus`, `RegistrationStatus`, `PlayerPosition`), entidades lógicas (User, Match, Registration, Team, TeamPlayer), DTOs, repositórios conceituais, regras de validação, alocação de times e casos de uso (criar partida, inscrever, cancelar, gerar times). O ingest registrou **Prisma** como fonte de verdade de persistência; menções a TypeORM em seções guia do documento fonte estão **supersedidas** pelo ADR.

## Constraints

- **Stack (locked):** Docker-first no dev local; três serviços em containers — API NestJS, Next.js jogador, Next.js admin; **Prisma única** camada ORM/migrations; sem TypeORM — ver `ingest-sources/stack-intent.md` e `intel/decisions.md`
- **Domínio:** Regras de criação de partida (janelas, `maxPlayers` par positivo, `maxSubstitutes` ≥ 0); inscrição só com partida `OPEN` e dentro da janela; status de inscrição por vagas; geração de times só com titulares confirmados = `maxPlayers`
- **Alocação v1:** `DRAW_AT_END` pode usar split aleatório simples; produção “auditável” com seed fica para v2
- **Solo workflow:** Fases são entregas verificáveis, não cerimônia de projeto

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Docker-first, 3 serviços (API + 2× Next) | Reprodutibilidade dev/CI, pouca toolchain no host | — Pending |
| Prisma only (no TypeORM) | ADR explícito; alinha ingest e implementação | — Pending |
| Monorepo ou multi-package aceitável | Compose mapeia contextos de build por serviço | — Pending |
| Business errors explícitos na API | Contrato C-SPEC-005; UX e integração previsíveis | — Pending |

## Evolution

Após cada fase: mover requisitos para **Validated** quando verificados; ajustar **Out of Scope** se algo v2 entrar ou sair; atualizar **Key Decisions** com outcome (✓ / ⚠️). Após milestone: revisar Core Value e Context.

---
*Last updated: 2026-04-22 after new-project-from-ingest (roadmap + requirements inicial)*
