/** Base for predictable business-rule errors (ERR-01). */

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MatchNotOpenError extends DomainError {
  readonly code = "MatchNotOpenError";
  constructor(message = "Match is not open for registration") {
    super(message);
  }
}

export class RegistrationClosedError extends DomainError {
  readonly code = "RegistrationClosedError";
  constructor(message = "Registration is closed") {
    super(message);
  }
}

export class UserAlreadyRegisteredError extends DomainError {
  readonly code = "UserAlreadyRegisteredError";
  constructor(message = "User is already registered for this match") {
    super(message);
  }
}

export class UserMarkedAbsentError extends DomainError {
  readonly code = "UserMarkedAbsentError";
  constructor(message = "User has already marked as absent for this match") {
    super(message);
  }
}

export class AbsenceBlockedByRegistrationError extends DomainError {
  readonly code = "AbsenceBlockedByRegistrationError";
  constructor(
    message = "User must cancel active registration before marking absence",
  ) {
    super(message);
  }
}

export class RegistrationBlockedByAbsenceError extends DomainError {
  readonly code = "RegistrationBlockedByAbsenceError";
  constructor(message = "User must clear absence vote before registering") {
    super(message);
  }
}

export class InvalidMatchStateError extends DomainError {
  readonly code = "InvalidMatchStateError";
  constructor(message = "Invalid match state for this operation") {
    super(message);
  }
}

export class MatchNotFoundError extends DomainError {
  readonly code = "MatchNotFoundError";
  constructor(message = "Match not found") {
    super(message);
  }
}

export class InvalidMatchCreationError extends DomainError {
  readonly code = "InvalidMatchCreationError";
  constructor(message: string) {
    super(message);
  }
}

export class NoRegistrationSlotsError extends DomainError {
  readonly code = "NoRegistrationSlotsError";
  constructor(
    message = "No slots available for titulars or substitutes on this match",
  ) {
    super(message);
  }
}

export class WrongConfirmedCountForTeamsError extends DomainError {
  readonly code = "WrongConfirmedCountForTeamsError";
  constructor(
    message = "Wrong number of confirmed players to generate teams for this match",
  ) {
    super(message);
  }
}

export class TeamsAlreadyGeneratedError extends DomainError {
  readonly code = "TeamsAlreadyGeneratedError";
  constructor(message = "Teams have already been generated for this match") {
    super(message);
  }
}

export class VenueNotFoundError extends DomainError {
  readonly code = "VenueNotFoundError";
  constructor(message = "Venue not found") {
    super(message);
  }
}

export class GroupNotFoundError extends DomainError {
  readonly code = "GroupNotFoundError";
  constructor(message = "Group not found") {
    super(message);
  }
}

export class UserNotRegisteredError extends DomainError {
  readonly code = "UserNotRegisteredError";
  constructor(message = "No user registered with this email") {
    super(message);
  }
}

export class VenueNotOwnedError extends DomainError {
  readonly code = "VenueNotOwnedError";
  constructor(message = "This venue does not belong to your catalog") {
    super(message);
  }
}

export class GroupNotOwnedError extends DomainError {
  readonly code = "GroupNotOwnedError";
  constructor(message = "This group does not belong to your catalog") {
    super(message);
  }
}

export class GooglePlacesDisabledError extends DomainError {
  readonly code = "GooglePlacesDisabledError";
  constructor(message = "Google Places is not configured on the server") {
    super(message);
  }
}

export class VenueHasMatchesError extends DomainError {
  readonly code = "VenueHasMatchesError";
  constructor(
    message = "Não é possível apagar este campo porque existem partidas associadas.",
  ) {
    super(message);
  }
}

export class GroupHasMatchesError extends DomainError {
  readonly code = "GroupHasMatchesError";
  constructor(
    message = "Não é possível apagar este grupo porque existem partidas associadas.",
  ) {
    super(message);
  }
}
