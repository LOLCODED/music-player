import React from "react";
import { Pause, Play } from "lucide-react";

interface MediaTableRowProps {
  title: string;
  cells: string[];
  time?: string;
  active?: boolean;
  playing?: boolean;
  trailingAction?: React.ReactNode;
  onClick: () => void;
  onPlay: (e: React.MouseEvent) => void;
}

const MediaTableRow = React.memo(
  function MediaTableRow({
    title,
    cells,
    time,
    active = false,
    playing = false,
    trailingAction,
    onClick,
    onPlay,
  }: MediaTableRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <tr
        className={`content-table-row${active ? " active" : ""}`}
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        <td className="content-table-name">
          <div className="content-table-name-cell">
            <button
              className="table-play-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(e);
              }}
              aria-label={`Play ${title}`}
            >
              {playing ? (
                <Pause size={11} fill="currentColor" />
              ) : (
                <Play size={11} fill="currentColor" />
              )}
            </button>
            {title}
          </div>
        </td>
        {cells.map((cell, index) => (
          <td key={index} className="content-table-sub">
            {cell}
          </td>
        ))}
        {time !== undefined && <td className="content-table-time">{time}</td>}
        <td>{trailingAction && <div>{trailingAction}</div>}</td>
      </tr>
    );
  }
);

export default MediaTableRow;
