import { useState, useEffect, useRef, useCallback } from "react";
import { SubsonicAlbum, SubsonicSong } from "../types/subsonic";
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

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const getCoverArtUrl = useCoverArtUrl(subsonicService);

  return {
    album,
    songs,
    loading,
    getCoverArtUrl,
  };
}
