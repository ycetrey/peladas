import { Injectable } from "@nestjs/common";
import { MatchVisibility, type Prisma } from "@prisma/client";
import { MatchNotFoundError } from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MatchAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** WHERE fragment for listing matches visible to a non-admin user. */
  visibilityWhereForUser(
    userId: string,
    isAdmin: boolean,
  ): Prisma.MatchWhereInput {
    if (isAdmin) {
      return {};
    }
    return {
      OR: [
        { visibility: MatchVisibility.PUBLIC },
        {
          visibility: MatchVisibility.GROUP,
          group: {
            members: { some: { userId } },
          },
        },
      ],
    };
  }

  /**
   * Ensures the user may access this match (list detail, register, etc.).
   * Admins always pass. Others: PUBLIC or member of GROUP.
   */
  async assertUserCanViewMatch(
    matchId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<void> {
    if (isAdmin) {
      return;
    }
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { visibility: true, groupId: true },
    });
    if (!match) {
      throw new MatchNotFoundError();
    }
    if (match.visibility === MatchVisibility.PUBLIC) {
      return;
    }
    if (match.visibility === MatchVisibility.GROUP) {
      if (!match.groupId) {
        throw new MatchNotFoundError();
      }
      const member = await this.prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: match.groupId, userId },
        },
      });
      if (!member) {
        throw new MatchNotFoundError();
      }
    }
  }
}
