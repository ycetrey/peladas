# Peladas — Guia de produto por tela (marketing e parceiros)

**Para quem é este documento:** equipa criativa, copy, vendas ou um *angel* que quer perceber **o que o produto faz hoje**, **que problema resolve** e **o que cada ecrã comunica** — sem mergulhar em código.

**O que é o Peladas:** software web para levar uma pelada do “quem vai?” até **dois times prontos**, com **regras de negócio explícitas** (inscrições, fila de titulares/reservas, geração de equipas). Há **dois aplicativos web** distintos: um para **jogadores** e outro para **organizadores (admin)**.

**Stack em uma frase:** duas interfaces Next.js ligadas à mesma API; autenticação por sessão (login com e-mail e palavra-passe). Em desenvolvimento usam-se contas de exemplo (seed), por exemplo jogador e admin documentados no README do repositório.

---

## Mensagem central (elevator pitch)

> O organizador cria a partida, define janela de inscrição e vagas; os jogadores inscrevem-se e vêem se são titulares, reservas ou se marcaram ausência; quando a lista de titulares fecha, o admin **gera os dois times** (modo alternado na fila ou sorteio ao final). Tudo com erros compreensíveis quando uma ação não é permitida (partida fechada, lista cheia, equipas já geradas, etc.).

**Fora do núcleo v1 (não prometer como pronto):** app móvel nativo, chat, pagamentos, notificações push, automação de estados por cron — ver `REQUIREMENTS.md` (secção v2 / fora de âmbito).

---

## Regras de negócio que atravessam todas as telas (linguagem humana)

| Tema | O que o utilizador precisa de saber |
|------|-------------------------------------|
| **Partida aberta** | Inscrições fazem sentido quando a partida está **aberta** (`OPEN`) e o relógio está **dentro da janela** entre “abre inscrições” e “fecha inscrições”. |
| **Titulares vs reservas** | Existe um número fixo de **titulares** (`maxPlayers`, tem de ser **par** nas regras de criação). Até preencher titulares, quem entra fica **confirmado**; depois entram **reservas** até ao limite definido; sem vaga, a API recusa com mensagem clara. |
| **Cancelar inscrição** | Se um **titular** sai, a **primeira reserva** (pela ordem da fila) **sobe** a titular. A UI do jogador explica isto no fluxo de “retirar da lista”. |
| **Ausência (“não irei”)** | O jogador pode marcar **ausência** sem ocupar vaga de titular/reserva da mesma forma; pode **remover** essa ausência e voltar a inscrever-se se ainda houver lugar e regras o permitirem. |
| **Geração de times** | Só quando há **exatamente** tantas inscrições **CONFIRMED** (titulares) quanto `maxPlayers` e **ainda não existem** equipas A/B. Caso contrário, a API devolve erro mapeado na UI (ex.: número errado, equipas já geradas). |
| **Modo de jogo da partida** | Na criação define-se o **modo** de formação dos times: **alternado** (intercala pela ordem da fila) ou **sorteio ao final** (partição dos titulares). Isto é decisão do organizador ao criar a partida. |
| **Partidas públicas vs grupo** | **Pública:** visível na lógica de listagem ampla. **Grupo:** partida associada a um grupo; no admin, o copy explica que jogadores só vêm partidas do grupo se o **e-mail da conta** estiver na lista de membros. |
| **Campos e grupos** | Catálogo **por utilizador admin**: cada um vê só o que criou. **Apagar** campo ou grupo só é permitido se **não houver partidas** associadas (caso contrário conflito / 409). |

---

## App **Jogador** (URL típica: `web-jogador`, porta local documentada no projeto)

Tom de voz sugerido: **convidativo, claro, em português**; foco em **“a tua vaga”** e **transparência da fila**.

### Login (`/login`)

- **Função:** entrar com e-mail e palavra-passe; sessão via cookies.
- **Experiência:** mensagens de erro amigáveis; redirecionamento automático se já estiver autenticado.
- **Marketing:** “A tua conta — um só lugar para ver peladas e gerir a tua presença.”

### Lista de partidas (`/` — home)

- **Função:** ver **todas as partidas** disponíveis na API; cartões com informação resumida; **atualização periódica** quando o separador está visível (para filas e vagas não ficarem desatualizadas).
- **Filtros locais (UI):** campo, grupo, “só as minhas”, data (ex.: próximas), região (heurística por texto na localidade), período do dia, tipo pelo título.
- **Marketing:** “Painel único das peladas — filtra o que te interessa e vê de relance onde ainda há vaga.”

### Detalhe da partida (`/matches/[id]`)

- **Função:** ver **título, estado, modo**, campo e localidade, **data/hora**, janela de inscrição, **lugares** (titulares e máximo de reservas), **vagas de titular restantes**, contagens de presença e ausências.
- **Inscrição:** escolher **posição preferida** (qualquer, goleiro, defesa, meio, avançado) e **Inscrever**; ou **“Não irei”** (ausência).
- **Depois de inscrito:** estado **Titular**, **Reserva**, **Não irei** ou **Cancelado**; mostra **posição na fila** e posição preferida quando aplicável.
- **Ações:** **Retirar da lista** (com confirmação que explica promoção de reserva); se ausente, **remover voto de ausência**.
- **Regras mostradas ao jogador:** texto na própria página explica que **só titulares** entram no jogo e na formação de times; reservas são fila; ordem de promoção.
- **Nota para criativos:** existe um botão **“Compartilhar”** visível; **não está ligado a uma ação** no código atual — tratar como *placeholder* ou roadmap de partilha social / link copiável.

---

## App **Admin** (URL típica: `web-admin`)

Tom de voz sugerido: **profissional, operacional**; foco em **“criar, filtrar, fechar o ciclo com times”**.

