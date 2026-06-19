import {
  automationConfigPath,
  getDateInTimeZone,
  masterPath,
  readJson,
  scheduleDataPath,
  writeJson,
} from "./shared-data-utils.mjs";
import { fileURLToPath } from "node:url";

const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

const DEFAULT_FOX_TITLE_ODDS_URLS = [
  "https://www.foxsports.com/stories/soccer/2026-fifa-world-cup-odds-every-countrys-odds-to-win-it-all",
  "https://www.foxsports.com/stories/soccer/2026-world-cup-odds",
];

const TEAM_NAME_ALIASES = {
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Congo DR": "DR Congo",
  "Cote d'Ivoire": "Ivory Coast",
  Czechia: "Czechia",
  Iran: "Iran",
  "Korea Republic": "South Korea",
  "Korea, Republic of": "South Korea",
  "Saudi Arabia": "Saudi Arabia",
  "South Korea": "South Korea",
  Türkiye: "Turkey",
  Turkiye: "Turkey",
  USA: "United States",
  "United States": "United States",
};

function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/\bthe\b/gi, "")
    .replace(/\band\b/gi, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function canonicalTeamName(value) {
  return TEAM_NAME_ALIASES[value] ?? value;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      "user-agent":
        "Mozilla/5.0 (compatible; WorldCupDashboardBot/1.0; +https://github.com/)",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent":
        "Mozilla/5.0 (compatible; WorldCupDashboardBot/1.0; +https://github.com/)",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

function htmlToSearchableText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&quot;/gi, "\"")
    .replace(/\s+/g, " ");
}

function extractUpdatedLabel(text, fallbackDate) {
  const updatedMatch = text.match(/updated\s+([A-Z][a-z]{2,}\.?\s+\d{1,2},\s+\d{4})/i);
  return updatedMatch?.[1] ?? fallbackDate;
}

function parseAmericanOdds(rawValue) {
  const value = Number(String(rawValue).replace(/[^\d+-]/g, ""));
  return Number.isFinite(value) && value !== 0 ? value : null;
}

function parseFoxTitleOdds(html, teams) {
  const text = htmlToSearchableText(html);
  const oddsByTeam = new Map();

  teams.forEach((team) => {
    const aliases = [team.team];
    if (team.team === "United States") {
      aliases.push("USA", "USMNT", "U.S.");
    }
    if (team.team === "South Korea") {
      aliases.push("Korea Republic");
    }
    if (team.team === "Bosnia and Herzegovina") {
      aliases.push("Bosnia & Herzegovina");
    }

    for (const alias of aliases) {
      const pattern = new RegExp(
        `(?:^|[^A-Za-z])${escapeRegExp(alias)}(?:[^A-Za-z]|$)[^+\\-]{0,80}([+\\-]\\d{3,6})`,
        "i",
      );
      const match = text.match(pattern);
      const parsed = match ? parseAmericanOdds(match[1]) : null;
      if (parsed !== null) {
        oddsByTeam.set(team.team, parsed);
        break;
      }
    }
  });

  return {
    oddsByTeam,
    updatedLabel: extractUpdatedLabel(text, getDateInTimeZone("America/Toronto")),
  };
}

async function refreshTitleOdds(config, now) {
  const configuredUrls = [
    config.titleOddsSourceUrl,
    ...(Array.isArray(config.titleOddsSourceUrls) ? config.titleOddsSourceUrls : []),
  ].filter(Boolean);
  const sourceUrls = configuredUrls.length > 0 ? configuredUrls : DEFAULT_FOX_TITLE_ODDS_URLS;
  const masterData = readJson(masterPath);
  const minimumTeamCount = config.minimumTitleOddsTeamCount ?? 12;
  const errors = [];

  for (const sourceUrl of sourceUrls) {
    try {
      const html = await fetchText(sourceUrl);
      const { oddsByTeam, updatedLabel } = parseFoxTitleOdds(html, masterData.teams);

      if (oddsByTeam.size < minimumTeamCount) {
        throw new Error(`Only parsed ${oddsByTeam.size} title odds`);
      }

      const nextMasterData = {
        ...masterData,
        metadata: {
          ...masterData.metadata,
          snapshotDate: getDateInTimeZone(config.timeZone ?? "America/Toronto", now),
          lastUpdated: getDateInTimeZone(config.timeZone ?? "America/Toronto", now),
          titleOddsLabel:
            config.titleOddsLabel ??
            `FOX Sports World Cup title odds snapshot (updated ${updatedLabel}; refreshed automatically)`,
          titleOddsSourceUrl: sourceUrl,
        },
        teams: masterData.teams.map((team) => ({
          ...team,
          oddsAmerican: oddsByTeam.get(team.team) ?? team.oddsAmerican,
        })),
      };

      writeJson(masterPath, nextMasterData);

      return {
        ok: true,
        sourceUrl,
        updatedTeams: oddsByTeam.size,
      };
    } catch (error) {
      errors.push(`${sourceUrl}: ${error.message}`);
    }
  }

  return {
    ok: false,
    errors,
  };
}

