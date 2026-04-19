import type { GroupStanding, MatchStatus, ScheduleMatch, TeamSnapshot } from "../types/worldCup";

const HOST_CITIES = [
  "Toronto",
  "Vancouver",
  "Mexico City",
  "Guadalajara",
  "Monterrey",
  "Los Angeles",
  "Dallas",
  "Houston",
  "Atlanta",
  "Miami",
  "New York / New Jersey",
  "Seattle",
  "Kansas City",
  "Boston",
  "Philadelphia",
  "San Francisco Bay Area",
];

const ROUND_ROBIN_TEMPLATE: Array<Array<[number, number]>> = [
  [
    [0, 3],
    [1, 2],
  ],
  [
    [0, 2],
    [3, 1],
  ],
  [
    [0, 1],
    [2, 3],
  ],
];

function getMatchStatus(snapshotDate: string, kickoffDate: string): MatchStatus {
  if (snapshotDate > kickoffDate) {
    return "completed";
  }

  if (snapshotDate === kickoffDate) {
    return "today";
  }

  return "upcoming";
}

function buildKickoffDate(groupIndex: number, roundIndex: number, slotIndex: number) {
  const groupWindowOffset = Math.floor(groupIndex / 2);
  const stageStart = new Date(Date.UTC(2026, 5, 11 + groupWindowOffset + roundIndex * 4));
  stageStart.setUTCHours(slotIndex === 0 ? 17 : 21, 0, 0, 0);
  return stageStart;
}

