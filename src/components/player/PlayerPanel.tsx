import React from "react";
import { X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import PlayerTransport from "./PlayerTransport";
import QueueList from "./QueueList";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const PlayerPanel: React.FC<PlayerVariantProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  queue, currentQueueIndex, onPlayQueueSong,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressPointerDown, onVolumePointerDown, volumeWheelRef,
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
          <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onPointerDown={onProgressPointerDown} />
          <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
        </div>

        <PlayerTransport
          isPlaying={isPlaying}
          isLoading={isLoading}
          shuffle={shuffle}
          repeatMode={repeatMode}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
        />

        <div className="player-controls" style={{ gap: 8 }}>
          <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} onToggleMute={onToggleMute}
            onPointerDown={onVolumePointerDown} wheelRef={volumeWheelRef} barStyle={{ flex: 1 }} />
        </div>
      </div>
    </div>

    <QueueList queue={queue} currentQueueIndex={currentQueueIndex} onPlayQueueSong={onPlayQueueSong} />
  </div>
);

export default PlayerPanel;
