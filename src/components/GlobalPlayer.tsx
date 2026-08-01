import React, { useCallback, useMemo } from "react";
import Player from "./player/Player";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";

const GlobalPlayer: React.FC = () => {
  const {
    currentSong,
    currentAlbum,
    currentPlaylist,
    currentSourcePath,
    getCurrentSongIndex,
    isPlaying,
    shuffle,
    repeatMode,
    togglePlayPause,
    skipNext,
    skipPrevious,
    setProgress,
    getStreamUrl,
    toggleShuffle,
    toggleRepeat,
    stop,
    playSong,
  } = useMusicPlayer();

  const queue = useMemo(
    () =>
      currentPlaylist.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
      })),
    [currentPlaylist]
  );

  const handlePlayQueueSong = useCallback(
    (index: number) => {
      const song = currentPlaylist[index];
      if (song) playSong(song, currentAlbum || undefined, currentPlaylist);
    },
    [currentPlaylist, currentAlbum, playSong]
  );

  if (!currentSong) return null;

  return (
    <Player
      currentSong={currentSong}
      isPlaying={isPlaying}
      onPlayPause={togglePlayPause}
      onSeek={setProgress}
      onNext={skipNext}
      onPrevious={skipPrevious}
      onRequestStreamUrl={getStreamUrl}
      shuffle={shuffle}
      repeatMode={repeatMode}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={toggleRepeat}
      onStop={stop}
      queue={queue}
      currentQueueIndex={getCurrentSongIndex()}
      onPlayQueueSong={handlePlayQueueSong}
      sourcePath={currentSourcePath}
    />
  );
};

export default GlobalPlayer;
