import { Injectable } from "@nestjs/common";
import {
  Prisma,
  RegistrationStatus,
  TeamName,
  type Team,
  type TeamPlayer,
  type User,
} from "@prisma/client";
import {
  MatchNotFoundError,
  TeamsAlreadyGeneratedError,
  WrongConfirmedCountForTeamsError,
} from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import { TeamAssignmentService } from "./team-assignment.service";

export type TeamWithPlayers = Team & {
  players: (TeamPlayer & { user: User })[];
};

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignment: TeamAssignmentService,
  ) {}

  async generateTeams(matchId: string): Promise<{ teams: TeamWithPlayers[] }> {
    return this.prisma.$transaction(
      async (tx) => {
        const match = await tx.match.findUnique({
          where: { id: matchId },
          include: {
            teams: true,
            registrations: {
              where: { status: RegistrationStatus.CONFIRMED },
              orderBy: { queueOrder: "asc" },
            },
          },
        });

        if (!match) {
          throw new MatchNotFoundError();
        }

        if (match.teams.length > 0) {
          throw new TeamsAlreadyGeneratedError();
        }

        if (match.registrations.length !== match.maxPlayers) {
          throw new WrongConfirmedCountForTeamsError(
            `Expected ${match.maxPlayers} confirmed registrations to generate teams; got ${match.registrations.length}.`,
          );
        }

        const slots = this.assignment.assign(
          match.registrations.map((r) => ({
            id: r.id,
            userId: r.userId,
            queueOrder: r.queueOrder,
          })),
          match.mode,
        );

        const teamA = await tx.team.create({
          data: { matchId, name: TeamName.A },
        });
        const teamB = await tx.team.create({
          data: { matchId, name: TeamName.B },
        });

        const teamId = (name: TeamName) =>
          name === TeamName.A ? teamA.id : teamB.id;

        await tx.teamPlayer.createMany({
          data: slots.map((s) => ({
            teamId: teamId(s.teamName),
            userId: s.userId,
            registrationId: s.registrationId,
            order: s.orderInTeam,
          })),
        });

        const teams = await tx.team.findMany({
          where: { matchId },
          include: {
            players: {
              orderBy: { order: "asc" },
              include: { user: true },
            },
          },
          orderBy: { name: "asc" },
        });

        return { teams };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
