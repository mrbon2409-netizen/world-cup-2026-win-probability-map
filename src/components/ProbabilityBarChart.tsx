import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "../lib/probability";
import type { TeamSnapshot } from "../types/worldCup";

interface ProbabilityBarChartProps {
  teams: TeamSnapshot[];
  selectedTeamIso: string | null;
  onSelectTeam: (iso3: string) => void;
}

export function ProbabilityBarChart({
  teams,
  selectedTeamIso,
  onSelectTeam,
}: ProbabilityBarChartProps) {
  const topTeams = [...teams]
    .sort((a, b) => b.normalizedProbability - a.normalizedProbability)
    .slice(0, 15);

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="chip inline-flex">Top 15</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            Win Probability Leaders
          </h2>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-500">
          Click a bar to sync the selected team with the map, history trend, and stage table.
        </p>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topTeams} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
            <XAxis dataKey="team" angle={-28} textAnchor="end" interval={0} height={86} />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip
              formatter={(value: number) => formatPercent(value)}
              contentStyle={{ borderRadius: 18, borderColor: "#dbe4f0" }}
            />
            <Bar
              dataKey="normalizedProbability"
              radius={[10, 10, 0, 0]}
              onClick={(entry) => onSelectTeam(entry.iso3)}
            >
              {topTeams.map((team, index) => (
                <Cell
                  key={team.team}
                  cursor="pointer"
                  fill={
                    team.iso3 === selectedTeamIso
                      ? "#f59e0b"
                      : index < 3
                        ? "#0f766e"
                        : index < 8
                          ? "#0ea5e9"
                          : "#93c5fd"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
