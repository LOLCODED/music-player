import React, { useCallback, useMemo } from "react";
import Player from "./player/Player";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useToast } from "../hooks/useToast";
import { useAddToPlaylist } from "../hooks/useAddToPlaylist";
import Toast from "./Toast";

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
    takeResumeProgress,
    toggleShuffle,
    toggleRepeat,
    stop,
    playSong,
  } = useMusicPlayer();
  const { toast, showToast } = useToast();
  const { openAddToPlaylist, addToPlaylistDialog } = useAddToPlaylist(showToast);

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

  const handleAddToPlaylist = useCallback(() => {
    if (currentSong) openAddToPlaylist(currentSong);
  }, [currentSong, openAddToPlaylist]);

  if (!currentSong) return null;

  return (
    <>
      <Player
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onSeek={setProgress}
        onNext={skipNext}
        onPrevious={skipPrevious}
        onRequestStreamUrl={getStreamUrl}
        onRequestResumeProgress={takeResumeProgress}
        shuffle={shuffle}
        repeatMode={repeatMode}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onStop={stop}
        queue={queue}
        currentQueueIndex={getCurrentSongIndex()}
        onPlayQueueSong={handlePlayQueueSong}
        sourcePath={currentSourcePath}
        onAddToPlaylist={handleAddToPlaylist}
      />
      {addToPlaylistDialog}
      <Toast message={toast} />
    </>
  );
};

export default GlobalPlayer;
