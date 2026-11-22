import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { SubsonicSong, SubsonicAlbum } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import { useCoverArtUrl } from "./useCoverArt";
import { hasCachedState, useCachedState } from "./usePageCache";

export type FavoritesSection = "songs" | "albums";

export function useFavorites(subsonicService: SubsonicService | null) {
  const restored = hasCachedState(subsonicService, "favorites:songs");
  const [allSongs, setAllSongs] = useCachedState<SubsonicSong[]>(
    subsonicService, "favorites:songs", []
  );
  const [allAlbums, setAllAlbums] = useCachedState<SubsonicAlbum[]>(
    subsonicService, "favorites:albums", []
  );
  const [loading, setLoading] = useState(!restored);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useCachedState(subsonicService, "favorites:query", "");
  const loadedForRef = useRef(restored ? subsonicService : null);

  const loadFavorites = useCallback(async () => {
    if (!subsonicService) return;
    setLoading(true);
    setError("");
    try {
      const { songs, albums } = await subsonicService.getStarred();
      setAllSongs(songs);
      setAllAlbums(albums);
    } catch (err) {
      setError(`Failed to load favorites: ${toErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [subsonicService, setAllSongs, setAllAlbums]);

  useEffect(() => {
    if (loadedForRef.current === subsonicService) return;
    loadedForRef.current = subsonicService;
    loadFavorites();
  }, [loadFavorites, subsonicService]);

  const unstarSong = useCallback(
    async (id: string) => {
      if (!subsonicService) return;
      await subsonicService.unstar(id, "song");
      setAllSongs((prev) => prev.filter((s) => s.id !== id));
    },
    [subsonicService, setAllSongs]
  );

  const unstarAlbum = useCallback(
    async (id: string) => {
      if (!subsonicService) return;
      await subsonicService.unstar(id, "album");
      setAllAlbums((prev) => prev.filter((a) => a.id !== id));
    },
    [subsonicService, setAllAlbums]
  );

  const getCoverArtUrl = useCoverArtUrl(subsonicService);

  const query = searchText.trim().toLowerCase();

  const filteredSongs = useMemo(
    () =>
      query
        ? allSongs.filter(
            (s) =>
              s.title.toLowerCase().includes(query) ||
              s.artist.toLowerCase().includes(query) ||
              s.album.toLowerCase().includes(query)
          )
        : allSongs,
    [allSongs, query]
  );

  const filteredAlbums = useMemo(
    () =>
      query
        ? allAlbums.filter(
            (a) =>
              a.name.toLowerCase().includes(query) ||
              a.artist.toLowerCase().includes(query)
          )
        : allAlbums,
    [allAlbums, query]
  );

  return {
    songs: filteredSongs,
    albums: filteredAlbums,
    loading,
    error,
    searchText,
    setSearchText,
    unstarSong,
    unstarAlbum,
    refresh: loadFavorites,
    getCoverArtUrl,
  };
}
