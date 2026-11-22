import React, { useCallback, useRef, useState } from "react";
import { ChevronDown, Disc3, ListMusic, ListPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlayerVariantProps } from "../../types/player";
import PlayerTransport from "./PlayerTransport";
import QueueList from "./QueueList";
import ProgressBar from "./ProgressBar";
import VolumeBar from "./VolumeBar";
import { DEFAULT_ALBUM_ART } from "../../utils/defaultArt";
import { isIOS } from "../../utils/platform";
import { motionAllowed } from "../../utils/motion";
import { useSheetDrag } from "../../hooks/useSheetDrag";

const CLOSE_ANIMATION_MS = 240;

interface PlayerFullscreenProps extends PlayerVariantProps {
  onClose: () => void;
}

type ReadoutProps = Pick<PlayerFullscreenProps, "currentSong" | "currentTime" | "duration" | "displayProgress"
  | "isDragging" | "onProgressPointerDown" | "formatTime"> & { onArtist: () => void };

const NowPlayingReadout: React.FC<ReadoutProps> = ({
  currentSong, currentTime, duration, displayProgress, isDragging, onProgressPointerDown, formatTime, onArtist,
}) => (
  <div className="player-panel-readout">
    <div>
      <div className="player-panel-title">{currentSong.title}</div>
      <button type="button" className="player-panel-artist player-fullscreen-artist" onClick={onArtist}>
        {currentSong.artist}
      </button>
      {currentSong.albumName && <div className="player-fullscreen-album">{currentSong.albumName}</div>}
    </div>
    <div className="player-progress-section">
      <span className="player-time">{formatTime(currentTime)}</span>
      <ProgressBar displayProgress={displayProgress} isDragging={isDragging} onPointerDown={onProgressPointerDown} />
      <span className="player-time" style={{ textAlign: "right" }}>{formatTime(duration)}</span>
    </div>
  </div>
);

interface FooterProps {
  showQueue: boolean;
  upNext: number;
  onToggleQueue: () => void;
  onAlbum?: () => void;
  onAddToPlaylist?: () => void;
}

const NowPlayingFooter: React.FC<FooterProps> = ({ showQueue, upNext, onToggleQueue, onAlbum, onAddToPlaylist }) => (
  <div className="player-fullscreen-footer">
    <button className={showQueue ? "is-selected" : undefined} onClick={onToggleQueue} aria-pressed={showQueue}>
      <ListMusic size={18} aria-hidden="true" /> {showQueue ? "Artwork" : `Up next · ${upNext}`}
    </button>
    <button onClick={onAlbum} disabled={!onAlbum}>
      <Disc3 size={18} aria-hidden="true" /> Go to album
    </button>
    {onAddToPlaylist && (
      <button onClick={onAddToPlaylist} aria-label="Add to playlist">
        <ListPlus size={18} aria-hidden="true" /> Add to list
      </button>
    )}
  </div>
);

// iOS ignores audio.volume; the hardware buttons set it, so the slider is left out there.
const NowPlayingVolume: React.FC<PlayerVariantProps> = (props) => (
  <div className="player-controls player-volume-row" style={{ gap: 8 }}>
    <VolumeBar volume={props.volume} isMuted={props.isMuted} isDragging={props.isVolumeDragging} iconSize={16}
      onToggleMute={props.onToggleMute} onPointerDown={props.onVolumePointerDown} wheelRef={props.volumeWheelRef}
      barStyle={{ flex: 1 }} />
  </div>
);

function useAnimatedClose(onClose: () => void) {
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => {
    if (!motionAllowed()) return onClose();
    setClosing(true);
    window.setTimeout(onClose, CLOSE_ANIMATION_MS);
  }, [onClose]);
  return { closing, requestClose };
}

const PlayerFullscreen: React.FC<PlayerFullscreenProps> = (props) => {
  const { currentSong, queue, currentQueueIndex, onPlayQueueSong, onStop, sourcePath, handleArtClick, onClose } = props;
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showQueue, setShowQueue] = useState(false);
  const { closing, requestClose } = useAnimatedClose(onClose);
  useSheetDrag(sheetRef, scrollRef, requestClose);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };
  const albumPath = currentSong.albumId ? `/album/${currentSong.albumId}` : null;
  const upNext = queue && currentQueueIndex !== undefined ? queue.length - currentQueueIndex - 1 : 0;

  return (
    <div ref={sheetRef} className={`player-fullscreen${closing ? " closing" : ""}`} role="dialog" aria-label="Now playing">
      <div className="player-fullscreen-header">
        <button className="btn-icon" onClick={requestClose} aria-label="Collapse player">
          <ChevronDown size={22} />
        </button>
        <span className="player-fullscreen-heading">{currentSong.albumName ?? "Now Playing"}</span>
        <button className="btn-icon" onClick={onStop} aria-label="Close player">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className={`player-fullscreen-scroll${showQueue ? " showing-queue" : ""}`}>
        {showQueue ? (
          <QueueList queue={queue} currentQueueIndex={currentQueueIndex} onPlayQueueSong={onPlayQueueSong} />
        ) : (
          <img
            className={`player-fullscreen-panel-art${sourcePath ? " art-clickable" : ""}`}
            src={currentSong.albumArtUrl || DEFAULT_ALBUM_ART}
            alt={currentSong.title}
            onClick={handleArtClick}
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
          />
        )}

        <div className="player-fullscreen-panel-body">
          <NowPlayingReadout
            {...props}
            onArtist={() => goTo(`/albums?artist=${encodeURIComponent(currentSong.artist)}`)}
          />
          <PlayerTransport size="sheet" {...props} />
          {!isIOS() && <NowPlayingVolume {...props} />}
        </div>
      </div>

      <NowPlayingFooter
        showQueue={showQueue}
        upNext={upNext}
        onToggleQueue={() => setShowQueue((v) => !v)}
        onAlbum={albumPath ? () => goTo(albumPath) : undefined}
        onAddToPlaylist={props.onAddToPlaylist}
      />
    </div>
  );
};

export default PlayerFullscreen;
