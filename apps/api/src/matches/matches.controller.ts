import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { AdminGuard } from "../auth/admin.guard";
import { CreateMatchDto } from "./dto/create-match.dto";
import { MatchesService } from "./matches.service";

type RequestWithUser = Request & { user: User };

@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  list(
    @Req() req: RequestWithUser,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
  ): ReturnType<MatchesService["findMany"]> {
    return this.matchesService.findMany({
      userId: req.user.id,
      isAdmin: req.user.isAdmin,
      status,
      limit,
    });
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  findOne(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): ReturnType<MatchesService["findOne"]> {
    return this.matchesService.findOne(id, req.user.id, req.user.isAdmin);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  create(
    @Body() dto: CreateMatchDto,
    @Req() req: RequestWithUser,
  ): ReturnType<MatchesService["create"]> {
    return this.matchesService.create(dto, req.user.id);
  }
}
