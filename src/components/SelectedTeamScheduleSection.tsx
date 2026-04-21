import { getSelectedTeamMatches } from "../lib/schedule";
import type { AppCopy } from "../lib/i18n";
import type { ScheduleMatch, TeamSnapshot } from "../types/worldCup";
import { MatchRow } from "./ScheduleSection";

interface SelectedTeamScheduleSectionProps {
  matches: ScheduleMatch[];
  selectedTeam: TeamSnapshot;
  labels: AppCopy["schedule"];
}

export function SelectedTeamScheduleSection({
  matches,
  selectedTeam,
  labels,
}: SelectedTeamScheduleSectionProps) {
  const selectedTeamMatches = getSelectedTeamMatches(matches, selectedTeam.iso3);

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="chip inline-flex">{labels.selectedScheduleEyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">{selectedTeam.team} {labels.matchCalendar}</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          {labels.selectedScheduleDescription}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {selectedTeamMatches.map((match) => (
          <MatchRow key={match.id} match={match} labels={labels} />
        ))}
      </div>
    </section>
  );
}
