import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "..");
export const masterPath = path.join(projectRoot, "data", "worldcup2026_master.json");
export const automationConfigPath = path.join(projectRoot, "data", "automation-config.json");
export const currentOutputPath = path.join(projectRoot, "public", "data", "worldcup2026-current.json");
export const historyOutputPath = path.join(projectRoot, "public", "data", "worldcup2026-history.json");
export const automationStatusOutputPath = path.join(projectRoot, "public", "data", "automation-status.json");
export const csvOutputPath = path.join(projectRoot, "public", "worldcup2026_odds.csv");
export const staticHistoryOutputPath = path.join(projectRoot, "src", "data", "worldcup2026-history.static.json");
export const staticAutomationStatusOutputPath = path.join(projectRoot, "src", "data", "automation-status.static.json");

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function americanOddsToProbability(odds) {
  if (odds > 0) {
    return 100 / (odds + 100);
  }

  return Math.abs(odds) / (Math.abs(odds) + 100);
}

export function normalizeTitleProbabilities(teams) {
  const impliedSum = teams.reduce(
    (sum, team) => sum + americanOddsToProbability(team.oddsAmerican),
    0,
  );

  return teams.map((team) => {
    const impliedProbability = americanOddsToProbability(team.oddsAmerican);
    const normalizedProbability = impliedProbability / impliedSum;
    const groupAdvanceProbability = americanOddsToProbability(
      team.groupAdvanceOddsAmerican,
    );

    return {
      ...team,
      impliedProbability,
      normalizedProbability,
      groupAdvanceProbability,
      stages: estimateStageProbabilities(groupAdvanceProbability, normalizedProbability),
    };
  });
}

export function estimateStageProbabilities(groupAdvanceProbability, championProbability) {
  const roundOf32 = clamp(groupAdvanceProbability, championProbability, 0.995);
  const safeChampion = clamp(championProbability, 0.00001, roundOf32);
  const perRoundRate = Math.pow(safeChampion / roundOf32, 1 / 5);

  const roundOf16 = roundOf32 * perRoundRate;
  const quarterfinal = roundOf16 * perRoundRate;
  const semifinal = quarterfinal * perRoundRate;
  const final = semifinal * perRoundRate;

  return {
    roundOf32,
    roundOf16,
    quarterfinal,
    semifinal,
    final,
    champion: safeChampion,
  };
}

export function toCurrentSnapshot(masterData) {
  return {
    metadata: {
      ...masterData.metadata,
      totalTeams: masterData.teams.length,
    },
    teams: normalizeTitleProbabilities(masterData.teams),
  };
}

export function buildCsv(snapshot) {
  const header = [
    "team",
    "group",
    "confederation",
    "odds_american",
    "group_advance_odds_american",
    "fifa_rank",
    "iso3",
  ];

  const rows = snapshot.teams.map((team) =>
    [
      team.team,
      team.group,
      team.confederation,
      team.oddsAmerican,
      team.groupAdvanceOddsAmerican,
      team.fifaRank ?? "",
      team.iso3,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return `${header.join(",")}\n${rows.join("\n")}\n`;
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes("\"")) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function deterministicNoise(seed) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

export function getDateInTimeZone(timeZone, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getOffsetForTimeZone(timeZone, date = new Date()) {
  const offsetText = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")
    ?.value;

  return offsetText?.replace("GMT", "") || "+00:00";
}

export function toScheduledIso(date, hour, minute, timeZone) {
  const day = getDateInTimeZone(timeZone, date);
  const offset = getOffsetForTimeZone(timeZone, date);
  return `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00${offset}`;
}

export function getNextScheduledUpdate({
  timeZone,
  hour,
  minute,
  now = new Date(),
}) {
  const today = getDateInTimeZone(timeZone, now);
  const currentParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const currentHour = Number(currentParts.find((part) => part.type === "hour")?.value ?? "0");
  const currentMinute = Number(currentParts.find((part) => part.type === "minute")?.value ?? "0");

  const laterToday = currentHour < hour || (currentHour === hour && currentMinute < minute);
  if (laterToday) {
    return toScheduledIso(now, hour, minute, timeZone);
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = getDateInTimeZone(timeZone, tomorrow);
  const offset = getOffsetForTimeZone(timeZone, tomorrow);
  return `${tomorrowDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00${offset}`;
}

export function syncStaticJson(sourcePath, destinationPath) {
  const payload = readJson(sourcePath);
  writeJson(destinationPath, payload);
}
