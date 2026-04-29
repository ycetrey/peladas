import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../auth/admin.guard";
import { TeamsService } from "./teams.service";

@Controller("matches")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post(":matchId/teams/generate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  generate(@Param("matchId") matchId: string): ReturnType<TeamsService["generateTeams"]> {
    return this.teamsService.generateTeams(matchId);
  }
}
