# APP Peladas — Arquivos de Regras de Negócio

Abaixo está uma sugestão de estrutura inicial focada nas regras de negócio para você usar como base no Cursor/NestJS.

---

## Estrutura sugerida

```txt
src/
  modules/
    matches/
      domain/
        enums/
          match-mode.enum.ts
          match-status.enum.ts
          registration-status.enum.ts
          player-position.enum.ts
        entities/
          match.entity.ts
          registration.entity.ts
          user.entity.ts
          team.entity.ts
          team-player.entity.ts
        interfaces/
          recurring-rule.interface.ts
      dto/
        create-match.dto.ts
        register-player.dto.ts
      services/
        match-rules.service.ts
        registration-rules.service.ts
        team-allocation.service.ts
      use-cases/
        create-match.use-case.ts
        register-player.use-case.ts
        cancel-registration.use-case.ts
        generate-teams.use-case.ts
      repositories/
        match.repository.ts
        registration.repository.ts
        team.repository.ts
      errors/
        business-rule.error.ts
        match-not-open.error.ts
        registration-closed.error.ts
        user-already-registered.error.ts
        invalid-match-state.error.ts
```

---

## 1) Enums

### `src/modules/matches/domain/enums/match-mode.enum.ts`
```ts
export enum MatchMode {
  ALTERNATED = 'ALTERNATED',
  DRAW_AT_END = 'DRAW_AT_END',
}
```

### `src/modules/matches/domain/enums/match-status.enum.ts`
```ts
export enum MatchStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
}
```

### `src/modules/matches/domain/enums/registration-status.enum.ts`
```ts
export enum RegistrationStatus {
  CONFIRMED = 'CONFIRMED',
  SUBSTITUTE = 'SUBSTITUTE',
  CANCELED = 'CANCELED',
}
```

### `src/modules/matches/domain/enums/player-position.enum.ts`
```ts
export enum PlayerPosition {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  FORWARD = 'FORWARD',
  ANY = 'ANY',
}
```

---

## 2) Entidades de domínio

### `src/modules/matches/domain/interfaces/recurring-rule.interface.ts`
```ts
export interface RecurringRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  byWeekDay?: number[];
  until?: Date;
}
```

### `src/modules/matches/domain/entities/user.entity.ts`
```ts
import { PlayerPosition } from '../enums/player-position.enum';

export class UserEntity {
  id: string;
  name: string;
  preferredPositions: PlayerPosition[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### `src/modules/matches/domain/entities/match.entity.ts`
```ts
import { RecurringRule } from '../interfaces/recurring-rule.interface';
import { MatchMode } from '../enums/match-mode.enum';
import { MatchStatus } from '../enums/match-status.enum';

