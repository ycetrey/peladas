import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MatchesModule } from "../matches/matches.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RegistrationRulesService } from "./registration-rules.service";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";

@Module({
  imports: [PrismaModule, AuthModule, MatchesModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationRulesService],
})
export class RegistrationsModule {}
