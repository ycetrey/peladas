import { MatchMode, TeamName } from "@prisma/client";
import type { ConfirmedForAssignment } from "./team-assignment.service";
import { TeamAssignmentService } from "./team-assignment.service";

function regs(queueOrders: number[]): ConfirmedForAssignment[] {
  return queueOrders.map((queueOrder, i) => ({
    id: `00000000-0000-4000-8000-0000000000${String(i + 1).padStart(2, "0")}`,
    userId: `10000000-0000-4000-8000-0000000000${String(i + 1).padStart(2, "0")}`,
    queueOrder,
  }));
}

describe("TeamAssignmentService", () => {
  const svc = new TeamAssignmentService();

  it("ALTERNATED interleaves by sorted queue order (A gets 1st, 3rd, …)", () => {
    const sorted = regs([1, 2, 3, 4]);
    const slots = svc.assign(sorted, MatchMode.ALTERNATED);

    const teamA = slots.filter((s) => s.teamName === TeamName.A);
    const teamB = slots.filter((s) => s.teamName === TeamName.B);
    expect(teamA.map((s) => s.registrationId)).toEqual([
      sorted[0].id,
      sorted[2].id,
    ]);
    expect(teamB.map((s) => s.registrationId)).toEqual([
      sorted[1].id,
      sorted[3].id,
    ]);
    expect(teamA.map((s) => s.orderInTeam)).toEqual([0, 1]);
    expect(teamB.map((s) => s.orderInTeam)).toEqual([0, 1]);
  });

  it("DRAW_AT_END assigns each player to exactly one team with balanced sizes", () => {
    const sorted = regs([1, 2, 3, 4]);
    const rng = () => 0.5;
    const slots = svc.assign(sorted, MatchMode.DRAW_AT_END, rng);

    expect(slots).toHaveLength(4);
    const ids = new Set(slots.map((s) => s.registrationId));
    expect(ids.size).toBe(4);
    const a = slots.filter((s) => s.teamName === TeamName.A);
    const b = slots.filter((s) => s.teamName === TeamName.B);
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(2);
  });

  it("DRAW_AT_END with rng always 0 yields deterministic split", () => {
    const sorted = regs([1, 2, 3, 4]);
    const slots = svc.assign(sorted, MatchMode.DRAW_AT_END, () => 0);

    const teamAIds = slots
      .filter((s) => s.teamName === TeamName.A)
      .map((s) => s.registrationId);
    const teamBIds = slots
      .filter((s) => s.teamName === TeamName.B)
      .map((s) => s.registrationId);

    expect(new Set([...teamAIds, ...teamBIds]).size).toBe(4);
    expect(teamAIds).toHaveLength(2);
    expect(teamBIds).toHaveLength(2);
  });
});
