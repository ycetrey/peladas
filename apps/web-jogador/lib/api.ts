import type {
  ApiErrorBody,
  Match,
  MatchDetailResponse,
  MatchListResponse,
  MyRegistrationResponse,
  PlayerPosition,
  Registration,
} from "./types";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { jsonBody?: unknown },
): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
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
  const data = await apiFetch<MatchListResponse>("/matches");
  return data.matches;
}

export async function getMatch(id: string): Promise<Match> {
  const data = await apiFetch<MatchDetailResponse>(`/matches/${id}`);
  return data.match;
}

export async function getMyRegistration(
  matchId: string,
  playerUserId: string,
): Promise<Registration | null> {
  const data = await apiFetch<MyRegistrationResponse>(
    `/matches/${matchId}/registrations/me`,
    {
      headers: { "X-Player-User-Id": playerUserId },
    },
  );
  return data.registration;
}

export async function registerForMatch(
  matchId: string,
  playerUserId: string,
  preferredPosition: PlayerPosition,
): Promise<void> {
  await apiFetch<unknown>(`/matches/${matchId}/registrations`, {
    method: "POST",
    headers: { "X-Player-User-Id": playerUserId },
    jsonBody: { preferredPosition },
  });
}

export async function cancelMyRegistration(
  matchId: string,
  playerUserId: string,
): Promise<void> {
  await apiFetch<unknown>(`/matches/${matchId}/registrations/me`, {
    method: "DELETE",
    headers: { "X-Player-User-Id": playerUserId },
  });
}
