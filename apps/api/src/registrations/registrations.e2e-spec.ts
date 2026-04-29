import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import {
  MatchVisibility,
  PlayerPosition,
  RegistrationStatus,
} from "@prisma/client";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { loginBearer, upsertE2eUser } from "../../test/e2e-auth";
import { createVenueForE2e } from "../../test/e2e-default-venue";

const ORG_ID = "00000000-0000-4000-8000-000000000021";
const ORG_EMAIL = "e2e-reg-org@local.test";
const SEED_PLAYER_2_ID = "00000000-0000-4000-8000-000000000022";
const P2_EMAIL = "e2e-reg-p2@local.test";
const SEED_PLAYER_3_ID = "00000000-0000-4000-8000-000000000023";
const P3_EMAIL = "e2e-reg-p3@local.test";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

/** UTC fixo: Postgres usa `timestamp(3)` sem TZ; janelas relativas a `Date.now()` podem fechar ao reler o `Match`. */
const E2E_MATCH_SCHEDULE = {
  registrationOpensAt: "2019-01-01T12:00:00.000Z",
  registrationClosesAt: "2038-12-31T12:00:00.000Z",
  dateTime: "2039-06-15T20:00:00.000Z",
} as const;

describeE2e("Registrations (e2e)", () => {
  let app: import("@nestjs/common").INestApplication;
  let prisma: PrismaService;
  let orgAuth: string;
  let p2Auth: string;
  let p3Auth: string;
  let venueId: string;

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

    await upsertE2eUser(prisma, {
      id: ORG_ID,
      email: ORG_EMAIL,
      name: "E2E Org",
      isAdmin: true,
      positions: [PlayerPosition.ANY],
    });
    await upsertE2eUser(prisma, {
      id: SEED_PLAYER_2_ID,
      email: P2_EMAIL,
      name: "E2E P2",
      isAdmin: false,
      positions: [PlayerPosition.FORWARD],
    });
    await upsertE2eUser(prisma, {
      id: SEED_PLAYER_3_ID,
      email: P3_EMAIL,
      name: "E2E P3",
      isAdmin: false,
      positions: [PlayerPosition.MIDFIELDER],
    });
    venueId = await createVenueForE2e(prisma, ORG_ID);

    const srv = app.getHttpServer();
    orgAuth = await loginBearer(srv, ORG_EMAIL);
    p2Auth = await loginBearer(srv, P2_EMAIL);
    p3Auth = await loginBearer(srv, P3_EMAIL);
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
    const createBody = {
      title: "E2E-REG-promotion",
      ...E2E_MATCH_SCHEDULE,
      mode: "ALTERNATED",
      maxPlayers: 2,
      maxSubstitutes: 2,
      venueId,
      visibility: MatchVisibility.PUBLIC,
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send(createBody)
      .expect(201);

    const matchId = created.body.match.id as string;

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", orgAuth)
      .send({ preferredPosition: "MIDFIELDER" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p2Auth)
      .send({ preferredPosition: "FORWARD" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p3Auth)
      .send({ preferredPosition: "DEFENDER" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p3Auth)
      .send({ preferredPosition: "GOALKEEPER" })
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/matches/${matchId}/registrations/me`)
      .set("Authorization", orgAuth)
      .expect(200);

    const p3 = await prisma.registration.findFirst({
      where: { matchId, userId: SEED_PLAYER_3_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(p3?.status).toBe(RegistrationStatus.CONFIRMED);

    const confirmedOrdered = await prisma.registration.findMany({
      where: { matchId, status: RegistrationStatus.CONFIRMED },
      orderBy: [{ queueOrder: "asc" }, { createdAt: "asc" }],
    });
    expect(confirmedOrdered.length).toBe(2);
    expect(confirmedOrdered[confirmedOrdered.length - 1].userId).toBe(
      SEED_PLAYER_3_ID,
    );

    const p1 = await prisma.registration.findFirst({
      where: { matchId, userId: ORG_ID },
      orderBy: { createdAt: "desc" },
    });
    expect(p1?.status).toBe(RegistrationStatus.CANCELED);
  });

  it("GET registrations/me returns null then active registration", async () => {
    const createBody = {
      title: "E2E-REG-get-me",
      ...E2E_MATCH_SCHEDULE,
      mode: "ALTERNATED",
      maxPlayers: 4,
      maxSubstitutes: 2,
      venueId,
      visibility: MatchVisibility.PUBLIC,
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send(createBody)
      .expect(201);

    const matchId = created.body.match.id as string;

    const empty = await request(app.getHttpServer())
      .get(`/matches/${matchId}/registrations/me`)
      .set("Authorization", p2Auth)
      .expect(200);

    expect(empty.body.registration).toBeNull();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p2Auth)
      .send({ preferredPosition: "GOALKEEPER" })
      .expect(201);

    const withReg = await request(app.getHttpServer())
      .get(`/matches/${matchId}/registrations/me`)
      .set("Authorization", p2Auth)
      .expect(200);

    expect(withReg.body.registration).toBeDefined();
    expect(withReg.body.registration.status).toBe(RegistrationStatus.CONFIRMED);
  });

  it("handles absence vote lifecycle and registration conflicts", async () => {
    const createBody = {
      title: "E2E-REG-absence",
      ...E2E_MATCH_SCHEDULE,
      mode: "ALTERNATED",
      maxPlayers: 4,
      maxSubstitutes: 2,
      venueId,
      visibility: MatchVisibility.PUBLIC,
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send(createBody)
      .expect(201);

    const matchId = created.body.match.id as string;

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations/me/absence`)
      .set("Authorization", p2Auth)
      .expect(200);

    const absent = await request(app.getHttpServer())
      .get(`/matches/${matchId}/registrations/me`)
      .set("Authorization", p2Auth)
      .expect(200);
    expect(absent.body.registration?.status).toBe(RegistrationStatus.ABSENT);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p2Auth)
      .send({ preferredPosition: "FORWARD" })
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/matches/${matchId}/registrations/me/absence`)
      .set("Authorization", p2Auth)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations`)
      .set("Authorization", p2Auth)
      .send({ preferredPosition: "FORWARD" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/registrations/me/absence`)
      .set("Authorization", p2Auth)
      .expect(400);
  });
});
