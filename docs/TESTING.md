<!-- generated-by: gsd-doc-writer -->

# Testes

## API — unitários e integração

```bash
pnpm --filter @peladas/api run test
```

(configuração: `apps/api/jest.config.cjs`)

## API — e2e

```bash
pnpm --filter @peladas/api run test:e2e
```

- Requer `DATABASE_URL` com Postgres acessível (ex.: o mesmo `apps/api/.env` com `localhost`).
- Para desativar: `SKIP_E2E=1`.

(configuração: `apps/api/jest-e2e.config.cjs`)

## Apps Next

Não há suite de testes configurada nos `package.json` das apps web nesta fase do projecto; validação manual ou e2e da API cobrem o contrato principal.
