import { getSelectedTeamMatches } from "../lib/schedule";
import type { ScheduleMatch, TeamSnapshot } from "../types/worldCup";
import { MatchRow } from "./ScheduleSection";

interface SelectedTeamScheduleSectionProps {
  matches: ScheduleMatch[];
  selectedTeam: TeamSnapshot;
}

export function SelectedTeamScheduleSection({
  matches,
  selectedTeam,
}: SelectedTeamScheduleSectionProps) {
  const selectedTeamMatches = getSelectedTeamMatches(matches, selectedTeam.iso3);

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">Selected Team Schedule</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{selectedTeam.team} Match Calendar</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          This panel tracks the selected team's three group-stage fixtures in the current tournament layout.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {selectedTeamMatches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
