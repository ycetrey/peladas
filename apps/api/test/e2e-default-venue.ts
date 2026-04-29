import type { PrismaService } from "../src/prisma/prisma.service";

/** Cria um campo de teste pertencente ao admin de e2e (evita partilhar o venue global com outro owner). */
export async function createVenueForE2e(
  prisma: PrismaService,
  ownerId: string,
): Promise<string> {
  const v = await prisma.venue.create({
    data: {
      name: `E2E-campo-${Date.now()}`,
      locality: null,
      createdByUserId: ownerId,
    },
  });
  return v.id;
}