function buildScheduleLookup(schedule) {
  const lookup = new Map();

  schedule.matches.forEach((match) => {
    const key = [
      normalizeName(canonicalTeamName(match.team1)),
      normalizeName(canonicalTeamName(match.team2)),
      match.datetime_utc.slice(0, 10),
    ].sort().join("|");

    lookup.set(key, match);
  });

  return lookup;
}

function getCompetitorName(competitor) {
  return (
    competitor?.team?.displayName ??
    competitor?.team?.shortDisplayName ??
    competitor?.team?.name ??
    competitor?.team?.location ??
    ""
  );
}

function parseScore(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function refreshScores(config, now) {
  const schedule = readJson(scheduleDataPath);
  const lookup = buildScheduleLookup(schedule);
  const today = getDateInTimeZone(config.timeZone ?? "America/Toronto", now);
  const dateKeys = [
    ...new Set(
      schedule.matches
        .map((match) => match.datetime_utc.slice(0, 10))
        .filter((dateKey) => dateKey <= today),
    ),
  ];
  let updatedMatches = 0;
  const errors = [];

  for (const dateKey of dateKeys) {
    try {
      const payload = await fetchJson(`${ESPN_SCOREBOARD_URL}?dates=${dateKey.replaceAll("-", "")}`);
      const events = Array.isArray(payload.events) ? payload.events : [];

      events.forEach((event) => {
        const competition = event.competitions?.[0];
        const competitors = Array.isArray(competition?.competitors) ? competition.competitors : [];
        if (competitors.length < 2) {
          return;
        }

        const [first, second] = competitors;
        const eventDate = (competition?.date ?? event.date ?? "").slice(0, 10);
        const key = [
          normalizeName(canonicalTeamName(getCompetitorName(first))),
          normalizeName(canonicalTeamName(getCompetitorName(second))),
          eventDate,
        ].sort().join("|");
        const scheduleMatch = lookup.get(key);

        if (!scheduleMatch) {
          return;
        }

        const completed = Boolean(competition?.status?.type?.completed ?? event.status?.type?.completed);
        const firstScore = parseScore(first.score);
        const secondScore = parseScore(second.score);
        const firstName = normalizeName(canonicalTeamName(getCompetitorName(first)));
        const team1Name = normalizeName(canonicalTeamName(scheduleMatch.team1));
        const scoresAreUsable = firstScore !== null && secondScore !== null;

        scheduleMatch.espn_event_id = event.id;
        scheduleMatch.score_source = "ESPN FIFA World Cup scoreboard";
        scheduleMatch.score_last_checked = new Date().toISOString();
        scheduleMatch.status = completed ? "completed" : "scheduled";

        if (completed && scoresAreUsable) {
          scheduleMatch.score1 = firstName === team1Name ? firstScore : secondScore;
          scheduleMatch.score2 = firstName === team1Name ? secondScore : firstScore;
          updatedMatches += 1;
        }
      });
    } catch (error) {
      errors.push(`${dateKey}: ${error.message}`);
    }
  }

  writeJson(scheduleDataPath, schedule);

  return {
    ok: errors.length === 0,
    updatedMatches,
    errors,
  };
}

export async function refreshRemoteData({
  refreshOdds = true,
  refreshScores: shouldRefreshScores = true,
  now = new Date(),
} = {}) {
  const config = readJson(automationConfigPath);
  const results = {
    titleOdds: { ok: false, skipped: !refreshOdds },
    scores: { ok: false, skipped: !shouldRefreshScores },
  };

  if (refreshOdds) {
    results.titleOdds = await refreshTitleOdds(config, now);
  }

  if (shouldRefreshScores) {
    results.scores = await refreshScores(config, now);
  }

  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  refreshRemoteData()
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
