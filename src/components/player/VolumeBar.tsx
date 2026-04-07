import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeBarProps {
  volume: number;
  isMuted: boolean;
  isDragging?: boolean;
  iconSize?: number;
  onToggleMute: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  barStyle?: React.CSSProperties;
}

const VolumeBar: React.FC<VolumeBarProps> = ({
  volume,
  isMuted,
  isDragging = false,
  iconSize = 14,
  onToggleMute,
  onMouseDown,
  onWheel,
  barStyle,
}) => (
  <>
    <button className="btn-icon" onClick={onToggleMute} aria-label="Toggle mute">
      {isMuted || volume === 0 ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
    </button>
    <div
      className="volume-bar"
      style={barStyle}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      <div className="volume-fill" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}>
        <div className="volume-handle" style={{ opacity: isDragging ? 1 : 0.6 }} />
      </div>
    </div>
  </>
);

export default VolumeBar;
