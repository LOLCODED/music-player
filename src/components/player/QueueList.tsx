import React from "react";
import { QueueEntry } from "../../types/player";

interface QueueListProps {
  queue?: QueueEntry[];
  currentQueueIndex?: number;
  onPlayQueueSong?: (index: number) => void;
  style?: React.CSSProperties;
}

const QueueList: React.FC<QueueListProps> = ({
  queue,
  currentQueueIndex,
  onPlayQueueSong,
  style,
}) => {
  if (!queue || queue.length === 0) return null;

  return (
    <div className="player-panel-queue" style={style}>
      <div className="player-panel-queue-header">Queue</div>
      {queue.map((entry, i) => (
        <div
          key={`${entry.id}-${i}`}
          className={`player-panel-queue-item${i === currentQueueIndex ? " active" : ""}`}
          onClick={() => onPlayQueueSong?.(i)}
        >
          <div className="player-panel-queue-title">{entry.title}</div>
          {entry.artist && (
            <div className="player-panel-queue-artist">{entry.artist}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(QueueList);
