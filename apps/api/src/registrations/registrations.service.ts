import { Injectable } from "@nestjs/common";
import { type Registration, RegistrationStatus } from "@prisma/client";
import {
  InvalidMatchStateError,
  MatchNotFoundError,
} from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterPlayerDto } from "./dto/register-player.dto";
import { RegistrationRulesService } from "./registration-rules.service";

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rules: RegistrationRulesService,
  ) {}

  async register(
    matchId: string,
    userId: string,
    dto: RegisterPlayerDto,
  ): Promise<{ registration: Registration }> {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      throw new MatchNotFoundError();
    }

    this.rules.assertMatchOpenForRegistration(match, new Date());

    const active = await this.prisma.registration.findFirst({
      where: {
        matchId,
        userId,
        status: {
          in: [RegistrationStatus.CONFIRMED, RegistrationStatus.SUBSTITUTE],
        },
      },
    });
    this.rules.assertNoActiveDuplicate(active);

    const [confirmedCount, substituteCount] = await Promise.all([
      this.prisma.registration.count({
        where: { matchId, status: RegistrationStatus.CONFIRMED },
      }),
      this.prisma.registration.count({
        where: { matchId, status: RegistrationStatus.SUBSTITUTE },
      }),
    ]);

    const status = this.rules.decideStatusForNewRegistration(
      confirmedCount,
      substituteCount,
      match.maxPlayers,
      match.maxSubstitutes,
    );

    const agg = await this.prisma.registration.aggregate({
      where: { matchId },
      _max: { queueOrder: true },
    });
    const queueOrder = (agg._max.queueOrder ?? 0) + 1;

    const registration = await this.prisma.registration.create({
      data: {
        matchId,
        userId,
        preferredPosition: dto.preferredPosition,
        status,
        queueOrder,
      },
    });

    return { registration };
  }

  async cancelMine(
    matchId: string,
    userId: string,
  ): Promise<{ canceled: true }> {
    const reg = await this.prisma.registration.findFirst({
      where: {
        matchId,
        userId,
        status: {
          in: [RegistrationStatus.CONFIRMED, RegistrationStatus.SUBSTITUTE],
        },
      },
    });

    if (!reg) {
      throw new InvalidMatchStateError(
        "No active registration for this match",
      );
    }

    if (reg.status === RegistrationStatus.SUBSTITUTE) {
      await this.prisma.registration.update({
        where: { id: reg.id },
        data: { status: RegistrationStatus.CANCELED },
      });
      return { canceled: true };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: reg.id },
        data: { status: RegistrationStatus.CANCELED },
      });
      const nextSub = await tx.registration.findFirst({
        where: {
          matchId,
          status: RegistrationStatus.SUBSTITUTE,
        },
        orderBy: { queueOrder: "asc" },
      });
      if (nextSub) {
        await tx.registration.update({
          where: { id: nextSub.id },
          data: { status: RegistrationStatus.CONFIRMED },
        });
      }
    });

    return { canceled: true };
  }
}
