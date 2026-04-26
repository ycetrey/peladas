import { BadRequestException, Injectable } from "@nestjs/common";
import type { Group, GroupMember, User } from "@prisma/client";
import {
  GroupHasMatchesError,
  GroupNotFoundError,
  UserNotRegisteredError,
} from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import type { AddGroupMemberDto } from "./dto/add-group-member.dto";
import type { CreateGroupDto } from "./dto/create-group.dto";
import type { UpdateGroupDto } from "./dto/update-group.dto";

const groupWithMembersInclude = {
  members: {
    include: {
      user: { select: { id: true, email: true, name: true } as const },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export type GroupWithMembers = Group & {
  members: (GroupMember & { user: Pick<User, "id" | "email" | "name"> })[];
};

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(createdByUserId: string): Promise<{ groups: GroupWithMembers[] }> {
    const groups = await this.prisma.group.findMany({
      where: { createdByUserId },
      orderBy: { name: "asc" },
      include: groupWithMembersInclude,
    });
    return { groups };
  }

  async findOne(
    id: string,
    createdByUserId: string,
  ): Promise<{ group: GroupWithMembers }> {
    const group = await this.prisma.group.findFirst({
      where: { id, createdByUserId },
      include: groupWithMembersInclude,
    });
    if (!group) {
      throw new GroupNotFoundError();
    }
    return { group };
  }

  async update(
    id: string,
    createdByUserId: string,
    dto: UpdateGroupDto,
  ): Promise<{ group: GroupWithMembers }> {
    await this.findOne(id, createdByUserId);
    if (dto.name === undefined) {
      throw new BadRequestException("Nada para atualizar.");
    }
    const group = await this.prisma.group.update({
      where: { id },
      data: { name: dto.name.trim() },
      include: groupWithMembersInclude,
    });
    return { group };
  }

  async remove(
    id: string,
    createdByUserId: string,
  ): Promise<{ deleted: true }> {
    await this.findOne(id, createdByUserId);
    const count = await this.prisma.match.count({ where: { groupId: id } });
    if (count > 0) {
      throw new GroupHasMatchesError();
    }
    await this.prisma.group.delete({ where: { id } });
    return { deleted: true };
  }

  async create(
    dto: CreateGroupDto,
    createdByUserId: string,
  ): Promise<{ group: GroupWithMembers }> {
    const group = await this.prisma.group.create({
      data: { name: dto.name.trim(), createdByUserId },
      include: groupWithMembersInclude,
    });
    return { group };
  }

  async addMemberByEmail(
    groupId: string,
    adminUserId: string,
    dto: AddGroupMemberDto,
  ): Promise<{ member: GroupMember & { user: Pick<User, "id" | "email" | "name"> } }> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, createdByUserId: adminUserId },
    });
    if (!group) {
      throw new GroupNotFoundError();
    }
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UserNotRegisteredError();
    }
    const member = await this.prisma.groupMember.upsert({
      where: {
        groupId_userId: { groupId, userId: user.id },
      },
      create: { groupId, userId: user.id },
      update: {},
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
    return { member };
  }

  async removeMember(
    groupId: string,
    adminUserId: string,
    userId: string,
  ): Promise<{ removed: true }> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, createdByUserId: adminUserId },
    });
    if (!group) {
      throw new GroupNotFoundError();
    }
    await this.prisma.groupMember.deleteMany({
      where: { groupId, userId },
    });
    return { removed: true };
  }
}
