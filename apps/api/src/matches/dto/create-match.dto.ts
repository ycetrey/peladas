import { MatchMode, MatchVisibility } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
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

  @IsUUID()
  venueId!: string;

  @IsEnum(MatchVisibility)
  visibility!: MatchVisibility;

  @ValidateIf((o: CreateMatchDto) => o.visibility === MatchVisibility.GROUP)
  @IsNotEmpty()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsObject()
  recurringRule?: Record<string, unknown>;
}
