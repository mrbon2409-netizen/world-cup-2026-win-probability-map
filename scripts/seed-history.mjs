import {
  currentOutputPath,
  deterministicNoise,
  historyOutputPath,
  readJson,
  toCurrentSnapshot,
  normalizeTitleProbabilities,
  masterPath,
  writeJson,
} from "./shared-data-utils.mjs";

const source = (() => {
  try {
    return readJson(currentOutputPath);
  } catch {
    return toCurrentSnapshot(readJson(masterPath));
  }
})();

const latestDate = new Date(`${source.metadata.snapshotDate}T00:00:00`);
const dayCount = 24;
const snapshots = [];

for (let index = dayCount - 1; index >= 0; index -= 1) {
  const currentDate = new Date(latestDate);
  currentDate.setDate(latestDate.getDate() - index);
  const dateLabel = currentDate.toISOString().slice(0, 10);

  const teams = source.teams.map((team, teamIndex) => {
    if (index === 0) {
      return {
        team: team.team,
        group: team.group,
        confederation: team.confederation,
        oddsAmerican: team.oddsAmerican,
        groupAdvanceOddsAmerican: team.groupAdvanceOddsAmerican,
        fifaRank: team.fifaRank,
        iso3: team.iso3,
      };
    }

    const titleSwing = (deterministicNoise(teamIndex + index * 17) - 0.5) * 0.18;
    const stageSwing = (deterministicNoise(teamIndex * 19 + index * 7) - 0.5) * 0.14;
    const titleFactor = 1 + titleSwing;
    const stageFactor = 1 + stageSwing;

    return {
      team: team.team,
      group: team.group,
      confederation: team.confederation,
      oddsAmerican: Math.max(300, Math.round(team.oddsAmerican / titleFactor / 50) * 50),
      groupAdvanceOddsAmerican: Math.round(team.groupAdvanceOddsAmerican / stageFactor),
      fifaRank: team.fifaRank,
      iso3: team.iso3,
    };
  });

  const normalizedTeams = normalizeTitleProbabilities(teams);
  snapshots.push({
    metadata: {
      ...source.metadata,
      snapshotDate: dateLabel,
      lastUpdated: dateLabel,
    },
    teams: normalizedTeams,
  });
}

writeJson(historyOutputPath, { snapshots });
console.log(`Seeded ${snapshots.length} snapshot days.`);