export class MatchEntity {
  id: string;
  title: string;
  dateTime: Date;
  mode: MatchMode;
  status: MatchStatus;
  maxPlayers: number;
  maxSubstitutes: number;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  recurringRule?: RecurringRule | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### `src/modules/matches/domain/entities/registration.entity.ts`
```ts
import { PlayerPosition } from '../enums/player-position.enum';
import { RegistrationStatus } from '../enums/registration-status.enum';

export class RegistrationEntity {
  id: string;
  matchId: string;
  userId: string;
  preferredPosition: PlayerPosition;
  status: RegistrationStatus;
  queueOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### `src/modules/matches/domain/entities/team.entity.ts`
```ts
export class TeamEntity {
  id: string;
  matchId: string;
  name: 'A' | 'B';
  createdAt: Date;
  updatedAt: Date;
}
```

### `src/modules/matches/domain/entities/team-player.entity.ts`
```ts
export class TeamPlayerEntity {
  id: string;
  teamId: string;
  userId: string;
  registrationId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3) DTOs

### `src/modules/matches/dto/create-match.dto.ts`
```ts
import { MatchMode } from '../domain/enums/match-mode.enum';
import { RecurringRule } from '../domain/interfaces/recurring-rule.interface';

export class CreateMatchDto {
  title: string;
  dateTime: Date;
  mode: MatchMode;
  maxPlayers: number;
  maxSubstitutes: number;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  recurringRule?: RecurringRule | null;
}
```

### `src/modules/matches/dto/register-player.dto.ts`
```ts
import { PlayerPosition } from '../domain/enums/player-position.enum';

export class RegisterPlayerDto {
  matchId: string;
  userId: string;
  preferredPosition: PlayerPosition;
}
```

---

## 4) Errors de negócio

### `src/modules/matches/errors/business-rule.error.ts`
```ts
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}
```

### `src/modules/matches/errors/match-not-open.error.ts`
```ts
import { BusinessRuleError } from './business-rule.error';

export class MatchNotOpenError extends BusinessRuleError {
  constructor() {
    super('Match is not open for registration.');
  }
}
```

### `src/modules/matches/errors/registration-closed.error.ts`
```ts
import { BusinessRuleError } from './business-rule.error';

export class RegistrationClosedError extends BusinessRuleError {
  constructor() {
    super('Registration is closed for this match.');
  }
}
```

### `src/modules/matches/errors/user-already-registered.error.ts`
```ts
import { BusinessRuleError } from './business-rule.error';

export class UserAlreadyRegisteredError extends BusinessRuleError {
  constructor() {
    super('User is already registered for this match.');
  }
}
```

### `src/modules/matches/errors/invalid-match-state.error.ts`
```ts
import { BusinessRuleError } from './business-rule.error';

export class InvalidMatchStateError extends BusinessRuleError {
  constructor(message = 'Invalid match state for this operation.') {
    super(message);
  }
}
```

---

## 5) Contratos de repositório

### `src/modules/matches/repositories/match.repository.ts`
```ts
import { MatchEntity } from '../domain/entities/match.entity';

export abstract class MatchRepository {
  abstract create(match: MatchEntity): Promise<MatchEntity>;
  abstract findById(matchId: string): Promise<MatchEntity | null>;
  abstract save(match: MatchEntity): Promise<MatchEntity>;
}
```

### `src/modules/matches/repositories/registration.repository.ts`
```ts
import { RegistrationEntity } from '../domain/entities/registration.entity';
import { RegistrationStatus } from '../domain/enums/registration-status.enum';

export abstract class RegistrationRepository {
  abstract create(registration: RegistrationEntity): Promise<RegistrationEntity>;
  abstract save(registration: RegistrationEntity): Promise<RegistrationEntity>;
  abstract findByMatchAndUser(matchId: string, userId: string): Promise<RegistrationEntity | null>;
  abstract countByMatchAndStatus(matchId: string, status: RegistrationStatus): Promise<number>;
  abstract findConfirmedByMatch(matchId: string): Promise<RegistrationEntity[]>;
  abstract findSubstitutesByMatch(matchId: string): Promise<RegistrationEntity[]>;
  abstract findById(registrationId: string): Promise<RegistrationEntity | null>;
  abstract getNextQueueOrder(matchId: string): Promise<number>;
  abstract cancelRegistration(registrationId: string): Promise<void>;
}
```

### `src/modules/matches/repositories/team.repository.ts`
```ts
import { TeamEntity } from '../domain/entities/team.entity';
import { TeamPlayerEntity } from '../domain/entities/team-player.entity';

export abstract class TeamRepository {
  abstract createTeams(matchId: string): Promise<{ teamA: TeamEntity; teamB: TeamEntity }>;
  abstract clearTeams(matchId: string): Promise<void>;
  abstract addPlayers(players: TeamPlayerEntity[]): Promise<void>;
}
```

---

## 6) Serviços de regras de negócio

### `src/modules/matches/services/match-rules.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { MatchEntity } from '../domain/entities/match.entity';
import { MatchStatus } from '../domain/enums/match-status.enum';
import { RegistrationClosedError } from '../errors/registration-closed.error';
import { InvalidMatchStateError } from '../errors/invalid-match-state.error';

@Injectable()
export class MatchRulesService {
  validateCreationWindow(match: MatchEntity): void {
    if (match.registrationOpensAt >= match.registrationClosesAt) {
      throw new InvalidMatchStateError('Registration open time must be before close time.');
    }

    if (match.registrationClosesAt >= match.dateTime) {
      throw new InvalidMatchStateError('Registration close time must be before match date time.');
    }

    if (match.maxPlayers <= 0 || match.maxPlayers % 2 !== 0) {
      throw new InvalidMatchStateError('Max players must be a positive even number.');
    }

    if (match.maxSubstitutes < 0) {
      throw new InvalidMatchStateError('Max substitutes cannot be negative.');
    }
  }

  validateRegistrationAvailability(match: MatchEntity, now: Date): void {
    if (match.status !== MatchStatus.OPEN) {
      throw new RegistrationClosedError();
    }

    if (now < match.registrationOpensAt) {
      throw new RegistrationClosedError();
    }

    if (now > match.registrationClosesAt) {
      throw new RegistrationClosedError();
    }
  }
}
```

### `src/modules/matches/services/registration-rules.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { RegistrationStatus } from '../domain/enums/registration-status.enum';

@Injectable()
export class RegistrationRulesService {
  determineStatus(params: {
    confirmedCount: number;
    substituteCount: number;
    maxPlayers: number;
    maxSubstitutes: number;
  }): RegistrationStatus {
    const { confirmedCount, substituteCount, maxPlayers, maxSubstitutes } = params;

    if (confirmedCount < maxPlayers) {
      return RegistrationStatus.CONFIRMED;
    }

    if (substituteCount < maxSubstitutes) {
      return RegistrationStatus.SUBSTITUTE;
    }

    throw new Error('No slots available for registration or substitutes.');
  }
}
```

### `src/modules/matches/services/team-allocation.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { RegistrationEntity } from '../domain/entities/registration.entity';
import { MatchMode } from '../domain/enums/match-mode.enum';

@Injectable()
export class TeamAllocationService {
  generateTeams(mode: MatchMode, registrations: RegistrationEntity[]): {
    teamA: RegistrationEntity[];
    teamB: RegistrationEntity[];
  } {
    if (mode === MatchMode.ALTERNATED) {
      return this.generateAlternatedTeams(registrations);
    }

    return this.generateRandomTeams(registrations);
  }

