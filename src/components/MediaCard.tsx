import React from "react";
import { Pause, Play, Star, Trash2 } from "lucide-react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";

interface MediaCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  starred?: boolean;
  playing?: boolean;
  onClick: () => void;
  onPlay: (e: React.MouseEvent) => void;
  onToggleStar?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const MediaCard = React.memo(function MediaCard({
  imageUrl,
  title,
  subtitle,
  starred,
  playing = false,
  onClick,
  onPlay,
  onToggleStar,
  onDelete,
}: MediaCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const stop = (handler: (e: React.MouseEvent) => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      handler(e);
    };
  };

  return (
    <div
      className={`album-card${playing ? " active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART;
        }}
      />
      {onToggleStar && (
        <button
          className={`album-card-star${starred ? " starred" : ""}`}
          onClick={stop(onToggleStar)}
          aria-label={starred ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={13} fill={starred ? "currentColor" : "none"} />
        </button>
      )}
      <button
        className="album-card-play"
        onClick={stop(onPlay)}
        aria-label={`Play ${title}`}
      >
        {playing ? (
          <Pause size={13} fill="currentColor" />
        ) : (
          <Play size={13} style={{ marginLeft: 1 }} fill="currentColor" />
        )}
      </button>
      <div className="album-card-info">
        <div className="album-card-title">{title}</div>
        <div className="album-card-artist">{subtitle}</div>
      </div>
      {onDelete && (
        <button
          className="btn-icon album-card-delete"
          onClick={stop(onDelete)}
          aria-label={`Delete ${title}`}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
});

export default MediaCard;
