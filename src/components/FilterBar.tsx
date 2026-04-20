import type { TeamSnapshot } from "../types/worldCup";
import type { MetricMode, ScopeFilter } from "../types/worldCup";

interface FilterBarProps {
  confederations: string[];
  groups: string[];
  teams: TeamSnapshot[];
  snapshotDates: string[];
  selectedDate: string;
  currentDate: string;
  confederation: string;
  group: string;
  scope: ScopeFilter;
  selectedTeamIso: string | null;
  mode: MetricMode;
  onDateChange: (value: string) => void;
  onConfederationChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onScopeChange: (value: ScopeFilter) => void;
  onTeamChange: (value: string | null) => void;
  onModeChange: (value: MetricMode) => void;
}

export function FilterBar({
  confederations,
  groups,
  teams,
  snapshotDates,
  selectedDate,
  currentDate,
  confederation,
  group,
  scope,
  selectedTeamIso,
  mode,
  onDateChange,
  onConfederationChange,
  onGroupChange,
  onScopeChange,
  onTeamChange,
  onModeChange,
}: FilterBarProps) {
  const currentIndex = snapshotDates.indexOf(selectedDate);
  const isTodaySelected = selectedDate === currentDate;
  const visibleTeams = teams
    .filter((team) => {
      const matchesConfederation =
        confederation === "all" || team.confederation === confederation;
      const matchesGroup = group === "all" || team.group === group;
      return matchesConfederation && matchesGroup;
    })
    .sort((a, b) => a.team.localeCompare(b.team));

  const nextDisabled =
    currentIndex < 0 ||
    currentIndex >= snapshotDates.length - 1 ||
    selectedDate >= currentDate;

  return (
    <section className="card p-5">
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(360px,1.2fr)]">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-600">Snapshot date</span>
            <div className="grid gap-2 sm:grid-cols-[auto,minmax(145px,1fr),auto,auto]">
              <button
                type="button"
                className="control min-w-[60px] px-3 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentIndex <= 0}
                onClick={() => onDateChange(snapshotDates[Math.max(currentIndex - 1, 0)])}
              >
                Prev
              </button>
              <input
                type="date"
                className={`control min-w-0 w-full ${isTodaySelected ? "border-amber-400 bg-amber-50 text-amber-950" : ""}`}
                min={snapshotDates[0]}
                max={currentDate}
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
              />
              <button
                type="button"
                className="control min-w-[60px] px-3 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={nextDisabled}
                onClick={() =>
                  onDateChange(
                    snapshotDates[Math.min(currentIndex + 1, snapshotDates.length - 1)],
                  )
                }
              >
                Next
              </button>
              <button
                type="button"
                className={`control min-w-[74px] px-3 text-center ${isTodaySelected ? "border-amber-400 bg-amber-100 font-semibold text-amber-950" : ""}`}
                onClick={() => onDateChange(currentDate)}
              >
                Today
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Future dates stay disabled. Today is highlighted when selected.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-slate-600">Confederation</span>
            <select
              className="control min-w-0"
              value={confederation}
              onChange={(event) => onConfederationChange(event.target.value)}
            >
              <option value="all">All confederations</option>
              {confederations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-slate-600">Group</span>
            <select
              className="control min-w-0"
              value={group}
              onChange={(event) => onGroupChange(event.target.value)}
            >
              <option value="all">All groups</option>
              {groups.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-slate-600">Scope</span>
            <select
              className="control min-w-0"
              value={scope}
              onChange={(event) => onScopeChange(event.target.value as ScopeFilter)}
            >
              <option value="all">All 48 teams</option>
              <option value="top10">Top 10 teams</option>
              <option value="top20">Top 20 teams</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-slate-600">Team</span>
            <select
              className="control min-w-0"
              value={selectedTeamIso ?? ""}
              onChange={(event) => onTeamChange(event.target.value || null)}
            >
              {visibleTeams.map((team) => (
                <option key={team.iso3} value={team.iso3}>
                  {team.team}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              mode === "normalizedProbability"
                ? "bg-ink text-white shadow-md"
                : "text-slate-600"
            }`}
            onClick={() => onModeChange("normalizedProbability")}
          >
            Color by normalized probability
          </button>
          <button
            type="button"
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              mode === "fifaRank" ? "bg-ink text-white shadow-md" : "text-slate-600"
            }`}
            onClick={() => onModeChange("fifaRank")}
          >
            Color by FIFA ranking
          </button>
        </div>
      </div>
    </section>
  );
}
