# Phase 9 — UI-SPEC (contrato mínimo)

**Escopo:** `web-admin` apenas. Reutilizar tokens e classes em `app/globals.css` (`panel-card`, `sidebar-card`, `btn`, `input`, `stack`, `row`, `page-title`, `section-title`, `alert`, `muted`).

## Navegação

- **Campos:** `GET /venues` — lista; botão ou link **Novo campo** → `/venues/nova`; cada item → `/venues/[id]/editar`.
- **Grupos:** `GET /groups` — lista; **Novo grupo** → `/groups/nova`; cada item → `/groups/[id]/editar`.

## Listagem (`/venues`, `/groups`)

- Título `page-title` + link `← Painel` para `/`.
- Secções em `panel-card stack` alinhadas ao dashboard de partidas (sem obrigar coluna de filtros lateral se não fizer sentido).
- Lista de itens: nome, metadados (localidade / contagem de membros), link para editar.

## Criação (`/venues/nova`, `/groups/nova`)

- Barra superior: `Link` Voltar para listagem; sem id ainda.
- Conteúdo: reaproveitar fluxos actuais (Google Places + manual para venue; nome para group).
- Após sucesso: `router.push` para listagem ou para `[id]/editar` (escolher uma e documentar no plano — preferência: **listagem** para espelhar “nova partida” que muitas vezes redireciona ao painel).

## Edição (`/venues/[id]/editar`, `/groups/[id]/editar`)

- Barra: **← Voltar** (listagem), **Salvar** (submit), **Deletar** (confirm + DELETE).
- Venue: campos nome, localidade; indicador se veio de Google (read-only badge).
- Group: nome; bloco **Membros** com add/remove igual à página actual.
- Erros de API em `alert`; conflito 409 com mensagem do `error.message`.

## Acessibilidade

- Botões desactivados durante `fetch`; `role="alert"` em erros.

---

*Contrato derivado de `09-CONTEXT.md` e páginas existentes de partidas.*
