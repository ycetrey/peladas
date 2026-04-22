import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../app.module";
import { DomainExceptionFilter } from "../common/filters/domain-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

/** Seed jogador — ver `apps/api/prisma/seed.ts` */
const SEED_ORGANIZER_ID = "00000000-0000-4000-8000-000000000001";

const describeE2e =
  process.env.DATABASE_URL && process.env.SKIP_E2E !== "1"
    ? describe
    : describe.skip;

describeE2e("Matches (e2e)", () => {
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
    await prisma.user.upsert({
      where: { id: SEED_ORGANIZER_ID },
      update: {},
      create: {
        id: SEED_ORGANIZER_ID,
        name: "E2E Organizer",
        preferredPositions: ["ANY"],
        isAdmin: false,
      },
    });
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
    };

    const created = await request(app.getHttpServer())
      .post("/matches")
      .set("X-Organizer-User-Id", SEED_ORGANIZER_ID)
      .send(createBody)
      .expect(201);

    expect(created.body.match).toBeDefined();
    expect(created.body.match.id).toBeDefined();
    expect(created.body.match.status).toBe("OPEN");

    const id = created.body.match.id as string;

    const list = await request(app.getHttpServer())
      .get("/matches")
      .expect(200);

    expect(Array.isArray(list.body.matches)).toBe(true);
    expect(list.body.matches.some((m: { id: string }) => m.id === id)).toBe(
      true,
    );

    const one = await request(app.getHttpServer())
      .get(`/matches/${id}`)
      .expect(200);

    expect(one.body.match.id).toBe(id);
  });
});
