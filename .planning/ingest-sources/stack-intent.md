---
type: adr
status: Accepted
decision: Peladas runtime and service topology
---

# ADR: Docker-first dev e topologia de serviços (Peladas)

## Context

O time quer desenvolver e rodar o app sem instalar toolchains locais além do necessário para executar Docker. Os artefatos do projeto devem viver em imagens/containers dedicados por serviço.

## Decision

1. **Ambiente local:** apenas Docker (e dependências mínimas do host para o próprio Docker) como requisito de máquina; build e runtime de app ocorrem dentro de containers.
2. **Serviços:** três unidades — API NestJS; frontend Next.js **jogador**; frontend Next.js **admin**. Cada uma com Dockerfile (ou target) próprio e orquestração explícita (ex.: Compose).
3. **Persistência:** **Prisma** como única camada ORM/migrations; **não** usar TypeORM neste projeto.
4. **Frameworks:** API em **NestJS**; ambos os frontends em **Next.js**.

## Consequences

- CI e dev alinhados em imagens reproduzíveis.
- Monorepo ou multirepo aceitável desde que o Compose mapeie contextos de build por serviço.
