import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { MatchVisibility, PlayerPosition } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { loginBearer, upsertE2eUser } from "../../test/e2e-auth";

const V9_ADMIN_ID = "00000000-0000-4000-8000-0000000000a0";
const V9_ADMIN_EMAIL = "e2e-v9-venues@local.test";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

describeE2e("Venues & groups CRUD (e2e)", () => {
  let app: import("@nestjs/common").INestApplication;
  let prisma: PrismaService;
  let auth: string;

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
      id: V9_ADMIN_ID,
      email: V9_ADMIN_EMAIL,
      name: "E2E V9 Admin",
      isAdmin: true,
      positions: [PlayerPosition.ANY],
    });
    auth = await loginBearer(app.getHttpServer(), V9_ADMIN_EMAIL);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    if (!prisma) {
      return;
    }
    await prisma.match.deleteMany({
      where: { title: { startsWith: "E2E-V9" } },
    });
    await prisma.venue.deleteMany({
      where: { name: { startsWith: "E2E-V9" } },
    });
    await prisma.group.deleteMany({
      where: { name: { startsWith: "E2E-V9" } },
    });
  });

  it("POST /venues → GET :id → PATCH → GET confirma", async () => {
    const created = await request(app.getHttpServer())
      .post("/venues")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-campo", locality: "Lisboa" })
      .expect(201);

    const id = created.body.venue.id as string;

    const one = await request(app.getHttpServer())
      .get(`/venues/${id}`)
      .set("Authorization", auth)
      .expect(200);
    expect(one.body.venue.name).toBe("E2E-V9-campo");

    await request(app.getHttpServer())
      .patch(`/venues/${id}`)
      .set("Authorization", auth)
      .send({ name: "E2E-V9-campo-renomeado" })
      .expect(200);

    const after = await request(app.getHttpServer())
      .get(`/venues/${id}`)
      .set("Authorization", auth)
      .expect(200);
    expect(after.body.venue.name).toBe("E2E-V9-campo-renomeado");
  });

  it("DELETE /venues sem partidas → 200", async () => {
    const created = await request(app.getHttpServer())
      .post("/venues")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-apagar" })
      .expect(201);
    const id = created.body.venue.id as string;

    await request(app.getHttpServer())
      .delete(`/venues/${id}`)
      .set("Authorization", auth)
      .expect(200)
      .expect((res) => {
        expect(res.body.deleted).toBe(true);
      });
  });

  it("DELETE /venues com partida → 409 VenueHasMatchesError", async () => {
    const v = await request(app.getHttpServer())
      .post("/venues")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-com-match" })
      .expect(201);
    const venueId = v.body.venue.id as string;

    await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", auth)
      .send({
        title: "E2E-V9 bloqueia venue",
        dateTime: "2026-08-15T20:00:00.000Z",
        mode: "ALTERNATED",
        maxPlayers: 10,
        maxSubstitutes: 2,
        registrationOpensAt: "2026-08-01T10:00:00.000Z",
        registrationClosesAt: "2026-08-15T18:00:00.000Z",
        venueId,
        visibility: MatchVisibility.PUBLIC,
      })
      .expect(201);

    const del = await request(app.getHttpServer())
      .delete(`/venues/${venueId}`)
      .set("Authorization", auth)
      .expect(409);

    expect(del.body.error.code).toBe("VenueHasMatchesError");
  });

  it("POST /groups → GET :id → PATCH → DELETE sem matches", async () => {
    const created = await request(app.getHttpServer())
      .post("/groups")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-grupo" })
      .expect(201);
    const id = created.body.group.id as string;

    await request(app.getHttpServer())
      .get(`/groups/${id}`)
      .set("Authorization", auth)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/groups/${id}`)
      .set("Authorization", auth)
      .send({ name: "E2E-V9-grupo-x" })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/groups/${id}`)
      .set("Authorization", auth)
      .expect(200);
  });

  it("DELETE /groups com partida GROUP → 409 GroupHasMatchesError", async () => {
    const gRes = await request(app.getHttpServer())
      .post("/groups")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-grupo-com-match" })
      .expect(201);
    const groupId = gRes.body.group.id as string;

    const vRes = await request(app.getHttpServer())
      .post("/venues")
      .set("Authorization", auth)
      .send({ name: "E2E-V9-venue-grupo" })
      .expect(201);
    const venueId = vRes.body.venue.id as string;

    await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", auth)
      .send({
        title: "E2E-V9 bloqueia grupo",
        dateTime: "2026-09-15T20:00:00.000Z",
        mode: "ALTERNATED",
        maxPlayers: 8,
        maxSubstitutes: 2,
        registrationOpensAt: "2026-09-01T10:00:00.000Z",
        registrationClosesAt: "2026-09-15T18:00:00.000Z",
        venueId,
        visibility: MatchVisibility.GROUP,
        groupId,
      })
      .expect(201);

    const del = await request(app.getHttpServer())
      .delete(`/groups/${groupId}`)
      .set("Authorization", auth)
      .expect(409);

    expect(del.body.error.code).toBe("GroupHasMatchesError");
  });
});
