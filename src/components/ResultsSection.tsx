import { FlagIcon } from "./FlagIcon";
import { getCompletedMatches, getRecentSelectedTeamResults } from "../lib/schedule";
import type { ScheduleMatch, TeamSnapshot } from "../types/worldCup";

interface CompletedMatchesSectionProps {
  matches: ScheduleMatch[];
}

interface RecentResultsSectionProps {
  matches: ScheduleMatch[];
  selectedTeam: TeamSnapshot;
}

function ResultScore({ match, selectedTeamIso }: { match: ScheduleMatch; selectedTeamIso?: string }) {
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
          <p className="text-xs text-slate-500">Group {match.group}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white px-4 py-2 text-center shadow-sm">
        <p className="text-lg font-semibold tracking-tight text-ink">
          {match.scoreA} - {match.scoreB}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Final</p>
      </div>

      <div className="flex items-center gap-3 md:justify-start">
        <FlagIcon iso3={match.teamB.iso3} team={match.teamB.team} className="min-w-10" />
        <div>
          <p className={`font-semibold ${teamBHighlighted ? "text-emerald-700" : "text-ink"}`}>
            {match.teamB.team}
          </p>
          <p className="text-xs text-slate-500">Matchday {match.matchday}</p>
        </div>
      </div>

      <div className="text-sm text-slate-600 md:text-right">
        <p className="font-semibold text-ink">{match.kickoffLabel}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Your local time</p>
        <p className="mt-1">{match.venue}</p>
      </div>
    </div>
  );
}

export function CompletedMatchesSection({ matches }: CompletedMatchesSectionProps) {
  const completedMatches = getCompletedMatches(matches, 8);

  return (
    <article className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">Completed Matches</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Recently Completed Fixtures</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          This result board adds recent context for title-probability changes, making the snapshot feel tied to on-field progress.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {completedMatches.length > 0 ? (
          completedMatches.map((match) => <ResultScore key={match.id} match={match} />)
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            No matches are completed yet for the selected snapshot date.
          </div>
        )}
      </div>
    </article>
  );
}

export function RecentResultsSection({ matches, selectedTeam }: RecentResultsSectionProps) {
  const recentSelectedResults = getRecentSelectedTeamResults(matches, selectedTeam.iso3, 3);

  return (
    <article className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">Recent Results</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{selectedTeam.team} Recent Results</h2>
        </div>
        <p className="max-w-xs text-sm text-slate-500">
          The most recent completed fixtures for the selected team, highlighted so it is easier to connect form with probability movement.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {recentSelectedResults.length > 0 ? (
          recentSelectedResults.map((match) => (
            <ResultScore key={match.id} match={match} selectedTeamIso={selectedTeam.iso3} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            {selectedTeam.team} has not completed a match by this snapshot date yet.
          </div>
        )}
      </div>
    </article>
  );
}
