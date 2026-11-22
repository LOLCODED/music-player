import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SubsonicAlbum } from "../types/subsonic";
import { SubsonicService, AlbumListType } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import {
  GRID_PAGE_SIZE,
  BULK_FETCH_SIZE,
  ALBUM_SEARCH_LIMIT,
  SEARCH_DEBOUNCE_MS,
} from "../utils/constants";
import { useCoverArtUrl } from "./useCoverArt";
import { hasCachedState, useCachedState } from "./usePageCache";
import { fetchAllPages } from "../utils/fetchAllPages";

type ApiSortType = Exclude<AlbumListType, "frequent">;
export type AlbumSortType = ApiSortType | "alphabeticalByNameDesc" | "alphabeticalByArtistDesc";

const API_SORT: Record<AlbumSortType, ApiSortType> = {
  alphabeticalByName: "alphabeticalByName",
  alphabeticalByNameDesc: "alphabeticalByName",
  alphabeticalByArtist: "alphabeticalByArtist",
  alphabeticalByArtistDesc: "alphabeticalByArtist",
  newest: "newest",
  recent: "recent",
  random: "random",
};

export function useAlbums(subsonicService: SubsonicService | null) {
  const location = useLocation();
  // An artist link (/albums?artist=…) is its own view: it must not overwrite the plain list's search.
  const artistQuery = new URLSearchParams(location.search).get("artist");
  const viewKey = artistQuery ? `albums:artist:${artistQuery}` : "albums";
  const restored = hasCachedState(subsonicService, "albums:list");
  const [albums, setAlbums] = useCachedState<SubsonicAlbum[]>(subsonicService, "albums:list", []);
  const [searchResults, setSearchResults] = useCachedState<SubsonicAlbum[] | null>(
    subsonicService, `${viewKey}:search`, null
  );
  const [loading, setLoading] = useState(!restored);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useCachedState(subsonicService, "albums:hasMore", true);
  const [searchText, setSearchText] = useCachedState(subsonicService, `${viewKey}:query`, artistQuery ?? "");
  const [sortType, setSortType] = useCachedState<AlbumSortType>(
    subsonicService, "albums:sort", "alphabeticalByName"
  );
  const offsetRef = useRef(albums.length);
  const loadingRef = useRef(false);
  const loadedForRef = useRef(restored ? { service: subsonicService, sortType } : null);

  const loadAlbums = useCallback(
    async (reset: boolean = false) => {
      if (!subsonicService || loadingRef.current) return;
      loadingRef.current = true;
      const isDesc = sortType.endsWith("Desc");
      const loadAll = sortType.startsWith("alphabetical");
      const apiSort = API_SORT[sortType];
      try {
        if (reset) {
          setLoading(true);
          offsetRef.current = 0;
        }
        setError("");
        if (loadAll) {
          // Alphabetical lists load fully so letter headings and the A-Z rail
          // cover every album; the API has no descending order, so reverse.
          const list = await fetchAllPages(
            (count, offset) => subsonicService.getAlbumList(apiSort, count, offset),
            BULK_FETCH_SIZE
          );
          setAlbums(isDesc ? [...list].reverse() : list);
          setHasMore(false);
        } else {
          const offset = reset ? 0 : offsetRef.current;
          const list = await subsonicService.getAlbumList(apiSort, GRID_PAGE_SIZE, offset);
          setAlbums((prev) => (reset ? list : [...prev, ...list]));
          setHasMore(list.length === GRID_PAGE_SIZE);
          offsetRef.current = offset + list.length;
        }
      } catch (err) {
        setError(`Failed to load albums: ${toErrorMessage(err)}`);
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [subsonicService, sortType, setAlbums, setHasMore]
  );

  useEffect(() => {
    const loaded = loadedForRef.current;
    if (loaded?.service === subsonicService && loaded.sortType === sortType) return;
    loadedForRef.current = { service: subsonicService, sortType };
    loadAlbums(true);
  }, [loadAlbums, subsonicService, sortType]);

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
        const results = await subsonicService.searchAlbums(query, ALBUM_SEARCH_LIMIT, 0);
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
  }, [searchText, subsonicService, setSearchResults]);

  const filteredAlbums = useMemo(() => searchResults ?? albums, [searchResults, albums]);

  const getCoverArtUrl = useCoverArtUrl(subsonicService);
  const loadMore = useCallback(() => loadAlbums(false), [loadAlbums]);
  const refresh = useCallback(() => loadAlbums(true), [loadAlbums]);

  return {
    viewKey,
    filteredAlbums,
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
