import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CreateMatchDto } from "./dto/create-match.dto";
import { MatchesService } from "./matches.service";
import { OrganizerUserGuard } from "./organizer-user.guard";
import type { RequestWithOrganizer } from "./request-with-organizer";

@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  list(
    @Query("status") status?: string,
    @Query("limit") limit?: string,
  ): ReturnType<MatchesService["findMany"]> {
    return this.matchesService.findMany({ status, limit });
  }

  @Get(":id")
  findOne(@Param("id") id: string): ReturnType<MatchesService["findOne"]> {
    return this.matchesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OrganizerUserGuard)
  create(
    @Body() dto: CreateMatchDto,
    @Req() req: RequestWithOrganizer,
  ): ReturnType<MatchesService["create"]> {
    return this.matchesService.create(dto, req.organizerUser!.id);
  }
}
