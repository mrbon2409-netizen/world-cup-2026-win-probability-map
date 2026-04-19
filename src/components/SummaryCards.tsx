import { formatAmericanOdds, formatPercent, sortTeamsByProbability } from "../lib/probability";
import type { SnapshotRecord } from "../types/worldCup";

interface SummaryCardsProps {
  snapshot: SnapshotRecord;
}

export function SummaryCards({ snapshot }: SummaryCardsProps) {
  const teams = sortTeamsByProbability(snapshot.teams);
  const favorite = teams[0];
  const highestRanked = [...snapshot.teams]
    .filter((team) => team.fifaRank !== null)
    .sort((a, b) => (a.fifaRank ?? Infinity) - (b.fifaRank ?? Infinity))[0];

  const averageProbability =
    snapshot.teams.reduce((sum, team) => sum + team.normalizedProbability, 0) /
    snapshot.teams.length;

  const cards = [
    {
      label: "Favorite",
      value: favorite.team,
      detail: `${formatPercent(favorite.normalizedProbability)} | ${formatAmericanOdds(
        favorite.oddsAmerican,
      )}`,
    },
    {
      label: "Average Probability",
      value: formatPercent(averageProbability),
      detail: "Normalized across the full 48-team field",
    },
    {
      label: "Highest-Ranked Team",
      value: highestRanked?.team ?? "N/A",
      detail: highestRanked?.fifaRank ? `FIFA rank #${highestRanked.fifaRank}` : "N/A",
    },
    {
      label: "Market Source",
      value: snapshot.metadata.titleOddsLabel,
      detail: `Snapshot date ${snapshot.metadata.snapshotDate}`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="card p-6">
          <p className="chip inline-flex">{card.label}</p>
          <h3 className="mt-5 text-2xl font-semibold text-ink">{card.value}</h3>
          <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
