# Requirements: Peladas

**Defined:** 2026-04-22  
**Core Value:** Organizar uma pelada do “quem vai?” até os dois times prontos, com regras claras e erros previsíveis.

## v1 Requirements

### Infrastructure & developer experience (INFRA)

- [ ] **INFRA-01**: `docker compose` (ou equivalente documentado) sobe **database + api + web-jogador + web-admin** para desenvolvimento local
- [ ] **INFRA-02**: Imagem/container da **API NestJS** builda com sucesso de forma reprodutível
- [ ] **INFRA-03**: Imagens/containers dos dois apps **Next.js** (jogador e admin) buildam com sucesso

### Data & persistence (DATA)

- [ ] **DATA-01**: **Prisma** modela o domínio (User, Match, Registration, Team, TeamPlayer) e enums alinhados a `MatchMode`, `MatchStatus`, `RegistrationStatus`, `PlayerPosition`; **sem TypeORM**
- [ ] **DATA-02**: **Migrations** Prisma aplicam em banco limpo sem erro

### Users (USR)

- [ ] **USR-01**: Persistência de usuário/jogador com nome, posições preferidas e flag de admin conforme modelo lógico

### Matches (MAT)

- [ ] **MAT-01**: Partida pode ser criada com título, data/hora, modo, `maxPlayers`, `maxSubstitutes`, abertura/fechamento de inscrições e `recurringRule` opcional (semântica CreateMatchDto)
- [ ] **MAT-02**: Estados de partida do domínio (`DRAFT` … `CANCELED`) são suportados no modelo e nos fluxos v1 necessários (ao menos `OPEN` e transições usadas por inscrição/time)

### Registration (REG)

- [ ] **REG-01**: Jogador pode **inscrever-se** em partida `OPEN` com `preferredPosition`, dentro de `[registrationOpensAt, registrationClosesAt]`
- [ ] **REG-02**: Segunda inscrição ativa do mesmo usuário na mesma partida é **bloqueada** (`UserAlreadyRegisteredError` ou equivalente contratual)
- [ ] **REG-03**: **Cancelamento** de inscrição promove o primeiro reserva na fila a `CONFIRMED` quando aplicável

### Teams (TEAM)

- [x] **TEAM-01**: Com número de confirmados igual a `maxPlayers`, **times A e B** são criados e jogadores persistidos em `TeamPlayer` conforme modo (`ALTERNATED` intercala por `queueOrder`; `DRAW_AT_END` faz split — v1 pode ser aleatório não-seed)

### Business rules (RULE)

- [ ] **RULE-01**: Criação de partida valida: abertura antes do fechamento; fechamento antes do horário da partida; `maxPlayers` inteiro positivo **par**; `maxSubstitutes` ≥ 0
- [ ] **RULE-02**: Inscrição valida partida `OPEN` e instante atual dentro da janela de inscrição
- [ ] **RULE-03**: Determinação de status de inscrição: até encher titulares → `CONFIRMED`; depois até limite de reservas → `SUBSTITUTE`; sem vaga → rejeição explícita
- [x] **RULE-04**: Alocação em times obedece ao modo da partida (alternado vs. sorteio ao final) sobre o conjunto de inscrições confirmadas

### API surface (API)

- [ ] **API-01**: Endpoint/operação expõe **criar partida** (caso de uso CreateMatch) com validações de RULE-01
- [ ] **API-02**: Endpoint permite **obter partida por id** (leitura para detalhe)
- [ ] **API-03**: Endpoint permite **listar partidas** (mínimo viável para telas jogador/admin)
- [ ] **API-04**: Endpoint expõe **inscrever jogador** (RegisterPlayer) com RULE-02, RULE-03
- [ ] **API-05**: Endpoint expõe **cancelar inscrição** (CancelRegistration) com promoção REG-03
- [x] **API-06**: Endpoint expõe **gerar times** (GenerateTeams) quando pré-condição de TEAM-01 satisfeita

### Errors (ERR)

- [ ] **ERR-01**: Erros de negócio expostos de forma estável: pelo menos `MatchNotOpenError`, `RegistrationClosedError`, `UserAlreadyRegisteredError`, `InvalidMatchStateError` (mensagens/contrato previsíveis para cliente)

### UI — Jogador (UIJ)

- [x] **UIJ-01**: No app **jogador**, usuário vê **lista** de partidas (via API-03)
- [x] **UIJ-02**: No app jogador, usuário **inscreve** e **cancela** inscrição em partida elegível (API-04, API-05)
- [x] **UIJ-03**: No app jogador, usuário vê seu **status** de inscrição (titular/reserva/cancelado) na partida

### UI — Admin (UIA)

- [ ] **UIA-01**: No app **admin**, usuário pode **criar partida** com os campos de MAT-01 (API-01)
- [ ] **UIA-02**: No app admin, usuário pode **acionar geração de times** quando a regra de TEAM-01 é atendida (API-06)

## v2 Requirements

Deferred / follow-ups from domain advisory (`intel/context.md`).

### Concurrency & integrity

- **REG-TX-01**: Fluxo de inscrição em **transação** DB para evitar overbooking sob concorrência

### Draw & audit

- **DRAW-01**: Substituir aleatoriedade simples por estratégia **determinística/seed** e persistir seed para auditoria em `DRAW_AT_END`

### Allocation depth

- **POS-01**: Regras de posição (ex.: teto de goleiros, balanceamento por posição no sorteio)

### Automation

- **JOB-01**: Jobs/cron (ou equivalente) para transições automáticas de status `DRAFT→OPEN`, `OPEN→CLOSED`, `CLOSED→FINISHED`

## Out of Scope

| Feature | Reason |
|---------|--------|
| TypeORM | ADR locked: Prisma only |
| App mobile nativo | Web-first (Next.js) |
| Chat / pagamentos / notificações push | Fora do núcleo “pelada + times” v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| USR-01 | Phase 1 | Pending |
| MAT-01 | Phase 2 | Pending |
| MAT-02 | Phase 2 | Pending |
| RULE-01 | Phase 2 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| ERR-01 | Phase 2 | Pending |
| REG-01 | Phase 3 | Implemented |
| REG-02 | Phase 3 | Implemented |
| REG-03 | Phase 3 | Implemented |
| RULE-02 | Phase 3 | Implemented |
| RULE-03 | Phase 3 | Implemented |
| API-04 | Phase 3 | Implemented |
| API-05 | Phase 3 | Implemented |
| TEAM-01 | Phase 4 | Implemented |
| RULE-04 | Phase 4 | Implemented |
| API-06 | Phase 4 | Implemented |
| UIJ-01 | Phase 5 | Implemented |
| UIJ-02 | Phase 5 | Implemented |
| UIJ-03 | Phase 5 | Implemented |
| UIA-01 | Phase 6 | Pending |
| UIA-02 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-22*  
*Last updated: 2026-04-22 — Phase 5 UIJ-01/02/03 marked Implemented*
