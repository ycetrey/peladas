# Context (from ingested DOCs and advisory non-normative notes)

*No DOC-classified files in this ingest. The following is attributed narrative and recommendations from a SPEC-tagged source that includes guide-style sections.*

## Suggested module layout (advisory)

**source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

The document opens with a suggested `src/modules/matches/...` tree (domain, dto, services, use-cases, repositories, errors) for Cursor/NestJS as a starting point, not a locked repository layout contract.

## Recommended follow-ups (section 8)

**source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

- **Concurrency:** run registration flow in a DB transaction in production to avoid overbooking; conceptual `dataSource.transaction` example.
- **Auditable draw:** replace `Math.random()` with a deterministic/seeded strategy; persist seed for audit.
- **Position rules:** e.g. cap goalkeepers, balance by position in draws.
- **Status automation:** jobs/cron for `DRAFT→OPEN`, `OPEN→CLOSED`, `CLOSED→FINISHED`.

## Embedded Cursor prompt and “next step” (sections 9–10)

**source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

Sections 9–10 include a copy-paste prompt and checklist that name **TypeORM** (entities, repositories, module wiring). The locked ADR in `d:\Fontes\peladas\.planning\ingest-sources\stack-intent.md` **requires Prisma and forbids TypeORM**; those sections are retained here for traceability but **do not** override the ADR. See `INGEST-CONFLICTS.md` (INFO) and `constraints.md` for Prisma-aligned implementation expectations.
