import { useEffect, useMemo, useState } from "react";
import embeddedHistory from "../data/worldcup2026-history.static.json";
import type { SnapshotHistory, SnapshotRecord } from "../types/worldCup";

interface HistoryState {
  snapshots: SnapshotRecord[];
  loading: boolean;
  error: string | null;
}

export function useWorldCupHistory(historyPath = "/data/worldcup2026-history.json"): HistoryState {
  const embeddedSnapshots = (embeddedHistory as SnapshotHistory).snapshots ?? [];
  const [state, setState] = useState<HistoryState>({
    snapshots: embeddedSnapshots,
    loading: embeddedSnapshots.length === 0,
    error: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      setState({
        snapshots: embeddedSnapshots,
        loading: false,
        error:
          embeddedSnapshots.length === 0
            ? "No embedded snapshot data was found in this static build."
            : null,
      });
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch(historyPath);
        if (!response.ok) {
          throw new Error("History request failed");
        }

        const payload = (await response.json()) as SnapshotHistory;
        if (!cancelled) {
          setState({
            snapshots: payload.snapshots?.length ? payload.snapshots : embeddedSnapshots,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            snapshots: embeddedSnapshots,
            loading: false,
            error:
              embeddedSnapshots.length === 0
                ? "The history file could not be loaded. Run the seed/build scripts or confirm public/data/worldcup2026-history.json exists."
                : null,
          });
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [embeddedSnapshots, historyPath]);

  return state;
}

export function useLatestSnapshot(snapshots: SnapshotRecord[]) {
  return useMemo(
    () => snapshots[snapshots.length - 1] ?? null,
    [snapshots],
  );
}
