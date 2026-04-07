import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicPlaylist } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { getRecentPlaylistIds } from "../utils/recentlyPlayed";

const PAGE_SIZE = 15;

export type PlaylistSortType = "nameAsc" | "nameDesc" | "mostSongs" | "recentlyChanged" | "recentlyPlayed" | "random";

function sortPlaylists(playlists: SubsonicPlaylist[], sort: PlaylistSortType): SubsonicPlaylist[] {
  const sorted = [...playlists];
  switch (sort) {
    case "nameAsc": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "nameDesc": return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "mostSongs": return sorted.sort((a, b) => b.songCount - a.songCount);
    case "recentlyChanged":
      return sorted.sort((a, b) =>
        new Date(b.changed ?? b.created).getTime() - new Date(a.changed ?? a.created).getTime()
      );
    case "recentlyPlayed": {
      const ids = getRecentPlaylistIds();
      const order = new Map(ids.map((id, i) => [id, i]));
      return sorted.sort((a, b) => {
        const ai = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const bi = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return ai - bi;
      });
    }
    case "random": {
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
      return sorted;
    }
    default: return sorted;
  }
}

export function usePlaylists(
  subsonicService: SubsonicService | null,
  isAuthenticated: boolean,
  onError: (msg: string) => void
) {
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  const [allPlaylists, setAllPlaylists] = useState<SubsonicPlaylist[]>([]);
  const [playlists, setPlaylists] = useState<SubsonicPlaylist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<SubsonicPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sortType, setSortType] = useState<PlaylistSortType>("nameAsc");
  const [searchText, setSearchText] = useState("");
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchAllPlaylists = useCallback(async () => {
    if (!isAuthenticated || !subsonicService || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const all = await subsonicService.getPlaylists();
      setAllPlaylists(all);
    } catch (err) {
      onErrorRef.current(`Failed to load playlists: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [subsonicService, isAuthenticated]);

  // Re-sort and reset pagination when source data or sort changes
  useEffect(() => {
    const sorted = sortPlaylists(allPlaylists, sortType);
    offsetRef.current = 0;
    setPlaylists(sorted.slice(0, PAGE_SIZE));
    setHasMore(sorted.length > PAGE_SIZE);
  }, [allPlaylists, sortType]);

  // Filter displayed playlists by search text
  useEffect(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      setFilteredPlaylists(playlists);
      return;
    }
    const sorted = sortPlaylists(allPlaylists, sortType);
    setFilteredPlaylists(sorted.filter((p) => p.name.toLowerCase().includes(query)));
  }, [searchText, playlists, allPlaylists, sortType]);

  const loadMore = useCallback(() => {
    const sorted = sortPlaylists(allPlaylists, sortType);
    const offset = offsetRef.current + PAGE_SIZE;
    offsetRef.current = offset;
    setPlaylists((prev) => [...prev, ...sorted.slice(offset, offset + PAGE_SIZE)]);
    setHasMore(offset + PAGE_SIZE < sorted.length);
  }, [allPlaylists, sortType]);

  useEffect(() => { fetchAllPlaylists(); }, []);

  const createPlaylist = useCallback(async (name: string) => {
    if (!subsonicService) return;
    await subsonicService.createPlaylist(name);
    await fetchAllPlaylists();
  }, [subsonicService, fetchAllPlaylists]);

  const deletePlaylist = useCallback(async (playlist: SubsonicPlaylist) => {
    if (!subsonicService) return;
    await subsonicService.deletePlaylist(playlist.id);
    await fetchAllPlaylists();
  }, [subsonicService, fetchAllPlaylists]);

  const getCoverArtUrl = useCallback((coverArtId?: string): string => {
    if (!coverArtId || !subsonicService) return "/assets/default-playlist-art.png";
    return subsonicService.getCoverArtUrl(coverArtId, 300);
  }, [subsonicService]);

  return {
    playlists: filteredPlaylists, loading, hasMore: hasMore && !searchText.trim(), sortType, setSortType,
    searchText, setSearchText,
    loadMore,
    refresh: fetchAllPlaylists,
    createPlaylist, deletePlaylist, getCoverArtUrl,
  };
}
