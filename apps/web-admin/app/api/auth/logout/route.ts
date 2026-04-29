import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PELADAS_ACCESS_COOKIE } from "../../../../lib/cookie-name";

export async function POST() {
  const jar = await cookies();
  jar.delete(PELADAS_ACCESS_COOKIE);
  return NextResponse.json({ ok: true });
}
