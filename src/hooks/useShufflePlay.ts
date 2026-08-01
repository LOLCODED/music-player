import { useCallback } from "react";
import { SubsonicAlbum, SubsonicSong } from "../types/subsonic";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { toErrorMessage } from "../utils/errors";

type PlayableLoader = () => Promise<{
  album: SubsonicAlbum;
  songs: SubsonicSong[];
}>;

// Enables shuffle and starts playback at a random track of the loaded set.
export function useShufflePlay(onError: (msg: string) => void) {
  const { playAlbum, shuffle, toggleShuffle } = useMusicPlayer();

  return useCallback(
    async (load: PlayableLoader) => {
      try {
        const { album, songs } = await load();
        if (songs.length === 0) return;
        if (!shuffle) toggleShuffle();
        playAlbum(album, songs, Math.floor(Math.random() * songs.length));
      } catch (err) {
        onError(`Failed to play: ${toErrorMessage(err)}`);
      }
    },
    [playAlbum, shuffle, toggleShuffle, onError]
  );
}
