import { useMemo, useState } from "react";
import { formatAmericanOdds, formatPercent } from "../lib/probability";
import type { TeamSnapshot } from "../types/worldCup";

type SortKey =
  | "team"
  | "group"
  | "confederation"
  | "oddsAmerican"
  | "groupAdvanceProbability"
  | "normalizedProbability"
  | "fifaRank";

interface TeamsTableProps {
  teams: TeamSnapshot[];
  selectedTeamIso: string | null;
  onSelectTeam: (iso3: string) => void;
}

export function TeamsTable({ teams, selectedTeamIso, onSelectTeam }: TeamsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("normalizedProbability");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedTeams = useMemo(() => {
    const sorted = [...teams].sort((a, b) => {
      const aValue = a[sortKey] ?? (sortKey === "fifaRank" ? Number.MAX_SAFE_INTEGER : "");
      const bValue = b[sortKey] ?? (sortKey === "fifaRank" ? Number.MAX_SAFE_INTEGER : "");

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }

      return Number(aValue) - Number(bValue);
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [sortDirection, sortKey, teams]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "team" || nextKey === "group" ? "asc" : "desc");
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="chip inline-flex">Sortable Table</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink">Full 48-Team Snapshot</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                ["team", "Team"],
                ["group", "Group"],
                ["confederation", "Confederation"],
                ["oddsAmerican", "Title odds"],
                ["groupAdvanceProbability", "Advance"],
                ["normalizedProbability", "Win prob"],
                ["fifaRank", "FIFA rank"],
              ].map(([key, label]) => (
                <th key={key} className="px-6 py-4 font-semibold">
                  <button type="button" onClick={() => handleSort(key as SortKey)}>
                    {label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr
                key={team.iso3}
                className={`cursor-pointer transition ${
                  team.iso3 === selectedTeamIso
                    ? "bg-amber-50"
                    : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/70"
                }`}
                onClick={() => onSelectTeam(team.iso3)}
              >
                <td className="px-6 py-4 font-medium text-ink">{team.team}</td>
                <td className="px-6 py-4">{team.group}</td>
                <td className="px-6 py-4">{team.confederation}</td>
                <td className="px-6 py-4">{formatAmericanOdds(team.oddsAmerican)}</td>
                <td className="px-6 py-4">{formatPercent(team.groupAdvanceProbability)}</td>
                <td className="px-6 py-4 font-semibold text-teal-700">
                  {formatPercent(team.normalizedProbability)}
                </td>
                <td className="px-6 py-4">{team.fifaRank ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
