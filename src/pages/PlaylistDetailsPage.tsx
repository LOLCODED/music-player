import React, { useState } from "react";
import { ArrowLeft, Play, Pause, Star, Trash2, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { useParams, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { SubsonicSong } from "../types/subsonic";
import { buildPseudoAlbum } from "../utils/playlist";
import { usePlaylistDetails } from "../hooks/usePlaylistDetails";
import { useStarToggle } from "../hooks/useStarToggle";

const PlaylistDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { subsonicService } = useAuth();
  const { playSong, playAlbum, isCurrentSong, isPlaying, currentSong, shuffle, repeatMode, toggleShuffle, toggleRepeat } = useMusicPlayer();
  const history = useHistory();

  const [toast, setToast] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<{ song: SubsonicSong; index: number } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { playlist, songs, loading, removeSong, getCoverArtUrl } =
    usePlaylistDetails(id, subsonicService, showToast);
  const { isStarred, toggleStar } = useStarToggle(subsonicService);

  const handleRemoveSong = async (songIndex: number) => {
    try {
      await removeSong(songIndex);
      showToast("Song removed");
    } catch (err) {
      showToast(`Failed to remove song: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setConfirmRemove(null);
  };

  const handlePlayPlaylist = () => {
    if (!playlist || songs.length === 0) return;
    playAlbum(buildPseudoAlbum(playlist), songs, 0, playlist.id);
  };

  const handleShufflePlay = () => {
    if (!playlist || songs.length === 0) return;
    if (!currentSong) {
      if (!shuffle) toggleShuffle();
      playAlbum(buildPseudoAlbum(playlist), songs, Math.floor(Math.random() * songs.length));
    } else {
      toggleShuffle();
    }
  };

  const formatDuration = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="page-header">
        <button className="btn-icon" onClick={() => history.goBack()} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {playlist?.name || "Playlist"}
        </span>
      </div>

      <div className="page-scroll">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><div className="spinner" /></div>
        ) : (
          <>
            {playlist && (
              <div style={{ padding: "24px 16px 16px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <img
                  src={getCoverArtUrl(playlist.coverArt)}
                  alt={playlist.name}
                  style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/assets/default-playlist-art.png"; }}
                />
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{playlist.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                    {playlist.songCount} songs · {(() => {
                      const h = Math.floor(playlist.duration / 3600);
                      const m = Math.floor((playlist.duration % 3600) / 60);
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    })()}
                  </div>
                  {playlist.comment && (
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{playlist.comment}</div>
                  )}
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={handlePlayPlaylist} disabled={songs.length === 0}>
                      <Play size={14} fill="currentColor" /> Play Playlist
                    </button>
                    <button
                      className="btn"
                      onClick={handleShufflePlay}
                      style={{ color: shuffle ? "var(--accent)" : undefined, borderColor: shuffle ? "var(--accent)" : undefined }}
                    >
                      <Shuffle size={14} />
                    </button>
                    <button
                      className="btn"
                      onClick={toggleRepeat}
                      style={{ color: repeatMode !== "off" ? "var(--accent)" : undefined, borderColor: repeatMode !== "off" ? "var(--accent)" : undefined }}
                    >
                      {repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="track-row header">
                <span style={{ flex: "0 0 28px", textAlign: "right" }}>#</span>
                <span style={{ flex: 1 }}>Title</span>
                <span style={{ width: 60, textAlign: "right" }}>Time</span>
                <span style={{ width: 64 }} />
              </div>
              {songs.map((song, index) => {
                const starred = isStarred(song.id, song.starred);
                return (
                  <div
                    key={`${song.id}-${index}`}
                    className={`track-row ${isCurrentSong(song.id) ? "active" : ""}`}
                    onClick={() => playSong(song, undefined, songs)}
                  >
                    <span style={{ flex: "0 0 28px", textAlign: "right", color: "var(--fg-dim)", fontSize: 11 }}>
                      {isCurrentSong(song.id)
                        ? isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />
                        : index + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {song.artist}
                      </div>
                    </div>
                    <span style={{ width: 60, textAlign: "right", color: "var(--fg-dim)", fontSize: 11, flexShrink: 0 }}>
                      {formatDuration(song.duration || 0)}
                    </span>
                    <button
                      className="btn-icon"
                      style={{ width: 32, flexShrink: 0, color: starred ? "var(--accent)" : undefined }}
                      onClick={(e) => toggleStar(song.id, "song", starred, e)}
                      aria-label={starred ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={13} fill={starred ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ width: 32, flexShrink: 0, color: "var(--error)" }}
                      onClick={(e) => { e.stopPropagation(); setConfirmRemove({ song, index }); }}
                      aria-label="Remove from playlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {confirmRemove && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Remove Song</h3>
            <p>Remove "{confirmRemove.song.title}" from this playlist?</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button
                className="btn"
                style={{ background: "var(--error)", borderColor: "var(--error)", color: "white" }}
                onClick={() => handleRemoveSong(confirmRemove.index)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default PlaylistDetailsPage;
