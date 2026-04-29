import type { PlayerPosition } from "@prisma/client";
import * as bcrypt from "bcrypt";
import type { PrismaService } from "../src/prisma/prisma.service";
import request from "supertest";

/** Same plain password for all e2e users (hash stored per-user). */
export const E2E_PLAIN_PASSWORD = "password";

export async function upsertE2eUser(
  prisma: PrismaService,
  input: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    positions: PlayerPosition[];
  },
): Promise<void> {
  const passwordHash = await bcrypt.hash(E2E_PLAIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { id: input.id },
    update: {
      email: input.email,
      passwordHash,
      name: input.name,
      isAdmin: input.isAdmin,
      preferredPositions: input.positions,
    },
    create: {
      id: input.id,
      email: input.email,
      passwordHash,
      name: input.name,
      isAdmin: input.isAdmin,
      preferredPositions: input.positions,
    },
  });
}

export async function loginBearer(
  httpServer: Parameters<typeof request>[0],
  email: string,
): Promise<string> {
  const res = await request(httpServer)
    .post("/auth/login")
    .send({ email, password: E2E_PLAIN_PASSWORD });
  if (res.status !== 200) {
    throw new Error(`login failed ${res.status}: ${res.text}`);
  }
  const token = res.body.access_token as string | undefined;
  if (!token) {
    throw new Error("login response missing access_token");
  }
  return `Bearer ${token}`;
}