  private generateAlternatedTeams(registrations: RegistrationEntity[]) {
    const ordered = [...registrations].sort((a, b) => a.queueOrder - b.queueOrder);

    const teamA: RegistrationEntity[] = [];
    const teamB: RegistrationEntity[] = [];

    ordered.forEach((registration, index) => {
      if (index % 2 === 0) {
        teamA.push(registration);
        return;
      }

      teamB.push(registration);
    });

    return { teamA, teamB };
  }

  private generateRandomTeams(registrations: RegistrationEntity[]) {
    const shuffled = [...registrations].sort(() => Math.random() - 0.5);
    const half = shuffled.length / 2;

    return {
      teamA: shuffled.slice(0, half),
      teamB: shuffled.slice(half),
    };
  }
}
```

> Observação: para produção, eu recomendo substituir `Math.random()` por uma estratégia determinística/testável, ou usar seed para auditoria do sorteio.

---

## 7) Casos de uso

### `src/modules/matches/use-cases/create-match.use-case.ts`
```ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchEntity } from '../domain/entities/match.entity';
import { MatchStatus } from '../domain/enums/match-status.enum';
import { MatchRepository } from '../repositories/match.repository';
import { MatchRulesService } from '../services/match-rules.service';

@Injectable()
export class CreateMatchUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly matchRulesService: MatchRulesService,
  ) {}

  async execute(input: CreateMatchDto): Promise<MatchEntity> {
    const match: MatchEntity = {
      id: randomUUID(),
      title: input.title,
      dateTime: input.dateTime,
      mode: input.mode,
      maxPlayers: input.maxPlayers,
      maxSubstitutes: input.maxSubstitutes,
      registrationOpensAt: input.registrationOpensAt,
      registrationClosesAt: input.registrationClosesAt,
      recurringRule: input.recurringRule ?? null,
      status: MatchStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.matchRulesService.validateCreationWindow(match);

    return this.matchRepository.create(match);
  }
}
```

### `src/modules/matches/use-cases/register-player.use-case.ts`
```ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RegisterPlayerDto } from '../dto/register-player.dto';
import { RegistrationEntity } from '../domain/entities/registration.entity';
import { MatchRepository } from '../repositories/match.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { MatchRulesService } from '../services/match-rules.service';
import { RegistrationRulesService } from '../services/registration-rules.service';
import { UserAlreadyRegisteredError } from '../errors/user-already-registered.error';
import { RegistrationStatus } from '../domain/enums/registration-status.enum';

@Injectable()
export class RegisterPlayerUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly registrationRepository: RegistrationRepository,
    private readonly matchRulesService: MatchRulesService,
    private readonly registrationRulesService: RegistrationRulesService,
  ) {}

  async execute(input: RegisterPlayerDto): Promise<RegistrationEntity> {
    const match = await this.matchRepository.findById(input.matchId);

    if (!match) {
      throw new Error('Match not found.');
    }

    this.matchRulesService.validateRegistrationAvailability(match, new Date());

    const existingRegistration = await this.registrationRepository.findByMatchAndUser(
      input.matchId,
      input.userId,
    );

    if (existingRegistration && existingRegistration.status !== RegistrationStatus.CANCELED) {
      throw new UserAlreadyRegisteredError();
    }

    const confirmedCount = await this.registrationRepository.countByMatchAndStatus(
      input.matchId,
      RegistrationStatus.CONFIRMED,
    );

    const substituteCount = await this.registrationRepository.countByMatchAndStatus(
      input.matchId,
      RegistrationStatus.SUBSTITUTE,
    );

    const status = this.registrationRulesService.determineStatus({
      confirmedCount,
      substituteCount,
      maxPlayers: match.maxPlayers,
      maxSubstitutes: match.maxSubstitutes,
    });

    const queueOrder = await this.registrationRepository.getNextQueueOrder(input.matchId);

    const registration: RegistrationEntity = {
      id: randomUUID(),
      matchId: input.matchId,
      userId: input.userId,
      preferredPosition: input.preferredPosition,
      status,
      queueOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.registrationRepository.create(registration);
  }
}
```

### `src/modules/matches/use-cases/cancel-registration.use-case.ts`
```ts
import { Injectable } from '@nestjs/common';
import { RegistrationRepository } from '../repositories/registration.repository';
import { RegistrationStatus } from '../domain/enums/registration-status.enum';

