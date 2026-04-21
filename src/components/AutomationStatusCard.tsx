import type { AppCopy, LanguageCode } from "../lib/i18n";
import { getSnapshotFreshness } from "../lib/probability";
import type { AutomationStatus, SnapshotRecord } from "../types/worldCup";

interface AutomationStatusCardProps {
  latestSnapshot: SnapshotRecord;
  currentDate: string;
  automationStatus: AutomationStatus | null;
  labels: AppCopy["automation"];
  language: LanguageCode;
}

function toneClassName(tone: "fresh" | "warning" | "stale") {
  if (tone === "fresh") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

function formatDateTime(value: string, language: LanguageCode) {
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sourceTone(status: AutomationStatus["dataSourceStatus"] | undefined) {
  if (status === "fresh") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "warning") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-100 text-rose-800";
}

export function AutomationStatusCard({
  latestSnapshot,
  currentDate,
  automationStatus,
  labels,
  language,
}: AutomationStatusCardProps) {
  const freshness = getSnapshotFreshness(latestSnapshot.metadata.snapshotDate, currentDate);
  const isStaticBuild = typeof window !== "undefined" && window.location.protocol === "file:";
  const cardTone = automationStatus?.dataSourceStatus ?? freshness.tone;

  return (
    <section className={`card border p-6 ${toneClassName(cardTone)}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="chip inline-flex border-current/15 bg-white/70 text-current">{labels.eyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold">{freshness.label}</h2>
          <p className="mt-2 text-sm leading-6 opacity-80">
            {automationStatus?.note ?? freshness.detail}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:min-w-[620px]">
          <div className="rounded-2xl border border-current/10 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{labels.lastAutoUpdate}</p>
            <p className="mt-2 font-semibold">
              {automationStatus
                ? formatDateTime(automationStatus.lastAutoUpdateAt, language)
                : latestSnapshot.metadata.lastUpdated}
            </p>
          </div>

          <div className="rounded-2xl border border-current/10 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{labels.nextScheduledUpdate}</p>
            <p className="mt-2 font-semibold">
              {automationStatus
                ? formatDateTime(automationStatus.nextScheduledUpdateAt, language)
                : labels.notScheduled}
            </p>
          </div>

          <div className="rounded-2xl border border-current/10 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{labels.dataSourceStatus}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${sourceTone(automationStatus?.dataSourceStatus)}`}>
                {automationStatus?.dataSourceStatus ?? freshness.tone}
              </span>
              <span className="text-sm">
                {automationStatus?.dataSourceLabel ?? "Snapshot history file"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-current/10 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{labels.runMode}</p>
            <p className="mt-2 font-semibold">
              {automationStatus?.runMode ?? (isStaticBuild ? labels.staticBuild : labels.liveLocal)}
            </p>
            <p className="mt-1 text-sm opacity-75">
              {labels.target}: {automationStatus?.buildTarget ?? "dist"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
