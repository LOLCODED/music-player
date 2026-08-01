import React from "react";
import { createPortal } from "react-dom";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import Spinner from "./Spinner";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const FLOATER_SPINNER_SIZE = 12;
const FLOATER_VOLUME_ICON_SIZE = 12;

interface PlayerFloaterProps extends PlayerVariantProps {
  corner: string;
}

const PlayerFloater: React.FC<PlayerFloaterProps> = ({
  currentSong, isPlaying, isLoading, displayProgress, isDragging,
  volume, isMuted, isVolumeDragging,
  onPlayPause, onNext, onPrevious, onStop, onToggleMute,
  onProgressPointerDown, onVolumePointerDown, volumeWheelRef,
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
                ? <Spinner size={FLOATER_SPINNER_SIZE} />
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
          <VolumeBar
            volume={volume}
            isMuted={isMuted}
            isDragging={isVolumeDragging}
            iconSize={FLOATER_VOLUME_ICON_SIZE}
            onToggleMute={onToggleMute}
            onPointerDown={onVolumePointerDown}
            wheelRef={volumeWheelRef}
            barStyle={{ flex: 1 }}
          />
        </div>
        <ProgressBar
          displayProgress={displayProgress}
          isDragging={isDragging}
          onPointerDown={onProgressPointerDown}
        />
      </div>
    </div>,
    document.body
  );

export default PlayerFloater;
