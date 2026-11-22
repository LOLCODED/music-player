import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";

type CacheOwner = object | null;

const caches = new WeakMap<object, Map<string, unknown>>();

function cacheFor(owner: CacheOwner): Map<string, unknown> | null {
  if (!owner) return null;
  let cache = caches.get(owner);
  if (!cache) {
    cache = new Map();
    caches.set(owner, cache);
  }
  return cache;
}

export function clearCachedState(owner: CacheOwner, keyPrefix: string): void {
  const cache = cacheFor(owner);
  if (!cache) return;
  for (const key of [...cache.keys()]) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

export function hasCachedState(owner: CacheOwner, key: string): boolean {
  return cacheFor(owner)?.has(key) ?? false;
}

/**
 * useState that survives the page unmounting, scoped to `owner` (the active
 * Subsonic service) so switching servers or logging out starts fresh.
 */
export function useCachedState<T>(
  owner: CacheOwner,
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const cache = cacheFor(owner);
    return cache?.has(key) ? (cache.get(key) as T) : initial;
  });

  useEffect(() => {
    cacheFor(owner)?.set(key, value);
  }, [owner, key, value]);

  return [value, setValue];
}

/**
 * Keeps a scroll container's position across visits. Restores once, after
 * `ready` turns true (the cached content is rendered), then tracks scrolling.
 */
export function useScrollRestoration<E extends HTMLElement>(
  owner: CacheOwner,
  key: string,
  ready: boolean
) {
  const ref = useRef<E>(null);
  const restoredRef = useRef(false);
  const scrollKey = `scroll:${key}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !ready || restoredRef.current) return;
    restoredRef.current = true;
    const top = cacheFor(owner)?.get(scrollKey);
    if (typeof top === "number") el.scrollTop = top;
  }, [owner, scrollKey, ready]);

  useEffect(() => {
    const el = ref.current;
    const cache = cacheFor(owner);
    if (!el || !cache) return;
    const save = () => cache.set(scrollKey, el.scrollTop);
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, [owner, scrollKey]);

  return ref;
}
