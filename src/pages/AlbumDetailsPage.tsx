import React, { useState } from "react";
import { Play, Plus, Repeat, Repeat1, Shuffle, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAlbumDetails } from "../hooks/useAlbumDetails";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { formatTotalDuration } from "../utils/duration";
import { toErrorMessage } from "../utils/errors";
import CenteredSpinner from "../components/CenteredSpinner";
import DetailHeader from "../components/DetailHeader";
import DetailHero from "../components/DetailHero";
import TrackListHeader from "../components/TrackListHeader";
import TrackRow from "../components/TrackRow";
import Modal from "../components/Modal";
import CreatePlaylistDialog from "../components/CreatePlaylistDialog";
import Toast from "../components/Toast";

const AlbumDetailsPage: React.FC = () => {
  const { id = "" } = useParams();
  const { subsonicService } = useAuth();
  const {
    playSong, playAlbum, isCurrentSong, isPlaying, currentSong,
    shuffle, repeatMode, toggleShuffle, toggleRepeat,
  } = useMusicPlayer();
  const { toast, showToast } = useToast();

  const [selectedSong, setSelectedSong] = useState<SubsonicSong | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  const { album, songs, loading, playlists, getCoverArtUrl, addToPlaylist, createPlaylist } =
    useAlbumDetails(id, subsonicService, showToast);
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);

  const handlePlaylistSelect = async (playlist: SubsonicPlaylist) => {
    if (!selectedSong) return;
    try {
      await addToPlaylist(playlist.id, selectedSong.id);
      setShowPlaylistSelector(false);
      showToast(`Added "${selectedSong.title}" to "${playlist.name}"`);
    } catch (err) {
      showToast(`Failed to add to playlist: ${toErrorMessage(err)}`);
    }
  };

  const handleCreatePlaylist = async (name: string) => {
    if (!selectedSong) return;
    try {
      await createPlaylist(name, selectedSong.id);
      setShowCreatePlaylist(false);
      showToast(`Created playlist "${name}" with "${selectedSong.title}"`);
    } catch (err) {
      showToast(`Failed to create playlist: ${toErrorMessage(err)}`);
    }
  };

  const handleShuffleClick = () => {
    if (!album) return;
    if (!currentSong && songs.length > 0) {
      if (!shuffle) toggleShuffle();
      playAlbum(album, songs, Math.floor(Math.random() * songs.length));
    } else {
      toggleShuffle();
    }
  };

  const albumStarred = album ? isStarred(album.id, album.starred) : false;
  const totalSeconds = songs.reduce((sum, song) => sum + (song.duration || 0), 0);

  return (
    <div className="page">
      <DetailHeader title={album?.name || "Album"} />

      <div className="page-scroll">
        {loading ? (
          <CenteredSpinner />
        ) : (
          <>
            {album && (
              <DetailHero
                imageUrl={getCoverArtUrl(album.coverArt)}
                title={album.name}
                subtitle={album.artist}
                metaLines={[
                  [
                    album.year,
                    songs.length > 0 &&
                      `${songs.length} songs · ${formatTotalDuration(totalSeconds)}`,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                ]}
                actions={
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => songs.length > 0 && playAlbum(album, songs, 0)}
                    >
                      <Play size={14} fill="currentColor" /> Play Album
                    </button>
                    <button
                      className={`btn${shuffle ? " btn-toggled" : ""}`}
                      onClick={handleShuffleClick}
                      aria-label="Toggle shuffle"
                    >
                      <Shuffle size={14} />
                    </button>
                    <button
                      className={`btn${repeatMode !== "off" ? " btn-toggled" : ""}`}
                      onClick={toggleRepeat}
                      aria-label="Toggle repeat"
                    >
                      {repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
                    </button>
                    <button
                      className={`btn${albumStarred ? " btn-toggled" : ""}`}
                      onClick={(e) => toggleStar(album.id, "album", albumStarred, e)}
                      aria-label={albumStarred ? "Remove from favorites" : "Add to favorites"}
                      title={albumStarred ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={14} fill={albumStarred ? "currentColor" : "none"} />
                    </button>
                  </>
                }
              />
            )}

            <div>
              <TrackListHeader />
              {songs.map((song, index) => {
                const starred = isStarred(song.id, song.starred);
                return (
                  <TrackRow
                    key={song.id}
                    index={index}
                    title={song.title}
                    subtitle={song.artist !== album?.artist ? song.artist : undefined}
                    durationSeconds={song.duration}
                    active={isCurrentSong(song.id)}
                    playing={isPlaying}
                    starred={starred}
                    onClick={() => album && playSong(song, album, songs)}
                    onToggleStar={(e) => toggleStar(song.id, "song", starred, e)}
                    trailingAction={
                      <button
                        className="btn-icon track-row-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSong(song);
                          setShowPlaylistSelector(true);
                        }}
                        aria-label="Add to playlist"
                      >
                        <Plus size={14} />
                      </button>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {showPlaylistSelector && (
        <Modal
          title="Add to Playlist"
          onClose={() => setShowPlaylistSelector(false)}
          showCloseButton
        >
          <button
            className="btn modal-list-btn"
            onClick={() => {
              setShowPlaylistSelector(false);
              setShowCreatePlaylist(true);
            }}
          >
            <Plus size={14} /> Create New Playlist
          </button>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              className="btn modal-list-btn"
              onClick={() => handlePlaylistSelect(playlist)}
            >
              {playlist.name}
            </button>
          ))}
        </Modal>
      )}

      {showCreatePlaylist && (
        <CreatePlaylistDialog
          onSubmit={handleCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default AlbumDetailsPage;
