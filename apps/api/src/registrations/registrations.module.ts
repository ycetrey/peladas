import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PlayerUserGuard } from "./player-user.guard";
import { RegistrationRulesService } from "./registration-rules.service";
import { RegistrationsController } from "./registrations.controller";
import { RegistrationsService } from "./registrations.service";

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationsController],
  providers: [
    RegistrationsService,
    RegistrationRulesService,
    PlayerUserGuard,
  ],
})
export class RegistrationsModule {}
