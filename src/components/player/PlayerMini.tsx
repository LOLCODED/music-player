import React, { useRef } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

interface PlayerMiniProps extends PlayerVariantProps {
  onOpenFullscreen: () => void;
}

const PlayerMini: React.FC<PlayerMiniProps> = ({
  currentSong, isPlaying, isLoading, displayProgress, isDragging,
  onPlayPause, onNext, onPrevious, onStop,
  onProgressMouseDown, sourcePath, handleArtClick, onOpenFullscreen,
}) => {
  const touchStart = useRef({ x: 0, y: 0 });

  return (
    <div
      className="player-mini"
      onClick={onOpenFullscreen}
      onTouchStart={(e) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 60) onStop();
        } else {
          if (dy < -40) onOpenFullscreen();
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
            ? <div className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
            : isPlaying
            ? <Pause size={16} fill="currentColor" />
            : <Play size={16} fill="currentColor" style={{ marginLeft: 1 }} />}
        </button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
          <SkipForward size={16} fill="currentColor" />
        </button>
      </div>

      <ProgressBar displayProgress={displayProgress} isDragging={isDragging}
        onMouseDown={onProgressMouseDown} style={{ margin: "0 2px" }} />
    </div>
  );
};

export default PlayerMini;
