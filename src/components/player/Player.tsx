import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Song, QueueEntry, PlayerVariantProps, RepeatMode } from "../../types/player";
import { useSettings } from "../../contexts/SettingsContext";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import PlayerDesktop from "./PlayerDesktop";
import PlayerMini from "./PlayerMini";
import PlayerFullscreen from "./PlayerFullscreen";
import PlayerPanel from "./PlayerPanel";
import PlayerFloater from "./PlayerFloater";

const FLOATER_POSITION_PREFIX = "floater-";

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onRequestStreamUrl: (songId: string, timeOffset?: number) => string;
  shuffle: boolean;
  repeatMode: RepeatMode;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onStop: () => void;
  queue?: QueueEntry[];
  currentQueueIndex?: number;
  onPlayQueueSong?: (index: number) => void;
  sourcePath?: string | null;
}

const Player: React.FC<PlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onSeek,
  onNext,
  onPrevious,
  onRequestStreamUrl,
  shuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  onStop,
  queue,
  currentQueueIndex,
  onPlayQueueSong,
  sourcePath,
}) => {
  const { playerPosition } = useSettings();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDesktop = useIsDesktop();

  const handlePlaybackBlocked = useCallback(() => {
    if (isPlaying) onPlayPause();
  }, [isPlaying, onPlayPause]);

  const audioState = useAudioPlayer({
    currentSong,
    isPlaying,
    repeatMode,
    onSeek,
    onNext,
    onRequestStreamUrl,
    onPlaybackBlocked: handlePlaybackBlocked,
  });

  const handleArtClick = useCallback(() => {
    if (sourcePath) navigate(sourcePath);
  }, [sourcePath, navigate]);

  const openFullscreen = useCallback(() => setIsFullscreen(true), []);
  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  const variantProps = useMemo<PlayerVariantProps | null>(() => {
    if (!currentSong) return null;
    return {
      currentSong,
      isPlaying,
      isLoading: audioState.isLoading,
      duration: audioState.duration,
      currentTime: audioState.currentTime,
      displayProgress: audioState.displayProgress,
      volume: audioState.volume,
      isMuted: audioState.isMuted,
      isDragging: audioState.isDragging,
      isVolumeDragging: audioState.isVolumeDragging,
      shuffle,
      repeatMode,
      queue,
      currentQueueIndex,
      sourcePath,
      onPlayPause,
      onNext,
      onPrevious,
      onStop,
      onToggleShuffle,
      onToggleRepeat,
      onToggleMute: audioState.toggleMute,
      onProgressPointerDown: audioState.handleProgressPointerDown,
      onVolumePointerDown: audioState.handleVolumePointerDown,
      volumeWheelRef: audioState.handleVolumeWheel,
      onPlayQueueSong,
      formatTime: audioState.formatTime,
      handleArtClick,
    };
  }, [
    currentSong,
    isPlaying,
    shuffle,
    repeatMode,
    queue,
    currentQueueIndex,
    sourcePath,
    onPlayPause,
    onNext,
    onPrevious,
    onStop,
    onToggleShuffle,
    onToggleRepeat,
    onPlayQueueSong,
    handleArtClick,
    audioState.isLoading,
    audioState.duration,
    audioState.currentTime,
    audioState.displayProgress,
    audioState.volume,
    audioState.isMuted,
    audioState.isDragging,
    audioState.isVolumeDragging,
    audioState.toggleMute,
    audioState.handleProgressPointerDown,
    audioState.handleVolumePointerDown,
    audioState.handleVolumeWheel,
    audioState.formatTime,
  ]);

  if (!variantProps) return null;

  const isPanel = isDesktop && (playerPosition === "left" || playerPosition === "right");
  const isFloater = isDesktop && playerPosition.startsWith(FLOATER_POSITION_PREFIX);
  const floaterCorner = isFloater
    ? playerPosition.slice(FLOATER_POSITION_PREFIX.length)
    : "";

  let variant: React.ReactNode;
  if (isFloater) {
    variant = <PlayerFloater {...variantProps} corner={floaterCorner} />;
  } else if (isPanel) {
    variant = <PlayerPanel {...variantProps} />;
  } else if (isDesktop) {
    variant = <PlayerDesktop {...variantProps} />;
  } else if (isFullscreen) {
    variant = <PlayerFullscreen {...variantProps} onClose={closeFullscreen} />;
  } else {
    variant = <PlayerMini {...variantProps} onOpenFullscreen={openFullscreen} />;
  }

  return (
    <>
      <audio ref={audioState.audioRef} preload="metadata" />
      {variant}
    </>
  );
};

export default Player;
