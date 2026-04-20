import { useEffect, useMemo, useRef, useState } from "react";
import { AutomationStatusCard } from "./components/AutomationStatusCard";
import { SnapshotComparisonCard, TeamComparisonCard } from "./components/ComparisonPanel";
import { FilterBar } from "./components/FilterBar";
import { GroupStandingsSection } from "./components/GroupStandingsSection";
import { HistoryTrendChart } from "./components/HistoryTrendChart";
import { ProbabilityBarChart } from "./components/ProbabilityBarChart";
import { CompletedMatchesSection, RecentResultsSection } from "./components/ResultsSection";
import { ScheduleSection } from "./components/ScheduleSection";
import { SelectedTeamSummaryCard, StageTableCard } from "./components/SelectedTeamPanel";
import { SelectedTeamScheduleSection } from "./components/SelectedTeamScheduleSection";
import { SummaryCards } from "./components/SummaryCards";
import { TeamsTable } from "./components/TeamsTable";
import { VisitCounter } from "./components/VisitCounter";
import { WorldMap } from "./components/WorldMap";
import { useAutomationStatus } from "./hooks/useAutomationStatus";
import { useLatestSnapshot, useWorldCupHistory } from "./hooks/useWorldCupHistory";
import { downloadNodeAsPng, downloadTeamsCsv } from "./lib/export";
import {
  applyScopeFilter,
  getFilteredTeams,
  getPreviousSnapshot,
  getSnapshotByDate,
  getTeamByIso,
  sortTeamsByProbability,
} from "./lib/probability";
import { buildGroupStageSchedule, buildGroupStandings } from "./lib/schedule";
import type { MetricMode, ScopeFilter } from "./types/worldCup";

function getTodayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function resolveSnapshotDate(snapshotDates: string[], requestedDate: string, today: string) {
  const clampedDate = requestedDate > today ? today : requestedDate;
  if (snapshotDates.includes(clampedDate)) {
    return clampedDate;
  }

  const earlierDates = snapshotDates.filter((date) => date <= clampedDate);
  return earlierDates[earlierDates.length - 1] ?? snapshotDates[snapshotDates.length - 1] ?? today;
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="chip inline-flex">{eyebrow}</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function App() {
  const { snapshots, loading, error } = useWorldCupHistory();
  const { status: automationStatus } = useAutomationStatus();
  const latestSnapshot = useLatestSnapshot(snapshots);
  const todayIso = getTodayIsoDate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTeamIso, setSelectedTeamIso] = useState<string | null>(null);
  const [compareTeamIso, setCompareTeamIso] = useState<string | null>(null);
  const [confederation, setConfederation] = useState("all");
  const [group, setGroup] = useState("all");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [mode, setMode] = useState<MetricMode>("normalizedProbability");
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (latestSnapshot && !selectedDate) {
      setSelectedDate(latestSnapshot.metadata.snapshotDate);
      setSelectedTeamIso(sortTeamsByProbability(latestSnapshot.teams)[0]?.iso3 ?? null);
    }
  }, [latestSnapshot, selectedDate]);

  const activeSnapshot = useMemo(
    () =>
      (selectedDate ? getSnapshotByDate(snapshots, selectedDate) : null) ?? latestSnapshot,
    [latestSnapshot, selectedDate, snapshots],
  );

  const snapshotDates = useMemo(
    () => snapshots.map((snapshot) => snapshot.metadata.snapshotDate),
    [snapshots],
  );

  const handleDateChange = (nextDate: string) => {
    setSelectedDate(resolveSnapshotDate(snapshotDates, nextDate, todayIso));
  };

  const confederations = useMemo(
    () =>
      activeSnapshot
        ? [...new Set(activeSnapshot.teams.map((team) => team.confederation))].sort()
        : [],
    [activeSnapshot],
  );

  const groups = useMemo(
    () =>
      activeSnapshot ? [...new Set(activeSnapshot.teams.map((team) => team.group))].sort() : [],
    [activeSnapshot],
  );

  const filteredBaseTeams = useMemo(
    () =>
      activeSnapshot
        ? getFilteredTeams(activeSnapshot.teams, confederation, group)
        : [],
    [activeSnapshot, confederation, group],
  );

  const filteredTeams = useMemo(
    () => applyScopeFilter(filteredBaseTeams, scope),
    [filteredBaseTeams, scope],
  );

  useEffect(() => {
    if (filteredBaseTeams.length === 0) {
      return;
    }

    const selectedStillVisible = filteredBaseTeams.some((team) => team.iso3 === selectedTeamIso);
    if (!selectedStillVisible) {
      setSelectedTeamIso(filteredBaseTeams[0]?.iso3 ?? null);
    }
  }, [filteredBaseTeams, selectedTeamIso]);

  const previousSnapshot = useMemo(
    () =>
      activeSnapshot
        ? getPreviousSnapshot(snapshots, activeSnapshot.metadata.snapshotDate)
        : null,
    [activeSnapshot, snapshots],
  );

  const scheduleMatches = useMemo(
    () =>
      activeSnapshot
        ? buildGroupStageSchedule(activeSnapshot.teams, activeSnapshot.metadata.snapshotDate)
        : [],
    [activeSnapshot],
  );

  const groupStandings = useMemo(
    () => (activeSnapshot ? buildGroupStandings(activeSnapshot.teams, scheduleMatches) : []),
    [activeSnapshot, scheduleMatches],
  );

  const selectedTeam = useMemo(() => {
    if (!activeSnapshot) {
      return null;
    }

    return (
      getTeamByIso(activeSnapshot.teams, selectedTeamIso) ??
      sortTeamsByProbability(activeSnapshot.teams)[0] ??
      null
    );
  }, [activeSnapshot, selectedTeamIso]);

  useEffect(() => {
    if (selectedTeam) {
      setSelectedTeamIso(selectedTeam.iso3);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (!compareTeamIso || compareTeamIso !== selectedTeam?.iso3) {
      return;
    }

    setCompareTeamIso(null);
  }, [compareTeamIso, selectedTeam]);

  return (
    <main className="min-h-screen bg-mesh text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 card relative overflow-hidden p-8">
          <div className="pointer-events-none absolute right-6 top-5 rounded-full border border-red-100/80 bg-red-50/90 p-2 shadow-sm">
            <img
              src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Maple%20Leaf.svg"
              alt="Canadian maple leaf"
              className="h-14 w-14 object-contain"
            />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="chip inline-flex">Daily Snapshot App</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                World Cup 2026 Win Probability Map
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A bookmaker-led World Cup dashboard with daily snapshot history, map selection, stage-probability estimates, and automation-ready data files for all 48 qualified teams.
              </p>
            </div>

            {activeSnapshot ? (
              <div className="rounded-3xl border border-teal-100 bg-teal-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Last Snapshot
                </p>
                <p className="mt-2 text-lg font-semibold text-teal-950">
                  {activeSnapshot.metadata.snapshotDate}
                </p>
                <p className="mt-1 text-sm text-teal-800">
                  {activeSnapshot.metadata.totalTeams} teams
                </p>
              </div>
            ) : null}
          </div>
        </header>

        {loading ? (
          <section className="card p-8 text-lg text-slate-600">Loading history...</section>
        ) : error ? (
          <section className="card p-8 text-lg text-rose-600">{error}</section>
        ) : !activeSnapshot || !selectedTeam ? (
          <section className="card p-8 text-lg text-slate-600">
            No snapshot data is available yet.
          </section>
        ) : (
          <div className="space-y-6">
            <SummaryCards snapshot={activeSnapshot} />
            <AutomationStatusCard
              latestSnapshot={latestSnapshot ?? activeSnapshot}
              currentDate={todayIso}
              automationStatus={automationStatus}
            />

            <section className="space-y-6">
              <SectionHeader
                eyebrow="Match Centre"
                title="Fixtures, Results, and Group Context"
                description="The tournament flow is grouped together here, so upcoming matches, completed games, table position, and the selected team's schedule all sit in one reading sequence."
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <ScheduleSection matches={scheduleMatches} />
                </div>
                <div>
                  <CompletedMatchesSection matches={scheduleMatches} />
                </div>
              </div>

              <GroupStandingsSection standings={groupStandings} selectedTeamIso={selectedTeam.iso3} />
            </section>

            <div ref={exportRef} className="space-y-6">
              <section className="space-y-6">
                <SectionHeader
                  eyebrow="Team Focus"
                  title="Selected Team and Comparison View"
                  description="The selected team now anchors the center of the dashboard, while recent form and comparison tools are grouped into cleaner rows so the page feels more deliberate."
                />

                <section className="card p-6">
                  <SectionHeader
                    eyebrow="Controls"
                    title="Snapshot Controls"
                    description="Choose the date, filter the field, switch the color mode, and export the current dashboard view right before diving into the selected team's details."
                  />

                  <div className="mt-6">
                    <FilterBar
                      confederations={confederations}
                      groups={groups}
                      teams={activeSnapshot.teams}
                      snapshotDates={snapshotDates}
                      selectedDate={activeSnapshot.metadata.snapshotDate}
                      currentDate={todayIso}
                      confederation={confederation}
                      group={group}
                      scope={scope}
                      selectedTeamIso={selectedTeam.iso3}
                      mode={mode}
                      onDateChange={handleDateChange}
                      onConfederationChange={setConfederation}
                      onGroupChange={setGroup}
                      onScopeChange={setScope}
                      onTeamChange={setSelectedTeamIso}
                      onModeChange={setMode}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      onClick={() => downloadTeamsCsv(activeSnapshot.teams)}
                    >
                      Download CSV
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                      onClick={() =>
                        downloadNodeAsPng(exportRef.current, "world-cup-2026-dashboard.png")
                      }
                    >
                      Download PNG Screenshot
                    </button>
                  </div>
                </section>

                <WorldMap
                  teams={filteredBaseTeams}
                  mode={mode}
                  snapshotDate={activeSnapshot.metadata.snapshotDate}
                  selectedTeamIso={selectedTeam.iso3}
                  onSelectTeam={setSelectedTeamIso}
                />

                <div className="grid gap-6 xl:grid-cols-2">
                  <SelectedTeamSummaryCard team={selectedTeam} snapshot={activeSnapshot} />
                  <SelectedTeamScheduleSection matches={scheduleMatches} selectedTeam={selectedTeam} />
                </div>

                <div className="mx-auto w-full max-w-5xl">
                  <RecentResultsSection matches={scheduleMatches} selectedTeam={selectedTeam} />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <StageTableCard team={selectedTeam} />
                  <SnapshotComparisonCard
                    selectedTeam={selectedTeam}
                    snapshot={activeSnapshot}
                    previousSnapshot={previousSnapshot}
                  />
                </div>

                <TeamComparisonCard
                  selectedTeam={selectedTeam}
                  compareTeamIso={compareTeamIso}
                  onCompareTeamChange={setCompareTeamIso}
                  snapshot={activeSnapshot}
                />
              </section>

              <section className="space-y-6">
                <SectionHeader
                  eyebrow="Analytics"
                  title="Trend and Probability Breakdown"
                  description="Historical movement, favorite ordering, and the full filtered field are grouped below the map so the page moves naturally from overview into deeper analytical detail."
                />

                <HistoryTrendChart
                  snapshots={snapshots}
                  selectedTeam={selectedTeam}
                  compareTeamIso={compareTeamIso}
                />
                <ProbabilityBarChart
                  teams={filteredTeams}
                  selectedTeamIso={selectedTeam.iso3}
                  onSelectTeam={setSelectedTeamIso}
                />
              </section>
            </div>

            <TeamsTable
              teams={filteredTeams}
              selectedTeamIso={selectedTeam.iso3}
              onSelectTeam={setSelectedTeamIso}
            />

            <section className="card p-8">
              <p className="chip inline-flex">Methodology</p>
              <h2 className="mt-4 text-2xl font-semibold text-ink">How the upgraded model works</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">1. Bookmaker odds drive title chances</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Title markets are converted from American odds to implied probability using the standard positive and negative odds formulas.
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">2. Normalize to 100%</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    All implied title probabilities are normalized so the entire 48-team field sums to exactly 100%, making side-by-side comparisons cleaner.
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">3. Save a daily snapshot</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Each daily refresh appends or replaces the selected date in the history file, which powers the date switcher and the trend chart.
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">4. Model stage progression</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Group-advancement odds come directly from market prices. Later knockout-stage probabilities are estimated from the relationship between group advancement and tournament-winning probability.
                  </p>
                </article>
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                FIFA ranking remains contextual only. The map can also switch to a ranking color mode, but the main ordering and historical trend logic are all based on bookmaker-derived title probability snapshots.
              </div>
            </section>

            <footer className="pb-2 pt-1">
              <VisitCounter />
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
