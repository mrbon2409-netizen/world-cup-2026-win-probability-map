export type MetricMode = "normalizedProbability" | "fifaRank";
export type ScopeFilter = "all" | "top10" | "top20";

export interface StageProbabilities {
  roundOf32: number;
  roundOf16: number;
  quarterfinal: number;
  semifinal: number;
  final: number;
  champion: number;
}

export interface TeamSnapshot {
  team: string;
  group: string;
  confederation: string;
  oddsAmerican: number;
  groupAdvanceOddsAmerican: number;
  fifaRank: number | null;
  iso3: string;
  impliedProbability: number;
  normalizedProbability: number;
  groupAdvanceProbability: number;
  stages: StageProbabilities;
}

export interface SnapshotMetadata {
  snapshotDate: string;
  lastUpdated: string;
  totalTeams: number;
  titleOddsLabel: string;
  groupAdvanceLabel: string;
  rankingLabel: string;
  titleOddsSourceUrl: string;
  groupBreakdownSourceUrl: string;
}

export interface SnapshotRecord {
  metadata: SnapshotMetadata;
  teams: TeamSnapshot[];
}

export interface SnapshotHistory {
  snapshots: SnapshotRecord[];
}

export type AutomationHealth = "fresh" | "warning" | "stale";
export type AutomationRunState = "success" | "warning" | "error";

export interface AutomationStatus {
  automationEnabled: boolean;
  timezone: string;
  scheduleLabel: string;
  lastAutoUpdateAt: string;
  lastSuccessfulSnapshotDate: string;
  nextScheduledUpdateAt: string;
  dataSourceStatus: AutomationHealth;
  dataSourceLabel: string;
  runMode: string;
  buildTarget: string;
  lastBuildStatus: AutomationRunState;
  note?: string;
}

export interface TeamTrendPoint {
  date: string;
  normalizedProbability: number;
  impliedProbability: number;
  fifaRank: number | null;
  team: string;
}

export interface ComparisonMetric {
  label: string;
  selectedValue: string;
  comparisonValue: string;
  delta?: string;
  selectedHighlight?: boolean;
  comparisonHighlight?: boolean;
}

export type MatchStatus = "completed" | "today" | "upcoming";

export interface ScheduleMatch {
  id: string;
  stage: "group";
  group: string;
  matchday: number;
  kickoffDate: string;
  kickoffUtc: string;
  kickoffLabel: string;
  venue: string;
  hostTimeZone: string;
  teamA: TeamSnapshot;
  teamB: TeamSnapshot;
  status: MatchStatus;
  scoreA: number | null;
  scoreB: number | null;
}

export interface GroupStanding {
  group: string;
  team: TeamSnapshot;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
}
