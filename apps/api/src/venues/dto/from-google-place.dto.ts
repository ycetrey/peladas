import { IsString, MinLength } from "class-validator";

export class FromGooglePlaceDto {
  @IsString()
  @MinLength(3)
  placeId!: string;
}
