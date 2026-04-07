import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicSong } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { getRecentSongs } from "../utils/recentlyPlayed";

const PAGE_SIZE = 50;
const BULK_SIZE = 500;

export type SongSortType =
  | "titleAsc"
  | "titleDesc"
  | "artistAsc"
  | "artistDesc"
  | "albumAsc"
  | "durationDesc"
  | "random"
  | "recentlyPlayed";

function sortSongs(songs: SubsonicSong[], sort: SongSortType): SubsonicSong[] {
  const s = [...songs];
  switch (sort) {
    case "titleAsc":  return s.sort((a, b) => a.title.localeCompare(b.title));
    case "titleDesc": return s.sort((a, b) => b.title.localeCompare(a.title));
    case "artistAsc": return s.sort((a, b) => a.artist.localeCompare(b.artist));
    case "artistDesc": return s.sort((a, b) => b.artist.localeCompare(a.artist));
    case "albumAsc":  return s.sort((a, b) => a.album.localeCompare(b.album));
    case "durationDesc": return s.sort((a, b) => b.duration - a.duration);
    case "random": {
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    }
    default: return s;
  }
}

const BULK_SORTS: SongSortType[] = ["titleAsc", "titleDesc", "artistAsc", "artistDesc", "albumAsc", "durationDesc", "random"];

export function useSongs(subsonicService: SubsonicService | null) {
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<SongSortType>("titleAsc");
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadSongs = useCallback(async (reset: boolean = false) => {
    if (!subsonicService || loadingRef.current) return;

    if (sortType === "recentlyPlayed") {
      setSongs(getRecentSongs());
      setHasMore(false);
      setLoading(false);
      return;
    }

    loadingRef.current = true;
    const isBulk = BULK_SORTS.includes(sortType);
    try {
      if (reset) { setLoading(true); offsetRef.current = 0; }
      setError("");
      if (isBulk) {
        const list = await subsonicService.getSongs(BULK_SIZE, 0);
        const sorted = sortSongs(list, sortType);
        setSongs(sorted);
        setHasMore(false);
      } else {
        const offset = reset ? 0 : offsetRef.current;
        const list = await subsonicService.getSongs(PAGE_SIZE, offset);
        if (reset) {
          setSongs(list);
        } else {
          setSongs((prev) => [...prev, ...list]);
        }
        setHasMore(list.length === PAGE_SIZE);
        offsetRef.current = offset + list.length;
      }
    } catch (err) {
      setError(`Failed to load songs: ${err instanceof Error ? err.message : "Unknown error"}`);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [subsonicService, sortType]);

  useEffect(() => { loadSongs(true); }, [sortType]);

  // Text search — debounced, bypasses pagination
  useEffect(() => {
    const query = searchText.trim();
    if (!query) return;
    if (!subsonicService) return;
    let active = true;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await subsonicService.searchSongs(query, 100, 0);
        if (active) setSongs(results);
      } catch (err) {
        if (active) setError(`Search failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [searchText, subsonicService]);

  // When search is cleared, reload
  useEffect(() => {
    if (!searchText.trim()) loadSongs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const getCoverArtUrl = useCallback((coverArtId?: string): string => {
    if (!coverArtId || !subsonicService) return "/assets/default-playlist-art.png";
    return subsonicService.getCoverArtUrl(coverArtId, 300);
  }, [subsonicService]);

  return {
    songs, loading, searchLoading, error,
    hasMore: hasMore && !searchText.trim(),
    searchText, sortType,
    setSearchText, setSortType,
    loadMore: () => loadSongs(false),
    refresh: () => loadSongs(true),
    getCoverArtUrl,
  };
}
