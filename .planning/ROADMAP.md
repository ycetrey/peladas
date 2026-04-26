# Roadmap: Peladas

## Overview

Entregar Peladas em camadas que liberam valor cedo: primeiro o **ambiente Docker + Prisma + API** com partidas consultáveis; depois **inscrições e fila**; em seguida **montagem dos times**; por fim as **UIs Next.js** (jogador e admin) que exercitam o fluxo ponta a ponta em containers. Cada fase fecha com comportamentos observáveis alinhados aos REQ-IDs em `REQUIREMENTS.md`.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Fundação Docker, Prisma e API shell** — Compose sobe DB + três serviços; schema e migrations; usuário persistido; API roda em container
- [x] **Phase 2: Partidas — criação, leitura e erros de negócio** — Criar/listar/detalhar partida com validações de janela; contrato de erros estável
- [x] **Phase 3: Inscrições, fila e cancelamento** — Inscrever, bloquear duplicata, cancelar com promoção de reserva
- [x] **Phase 4: Geração de times A/B** — Gerar times quando lista de titulares fecha; modos alternado e sorteio ao final
- [ ] **Phase 5: App Next.js jogador** — Lista, inscrição/cancelamento e status na UI
- [ ] **Phase 6: App Next.js admin** — Criar partida e acionar geração de times na UI

## Phase Details

### Phase 1: Fundação Docker, Prisma e API shell
**Goal**: Desenvolvedor sobe stack local via containers; dados do domínio existem no banco via Prisma; API NestJS executa no mesmo ambiente.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, DATA-01, DATA-02, USR-01
**Success Criteria** (what must be TRUE):
  1. Com um único comando documentado, **database, API, web-jogador e web-admin** iniciam para desenvolvimento local
  2. **Build** das imagens (ou targets) da API e dos dois Next.js **completa sem erro**
  3. **Migrations** Prisma aplicam em banco vazio e o schema contém entidades do domínio (usuário, partida, inscrição, time, jogador-no-time) com enums corretos
  4. É possível **persistir** pelo menos um registro de usuário/jogador com campos esperados (nome, posições preferidas, admin)
  5. O processo da **API** em container responde a health/ping ou rota mínima documentada
**Plans**: 4 plans

Plans:
- [x] 01-01: Monorepo pnpm, Compose, Dockerfiles stub, README (`01-01-PLAN.md`)
- [x] 01-02: Prisma schema, migrations, seed USR-01 (`01-02-PLAN.md`)
- [x] 01-03: NestJS API, Dockerfile, `/health` (`01-03-PLAN.md`)
- [x] 01-04: Next.js jogador + admin em Docker (`01-04-PLAN.md`)

### Phase 2: Partidas — criação, leitura e erros de negócio
**Goal**: Organizador (via API) cria partidas válidas; clientes listam e veem detalhe; violações de regra retornam erros de negócio previsíveis.
**Depends on**: Phase 1
**Requirements**: MAT-01, MAT-02, RULE-01, API-01, API-02, API-03, ERR-01
**Success Criteria** (what must be TRUE):
  1. Chamada autenticada ou fluxo documentado permite **criar partida** com título, agenda, modo, vagas e janela de inscrição; rejeita janela inválida ou `maxPlayers` ímpar com erro claro
  2. Cliente pode **listar** partidas e **abrir detalhe** por id
  3. Estados necessários para fluxo v1 (ex.: `OPEN`) estão **disponíveis** na criação ou transição mínima documentada
  4. Respostas de API expõem **erros de negócio** nomeados (partida não aberta, inscrição fechada, usuário já inscrito, estado inválido) de forma consistente para integração
**Plans**: 3 plans

Plans:

- [x] 02-01: Erros de domínio + filtro HTTP + Jest mínimo (`02-01-PLAN.md`)
- [x] 02-02: MatchRulesService + testes RULE-01 (`02-02-PLAN.md`)
- [x] 02-03: HTTP matches + e2e + README (`02-03-PLAN.md`)

### Phase 3: Inscrições, fila e cancelamento
**Goal**: Jogador inscreve-se em pelada aberta; fila de titulares/reservas funciona; cancelamento promove reserva.
**Depends on**: Phase 2
**Requirements**: REG-01, REG-02, REG-03, RULE-02, RULE-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. Em partida `OPEN` dentro da janela, jogador **inscreve-se** com posição preferida e aparece como confirmado ou reserva conforme vagas
  2. **Segunda inscrição** ativa do mesmo usuário na mesma partida é **recusada** com erro dedicado
  3. Inscrição fora da janela ou com partida não aberta é **recusada** com erro adequado
  4. Ao **cancelar** inscrição de titular, o primeiro reserva **sobe** para titular na ordem da fila
  5. Quando não há vaga nem para reserva, nova inscrição é **recusada** explicitamente
**Plans**: 2 plans

Plans:

- [x] 03-01: Regras de inscrição + `NoRegistrationSlotsError` + Jest (`03-01-PLAN.md`)
- [x] 03-02: HTTP inscrições/cancelamento + e2e + README (`03-02-PLAN.md`)

### Phase 4: Geração de times A/B
**Goal**: Quando todos os titulares estão confirmados, organizador gera dois times persistidos conforme modo da partida.
**Depends on**: Phase 3
**Requirements**: TEAM-01, RULE-04, API-06
**Success Criteria** (what must be TRUE):
  1. Se número de confirmados ≠ `maxPlayers`, **gerar times** é recusado com erro de estado compreensível
  2. Com confirmados = `maxPlayers`, **dois times A e B** existem no banco e cada jogador confirmado aparece em **exatamente um** time
  3. Modo **ALTERNATED** produz intercalação coerente com **ordem da fila** (`queueOrder`)
  4. Modo **DRAW_AT_END** produz **partição** dos confirmados entre A e B (v1 pode usar aleatoriedade não auditável; v2 cobre seed)
