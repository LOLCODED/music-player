import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeBarProps {
  volume: number;
  isMuted: boolean;
  isDragging?: boolean;
  iconSize?: number;
  onToggleMute: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  // Ref callback that attaches a non-passive wheel listener to the bar.
  wheelRef: (element: HTMLElement | null) => void;
  barStyle?: React.CSSProperties;
}

const VolumeBar: React.FC<VolumeBarProps> = ({
  volume,
  isMuted,
  isDragging = false,
  iconSize = 14,
  onToggleMute,
  onPointerDown,
  wheelRef,
  barStyle,
}) => (
  <>
    <button className="btn-icon" onClick={onToggleMute} aria-label="Toggle mute">
      {isMuted || volume === 0 ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
    </button>
    <div
      ref={wheelRef}
      className="volume-bar"
      style={{ touchAction: "none", ...barStyle }}
      onPointerDown={onPointerDown}
    >
      <div className="volume-fill" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
        <div className="volume-handle" style={{ opacity: isDragging ? 1 : 0.6 }} />
      </div>
    </div>
  </>
);

export default VolumeBar;
