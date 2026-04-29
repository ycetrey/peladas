<!-- generated-by: gsd-doc-writer -->

# Desenvolvimento

## Monorepo

- **Pacotes:** `apps/api`, `apps/web-jogador`, `apps/web-admin`
- **Workspaces:** `pnpm-workspace.yaml` (`apps/*`)

## Instalação no host

```bash
corepack enable
pnpm install
```

## API

```bash
pnpm --filter @peladas/api run db:migrate
pnpm --filter @peladas/api exec prisma generate
pnpm --filter @peladas/api run db:seed
pnpm --filter @peladas/api run start:dev
```

Configurar `apps/api/.env` a partir de `apps/api/.env.example` (`DATABASE_URL` para Postgres local).

## Apps Next

- Jogador: `pnpm --filter @peladas/web-jogador run dev` (porta **3002** alinhada com CORS por defeito da API)
- Admin: `pnpm --filter @peladas/web-admin run dev` (porta **3003**)

Definir `JWT_SECRET` e `NEXT_PUBLIC_API_BASE_URL` conforme [CONFIGURATION](./CONFIGURATION.md).

## Docker

A stack em `docker-compose.yml` monta o código, instala dependências no arranque da API e corre `prisma migrate deploy`. Ver [DEPLOYMENT](./DEPLOYMENT.md).

## Documentação de planeamento

O projecto pode usar artefactos em `.planning/` (GSD). Não são necessários para compilar as apps.
