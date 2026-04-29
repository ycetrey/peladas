## Conflict Detection Report

### BLOCKERS (0)

(No blockers. No locked ADR–vs–locked ADR conflicts, no ref-cycle blockers, no UNKNOWN/low-confidence classification gate, and merge-mode CONTEXT lock check not applicable.)

### WARNINGS (0)

### INFO (1)

[INFO] Auto-resolved: ADR > SPEC on ORM
  Note: d:\Fontes\peladas\.planning\ingest-sources\stack-intent.md (Accepted, locked) names Prisma as the sole ORM and states TypeORM must not be used. d:\Fontes\peladas\peladas_business_rules_base.md sections 9–10 and the embedded Cursor prompt example name TypeORM for entities, repositories, and next steps.
  → ADR takes precedence: implement persistence with Prisma; treat TypeORM references in the SPEC as superseded. Synthesized intel in d:\Fontes\peladas\.planning\intel\constraints.md and d:\Fontes\peladas\.planning\intel\context.md reflects Prisma alignment.
