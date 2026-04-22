import { BadRequestException, Injectable } from "@nestjs/common";
import { MatchStatus, type Match, type Prisma } from "@prisma/client";
import { MatchNotFoundError } from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateMatchDto } from "./dto/create-match.dto";
import { MatchRulesService } from "./match-rules.service";

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchRules: MatchRulesService,
  ) {}

  async create(
    dto: CreateMatchDto,
    _organizerUserId: string,
  ): Promise<{ match: Match }> {
    const dateTime = new Date(dto.dateTime);
    const registrationOpensAt = new Date(dto.registrationOpensAt);
    const registrationClosesAt = new Date(dto.registrationClosesAt);

    this.matchRules.validateCreate({
      title: dto.title,
      dateTime,
      mode: dto.mode,
      maxPlayers: dto.maxPlayers,
      maxSubstitutes: dto.maxSubstitutes,
      registrationOpensAt,
      registrationClosesAt,
      recurringRule: dto.recurringRule,
    });

    const recurringRule =
      dto.recurringRule === undefined
        ? undefined
        : (dto.recurringRule as Prisma.InputJsonValue);

    const match = await this.prisma.match.create({
      data: {
        title: dto.title,
        dateTime,
        mode: dto.mode,
        status: MatchStatus.OPEN,
        maxPlayers: dto.maxPlayers,
        maxSubstitutes: dto.maxSubstitutes,
        registrationOpensAt,
        registrationClosesAt,
        recurringRule,
      },
    });

    return { match };
  }

  async findMany(params: {
    status?: string;
    limit?: string;
  }): Promise<{ matches: Match[] }> {
    const limitRaw = params.limit !== undefined ? Number(params.limit) : 50;
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, Math.trunc(limitRaw)))
      : 50;

    let status: MatchStatus | undefined;
    if (params.status !== undefined && params.status !== "") {
      if (!Object.values(MatchStatus).includes(params.status as MatchStatus)) {
        throw new BadRequestException(`Invalid status: ${params.status}`);
      }
      status = params.status as MatchStatus;
    }

    const matches = await this.prisma.match.findMany({
      where: status !== undefined ? { status } : {},
      orderBy: { dateTime: "asc" },
      take: limit,
    });

    return { matches };
  }

  async findOne(id: string): Promise<{ match: Match }> {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) {
      throw new MatchNotFoundError();
    }
    return { match };
  }
}
