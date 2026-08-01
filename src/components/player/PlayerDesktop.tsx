import React from "react";
import { X } from "lucide-react";
import { PlayerVariantProps } from "../../types/player";
import PlayerTransport from "./PlayerTransport";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";

const PlayerDesktop: React.FC<PlayerVariantProps> = ({
  currentSong, isPlaying, isLoading, currentTime, duration, displayProgress,
  isDragging, isVolumeDragging, volume, isMuted, shuffle, repeatMode,
  onPlayPause, onNext, onPrevious, onStop, onToggleShuffle, onToggleRepeat,
  onToggleMute, onProgressPointerDown, onVolumePointerDown, volumeWheelRef,
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
      <div className="player-desktop-progress">
        <span className="player-time">{formatTime(currentTime)}</span>
        <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onPointerDown={onProgressPointerDown} />
        <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
      </div>
    </div>

    <div className="player-desktop-right">
      <VolumeBar volume={volume} isMuted={isMuted} isDragging={isVolumeDragging} onToggleMute={onToggleMute}
        onPointerDown={onVolumePointerDown} wheelRef={volumeWheelRef} barStyle={{ width: 80 }} />
    </div>
  </div>
);

export default PlayerDesktop;