@Injectable()
export class CancelRegistrationUseCase {
  constructor(private readonly registrationRepository: RegistrationRepository) {}

  async execute(registrationId: string): Promise<void> {
    const registration = await this.registrationRepository.findById(registrationId);

    if (!registration) {
      throw new Error('Registration not found.');
    }

    await this.registrationRepository.cancelRegistration(registrationId);

    const substitutes = await this.registrationRepository.findSubstitutesByMatch(registration.matchId);
    const nextSubstitute = substitutes
      .filter(item => item.status === RegistrationStatus.SUBSTITUTE)
      .sort((a, b) => a.queueOrder - b.queueOrder)[0];

    if (nextSubstitute) {
      nextSubstitute.status = RegistrationStatus.CONFIRMED;
      nextSubstitute.updatedAt = new Date();
      await this.registrationRepository.save(nextSubstitute);
    }
  }
}
```

### `src/modules/matches/use-cases/generate-teams.use-case.ts`
```ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MatchRepository } from '../repositories/match.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { TeamRepository } from '../repositories/team.repository';
import { TeamPlayerEntity } from '../domain/entities/team-player.entity';
import { RegistrationStatus } from '../domain/enums/registration-status.enum';
import { TeamAllocationService } from '../services/team-allocation.service';

@Injectable()
export class GenerateTeamsUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly registrationRepository: RegistrationRepository,
    private readonly teamRepository: TeamRepository,
    private readonly teamAllocationService: TeamAllocationService,
  ) {}

  async execute(matchId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new Error('Match not found.');
    }

    const registrations = await this.registrationRepository.findConfirmedByMatch(matchId);
    const confirmedPlayers = registrations.filter(item => item.status === RegistrationStatus.CONFIRMED);

    if (confirmedPlayers.length !== match.maxPlayers) {
      throw new Error('Teams can only be generated when the confirmed player list is complete.');
    }

    const { teamA, teamB } = this.teamAllocationService.generateTeams(match.mode, confirmedPlayers);

    await this.teamRepository.clearTeams(matchId);
    const teams = await this.teamRepository.createTeams(matchId);

    const teamPlayers: TeamPlayerEntity[] = [
      ...teamA.map((registration, index) => ({
        id: randomUUID(),
        teamId: teams.teamA.id,
        userId: registration.userId,
        registrationId: registration.id,
        order: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      ...teamB.map((registration, index) => ({
        id: randomUUID(),
        teamId: teams.teamB.id,
        userId: registration.userId,
        registrationId: registration.id,
        order: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    await this.teamRepository.addPlayers(teamPlayers);
  }
}
```

---

## 8) Melhorias importantes que recomendo implementar em seguida

### Concorrência real na inscrição
No `RegisterPlayerUseCase`, em produção, idealmente você vai executar tudo dentro de transação para evitar overbooking.

Exemplo conceitual:

```ts
await this.dataSource.transaction(async manager => {
  // lock on match/registrations
  // recount confirmed and substitutes
  // create registration safely
});
```

### Sorteio auditável
Em vez de `Math.random()`:
- usar `seedrandom`
- salvar a seed no banco
- permitir auditoria do sorteio

### Validação de posição
Você pode depois criar regra para limitar goleiros, por exemplo:
- no máximo 2 goleiros confirmados
- balanceamento por posição no sorteio

### Status automático do jogo
Um job/cron pode alterar:
- `DRAFT -> OPEN`
- `OPEN -> CLOSED`
- `CLOSED -> FINISHED`

---

## 9) Prompt pronto para usar no Cursor

```txt
Crie a implementação NestJS para os arquivos abaixo, mantendo arquitetura limpa e separação entre domain, services, repositories e use-cases.

Requisitos:
- TypeScript
- NestJS
- TypeORM
- variáveis e mensagens em inglês
- foco em boas práticas, testabilidade e performance
- usar injeção de dependência
- preparar para transações em inscrições concorrentes
- criar controllers e providers necessários
- criar entidades TypeORM equivalentes às entidades de domínio
- implementar repositórios concretos
- criar testes unitários para os use-cases principais

Arquivos base:
[cole aqui os arquivos acima]
```

---

## 10) Próximo passo recomendado

Depois dessa base, o próximo melhor passo é eu montar para você:

1. `module.ts` completo do NestJS
2. entidades TypeORM reais
3. repositórios concretos com TypeORM
4. controllers REST
5. testes unitários dos casos de uso

