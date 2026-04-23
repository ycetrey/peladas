import { MatchStatus, RegistrationStatus } from "@prisma/client";
import {
  MatchNotOpenError,
  NoRegistrationSlotsError,
  RegistrationClosedError,
  UserAlreadyRegisteredError,
} from "../common/errors/domain-errors";
import { RegistrationRulesService } from "./registration-rules.service";

describe("RegistrationRulesService", () => {
  const service = new RegistrationRulesService();

  const openWindow = () => ({
    status: MatchStatus.OPEN,
    registrationOpensAt: new Date("2020-01-01T00:00:00.000Z"),
    registrationClosesAt: new Date("2030-01-01T00:00:00.000Z"),
  });

  it("assertMatchOpenForRegistration does not throw when OPEN and now inside window", () => {
    expect(() =>
      service.assertMatchOpenForRegistration(openWindow(), new Date()),
    ).not.toThrow();
  });

  it("throws MatchNotOpenError when match is not OPEN", () => {
    expect(() =>
      service.assertMatchOpenForRegistration(
        {
          ...openWindow(),
          status: MatchStatus.DRAFT,
        },
        new Date(),
      ),
    ).toThrow(MatchNotOpenError);
  });

  it("throws RegistrationClosedError when now is outside the registration window", () => {
    expect(() =>
      service.assertMatchOpenForRegistration(
        openWindow(),
        new Date("1999-01-01T00:00:00.000Z"),
      ),
    ).toThrow(RegistrationClosedError);
  });

  it("throws UserAlreadyRegisteredError when duplicate active registration exists", () => {
    expect(() =>
      service.assertNoActiveDuplicate({ id: "any-id" }),
    ).toThrow(UserAlreadyRegisteredError);
  });

  it("returns CONFIRMED when titular slots remain", () => {
    expect(
      service.decideStatusForNewRegistration(0, 0, 4, 2),
    ).toBe(RegistrationStatus.CONFIRMED);
  });

  it("returns SUBSTITUTE when titulars full but substitute slots remain", () => {
    expect(
      service.decideStatusForNewRegistration(4, 0, 4, 2),
    ).toBe(RegistrationStatus.SUBSTITUTE);
  });

  it("throws NoRegistrationSlotsError when both pools are full", () => {
    expect(() =>
      service.decideStatusForNewRegistration(4, 2, 4, 2),
    ).toThrow(NoRegistrationSlotsError);
  });
});
