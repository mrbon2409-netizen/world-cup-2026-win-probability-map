import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "../lib/probability";
import type { SnapshotRecord, TeamSnapshot } from "../types/worldCup";

interface HistoryTrendChartProps {
  snapshots: SnapshotRecord[];
  selectedTeam: TeamSnapshot;
  compareTeamIso: string | null;
}

const palette = ["#f59e0b", "#0f766e", "#0ea5e9", "#2563eb", "#8b5cf6"];

export function HistoryTrendChart({
  snapshots,
  selectedTeam,
  compareTeamIso,
}: HistoryTrendChartProps) {
  const compareTeamName =
    compareTeamIso
      ? snapshots[snapshots.length - 1]?.teams.find((team) => team.iso3 === compareTeamIso)?.team ?? null
      : null;

  const comparisonTeams = snapshots[snapshots.length - 1]?.teams
    .slice()
    .sort((a, b) => b.normalizedProbability - a.normalizedProbability)
    .map((team) => team.team)
    .filter((team, index) =>
      team === selectedTeam.team ||
      team === compareTeamName ||
      index < 4,
    )
    .filter((team, index, arr) => arr.indexOf(team) === index)
    .slice(0, 6);

  const data = snapshots.map((snapshot) => {
    const row: Record<string, string | number> = { date: snapshot.metadata.snapshotDate };
    comparisonTeams?.forEach((teamName) => {
      const team = snapshot.teams.find((item) => item.team === teamName);
      row[teamName] = team?.normalizedProbability ?? 0;
    });
    return row;
  });

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="chip inline-flex">Daily History</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            Title Probability Over Time
          </h2>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-500">
          This chart will continue to grow as the automation records a fresh snapshot every day through the tournament.
        </p>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip formatter={(value: number) => formatPercent(value)} />
            <Legend />
            {comparisonTeams?.map((teamName, index) => (
              <Line
                key={teamName}
                type="monotone"
                dataKey={teamName}
                stroke={palette[index % palette.length]}
                strokeWidth={teamName === selectedTeam.team ? 4 : teamName === compareTeamName ? 3.25 : 2.25}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
