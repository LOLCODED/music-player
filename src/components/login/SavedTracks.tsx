import React from "react";
import { X } from "lucide-react";
import type { SavedConnection } from "../../hooks/useSavedConnections";
import { trackNumber } from "../../utils/trackNumber";

interface Props {
  connections: SavedConnection[];
  firstNumber: number;
  connectingTo: string | null;
  onPlay: (connection: SavedConnection) => void;
  onRemove: (id: string) => void;
}

/** Saved servers listed as the tracks that follow the sign-in fields. */
const SavedTracks: React.FC<Props> = ({ connections, firstNumber, connectingTo, onPlay, onRemove }) => {
  if (connections.length === 0) return null;
  return (
    <section className="liner-saved" aria-label="Saved servers">
      <div className="liner-heading">Saved servers</div>
      <ul>
        {connections.map((c, i) => (
          <li key={c.id} className="liner-row liner-saved-row">
            <span className="liner-row-number">{trackNumber(firstNumber + i)}</span>
            <button className="liner-saved-play" onClick={() => onPlay(c)} disabled={connectingTo !== null}>
              <span className="liner-saved-name">{c.name}</span>
              <span className="liner-saved-url">
                {connectingTo === c.name ? "connecting…" : `${c.serverUrl} · ${c.username}`}
              </span>
            </button>
            <button
              className="btn-icon liner-saved-remove"
              onClick={() => onRemove(c.id)}
              aria-label={`Remove ${c.name}`}
              title="Remove server"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SavedTracks;
