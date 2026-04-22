import { MatchMode } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateMatchDto {
  @IsString()
  title!: string;

  @IsDateString()
  dateTime!: string;

  @IsEnum(MatchMode)
  mode!: MatchMode;

  @IsInt()
  @Min(2)
  maxPlayers!: number;

  @IsInt()
  @Min(0)
  maxSubstitutes!: number;

  @IsDateString()
  registrationOpensAt!: string;

  @IsDateString()
  registrationClosesAt!: string;

  @IsOptional()
  @IsObject()
  recurringRule?: Record<string, unknown>;
}