**Plans**: 2 plans

Plans:

- [x] 04-01: Alocação A/B + erros de domínio + Jest (`04-01-PLAN.md`)
- [x] 04-02: HTTP `POST .../teams/generate` + e2e + README (`04-02-PLAN.md`)

### Phase 5: App Next.js jogador
**Goal**: Jogador usa interface web (container) para ver peladas, inscrever/cancelar e ver seu status.
**Depends on**: Phase 4
**Requirements**: UIJ-01, UIJ-02, UIJ-03
**Success Criteria** (what must be TRUE):
  1. Na UI jogador, usuário vê **lista** de partidas disponíveis (ou filtro mínimo documentado)
  2. Usuário **inscreve-se** e **cancela** inscrição sem chamar API manualmente (fluxo pela interface)
  3. Após ação, usuário **vê** na tela se está titular, reserva ou cancelado naquela partida
**Plans**: 2 plans

Plans:

- [x] 05-01: Lista + detalhe leitura + CORS + cliente HTTP (`05-01-PLAN.md`)
- [x] 05-02: GET `registrations/me` + inscrever/cancelar na UI + estado (`05-02-PLAN.md`)
**UI hint**: yes

### Phase 6: App Next.js admin
**Goal**: Admin usa interface web para criar partidas e disparar geração de times quando a lista fecha.
**Depends on**: Phase 5
**Requirements**: UIA-01, UIA-02
**Success Criteria** (what must be TRUE):
  1. Na UI admin, usuário **cria partida** preenchendo campos equivalentes ao DTO de criação e vê confirmação ou erro compreensível
  2. Quando regras de negócio permitem, admin **aciona geração de times** e vê resultado (sucesso ou mensagem de estado inválido)
  3. Fluxo admin opera contra a **mesma API** usada pelo backend (sem mocks exclusivos que escondam integração)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação Docker, Prisma e API shell | 4/4 | Complete (verify Docker locally) | 2026-04-22 |
| 2. Partidas — criação, leitura e erros | 3/3 | Complete | 2026-04-23 |
| 3. Inscrições, fila e cancelamento | 2/2 | Complete | 2026-04-22 |
| 4. Geração de times A/B | 2/2 | Complete | 2026-04-22 |
| 5. App Next.js jogador | 2/2 | Complete | 2026-04-22 |
| 6. App Next.js admin | 0/TBD | Not started | - |

### Phase 7: leitura e organização dos dados

**Goal:** Evoluir a leitura dos dados de partidas para suportar sinalização explícita de ausência ("Não irei") antes da inscrição, mantendo o fluxo de desinscrição após inscrito.
**Requirements**: TBD
**Depends on:** Phase 6
**Plans:** 1 plan

Plans:
- [ ] 07-01: RSVP de ausência ("Não irei") + desinscrição explícita + agregados de presença (`07-01-PLAN.md`)

### Phase 8: base de dados mock e dependências de UI

**Goal:** Pacote `@peladas/fixtures` espelhando a API; Tailwind + shadcn nos dois Next.js; Storybook + Playwright + CI mínima para builds e UI estática.
**Requirements**: TBD
**Depends on:** Phase 7
**Plans:** 2/2 plans complete

Plans:
- [x] 08-01: Workspace fixtures + Tailwind/shadcn em web-jogador e web-admin (`08-01-PLAN.md`)
- [x] 08-02: Storybook, Playwright smoke, workflow CI (`08-02-PLAN.md`)

### Phase 9: CRUD admin — campos e grupos

**Goal:** Alinhar as telas **Campos** e **Grupos** no `web-admin` à mesma lógica de navegação e operações do fluxo de **partidas**: listagem em cartões, rotas dedicadas de criação e edição, leitura por id, atualização e remoção quando a API permitir; expor na API `GET/PATCH/DELETE` para venue e group com regras de dono e conflito quando existirem partidas associadas.

**Depends on:** Phase 8

**Requirements:** TBD → alinhar a `REQUIREMENTS.md` com UIA-/API- conforme forem mapeados

**Success Criteria** (what must be TRUE):

1. Admin autenticado obtém **detalhe** de um campo ou grupo por id e **atualiza** nome (e campos editáveis do venue) via API estável
2. **Apagar** campo ou grupo sem partidas associadas remove o registo; com partidas associadas a API devolve erro de negócio **nomeado** (409 ou equivalente documentado)
3. UI admin: **`/venues`** lista com links para **`/venues/nova`** e **`/venues/[id]/editar`**; **`/groups`** idem para **`/groups/nova`** e **`/groups/[id]/editar`**, com padrão visual **panel-card** / barra de ações semelhante a partidas (`Voltar`, `Salvar`, `Deletar` onde aplicável)
4. Cliente Next (`lib/api`) e proxy **`/api/backend`** continuam a funcionar para os novos verbos

**Plans:** 2/2 plans complete

Plans:

- [x] 09-01: API venues/groups — GET :id, PATCH, DELETE + erros + testes (`09-01-PLAN.md`)
- [x] 09-02: Admin UI — rotas e CRUD espelhando partidas (`09-02-PLAN.md`)
