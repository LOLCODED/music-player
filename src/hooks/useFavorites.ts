import { useState, useCallback, useEffect } from "react";
import { SubsonicSong, SubsonicAlbum } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";

export type FavoritesSection = "songs" | "albums";

export function useFavorites(subsonicService: SubsonicService | null) {
  const [allSongs, setAllSongs] = useState<SubsonicSong[]>([]);
  const [allAlbums, setAllAlbums] = useState<SubsonicAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const fetch = useCallback(async () => {
    if (!subsonicService) return;
    setLoading(true);
    setError("");
    try {
      const { songs, albums } = await subsonicService.getStarred();
      setAllSongs(songs);
      setAllAlbums(albums);
    } catch (err) {
      setError(`Failed to load favorites: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [subsonicService]);

  useEffect(() => { fetch(); }, [fetch]);

  const unstarSong = useCallback(async (id: string) => {
    if (!subsonicService) return;
    await subsonicService.unstar(id, "song");
    setAllSongs((prev) => prev.filter((s) => s.id !== id));
  }, [subsonicService]);

  const unstarAlbum = useCallback(async (id: string) => {
    if (!subsonicService) return;
    await subsonicService.unstar(id, "album");
    setAllAlbums((prev) => prev.filter((a) => a.id !== id));
  }, [subsonicService]);

  const getCoverArtUrl = useCallback((coverArtId?: string): string => {
    if (!coverArtId || !subsonicService) return "/assets/default-playlist-art.png";
    return subsonicService.getCoverArtUrl(coverArtId, 300);
  }, [subsonicService]);

  const query = searchText.trim().toLowerCase();

  const filteredSongs = query
    ? allSongs.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        s.album.toLowerCase().includes(query)
      )
    : allSongs;

  const filteredAlbums = query
    ? allAlbums.filter((a) =>
        a.name.toLowerCase().includes(query) ||
        a.artist.toLowerCase().includes(query)
      )
    : allAlbums;

  return {
    songs: filteredSongs,
    albums: filteredAlbums,
    loading, error,
    searchText, setSearchText,
    unstarSong, unstarAlbum,
    refresh: fetch,
    getCoverArtUrl,
  };
}