### Login (`/login`)

- **Função:** igual ao jogador ao nível técnico, mas só avança para o painel se a conta tiver **flag de admin**.
- **Marketing:** “Área reservada ao organizador — criar recursos e conduzir a pelada até aos times.”

### Dashboard de partidas (`/`)

- **Função:** lista de partidas com **filtros** (campo, grupo, estado `OPEN` / `CLOSED` / `FINISHED`); agrupamento visual por **campo** e **público vs grupo**; atalho **“Nova Partida”**; ligações para **detalhe/edição** por partida.
- **Marketing:** “Centro de comando — vê todas as peladas, filtra por estado e cria nova em um clique.”

### Nova partida (`/partidas/nova`)

- **Função:** formulário para **criar** a partida na API: título, **campo** (dropdown do catálogo), data/hora de início, **modo** (alternado / sorteio ao final), **máx. titulares** e **máx. reservas**, **abertura e fecho de inscrições**, **visibilidade** (pública ou grupo + escolha do grupo).
- **Campos adicionais no ecrã:** descrição/referência, tipo de jogo (5x5, 7x7, …), duração, fim do jogo, “jogo recorrente” — **melhoram o contexto no formulário**; a persistência na API v1 centra-se nos campos do contrato de criação (título, agenda, regras de vaga, janela, local, visibilidade). Para **copy legal/comercial**, alinhar com o produto: “campos extra podem ser evoluídos para metadata” se necessário.
- **Marketing:** “Define a pelada como queres que os jogadores a vejam — local, horário, quem pode ver e quando as inscrições abrem.”

### Detalhe simples da partida (`/matches/[id]`)

- **Função:** vista focada na **geração de equipas**: lê estado da partida, explica pré-condição (titulares confirmados = `maxPlayers`, sem times ainda), botão **“Gerar equipas A/B”**, lista o resultado (nomes dos equipas e contagem de jogadores) ou mensagem de erro mapeada.
- **Marketing:** “O momento em que a lista vira dois times — um botão, regras claras, feedback imediato.”

### Editar partida (`/partidas/[id]/editar`)

- **Função:** painel com **resumo** da partida (título, campo, estado, modo, visibilidade), **indicadores** de confirmados / ausentes / pendentes para fechar a lista, e **mesma ação** de **gerar equipas A/B** que no detalhe simples.
- **Limitação atual para parceiros:** botões **Salvar** e **Deletar** estão **desativados** — não é ainda o ecrã completo de edição/remoção de partida via formulário.
- **Marketing (honesto):** “Visão operacional e fecho com times; edição fina da partida é evolução natural do produto.”

### Campos / locais — lista (`/venues`)

- **Função:** catálogo **pessoal** de campos; ligação para criar novo e para **editar** cada um.
- **Copy já presente na UI:** só vês os campos que **criaste**; ao criar partida, o dropdown usa esta lista.

### Novo campo (`/venues/nova`)

- **Função:** criar campo **manual** (nome, localidade) ou **pesquisar Google Places** (se a API tiver chave configurada); ao escolher sugestão, cria com dados do lugar.

### Editar campo (`/venues/[id]/editar`)

- **Função:** alterar **nome** e **localidade**; apagar com confirmação **se não houver partidas** associadas; indicação se veio do Google Places.

### Grupos — lista (`/groups`)

- **Função:** catálogo de grupos com contagem de **membros**; criar novo; editar cada grupo.
- **Copy na UI:** partidas **privadas ao grupo** só aparecem a jogadores cuja **conta (e-mail)** está na lista.

### Novo grupo (`/groups/nova`)

- **Função:** criar grupo só com **nome**.

### Editar grupo (`/groups/[id]/editar`)

- **Função:** alterar **nome** do grupo; **adicionar membro** por e-mail (conta registada); **remover** membro; **apagar grupo** se não houver partidas associadas (com confirmação).

---

## Tabela rápida “ecrã → promessa”

| App | Ecrã | Promessa numa frase |
|-----|------|----------------------|
| Jogador | Login | Entrada segura na tua área de jogador. |
| Jogador | Lista | Descobre peladas e filtra o que importa para ti. |
| Jogador | Detalhe | Vê regras, inscreve-te, gere ausência ou sai da fila com noção de consequências. |
| Admin | Login | Acesso de organizador ao painel. |
| Admin | Dashboard | Controla todas as partidas e cria novas. |
| Admin | Nova partida | Configura a pelada e a janela de inscrições. |
| Admin | Detalhe / Editar (partida) | Fecha o ciclo gerando **times A/B** quando a lista está certa. |
| Admin | Campos (lista/novo/editar) | Geres os locais onde jogas, reutilizando-os em novas partidas. |
| Admin | Grupos (lista/novo/editar) | Geres quem vê partidas “só do grupo”. |

---

## Glossário mínimo para copy

- **Titular:** inscrição confirmada que conta para o jogo e para a geração de times.
- **Reserva:** na fila; pode subir se um titular sair.
- **Janela de inscrição:** intervalo de datas em que inscrever é permitido (se a partida estiver aberta).
- **Modo alternado / sorteio ao final:** duas formas legíveis de o sistema repartir titulares pelos **dois times**.
- **OPEN / CLOSED / FINISHED:** estados da vida da partida visíveis ao admin (e parcialmente ao jogador no detalhe).

---

## Documentação técnica de apoio

- Requisitos por ID: `.planning/REQUIREMENTS.md`
- Visão de produto: `.planning/PROJECT.md`
- Contratos HTTP: `docs/API.md`

---

*Documento gerado para alinhar marketing e stakeholders com o comportamento **actual** das UIs no repositório; quando o produto evoluir, actualizar este ficheiro em paralelo com as releases.*
