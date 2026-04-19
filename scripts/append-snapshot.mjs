import { argv } from "node:process";
import {
  currentOutputPath,
  historyOutputPath,
  readJson,
  writeJson,
} from "./shared-data-utils.mjs";

const current = readJson(currentOutputPath);
const history = readJson(historyOutputPath);
const providedDate = argv.find((item) => item.startsWith("--date="))?.split("=")[1];
const snapshotDate =
  providedDate ?? current.metadata.snapshotDate ?? new Date().toISOString().slice(0, 10);

const nextSnapshot = {
  ...current,
  metadata: {
    ...current.metadata,
    snapshotDate,
    lastUpdated: snapshotDate,
  },
};

const existingIndex = history.snapshots.findIndex(
  (snapshot) => snapshot.metadata.snapshotDate === snapshotDate,
);

if (existingIndex >= 0) {
  history.snapshots[existingIndex] = nextSnapshot;
} else {
  history.snapshots.push(nextSnapshot);
  history.snapshots.sort((a, b) =>
    a.metadata.snapshotDate.localeCompare(b.metadata.snapshotDate),
  );
}

writeJson(historyOutputPath, history);
console.log(`History snapshot saved for ${snapshotDate}.`);
