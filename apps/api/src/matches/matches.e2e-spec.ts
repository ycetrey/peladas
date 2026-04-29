import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { MatchVisibility, PlayerPosition } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { loginBearer, upsertE2eUser } from "../../test/e2e-auth";
import { createVenueForE2e } from "../../test/e2e-default-venue";

const ORG_ID = "00000000-0000-4000-8000-000000000020";
const ORG_EMAIL = "e2e-matches-org@local.test";
const P2_ID = "00000000-0000-4000-8000-000000000025";
const P2_EMAIL = "e2e-matches-p2@local.test";
const P3_ID = "00000000-0000-4000-8000-000000000026";
const P3_EMAIL = "e2e-matches-p3@local.test";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

describeE2e("Matches (e2e)", () => {
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
      name: "E2E Matches Org",
      isAdmin: true,
      positions: [PlayerPosition.ANY],
    });
    await upsertE2eUser(prisma, {
      id: P2_ID,
      email: P2_EMAIL,
      name: "E2E Matches P2",
      isAdmin: false,
      positions: [PlayerPosition.FORWARD],
    });
    await upsertE2eUser(prisma, {
      id: P3_ID,
      email: P3_EMAIL,
      name: "E2E Matches P3",
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
        where: { title: { startsWith: "E2E " } },
      });
      await prisma.group.deleteMany({
        where: { name: { startsWith: "E2E-VIS-" } },
      });
    }
  });

  it("POST /matches then GET list and GET by id", async () => {
    const createBody = {
      title: "E2E Pelada",
      dateTime: "2026-06-15T20:00:00.000Z",
      mode: "ALTERNATED",
      maxPlayers: 10,
      maxSubstitutes: 2,
      registrationOpensAt: "2026-06-01T10:00:00.000Z",
      registrationClosesAt: "2026-06-15T18:00:00.000Z",
      venueId,
      visibility: MatchVisibility.PUBLIC,
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send(createBody)
      .expect(201);

    expect(created.body.match).toBeDefined();
    expect(created.body.match.id).toBeDefined();
    expect(created.body.match.status).toBe("OPEN");

    const id = created.body.match.id as string;

    const list = await request(app.getHttpServer())
      .get("/matches")
      .set("Authorization", orgAuth)
      .expect(200);

    expect(Array.isArray(list.body.matches)).toBe(true);
    expect(list.body.matches.some((m: { id: string }) => m.id === id)).toBe(
      true,
    );

    const one = await request(app.getHttpServer())
      .get(`/matches/${id}`)
      .set("Authorization", orgAuth)
      .expect(200);

    expect(one.body.match.id).toBe(id);
  });

  it("GROUP match: member sees list and detail; non-member gets 404 on detail and omits from list", async () => {
    const g = await prisma.group.create({
      data: { name: `E2E-VIS-${Date.now()}`, createdByUserId: ORG_ID },
    });
    await prisma.groupMember.create({
      data: { groupId: g.id, userId: P3_ID },
    });

    const createBody = {
      title: "E2E VIS private",
      dateTime: "2026-07-01T20:00:00.000Z",
      mode: "ALTERNATED",
      maxPlayers: 4,
      maxSubstitutes: 2,
      registrationOpensAt: "2026-06-01T10:00:00.000Z",
      registrationClosesAt: "2026-06-30T18:00:00.000Z",
      venueId,
      visibility: MatchVisibility.GROUP,
      groupId: g.id,
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send(createBody)
      .expect(201);

    const matchId = created.body.match.id as string;

    const listP3 = await request(app.getHttpServer())
      .get("/matches")
      .set("Authorization", p3Auth)
      .expect(200);
    expect(listP3.body.matches.some((m: { id: string }) => m.id === matchId)).toBe(
      true,
    );

    const listP2 = await request(app.getHttpServer())
      .get("/matches")
      .set("Authorization", p2Auth)
      .expect(200);
    expect(listP2.body.matches.some((m: { id: string }) => m.id === matchId)).toBe(
      false,
    );

    await request(app.getHttpServer())
      .get(`/matches/${matchId}`)
      .set("Authorization", p2Auth)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/matches/${matchId}`)
      .set("Authorization", p3Auth)
      .expect(200);
  });
});
