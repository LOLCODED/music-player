import React from "react";

interface ProgressBarProps {
  displayProgress: number;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  displayProgress,
  isDragging,
  onMouseDown,
  style,
}) => (
  <div className="progress-bar" style={style} onMouseDown={onMouseDown}>
    <div className="progress-fill" style={{ width: `${displayProgress}%` }}>
      <div className="progress-handle" style={{ opacity: isDragging ? 1 : 0.6 }} />
    </div>
  </div>
);

export default ProgressBar;
