# Phase 8: base de dados mock e dependências de UI - Pattern Map

**Mapped:** 2026-04-28  
**Files analyzed:** 20 (implied new/modified from CONTEXT, RESEARCH, UI-SPEC)  
**Analogs found:** 20 / 20

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/fixtures/package.json` | config | static export | `packages/fixtures/package.json` (existing) | exact |
| `packages/fixtures/tsconfig.json` | config | — | `packages/fixtures/tsconfig.json` | exact |
| `packages/fixtures/src/index.ts` (+ future DTO modules) | model / shared data | transform (JSON-shaped constants) | `packages/fixtures/src/index.ts` | exact |
| `packages/fixtures/README.md` | doc | — | `packages/fixtures/README.md` | exact |
| `pnpm-workspace.yaml` | config | — | `pnpm-workspace.yaml` | exact |
| `apps/api/prisma/seed.ts` | migration / seed | batch (upserts) | `apps/api/prisma/seed.ts` | exact |
| `apps/web-jogador/tailwind.config.ts` | config | — | `apps/web-jogador/tailwind.config.ts` | exact |
| `apps/web-admin/tailwind.config.ts` | config | — | `apps/web-admin/tailwind.config.ts` (mirror jogador) | exact |
| `apps/web-jogador/postcss.config.mjs` | config | — | `apps/web-jogador/postcss.config.mjs` | exact |
| `apps/web-jogador/components.json` | config | — | `apps/web-jogador/components.json` | exact |
| `apps/web-jogador/app/globals.css` | config / styles | cascade | `apps/web-jogador/app/globals.css` | exact |
| `apps/web-admin/app/globals.css` | config / styles | cascade | `apps/web-admin/app/globals.css` | exact |
| `apps/web-jogador/lib/utils.ts` | utility | transform (classnames) | `apps/web-jogador/lib/utils.ts` | exact |
| `apps/web-jogador/components/ui/button.tsx` (+ other `ui/`) | component | event-driven (UI) | `apps/web-jogador/components/ui/button.tsx` | exact |
| `*.stories.tsx` (co-located) | story / test harness | static props + fixtures | `apps/web-jogador/components/ui/button.stories.tsx` | exact |
| `apps/web-jogador/.storybook/main.ts` | config | — | `apps/web-jogador/.storybook/main.ts` | exact |
| `playwright.config.ts` | test config | request-response (E2E) | `playwright.config.ts` | exact |
| `e2e/*.spec.ts` | test | request-response | `e2e/smoke.spec.ts` | exact |
| `.github/workflows/ui-ci.yml` | CI config | batch | `.github/workflows/ui-ci.yml` | exact |
| Root `README.md` (fixtures / SB / E2E / CI sections) | doc | — | `README.md` | exact |

**Note:** `apps/web-admin` should mirror the same UI stack files as `web-jogador` (`components.json`, Storybook, Tailwind, shadcn); use admin files as analogs when working in admin, jogador when in jogador.

## Pattern Assignments

### `packages/fixtures` (model / shared data, JSON-shaped constants)

**Analog:** `packages/fixtures/src/index.ts`

**Header + ID alignment with seed** (lines 1-16):

```typescript
/**
 * Dados estáticos para Storybook, testes e demos.
 * Formato espelha JSON da API (não entidades Prisma). IDs estáveis = seed.
 */

/** @see apps/api/prisma/seed.ts */
export const SEED_USER_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_ADMIN_ID = "00000000-0000-4000-8000-000000000002";
// ... additional stable UUIDs mirroring seed
```

**DTO-shaped fixture object** (lines 21-51):

```typescript
export const sampleMatchListItem = {
  id: MATCH_PUBLIC_ALT_ID,
  title: "Pelada Campo Sintético (fixture)",
  dateTime: "2026-05-01T18:00:00.000Z",
  mode: "ALTERNATED" as const,
  status: "OPEN" as const,
  // ... venue, counts, myRegistration, etc.
};
```

**Analog:** `packages/fixtures/package.json`

**Workspace package shape** (lines 1-16):

```json
{
  "name": "@peladas/fixtures",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**Analog:** `packages/fixtures/tsconfig.json` (strict, bundler, no emit)

---

### `pnpm-workspace.yaml` (monorepo)

**Analog:** `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

### `apps/api/prisma/seed.ts` (batch — source of truth for stable IDs)

**Analog:** `apps/api/prisma/seed.ts`

**Stable ID constants (must stay aligned with fixtures)** (lines 13-17, 94-99):

```typescript
/** Utilizadores base (mantêm IDs estáveis para e2e / docs). */
const SEED_USER_ID = "00000000-0000-4000-8000-000000000001";
const SEED_ADMIN_ID = "00000000-0000-4000-8000-000000000002";
// ...
const MATCH_PUBLIC_ALT_ID = "00000000-0000-4000-8000-0000000000d1";
```

When adding scenarios, add matching exports in `packages/fixtures` and document in `packages/fixtures/README.md`.

---

### Next.js app — Tailwind + shadcn stack

**Analog:** `apps/web-jogador/tailwind.config.ts`

**Theme extension + shadcn CSS variables + animate plugin** (lines 1-56):

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        // ... primary, destructive, card, etc.
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Analog:** `apps/web-jogador/app/globals.css`

**Tailwind layers + shadcn CSS + legacy design tokens (incremental migration)** (lines 1-26):

```css
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #ffffff;
  --text: #1f2937;
  /* ... --primary, --peladas-*, coexistence with new utility classes */
}
```

**Analog:** `apps/web-jogador/components.json`

**Aliases for CLI and imports** (lines 1-25):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Analog:** `apps/web-jogador/tsconfig.json`

**Path alias** (lines 1-7):

```json
"compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Analog:** `apps/web-jogador/lib/utils.ts`

