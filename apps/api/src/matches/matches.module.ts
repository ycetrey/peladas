import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MatchRulesService } from "./match-rules.service";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { OrganizerUserGuard } from "./organizer-user.guard";

@Module({
  imports: [PrismaModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRulesService, OrganizerUserGuard],
})
export class MatchesModule {}
