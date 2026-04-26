# @peladas/fixtures

Dados tipados para **Storybook**, **testes E2E** e exemplos de UI.

- O formato espelha as **respostas JSON da API** consumidas por `web-jogador` e `web-admin`.
- Os **UUIDs** exportados são os mesmos definidos em `apps/api/prisma/seed.ts` (desenvolvimento estável).
- **Não** inclui credenciais nem segredos. Uso: local e CI apenas.

## Comandos

```bash
pnpm --filter @peladas/fixtures run typecheck
```

## Import

```ts
import { SEED_USER_ID, sampleMatchListItem, FIXTURE_SCENARIO_LABEL } from "@peladas/fixtures";
```

A base de dados continua a ser populada com `pnpm db:seed` (Postgres); este pacote não substitui o seed.
