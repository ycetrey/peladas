import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USER_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  await prisma.user.upsert({
    where: { id: SEED_USER_ID },
    update: {
      name: "Seed Jogador",
      preferredPositions: ["MIDFIELDER", "ANY"],
      isAdmin: false,
    },
    create: {
      id: SEED_USER_ID,
      name: "Seed Jogador",
      preferredPositions: ["MIDFIELDER", "ANY"],
      isAdmin: false,
    },
  });

  await prisma.user.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Seed Admin",
      preferredPositions: ["GOALKEEPER"],
      isAdmin: true,
    },
  });
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
