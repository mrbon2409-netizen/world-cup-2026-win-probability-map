import { formatAmericanOdds, formatPercent } from "../lib/probability";
import type { AppCopy } from "../lib/i18n";
import { FlagIcon } from "./FlagIcon";
import type { SnapshotRecord, TeamSnapshot } from "../types/worldCup";

interface SelectedTeamPanelProps {
  team: TeamSnapshot;
  snapshot: SnapshotRecord;
  labels: AppCopy["selectedTeam"];
}

const stageLabels: Array<keyof TeamSnapshot["stages"]> = [
  "roundOf32",
  "roundOf16",
  "quarterfinal",
  "semifinal",
  "final",
  "champion",
];

export function SelectedTeamSummaryCard({ team, snapshot, labels }: SelectedTeamPanelProps) {
  return (
    <article className="card p-6">
      <p className="chip inline-flex">{labels.summaryEyebrow}</p>
      <div className="mt-4 flex items-center gap-3">
        <h2 className="text-3xl font-semibold text-ink">{team.team}</h2>
        <FlagIcon
          iso3={team.iso3}
          team={team.team}
          className="min-w-10"
        />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <p>{labels.group}: {team.group}</p>
        <p>{labels.confederation}: {team.confederation}</p>
        <p>{labels.bookmakerOdds}: {formatAmericanOdds(team.oddsAmerican)}</p>
        <p>{labels.advanceOdds}: {formatAmericanOdds(team.groupAdvanceOddsAmerican)}</p>
        <p>{labels.normalizedProbability}: {formatPercent(team.normalizedProbability)}</p>
        <p>{labels.fifaRanking}: {team.fifaRank ?? labels.notAvailable}</p>
        <p>{labels.snapshotDate}: {snapshot.metadata.snapshotDate}</p>
      </div>
    </article>
  );
}

export function StageTableCard({
  team,
  labels,
}: {
  team: TeamSnapshot;
  labels: AppCopy["selectedTeam"];
}) {
  return (
    <article className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">{labels.stageEyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {labels.stageTitle}
          </h2>
        </div>
        <p className="max-w-xs text-right text-sm text-slate-500">
          {labels.stageDescription}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">{labels.stage}</th>
              <th className="px-5 py-4 font-semibold">{labels.probability}</th>
            </tr>
          </thead>
          <tbody>
            {stageLabels.map((stage, index) => (
              <tr key={stage} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                <td className="px-5 py-4 font-medium text-ink">{labels.stageLabels[stage]}</td>
                <td className="px-5 py-4">{formatPercent(team.stages[stage])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function SelectedTeamPanel({ team, snapshot, labels }: SelectedTeamPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <SelectedTeamSummaryCard team={team} snapshot={snapshot} labels={labels} />
      <StageTableCard team={team} labels={labels} />
    </section>
  );
}
