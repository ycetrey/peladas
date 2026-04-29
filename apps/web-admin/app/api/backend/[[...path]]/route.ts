import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PELADAS_ACCESS_COOKIE } from "../../../../lib/cookie-name";
import { getInternalApiBaseUrl } from "../../../../lib/internal-api-base";

type RouteCtx = { params: Promise<{ path?: string[] }> };

async function forward(
  request: NextRequest,
  segments: string[] | undefined,
  method: string,
): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(PELADAS_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }
  const base = getInternalApiBaseUrl();
  const pathPart = (segments ?? []).join("/");
  const u = new URL(request.url);
  const target = `${base}/${pathPart}${u.search}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const ct = request.headers.get("content-type");
  if (ct) {
    headers["Content-Type"] = ct;
  }
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
    init.body = await request.text();
  }
  const res = await fetch(target, init);
  const body = await res.text();
  const out = new NextResponse(body, { status: res.status });
  const resCt = res.headers.get("content-type");
  if (resCt) {
    out.headers.set("content-type", resCt);
  }
  return out;
}

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(request, path, "GET");
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(request, path, "POST");
}

export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return forward(request, path, "DELETE");
}
