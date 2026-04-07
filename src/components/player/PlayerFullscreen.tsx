import React from "react";
import {
  Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ChevronDown, X,
} from "lucide-react";
import { useHistory } from "react-router-dom";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

interface PlayerFullscreenProps extends PlayerVariantProps {
  onClose: () => void;
}

const PlayerFullscreen: React.FC<PlayerFullscreenProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  queue, currentQueueIndex, onPlayQueueSong,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressMouseDown, onVolumeMouseDown, onVolumeWheel,
  sourcePath, handleArtClick, formatTime, onClose,
}) => {
  const history = useHistory();

  return (
    <div className="player-fullscreen">
      <div className="player-fullscreen-header">
        <button className="btn-icon" onClick={onClose} aria-label="Collapse player">
          <ChevronDown size={20} />
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--fg-muted)" }}>
          Now Playing
        </span>
        <button className="btn-icon" onClick={onStop} aria-label="Close player">
          <X size={18} />
        </button>
      </div>

      <div className="player-fullscreen-scroll">
        <img
          className={`player-fullscreen-panel-art${sourcePath ? " art-clickable" : ""}`}
          src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
          alt={currentSong.title}
          onClick={handleArtClick}
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
        />

        <div className="player-fullscreen-panel-body">
          <div>
            <div className="player-panel-title">{currentSong.title}</div>
            <div
              className="player-panel-artist"
              style={{ cursor: "pointer", color: "var(--accent)" }}
              onClick={() => {
                onClose();
                history.push(`/albums?artist=${encodeURIComponent(currentSong.artist)}`);
              }}
            >
              {currentSong.artist}
            </div>
            {currentSong.albumName && (
              <div
                style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2, cursor: currentSong.albumId ? "pointer" : "default" }}
                onClick={() => {
                  if (currentSong.albumId) {
                    onClose();
                    history.push(`/album/${currentSong.albumId}`);
                  }
                }}
              >
                {currentSong.albumName}
              </div>
            )}
          </div>

          <div className="player-progress-section">
            <span className="player-time">{formatTime(currentTime)}</span>
            <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onMouseDown={onProgressMouseDown} />
            <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
          </div>

          <div className="player-controls" style={{ justifyContent: "center", gap: 8 }}>
            <button className="btn-icon" onClick={onToggleShuffle} aria-label="Toggle shuffle"
              style={{ color: shuffle ? "var(--accent)" : undefined }}>
              <Shuffle size={18} />
            </button>
            <button className="btn-icon" onClick={onPrevious} aria-label="Previous">
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button className="player-play-btn large" onClick={onPlayPause} disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}>
              {isLoading
                ? <div className="spinner" style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                : isPlaying
                ? <Pause size={22} fill="currentColor" />
                : <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
            <button className="btn-icon" onClick={onNext} aria-label="Next">
              <SkipForward size={22} fill="currentColor" />
            </button>
            <button className="btn-icon" onClick={onToggleRepeat} aria-label="Toggle repeat"
              style={{ color: repeatMode !== "off" ? "var(--accent)" : undefined }}>
              {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          <div className="player-controls" style={{ gap: 8 }}>
            <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} iconSize={16} onToggleMute={onToggleMute}
              onMouseDown={onVolumeMouseDown} onWheel={onVolumeWheel}
              barStyle={{ flex: 1 }} />
          </div>
        </div>

        {queue && queue.length > 0 && (
          <div className="player-panel-queue" style={{ flex: "none", borderTop: "1px solid var(--border)" }}>
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
    </div>
  );
};

export default PlayerFullscreen;
