import { useCallback, useLayoutEffect, useRef } from "react";
import { Location, useLocation, useNavigationType } from "react-router-dom";

export function useHistoryEntries() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const entries = useRef(new Map<number, Location>());
  const index = useRef(0);

  useLayoutEffect(() => {
    // React Router keeps its position in the history stack in history.state.idx.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (navigationType === "PUSH") {
      for (const key of [...entries.current.keys()]) if (key > idx) entries.current.delete(key);
    }
    entries.current.set(idx, location);
    index.current = idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return useCallback((offset: -1 | 1): Location | null => entries.current.get(index.current + offset) ?? null, []);
}
