import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { RegisterPlayerDto } from "./dto/register-player.dto";
import { PlayerUserGuard } from "./player-user.guard";
import type { RequestWithPlayer } from "./request-with-player";
import { RegistrationsService } from "./registrations.service";

@Controller("matches/:matchId/registrations")
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PlayerUserGuard)
  register(
    @Param("matchId") matchId: string,
    @Body() dto: RegisterPlayerDto,
    @Req() req: RequestWithPlayer,
  ): ReturnType<RegistrationsService["register"]> {
    return this.registrations.register(matchId, req.playerUser!.id, dto);
  }

  @Delete("me")
  @HttpCode(HttpStatus.OK)
  @UseGuards(PlayerUserGuard)
  cancel(
    @Param("matchId") matchId: string,
    @Req() req: RequestWithPlayer,
  ): ReturnType<RegistrationsService["cancelMine"]> {
    return this.registrations.cancelMine(matchId, req.playerUser!.id);
  }
}
