import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SubsonicPlaylist } from "../types/subsonic";
import { buildPseudoAlbum } from "../utils/playlist";
import { usePlaylists, PlaylistSortType } from "../hooks/usePlaylists";
import { useViewMode } from "../hooks/useViewMode";
import { useToast } from "../hooks/useToast";
import { useShufflePlay } from "../hooks/useShufflePlay";
import { formatTotalDuration } from "../utils/duration";
import { toErrorMessage } from "../utils/errors";
import ScrollSentinel from "../components/ScrollSentinel";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import MediaCard from "../components/MediaCard";
import MediaTable, { MediaTableHeader } from "../components/MediaTable";
import MediaTableRow from "../components/MediaTableRow";
import ConfirmDialog from "../components/ConfirmDialog";
import CreatePlaylistDialog from "../components/CreatePlaylistDialog";
import Toast from "../components/Toast";

const SORT_OPTIONS = [
  { value: "nameAsc", label: "Name A-Z" },
  { value: "nameDesc", label: "Name Z-A" },
  { value: "mostSongs", label: "Most Songs" },
  { value: "recentlyPlayed", label: "Recently Played" },
  { value: "recentlyChanged", label: "Recently Changed" },
  { value: "random", label: "Random" },
];

const TABLE_HEADERS: MediaTableHeader[] = [
  { label: "Name" },
  { label: "Songs" },
  { label: "Duration" },
];

const PlaylistsPage: React.FC = () => {
  const { subsonicService, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode("viewMode:playlists");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<SubsonicPlaylist | null>(null);
  const { toast, showToast } = useToast();
  const shufflePlay = useShufflePlay(showToast);

  const {
    playlists, loading, hasMore, sortType, setSortType,
    searchText, setSearchText, loadMore, refresh,
    createPlaylist, deletePlaylist, getCoverArtUrl,
  } = usePlaylists(subsonicService, isAuthenticated, showToast);

  const handleCreate = async (name: string) => {
    try {
      await createPlaylist(name);
      setShowCreateDialog(false);
      showToast("Playlist created");
    } catch (err) {
      showToast(`Failed to create playlist: ${toErrorMessage(err)}`);
    }
  };

  const handleDelete = async (playlist: SubsonicPlaylist) => {
    setPlaylistToDelete(null);
    try {
      await deletePlaylist(playlist);
      showToast("Playlist deleted");
    } catch (err) {
      showToast(`Failed to delete playlist: ${toErrorMessage(err)}`);
    }
  };

  const handlePlay = (playlist: SubsonicPlaylist) => {
    if (!subsonicService) return;
    shufflePlay(async () => {
      const data = await subsonicService.getPlaylist(playlist.id);
      return { album: buildPseudoAlbum(playlist), songs: data.songs };
    });
  };

  const openPlaylist = (playlist: SubsonicPlaylist) =>
    navigate(`/playlist/${playlist.id}`);

  return (
    <div className="page">
      <ListPageHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        placeholder="Search playlists..."
        sortOptions={SORT_OPTIONS}
        sortType={sortType}
        onSortChange={(value) => setSortType(value as PlaylistSortType)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "grid" ? "table" : "grid"))}
        onRefresh={refresh}
        extra={
          <button
            className="btn-icon"
            onClick={() => setShowCreateDialog(true)}
            aria-label="Create playlist"
            title="Create playlist"
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="page-scroll">
        {loading && playlists.length === 0 ? (
          <CenteredSpinner />
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            <p>No playlists yet</p>
            <button className="btn btn-primary" onClick={() => setShowCreateDialog(true)}>
              <Plus size={14} /> Create Playlist
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="album-grid">
                {playlists.map((playlist) => (
                  <MediaCard
                    key={playlist.id}
                    imageUrl={getCoverArtUrl(playlist.coverArt)}
                    title={playlist.name}
                    subtitle={`${playlist.songCount} songs · ${formatTotalDuration(playlist.duration)}`}
                    onClick={() => openPlaylist(playlist)}
                    onPlay={() => handlePlay(playlist)}
                    onDelete={() => setPlaylistToDelete(playlist)}
                  />
                ))}
              </div>
            ) : (
              <MediaTable headers={TABLE_HEADERS}>
                {playlists.map((playlist) => (
                  <MediaTableRow
                    key={playlist.id}
                    title={playlist.name}
                    cells={[
                      String(playlist.songCount),
                      formatTotalDuration(playlist.duration),
                    ]}
                    onClick={() => openPlaylist(playlist)}
                    onPlay={() => handlePlay(playlist)}
                    trailingAction={
                      <button
                        className="btn-icon table-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(playlist);
                        }}
                        aria-label="Delete playlist"
                      >
                        <Trash2 size={12} />
                      </button>
                    }
                  />
                ))}
              </MediaTable>
            )}
            <ScrollSentinel
              onVisible={loadMore}
              hasMore={hasMore}
              loading={loading}
              itemCount={playlists.length}
            />
          </>
        )}
      </div>

      {showCreateDialog && (
        <CreatePlaylistDialog
          onSubmit={handleCreate}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {playlistToDelete && (
        <ConfirmDialog
          title="Delete Playlist"
          message={`Are you sure you want to delete "${playlistToDelete.name}"?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => handleDelete(playlistToDelete)}
          onCancel={() => setPlaylistToDelete(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default PlaylistsPage;
