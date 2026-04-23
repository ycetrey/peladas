import { Module } from "@nestjs/common";
import { MatchesModule } from "../matches/matches.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TeamAssignmentService } from "./team-assignment.service";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";

@Module({
  imports: [PrismaModule, MatchesModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamAssignmentService],
})
export class TeamsModule {}
