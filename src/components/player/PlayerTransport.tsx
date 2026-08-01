import React from "react";
import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { RepeatMode } from "../../types/player";
import Spinner from "./Spinner";

export type TransportSize = "default" | "large";

const TRANSPORT_SIZES: Record<
  TransportSize,
  {
    toggleIcon: number;
    skipIcon: number;
    playIcon: number;
    spinner: number;
    playButtonClass: string;
  }
> = {
  default: {
    toggleIcon: 15,
    skipIcon: 18,
    playIcon: 18,
    spinner: 14,
    playButtonClass: "player-play-btn",
  },
  large: {
    toggleIcon: 18,
    skipIcon: 22,
    playIcon: 22,
    spinner: 18,
    playButtonClass: "player-play-btn large",
  },
};

const CONTROLS_STYLE: React.CSSProperties = { justifyContent: "center", gap: 8 };

interface PlayerTransportProps {
  isPlaying: boolean;
  isLoading: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  size?: TransportSize;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

const PlayerTransport: React.FC<PlayerTransportProps> = ({
  isPlaying,
  isLoading,
  shuffle,
  repeatMode,
  size = "default",
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const sizes = TRANSPORT_SIZES[size];

  return (
    <div className="player-controls" style={CONTROLS_STYLE}>
      <button
        className="btn-icon"
        onClick={onToggleShuffle}
        aria-label="Toggle shuffle"
        style={{ color: shuffle ? "var(--accent)" : undefined }}
      >
        <Shuffle size={sizes.toggleIcon} />
      </button>
      <button className="btn-icon" onClick={onPrevious} aria-label="Previous">
        <SkipBack size={sizes.skipIcon} fill="currentColor" />
      </button>
      <button
        className={sizes.playButtonClass}
        onClick={onPlayPause}
        disabled={isLoading}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <Spinner size={sizes.spinner} />
        ) : isPlaying ? (
          <Pause size={sizes.playIcon} fill="currentColor" />
        ) : (
          <Play size={sizes.playIcon} fill="currentColor" style={{ marginLeft: 2 }} />
        )}
      </button>
      <button className="btn-icon" onClick={onNext} aria-label="Next">
        <SkipForward size={sizes.skipIcon} fill="currentColor" />
      </button>
      <button
        className="btn-icon"
        onClick={onToggleRepeat}
        aria-label="Toggle repeat"
        style={{ color: repeatMode !== "off" ? "var(--accent)" : undefined }}
      >
        {repeatMode === "one" ? <Repeat1 size={sizes.toggleIcon} /> : <Repeat size={sizes.toggleIcon} />}
      </button>
    </div>
  );
};

export default React.memo(PlayerTransport);
