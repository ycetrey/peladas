/**
 * Dados estáticos para Storybook, testes e demos.
 * Formato espelha JSON da API (não entidades Prisma). IDs estáveis = seed.
 */

/** @see apps/api/prisma/seed.ts */
export const SEED_USER_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_ADMIN_ID = "00000000-0000-4000-8000-000000000002";
export const DEFAULT_VENUE_ID = "00000000-0000-4000-8000-0000000000a0";
export const VENUE_CENTRAL_ID = "00000000-0000-4000-8000-0000000000b1";
export const VENUE_ATLANTICO_ID = "00000000-0000-4000-8000-0000000000b2";
export const GROUP_AMIGOS_ID = "00000000-0000-4000-8000-0000000000c1";
export const GROUP_ACME_ID = "00000000-0000-4000-8000-0000000000c2";
export const MATCH_PUBLIC_ALT_ID = "00000000-0000-4000-8000-0000000000d1";
export const MATCH_PUBLIC_DRAW_ID = "00000000-0000-4000-8000-0000000000d2";
export const MATCH_GROUP_AMIGOS_ID = "00000000-0000-4000-8000-0000000000d3";

/** Rótulo para stories / smoke (não é segredo). */
export const FIXTURE_SCENARIO_LABEL = "Peladas seed — partida pública alternada";

/**
 * Exemplo estático com a forma de `Match` na listagem/detalhe API.
 * Valores são ilustrativos; alinhar com `GET /matches` real em integração.
 */
export const sampleMatchListItem = {
  id: MATCH_PUBLIC_ALT_ID,
  title: "Pelada Campo Sintético (fixture)",
  dateTime: "2026-05-01T18:00:00.000Z",
  mode: "ALTERNATED" as const,
  status: "OPEN" as const,
  maxPlayers: 10,
  maxSubstitutes: 4,
  registrationOpensAt: "2026-04-01T08:00:00.000Z",
  registrationClosesAt: "2026-04-30T23:59:59.000Z",
  venueId: VENUE_CENTRAL_ID,
  visibility: "PUBLIC" as const,
  groupId: null,
  venue: {
    id: VENUE_CENTRAL_ID,
    name: "Campo Central (fixture)",
    locality: "Lisboa",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  confirmedTitularCount: 6,
  titularSlotsRemaining: 4,
  activeRegistrationCount: 6,
  absentCount: 1,
  myRegistration: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