**`cn()` for shadcn class merging** (lines 1-6):

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Analog:** `apps/web-jogador/components/ui/button.tsx`

**Client component using `cn` + CVA variants** (lines 1-6, 43-55):

```typescript
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
// ... buttonVariants cva(...)
function Button({ className, variant = "default", size = "default", ...props }: ...) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

---

### Storybook + `@peladas/fixtures`

**Analog:** `apps/web-jogador/.storybook/main.ts`

**Stories glob (components + legacy `stories/`)** (lines 3-14):

```typescript
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
};
```

**Analog:** `apps/web-jogador/components/ui/button.stories.tsx`

**Import fixtures into story args / docs** (lines 1-18):

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs";
import { FIXTURE_SCENARIO_LABEL, sampleMatchListItem } from "@peladas/fixtures";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: `Fixture: ${sampleMatchListItem.title}`,
  },
  parameters: {
    docs: {
      description: {
        component: FIXTURE_SCENARIO_LABEL,
      },
    },
  },
};
```

**Analog:** `apps/web-jogador/package.json` — workspace dependency

```json
"@peladas/fixtures": "workspace:*"
```

---

### API contract types in apps (keep fixtures aligned with these shapes)

**Analog:** `apps/web-jogador/lib/api.ts`

**Native `fetch` + `{ error: { code, message } }` handling** (lines 24-72):

```typescript
async function apiFetch<T>(
  path: string,
  init?: RequestInit & { jsonBody?: unknown },
): Promise<T> {
  // ... build url, headers, body
  const res = await fetch(url, { ... });
  const text = await res.text();
  // ... parse JSON
  if (!res.ok) {
    const err = data as ApiErrorBody;
    const msg =
      err?.error?.message ??
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : res.statusText);
    const e = new Error(msg);
    (e as Error & { code?: string }).code = err?.error?.code;
    throw e;
  }
  return data as T;
}
```

Extend `packages/fixtures` objects to match `lib/types.ts` / API responses, not Prisma models.

---

### Playwright (E2E smoke, optional in CI)

**Analog:** `playwright.config.ts`

```typescript
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3002";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

**Analog:** `e2e/smoke.spec.ts`

**Skip when base URL unset** (lines 4-8):

```typescript
test.beforeEach(({}, testInfo) => {
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    testInfo.skip(true, "Defina PLAYWRIGHT_BASE_URL (ex.: http://localhost:3002) com web-jogador a correr.");
  }
});
```

**Analog:** root `package.json` scripts

```json
"test:e2e": "playwright test",
"test:e2e:install": "playwright install chromium"
```

---

### CI

**Analog:** `.github/workflows/ui-ci.yml`

**Install, build both Next apps, build both Storybooks; E2E job disabled** (lines 24-55):

```yaml
- name: Install
  run: pnpm install --frozen-lockfile

- name: Build Next.js apps
  run: |
    pnpm --filter @peladas/web-jogador build
    pnpm --filter @peladas/web-admin build

- name: Build Storybook (jogador)
  run: pnpm --filter @peladas/web-jogador run build-storybook

- name: Build Storybook (admin)
  run: pnpm --filter @peladas/web-admin run build-storybook

e2e:
  if: false
  # ...
```

---

### Documentation pattern (fixtures vs seed, SB, Playwright)

**Analog:** `README.md`

**Monorepo + fixtures vs seed + Storybook + E2E + CI** (lines 147-179):

```markdown
- `packages/fixtures` — dados estáticos (UUIDs iguais ao `seed`, exemplos no formato da API) para Storybook e testes UI

Gestão de pacotes: **pnpm workspaces** (`pnpm-workspace.yaml` inclui `apps/*` e `packages/*`).

### `@peladas/fixtures` vs seed

- **`pnpm db:seed`** continua a ser a forma de popular **Postgres** em desenvolvimento (fonte de verdade com API real).
- **`@peladas/fixtures`** espelha **respostas JSON** e **IDs estáveis** definidos em `apps/api/prisma/seed.ts`, sem credenciais.
```

---

## Shared Patterns

### Workspace package consumption

**Source:** `apps/web-jogador/package.json` / `apps/web-admin/package.json`  
**Apply to:** any app or tool that needs stable IDs or JSON-shaped demos

```json
"@peladas/fixtures": "workspace:*"
```

### Incremental CSS migration

**Source:** `apps/web-jogador/app/globals.css`  
**Apply to:** reconciling Tailwind/shadcn with legacy `.app-header`, `--peladas-*`, etc.

Keep `@tailwind` layers and coexist with legacy class-based rules until each surface is ported (per CONTEXT D-04).

### Error contract for UI (API unchanged)

**Source:** `apps/web-jogador/lib/types.ts` (`ApiErrorBody`), `apps/web-jogador/lib/api.ts`

Fixtures mirror **successful** JSON shapes; error payloads stay centralized in API client code — do not put secrets in fixtures.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All Phase 08 scoped artifacts have concrete in-repo analogs (`packages/fixtures`, both Next apps, seed, CI, Playwright). **MSW** was explicitly deferred in CONTEXT — no MSW harness required for this pattern map. |

---

## Metadata

**Analog search scope:** `packages/fixtures`, `pnpm-workspace.yaml`, `apps/api/prisma/seed.ts`, `apps/web-jogador` and `apps/web-admin` (Tailwind, shadcn, Storybook, `lib/`), root `playwright.config.ts`, `e2e/`, `.github/workflows/ui-ci.yml`, root `README.md`

**Files scanned / read for excerpts:** 20+

**Pattern extraction date:** 2026-04-28
