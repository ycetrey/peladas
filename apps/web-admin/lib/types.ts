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
  googlePlaceId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GroupMemberRow = {
  id: string;
  groupId: string;
  userId: string;
  createdAt: string;
  user: { id: string; email: string; name: string };
};

export type GroupWithMembers = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMemberRow[];
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

export type TeamName = "A" | "B";

export type TeamPlayer = {
  id: string;
  teamId: string;
  userId: string;
  registrationId: string;
  order: number;
};

export type TeamWithPlayers = {
  id: string;
  matchId: string;
  name: TeamName;
  players: TeamPlayer[];
};

export type GenerateTeamsResponse = { teams: TeamWithPlayers[] };

export type ApiErrorBody = {
  error?: { code: string; message: string };
};

export type CreateMatchInput = {
  title: string;
  dateTime: string;
  mode: MatchMode;
  maxPlayers: number;
  maxSubstitutes: number;
  registrationOpensAt: string;
  registrationClosesAt: string;
  venueId: string;
  visibility: MatchVisibility;
  groupId?: string;
};

export type CreateVenueInput = {
  name: string;
  locality?: string;
  googlePlaceId?: string;
};

export type VenuesListResponse = { venues: Venue[] };

export type VenuePlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

export type SuggestVenuePlacesResponse = { suggestions: VenuePlaceSuggestion[] };

export type GroupsListResponse = { groups: GroupWithMembers[] };
