import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { OrganizerUserGuard } from "../matches/organizer-user.guard";
import { TeamsService } from "./teams.service";

@Controller("matches")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post(":matchId/teams/generate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OrganizerUserGuard)
  generate(@Param("matchId") matchId: string): ReturnType<TeamsService["generateTeams"]> {
    return this.teamsService.generateTeams(matchId);
  }
}
