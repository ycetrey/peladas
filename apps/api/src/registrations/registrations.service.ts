import { Injectable } from "@nestjs/common";
import {
  PlayerPosition,
  Prisma,
  type Registration,
  RegistrationStatus,
} from "@prisma/client";
import {
  InvalidMatchStateError,
  MatchNotFoundError,
} from "../common/errors/domain-errors";
import { runWithSerializableRetry } from "../common/prisma-serializable-retry";
import { MatchAccessService } from "../matches/match-access.service";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterPlayerDto } from "./dto/register-player.dto";
import { RegistrationRulesService } from "./registration-rules.service";

const SERIALIZABLE_TX: {
  isolationLevel: typeof Prisma.TransactionIsolationLevel.Serializable;
  maxWait: number;
  timeout: number;
} = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 10_000,
  timeout: 15_000,
};

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rules: RegistrationRulesService,
    private readonly matchAccess: MatchAccessService,
  ) {}

  async register(
    matchId: string,
    userId: string,
    isAdmin: boolean,
    dto: RegisterPlayerDto,
  ): Promise<{ registration: Registration }> {
    await this.matchAccess.assertUserCanViewMatch(matchId, userId, isAdmin);
    return runWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const match = await tx.match.findUnique({ where: { id: matchId } });
          if (!match) {
            throw new MatchNotFoundError();
          }

          this.rules.assertMatchOpenForRegistration(match, new Date());

          const active = await tx.registration.findFirst({
            where: {
              matchId,
              userId,
              status: {
                in: [
                  RegistrationStatus.CONFIRMED,
                  RegistrationStatus.SUBSTITUTE,
                ],
              },
            },
          });
          this.rules.assertNoActiveDuplicate(active);

          const activeAbsence = await tx.registration.findFirst({
            where: {
              matchId,
              userId,
              status: RegistrationStatus.ABSENT,
            },
          });
          this.rules.assertNoActiveAbsence(activeAbsence);

          const [confirmedCount, substituteCount] = await Promise.all([
            tx.registration.count({
              where: { matchId, status: RegistrationStatus.CONFIRMED },
            }),
            tx.registration.count({
              where: { matchId, status: RegistrationStatus.SUBSTITUTE },
            }),
          ]);

          const status = this.rules.decideStatusForNewRegistration(
            confirmedCount,
            substituteCount,
            match.maxPlayers,
            match.maxSubstitutes,
          );

          const agg = await tx.registration.aggregate({
            where: { matchId },
            _max: { queueOrder: true },
          });
          const queueOrder = (agg._max.queueOrder ?? 0) + 1;

          const registration = await tx.registration.create({
            data: {
              matchId,
              userId,
              preferredPosition: dto.preferredPosition,
              status,
              queueOrder,
            },
          });

          return { registration };
        },
        SERIALIZABLE_TX,
      ),
    );
  }

  async findMine(
    matchId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ registration: Registration | null }> {
    await this.matchAccess.assertUserCanViewMatch(matchId, userId, isAdmin);

    const registration = await this.prisma.registration.findFirst({
      where: {
        matchId,
        userId,
        status: {
          in: [
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.SUBSTITUTE,
            RegistrationStatus.ABSENT,
          ],
        },
      },
    });

    return { registration };
  }

  async cancelMine(
    matchId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ canceled: true }> {
    await this.matchAccess.assertUserCanViewMatch(matchId, userId, isAdmin);
    return runWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const reg = await tx.registration.findFirst({
            where: {
              matchId,
              userId,
              status: {
                in: [
                  RegistrationStatus.CONFIRMED,
                  RegistrationStatus.SUBSTITUTE,
                ],
              },
            },
          });

          if (!reg) {
            throw new InvalidMatchStateError(
              "No active registration for this match",
            );
          }

          await tx.registration.update({
            where: { id: reg.id },
            data: { status: RegistrationStatus.CANCELED },
          });

          if (reg.status === RegistrationStatus.CONFIRMED) {
            const nextSub = await tx.registration.findFirst({
              where: {
                matchId,
                status: RegistrationStatus.SUBSTITUTE,
              },
              orderBy: [{ queueOrder: "asc" }, { createdAt: "asc" }],
            });
            if (nextSub) {
              await tx.registration.update({
                where: { id: nextSub.id },
                data: { status: RegistrationStatus.CONFIRMED },
              });
            }
          }

          return { canceled: true as const };
        },
        SERIALIZABLE_TX,
      ),
    );
  }

  async markAbsent(
    matchId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ absent: true }> {
    await this.matchAccess.assertUserCanViewMatch(matchId, userId, isAdmin);
    return runWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const match = await tx.match.findUnique({ where: { id: matchId } });
          if (!match) {
            throw new MatchNotFoundError();
          }
          this.rules.assertMatchOpenForRegistration(match, new Date());

          const activeRegistration = await tx.registration.findFirst({
            where: {
              matchId,
              userId,
              status: {
                in: [
                  RegistrationStatus.CONFIRMED,
                  RegistrationStatus.SUBSTITUTE,
                ],
              },
            },
          });
          this.rules.assertCanMarkAbsence(activeRegistration);

          const existingAbsence = await tx.registration.findFirst({
            where: { matchId, userId, status: RegistrationStatus.ABSENT },
          });
          this.rules.assertNoDuplicateAbsence(existingAbsence);

          const agg = await tx.registration.aggregate({
            where: { matchId },
            _max: { queueOrder: true },
          });
          const queueOrder = (agg._max.queueOrder ?? 0) + 1;

          await tx.registration.create({
            data: {
              matchId,
              userId,
              preferredPosition: PlayerPosition.ANY,
              status: RegistrationStatus.ABSENT,
              queueOrder,
            },
          });

          return { absent: true as const };
        },
        SERIALIZABLE_TX,
      ),
    );
  }

  async clearAbsent(
    matchId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ cleared: true }> {
    await this.matchAccess.assertUserCanViewMatch(matchId, userId, isAdmin);
    return runWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          const reg = await tx.registration.findFirst({
            where: {
              matchId,
              userId,
              status: RegistrationStatus.ABSENT,
            },
          });

          if (!reg) {
            throw new InvalidMatchStateError(
              "No active absence vote for this match",
            );
          }

          await tx.registration.update({
            where: { id: reg.id },
            data: { status: RegistrationStatus.CANCELED },
          });

          return { cleared: true as const };
        },
        SERIALIZABLE_TX,
      ),
    );
  }
}
