import React from "react";
import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const PlayerPanel: React.FC<PlayerVariantProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  queue, currentQueueIndex, onPlayQueueSong,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressMouseDown, onVolumeMouseDown, onVolumeWheel,
  sourcePath, handleArtClick, formatTime,
}) => (
  <div className="player-panel">
    <div className="player-panel-topbar">
      <button className="btn-icon" onClick={onStop} aria-label="Close player">
        <X size={14} />
      </button>
    </div>

    <div className="player-panel-controls">
      <img
        className={`player-panel-art${sourcePath ? " art-clickable" : ""}`}
        src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
        alt={currentSong.title}
        onClick={handleArtClick}
        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
      />
      <div className="player-panel-body">
        <div>
          <div className="player-panel-title">{currentSong.title}</div>
          <div className="player-panel-artist">{currentSong.artist}</div>
        </div>

        <div className="player-progress-section">
          <span className="player-time">{formatTime(currentTime)}</span>
          <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onMouseDown={onProgressMouseDown} />
          <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
        </div>

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

        <div className="player-controls" style={{ gap: 8 }}>
          <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} onToggleMute={onToggleMute}
            onMouseDown={onVolumeMouseDown} onWheel={onVolumeWheel} barStyle={{ flex: 1 }} />
        </div>
      </div>
    </div>

    {queue && queue.length > 0 && (
      <div className="player-panel-queue">
        <div className="player-panel-queue-header">Queue</div>
        {queue.map((entry, i) => (
          <div
            key={entry.id + i}
            className={`player-panel-queue-item${i === currentQueueIndex ? " active" : ""}`}
            onClick={() => onPlayQueueSong?.(i)}
          >
            <div className="player-panel-queue-title">{entry.title}</div>
            {entry.artist && (
              <div className="player-panel-queue-artist">{entry.artist}</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PlayerPanel;
