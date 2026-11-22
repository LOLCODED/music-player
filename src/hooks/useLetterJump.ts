import { useCallback, useEffect, useState } from "react";
import { letterAnchorId } from "../utils/letterGroups";

/**
 * Scrolls a lettered list to a letter's heading, first widening the rendered
 * window so the heading exists.
 */
export function useLetterJump(
  starts: Map<string, number> | null,
  ensureVisible: (index: number) => void,
  renderedCount: number
) {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!pending) return;
    const anchor = document.getElementById(letterAnchorId(pending));
    if (!anchor) return;
    anchor.scrollIntoView({ block: "start" });
    setPending(null);
  }, [pending, renderedCount]);

  return useCallback(
    (letter: string) => {
      const index = starts?.get(letter);
      if (index === undefined) return;
      ensureVisible(index);
      setPending(letter);
    },
    [starts, ensureVisible]
  );
}
