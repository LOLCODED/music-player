import React from "react";

interface ProgressBarProps {
  displayProgress: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  displayProgress,
  isDragging,
  onPointerDown,
  onClick,
  style,
}) => (
  <div
    className="progress-bar"
    // touch-action none lets pointer capture handle touch drags without the
    // browser turning them into scrolls.
    style={{ touchAction: "none", ...style }}
    onPointerDown={onPointerDown}
    onClick={onClick}
  >
    <div className="progress-fill" style={{ width: `${displayProgress}%` }}>
      <div className="progress-handle" style={{ opacity: isDragging ? 1 : 0.6 }} />
    </div>
  </div>
);

export default ProgressBar;
