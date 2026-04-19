import fs from "node:fs";
import { argv } from "node:process";
import {
  automationConfigPath,
  automationStatusOutputPath,
  buildCsv,
  csvOutputPath,
  currentOutputPath,
  currentOutputPath as currentPath,
  getDateInTimeZone,
  getNextScheduledUpdate,
  getOffsetForTimeZone,
  historyOutputPath,
  masterPath,
  readJson,
  staticAutomationStatusOutputPath,
  staticHistoryOutputPath,
  toCurrentSnapshot,
  writeJson,
} from "./shared-data-utils.mjs";

const args = new Map(
  argv
    .slice(2)
    .filter((item) => item.startsWith("--"))
    .map((item) => {
      const [key, ...rest] = item.replace(/^--/, "").split("=");
      return [key, rest.join("=") || "true"];
    }),
);

const config = readJson(automationConfigPath);
const masterData = readJson(masterPath);
const snapshot = toCurrentSnapshot(masterData);
const now = new Date();
const timeZone = config.timeZone ?? "America/Toronto";
const providedDate = args.get("date");
const snapshotDate = providedDate ?? getDateInTimeZone(timeZone, now);
const runOffset = getOffsetForTimeZone(timeZone, now);
const runStamp = `${snapshotDate}T${new Intl.DateTimeFormat("en-GB", {
  timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(now).replaceAll("/", "-").replace(",", "")}${runOffset}`;

const nextSnapshot = {
  ...snapshot,
  metadata: {
    ...snapshot.metadata,
    snapshotDate,
    lastUpdated: runStamp,
  },
};

writeJson(currentOutputPath, nextSnapshot);
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
fs.writeFileSync(csvOutputPath, buildCsv(nextSnapshot), "utf8");

const history = readJson(historyOutputPath);
const existingIndex = history.snapshots.findIndex(
  (entry) => entry.metadata.snapshotDate === snapshotDate,
);

if (existingIndex >= 0) {
  history.snapshots[existingIndex] = nextSnapshot;
} else {
  history.snapshots.push(nextSnapshot);
  history.snapshots.sort((a, b) => a.metadata.snapshotDate.localeCompare(b.metadata.snapshotDate));
}

writeJson(historyOutputPath, history);

const automationStatus = {
  automationEnabled: config.automationEnabled ?? true,
  timezone: timeZone,
  scheduleLabel: config.scheduleLabel ?? "Daily at 08:00 America/Toronto",
  lastAutoUpdateAt: runStamp,
  lastSuccessfulSnapshotDate: snapshotDate,
  nextScheduledUpdateAt: getNextScheduledUpdate({
    timeZone,
    hour: config.scheduleHour ?? 8,
    minute: config.scheduleMinute ?? 0,
    now,
  }),
  dataSourceStatus: "fresh",
  dataSourceLabel: config.dataSourceLabel ?? "Local master odds file and generated daily snapshot history",
  runMode: config.runMode ?? "Local scheduled build",
  buildTarget: config.buildTarget ?? "dist",
  lastBuildStatus: "success",
  note: config.note,
};

writeJson(automationStatusOutputPath, automationStatus);
writeJson(staticHistoryOutputPath, history);
writeJson(staticAutomationStatusOutputPath, automationStatus);

console.log(`Daily snapshot updated for ${snapshotDate}.`);
console.log(`Current snapshot: ${currentPath}`);
console.log(`History file: ${historyOutputPath}`);
console.log(`Automation status: ${automationStatusOutputPath}`);
