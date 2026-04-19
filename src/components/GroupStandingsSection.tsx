import type { GroupStanding } from "../types/worldCup";
import { FlagIcon } from "./FlagIcon";

interface GroupStandingsSectionProps {
  standings: GroupStanding[];
  selectedTeamIso: string;
}

function formClassName(result: GroupStanding["form"][number]) {
  if (result === "W") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (result === "D") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
}

export function GroupStandingsSection({
  standings,
  selectedTeamIso,
}: GroupStandingsSectionProps) {
  const standingsByGroup = standings.reduce<Record<string, GroupStanding[]>>((accumulator, standing) => {
    if (!accumulator[standing.group]) {
      accumulator[standing.group] = [];
    }

    accumulator[standing.group].push(standing);
    return accumulator;
  }, {});

  const groupKeys = Object.keys(standingsByGroup).sort();

  return (
    <section className="card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="chip inline-flex">Group Standings</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Live Group Table Snapshot</h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">
          Each table updates from the generated completed fixtures for the selected snapshot date. Form shows the latest
          group-stage results for each team using a simple win, draw, loss sequence.
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {groupKeys.map((group) => (
          <article
            key={group}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/80 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Group {group}</p>
                <p className="mt-1 text-lg font-semibold text-ink">Standings</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Pts / Form
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Team</th>
                    <th className="px-3 py-3 text-center font-semibold">P</th>
                    <th className="px-3 py-3 text-center font-semibold">W</th>
                    <th className="px-3 py-3 text-center font-semibold">D</th>
                    <th className="px-3 py-3 text-center font-semibold">L</th>
                    <th className="px-3 py-3 text-center font-semibold">GD</th>
                    <th className="px-3 py-3 text-center font-semibold">Pts</th>
                    <th className="px-4 py-3 font-semibold">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsByGroup[group].map((standing, index) => {
                    const isSelected = standing.team.iso3 === selectedTeamIso;

                    return (
                      <tr
                        key={standing.team.iso3}
                        className={isSelected ? "bg-teal-50/80" : index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-slate-400">{index + 1}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <FlagIcon
                              iso3={standing.team.iso3}
                              team={standing.team.team}
                              className="min-w-10"
                            />
                            <div>
                              <p className={`font-semibold ${isSelected ? "text-teal-800" : "text-ink"}`}>
                                {standing.team.team}
                              </p>
                              <p className="text-xs text-slate-500">{standing.team.confederation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center text-slate-600">{standing.played}</td>
                        <td className="px-3 py-4 text-center text-slate-600">{standing.wins}</td>
                        <td className="px-3 py-4 text-center text-slate-600">{standing.draws}</td>
                        <td className="px-3 py-4 text-center text-slate-600">{standing.losses}</td>
                        <td className="px-3 py-4 text-center font-medium text-ink">
                          {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                        </td>
                        <td className="px-3 py-4 text-center font-semibold text-ink">{standing.points}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {standing.form.length > 0 ? (
                              standing.form.slice(-5).map((result, formIndex) => (
                                <span
                                  key={`${standing.team.iso3}-${formIndex}-${result}`}
                                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${formClassName(result)}`}
                                >
                                  {result}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No results yet</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
