import { PlayerPosition } from "@prisma/client";
import { IsEnum } from "class-validator";

export class RegisterPlayerDto {
  @IsEnum(PlayerPosition)
  preferredPosition!: PlayerPosition;
}
