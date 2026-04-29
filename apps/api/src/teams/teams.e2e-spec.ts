import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { MatchMode, MatchVisibility, PlayerPosition, TeamName } from "@prisma/client";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { loginBearer, upsertE2eUser } from "../../test/e2e-auth";
import { createVenueForE2e } from "../../test/e2e-default-venue";

const ORG_ID = "00000000-0000-4000-8000-000000000030";
const ORG_EMAIL = "e2e-teams-org@local.test";
const P2 = "00000000-0000-4000-8000-000000000031";
const P2_EMAIL = "e2e-teams-p2@local.test";
const P3 = "00000000-0000-4000-8000-000000000032";
const P3_EMAIL = "e2e-teams-p3@local.test";
const P4 = "00000000-0000-4000-8000-000000000033";
const P4_EMAIL = "e2e-teams-p4@local.test";
const P5 = "00000000-0000-4000-8000-000000000034";
const P5_EMAIL = "e2e-teams-p5@local.test";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

/** Ver `registrations.e2e-spec.ts` — alinhado a `timestamp(3)` sem TZ no Postgres. */
const E2E_MATCH_SCHEDULE = {
  registrationOpensAt: "2019-01-01T12:00:00.000Z",
  registrationClosesAt: "2038-12-31T12:00:00.000Z",
  dateTime: "2039-06-15T20:00:00.000Z",
} as const;

describeE2e("Teams generate (e2e)", () => {
  let app: import("@nestjs/common").INestApplication;
  let prisma: PrismaService;
  let orgAuth: string;
  let p2Auth: string;
  let p3Auth: string;
  let p4Auth: string;
  let p5Auth: string;
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
    for (const u of [
      { id: P2, email: P2_EMAIL, name: "E2E T2", pos: PlayerPosition.FORWARD },
      { id: P3, email: P3_EMAIL, name: "E2E T3", pos: PlayerPosition.MIDFIELDER },
      { id: P4, email: P4_EMAIL, name: "E2E T4", pos: PlayerPosition.DEFENDER },
      { id: P5, email: P5_EMAIL, name: "E2E T5", pos: PlayerPosition.GOALKEEPER },
    ]) {
      await upsertE2eUser(prisma, {
        id: u.id,
        email: u.email,
        name: u.name,
        isAdmin: false,
        positions: [u.pos],
      });
    }
    venueId = await createVenueForE2e(prisma, ORG_ID);

    const srv = app.getHttpServer();
    orgAuth = await loginBearer(srv, ORG_EMAIL);
    p2Auth = await loginBearer(srv, P2_EMAIL);
    p3Auth = await loginBearer(srv, P3_EMAIL);
    p4Auth = await loginBearer(srv, P4_EMAIL);
    p5Auth = await loginBearer(srv, P5_EMAIL);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.match.deleteMany({
        where: { title: { startsWith: "E2E-TEAMS-" } },
      });
    }
  });

  async function createOpenMatch(mode: MatchMode, maxPlayers: number) {
    const t = Date.now();
    const res = await request(app.getHttpServer())
      .post("/matches")
      .set("Authorization", orgAuth)
      .send({
        title: `E2E-TEAMS-${t}-${mode}`,
        ...E2E_MATCH_SCHEDULE,
        mode,
        maxPlayers,
        maxSubstitutes: 2,
        venueId,
        visibility: MatchVisibility.PUBLIC,
      })
      .expect(201);
    return res.body.match.id as string;
  }

  it("ALTERNATED: generates A/B from full titular list; rejects second generate", async () => {
    const matchId = await createOpenMatch(MatchMode.ALTERNATED, 4);
    const auths = [p2Auth, p3Auth, p4Auth, p5Auth];
    for (let i = 0; i < auths.length; i++) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("Authorization", auths[i]!)
        .send({ preferredPosition: "MIDFIELDER" })
        .expect(201);
    }

    const gen = await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("Authorization", orgAuth)
      .expect(201);

    expect(gen.body.teams).toHaveLength(2);
    const names = gen.body.teams.map((x: { name: string }) => x.name).sort();
    expect(names).toEqual(["A", "B"]);

    const dbTeams = await prisma.team.findMany({
      where: { matchId },
      include: { players: { orderBy: { order: "asc" } } },
      orderBy: { name: "asc" },
    });
    expect(dbTeams).toHaveLength(2);
    const teamA = dbTeams.find((x) => x.name === TeamName.A);
    const teamB = dbTeams.find((x) => x.name === TeamName.B);
    expect(teamA?.players.map((p) => p.userId).sort()).toEqual([P2, P4].sort());
    expect(teamB?.players.map((p) => p.userId).sort()).toEqual([P3, P5].sort());

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("Authorization", orgAuth)
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe("TeamsAlreadyGeneratedError");
      });
  });

  it("rejects generate when confirmed count ≠ maxPlayers", async () => {
    const matchId = await createOpenMatch(MatchMode.ALTERNATED, 4);
    for (const a of [p2Auth, p3Auth]) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("Authorization", a)
        .send({ preferredPosition: "FORWARD" })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("Authorization", orgAuth)
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe("WrongConfirmedCountForTeamsError");
      });
  });

  it("DRAW_AT_END: produces two balanced teams", async () => {
    const matchId = await createOpenMatch(MatchMode.DRAW_AT_END, 4);
    for (const a of [p2Auth, p3Auth, p4Auth, p5Auth]) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("Authorization", a)
        .send({ preferredPosition: "DEFENDER" })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("Authorization", orgAuth)
      .expect(201);

    const dbTeams = await prisma.team.findMany({
      where: { matchId },
      include: { players: true },
    });
    expect(dbTeams).toHaveLength(2);
    const sizes = dbTeams.map((t) => t.players.length).sort();
    expect(sizes).toEqual([2, 2]);
    const allUserIds = dbTeams.flatMap((t) => t.players.map((p) => p.userId));
    expect(new Set(allUserIds).size).toBe(4);
  });
});
