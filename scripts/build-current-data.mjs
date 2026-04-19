import fs from "node:fs";
import {
  buildCsv,
  csvOutputPath,
  currentOutputPath,
  masterPath,
  readJson,
  toCurrentSnapshot,
  writeJson,
} from "./shared-data-utils.mjs";

const masterData = readJson(masterPath);
const snapshot = toCurrentSnapshot(masterData);

writeJson(currentOutputPath, snapshot);
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
fs.writeFileSync(csvOutputPath, buildCsv(snapshot), "utf8");

console.log(`Built current snapshot with ${snapshot.teams.length} teams.`);
