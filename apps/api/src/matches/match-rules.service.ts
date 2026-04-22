import { Injectable } from "@nestjs/common";
import { MatchMode } from "@prisma/client";
import { InvalidMatchCreationError } from "../common/errors/domain-errors";

export interface CreateMatchRulesInput {
  title: string;
  dateTime: Date;
  mode: MatchMode;
  maxPlayers: number;
  maxSubstitutes: number;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  recurringRule?: unknown;
}

const MATCH_MODES: readonly MatchMode[] = ["ALTERNATED", "DRAW_AT_END"] as const;

const RECURRING_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"] as const;

@Injectable()
export class MatchRulesService {
  validateCreate(input: CreateMatchRulesInput): void {
    if (!MATCH_MODES.includes(input.mode)) {
      throw new InvalidMatchCreationError("Invalid match mode");
    }

    if (!Number.isInteger(input.maxPlayers) || input.maxPlayers < 2) {
      throw new InvalidMatchCreationError(
        "maxPlayers must be an integer of at least 2",
      );
    }
    if (input.maxPlayers % 2 !== 0) {
      throw new InvalidMatchCreationError("maxPlayers must be even");
    }

    if (!Number.isInteger(input.maxSubstitutes) || input.maxSubstitutes < 0) {
      throw new InvalidMatchCreationError(
        "maxSubstitutes must be a non-negative integer",
      );
    }

    const { registrationOpensAt, registrationClosesAt, dateTime } = input;
    if (!(registrationOpensAt < registrationClosesAt)) {
      throw new InvalidMatchCreationError(
        "registrationOpensAt must be before registrationClosesAt",
      );
    }
    if (!(registrationClosesAt < dateTime)) {
      throw new InvalidMatchCreationError(
        "registrationClosesAt must be before dateTime",
      );
    }

    if (input.recurringRule !== undefined && input.recurringRule !== null) {
      if (
        typeof input.recurringRule !== "object" ||
        Array.isArray(input.recurringRule)
      ) {
        throw new InvalidMatchCreationError("recurringRule must be an object");
      }
      const rule = input.recurringRule as Record<string, unknown>;
      const frequency = rule.frequency;
      if (
        typeof frequency !== "string" ||
        !RECURRING_FREQUENCIES.includes(
          frequency as (typeof RECURRING_FREQUENCIES)[number],
        )
      ) {
        throw new InvalidMatchCreationError(
          "recurringRule.frequency must be DAILY, WEEKLY, or MONTHLY",
        );
      }
    }
  }
}
