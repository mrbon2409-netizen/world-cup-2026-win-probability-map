import { useEffect, useState } from "react";
import embeddedStatus from "../data/automation-status.static.json";
import type { AutomationStatus } from "../types/worldCup";

interface AutomationStatusState {
  status: AutomationStatus | null;
  loading: boolean;
  error: string | null;
}

export function useAutomationStatus(statusPath = "/data/automation-status.json"): AutomationStatusState {
  const embedded = embeddedStatus as AutomationStatus;
  const [state, setState] = useState<AutomationStatusState>({
    status: embedded?.lastAutoUpdateAt ? embedded : null,
    loading: !embedded?.lastAutoUpdateAt,
    error: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.protocol === "file:") {
      setState({
        status: embedded?.lastAutoUpdateAt ? embedded : null,
        loading: false,
        error: embedded?.lastAutoUpdateAt ? null : "No embedded automation status was found in this static build.",
      });
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch(statusPath);
        if (!response.ok) {
          throw new Error("Automation status request failed");
        }

        const payload = (await response.json()) as AutomationStatus;
        if (!cancelled) {
          setState({
            status: payload,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: embedded?.lastAutoUpdateAt ? embedded : null,
            loading: false,
            error: embedded?.lastAutoUpdateAt
              ? null
              : "Automation status could not be loaded. Run the daily snapshot update once to create it.",
          });
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [embedded, statusPath]);

  return state;
}
