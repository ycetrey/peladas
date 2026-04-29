<!-- generated-by: gsd-doc-writer -->

# Configuração

Variáveis e ficheiros verificados a partir do repositório (`docker-compose.yml`, `.env.example`, `apps/api/.env.example`).

## Raiz do repositório (`.env`)

| Variável | Função |
|----------|--------|
| `POSTGRES_*` | Utilizador, palavra-passe, base e porta exposta da Postgres no Compose. |
| `API_PORT` | Porta publicada da API (defeito `3001`). |
| `WEB_JOGADOR_PORT` | Porta publicada da app jogador (defeito `3002`). |
| `WEB_ADMIN_PORT` | Porta publicada da app admin (defeito `3003`). |
| `DATABASE_URL` | URL usada no contexto Compose (rede interna `db`). |
| `JWT_SECRET` | Partilhado entre API e apps Next no Compose (HS256). |

## API (`apps/api/.env`)

| Variável | Função |
|----------|--------|
| `DATABASE_URL` | Ligação Postgres (no host, tipicamente `localhost:5432` para Prisma CLI). |
| `JWT_SECRET` | Assinatura dos tokens de login. Deve coincidir com o das apps Next. |
| `GOOGLE_PLACES_API_KEY` | Opcional; autocomplete de locais. Sem chave, fluxo Google fica desativado. |

## API (runtime, frequentemente via Compose)

| Variável | Função |
|----------|--------|
| `PORT` | Porta de escuta (defeito `3001`). |
| `WEB_JOGADOR_ORIGIN` | Origem CORS para a app jogador (lista separada por vírgulas permitida). |
| `WEB_ADMIN_ORIGIN` | Origem CORS para a app admin. |

## Apps Next (`apps/web-jogador`, `apps/web-admin`)

| Variável | Função |
|----------|--------|
| `JWT_SECRET` | Validação do token no middleware (igual à API). |
| `NEXT_PUBLIC_API_BASE_URL` | URL da API vista pelo **browser** (ex.: `http://localhost:3001`). |
| `API_INTERNAL_BASE_URL` | URL da API **dentro** do Docker (ex.: `http://api:3001`) para route handlers. |

<!-- VERIFY: Valores por defeito em produção e segredos reais não estão no repositório — rever política de deploy. -->
