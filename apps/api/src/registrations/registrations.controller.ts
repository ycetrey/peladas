import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { RegisterPlayerDto } from "./dto/register-player.dto";
import { RegistrationsService } from "./registrations.service";

type RequestWithUser = Request & { user: User };

@Controller("matches/:matchId/registrations")
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"))
  getMine(
    @Param("matchId") matchId: string,
    @Req() req: RequestWithUser,
  ): ReturnType<RegistrationsService["findMine"]> {
    return this.registrations.findMine(matchId, req.user.id, req.user.isAdmin);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"))
  register(
    @Param("matchId") matchId: string,
    @Body() dto: RegisterPlayerDto,
    @Req() req: RequestWithUser,
  ): ReturnType<RegistrationsService["register"]> {
    return this.registrations.register(
      matchId,
      req.user.id,
      req.user.isAdmin,
      dto,
    );
  }

  @Delete("me")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"))
  cancel(
    @Param("matchId") matchId: string,
    @Req() req: RequestWithUser,
  ): ReturnType<RegistrationsService["cancelMine"]> {
    return this.registrations.cancelMine(
      matchId,
      req.user.id,
      req.user.isAdmin,
    );
  }

  @Post("me/absence")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"))
  markAbsent(
    @Param("matchId") matchId: string,
    @Req() req: RequestWithUser,
  ): ReturnType<RegistrationsService["markAbsent"]> {
    return this.registrations.markAbsent(matchId, req.user.id, req.user.isAdmin);
  }

  @Delete("me/absence")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"))
  clearAbsent(
    @Param("matchId") matchId: string,
    @Req() req: RequestWithUser,
  ): ReturnType<RegistrationsService["clearAbsent"]> {
    return this.registrations.clearAbsent(matchId, req.user.id, req.user.isAdmin);
  }
}
