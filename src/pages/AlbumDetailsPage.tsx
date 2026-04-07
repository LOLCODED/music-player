import React, { useState } from "react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { ArrowLeft, Play, Pause, Plus, Star, X, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { useParams, useHistory } from "react-router-dom";
import { SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAlbumDetails } from "../hooks/useAlbumDetails";
import { useStarToggle } from "../hooks/useStarToggle";

const AlbumDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { subsonicService } = useAuth();
  const { playSong, playAlbum, isCurrentSong, isPlaying, currentSong, shuffle, repeatMode, toggleShuffle, toggleRepeat } = useMusicPlayer();
  const history = useHistory();

  const [toast, setToast] = useState("");
  const [selectedSong, setSelectedSong] = useState<SubsonicSong | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { album, songs, loading, playlists, getCoverArtUrl, addToPlaylist, createPlaylist } =
    useAlbumDetails(id, subsonicService, showToast);
  const { isStarred, toggleStar } = useStarToggle(subsonicService);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const formatTotalDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handlePlaylistSelect = async (playlist: SubsonicPlaylist) => {
    if (!selectedSong) return;
    try {
      await addToPlaylist(playlist.id, selectedSong.id);
      setShowPlaylistSelector(false);
      showToast(`Added "${selectedSong.title}" to "${playlist.name}"`);
    } catch (err) {
      showToast(`Failed to add to playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!selectedSong || !newPlaylistName.trim()) return;
    try {
      await createPlaylist(newPlaylistName.trim(), selectedSong.id);
      setShowCreatePlaylist(false);
      setNewPlaylistName("");
      showToast(`Created playlist "${newPlaylistName}" with "${selectedSong.title}"`);
    } catch (err) {
      showToast(`Failed to create playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="page-header">
        <button className="btn-icon" onClick={() => history.goBack()} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {album?.name || "Album"}
        </span>
      </div>

      <div className="page-scroll">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {album && (
              <div style={{ padding: "24px 16px 16px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <img
                  src={getCoverArtUrl(album.coverArt)}
                  alt={album.name}
                  style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
                />
                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{album.name}</div>
                  <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{album.artist}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                    {[
                      album.year,
                      songs.length > 0 && `${songs.length} songs · ${formatTotalDuration(songs.reduce((sum, s) => sum + (s.duration || 0), 0))}`,
                    ].filter(Boolean).join(" · ")}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={() => album && songs.length && playAlbum(album, songs, 0)}>
                      <Play size={14} fill="currentColor" /> Play Album
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        if (!currentSong && songs.length > 0) {
                          if (!shuffle) toggleShuffle();
                          playAlbum(album, songs, Math.floor(Math.random() * songs.length));
                        } else {
                          toggleShuffle();
                        }
                      }}
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
                    {(() => {
                      const starred = isStarred(album.id, album.starred);
                      return (
                        <button
                          className="btn"
                          onClick={(e) => toggleStar(album.id, "album", starred, e)}
                          style={{ color: starred ? "var(--accent)" : undefined, borderColor: starred ? "var(--accent)" : undefined }}
                          aria-label={starred ? "Remove from favorites" : "Add to favorites"}
                          title={starred ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star size={14} fill={starred ? "currentColor" : "none"} />
                        </button>
                      );
                    })()}
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
                    key={song.id}
                    className={`track-row ${isCurrentSong(song.id) ? "active" : ""}`}
                    onClick={() => album && playSong(song, album, songs)}
                  >
                    <span style={{ flex: "0 0 28px", textAlign: "right", color: "var(--fg-dim)", fontSize: 11 }}>
                      {isCurrentSong(song.id)
                        ? isPlaying ? <Pause size={12} /> : <Play size={12} />
                        : index + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                      {song.artist !== album?.artist && (
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {song.artist}
                        </div>
                      )}
                    </div>
                    <span style={{ width: 60, textAlign: "right", color: "var(--fg-dim)", fontSize: 11, flexShrink: 0 }}>
                      {formatDuration(song.duration)}
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
                      style={{ width: 32, flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedSong(song); setShowPlaylistSelector(true); }}
                      aria-label="Add to playlist"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showPlaylistSelector && (
        <div className="modal-overlay" onClick={() => setShowPlaylistSelector(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Add to Playlist</h3>
              <button className="btn-icon" onClick={() => setShowPlaylistSelector(false)}><X size={16} /></button>
            </div>
            <button className="btn" style={{ justifyContent: "flex-start" }}
              onClick={() => { setShowPlaylistSelector(false); setShowCreatePlaylist(true); }}>
              <Plus size={14} /> Create New Playlist
            </button>
            {playlists.map((pl) => (
              <button key={pl.id} className="btn" style={{ justifyContent: "flex-start" }}
                onClick={() => handlePlaylistSelect(pl)}>
                {pl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCreatePlaylist && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Create New Playlist</h3>
            <input
              type="text" placeholder="Playlist name" value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn" onClick={() => { setShowCreatePlaylist(false); setNewPlaylistName(""); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreatePlaylist}>Create</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default AlbumDetailsPage;
