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
  const [albums, setAlbums] = useState<SubsonicAlbum[]>([]);
  const [searchResults, setSearchResults] = useState<SubsonicAlbum[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<AlbumSortType>("alphabeticalByName");
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const artistQuery = params.get("artist");
    if (artistQuery) setSearchText(artistQuery);
  }, [location.search]);

  const loadAlbums = useCallback(
    async (reset: boolean = false) => {
      if (!subsonicService || loadingRef.current) return;
      loadingRef.current = true;
      const isDesc = sortType.endsWith("Desc");
      const apiSort = API_SORT[sortType];
      try {
        if (reset) {
          setLoading(true);
          offsetRef.current = 0;
        }
        setError("");
        if (isDesc) {
          // The API has no descending order, so fetch a large page and reverse.
          const list = await subsonicService.getAlbumList(apiSort, BULK_FETCH_SIZE, 0);
          setAlbums([...list].reverse());
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
    [subsonicService, sortType]
  );

  useEffect(() => {
    loadAlbums(true);
  }, [loadAlbums]);

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
  }, [searchText, subsonicService]);

  const filteredAlbums = useMemo(() => searchResults ?? albums, [searchResults, albums]);

  const getCoverArtUrl = useCoverArtUrl(subsonicService);
  const loadMore = useCallback(() => loadAlbums(false), [loadAlbums]);
  const refresh = useCallback(() => loadAlbums(true), [loadAlbums]);

  return {
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
