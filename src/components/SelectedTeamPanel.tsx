import { formatAmericanOdds, formatPercent } from "../lib/probability";
import { FlagIcon } from "./FlagIcon";
import type { SnapshotRecord, TeamSnapshot } from "../types/worldCup";

interface SelectedTeamPanelProps {
  team: TeamSnapshot;
  snapshot: SnapshotRecord;
}

const stageLabels: Array<keyof TeamSnapshot["stages"]> = [
  "roundOf32",
  "roundOf16",
  "quarterfinal",
  "semifinal",
  "final",
  "champion",
];

const readableLabel: Record<(typeof stageLabels)[number], string> = {
  roundOf32: "Reach Round of 32",
  roundOf16: "Reach Round of 16",
  quarterfinal: "Reach Quarterfinal",
  semifinal: "Reach Semifinal",
  final: "Reach Final",
  champion: "Win Tournament",
};

export function SelectedTeamPanel({
  team,
  snapshot,
}: SelectedTeamPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <article className="card p-6">
        <p className="chip inline-flex">Selected Team</p>
        <div className="mt-4 flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-ink">{team.team}</h2>
          <FlagIcon
            iso3={team.iso3}
            team={team.team}
            className="min-w-10"
          />
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <p>Group: {team.group}</p>
          <p>Confederation: {team.confederation}</p>
          <p>Bookmaker title odds: {formatAmericanOdds(team.oddsAmerican)}</p>
          <p>Advance-from-group odds: {formatAmericanOdds(team.groupAdvanceOddsAmerican)}</p>
          <p>Normalized title probability: {formatPercent(team.normalizedProbability)}</p>
          <p>FIFA ranking: {team.fifaRank ?? "N/A"}</p>
          <p>Snapshot date: {snapshot.metadata.snapshotDate}</p>
        </div>
      </article>

      <article className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="chip inline-flex">Stage Table</p>
            <h2 className="mt-4 text-2xl font-semibold text-ink">
              Estimated Path Through The Tournament
            </h2>
          </div>
          <p className="max-w-xs text-right text-sm text-slate-500">
            Group advancement uses market odds directly. Later rounds are modeled from title odds so the stage path stays internally consistent.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Stage</th>
                <th className="px-5 py-4 font-semibold">Probability</th>
              </tr>
            </thead>
            <tbody>
              {stageLabels.map((stage, index) => (
                <tr key={stage} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                  <td className="px-5 py-4 font-medium text-ink">{readableLabel[stage]}</td>
                  <td className="px-5 py-4">{formatPercent(team.stages[stage])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
