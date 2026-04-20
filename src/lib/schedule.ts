import type { GroupStanding, MatchStatus, ScheduleMatch, TeamSnapshot } from "../types/worldCup";

type FixtureTimeZone =
  | "America/Toronto"
  | "America/Vancouver"
  | "America/Los_Angeles"
  | "America/Chicago"
  | "America/New_York"
  | "America/Mexico_City"
  | "America/Monterrey";

interface OfficialFixture {
  id: string;
  group: string;
  matchday: number;
  kickoffDate: string;
  kickoffLocalTime: string;
  hostTimeZone: FixtureTimeZone;
  stadium: string;
  city: string;
  teamAIso3: string;
  teamBIso3: string;
}

const UTC_OFFSETS: Record<FixtureTimeZone, string> = {
  "America/Toronto": "-04:00",
  "America/Vancouver": "-07:00",
  "America/Los_Angeles": "-07:00",
  "America/Chicago": "-05:00",
  "America/New_York": "-04:00",
  "America/Mexico_City": "-06:00",
  "America/Monterrey": "-06:00",
};

// Official FIFA 2026 group-stage pairings and host venues.
// We store host-local kickoff slots and convert them to the viewer's timezone in the UI.
const OFFICIAL_FIXTURES: OfficialFixture[] = [
  { id: "A-1-1", group: "A", matchday: 1, kickoffDate: "2026-06-11", kickoffLocalTime: "18:00", hostTimeZone: "America/Toronto", stadium: "Toronto Stadium", city: "Toronto", teamAIso3: "CZE", teamBIso3: "KOR" },
  { id: "A-1-2", group: "A", matchday: 1, kickoffDate: "2026-06-11", kickoffLocalTime: "21:00", hostTimeZone: "America/Mexico_City", stadium: "Mexico City Stadium", city: "Mexico City", teamAIso3: "MEX", teamBIso3: "ZAF" },
  { id: "B-1-1", group: "B", matchday: 1, kickoffDate: "2026-06-12", kickoffLocalTime: "18:00", hostTimeZone: "America/Toronto", stadium: "Toronto Stadium", city: "Toronto", teamAIso3: "CAN", teamBIso3: "BIH" },
  { id: "B-1-2", group: "B", matchday: 1, kickoffDate: "2026-06-12", kickoffLocalTime: "21:00", hostTimeZone: "America/Vancouver", stadium: "BC Place Vancouver", city: "Vancouver", teamAIso3: "QAT", teamBIso3: "CHE" },
  { id: "C-1-1", group: "C", matchday: 1, kickoffDate: "2026-06-13", kickoffLocalTime: "12:00", hostTimeZone: "America/Monterrey", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "SCT", teamBIso3: "HTI" },
  { id: "C-1-2", group: "C", matchday: 1, kickoffDate: "2026-06-13", kickoffLocalTime: "18:00", hostTimeZone: "America/Los_Angeles", stadium: "Los Angeles Stadium", city: "Los Angeles", teamAIso3: "BRA", teamBIso3: "MAR" },
  { id: "D-1-1", group: "D", matchday: 1, kickoffDate: "2026-06-13", kickoffLocalTime: "15:00", hostTimeZone: "America/Los_Angeles", stadium: "Los Angeles Stadium", city: "Los Angeles", teamAIso3: "AUS", teamBIso3: "USA" },
  { id: "D-1-2", group: "D", matchday: 1, kickoffDate: "2026-06-13", kickoffLocalTime: "21:00", hostTimeZone: "America/Mexico_City", stadium: "Guadalajara Stadium", city: "Guadalajara", teamAIso3: "PRY", teamBIso3: "TUR" },
  { id: "E-1-1", group: "E", matchday: 1, kickoffDate: "2026-06-14", kickoffLocalTime: "12:00", hostTimeZone: "America/New_York", stadium: "New York New Jersey Stadium", city: "New York / New Jersey", teamAIso3: "CUW", teamBIso3: "CIV" },
  { id: "E-1-2", group: "E", matchday: 1, kickoffDate: "2026-06-14", kickoffLocalTime: "15:00", hostTimeZone: "America/New_York", stadium: "Boston Stadium", city: "Boston", teamAIso3: "ECU", teamBIso3: "DEU" },
  { id: "F-1-1", group: "F", matchday: 1, kickoffDate: "2026-06-14", kickoffLocalTime: "18:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "NLD", teamBIso3: "JPN" },
  { id: "F-1-2", group: "F", matchday: 1, kickoffDate: "2026-06-14", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "SWE", teamBIso3: "TUN" },
  { id: "G-1-1", group: "G", matchday: 1, kickoffDate: "2026-06-15", kickoffLocalTime: "12:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "BEL", teamBIso3: "EGY" },
  { id: "G-1-2", group: "G", matchday: 1, kickoffDate: "2026-06-15", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "IRN", teamBIso3: "NZL" },
  { id: "H-1-1", group: "H", matchday: 1, kickoffDate: "2026-06-15", kickoffLocalTime: "18:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "SAU", teamBIso3: "URY" },
  { id: "H-1-2", group: "H", matchday: 1, kickoffDate: "2026-06-15", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "ESP", teamBIso3: "CPV" },
  { id: "I-1-1", group: "I", matchday: 1, kickoffDate: "2026-06-16", kickoffLocalTime: "12:00", hostTimeZone: "America/Monterrey", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "FRA", teamBIso3: "SEN" },
  { id: "I-1-2", group: "I", matchday: 1, kickoffDate: "2026-06-16", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "IRQ", teamBIso3: "NOR" },
  { id: "J-1-1", group: "J", matchday: 1, kickoffDate: "2026-06-16", kickoffLocalTime: "18:00", hostTimeZone: "America/New_York", stadium: "Atlanta Stadium", city: "Atlanta", teamAIso3: "ARG", teamBIso3: "DZA" },
  { id: "J-1-2", group: "J", matchday: 1, kickoffDate: "2026-06-16", kickoffLocalTime: "21:00", hostTimeZone: "America/Mexico_City", stadium: "Mexico City Stadium", city: "Mexico City", teamAIso3: "AUT", teamBIso3: "JOR" },
  { id: "K-1-1", group: "K", matchday: 1, kickoffDate: "2026-06-17", kickoffLocalTime: "12:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "COL", teamBIso3: "UZB" },
  { id: "K-1-2", group: "K", matchday: 1, kickoffDate: "2026-06-17", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "PRT", teamBIso3: "COD" },
  { id: "L-1-1", group: "L", matchday: 1, kickoffDate: "2026-06-17", kickoffLocalTime: "18:00", hostTimeZone: "America/Los_Angeles", stadium: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", teamAIso3: "PAN", teamBIso3: "GHA" },
  { id: "L-1-2", group: "L", matchday: 1, kickoffDate: "2026-06-17", kickoffLocalTime: "21:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "ENG", teamBIso3: "HRV" },

  { id: "A-2-1", group: "A", matchday: 2, kickoffDate: "2026-06-18", kickoffLocalTime: "12:00", hostTimeZone: "America/Mexico_City", stadium: "Guadalajara Stadium", city: "Guadalajara", teamAIso3: "MEX", teamBIso3: "KOR" },
  { id: "A-2-2", group: "A", matchday: 2, kickoffDate: "2026-06-18", kickoffLocalTime: "15:00", hostTimeZone: "America/Mexico_City", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "CZE", teamBIso3: "ZAF" },
  { id: "B-2-1", group: "B", matchday: 2, kickoffDate: "2026-06-18", kickoffLocalTime: "18:00", hostTimeZone: "America/Toronto", stadium: "Toronto Stadium", city: "Toronto", teamAIso3: "CAN", teamBIso3: "QAT" },
  { id: "B-2-2", group: "B", matchday: 2, kickoffDate: "2026-06-18", kickoffLocalTime: "21:00", hostTimeZone: "America/Vancouver", stadium: "BC Place Vancouver", city: "Vancouver", teamAIso3: "CHE", teamBIso3: "BIH" },
  { id: "C-2-1", group: "C", matchday: 2, kickoffDate: "2026-06-19", kickoffLocalTime: "12:00", hostTimeZone: "America/Mexico_City", stadium: "Guadalajara Stadium", city: "Guadalajara", teamAIso3: "SCT", teamBIso3: "MAR" },
  { id: "C-2-2", group: "C", matchday: 2, kickoffDate: "2026-06-19", kickoffLocalTime: "15:00", hostTimeZone: "America/Los_Angeles", stadium: "Los Angeles Stadium", city: "Los Angeles", teamAIso3: "BRA", teamBIso3: "HTI" },
  { id: "D-2-1", group: "D", matchday: 2, kickoffDate: "2026-06-19", kickoffLocalTime: "18:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "TUR", teamBIso3: "PRY" },
  { id: "D-2-2", group: "D", matchday: 2, kickoffDate: "2026-06-19", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "USA", teamBIso3: "AUS" },
  { id: "E-2-1", group: "E", matchday: 2, kickoffDate: "2026-06-20", kickoffLocalTime: "12:00", hostTimeZone: "America/New_York", stadium: "New York New Jersey Stadium", city: "New York / New Jersey", teamAIso3: "CUW", teamBIso3: "ECU" },
  { id: "E-2-2", group: "E", matchday: 2, kickoffDate: "2026-06-20", kickoffLocalTime: "15:00", hostTimeZone: "America/New_York", stadium: "Boston Stadium", city: "Boston", teamAIso3: "DEU", teamBIso3: "CIV" },
  { id: "F-2-1", group: "F", matchday: 2, kickoffDate: "2026-06-20", kickoffLocalTime: "18:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "NLD", teamBIso3: "SWE" },
  { id: "F-2-2", group: "F", matchday: 2, kickoffDate: "2026-06-20", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "TUN", teamBIso3: "JPN" },
  { id: "G-2-1", group: "G", matchday: 2, kickoffDate: "2026-06-21", kickoffLocalTime: "12:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "BEL", teamBIso3: "IRN" },
  { id: "G-2-2", group: "G", matchday: 2, kickoffDate: "2026-06-21", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "NZL", teamBIso3: "EGY" },
  { id: "H-2-1", group: "H", matchday: 2, kickoffDate: "2026-06-21", kickoffLocalTime: "18:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "ESP", teamBIso3: "SAU" },
  { id: "H-2-2", group: "H", matchday: 2, kickoffDate: "2026-06-21", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "URY", teamBIso3: "CPV" },
  { id: "I-2-1", group: "I", matchday: 2, kickoffDate: "2026-06-22", kickoffLocalTime: "12:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "NOR", teamBIso3: "SEN" },
  { id: "I-2-2", group: "I", matchday: 2, kickoffDate: "2026-06-22", kickoffLocalTime: "15:00", hostTimeZone: "America/Mexico_City", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "FRA", teamBIso3: "IRQ" },
  { id: "J-2-1", group: "J", matchday: 2, kickoffDate: "2026-06-22", kickoffLocalTime: "18:00", hostTimeZone: "America/New_York", stadium: "Atlanta Stadium", city: "Atlanta", teamAIso3: "JOR", teamBIso3: "DZA" },
  { id: "J-2-2", group: "J", matchday: 2, kickoffDate: "2026-06-22", kickoffLocalTime: "21:00", hostTimeZone: "America/Mexico_City", stadium: "Mexico City Stadium", city: "Mexico City", teamAIso3: "ARG", teamBIso3: "AUT" },
  { id: "K-2-1", group: "K", matchday: 2, kickoffDate: "2026-06-23", kickoffLocalTime: "12:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "PRT", teamBIso3: "UZB" },
  { id: "K-2-2", group: "K", matchday: 2, kickoffDate: "2026-06-23", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "COL", teamBIso3: "COD" },
  { id: "L-2-1", group: "L", matchday: 2, kickoffDate: "2026-06-23", kickoffLocalTime: "18:00", hostTimeZone: "America/Los_Angeles", stadium: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", teamAIso3: "ENG", teamBIso3: "GHA" },
  { id: "L-2-2", group: "L", matchday: 2, kickoffDate: "2026-06-23", kickoffLocalTime: "21:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "PAN", teamBIso3: "HRV" },

  { id: "A-3-1", group: "A", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "11:00", hostTimeZone: "America/Mexico_City", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "CZE", teamBIso3: "MEX" },
  { id: "A-3-2", group: "A", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "13:00", hostTimeZone: "America/Mexico_City", stadium: "Guadalajara Stadium", city: "Guadalajara", teamAIso3: "ZAF", teamBIso3: "KOR" },
  { id: "B-3-1", group: "B", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "15:00", hostTimeZone: "America/Toronto", stadium: "Toronto Stadium", city: "Toronto", teamAIso3: "CHE", teamBIso3: "CAN" },
  { id: "B-3-2", group: "B", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "17:00", hostTimeZone: "America/Vancouver", stadium: "BC Place Vancouver", city: "Vancouver", teamAIso3: "BIH", teamBIso3: "QAT" },
  { id: "C-3-1", group: "C", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "19:00", hostTimeZone: "America/Monterrey", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "SCT", teamBIso3: "BRA" },
  { id: "C-3-2", group: "C", matchday: 3, kickoffDate: "2026-06-24", kickoffLocalTime: "21:00", hostTimeZone: "America/Los_Angeles", stadium: "Los Angeles Stadium", city: "Los Angeles", teamAIso3: "MAR", teamBIso3: "HTI" },
  { id: "D-3-1", group: "D", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "11:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "TUR", teamBIso3: "USA" },
  { id: "D-3-2", group: "D", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "13:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "PRY", teamBIso3: "AUS" },
  { id: "E-3-1", group: "E", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "15:00", hostTimeZone: "America/New_York", stadium: "Boston Stadium", city: "Boston", teamAIso3: "ECU", teamBIso3: "DEU" },
  { id: "E-3-2", group: "E", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "17:00", hostTimeZone: "America/New_York", stadium: "New York New Jersey Stadium", city: "New York / New Jersey", teamAIso3: "CUW", teamBIso3: "CIV" },
  { id: "F-3-1", group: "F", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "19:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "TUN", teamBIso3: "NLD" },
  { id: "F-3-2", group: "F", matchday: 3, kickoffDate: "2026-06-25", kickoffLocalTime: "21:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "JPN", teamBIso3: "SWE" },
  { id: "G-3-1", group: "G", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "11:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "EGY", teamBIso3: "IRN" },
  { id: "G-3-2", group: "G", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "13:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "NZL", teamBIso3: "BEL" },
  { id: "H-3-1", group: "H", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Dallas Stadium", city: "Dallas", teamAIso3: "CPV", teamBIso3: "SAU" },
  { id: "H-3-2", group: "H", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "17:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "URY", teamBIso3: "ESP" },
  { id: "I-3-1", group: "I", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "19:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "NOR", teamBIso3: "FRA" },
  { id: "I-3-2", group: "I", matchday: 3, kickoffDate: "2026-06-26", kickoffLocalTime: "21:00", hostTimeZone: "America/Mexico_City", stadium: "Monterrey Stadium", city: "Monterrey", teamAIso3: "SEN", teamBIso3: "IRQ" },
  { id: "J-3-1", group: "J", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "11:00", hostTimeZone: "America/New_York", stadium: "Atlanta Stadium", city: "Atlanta", teamAIso3: "DZA", teamBIso3: "AUT" },
  { id: "J-3-2", group: "J", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "13:00", hostTimeZone: "America/Mexico_City", stadium: "Mexico City Stadium", city: "Mexico City", teamAIso3: "JOR", teamBIso3: "ARG" },
  { id: "K-3-1", group: "K", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "15:00", hostTimeZone: "America/Chicago", stadium: "Houston Stadium", city: "Houston", teamAIso3: "COL", teamBIso3: "PRT" },
  { id: "K-3-2", group: "K", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "17:00", hostTimeZone: "America/Chicago", stadium: "Kansas City Stadium", city: "Kansas City", teamAIso3: "COD", teamBIso3: "UZB" },
  { id: "L-3-1", group: "L", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "19:00", hostTimeZone: "America/Los_Angeles", stadium: "San Francisco Bay Area Stadium", city: "San Francisco Bay Area", teamAIso3: "PAN", teamBIso3: "ENG" },
  { id: "L-3-2", group: "L", matchday: 3, kickoffDate: "2026-06-27", kickoffLocalTime: "21:00", hostTimeZone: "America/Los_Angeles", stadium: "Seattle Stadium", city: "Seattle", teamAIso3: "HRV", teamBIso3: "GHA" },
];

function getViewerTimeZone() {
  if (typeof Intl !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  return "UTC";
}

function toUtcIso(kickoffDate: string, kickoffLocalTime: string, hostTimeZone: FixtureTimeZone) {
  const offset = UTC_OFFSETS[hostTimeZone];
  return `${kickoffDate}T${kickoffLocalTime}:00${offset}`;
}

function getMatchStatus(snapshotDate: string, kickoffDate: string): MatchStatus {
  if (snapshotDate > kickoffDate) {
    return "completed";
  }

  if (snapshotDate === kickoffDate) {
    return "today";
  }

  return "upcoming";
}

function formatKickoffLabel(utcIso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: getViewerTimeZone(),
  }).format(new Date(utcIso));
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
  const adjustment = bias > 0.12 ? 1 : bias < -0.12 ? -1 : 0;
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
  const teamsByIso = new Map(teams.map((team) => [team.iso3, team]));

  return OFFICIAL_FIXTURES.flatMap((fixture) => {
    const teamA = teamsByIso.get(fixture.teamAIso3);
    const teamB = teamsByIso.get(fixture.teamBIso3);

    if (!teamA || !teamB) {
      return [];
    }

    const kickoffUtc = toUtcIso(fixture.kickoffDate, fixture.kickoffLocalTime, fixture.hostTimeZone);
    const status = getMatchStatus(snapshotDate, fixture.kickoffDate);
    const score = generateScore(fixture.id, teamA, teamB, status);

    return [
      {
        id: fixture.id,
        stage: "group",
        group: fixture.group,
        matchday: fixture.matchday,
        kickoffDate: fixture.kickoffDate,
        kickoffUtc,
        kickoffLabel: formatKickoffLabel(kickoffUtc),
        venue: `${fixture.stadium} • ${fixture.city}`,
        hostTimeZone: fixture.hostTimeZone,
        teamA,
        teamB,
        status,
        scoreA: score.scoreA,
        scoreB: score.scoreB,
      } satisfies ScheduleMatch,
    ];
  }).sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));
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
    .sort((a, b) => b.kickoffUtc.localeCompare(a.kickoffUtc))
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
