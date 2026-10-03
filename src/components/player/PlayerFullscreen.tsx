import React from "react";
import { ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlayerVariantProps } from "../../types/player";
import PlayerTransport from "./PlayerTransport";
import QueueList from "./QueueList";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const QUEUE_STYLE: React.CSSProperties = {
  flex: "none",
  borderTop: "1px solid var(--border)",
};

interface PlayerFullscreenProps extends PlayerVariantProps {
  onClose: () => void;
}

const PlayerFullscreen: React.FC<PlayerFullscreenProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  queue, currentQueueIndex, onPlayQueueSong,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressPointerDown, onVolumePointerDown, volumeWheelRef,
  sourcePath, handleArtClick, formatTime, onClose,
}) => {
  const navigate = useNavigate();

  return (
    <div className="player-fullscreen">
      <div className="player-fullscreen-header">
        <button className="btn-icon" onClick={onClose} aria-label="Collapse player">
          <ChevronDown size={20} />
        </button>
        <span className="player-fullscreen-heading">
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
          <div className="player-panel-readout">
            <div>
              <div className="player-panel-title">{currentSong.title}</div>
              <div
                className="player-panel-artist player-fullscreen-artist"
                onClick={() => {
                  onClose();
                  navigate(`/albums?artist=${encodeURIComponent(currentSong.artist)}`);
                }}
              >
                {currentSong.artist}
              </div>
              {currentSong.albumName && (
                <div
                  className="player-fullscreen-album"
                  style={{ cursor: currentSong.albumId ? "pointer" : "default" }}
                  onClick={() => {
                    if (currentSong.albumId) {
                      onClose();
                      navigate(`/album/${currentSong.albumId}`);
                    }
                  }}
                >
                  {currentSong.albumName}
                </div>
              )}
            </div>

            <div className="player-progress-section">
              <span className="player-time">{formatTime(currentTime)}</span>
              <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onPointerDown={onProgressPointerDown} />
              <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
            </div>
          </div>

          <PlayerTransport
            size="large"
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

          <div className="player-controls player-volume-row" style={{ gap: 8 }}>
            <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} iconSize={16} onToggleMute={onToggleMute}
              onPointerDown={onVolumePointerDown} wheelRef={volumeWheelRef}
              barStyle={{ flex: 1 }} />
          </div>
        </div>

        <QueueList
          queue={queue}
          currentQueueIndex={currentQueueIndex}
          onPlayQueueSong={onPlayQueueSong}
          style={QUEUE_STYLE}
        />
      </div>
    </div>
  );
};

export default PlayerFullscreen;
