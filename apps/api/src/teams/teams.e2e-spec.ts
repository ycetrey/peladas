import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { MatchMode, PlayerPosition, TeamName } from "@prisma/client";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

const SEED_ORGANIZER_ID = "00000000-0000-4000-8000-000000000001";
const P2 = "00000000-0000-4000-8000-000000000002";
const P3 = "00000000-0000-4000-8000-000000000003";
const P4 = "00000000-0000-4000-8000-000000000004";
const P5 = "00000000-0000-4000-8000-000000000005";

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
      { id: SEED_ORGANIZER_ID, name: "E2E Org", pos: PlayerPosition.ANY },
      { id: P2, name: "E2E T2", pos: PlayerPosition.FORWARD },
      { id: P3, name: "E2E T3", pos: PlayerPosition.MIDFIELDER },
      { id: P4, name: "E2E T4", pos: PlayerPosition.DEFENDER },
      { id: P5, name: "E2E T5", pos: PlayerPosition.GOALKEEPER },
    ]) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          preferredPositions: [u.pos],
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
        where: { title: { startsWith: "E2E-TEAMS-" } },
      });
    }
  });

  async function createOpenMatch(mode: MatchMode, maxPlayers: number) {
    const t = Date.now();
    const res = await request(app.getHttpServer())
      .post("/matches")
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
      .send({
        title: `E2E-TEAMS-${t}-${mode}`,
        ...E2E_MATCH_SCHEDULE,
        mode,
        maxPlayers,
        maxSubstitutes: 2,
      })
      .expect(201);
    return res.body.match.id as string;
  }

  it("ALTERNATED: generates A/B from full titular list; rejects second generate", async () => {
    const matchId = await createOpenMatch(MatchMode.ALTERNATED, 4);
    const players = [P2, P3, P4, P5];
    for (const pid of players) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("X-Player-User-Id", pid)
        .send({ preferredPosition: "MIDFIELDER" })
        .expect(201);
    }

    const gen = await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
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
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe("TeamsAlreadyGeneratedError");
      });
  });

  it("rejects generate when confirmed count ≠ maxPlayers", async () => {
    const matchId = await createOpenMatch(MatchMode.ALTERNATED, 4);
    for (const pid of [P2, P3]) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("X-Player-User-Id", pid)
        .send({ preferredPosition: "FORWARD" })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
      .expect(400)
      .expect((res) => {
        expect(res.body.error.code).toBe("WrongConfirmedCountForTeamsError");
      });
  });

  it("DRAW_AT_END: produces two balanced teams", async () => {
    const matchId = await createOpenMatch(MatchMode.DRAW_AT_END, 4);
    for (const pid of [P2, P3, P4, P5]) {
      await request(app.getHttpServer())
        .post(`/matches/${matchId}/registrations`)
        .set("X-Player-User-Id", pid)
        .send({ preferredPosition: "DEFENDER" })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/teams/generate`)
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
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
