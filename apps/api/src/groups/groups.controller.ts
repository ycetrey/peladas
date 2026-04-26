import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { AdminGuard } from "../auth/admin.guard";
import { AddGroupMemberDto } from "./dto/add-group-member.dto";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupsService } from "./groups.service";

type RequestWithUser = Request & { user: User };

@Controller("groups")
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  list(@Req() req: RequestWithUser): ReturnType<GroupsService["findMany"]> {
    return this.groups.findMany(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  create(
    @Body() dto: CreateGroupDto,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["create"]> {
    return this.groups.create(dto, req.user.id);
  }

  @Post(":id/members")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  addMember(
    @Param("id") id: string,
    @Body() dto: AddGroupMemberDto,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["addMemberByEmail"]> {
    return this.groups.addMemberByEmail(id, req.user.id, dto);
  }

  @Delete(":id/members/:userId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  removeMember(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["removeMember"]> {
    return this.groups.removeMember(id, req.user.id, userId);
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  findOne(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["findOne"]> {
    return this.groups.findOne(id, req.user.id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  patch(
    @Param("id") id: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["update"]> {
    return this.groups.update(id, req.user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  remove(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): ReturnType<GroupsService["remove"]> {
    return this.groups.remove(id, req.user.id);
  }
}
