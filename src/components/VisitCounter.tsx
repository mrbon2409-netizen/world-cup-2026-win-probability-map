import { useEffect, useMemo, useState } from "react";
import { Counter } from "counterapi";

type CounterState =
  | { status: "preview"; count: number; message: string }
  | { status: "disabled"; message: string }
  | { status: "loading"; message: string }
  | { status: "ready"; count: number }
  | { status: "error"; message: string };

function isPreviewEnvironment() {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function getResultValue(result: unknown): number | null {
  if (typeof result !== "object" || result === null) {
    return null;
  }

  const candidate = result as { value?: unknown; data?: unknown };
  if (typeof candidate.value === "number") {
    return candidate.value;
  }

  if (typeof candidate.data === "number") {
    return candidate.data;
  }

  return null;
}

export function VisitCounter() {
  const workspace = (import.meta.env.VITE_COUNTER_WORKSPACE ?? "").trim();
  const counterName = (import.meta.env.VITE_COUNTER_NAME ?? "world-cup-2026-profile").trim();
  const [state, setState] = useState<CounterState>(() => {
    if (isPreviewEnvironment()) {
      const previewKey = `preview-visit-counter:${counterName}`;
      const currentValue = Number(localStorage.getItem(previewKey) ?? "0");
      const nextValue = Number.isFinite(currentValue) ? currentValue + 1 : 1;
      localStorage.setItem(previewKey, String(nextValue));
      return {
        status: "preview",
        count: nextValue,
        message: "Preview counter while running locally.",
      };
    }

    if (!workspace) {
      return {
        status: "disabled",
        message: "Visitor counter is ready to activate after CounterAPI workspace setup.",
      };
    }

    return {
      status: "loading",
      message: "Loading visit count...",
    };
  });

  const counter = useMemo(() => {
    if (!workspace) {
      return null;
    }

    return new Counter({ workspace });
  }, [workspace]);

  useEffect(() => {
    if (!counter || !workspace || isPreviewEnvironment()) {
      return;
    }

    const activeCounter = counter;
    let cancelled = false;
    const sessionKey = `visit-counter:${window.location.pathname}:${counterName}`;
    const hasCountedThisSession = sessionStorage.getItem(sessionKey) === "1";

    async function loadCounter() {
      try {
        const result = hasCountedThisSession
          ? await activeCounter.get(counterName)
          : await activeCounter.up(counterName);

        if (!hasCountedThisSession) {
          sessionStorage.setItem(sessionKey, "1");
        }

        const value = getResultValue(result);
        if (!cancelled) {
          setState(
            value === null
              ? {
                  status: "error",
                  message: "Visit count is unavailable right now.",
                }
              : {
                  status: "ready",
                  count: value,
                },
          );
        }
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Visit count is unavailable right now.",
          });
        }
      }
    }

    void loadCounter();

    return () => {
      cancelled = true;
    };
  }, [counter, counterName, workspace]);

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs text-slate-500 shadow-sm backdrop-blur">
        <span className="font-semibold uppercase tracking-[0.16em] text-slate-400">
          {state.status === "preview" ? "Preview counter" : "Page views"}
        </span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        {state.status === "ready" || state.status === "preview" ? (
          <span className="font-semibold text-slate-700">
            {state.status === "preview" ? "Local page views" : "Page views"}: {state.count.toLocaleString()}
          </span>
        ) : (
          <span>{state.message}</span>
        )}
      </div>
    </div>
  );
}
