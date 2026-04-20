import { useEffect, useState } from "react";

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

export function VisitCounter() {
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

    return {
      status: "loading",
      message: "Loading visit count...",
    };
  });

  useEffect(() => {
    if (isPreviewEnvironment()) {
      return;
    }

    let cancelled = false;
    const sessionKey = `visit-counter:${window.location.pathname}:${counterName}`;
    const hasCountedThisSession = sessionStorage.getItem(sessionKey) === "1";

    async function loadCounter() {
      try {
        const endpoint = hasCountedThisSession
          ? "/.netlify/functions/page-views?mode=get"
          : "/.netlify/functions/page-views?mode=up";
        const response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
          },
        });

        const result = (await response.json()) as {
          count?: number;
          error?: string;
        };

        if (!response.ok || typeof result.count !== "number") {
          throw new Error(result.error ?? "Counter request failed.");
        }

        if (!hasCountedThisSession) {
          sessionStorage.setItem(sessionKey, "1");
        }

        if (!cancelled) {
          setState({
            status: "ready",
            count: result.count,
          });
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
  }, [counterName]);

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
