import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TeamAssignmentService } from "./team-assignment.service";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamAssignmentService],
})
export class TeamsModule {}
