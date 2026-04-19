import type { SnapshotRecord, TeamSnapshot } from "../types/worldCup";

export function americanOddsToImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  }

  return Math.abs(odds) / (Math.abs(odds) + 100);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatAmericanOdds(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function getFilteredTeams(
  teams: TeamSnapshot[],
  confederation: string,
  group: string,
) {
  return teams.filter((team) => {
    const matchesConfederation =
      confederation === "all" || team.confederation === confederation;
    const matchesGroup = group === "all" || team.group === group;
    return matchesConfederation && matchesGroup;
  });
}

export function getTeamByIso(teams: TeamSnapshot[], iso3: string | null) {
  if (!iso3) {
    return null;
  }

  return teams.find((team) => team.iso3 === iso3) ?? null;
}

export function getSnapshotByDate(
  snapshots: SnapshotRecord[],
  snapshotDate: string,
): SnapshotRecord | null {
  return snapshots.find((snapshot) => snapshot.metadata.snapshotDate === snapshotDate) ?? null;
}

export function getPreviousSnapshot(
  snapshots: SnapshotRecord[],
  snapshotDate: string,
): SnapshotRecord | null {
  const currentIndex = snapshots.findIndex(
    (snapshot) => snapshot.metadata.snapshotDate === snapshotDate,
  );

  if (currentIndex <= 0) {
    return null;
  }

  return snapshots[currentIndex - 1] ?? null;
}

export function sortTeamsByProbability(teams: TeamSnapshot[]) {
  return [...teams].sort(
    (a, b) => b.normalizedProbability - a.normalizedProbability,
  );
}

export function applyScopeFilter(teams: TeamSnapshot[], scope: "all" | "top10" | "top20") {
  const sorted = sortTeamsByProbability(teams);
  if (scope === "top10") {
    return sorted.slice(0, 10);
  }
  if (scope === "top20") {
    return sorted.slice(0, 20);
  }
  return sorted;
}

export function formatDeltaPercent(current: number, previous: number): string {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(2)} pts`;
}

export function getSnapshotFreshness(snapshotDate: string, currentDate: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const snapshot = new Date(`${snapshotDate}T00:00:00`);
  const current = new Date(`${currentDate}T00:00:00`);
  const diffDays = Math.max(0, Math.round((current.getTime() - snapshot.getTime()) / msPerDay));

  if (diffDays === 0) {
    return {
      label: "Daily automation is up to date",
      tone: "fresh" as const,
      detail: "Today's snapshot is already recorded.",
    };
  }

  if (diffDays === 1) {
    return {
      label: "Snapshot is 1 day behind",
      tone: "warning" as const,
      detail: "Run today's refresh to keep the history current.",
    };
  }

  return {
    label: `Snapshot is ${diffDays} days behind`,
    tone: "stale" as const,
    detail: "The automation or manual refresh has not written a recent snapshot yet.",
  };
}
