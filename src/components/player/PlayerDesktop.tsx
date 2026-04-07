import React from "react";
import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const PlayerDesktop: React.FC<PlayerVariantProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressMouseDown, onVolumeMouseDown, onVolumeWheel,
  sourcePath, handleArtClick, formatTime,
}) => (
  <div className="player-desktop">
    <div className="player-close-tooltip" onClick={onStop} role="button" aria-label="Close player">
      <X size={11} />
      <span>Close</span>
    </div>

    <div className="player-desktop-left">
      <img
        className={`player-desktop-art${sourcePath ? " art-clickable" : ""}`}
        src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
        alt={currentSong.title}
        onClick={handleArtClick}
        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
      />
      <div className="player-desktop-info">
        <div className="player-desktop-title">{currentSong.title}</div>
        <div className="player-desktop-artist">{currentSong.artist}</div>
      </div>
    </div>

    <div className="player-desktop-center">
      <div className="player-controls" style={{ justifyContent: "center", gap: 8 }}>
        <button className="btn-icon" onClick={onToggleShuffle} aria-label="Toggle shuffle"
          style={{ color: shuffle ? "var(--accent)" : undefined }}>
          <Shuffle size={15} />
        </button>
        <button className="btn-icon" onClick={onPrevious} aria-label="Previous">
          <SkipBack size={18} fill="currentColor" />
        </button>
        <button className="player-play-btn" onClick={onPlayPause} disabled={isLoading}
          aria-label={isPlaying ? "Pause" : "Play"}>
          {isLoading
            ? <div className="spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
            : isPlaying
            ? <Pause size={18} fill="currentColor" />
            : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
        <button className="btn-icon" onClick={onNext} aria-label="Next">
          <SkipForward size={18} fill="currentColor" />
        </button>
        <button className="btn-icon" onClick={onToggleRepeat} aria-label="Toggle repeat"
          style={{ color: repeatMode !== "off" ? "var(--accent)" : undefined }}>
          {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
        </button>
      </div>
      <div className="player-desktop-progress">
        <span className="player-time">{formatTime(currentTime)}</span>
        <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onMouseDown={onProgressMouseDown} />
        <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
      </div>
    </div>

    <div className="player-desktop-right">
      <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} onToggleMute={onToggleMute}
        onMouseDown={onVolumeMouseDown} onWheel={onVolumeWheel} barStyle={{ width: 80 }} />
    </div>
  </div>
);

export default PlayerDesktop;
