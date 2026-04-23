import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { PlayerPosition, RegistrationStatus } from "@prisma/client";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

const SEED_ORGANIZER_ID = "00000000-0000-4000-8000-000000000001";
const SEED_PLAYER_2_ID = "00000000-0000-4000-8000-000000000002";
const SEED_PLAYER_3_ID = "00000000-0000-4000-8000-000000000003";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

describeE2e("Registrations (e2e)", () => {
  let app: import("@nestjs/common").INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    for (const u of [
      {
        id: SEED_ORGANIZER_ID,
        name: "E2E Org",
        positions: [PlayerPosition.ANY],
      },
      {
        id: SEED_PLAYER_2_ID,
        name: "E2E P2",
        positions: [PlayerPosition.FORWARD],
      },
      {
        id: SEED_PLAYER_3_ID,
        name: "E2E P3",
        positions: [PlayerPosition.MIDFIELDER],
      },
    ]) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          preferredPositions: u.positions,
          isAdmin: false,
        },
      });
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.match.deleteMany({
        where: { title: { startsWith: "E2E-REG-" } },
      });
    }
  });

  it("registers titulars + substitute, rejects duplicate, promotes on titular cancel", async () => {
    const t = Date.now();
    const iso = (ms: number) => new Date(ms).toISOString();
    const createBody = {
      title: "E2E-REG-promotion",
      dateTime: iso(t + 14 * 86400000),
      mode: "ALTERNATED",
      maxPlayers: 2,
      maxSubstitutes: 2,
      registrationOpensAt: iso(t - 86400000),
      registrationClosesAt: iso(t + 7 * 86400000),
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
      .send(createBody)
      .expect(201);

    const matchId = created.body.match.id as string;

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("X-Player-User-Id", SEED_ORGANIZER_ID)
      .send({ preferredPosition: "MIDFIELDER" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("X-Player-User-Id", SEED_PLAYER_2_ID)
      .send({ preferredPosition: "FORWARD" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("X-Player-User-Id", SEED_PLAYER_3_ID)
      .send({ preferredPosition: "DEFENDER" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("X-Player-User-Id", SEED_PLAYER_3_ID)
      .send({ preferredPosition: "GOALKEEPER" })
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/matches/${matchId}/registrations/me`)
      .set("X-Player-User-Id", SEED_ORGANIZER_ID)
      .expect(200);

    const p3 = await prisma.registration.findFirst({
      where: { matchId, userId: SEED_PLAYER_3_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(p3?.status).toBe(RegistrationStatus.CONFIRMED);

    const p1 = await prisma.registration.findFirst({
      where: { matchId, userId: SEED_ORGANIZER_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(p1?.status).toBe(RegistrationStatus.CANCELED);
  });
});
