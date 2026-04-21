import { formatAmericanOdds, formatPercent, sortTeamsByProbability } from "../lib/probability";
import type { AppCopy } from "../lib/i18n";
import type { SnapshotRecord } from "../types/worldCup";

interface SummaryCardsProps {
  snapshot: SnapshotRecord;
  labels: AppCopy["summary"];
}

export function SummaryCards({ snapshot, labels }: SummaryCardsProps) {
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
      label: labels.favorite,
      value: favorite.team,
      detail: `${formatPercent(favorite.normalizedProbability)} | ${formatAmericanOdds(
        favorite.oddsAmerican,
      )}`,
    },
    {
      label: labels.averageProbability,
      value: formatPercent(averageProbability),
      detail: labels.averageDetail,
    },
    {
      label: labels.highestRanked,
      value: highestRanked?.team ?? labels.notAvailable,
      detail: highestRanked?.fifaRank
        ? `${labels.fifaRank} #${highestRanked.fifaRank}`
        : labels.notAvailable,
    },
    {
      label: labels.marketSource,
      value: snapshot.metadata.titleOddsLabel,
      detail: `${labels.snapshotDate} ${snapshot.metadata.snapshotDate}`,
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
