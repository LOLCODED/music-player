import { useState } from "react";

type ViewMode = "grid" | "table";

export function useViewMode(storageKey: string, defaultMode: ViewMode = "grid") {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === "grid" || stored === "table" ? stored : defaultMode;
    } catch {
      return defaultMode;
    }
  });

  const setViewMode = (updater: ViewMode | ((prev: ViewMode) => ViewMode)) => {
    setViewModeState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Ignore storage failures; the in-memory value still applies.
      }
      return next;
    });
  };

  return [viewMode, setViewMode] as const;
}
