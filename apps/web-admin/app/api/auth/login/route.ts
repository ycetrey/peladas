import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PELADAS_ACCESS_COOKIE } from "../../../../lib/cookie-name";
import { getInternalApiBaseUrl } from "../../../../lib/internal-api-base";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const res = await fetch(`${getInternalApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  const user = data.user as { isAdmin?: boolean } | undefined;
  if (!user?.isAdmin) {
    return NextResponse.json(
      { message: "Esta conta não é administrador." },
      { status: 403 },
    );
  }
  const token = data.access_token as string | undefined;
  if (!token) {
    return NextResponse.json({ message: "Resposta de login inválida." }, { status: 502 });
  }
  const jar = await cookies();
  jar.set(PELADAS_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ user: data.user });
}
