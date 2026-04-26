import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateVenueDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  locality?: string;

  /** Se definido, dedupe por admin + Google Place (índice parcial na BD). */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  googlePlaceId?: string;
}
