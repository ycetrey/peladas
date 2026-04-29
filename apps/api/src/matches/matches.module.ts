import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MatchAccessService } from "./match-access.service";
import { MatchRulesService } from "./match-rules.service";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRulesService, MatchAccessService],
  exports: [MatchesService, MatchAccessService],
})
export class MatchesModule {}
