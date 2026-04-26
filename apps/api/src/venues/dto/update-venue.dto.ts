import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateVenueDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  locality?: string;
}
