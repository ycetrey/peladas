import { BadRequestException, Injectable } from "@nestjs/common";
import type { Venue } from "@prisma/client";
import {
  GooglePlacesDisabledError,
  VenueHasMatchesError,
  VenueNotFoundError,
} from "../common/errors/domain-errors";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateVenueDto } from "./dto/create-venue.dto";
import type { UpdateVenueDto } from "./dto/update-venue.dto";
import { GooglePlacesService } from "./google-places.service";

export type PlaceSuggestResponse = {
  suggestions: {
    placeId: string;
    primaryText: string;
    secondaryText: string;
  }[];
};

@Injectable()
export class VenuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googlePlaces: GooglePlacesService,
  ) {}

  async findMany(createdByUserId: string): Promise<{ venues: Venue[] }> {
    const venues = await this.prisma.venue.findMany({
      where: { createdByUserId },
      orderBy: { name: "asc" },
    });
    return { venues };
  }

  async findOne(
    id: string,
    createdByUserId: string,
  ): Promise<{ venue: Venue }> {
    const venue = await this.prisma.venue.findFirst({
      where: { id, createdByUserId },
    });
    if (!venue) {
      throw new VenueNotFoundError();
    }
    return { venue };
  }

  async update(
    id: string,
    createdByUserId: string,
    dto: UpdateVenueDto,
  ): Promise<{ venue: Venue }> {
    await this.findOne(id, createdByUserId);
    const data: { name?: string; locality?: string | null } = {};
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.locality !== undefined) {
      data.locality =
        dto.locality.trim() === "" ? null : dto.locality.trim();
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException("Nada para atualizar.");
    }
    const venue = await this.prisma.venue.update({
      where: { id },
      data,
    });
    return { venue };
  }

  async remove(
    id: string,
    createdByUserId: string,
  ): Promise<{ deleted: true }> {
    await this.findOne(id, createdByUserId);
    const count = await this.prisma.match.count({ where: { venueId: id } });
    if (count > 0) {
      throw new VenueHasMatchesError();
    }
    await this.prisma.venue.delete({ where: { id } });
    return { deleted: true };
  }

  async create(
    dto: CreateVenueDto,
    createdByUserId: string,
  ): Promise<{ venue: Venue }> {
    const googlePlaceId =
      dto.googlePlaceId !== undefined && dto.googlePlaceId.trim() !== ""
        ? dto.googlePlaceId.trim()
        : null;

    const venue = await this.prisma.venue.create({
      data: {
        name: dto.name.trim(),
        locality:
          dto.locality !== undefined && dto.locality.trim() !== ""
            ? dto.locality.trim()
            : null,
        googlePlaceId,
        createdByUserId,
      },
    });
    return { venue };
  }

  async suggestPlaces(q: string): Promise<PlaceSuggestResponse> {
    if (!this.googlePlaces.isEnabled()) {
      return { suggestions: [] };
    }
    const suggestions = await this.googlePlaces.suggest(q);
    return { suggestions };
  }

  async createFromGooglePlace(
    placeId: string,
    createdByUserId: string,
  ): Promise<{ venue: Venue }> {
    if (!this.googlePlaces.isEnabled()) {
      throw new GooglePlacesDisabledError();
    }
    const trimmed = placeId.trim();
    const existing = await this.prisma.venue.findFirst({
      where: { createdByUserId, googlePlaceId: trimmed },
    });
    if (existing) {
      return { venue: existing };
    }
    const details = await this.googlePlaces.fetchPlaceById(trimmed);
    if (!details) {
      throw new BadRequestException(
        "Não foi possível obter os detalhes deste local no Google Places.",
      );
    }
    const venue = await this.prisma.venue.create({
      data: {
        name: details.name,
        locality: details.locality,
        googlePlaceId: details.placeId,
        createdByUserId,
      },
    });
    return { venue };
  }
}
