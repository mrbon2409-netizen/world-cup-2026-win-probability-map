import Papa from "papaparse";
import { toPng } from "html-to-image";
import type { TeamSnapshot } from "../types/worldCup";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadTeamsCsv(records: TeamSnapshot[]) {
  const csv = Papa.unparse(
    records.map((team) => ({
      team: team.team,
      group: team.group,
      confederation: team.confederation,
      odds_american: team.oddsAmerican,
      group_advance_odds_american: team.groupAdvanceOddsAmerican,
      implied_probability: team.impliedProbability,
      normalized_probability: team.normalizedProbability,
      group_advance_probability: team.groupAdvanceProbability,
      round_of_32_probability: team.stages.roundOf32,
      round_of_16_probability: team.stages.roundOf16,
      quarterfinal_probability: team.stages.quarterfinal,
      semifinal_probability: team.stages.semifinal,
      final_probability: team.stages.final,
      champion_probability: team.stages.champion,
      fifa_rank: team.fifaRank ?? "",
      iso3: team.iso3,
    })),
  );

  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "worldcup2026_probabilities.csv");
}

export async function downloadNodeAsPng(node: HTMLElement | null, filename: string) {
  if (!node) {
    return;
  }

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#f8fbff",
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
