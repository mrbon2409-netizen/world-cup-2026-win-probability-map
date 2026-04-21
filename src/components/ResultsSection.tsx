import type { AppCopy } from "../lib/i18n";
import { FlagIcon } from "./FlagIcon";
import { getCompletedMatches, getRecentSelectedTeamResults } from "../lib/schedule";
import type { ScheduleMatch, TeamSnapshot } from "../types/worldCup";

interface CompletedMatchesSectionProps {
  matches: ScheduleMatch[];
  labels: AppCopy["schedule"];
}

interface RecentResultsSectionProps {
  matches: ScheduleMatch[];
  selectedTeam: TeamSnapshot;
  labels: AppCopy["schedule"];
}

function ResultScore({
  match,
  selectedTeamIso,
  labels,
}: {
  match: ScheduleMatch;
  selectedTeamIso?: string;
  labels: AppCopy["schedule"];
}) {
  const teamAHighlighted =
    selectedTeamIso === match.teamA.iso3 &&
    (match.scoreA ?? -1) > (match.scoreB ?? -1);
  const teamBHighlighted =
    selectedTeamIso === match.teamB.iso3 &&
    (match.scoreB ?? -1) > (match.scoreA ?? -1);

  return (
    <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr,auto,1fr,auto] md:items-center">
      <div className="flex items-center gap-3">
        <FlagIcon iso3={match.teamA.iso3} team={match.teamA.team} className="min-w-10" />
        <div>
          <p className={`font-semibold ${teamAHighlighted ? "text-emerald-700" : "text-ink"}`}>
            {match.teamA.team}
          </p>
          <p className="text-xs text-slate-500">{labels.group} {match.group}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white px-4 py-2 text-center shadow-sm">
        <p className="text-lg font-semibold tracking-tight text-ink">
          {match.scoreA} - {match.scoreB}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{labels.final}</p>
      </div>

      <div className="flex items-center gap-3 md:justify-start">
        <FlagIcon iso3={match.teamB.iso3} team={match.teamB.team} className="min-w-10" />
        <div>
          <p className={`font-semibold ${teamBHighlighted ? "text-emerald-700" : "text-ink"}`}>
            {match.teamB.team}
          </p>
          <p className="text-xs text-slate-500">{labels.matchday} {match.matchday}</p>
        </div>
      </div>

      <div className="text-sm text-slate-600 md:text-right">
        <p className="font-semibold text-ink">{match.kickoffLabel}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{labels.yourLocalTime}</p>
        <p className="mt-1">{match.venue}</p>
      </div>
    </div>
  );
}

export function CompletedMatchesSection({ matches, labels }: CompletedMatchesSectionProps) {
  const completedMatches = getCompletedMatches(matches, 8);

  return (
    <article className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">{labels.completedEyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{labels.completedTitle}</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          {labels.completedDescription}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {completedMatches.length > 0 ? (
          completedMatches.map((match) => <ResultScore key={match.id} match={match} labels={labels} />)
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            {labels.noCompleted}
          </div>
        )}
      </div>
    </article>
  );
}

export function RecentResultsSection({ matches, selectedTeam, labels }: RecentResultsSectionProps) {
  const recentSelectedResults = getRecentSelectedTeamResults(matches, selectedTeam.iso3, 3);

  return (
    <article className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">{labels.recentEyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{selectedTeam.team} {labels.recentEyebrow}</h2>
        </div>
        <p className="max-w-xs text-sm text-slate-500">
          {labels.recentDescription}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {recentSelectedResults.length > 0 ? (
          recentSelectedResults.map((match) => (
            <ResultScore key={match.id} match={match} selectedTeamIso={selectedTeam.iso3} labels={labels} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            {selectedTeam.team} {labels.noRecentSuffix}
          </div>
        )}
      </div>
    </article>
  );
}
