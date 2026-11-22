import { useCallback, useEffect, useRef } from "react";
import { useCachedState } from "./usePageCache";

/**
 * Renders a long, fully loaded list a page at a time. The window grows on
 * demand and resets when the list is replaced (new sort, search or refresh),
 * but not when items are appended.
 */
export function useRenderWindow<T>(owner: object | null, key: string, items: T[], pageSize: number) {
  const [count, setCount] = useCachedState(owner, `${key}:window`, pageSize);
  const previousRef = useRef(items);

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = items;
    const replaced = items.length < previous.length || items[0] !== previous[0];
    if (previous !== items && replaced) setCount(pageSize);
  }, [items, pageSize, setCount]);

  const showMore = useCallback(() => setCount((c) => c + pageSize), [pageSize, setCount]);
  const ensureVisible = useCallback(
    (index: number) => setCount((c) => Math.max(c, index + pageSize)),
    [pageSize, setCount]
  );

  return {
    visible: items.length > count ? items.slice(0, count) : items,
    hasHidden: items.length > count,
    showMore,
    ensureVisible,
  };
}
