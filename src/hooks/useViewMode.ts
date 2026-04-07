import { useState } from "react";

type ViewMode = "grid" | "table";

export function useViewMode(storageKey: string, defaultMode: ViewMode = "grid") {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === "grid" || stored === "table" ? stored : defaultMode;
  });

  const setViewMode = (updater: ViewMode | ((prev: ViewMode) => ViewMode)) => {
    setViewModeState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(storageKey, next);
      return next;
    });
  };

  return [viewMode, setViewMode] as const;
}