function formatKickoffLabel(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function seededNumber(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash / 4294967295;
}

function generateScore(matchId: string, teamA: TeamSnapshot, teamB: TeamSnapshot, status: MatchStatus) {
  if (status !== "completed") {
    return {
      scoreA: null,
      scoreB: null,
    };
  }

  const strengthA = Math.max(teamA.normalizedProbability, 0.002);
  const strengthB = Math.max(teamB.normalizedProbability, 0.002);
  const ratioA = strengthA / (strengthA + strengthB);
  const ratioB = 1 - ratioA;
  const totalGoals = 1 + Math.floor(seededNumber(`${matchId}:goals`) * 5);
  const bias = ratioA - ratioB;
  const adjustment =
    bias > 0.12 ? 1 : bias < -0.12 ? -1 : 0;
  let scoreA = Math.max(
    0,
    Math.round(totalGoals * ratioA + adjustment + seededNumber(`${matchId}:a`) * 0.9 - 0.45),
  );
  let scoreB = Math.max(
    0,
    Math.round(totalGoals * ratioB - adjustment + seededNumber(`${matchId}:b`) * 0.9 - 0.45),
  );

  if (scoreA === 0 && scoreB === 0) {
    if (ratioA >= ratioB) {
      scoreA = 1;
    } else {
      scoreB = 1;
    }
  }

  return {
    scoreA,
    scoreB,
  };
}

export function buildGroupStageSchedule(teams: TeamSnapshot[], snapshotDate: string): ScheduleMatch[] {
  const teamsByGroup = new Map<string, TeamSnapshot[]>();

  teams.forEach((team) => {
    const list = teamsByGroup.get(team.group) ?? [];
    list.push(team);
    teamsByGroup.set(team.group, list);
  });

  return [...teamsByGroup.entries()]
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .flatMap(([group, groupTeams], groupIndex) => {
      const orderedTeams = [...groupTeams].sort((a, b) => a.team.localeCompare(b.team));

      if (orderedTeams.length !== 4) {
        return [];
      }

      return ROUND_ROBIN_TEMPLATE.flatMap((round, roundIndex) =>
        round.map(([teamAIndex, teamBIndex], slotIndex) => {
          const kickoff = buildKickoffDate(groupIndex, roundIndex, slotIndex);
          const kickoffDate = kickoff.toISOString().slice(0, 10);
          const venue = HOST_CITIES[(groupIndex * 3 + roundIndex + slotIndex) % HOST_CITIES.length];
          const status = getMatchStatus(snapshotDate, kickoffDate);
          const score = generateScore(
            `${group}-${roundIndex + 1}-${slotIndex + 1}`,
            orderedTeams[teamAIndex],
            orderedTeams[teamBIndex],
            status,
          );

          return {
            id: `${group}-${roundIndex + 1}-${slotIndex + 1}`,
            stage: "group",
            group,
            matchday: roundIndex + 1,
            kickoffDate,
            kickoffLabel: formatKickoffLabel(kickoff),
            venue,
            teamA: orderedTeams[teamAIndex],
            teamB: orderedTeams[teamBIndex],
            status,
            scoreA: score.scoreA,
            scoreB: score.scoreB,
          } satisfies ScheduleMatch;
        }),
      );
    })
    .sort((a, b) => {
      if (a.kickoffDate !== b.kickoffDate) {
        return a.kickoffDate.localeCompare(b.kickoffDate);
      }

      return a.kickoffLabel.localeCompare(b.kickoffLabel);
    });
}

export function getUpcomingMatches(matches: ScheduleMatch[], limit = 10) {
  const upcoming = matches.filter((match) => match.status !== "completed");
  return (upcoming.length ? upcoming : matches).slice(0, limit);
}

export function getSelectedTeamMatches(matches: ScheduleMatch[], iso3: string) {
  return matches.filter((match) => match.teamA.iso3 === iso3 || match.teamB.iso3 === iso3);
}

export function getCompletedMatches(matches: ScheduleMatch[], limit = 8) {
  return matches
    .filter((match) => match.status === "completed")
    .slice()
    .sort((a, b) => {
      if (a.kickoffDate !== b.kickoffDate) {
        return b.kickoffDate.localeCompare(a.kickoffDate);
      }

      return b.kickoffLabel.localeCompare(a.kickoffLabel);
    })
    .slice(0, limit);
}

export function getRecentSelectedTeamResults(matches: ScheduleMatch[], iso3: string, limit = 3) {
  return getCompletedMatches(getSelectedTeamMatches(matches, iso3), limit);
}

export function buildGroupStandings(teams: TeamSnapshot[], matches: ScheduleMatch[]) {
  const standingMap = new Map<string, GroupStanding>();

  teams.forEach((team) => {
    standingMap.set(team.iso3, {
      group: team.group,
      team,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    });
  });

  matches
    .filter((match) => match.status === "completed" && match.scoreA !== null && match.scoreB !== null)
    .forEach((match) => {
      const standingA = standingMap.get(match.teamA.iso3);
      const standingB = standingMap.get(match.teamB.iso3);

      if (!standingA || !standingB) {
        return;
      }

      standingA.played += 1;
      standingB.played += 1;
      standingA.goalsFor += match.scoreA!;
      standingA.goalsAgainst += match.scoreB!;
      standingB.goalsFor += match.scoreB!;
      standingB.goalsAgainst += match.scoreA!;

      if (match.scoreA! > match.scoreB!) {
        standingA.wins += 1;
        standingA.points += 3;
        standingA.form.push("W");
        standingB.losses += 1;
        standingB.form.push("L");
      } else if (match.scoreA! < match.scoreB!) {
        standingB.wins += 1;
        standingB.points += 3;
        standingB.form.push("W");
        standingA.losses += 1;
        standingA.form.push("L");
      } else {
        standingA.draws += 1;
        standingB.draws += 1;
        standingA.points += 1;
        standingB.points += 1;
        standingA.form.push("D");
        standingB.form.push("D");
      }

      standingA.goalDifference = standingA.goalsFor - standingA.goalsAgainst;
      standingB.goalDifference = standingB.goalsFor - standingB.goalsAgainst;
    });

  return [...standingMap.values()]
    .sort((a, b) => {
      if (a.group !== b.group) {
        return a.group.localeCompare(b.group);
      }

      if (a.points !== b.points) {
        return b.points - a.points;
      }

      if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      if (a.goalsFor !== b.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      return a.team.team.localeCompare(b.team.team);
    });
}
