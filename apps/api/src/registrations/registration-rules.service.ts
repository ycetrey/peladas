import { Injectable } from "@nestjs/common";
import {
  MatchStatus,
  RegistrationStatus,
  type Match,
} from "@prisma/client";
import {
  MatchNotOpenError,
  NoRegistrationSlotsError,
  RegistrationClosedError,
  UserAlreadyRegisteredError,
} from "../common/errors/domain-errors";

export type MatchRegistrationWindow = Pick<
  Match,
  "status" | "registrationOpensAt" | "registrationClosesAt"
>;

@Injectable()
export class RegistrationRulesService {
  assertMatchOpenForRegistration(
    match: MatchRegistrationWindow,
    now: Date,
  ): void {
    if (match.status !== MatchStatus.OPEN) {
      throw new MatchNotOpenError();
    }
    if (now < match.registrationOpensAt || now > match.registrationClosesAt) {
      throw new RegistrationClosedError();
    }
  }

  assertNoActiveDuplicate(
    activeRegistration: { id: string } | null | undefined,
  ): void {
    if (activeRegistration != null) {
      throw new UserAlreadyRegisteredError();
    }
  }

  decideStatusForNewRegistration(
    confirmedTitularCount: number,
    substituteCount: number,
    maxPlayers: number,
    maxSubstitutes: number,
  ): RegistrationStatus {
    if (confirmedTitularCount < maxPlayers) {
      return RegistrationStatus.CONFIRMED;
    }
    if (substituteCount < maxSubstitutes) {
      return RegistrationStatus.SUBSTITUTE;
    }
    throw new NoRegistrationSlotsError();
  }
}
