import type { AppCopy } from "../lib/i18n";
import { groupMatchesByDate } from "../lib/schedule";
import type { ScheduleMatch } from "../types/worldCup";
import { FlagIcon } from "./FlagIcon";

interface ScheduleSectionProps {
  matches: ScheduleMatch[];
  labels: AppCopy["schedule"];
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

export function MatchRow({
  match,
  labels,
}: {
  match: ScheduleMatch;
  labels: AppCopy["schedule"];
}) {
  return (
    <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 2xl:grid-cols-[1fr,auto,1fr,auto] 2xl:items-center">
      <div className="flex items-center gap-3">
        <FlagIcon iso3={match.teamA.iso3} team={match.teamA.team} className="min-w-10" />
        <div>
          <p className="font-semibold text-ink">{match.teamA.team}</p>
          <p className="text-xs text-slate-500">
            {labels.group} {match.group}
          </p>
        </div>
      </div>

      <div className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        vs
      </div>

      <div className="flex items-center gap-3 2xl:justify-start">
        <FlagIcon iso3={match.teamB.iso3} team={match.teamB.team} className="min-w-10" />
        <div>
          <p className="font-semibold text-ink">{match.teamB.team}</p>
          <p className="text-xs text-slate-500">
            {labels.matchday} {match.matchday}
          </p>
        </div>
      </div>

      <div className="text-sm text-slate-600 2xl:text-right">
        <p className="font-semibold text-ink">{match.kickoffLabel}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{labels.yourLocalTime}</p>
        <p className="mt-1">{match.venue}</p>
        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClassName(match.status)}`}
        >
          {labels.status[match.status]}
        </span>
      </div>
    </div>
  );
}

export function ScheduleSection({ matches, labels }: ScheduleSectionProps) {
  const groupedMatches = groupMatchesByDate(matches);
  const locale =
    typeof document !== "undefined" ? document.documentElement.lang || "en" : "en";

  function formatSectionDate(kickoffDate: string) {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${kickoffDate}T12:00:00Z`));
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">{labels.upcomingEyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{labels.upcomingTitle}</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">{labels.upcomingDescription}</p>
      </div>

      <div className="mt-5 max-h-[1080px] overflow-y-auto pr-2">
        <div className="space-y-5">
          {groupedMatches.map((day) => (
            <section
              key={day.kickoffDate}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-semibold text-ink">{`${labels.groupStage} • ${formatSectionDate(day.kickoffDate)}`}</h3>
              </div>

              <div className="grid gap-4 p-4 xl:grid-cols-2 xl:items-start">
                {day.matches.map((match) => (
                  <MatchRow key={match.id} match={match} labels={labels} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
