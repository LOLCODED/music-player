import React, { useRef } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import Spinner from "./Spinner";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

// Swipe right past this distance closes the player.
const SWIPE_CLOSE_THRESHOLD_PX = 60;
// Swipe up past this distance (negative dy) opens the fullscreen player.
const SWIPE_OPEN_THRESHOLD_PX = -40;

const PROGRESS_STYLE: React.CSSProperties = { margin: "0 2px" };

interface PlayerMiniProps extends PlayerVariantProps {
  onOpenFullscreen: () => void;
}

const PlayerMini: React.FC<PlayerMiniProps> = ({
  currentSong, isPlaying, isLoading, displayProgress, isDragging,
  onPlayPause, onNext, onPrevious, onStop,
  onProgressPointerDown, sourcePath, handleArtClick, onOpenFullscreen,
}) => {
  const touchStart = useRef({ x: 0, y: 0 });

  return (
    <div
      className="player-mini"
      onClick={onOpenFullscreen}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (!touch) return;
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(e) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const dx = touch.clientX - touchStart.current.x;
        const dy = touch.clientY - touchStart.current.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > SWIPE_CLOSE_THRESHOLD_PX) onStop();
        } else {
          if (dy < SWIPE_OPEN_THRESHOLD_PX) onOpenFullscreen();
        }
      }}
    >
      <div className="player-mini-row">
        <img
          className={`player-mini-art${sourcePath ? " art-clickable" : ""}`}
          src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
          alt={currentSong.title}
          onClick={(e) => { e.stopPropagation(); handleArtClick(); }}
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
        />
        <div className="player-mini-info">
          <div className="player-mini-title">{currentSong.title}</div>
          <div className="player-mini-artist">{currentSong.artist}</div>
        </div>

        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onPrevious(); }} aria-label="Previous">
          <SkipBack size={16} fill="currentColor" />
        </button>
        <button className="player-play-btn" onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          disabled={isLoading} aria-label={isPlaying ? "Pause" : "Play"}>
          {isLoading
            ? <Spinner />
            : isPlaying
            ? <Pause size={16} fill="currentColor" />
            : <Play size={16} fill="currentColor" style={{ marginLeft: 1 }} />}
        </button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
          <SkipForward size={16} fill="currentColor" />
        </button>
      </div>

      <ProgressBar displayProgress={displayProgress} isDragging={isDragging}
        onPointerDown={onProgressPointerDown}
        onClick={(e) => e.stopPropagation()}
        style={PROGRESS_STYLE} />
    </div>
  );
};

export default PlayerMini;
