import { Module } from "@nestjs/common";
import { GooglePlacesService } from "./google-places.service";
import { VenuesController } from "./venues.controller";
import { VenuesService } from "./venues.service";

@Module({
  controllers: [VenuesController],
  providers: [VenuesService, GooglePlacesService],
  exports: [VenuesService],
})
export class VenuesModule {}
