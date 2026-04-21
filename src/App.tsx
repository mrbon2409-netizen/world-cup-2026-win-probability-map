import { useEffect, useMemo, useRef, useState } from "react";
import { AutomationStatusCard } from "./components/AutomationStatusCard";
import { SnapshotComparisonCard, TeamComparisonCard } from "./components/ComparisonPanel";
import { FilterBar } from "./components/FilterBar";
import { GroupStandingsSection } from "./components/GroupStandingsSection";
import { HistoryTrendChart } from "./components/HistoryTrendChart";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { ProbabilityBarChart } from "./components/ProbabilityBarChart";
import { CompletedMatchesSection, RecentResultsSection } from "./components/ResultsSection";
import { ScheduleSection } from "./components/ScheduleSection";
import { SelectedTeamSummaryCard, StageTableCard } from "./components/SelectedTeamPanel";
import { SelectedTeamScheduleSection } from "./components/SelectedTeamScheduleSection";
import { SideBanner } from "./components/SideBanner";
import { SummaryCards } from "./components/SummaryCards";
import { TeamsTable } from "./components/TeamsTable";
import { VisitCounter } from "./components/VisitCounter";
import { WorldMap } from "./components/WorldMap";
import { useAutomationStatus } from "./hooks/useAutomationStatus";
import { useLatestSnapshot, useWorldCupHistory } from "./hooks/useWorldCupHistory";
import { downloadNodeAsPng, downloadTeamsCsv } from "./lib/export";
import { copy, detectPreferredLanguage } from "./lib/i18n";
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
  const [language, setLanguage] = useState(detectPreferredLanguage());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTeamIso, setSelectedTeamIso] = useState<string | null>(null);
  const [compareTeamIso, setCompareTeamIso] = useState<string | null>(null);
  const [confederation, setConfederation] = useState("all");
  const [group, setGroup] = useState("all");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [mode, setMode] = useState<MetricMode>("normalizedProbability");
  const exportRef = useRef<HTMLDivElement | null>(null);
  const t = copy[language];

  const quickLinks = [
    { label: t.nav.matchCentre, href: "#match-centre" },
    { label: t.nav.groupStandings, href: "#group-standings" },
    { label: t.nav.teamFocus, href: "#team-focus" },
    { label: t.nav.analytics, href: "#analytics" },
  ];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.seo.title;

    const setMeta = (name: string, content: string) => {
      let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMeta("description", t.seo.description);
    setMeta("keywords", t.seo.keywords);
  }, [language, t.seo.description, t.seo.keywords, t.seo.title]);

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
      <SideBanner language={language} onLanguageChange={setLanguage} />
      <nav
        aria-label="Quick section navigation"
        className="fixed inset-x-4 top-4 z-50 flex justify-center lg:inset-x-auto lg:right-6 lg:justify-end"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/92 px-3 py-2 shadow-lg shadow-slate-200/60 backdrop-blur">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

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
              <p className="chip inline-flex">{t.header.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                {t.header.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {t.header.description}
              </p>
            </div>

            {activeSnapshot ? (
              <div className="rounded-3xl border border-teal-100 bg-teal-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  {t.header.lastSnapshot}
                </p>
                <p className="mt-2 text-lg font-semibold text-teal-950">
                  {activeSnapshot.metadata.snapshotDate}
                </p>
                <p className="mt-1 text-sm text-teal-800">
                  {activeSnapshot.metadata.totalTeams} {t.header.teamsSuffix}
                </p>
              </div>
            ) : null}
          </div>
        </header>

        {loading ? (
          <section className="card p-8 text-lg text-slate-600">{t.header.loading}</section>
        ) : error ? (
          <section className="card p-8 text-lg text-rose-600">{error}</section>
        ) : !activeSnapshot || !selectedTeam ? (
          <section className="card p-8 text-lg text-slate-600">
            {t.header.noData}
          </section>
        ) : (
          <div className="space-y-6">
            <SummaryCards snapshot={activeSnapshot} labels={t.summary} />
            <AutomationStatusCard
              latestSnapshot={latestSnapshot ?? activeSnapshot}
              currentDate={todayIso}
              automationStatus={automationStatus}
              labels={t.automation}
              language={language}
            />

            <section id="match-centre" className="scroll-mt-24 space-y-6">
              <SectionHeader
                eyebrow={t.sections.matchCentreEyebrow}
                title={t.sections.matchCentreTitle}
                description={t.sections.matchCentreDescription}
              />

              <div className="space-y-6">
                <ScheduleSection matches={scheduleMatches} labels={t.schedule} />
                <CompletedMatchesSection matches={scheduleMatches} labels={t.schedule} />
              </div>

              <div id="group-standings" className="scroll-mt-24">
                <GroupStandingsSection
                  standings={groupStandings}
                  selectedTeamIso={selectedTeam.iso3}
                  labels={t.groupStandings}
                />
              </div>
            </section>

            <div ref={exportRef} className="space-y-6">
              <section id="team-focus" className="scroll-mt-24 space-y-6">
                <SectionHeader
                  eyebrow={t.sections.teamFocusEyebrow}
                  title={t.sections.teamFocusTitle}
                  description={t.sections.teamFocusDescription}
                />

                <section className="card p-6">
                  <SectionHeader
                    eyebrow={t.controls.eyebrow}
                    title={t.controls.title}
                    description={t.controls.description}
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
                      labels={t.controls}
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
                      {t.controls.downloadCsv}
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                      onClick={() =>
                        downloadNodeAsPng(exportRef.current, "world-cup-2026-dashboard.png")
                      }
                    >
                      {t.controls.downloadPng}
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
                  <SelectedTeamSummaryCard
                    team={selectedTeam}
                    snapshot={activeSnapshot}
                    labels={t.selectedTeam}
                  />
                  <SelectedTeamScheduleSection
                    matches={scheduleMatches}
                    selectedTeam={selectedTeam}
                    labels={t.schedule}
                  />
                </div>

                <div className="mx-auto w-full max-w-5xl">
                  <RecentResultsSection
                    matches={scheduleMatches}
                    selectedTeam={selectedTeam}
                    labels={t.schedule}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <StageTableCard team={selectedTeam} labels={t.selectedTeam} />
                  <SnapshotComparisonCard
                    selectedTeam={selectedTeam}
                    snapshot={activeSnapshot}
                    previousSnapshot={previousSnapshot}
                    labels={t.comparison}
                  />
                </div>

                <TeamComparisonCard
                  selectedTeam={selectedTeam}
                  compareTeamIso={compareTeamIso}
                  onCompareTeamChange={setCompareTeamIso}
                  snapshot={activeSnapshot}
                  labels={t.comparison}
                />
              </section>

              <section id="analytics" className="scroll-mt-24 space-y-6">
                <SectionHeader
                  eyebrow={t.sections.analyticsEyebrow}
                  title={t.sections.analyticsTitle}
                  description={t.sections.analyticsDescription}
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

              <div className="flex justify-end">
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {t.language.label}
                  </span>
                  <LanguageSwitcher language={language} onChange={setLanguage} />
                </div>
              </div>
            </div>

            <TeamsTable
              teams={filteredTeams}
              selectedTeamIso={selectedTeam.iso3}
              onSelectTeam={setSelectedTeamIso}
            />

            <section className="card p-8">
              <p className="chip inline-flex">{t.sections.methodologyEyebrow}</p>
              <h2 className="mt-4 text-2xl font-semibold text-ink">{t.sections.methodologyTitle}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">{t.methodology.card1Title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t.methodology.card1Body}
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">{t.methodology.card2Title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t.methodology.card2Body}
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">{t.methodology.card3Title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t.methodology.card3Body}
                  </p>
                </article>
                <article className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-ink">{t.methodology.card4Title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t.methodology.card4Body}
                  </p>
                </article>
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                {t.methodology.footer}
              </div>
            </section>

            <footer className="pb-2 pt-1">
              <VisitCounter labels={t.counter} />
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
