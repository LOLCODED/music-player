import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { SubsonicPlaylist } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { getRecentPlaylistIds } from "../utils/recentlyPlayed";
import { toErrorMessage } from "../utils/errors";
import { shuffleArray } from "../utils/shuffle";
import { GRID_PAGE_SIZE } from "../utils/constants";
import { useCoverArtUrl } from "./useCoverArt";

export type PlaylistSortType =
  | "nameAsc"
  | "nameDesc"
  | "mostSongs"
  | "recentlyChanged"
  | "recentlyPlayed"
  | "random";

function sortPlaylists(
  playlists: SubsonicPlaylist[],
  sort: PlaylistSortType
): SubsonicPlaylist[] {
  const sorted = [...playlists];
  switch (sort) {
    case "nameAsc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "nameDesc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "mostSongs":
      return sorted.sort((a, b) => b.songCount - a.songCount);
    case "recentlyChanged":
      return sorted.sort(
        (a, b) =>
          new Date(b.changed ?? b.created).getTime() -
          new Date(a.changed ?? a.created).getTime()
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
    case "random":
      return shuffleArray(sorted);
    default:
      return sorted;
  }
}

export function usePlaylists(
  subsonicService: SubsonicService | null,
  isAuthenticated: boolean,
  onError: (msg: string) => void
) {
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  const [allPlaylists, setAllPlaylists] = useState<SubsonicPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE);
  const [sortType, setSortType] = useState<PlaylistSortType>("nameAsc");
  const [searchText, setSearchText] = useState("");
  const loadingRef = useRef(false);

  const fetchAllPlaylists = useCallback(async () => {
    if (!isAuthenticated || !subsonicService || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      setAllPlaylists(await subsonicService.getPlaylists());
    } catch (err) {
      onErrorRef.current(`Failed to load playlists: ${toErrorMessage(err)}`);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [subsonicService, isAuthenticated]);

  useEffect(() => {
    fetchAllPlaylists();
  }, [fetchAllPlaylists]);

  // Sorted once per source/sort change so "random" keeps a stable order
  // across pagination and searches.
  const sortedPlaylists = useMemo(
    () => sortPlaylists(allPlaylists, sortType),
    [allPlaylists, sortType]
  );

  useEffect(() => {
    setVisibleCount(GRID_PAGE_SIZE);
  }, [sortedPlaylists]);

  const query = searchText.trim().toLowerCase();
  const filteredPlaylists = useMemo(() => {
    if (query) {
      return sortedPlaylists.filter((p) => p.name.toLowerCase().includes(query));
    }
    return sortedPlaylists.slice(0, visibleCount);
  }, [sortedPlaylists, query, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + GRID_PAGE_SIZE);
  }, []);

  const createPlaylist = useCallback(
    async (name: string) => {
      if (!subsonicService) return;
      await subsonicService.createPlaylist(name);
      await fetchAllPlaylists();
    },
    [subsonicService, fetchAllPlaylists]
  );

  const deletePlaylist = useCallback(
    async (playlist: SubsonicPlaylist) => {
      if (!subsonicService) return;
      await subsonicService.deletePlaylist(playlist.id);
      await fetchAllPlaylists();
    },
    [subsonicService, fetchAllPlaylists]
  );

  const getCoverArtUrl = useCoverArtUrl(subsonicService);

  return {
    playlists: filteredPlaylists,
    loading,
    hasMore: !query && visibleCount < sortedPlaylists.length,
    sortType,
    setSortType,
    searchText,
    setSearchText,
    loadMore,
    refresh: fetchAllPlaylists,
    createPlaylist,
    deletePlaylist,
    getCoverArtUrl,
  };
}
