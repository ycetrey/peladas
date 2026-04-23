export type MatchMode = "ALTERNATED" | "DRAW_AT_END";

export type MatchStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "FINISHED"
  | "CANCELED";

export type RegistrationStatus =
  | "CONFIRMED"
  | "SUBSTITUTE"
  | "CANCELED";

export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD"
  | "ANY";

export type Match = {
  id: string;
  title: string;
  dateTime: string;
  mode: MatchMode;
  status: MatchStatus;
  maxPlayers: number;
  maxSubstitutes: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  recurringRule?: unknown;
  createdAt: string;
  updatedAt: string;
};

export type MatchListResponse = { matches: Match[] };

export type MatchDetailResponse = { match: Match };

export type Registration = {
  id: string;
  matchId: string;
  userId: string;
  preferredPosition: PlayerPosition;
  status: RegistrationStatus;
  queueOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MyRegistrationResponse = { registration: Registration | null };

export type ApiErrorBody = {
  error?: { code: string; message: string };
};
