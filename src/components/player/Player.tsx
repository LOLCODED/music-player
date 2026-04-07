import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Song, TrackPreview, QueueEntry, PlayerVariantProps, RepeatMode } from "../../types/player";
import { useSettings } from "../../contexts/SettingsContext";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import PlayerDesktop from "./PlayerDesktop";
import PlayerMini from "./PlayerMini";
import PlayerFullscreen from "./PlayerFullscreen";
import PlayerPanel from "./PlayerPanel";
import PlayerFloater from "./PlayerFloater";

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onSeek: (progress: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onRequestStreamUrl: (songId: string, timeOffset?: number) => string;
  prevPreview?: TrackPreview;
  nextPreview?: TrackPreview;
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

const Player: React.FC<PlayerProps> = (props) => {
  const { playerPosition } = useSettings();
  const history = useHistory();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const audioState = useAudioPlayer({
    currentSong: props.currentSong,
    isPlaying: props.isPlaying,
    repeatMode: props.repeatMode,
    onSeek: props.onSeek,
    onNext: props.onNext,
    onRequestStreamUrl: props.onRequestStreamUrl,
  });

  if (!props.currentSong) return null;

  const isPanel = isDesktop && (playerPosition === "left" || playerPosition === "right");
  const isFloater = isDesktop && playerPosition.startsWith("floater");
  const floaterCorner = isFloater ? playerPosition.slice("floater-".length) : "";

  const variantProps: PlayerVariantProps = {
    currentSong: props.currentSong,
    isPlaying: props.isPlaying,
    isLoading: audioState.isLoading,
    duration: audioState.duration,
    currentTime: audioState.currentTime,
    displayProgress: audioState.displayProgress,
    volume: audioState.volume,
    isMuted: audioState.isMuted,
    isDragging: audioState.isDragging,
    isVolumeDragging: audioState.isVolumeDragging,
    shuffle: props.shuffle,
    repeatMode: props.repeatMode,
    prevPreview: props.prevPreview,
    nextPreview: props.nextPreview,
    queue: props.queue,
    currentQueueIndex: props.currentQueueIndex,
    sourcePath: props.sourcePath,
    onPlayPause: props.onPlayPause,
    onNext: props.onNext,
    onPrevious: props.onPrevious,
    onStop: props.onStop,
    onToggleShuffle: props.onToggleShuffle,
    onToggleRepeat: props.onToggleRepeat,
    onToggleMute: audioState.toggleMute,
    onProgressMouseDown: audioState.handleProgressMouseDown,
    onVolumeMouseDown: audioState.handleVolumeMouseDown,
    onVolumeWheel: audioState.handleVolumeWheel,
    onPlayQueueSong: props.onPlayQueueSong,
    formatTime: audioState.formatTime,
    handleArtClick: () => { if (props.sourcePath) history.push(props.sourcePath); },
  };

  return (
    <>
      <audio ref={audioState.audioRef} preload="metadata" />

      {isFloater && <PlayerFloater {...variantProps} corner={floaterCorner} />}

      {!isFloater && (
        <>
          {isFullscreen
            ? <PlayerFullscreen {...variantProps} onClose={() => setIsFullscreen(false)} />
            : <PlayerMini {...variantProps} onOpenFullscreen={() => setIsFullscreen(true)} />}

          {isPanel && <PlayerPanel {...variantProps} />}

          {!isPanel && !isFullscreen && <PlayerDesktop {...variantProps} />}
        </>
      )}
    </>
  );
};

export default Player;
