import {
  MatchMode,
  MatchStatus,
  MatchVisibility,
  PlayerPosition,
  PrismaClient,
  RegistrationStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Utilizadores base (mantêm IDs estáveis para e2e / docs). */
const SEED_USER_ID = "00000000-0000-4000-8000-000000000001";
const SEED_ADMIN_ID = "00000000-0000-4000-8000-000000000002";

const DEFAULT_VENUE_ID = "00000000-0000-4000-8000-0000000000a0";

/** Jogadores extra — todos com palavra-passe `password`. */
const EXTRA_PLAYERS: {
  id: string;
  email: string;
  name: string;
  preferredPositions: PlayerPosition[];
}[] = [
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "joao.silva@peladas.local",
    name: "João Silva",
    preferredPositions: [PlayerPosition.DEFENDER, PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    email: "maria.santos@peladas.local",
    name: "Maria Santos",
    preferredPositions: [PlayerPosition.MIDFIELDER, PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    email: "pedro.oliveira@peladas.local",
    name: "Pedro Oliveira",
    preferredPositions: [PlayerPosition.FORWARD, PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    email: "ana.costa@peladas.local",
    name: "Ana Costa",
    preferredPositions: [PlayerPosition.GOALKEEPER, PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    email: "rui.ferreira@peladas.local",
    name: "Rui Ferreira",
    preferredPositions: [PlayerPosition.MIDFIELDER],
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    email: "sofia.martins@peladas.local",
    name: "Sofia Martins",
    preferredPositions: [PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER],
  },
  {
    id: "00000000-0000-4000-8000-000000000009",
    email: "miguel.ribeiro@peladas.local",
    name: "Miguel Ribeiro",
    preferredPositions: [PlayerPosition.FORWARD, PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-00000000000a",
    email: "ines.carvalho@peladas.local",
    name: "Inês Carvalho",
    preferredPositions: [PlayerPosition.ANY],
  },
  {
    id: "00000000-0000-4000-8000-00000000000b",
    email: "tiago.almeida@peladas.local",
    name: "Tiago Almeida",
    preferredPositions: [PlayerPosition.DEFENDER],
  },
  {
    id: "00000000-0000-4000-8000-00000000000c",
    email: "laura.pinto@peladas.local",
    name: "Laura Pinto",
    preferredPositions: [PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD],
  },
];

const VENUE_CENTRAL_ID = "00000000-0000-4000-8000-0000000000b1";
const VENUE_ATLANTICO_ID = "00000000-0000-4000-8000-0000000000b2";

const GROUP_AMIGOS_ID = "00000000-0000-4000-8000-0000000000c1";
const GROUP_ACME_ID = "00000000-0000-4000-8000-0000000000c2";

const MATCH_PUBLIC_ALT_ID = "00000000-0000-4000-8000-0000000000d1";
const MATCH_PUBLIC_DRAW_ID = "00000000-0000-4000-8000-0000000000d2";
const MATCH_GROUP_AMIGOS_ID = "00000000-0000-4000-8000-0000000000d3";
const MATCH_GROUP_ACME_ID = "00000000-0000-4000-8000-0000000000d4";
const MATCH_URGENT_CLOSE_ID = "00000000-0000-4000-8000-0000000000d5";
const MATCH_SUBSTITUTES_ID = "00000000-0000-4000-8000-0000000000d6";
const MATCH_CLOSED_REG_ID = "00000000-0000-4000-8000-0000000000d7";

const SEED_MATCH_IDS = [
  MATCH_PUBLIC_ALT_ID,
  MATCH_PUBLIC_DRAW_ID,
  MATCH_GROUP_AMIGOS_ID,
  MATCH_GROUP_ACME_ID,
  MATCH_URGENT_CLOSE_ID,
  MATCH_SUBSTITUTES_ID,
  MATCH_CLOSED_REG_ID,
];

async function main() {
  const passwordHash = await bcrypt.hash("password", 10);

  await prisma.user.upsert({
    where: { id: SEED_USER_ID },
    update: {
      name: "Seed Jogador",
      email: "player@peladas.local",
      passwordHash,
      preferredPositions: [PlayerPosition.MIDFIELDER, PlayerPosition.ANY],
      isAdmin: false,
    },
    create: {
      id: SEED_USER_ID,
      email: "player@peladas.local",
      passwordHash,
      name: "Seed Jogador",
      preferredPositions: [PlayerPosition.MIDFIELDER, PlayerPosition.ANY],
      isAdmin: false,
    },
  });

  await prisma.user.upsert({
    where: { id: SEED_ADMIN_ID },
    update: {
      name: "Seed Admin",
      email: "admin@peladas.local",
      passwordHash,
      preferredPositions: [PlayerPosition.GOALKEEPER],
      isAdmin: true,
    },
    create: {
      id: SEED_ADMIN_ID,
      email: "admin@peladas.local",
      passwordHash,
      name: "Seed Admin",
      preferredPositions: [PlayerPosition.GOALKEEPER],
      isAdmin: true,
    },
  });

  for (const p of EXTRA_PLAYERS) {
    await prisma.user.upsert({
      where: { id: p.id },
      update: {
        email: p.email,
        name: p.name,
        passwordHash,
        preferredPositions: p.preferredPositions,
        isAdmin: false,
      },
      create: {
        id: p.id,
        email: p.email,
        name: p.name,
        passwordHash,
        preferredPositions: p.preferredPositions,
        isAdmin: false,
      },
    });
  }

  await prisma.venue.upsert({
    where: { id: DEFAULT_VENUE_ID },
    create: {
      id: DEFAULT_VENUE_ID,
      name: "Sem local",
      locality: null,
      createdByUserId: SEED_ADMIN_ID,
    },
    update: {
      createdByUserId: SEED_ADMIN_ID,
    },
  });

  await prisma.venue.upsert({
    where: { id: VENUE_CENTRAL_ID },
    create: {
      id: VENUE_CENTRAL_ID,
      name: "Parque Desportivo Central",
      locality: "Lisboa",
      createdByUserId: SEED_ADMIN_ID,
    },
    update: {
      name: "Parque Desportivo Central",
      locality: "Lisboa",
      createdByUserId: SEED_ADMIN_ID,
    },
  });

  await prisma.venue.upsert({
    where: { id: VENUE_ATLANTICO_ID },
    create: {
      id: VENUE_ATLANTICO_ID,
      name: "Complexo Atlântico",
      locality: "Porto",
      createdByUserId: SEED_ADMIN_ID,
    },
    update: {
      name: "Complexo Atlântico",
      locality: "Porto",
      createdByUserId: SEED_ADMIN_ID,
    },
  });

  await prisma.group.upsert({
    where: { id: GROUP_AMIGOS_ID },
    create: {
      id: GROUP_AMIGOS_ID,
      name: "Amigos da Quarta",
      createdByUserId: SEED_ADMIN_ID,
    },
    update: {
      name: "Amigos da Quarta",
      createdByUserId: SEED_ADMIN_ID,
    },
  });

  await prisma.group.upsert({
    where: { id: GROUP_ACME_ID },
    create: {
      id: GROUP_ACME_ID,
      name: "Departamento Futebol ACME",
      createdByUserId: SEED_ADMIN_ID,
    },
    update: {
      name: "Departamento Futebol ACME",
      createdByUserId: SEED_ADMIN_ID,
    },
  });

  const memberPairs: { groupId: string; userId: string }[] = [
    { groupId: GROUP_AMIGOS_ID, userId: SEED_USER_ID },
    { groupId: GROUP_AMIGOS_ID, userId: "00000000-0000-4000-8000-000000000003" },
    { groupId: GROUP_AMIGOS_ID, userId: "00000000-0000-4000-8000-000000000004" },
    { groupId: GROUP_AMIGOS_ID, userId: "00000000-0000-4000-8000-000000000005" },
    { groupId: GROUP_AMIGOS_ID, userId: SEED_ADMIN_ID },
    { groupId: GROUP_ACME_ID, userId: SEED_ADMIN_ID },
    { groupId: GROUP_ACME_ID, userId: "00000000-0000-4000-8000-000000000006" },
    { groupId: GROUP_ACME_ID, userId: "00000000-0000-4000-8000-000000000007" },
    { groupId: GROUP_ACME_ID, userId: "00000000-0000-4000-8000-000000000008" },
    { groupId: GROUP_ACME_ID, userId: "00000000-0000-4000-8000-000000000009" },
  ];

  for (const { groupId, userId } of memberPairs) {
    await prisma.groupMember.upsert({
      where: {
        groupId_userId: { groupId, userId },
      },
      create: { groupId, userId },
      update: {},
    });
  }

  const now = new Date();
  const addMin = (m: number) => new Date(now.getTime() + m * 60_000);
  const addHours = (h: number) => new Date(now.getTime() + h * 3_600_000);
  const addDays = (d: number) => new Date(now.getTime() + d * 86_400_000);

  await prisma.$transaction(async (tx) => {
    await tx.teamPlayer.deleteMany({
      where: { team: { matchId: { in: SEED_MATCH_IDS } } },
    });
    await tx.team.deleteMany({ where: { matchId: { in: SEED_MATCH_IDS } } });
    await tx.registration.deleteMany({ where: { matchId: { in: SEED_MATCH_IDS } } });
    await tx.match.deleteMany({ where: { id: { in: SEED_MATCH_IDS } } });
  });

  await prisma.match.createMany({
    data: [
      {
        id: MATCH_PUBLIC_ALT_ID,
        title: "Pelada terça — modo alternado",
        dateTime: addDays(5),
        mode: MatchMode.ALTERNATED,
        status: MatchStatus.OPEN,
        maxPlayers: 10,
        maxSubstitutes: 3,
        registrationOpensAt: addDays(-2),
        registrationClosesAt: addDays(4),
        venueId: VENUE_CENTRAL_ID,
        visibility: MatchVisibility.PUBLIC,
        groupId: null,
      },
      {
        id: MATCH_PUBLIC_DRAW_ID,
        title: "Pelada quinta — sorteio no final",
        dateTime: addDays(7),
        mode: MatchMode.DRAW_AT_END,
        status: MatchStatus.OPEN,
        maxPlayers: 8,
        maxSubstitutes: 2,
        registrationOpensAt: addDays(-1),
        registrationClosesAt: addDays(6),
        venueId: VENUE_ATLANTICO_ID,
        visibility: MatchVisibility.PUBLIC,
        groupId: null,
      },
      {
        id: MATCH_GROUP_AMIGOS_ID,
        title: "Quarta à noite (só grupo Amigos)",
        dateTime: addDays(3),
        mode: MatchMode.ALTERNATED,
        status: MatchStatus.OPEN,
        maxPlayers: 6,
        maxSubstitutes: 2,
        registrationOpensAt: addDays(-1),
        registrationClosesAt: addDays(2),
        venueId: VENUE_CENTRAL_ID,
        visibility: MatchVisibility.GROUP,
        groupId: GROUP_AMIGOS_ID,
      },
      {
        id: MATCH_GROUP_ACME_ID,
        title: "ACME — pelada interna",
        dateTime: addDays(10),
        mode: MatchMode.DRAW_AT_END,
        status: MatchStatus.OPEN,
        maxPlayers: 8,
        maxSubstitutes: 4,
        registrationOpensAt: addHours(-12),
        registrationClosesAt: addDays(9),
        venueId: VENUE_ATLANTICO_ID,
        visibility: MatchVisibility.GROUP,
        groupId: GROUP_ACME_ID,
      },
      {
        id: MATCH_URGENT_CLOSE_ID,
        title: "⚠ Inscrições fecham em menos de 1h (teste)",
        dateTime: addDays(2),
        mode: MatchMode.ALTERNATED,
        status: MatchStatus.OPEN,
        maxPlayers: 10,
        maxSubstitutes: 2,
        registrationOpensAt: addHours(-48),
        registrationClosesAt: addMin(50),
        venueId: VENUE_CENTRAL_ID,
        visibility: MatchVisibility.PUBLIC,
        groupId: null,
      },
      {
        id: MATCH_SUBSTITUTES_ID,
        title: "Titulares lotados — testar fila de reserva",
        dateTime: addDays(4),
        mode: MatchMode.ALTERNATED,
        status: MatchStatus.OPEN,
        maxPlayers: 6,
        maxSubstitutes: 3,
        registrationOpensAt: addDays(-1),
        registrationClosesAt: addDays(3),
        venueId: VENUE_ATLANTICO_ID,
        visibility: MatchVisibility.PUBLIC,
        groupId: null,
      },
      {
        id: MATCH_CLOSED_REG_ID,
        title: "Inscrições já fechadas (histórico)",
        dateTime: addDays(14),
        mode: MatchMode.ALTERNATED,
        status: MatchStatus.OPEN,
        maxPlayers: 10,
        maxSubstitutes: 2,
        registrationOpensAt: addDays(-20),
        registrationClosesAt: addDays(-2),
        venueId: VENUE_CENTRAL_ID,
        visibility: MatchVisibility.PUBLIC,
        groupId: null,
      },
    ],
  });

  type RegRow = {
    matchId: string;
    userId: string;
    preferredPosition: PlayerPosition;
    status: RegistrationStatus;
    queueOrder: number;
  };

  const registrations: RegRow[] = [
    // Pelada terça — 5 titulares
    {
      matchId: MATCH_PUBLIC_ALT_ID,
      userId: SEED_USER_ID,
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_PUBLIC_ALT_ID,
      userId: "00000000-0000-4000-8000-000000000003",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_PUBLIC_ALT_ID,
      userId: "00000000-0000-4000-8000-000000000004",
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 3,
    },
    {
      matchId: MATCH_PUBLIC_ALT_ID,
      userId: "00000000-0000-4000-8000-000000000005",
      preferredPosition: PlayerPosition.FORWARD,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 4,
    },
    {
      matchId: MATCH_PUBLIC_ALT_ID,
      userId: "00000000-0000-4000-8000-000000000006",
      preferredPosition: PlayerPosition.GOALKEEPER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 5,
    },
    // Sorteio quinta — 3 titulares
    {
      matchId: MATCH_PUBLIC_DRAW_ID,
      userId: "00000000-0000-4000-8000-000000000007",
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_PUBLIC_DRAW_ID,
      userId: "00000000-0000-4000-8000-000000000008",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_PUBLIC_DRAW_ID,
      userId: "00000000-0000-4000-8000-000000000009",
      preferredPosition: PlayerPosition.FORWARD,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 3,
    },
    // Grupo Amigos — 4 titulares
    {
      matchId: MATCH_GROUP_AMIGOS_ID,
      userId: SEED_USER_ID,
      preferredPosition: PlayerPosition.ANY,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_GROUP_AMIGOS_ID,
      userId: "00000000-0000-4000-8000-000000000003",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_GROUP_AMIGOS_ID,
      userId: "00000000-0000-4000-8000-000000000004",
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 3,
    },
    {
      matchId: MATCH_GROUP_AMIGOS_ID,
      userId: "00000000-0000-4000-8000-000000000005",
      preferredPosition: PlayerPosition.FORWARD,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 4,
    },
    // ACME — 2 titulares + 1 reserva
    {
      matchId: MATCH_GROUP_ACME_ID,
      userId: "00000000-0000-4000-8000-000000000006",
      preferredPosition: PlayerPosition.GOALKEEPER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_GROUP_ACME_ID,
      userId: "00000000-0000-4000-8000-000000000007",
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_GROUP_ACME_ID,
      userId: "00000000-0000-4000-8000-000000000008",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.SUBSTITUTE,
      queueOrder: 3,
    },
    // Urgente — 2 titulares (muitas vagas para testar inscrição)
    {
      matchId: MATCH_URGENT_CLOSE_ID,
      userId: "00000000-0000-4000-8000-00000000000a",
      preferredPosition: PlayerPosition.ANY,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_URGENT_CLOSE_ID,
      userId: "00000000-0000-4000-8000-00000000000b",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_URGENT_CLOSE_ID,
      userId: "00000000-0000-4000-8000-00000000000c",
      preferredPosition: PlayerPosition.ANY,
      status: RegistrationStatus.ABSENT,
      queueOrder: 3,
    },
    // 6 titulares lotados + 2 reservas
    ...(
      [
        "00000000-0000-4000-8000-000000000003",
        "00000000-0000-4000-8000-000000000004",
        "00000000-0000-4000-8000-000000000005",
        "00000000-0000-4000-8000-000000000006",
        "00000000-0000-4000-8000-000000000007",
        "00000000-0000-4000-8000-000000000008",
      ] as const
    ).map((userId, i) => ({
      matchId: MATCH_SUBSTITUTES_ID,
      userId,
      preferredPosition: PlayerPosition.ANY,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: i + 1,
    })),
    {
      matchId: MATCH_SUBSTITUTES_ID,
      userId: "00000000-0000-4000-8000-000000000009",
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.SUBSTITUTE,
      queueOrder: 7,
    },
    {
      matchId: MATCH_SUBSTITUTES_ID,
      userId: "00000000-0000-4000-8000-00000000000a",
      preferredPosition: PlayerPosition.FORWARD,
      status: RegistrationStatus.SUBSTITUTE,
      queueOrder: 8,
    },
    // Partida com inscrições fechadas — 3 titulares (só para histórico na lista)
    {
      matchId: MATCH_CLOSED_REG_ID,
      userId: SEED_USER_ID,
      preferredPosition: PlayerPosition.MIDFIELDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 1,
    },
    {
      matchId: MATCH_CLOSED_REG_ID,
      userId: "00000000-0000-4000-8000-000000000003",
      preferredPosition: PlayerPosition.DEFENDER,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 2,
    },
    {
      matchId: MATCH_CLOSED_REG_ID,
      userId: "00000000-0000-4000-8000-00000000000c",
      preferredPosition: PlayerPosition.FORWARD,
      status: RegistrationStatus.CONFIRMED,
      queueOrder: 3,
    },
  ];

  await prisma.registration.createMany({ data: registrations });

  console.log("\n=== Seed Peladas — concluído ===\n");
  console.log("Palavra-passe para todos os utilizadores: password\n");
  console.log("— Admin —");
  console.log("  admin@peladas.local\n");
  console.log("— Jogador base —");
  console.log("  player@peladas.local (membro: Amigos da Quarta)\n");
  console.log("— Outros jogadores (membros de grupo conforme seed) —");
  for (const p of EXTRA_PLAYERS) {
    console.log(`  ${p.email}`);
  }
  console.log("\n— Grupos —");
  console.log("  Amigos da Quarta: player, joao, maria, pedro + admin");
  console.log("  Departamento Futebol ACME: ana, rui, sofia, miguel + admin\n");
  console.log("— Partidas de exemplo —");
  console.log("  Públicas: terça alternado, quinta sorteio, urgent fecho, titulares lotados, inscrições fechadas");
  console.log("  Grupo: Quarta (Amigos), ACME interna\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
