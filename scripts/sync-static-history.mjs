import {
  automationStatusOutputPath,
  historyOutputPath,
  staticAutomationStatusOutputPath,
  staticHistoryOutputPath,
  syncStaticJson,
} from "./shared-data-utils.mjs";

syncStaticJson(historyOutputPath, staticHistoryOutputPath);
syncStaticJson(automationStatusOutputPath, staticAutomationStatusOutputPath);

console.log(`Synced static history: ${staticHistoryOutputPath}`);
console.log(`Synced static automation status: ${staticAutomationStatusOutputPath}`);
