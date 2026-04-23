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
