import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { SubsonicSong } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { getRecentSongs } from "../utils/recentlyPlayed";
import { toErrorMessage } from "../utils/errors";
import { shuffleArray } from "../utils/shuffle";
import {
  SONGS_PAGE_SIZE,
  BULK_FETCH_SIZE,
  SONG_SEARCH_LIMIT,
  SEARCH_DEBOUNCE_MS,
} from "../utils/constants";
import { useCoverArtUrl } from "./useCoverArt";

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
    case "titleAsc":
      return s.sort((a, b) => a.title.localeCompare(b.title));
    case "titleDesc":
      return s.sort((a, b) => b.title.localeCompare(a.title));
    case "artistAsc":
      return s.sort((a, b) => a.artist.localeCompare(b.artist));
    case "artistDesc":
      return s.sort((a, b) => b.artist.localeCompare(a.artist));
    case "albumAsc":
      return s.sort((a, b) => a.album.localeCompare(b.album));
    case "durationDesc":
      return s.sort((a, b) => b.duration - a.duration);
    case "random":
      return shuffleArray(s);
    default:
      return s;
  }
}

const BULK_SORTS: SongSortType[] = [
  "titleAsc",
  "titleDesc",
  "artistAsc",
  "artistDesc",
  "albumAsc",
  "durationDesc",
  "random",
];

export function useSongs(subsonicService: SubsonicService | null) {
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [searchResults, setSearchResults] = useState<SubsonicSong[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<SongSortType>("titleAsc");
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadSongs = useCallback(
    async (reset: boolean = false) => {
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
        if (reset) {
          setLoading(true);
          offsetRef.current = 0;
        }
        setError("");
        if (isBulk) {
          const list = await subsonicService.getSongs(BULK_FETCH_SIZE, 0);
          setSongs(sortSongs(list, sortType));
          setHasMore(false);
        } else {
          const offset = reset ? 0 : offsetRef.current;
          const list = await subsonicService.getSongs(SONGS_PAGE_SIZE, offset);
          setSongs((prev) => (reset ? list : [...prev, ...list]));
          setHasMore(list.length === SONGS_PAGE_SIZE);
          offsetRef.current = offset + list.length;
        }
      } catch (err) {
        setError(`Failed to load songs: ${toErrorMessage(err)}`);
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [subsonicService, sortType]
  );

  useEffect(() => {
    loadSongs(true);
  }, [loadSongs]);

  // Text search — debounced, bypasses pagination
  useEffect(() => {
    const query = searchText.trim();
    if (!query) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    if (!subsonicService) return;
    let active = true;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await subsonicService.searchSongs(query, SONG_SEARCH_LIMIT, 0);
        if (active) setSearchResults(results);
      } catch (err) {
        if (active) setError(`Search failed: ${toErrorMessage(err)}`);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, subsonicService]);

  const visibleSongs = useMemo(() => searchResults ?? songs, [searchResults, songs]);

  const getCoverArtUrl = useCoverArtUrl(subsonicService);
  const loadMore = useCallback(() => loadSongs(false), [loadSongs]);
  const refresh = useCallback(() => loadSongs(true), [loadSongs]);

  return {
    songs: visibleSongs,
    loading,
    searchLoading,
    error,
    hasMore: hasMore && !searchText.trim(),
    searchText,
    sortType,
    setSearchText,
    setSortType,
    loadMore,
    refresh,
    getCoverArtUrl,
  };
}
