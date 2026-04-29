import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { GroupsModule } from "./groups/groups.module";
import { HealthModule } from "./health/health.module";
import { MatchesModule } from "./matches/matches.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RegistrationsModule } from "./registrations/registrations.module";
import { TeamsModule } from "./teams/teams.module";
import { VenuesModule } from "./venues/venues.module";

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    AuthModule,
    VenuesModule,
    GroupsModule,
    MatchesModule,
    RegistrationsModule,
    TeamsModule,
  ],
})
export class AppModule {}
