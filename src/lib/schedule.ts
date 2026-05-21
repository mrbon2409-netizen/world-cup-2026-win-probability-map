import canonicalSchedule from "../data/fifa2026Schedule.json";
import type { GroupStanding, MatchStatus, ScheduleMatch, TeamSnapshot } from "../types/worldCup";

interface RawScheduleMatch {
  id: number;
  stage: string;
  group: string;
  team1: string;
  team2: string;
  datetime_utc: string;
  time_et: string;
  time_vn: string;
  venue: string;
  city: string;
  country: string;
  date_et: string;
  date_vn: string;
}

interface RawSchedulePayload {
  matches: RawScheduleMatch[];
}

const rawSchedule = canonicalSchedule as RawSchedulePayload;

const TEAM_NAME_ALIASES: Record<string, string> = {
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  USA: "United States",
};

function getViewerTimeZone() {
  if (typeof Intl !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  return "UTC";
}

function getViewerLocale() {
  if (typeof document !== "undefined") {
    return document.documentElement.lang || "en";
  }

  return "en";
}

function normalizeTeamName(teamName: string) {
  return TEAM_NAME_ALIASES[teamName] ?? teamName;
}

function getLocalDateKey(utcIso: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: getViewerTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date(utcIso));
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function getMatchStatus(snapshotDate: string, utcIso: string): MatchStatus {
  const kickoffDate = utcIso.slice(0, 10);

  if (snapshotDate > kickoffDate) {
    return "completed";
  }

  if (snapshotDate === kickoffDate) {
    return "today";
  }

  return "upcoming";
}

function formatKickoffLabel(utcIso: string) {
  return new Intl.DateTimeFormat(getViewerLocale(), {
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
  const teamMap = new Map(teams.map((team) => [team.team, team]));
  const groupMatchCounters = new Map<string, number>();

  const groupStageMatches = rawSchedule.matches
    .filter((match) => match.stage === "Group Stage")
    .sort((a, b) => a.datetime_utc.localeCompare(b.datetime_utc));

  const scheduleMatches = groupStageMatches.flatMap((rawMatch) => {
    const teamA = teamMap.get(normalizeTeamName(rawMatch.team1));
    const teamB = teamMap.get(normalizeTeamName(rawMatch.team2));

    if (!teamA || !teamB) {
      if (import.meta.env.DEV) {
        console.warn("Skipping schedule match with unmapped team name", rawMatch);
      }

      return [];
    }

    const nextGroupCount = (groupMatchCounters.get(rawMatch.group) ?? 0) + 1;
    groupMatchCounters.set(rawMatch.group, nextGroupCount);

    const kickoffUtc = rawMatch.datetime_utc;
    const status = getMatchStatus(snapshotDate, kickoffUtc);
    const score = generateScore(`group-${rawMatch.id}`, teamA, teamB, status);

    return [
      {
        id: `group-${rawMatch.id}`,
        stage: "group",
        group: rawMatch.group,
        matchday: Math.ceil(nextGroupCount / 2),
        kickoffDate: getLocalDateKey(kickoffUtc),
        kickoffUtc,
        kickoffLabel: formatKickoffLabel(kickoffUtc),
        venue: `${rawMatch.venue} • ${rawMatch.city}`,
        hostTimeZone: rawMatch.country,
        teamA,
        teamB,
        status,
        scoreA: score.scoreA,
        scoreB: score.scoreB,
      } satisfies ScheduleMatch,
    ];
  });

  if (import.meta.env.DEV && scheduleMatches.length !== groupStageMatches.length) {
    console.warn(
      `Expected ${groupStageMatches.length} mapped group-stage matches but built ${scheduleMatches.length}.`,
    );
  }

  return scheduleMatches.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));
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

export function groupMatchesByDate(matches: ScheduleMatch[]) {
  const grouped = new Map<string, ScheduleMatch[]>();

  matches.forEach((match) => {
    const dateMatches = grouped.get(match.kickoffDate) ?? [];
    dateMatches.push(match);
    grouped.set(match.kickoffDate, dateMatches);
  });

  return [...grouped.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([kickoffDate, dateMatches]) => ({
      kickoffDate,
      matches: dateMatches.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc)),
    }));
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
