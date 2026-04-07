import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { SubsonicAlbum } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";

type ApiSortType = "newest" | "alphabeticalByName" | "alphabeticalByArtist" | "recent" | "random";
export type AlbumSortType = ApiSortType | "alphabeticalByNameDesc" | "alphabeticalByArtistDesc";

const PAGE_SIZE = 15;
const DESC_PAGE_SIZE = 500;

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
  const [filteredAlbums, setFilteredAlbums] = useState<SubsonicAlbum[]>([]);
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

  const loadAlbums = useCallback(async (reset: boolean = false) => {
    if (!subsonicService || loadingRef.current) return;
    loadingRef.current = true;
    const isDesc = sortType.endsWith("Desc");
    const apiSort = API_SORT[sortType];
    try {
      if (reset) { setLoading(true); offsetRef.current = 0; }
      setError("");
      if (isDesc) {
        const list = await subsonicService.getAlbumList(apiSort, DESC_PAGE_SIZE, 0);
        const reversed = [...list].reverse();
        setAlbums(reversed);
        setFilteredAlbums(reversed);
        setHasMore(false);
      } else {
        const offset = reset ? 0 : offsetRef.current;
        const list = await subsonicService.getAlbumList(apiSort, PAGE_SIZE, offset);
        if (reset) {
          setAlbums(list);
          setFilteredAlbums(list);
        } else {
          setAlbums((prev) => [...prev, ...list]);
          setFilteredAlbums((prev) => [...prev, ...list]);
        }
        setHasMore(list.length === PAGE_SIZE);
        offsetRef.current = offset + list.length;
      }
    } catch (err) {
      setError(`Failed to load albums: ${err instanceof Error ? err.message : "Unknown error"}`);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [subsonicService, sortType]);

  useEffect(() => { loadAlbums(true); }, [sortType]);

  useEffect(() => {
    const query = searchText.trim();
    if (!query) { setFilteredAlbums(albums); setSearchLoading(false); return; }
    if (!subsonicService) return;
    let active = true;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await subsonicService.searchAlbums(query, 50, 0);
        if (active) setFilteredAlbums(results);
      } catch (err) {
        if (active) setError(`Search failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [searchText, subsonicService, albums]);

  const getCoverArtUrl = useCallback((coverArtId?: string): string => {
    if (!coverArtId || !subsonicService) return DEFAULT_ALBUM_ART;
    return subsonicService.getCoverArtUrl(coverArtId, 300);
  }, [subsonicService]);

  return {
    albums, filteredAlbums, loading, searchLoading, error,
    hasMore, searchText, sortType,
    setSearchText, setSortType,
    loadMore: () => loadAlbums(false),
    refresh: () => loadAlbums(true),
    getCoverArtUrl,
  };
}
