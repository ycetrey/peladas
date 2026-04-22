import { MatchMode } from "@prisma/client";
import { InvalidMatchCreationError } from "../common/errors/domain-errors";
import { MatchRulesService } from "./match-rules.service";

const baseDates = () => {
  const registrationOpensAt = new Date("2026-05-01T10:00:00.000Z");
  const registrationClosesAt = new Date("2026-05-01T18:00:00.000Z");
  const dateTime = new Date("2026-05-01T20:00:00.000Z");
  return { registrationOpensAt, registrationClosesAt, dateTime };
};

describe("MatchRulesService", () => {
  const service = new MatchRulesService();

  it("does not throw for a valid payload", () => {
    const d = baseDates();
    expect(() =>
      service.validateCreate({
        title: "Pelada",
        dateTime: d.dateTime,
        mode: MatchMode.ALTERNATED,
        maxPlayers: 10,
        maxSubstitutes: 2,
        registrationOpensAt: d.registrationOpensAt,
        registrationClosesAt: d.registrationClosesAt,
      }),
    ).not.toThrow();
  });

  it("throws when maxPlayers is odd", () => {
    const d = baseDates();
    expect(() =>
      service.validateCreate({
        title: "Pelada",
        dateTime: d.dateTime,
        mode: MatchMode.ALTERNATED,
        maxPlayers: 9,
        maxSubstitutes: 0,
        registrationOpensAt: d.registrationOpensAt,
        registrationClosesAt: d.registrationClosesAt,
      }),
    ).toThrow(InvalidMatchCreationError);
  });

  it("throws when registrationClosesAt is not before dateTime", () => {
    const registrationOpensAt = new Date("2026-05-01T10:00:00.000Z");
    const registrationClosesAt = new Date("2026-05-01T20:00:00.000Z");
    const dateTime = new Date("2026-05-01T18:00:00.000Z");
    expect(() =>
      service.validateCreate({
        title: "Pelada",
        dateTime,
        mode: MatchMode.DRAW_AT_END,
        maxPlayers: 8,
        maxSubstitutes: 0,
        registrationOpensAt,
        registrationClosesAt,
      }),
    ).toThrow(InvalidMatchCreationError);
  });
});
