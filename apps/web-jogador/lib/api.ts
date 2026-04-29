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

export async function getMyRegistration(matchId: string): Promise<Registration | null> {
  const data = await apiFetch<MyRegistrationResponse>(
    backendPath(`/matches/${matchId}/registrations/me`),
  );
  return data.registration;
}

export async function registerForMatch(
  matchId: string,
  preferredPosition: PlayerPosition,
): Promise<void> {
  await apiFetch<unknown>(backendPath(`/matches/${matchId}/registrations`), {
    method: "POST",
    jsonBody: { preferredPosition },
  });
}

export async function cancelMyRegistration(matchId: string): Promise<void> {
  await apiFetch<unknown>(backendPath(`/matches/${matchId}/registrations/me`), {
    method: "DELETE",
  });
}

export async function markMyAbsence(matchId: string): Promise<void> {
  await apiFetch<unknown>(
    backendPath(`/matches/${matchId}/registrations/me/absence`),
    {
      method: "POST",
    },
  );
}

export async function clearMyAbsence(matchId: string): Promise<void> {
  await apiFetch<unknown>(
    backendPath(`/matches/${matchId}/registrations/me/absence`),
    {
      method: "DELETE",
    },
  );
}
