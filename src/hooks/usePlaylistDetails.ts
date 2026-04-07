import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";

export function usePlaylistDetails(
  id: string,
  subsonicService: SubsonicService | null,
  onError: (msg: string) => void
) {
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  const [playlist, setPlaylist] = useState<SubsonicPlaylist | null>(null);
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!subsonicService) return;
    try {
      setLoading(true);
      const data = await subsonicService.getPlaylist(id);
      setPlaylist(data.playlist);
      setSongs(data.songs);
    } catch (err) {
      onErrorRef.current(`Failed to load playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [id, subsonicService]);

  useEffect(() => { load(); }, [load]);

  const removeSong = useCallback(async (songIndex: number) => {
    if (!subsonicService || !playlist) return;
    await subsonicService.removeFromPlaylist(playlist.id, [songIndex]);
    await load();
  }, [subsonicService, playlist, load]);

  const getCoverArtUrl = useCallback((coverArtId?: string): string => {
    if (!coverArtId || !subsonicService) return "/assets/default-playlist-art.png";
    return subsonicService.getCoverArtUrl(coverArtId, 300);
  }, [subsonicService]);

  return { playlist, songs, loading, removeSong, getCoverArtUrl };
}
