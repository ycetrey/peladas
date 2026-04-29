/**
 * Carrega variáveis de ambiente antes do Prisma CLI (cwd = apps/api).
 * Ordem: `.env` se existir; senão `.env.example` (primeira execução local).
 */
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");

const apiRoot = path.join(__dirname, "..");
const envFile = path.join(apiRoot, ".env");
const exampleFile = path.join(apiRoot, ".env.example");

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else if (fs.existsSync(exampleFile)) {
  // eslint-disable-next-line no-console
  console.warn(
    "[@peladas/api] Ficheiro .env não encontrado — a carregar apenas .env.example. Cria apps/api/.env para overrides locais.",
  );
  dotenv.config({ path: exampleFile });
}

if (!process.env.DATABASE_URL?.trim()) {
  // eslint-disable-next-line no-console
  console.error(
    "[@peladas/api] DATABASE_URL em falta. Cria apps/api/.env a partir de apps/api/.env.example (ver README na raiz do repositório).",
  );
  process.exit(1);
}

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  // eslint-disable-next-line no-console
  console.error("[@peladas/api] Uso: node scripts/run-prisma.cjs <args do prisma...>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...prismaArgs], {
  stdio: "inherit",
  cwd: apiRoot,
  shell: true,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
