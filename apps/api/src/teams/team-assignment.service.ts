import { Injectable } from "@nestjs/common";
import { MatchMode, TeamName } from "@prisma/client";

export type ConfirmedForAssignment = {
  id: string;
  userId: string;
  queueOrder: number;
};

export type TeamSlot = {
  teamName: TeamName;
  registrationId: string;
  userId: string;
  orderInTeam: number;
};

@Injectable()
export class TeamAssignmentService {
  /**
   * `confirmedSorted` must be ordered by `queueOrder` ascending (titular queue).
   * `rng` returns values in [0, 1) — used only for `DRAW_AT_END`.
   */
  assign(
    confirmedSorted: ConfirmedForAssignment[],
    mode: MatchMode,
    rng: () => number = Math.random,
  ): TeamSlot[] {
    const n = confirmedSorted.length;
    if (n === 0) {
      return [];
    }

    if (mode === MatchMode.ALTERNATED) {
      const out: TeamSlot[] = [];
      let orderA = 0;
      let orderB = 0;
      for (let i = 0; i < confirmedSorted.length; i++) {
        const reg = confirmedSorted[i];
        const teamName = i % 2 === 0 ? TeamName.A : TeamName.B;
        const orderInTeam = teamName === TeamName.A ? orderA++ : orderB++;
        out.push({
          teamName,
          registrationId: reg.id,
          userId: reg.userId,
          orderInTeam,
        });
      }
      return out;
    }

    const shuffled = this.shuffleInPlace(
      confirmedSorted.map((r) => ({ ...r })),
      rng,
    );
    const half = n / 2;
    const out: TeamSlot[] = [];
    for (let i = 0; i < half; i++) {
      const reg = shuffled[i];
      out.push({
        teamName: TeamName.A,
        registrationId: reg.id,
        userId: reg.userId,
        orderInTeam: i,
      });
    }
    for (let i = half; i < n; i++) {
      const reg = shuffled[i];
      out.push({
        teamName: TeamName.B,
        registrationId: reg.id,
        userId: reg.userId,
        orderInTeam: i - half,
      });
    }
    return out;
  }

  /** Fisher–Yates; mutates `rows` order only (by swapping elements). */
  private shuffleInPlace(
    rows: ConfirmedForAssignment[],
    rng: () => number,
  ): ConfirmedForAssignment[] {
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = rows[i];
      rows[i] = rows[j];
      rows[j] = t;
    }
    return rows;
  }
}
