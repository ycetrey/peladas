import { BadRequestException, Injectable } from "@nestjs/common";
import {
  MatchStatus,
  MatchVisibility,
  RegistrationStatus,
  type Match,
  type Prisma,
  type Registration,
  type Venue,
} from "@prisma/client";
import {
  GroupNotFoundError,
  GroupNotOwnedError,
  MatchNotFoundError,
  VenueNotFoundError,
  VenueNotOwnedError,
} from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateMatchDto } from "./dto/create-match.dto";
import { MatchAccessService } from "./match-access.service";
import { MatchRulesService } from "./match-rules.service";

export type MatchApiRow = Match & {
  venue: Venue;
  confirmedTitularCount: number;
  titularSlotsRemaining: number;
  activeRegistrationCount: number;
  absentCount: number;
  myRegistration: Registration | null;
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchRules: MatchRulesService,
    private readonly access: MatchAccessService,
  ) {}

  async create(
    dto: CreateMatchDto,
    organizerUserId: string,
  ): Promise<{ match: MatchApiRow }> {
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

    if (dto.visibility === MatchVisibility.GROUP && !dto.groupId) {
      throw new BadRequestException(
        "groupId is required when visibility is GROUP",
      );
    }
    if (dto.visibility === MatchVisibility.PUBLIC && dto.groupId) {
      throw new BadRequestException(
        "groupId must not be set when visibility is PUBLIC",
      );
    }

    const venue = await this.prisma.venue.findUnique({
      where: { id: dto.venueId },
    });
    if (!venue) {
      throw new VenueNotFoundError();
    }
    if (venue.createdByUserId !== organizerUserId) {
      throw new VenueNotOwnedError();
    }

    if (dto.groupId) {
      const group = await this.prisma.group.findUnique({
        where: { id: dto.groupId },
      });
      if (!group) {
        throw new GroupNotFoundError();
      }
      if (group.createdByUserId !== organizerUserId) {
        throw new GroupNotOwnedError();
      }
    }

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
        venueId: dto.venueId,
        visibility: dto.visibility,
        groupId:
          dto.visibility === MatchVisibility.GROUP ? dto.groupId! : null,
      },
      include: {
        venue: true,
        _count: {
          select: {
            registrations: {
              where: { status: RegistrationStatus.CONFIRMED },
            },
          },
        },
      },
    });

    return { match: this.toMatchApiRow(match, null, 0) };
  }

  async findMany(params: {
    userId: string;
    isAdmin: boolean;
    status?: string;
    limit?: string;
  }): Promise<{ matches: MatchApiRow[] }> {
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

    const visibilityWhere = this.access.visibilityWhereForUser(
      params.userId,
      params.isAdmin,
    );

    const where: Prisma.MatchWhereInput = {
      ...(status !== undefined ? { status } : {}),
      ...visibilityWhere,
    };

    const rows = await this.prisma.match.findMany({
      where,
      orderBy: { dateTime: "asc" },
      take: limit,
      include: {
        venue: true,
        _count: {
          select: {
            registrations: {
              where: { status: RegistrationStatus.CONFIRMED },
            },
          },
        },
      },
    });

    const matchIds = rows.map((r) => r.id);
    const myRegs =
      matchIds.length === 0
        ? []
        : await this.prisma.registration.findMany({
            where: {
              matchId: { in: matchIds },
              userId: params.userId,
              status: {
                in: [
                  RegistrationStatus.CONFIRMED,
                  RegistrationStatus.SUBSTITUTE,
                  RegistrationStatus.ABSENT,
                ],
              },
            },
          });
    const regByMatch = new Map(myRegs.map((r) => [r.matchId, r]));
    const absentCounts =
      matchIds.length === 0
        ? []
        : await this.prisma.registration.groupBy({
            by: ["matchId"],
            where: {
              matchId: { in: matchIds },
              status: RegistrationStatus.ABSENT,
            },
            _count: { _all: true },
          });
    const absentByMatch = new Map(
      absentCounts.map((r) => [r.matchId, r._count._all]),
    );

    return {
      matches: rows.map((m) =>
        this.toMatchApiRow(
          m,
          regByMatch.get(m.id) ?? null,
          absentByMatch.get(m.id) ?? 0,
        ),
      ),
    };
  }

  async findOne(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ match: MatchApiRow }> {
    const visibilityWhere = this.access.visibilityWhereForUser(
      userId,
      isAdmin,
    );
    const row = await this.prisma.match.findFirst({
      where: { id, ...visibilityWhere },
      include: {
        venue: true,
        _count: {
          select: {
            registrations: {
              where: { status: RegistrationStatus.CONFIRMED },
            },
          },
        },
      },
    });
    if (!row) {
      throw new MatchNotFoundError();
    }

    const myRegistration = await this.prisma.registration.findFirst({
      where: {
        matchId: id,
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
    const absentCount = await this.prisma.registration.count({
      where: { matchId: id, status: RegistrationStatus.ABSENT },
    });

    return { match: this.toMatchApiRow(row, myRegistration, absentCount) };
  }

  private toMatchApiRow(
    m: Match & {
      venue: Venue;
      _count: { registrations: number };
    },
    myRegistration: Registration | null,
    absentCount: number,
  ): MatchApiRow {
    const confirmedTitularCount = m._count.registrations;
    const titularSlotsRemaining = Math.max(0, m.maxPlayers - confirmedTitularCount);
    const activeRegistrationCount = confirmedTitularCount + absentCount;
    const { _count: _c, ...rest } = m;
    return {
      ...rest,
      confirmedTitularCount,
      titularSlotsRemaining,
      activeRegistrationCount,
      absentCount,
      myRegistration,
    };
  }
}
