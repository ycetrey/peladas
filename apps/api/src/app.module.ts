import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { MatchesModule } from "./matches/matches.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RegistrationsModule } from "./registrations/registrations.module";
import { TeamsModule } from "./teams/teams.module";

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    MatchesModule,
    RegistrationsModule,
    TeamsModule,
  ],
})
export class AppModule {}
