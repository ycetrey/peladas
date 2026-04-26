import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { AdminGuard } from "../auth/admin.guard";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { FromGooglePlaceDto } from "./dto/from-google-place.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { VenuesService } from "./venues.service";

type RequestWithUser = Request & { user: User };

@Controller("venues")
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  list(@Req() req: RequestWithUser): ReturnType<VenuesService["findMany"]> {
    return this.venues.findMany(req.user.id);
  }

  @Get("places/suggest")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  suggestPlaces(
    @Query("q") q: string,
  ): ReturnType<VenuesService["suggestPlaces"]> {
    return this.venues.suggestPlaces(q ?? "");
  }

  @Post("from-google-place")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  createFromGoogle(
    @Body() dto: FromGooglePlaceDto,
    @Req() req: RequestWithUser,
  ): ReturnType<VenuesService["createFromGooglePlace"]> {
    return this.venues.createFromGooglePlace(dto.placeId, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  create(
    @Body() dto: CreateVenueDto,
    @Req() req: RequestWithUser,
  ): ReturnType<VenuesService["create"]> {
    return this.venues.create(dto, req.user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  findOne(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): ReturnType<VenuesService["findOne"]> {
    return this.venues.findOne(id, req.user.id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  patch(
    @Param("id") id: string,
    @Body() dto: UpdateVenueDto,
    @Req() req: RequestWithUser,
  ): ReturnType<VenuesService["update"]> {
    return this.venues.update(id, req.user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  remove(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): ReturnType<VenuesService["remove"]> {
    return this.venues.remove(id, req.user.id);
  }
}
