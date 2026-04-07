import React, { useState } from "react";
import { LayoutGrid, List, Play, Plus, Trash2, X } from "lucide-react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { SubsonicPlaylist } from "../types/subsonic";
import { buildPseudoAlbum } from "../utils/playlist";
import { usePlaylists } from "../hooks/usePlaylists";
import { useViewMode } from "../hooks/useViewMode";
import ScrollSentinel from "../components/ScrollSentinel";
import PageActions from "../components/PageActions";

const PlaylistsPage: React.FC = () => {
  const { subsonicService, isAuthenticated } = useAuth();
  const { playAlbum, shuffle, toggleShuffle } = useMusicPlayer();
  const history = useHistory();

  const [toast, setToast] = useState("");
  const [viewMode, setViewMode] = useViewMode("viewMode:playlists");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlistToDelete, setPlaylistToDelete] = useState<SubsonicPlaylist | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { playlists, loading, hasMore, sortType, setSortType, searchText, setSearchText, loadMore, refresh, createPlaylist, deletePlaylist, getCoverArtUrl } =
    usePlaylists(subsonicService, isAuthenticated, showToast);

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreateDialog(false);
      showToast("Playlist created");
    } catch (err) {
      showToast(`Failed to create playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (playlist: SubsonicPlaylist) => {
    try {
      await deletePlaylist(playlist);
      showToast("Playlist deleted");
    } catch (err) {
      showToast(`Failed to delete playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handlePlay = async (playlist: SubsonicPlaylist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subsonicService) return;
    try {
      const data = await subsonicService.getPlaylist(playlist.id);
      if (data.songs.length > 0) {
        if (!shuffle) toggleShuffle();
        const randomIndex = Math.floor(Math.random() * data.songs.length);
        playAlbum(buildPseudoAlbum(playlist), data.songs, randomIndex);
      }
    } catch (err) {
      showToast(`Failed to play playlist: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search playlists..."
            style={{ flex: 1, maxWidth: 360 }}
          />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as typeof sortType)}
            style={{ width: "auto", minWidth: 150, flexShrink: 0 }}
          >
            <option value="nameAsc">Name A-Z</option>
            <option value="nameDesc">Name Z-A</option>
            <option value="mostSongs">Most Songs</option>
            <option value="recentlyPlayed">Recently Played</option>
            <option value="recentlyChanged">Recently Changed</option>
            <option value="random">Random</option>
          </select>
          <button
            className="btn-icon"
            onClick={() => setViewMode((v) => v === "grid" ? "table" : "grid")}
            title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            aria-label="Toggle view"
          >
            {viewMode === "grid" ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>
        </div>
        <button className="btn-icon" onClick={() => setShowCreateDialog(true)} aria-label="Create playlist" title="Create playlist">
          <Plus size={18} />
        </button>
        <PageActions onRefresh={refresh} />
      </div>

      <div className="page-scroll">
        {loading && playlists.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><div className="spinner" /></div>
        ) : playlists.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--fg-muted)" }}>
            <p style={{ marginBottom: 12 }}>No playlists yet</p>
            <button className="btn btn-primary" onClick={() => setShowCreateDialog(true)}>
              <Plus size={14} /> Create Playlist
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="album-grid">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="album-card" onClick={() => history.push(`/playlist/${playlist.id}`)}>
                  <img
                    src={getCoverArtUrl(playlist.coverArt)}
                    alt={playlist.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/default-playlist-art.png"; }}
                  />
                  <button className="album-card-play" onClick={(e) => handlePlay(playlist, e)} aria-label={`Play ${playlist.name}`}>
                    <Play size={13} style={{ marginLeft: 1 }} fill="currentColor" />
                  </button>
                  <div className="album-card-info">
                    <div className="album-card-title">{playlist.name}</div>
                    <div className="album-card-artist">{playlist.songCount} songs · {formatDuration(playlist.duration)}</div>
                  </div>
                  <button
                    className="btn-icon"
                    style={{ position: "absolute", bottom: 48, right: 4, opacity: 0, transition: "opacity 0.15s" }}
                    onClick={(e) => { e.stopPropagation(); setPlaylistToDelete(playlist); }}
                    aria-label="Delete playlist"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <ScrollSentinel onVisible={loadMore} hasMore={hasMore} loading={loading} itemCount={playlists.length} />
          </>
        ) : (
          <>
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 28 }}>Name</th>
                  <th>Songs</th>
                  <th>Duration</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {playlists.map((playlist) => (
                  <tr
                    key={playlist.id}
                    className="content-table-row"
                    onClick={() => history.push(`/playlist/${playlist.id}`)}
                  >
                    <td className="content-table-name">
                      <div className="content-table-name-cell">
                        <button
                          className="table-play-btn"
                          onClick={(e) => handlePlay(playlist, e)}
                          aria-label={`Play ${playlist.name}`}
                        >
                          <Play size={11} fill="currentColor" />
                        </button>
                        {playlist.name}
                      </div>
                    </td>
                    <td className="content-table-sub">{playlist.songCount}</td>
                    <td className="content-table-sub">{formatDuration(playlist.duration)}</td>
                    <td>
                      <div>
                        <button
                          className="btn-icon table-delete-btn"
                          onClick={(e) => { e.stopPropagation(); setPlaylistToDelete(playlist); }}
                          aria-label="Delete playlist"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ScrollSentinel onVisible={loadMore} hasMore={hasMore} loading={loading} itemCount={playlists.length} />
          </>
        )}
      </div>

      {showCreateDialog && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Create New Playlist</h3>
              <button className="btn-icon" onClick={() => setShowCreateDialog(false)}><X size={16} /></button>
            </div>
            <input
              type="text" placeholder="Playlist name" value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn" onClick={() => { setShowCreateDialog(false); setNewPlaylistName(""); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {playlistToDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Playlist</h3>
            <p>Are you sure you want to delete "{playlistToDelete.name}"?</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setPlaylistToDelete(null)}>Cancel</button>
              <button
                className="btn"
                style={{ background: "var(--error)", borderColor: "var(--error)", color: "white" }}
                onClick={() => { handleDelete(playlistToDelete); setPlaylistToDelete(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default PlaylistsPage;
