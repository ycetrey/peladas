# Constraints (from ingested SPECs)

**Stack alignment:** Implementation must follow the locked ADR at `d:\Fontes\peladas\.planning\ingest-sources\stack-intent.md` (NestJS API, Prisma for persistence — **not** TypeORM). The source SPEC file contains an example prompt mentioning TypeORM; that portion is **superseded** by the ADR (see `INGEST-CONFLICTS.md`).

---

## C-SPEC-001 — Domain enums

- **type:** schema
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:**

- `MatchMode`: `ALTERNATED` | `DRAW_AT_END`
- `MatchStatus`: `DRAFT` | `OPEN` | `CLOSED` | `FINISHED` | `CANCELED`
- `RegistrationStatus`: `CONFIRMED` | `SUBSTITUTE` | `CANCELED`
- `PlayerPosition`: `GOALKEEPER` | `DEFENDER` | `MIDFIELDER` | `FORWARD` | `ANY`

---

## C-SPEC-002 — Recurring rule shape

- **type:** schema
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `RecurringRule`: `frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'`, optional `interval`, `byWeekDay`, `until`.

---

## C-SPEC-003 — Domain entities (logical model)

- **type:** schema
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** Logical entities: `UserEntity` (id, name, preferredPositions, isAdmin, timestamps); `MatchEntity` (id, title, dateTime, mode, status, maxPlayers, maxSubstitutes, registration window, optional recurringRule, timestamps); `RegistrationEntity` (id, matchId, userId, preferredPosition, status, queueOrder, timestamps); `TeamEntity` (id, matchId, name `'A'|'B'`, timestamps); `TeamPlayerEntity` (id, teamId, userId, registrationId, order, timestamps). Map to **Prisma** models per ADR, not TypeORM as in advisory sections 9–10 of the source.

---

## C-SPEC-004 — DTOs

- **type:** api-contract
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `CreateMatchDto`: title, dateTime, mode, maxPlayers, maxSubstitutes, registrationOpensAt, registrationClosesAt, optional recurringRule. `RegisterPlayerDto`: matchId, userId, preferredPosition.

---

## C-SPEC-005 — Business errors

- **type:** schema
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** Hierarchy under `BusinessRuleError`; concrete: `MatchNotOpenError`, `RegistrationClosedError`, `UserAlreadyRegisteredError`, `InvalidMatchStateError` (with default message for invalid state).

---

## C-SPEC-006 — Repository contracts

- **type:** api-contract
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `MatchRepository`: create, findById, save. `RegistrationRepository`: create, save, findByMatchAndUser, countByMatchAndStatus, findConfirmedByMatch, findSubstitutesByMatch, findById, getNextQueueOrder, cancelRegistration. `TeamRepository`: createTeams(matchId) returning team A/B, clearTeams, addPlayers. Concrete implementations use **Prisma** (per ADR).

---

## C-SPEC-007 — Match rules (validation)

- **type:** protocol
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `MatchRulesService.validateCreationWindow`: registration open before close; close before match time; maxPlayers positive **even**; maxSubstitutes ≥ 0. `validateRegistrationAvailability`: match `OPEN`, now within [registrationOpensAt, registrationClosesAt].

---

## C-SPEC-008 — Registration status determination

- **type:** protocol
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `RegistrationRulesService.determineStatus`: if confirmedCount < maxPlayers → `CONFIRMED`; else if substituteCount < maxSubstitutes → `SUBSTITUTE`; else throw (no slots).

---

## C-SPEC-009 — Team allocation

- **type:** protocol
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `TeamAllocationService.generateTeams(mode, registrations)`: `ALTERNATED` — interleave by queueOrder; else random split. Source note: production should use deterministic/seeded randomness (see `context.md`).

---

## C-SPEC-010 — Use cases (behavioral)

- **type:** protocol
- **source:** `d:\Fontes\peladas\peladas_business_rules_base.md`

**content:** `CreateMatchUseCase`: build entity `OPEN`, validate creation window, persist. `RegisterPlayerUseCase`: load match, validate availability, block duplicate non-canceled registration, count slots, assign status/queue, create. `CancelRegistrationUseCase`: cancel, then promote first substitute in queue to `CONFIRMED`. `GenerateTeamsUseCase`: require confirmed count == maxPlayers; clear/create teams; map players via allocation service; persist team players. NestJS injectable services per ADR; persistence via Prisma-backed repos.
