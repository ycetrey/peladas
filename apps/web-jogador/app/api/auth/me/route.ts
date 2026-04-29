import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PELADAS_ACCESS_COOKIE } from "../../../../lib/cookie-name";
import { getInternalApiBaseUrl } from "../../../../lib/internal-api-base";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(PELADAS_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }
  const res = await fetch(`${getInternalApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
