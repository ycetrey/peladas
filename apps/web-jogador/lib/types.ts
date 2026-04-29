export type MatchMode = "ALTERNATED" | "DRAW_AT_END";

export type MatchStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "FINISHED"
  | "CANCELED";

export type MatchVisibility = "PUBLIC" | "GROUP";

export type Venue = {
  id: string;
  name: string;
  locality: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationStatus =
  | "CONFIRMED"
  | "SUBSTITUTE"
  | "ABSENT"
  | "CANCELED";

export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD"
  | "ANY";

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
  venueId: string;
  visibility: MatchVisibility;
  groupId: string | null;
  venue: Venue;
  confirmedTitularCount: number;
  titularSlotsRemaining: number;
  activeRegistrationCount: number;
  absentCount: number;
  myRegistration: Registration | null;
  createdAt: string;
  updatedAt: string;
};

export type MatchListResponse = { matches: Match[] };

export type MatchDetailResponse = { match: Match };

export type MyRegistrationResponse = { registration: Registration | null };

export type ApiErrorBody = {
  error?: { code: string; message: string };
};
