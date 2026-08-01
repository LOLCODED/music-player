import React from "react";
import { Pause, Play, Star } from "lucide-react";
import { formatTrackDuration } from "../utils/duration";

interface TrackRowProps {
  index: number;
  title: string;
  subtitle?: string;
  durationSeconds?: number;
  active: boolean;
  playing: boolean;
  starred: boolean;
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
  trailingAction?: React.ReactNode;
}

const TrackRow = React.memo(function TrackRow({
  index,
  title,
  subtitle,
  durationSeconds,
  active,
  playing,
  starred,
  onClick,
  onToggleStar,
  trailingAction,
}: TrackRowProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`track-row${active ? " active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <span className="track-row-num">
        {active ? (
          playing ? (
            <Pause size={12} />
          ) : (
            <Play size={12} />
          )
        ) : (
          index + 1
        )}
      </span>
      <div className="track-row-main">
        <div className="track-row-title">{title}</div>
        {subtitle && <div className="track-row-subtitle">{subtitle}</div>}
      </div>
      <span className="track-row-time">
        {durationSeconds != null ? formatTrackDuration(durationSeconds) : ""}
      </span>
      <button
        className={`btn-icon track-row-action${starred ? " starred" : ""}`}
        onClick={onToggleStar}
        aria-label={starred ? "Remove from favorites" : "Add to favorites"}
      >
        <Star size={13} fill={starred ? "currentColor" : "none"} />
      </button>
      {trailingAction}
    </div>
  );
});

export default TrackRow;
