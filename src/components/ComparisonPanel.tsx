import {
  formatAmericanOdds,
  formatDeltaPercent,
  formatPercent,
  getTeamByIso,
} from "../lib/probability";
import { FlagIcon } from "./FlagIcon";
import type { SnapshotRecord, TeamSnapshot } from "../types/worldCup";

interface ComparisonPanelProps {
  selectedTeam: TeamSnapshot;
  compareTeamIso: string | null;
  onCompareTeamChange: (iso3: string | null) => void;
  snapshot: SnapshotRecord;
  previousSnapshot: SnapshotRecord | null;
}

function getDeltaTone(delta: number) {
  if (delta > 0) {
    return "text-emerald-700";
  }

  if (delta < 0) {
    return "text-rose-700";
  }

  return "text-slate-500";
}

export function ComparisonPanel({
  selectedTeam,
  compareTeamIso,
  onCompareTeamChange,
  snapshot,
  previousSnapshot,
}: ComparisonPanelProps) {
  const compareTeam = getTeamByIso(snapshot.teams, compareTeamIso);
  const previousTeam = previousSnapshot
    ? getTeamByIso(previousSnapshot.teams, selectedTeam.iso3)
    : null;
  const titleDelta = previousTeam
    ? selectedTeam.normalizedProbability - previousTeam.normalizedProbability
    : null;
  const groupDelta = previousTeam
    ? selectedTeam.groupAdvanceProbability - previousTeam.groupAdvanceProbability
    : null;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
      <SnapshotComparisonCard selectedTeam={selectedTeam} snapshot={snapshot} previousSnapshot={previousSnapshot} />
      <TeamComparisonCard
        selectedTeam={selectedTeam}
        compareTeamIso={compareTeamIso}
        onCompareTeamChange={onCompareTeamChange}
        snapshot={snapshot}
      />
    </section>
  );
}

export function SnapshotComparisonCard({
  selectedTeam,
  snapshot,
  previousSnapshot,
}: Pick<ComparisonPanelProps, "selectedTeam" | "snapshot" | "previousSnapshot">) {
  const previousTeam = previousSnapshot
    ? getTeamByIso(previousSnapshot.teams, selectedTeam.iso3)
    : null;
  const titleDelta = previousTeam
    ? selectedTeam.normalizedProbability - previousTeam.normalizedProbability
    : null;
  const groupDelta = previousTeam
    ? selectedTeam.groupAdvanceProbability - previousTeam.groupAdvanceProbability
    : null;

  return (
    <article className="card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="chip inline-flex">Snapshot Comparison</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            Compare Against The Previous Snapshot
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            This compares the selected team on {snapshot.metadata.snapshotDate}
            {previousSnapshot ? ` against ${previousSnapshot.metadata.snapshotDate}` : " against the closest earlier snapshot available"}.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-ink">{selectedTeam.team}</p>
          <p className="mt-1">
            {previousSnapshot ? `Previous snapshot: ${previousSnapshot.metadata.snapshotDate}` : "No previous snapshot available"}
          </p>
        </div>
      </div>

      {previousTeam ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Title probability</p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {formatPercent(selectedTeam.normalizedProbability)}
            </p>
            <p className={`mt-2 text-sm font-semibold ${getDeltaTone(titleDelta ?? 0)}`}>
              {formatDeltaPercent(selectedTeam.normalizedProbability, previousTeam.normalizedProbability)}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Advance-from-group</p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {formatPercent(selectedTeam.groupAdvanceProbability)}
            </p>
            <p className={`mt-2 text-sm font-semibold ${getDeltaTone(groupDelta ?? 0)}`}>
              {formatDeltaPercent(selectedTeam.groupAdvanceProbability, previousTeam.groupAdvanceProbability)}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Bookmaker title odds</p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {formatAmericanOdds(selectedTeam.oddsAmerican)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Previous: {formatAmericanOdds(previousTeam.oddsAmerican)}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">FIFA ranking</p>
            <p className="mt-3 text-2xl font-semibold text-ink">
              {selectedTeam.fifaRank ?? "N/A"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Previous: {previousTeam.fifaRank ?? "N/A"}
            </p>
          </article>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          There is no earlier snapshot for this selected date yet, so snapshot-to-snapshot comparison is unavailable.
        </div>
      )}
    </article>
  );
}

export function TeamComparisonCard({
  selectedTeam,
  compareTeamIso,
  onCompareTeamChange,
  snapshot,
}: Pick<ComparisonPanelProps, "selectedTeam" | "compareTeamIso" | "onCompareTeamChange" | "snapshot">) {
  const compareTeam = getTeamByIso(snapshot.teams, compareTeamIso);

  return (
    <article className="card p-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="chip inline-flex">Team Comparison</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Compare Two Teams</h2>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Comparison team</span>
          <select
            className="control"
            value={compareTeamIso ?? ""}
            onChange={(event) => onCompareTeamChange(event.target.value || null)}
          >
            <option value="">Choose a second team</option>
            {snapshot.teams
              .filter((team) => team.iso3 !== selectedTeam.iso3)
              .sort((a, b) => a.team.localeCompare(b.team))
              .map((team) => (
                <option key={team.iso3} value={team.iso3}>
                  {team.team}
                </option>
              ))}
          </select>
        </label>

        {compareTeam ? (
          <div className="mt-1 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[selectedTeam, compareTeam].map((team) => (
                <div key={team.iso3} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-ink">{team.team}</h3>
                    <FlagIcon iso3={team.iso3} team={team.team} className="min-w-10" />
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Group: {team.group}</p>
                    <p>Title odds: {formatAmericanOdds(team.oddsAmerican)}</p>
                    <p>Win probability: {formatPercent(team.normalizedProbability)}</p>
                    <p>Advance probability: {formatPercent(team.groupAdvanceProbability)}</p>
                    <p>FIFA ranking: {team.fifaRank ?? "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-ink">Head-to-head snapshot difference</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Win probability gap</p>
                  <p className={`mt-2 text-xl font-semibold ${getDeltaTone(selectedTeam.normalizedProbability - compareTeam.normalizedProbability)}`}>
                    {formatDeltaPercent(selectedTeam.normalizedProbability, compareTeam.normalizedProbability)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Advance gap</p>
                  <p className={`mt-2 text-xl font-semibold ${getDeltaTone(selectedTeam.groupAdvanceProbability - compareTeam.groupAdvanceProbability)}`}>
                    {formatDeltaPercent(selectedTeam.groupAdvanceProbability, compareTeam.groupAdvanceProbability)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Bookmaker title odds</p>
                  <p className="mt-2 text-xl font-semibold text-ink">
                    {formatAmericanOdds(selectedTeam.oddsAmerican)} vs {formatAmericanOdds(compareTeam.oddsAmerican)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            Select a second team to compare title odds, group advancement, and current normalized win probability side by side.
          </div>
        )}
      </div>
    </article>
  );
}
