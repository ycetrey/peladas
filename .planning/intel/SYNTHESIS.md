# Ingest synthesis — entry point

**Mode:** new  
**Classifications read from:** `d:\Fontes\peladas\.planning\intel\classifications\`  
**Precedence used:** `ADR > SPEC > PRD > DOC`

## Doc counts by type

- ADR: 1  
- SPEC: 1  
- PRD: 0  
- DOC: 0  
- **Total: 2**

## Decisions (locked)

- **Locked count:** 1  
- **Source:** `d:\Fontes\peladas\.planning\ingest-sources\stack-intent.md` (Docker-first topology, three services, NestJS/Next.js, **Prisma only**, no TypeORM)

Detail: `d:\Fontes\peladas\.planning\intel\decisions.md`

## Requirements

- **Extracted requirements:** 0 (no PRDs ingested)  
- **IDs:** n/a

Detail: `d:\Fontes\peladas\.planning\intel\requirements.md`

## Constraints

- **Total constraint entries:** 10 (all from the SPEC; types: schema, api-contract, protocol)

Detail: `d:\Fontes\peladas\.planning\intel\constraints.md`

## Context topics

- Advisory: suggested module tree, follow-up recommendations (concurrency, audit, positions, status jobs), and caveat on sections 9–10 vs. ADR.

Detail: `d:\Fontes\peladas\.planning\intel\context.md`

## Cross-refs and cycles

- `cross_refs` in all classifications: empty — **no cycles**; depth cap not triggered.

## Conflicts

- **Blockers:** 0  
- **Competing acceptance variants (PRD):** 0  
- **Auto-resolved (INFO):** 1 (ADR over SPEC on ORM: Prisma vs. TypeORM mention in SPEC)

**Full report:** `d:\Fontes\peladas\.planning\INGEST-CONFLICTS.md`

## Downstream

`gsd-roadmapper` should read this file and the per-type intel files above before generating `PROJECT.md` / `REQUIREMENTS.md` / `ROADMAP.md`.

**Status:** READY — no blockers; no competing PRD variants. INFO-only resolution recorded for ORM.
