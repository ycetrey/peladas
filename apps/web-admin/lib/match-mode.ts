import type { MatchMode } from "./types";

export function matchModeLabelPt(mode: MatchMode): string {
  switch (mode) {
    case "ALTERNATED":
      return "Alternado";
    case "DRAW_AT_END":
      return "Sorteio no final";
  }
}
