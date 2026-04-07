import React from "react";
import { createPortal } from "react-dom";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

interface PlayerFloaterProps extends PlayerVariantProps {
  corner: string;
}

const PlayerFloater: React.FC<PlayerFloaterProps> = ({
  currentSong, isPlaying, isLoading, displayProgress, volume, isMuted,
  onPlayPause, onNext, onPrevious, onStop,
  onVolumeMouseDown, onVolumeWheel,
  sourcePath, handleArtClick, corner,
}) =>
  createPortal(
    <div className={`player-floater player-floater-${corner}`}>
      <div className="player-close-tooltip" onClick={onStop} role="button" aria-label="Close player">
        <X size={11} />
        <span>Close</span>
      </div>
      <div className="player-floater-inner">
        <div className="player-floater-body">
          <img
            className={`player-floater-art${sourcePath ? " art-clickable" : ""}`}
            src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
            alt={currentSong.title}
            onClick={handleArtClick}
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
          />
          <div className="player-floater-info">
            <div className="player-floater-title">{currentSong.title}</div>
            <div className="player-floater-artist">{currentSong.artist}</div>
          </div>
          <div className="player-floater-controls">
            <button className="btn-icon" onClick={onPrevious} aria-label="Previous">
              <SkipBack size={14} fill="currentColor" />
            </button>
            <button className="player-play-btn" onClick={onPlayPause} disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}>
              {isLoading
                ? <div className="spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                : isPlaying
                ? <Pause size={14} fill="currentColor" />
                : <Play size={14} fill="currentColor" style={{ marginLeft: 1 }} />}
            </button>
            <button className="btn-icon" onClick={onNext} aria-label="Next">
              <SkipForward size={14} fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="player-floater-footer">
          <div
            className="volume-bar"
            style={{ flex: 1 }}
            onMouseDown={onVolumeMouseDown}
            onWheel={onVolumeWheel}
          >
            <div className="volume-fill" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
          </div>
        </div>
        <div className="player-floater-progress">
          <div className="player-floater-progress-fill" style={{ width: `${displayProgress}%` }} />
        </div>
      </div>
    </div>,
    document.body
  );

export default PlayerFloater;
