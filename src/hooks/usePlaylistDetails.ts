import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { SubsonicService } from "../services/SubsonicService";
import { toErrorMessage } from "../utils/errors";
import { useCoverArtUrl } from "./useCoverArt";

export function usePlaylistDetails(
  id: string,
  subsonicService: SubsonicService | null,
  onError: (msg: string) => void
) {
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  const [playlist, setPlaylist] = useState<SubsonicPlaylist | null>(null);
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!subsonicService) return;
    try {
      if (!silent) setLoading(true);
      const data = await subsonicService.getPlaylist(id);
      setPlaylist(data.playlist);
      setSongs(data.songs);
    } catch (err) {
      onErrorRef.current(`Failed to load playlist: ${toErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [id, subsonicService]);

  useEffect(() => {
    load();
  }, [load]);

  const removeSong = useCallback(
    async (songIndex: number) => {
      if (!subsonicService || !playlist) return;
      await subsonicService.removeFromPlaylist(playlist.id, [songIndex]);
      await load();
    },
    [subsonicService, playlist, load]
  );

  const getCoverArtUrl = useCoverArtUrl(subsonicService);

  const refresh = useCallback(() => load(true), [load]);

  return { playlist, songs, loading, removeSong, refresh, getCoverArtUrl };
}
