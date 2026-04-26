import type {
  ApiErrorBody,
  CreateMatchInput,
  CreateVenueInput,
  GenerateTeamsResponse,
  GroupMemberRow,
  GroupWithMembers,
  GroupsListResponse,
  Match,
  MatchDetailResponse,
  MatchListResponse,
  SuggestVenuePlacesResponse,
  Venue,
  VenuesListResponse,
} from "./types";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

function backendPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/api/backend${p}`;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { jsonBody?: unknown },
): Promise<T> {
  const isBackend = path.startsWith("/api/backend");
  const base = isBackend ? "" : getApiBaseUrl();
  const url = isBackend
    ? path
    : path.startsWith("http")
      ? path
      : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init?.headers);
  const method = (init?.method ?? "GET").toUpperCase();
  if (
    (method === "POST" || method === "PUT" || method === "PATCH") &&
    init?.jsonBody !== undefined
  ) {
    headers.set("Content-Type", "application/json");
  }
  const { jsonBody, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    credentials: isBackend ? "include" : (rest as RequestInit).credentials ?? "omit",
    body:
      jsonBody !== undefined ? JSON.stringify(jsonBody) : (rest as RequestInit).body,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const err = data as ApiErrorBody;
    const msg =
      err?.error?.message ??
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : res.statusText);
    const e = new Error(msg);
    (e as Error & { code?: string }).code = err?.error?.code;
    throw e;
  }
  return data as T;
}

export async function listMatches(): Promise<Match[]> {
  const data = await apiFetch<MatchListResponse>(backendPath("/matches"), {
    credentials: "include",
  });
  return data.matches;
}

export async function getMatch(id: string): Promise<Match> {
  const data = await apiFetch<MatchDetailResponse>(backendPath(`/matches/${id}`), {
    credentials: "include",
  });
  return data.match;
}

export async function createMatch(dto: CreateMatchInput): Promise<Match> {
  const data = await apiFetch<{ match: Match }>(backendPath("/matches"), {
    method: "POST",
    credentials: "include",
    jsonBody: dto,
  });
  return data.match;
}

export async function generateTeams(matchId: string): Promise<GenerateTeamsResponse> {
  return apiFetch<GenerateTeamsResponse>(
    backendPath(`/matches/${matchId}/teams/generate`),
    { method: "POST", credentials: "include" },
  );
}

export async function listVenues(): Promise<Venue[]> {
  const data = await apiFetch<VenuesListResponse>(backendPath("/venues"), {
    credentials: "include",
  });
  return data.venues;
}

export async function createVenue(input: CreateVenueInput): Promise<Venue> {
  const data = await apiFetch<{ venue: Venue }>(backendPath("/venues"), {
    method: "POST",
    credentials: "include",
    jsonBody: input,
  });
  return data.venue;
}

export async function suggestVenuePlaces(q: string): Promise<SuggestVenuePlacesResponse> {
  const qp = new URLSearchParams({ q });
  return apiFetch<SuggestVenuePlacesResponse>(
    backendPath(`/venues/places/suggest?${qp.toString()}`),
    { credentials: "include" },
  );
}

export async function createVenueFromGooglePlace(placeId: string): Promise<Venue> {
  const data = await apiFetch<{ venue: Venue }>(backendPath("/venues/from-google-place"), {
    method: "POST",
    credentials: "include",
    jsonBody: { placeId },
  });
  return data.venue;
}

export async function listGroups(): Promise<GroupWithMembers[]> {
  const data = await apiFetch<GroupsListResponse>(backendPath("/groups"), {
    credentials: "include",
  });
  return data.groups;
}

export async function createGroup(name: string): Promise<GroupWithMembers> {
  const data = await apiFetch<{ group: GroupWithMembers }>(backendPath("/groups"), {
    method: "POST",
    credentials: "include",
    jsonBody: { name },
  });
  return data.group;
}

export async function addGroupMember(
  groupId: string,
  email: string,
): Promise<GroupMemberRow> {
  const data = await apiFetch<{ member: GroupMemberRow }>(
    backendPath(`/groups/${groupId}/members`),
    {
      method: "POST",
      credentials: "include",
      jsonBody: { email },
    },
  );
  return data.member;
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<void> {
  await apiFetch<unknown>(backendPath(`/groups/${groupId}/members/${userId}`), {
    method: "DELETE",
    credentials: "include",
  });
}

export async function getVenue(id: string): Promise<Venue> {
  const data = await apiFetch<{ venue: Venue }>(backendPath(`/venues/${id}`), {
    credentials: "include",
  });
  return data.venue;
}

export async function updateVenue(
  id: string,
  body: { name?: string; locality?: string | null },
): Promise<Venue> {
  const data = await apiFetch<{ venue: Venue }>(backendPath(`/venues/${id}`), {
    method: "PATCH",
    credentials: "include",
    jsonBody: body,
  });
  return data.venue;
}

export async function deleteVenue(id: string): Promise<void> {
  await apiFetch<{ deleted: true }>(backendPath(`/venues/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
}

export async function getGroup(id: string): Promise<GroupWithMembers> {
  const data = await apiFetch<{ group: GroupWithMembers }>(backendPath(`/groups/${id}`), {
    credentials: "include",
  });
  return data.group;
}

export async function updateGroup(id: string, name: string): Promise<GroupWithMembers> {
  const data = await apiFetch<{ group: GroupWithMembers }>(backendPath(`/groups/${id}`), {
    method: "PATCH",
    credentials: "include",
    jsonBody: { name },
  });
  return data.group;
}

export async function deleteGroup(id: string): Promise<void> {
  await apiFetch<{ deleted: true }>(backendPath(`/groups/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
}
