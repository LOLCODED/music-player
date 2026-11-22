import { RefObject, useCallback, useEffect, useState } from "react";
import { letterAnchorId } from "../utils/letterGroups";

/**
 * Scrolls a lettered list to a letter's heading, first widening the rendered
 * window so the heading exists. `root` scopes the heading lookup to one page,
 * since two pages are mounted at once during a swipe transition.
 */
export function useLetterJump(
  starts: Map<string, number> | null,
  ensureVisible: (index: number) => void,
  renderedCount: number,
  root?: RefObject<HTMLElement | null>
) {
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!pending) return;
    const id = letterAnchorId(pending);
    const anchor = root?.current
      ? root.current.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
      : document.getElementById(id);
    if (!anchor) return;
    anchor.scrollIntoView({ block: "start" });
    setPending(null);
  }, [pending, renderedCount, root]);

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
