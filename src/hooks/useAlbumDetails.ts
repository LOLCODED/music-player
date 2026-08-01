import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicAlbum, SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import { useCoverArtUrl } from "./useCoverArt";

export function useAlbumDetails(
  id: string,
  subsonicService: SubsonicService | null,
  onError: (msg: string) => void
) {
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  const [album, setAlbum] = useState<SubsonicAlbum | null>(null);
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<SubsonicPlaylist[]>([]);

  const loadAlbum = useCallback(async () => {
    if (!subsonicService) return;
    try {
      setLoading(true);
      const data = await subsonicService.getAlbum(id);
      setAlbum(data.album);
      setSongs(data.songs);
    } catch (err) {
      onErrorRef.current(`Failed to load album: ${toErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [id, subsonicService]);

  const loadPlaylists = useCallback(async () => {
    if (!subsonicService) return;
    try {
      setPlaylists(await subsonicService.getPlaylists());
    } catch (err) {
      onErrorRef.current(`Failed to load playlists: ${toErrorMessage(err)}`);
    }
  }, [subsonicService]);

  useEffect(() => {
    loadAlbum();
    loadPlaylists();
  }, [loadAlbum, loadPlaylists]);

  const getCoverArtUrl = useCoverArtUrl(subsonicService);

  const addToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!subsonicService) return;
      await subsonicService.addToPlaylist(playlistId, [songId]);
    },
    [subsonicService]
  );

  const createPlaylist = useCallback(
    async (name: string, songId: string) => {
      if (!subsonicService) return;
      await subsonicService.createPlaylist(name, [songId]);
      await loadPlaylists();
    },
    [subsonicService, loadPlaylists]
  );

  return {
    album,
    songs,
    loading,
    playlists,
    getCoverArtUrl,
    addToPlaylist,
    createPlaylist,
  };
}
