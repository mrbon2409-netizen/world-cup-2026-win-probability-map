import { FlagIcon } from "./FlagIcon";
import { getUpcomingMatches } from "../lib/schedule";
import type { ScheduleMatch } from "../types/worldCup";

interface ScheduleSectionProps {
  matches: ScheduleMatch[];
}

function statusClassName(status: ScheduleMatch["status"]) {
  if (status === "today") {
    return "border border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "completed") {
    return "border border-slate-200 bg-slate-100 text-slate-500";
  }

  return "border border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function MatchRow({ match }: { match: ScheduleMatch }) {
  return (
    <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr,auto,1fr,auto] md:items-center">
      <div className="flex items-center gap-3">
        <FlagIcon iso3={match.teamA.iso3} team={match.teamA.team} className="min-w-10" />
        <div>
          <p className="font-semibold text-ink">{match.teamA.team}</p>
          <p className="text-xs text-slate-500">Group {match.group}</p>
        </div>
      </div>

      <div className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        vs
      </div>

      <div className="flex items-center gap-3 md:justify-start">
        <FlagIcon iso3={match.teamB.iso3} team={match.teamB.team} className="min-w-10" />
        <div>
          <p className="font-semibold text-ink">{match.teamB.team}</p>
          <p className="text-xs text-slate-500">Matchday {match.matchday}</p>
        </div>
      </div>

      <div className="text-sm text-slate-600 md:text-right">
        <p className="font-semibold text-ink">{match.kickoffLabel}</p>
        <p>{match.venue}</p>
        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(match.status)}`}>
          {match.status}
        </span>
      </div>
    </div>
  );
}

export function ScheduleSection({ matches }: ScheduleSectionProps) {
  const upcomingMatches = getUpcomingMatches(matches, 20);
  const midpoint = Math.ceil(upcomingMatches.length / 2);
  const leftColumnMatches = upcomingMatches.slice(0, midpoint);
  const rightColumnMatches = upcomingMatches.slice(midpoint);

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">Upcoming Matches</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Tournament Schedule Pulse</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          A generated tournament calendar tied to the current 48-team group layout, so the odds dashboard can be read alongside upcoming fixtures.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          {leftColumnMatches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
        <div className="space-y-3">
          {rightColumnMatches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}
