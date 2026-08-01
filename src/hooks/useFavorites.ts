import { useState, useCallback, useEffect, useMemo } from "react";
import { SubsonicSong, SubsonicAlbum } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import { useCoverArtUrl } from "./useCoverArt";

export type FavoritesSection = "songs" | "albums";

export function useFavorites(subsonicService: SubsonicService | null) {
  const [allSongs, setAllSongs] = useState<SubsonicSong[]>([]);
  const [allAlbums, setAllAlbums] = useState<SubsonicAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

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
  }, [subsonicService]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const unstarSong = useCallback(
    async (id: string) => {
      if (!subsonicService) return;
      await subsonicService.unstar(id, "song");
      setAllSongs((prev) => prev.filter((s) => s.id !== id));
    },
    [subsonicService]
  );

  const unstarAlbum = useCallback(
    async (id: string) => {
      if (!subsonicService) return;
      await subsonicService.unstar(id, "album");
      setAllAlbums((prev) => prev.filter((a) => a.id !== id));
    },
    [subsonicService]
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
