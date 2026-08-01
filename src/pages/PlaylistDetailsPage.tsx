import React, { useState } from "react";
import { Play, Repeat, Repeat1, Shuffle, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { SubsonicSong } from "../types/subsonic";
import { buildPseudoAlbum } from "../utils/playlist";
import { usePlaylistDetails } from "../hooks/usePlaylistDetails";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { formatTotalDuration } from "../utils/duration";
import { toErrorMessage } from "../utils/errors";
import CenteredSpinner from "../components/CenteredSpinner";
import DetailHeader from "../components/DetailHeader";
import DetailHero from "../components/DetailHero";
import TrackListHeader from "../components/TrackListHeader";
import TrackRow from "../components/TrackRow";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";

const PlaylistDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { subsonicService } = useAuth();
  const {
    playAlbum, isCurrentSong, isPlaying, currentSong,
    shuffle, repeatMode, toggleShuffle, toggleRepeat,
  } = useMusicPlayer();
  const { toast, showToast } = useToast();

  const [confirmRemove, setConfirmRemove] =
    useState<{ song: SubsonicSong; index: number } | null>(null);

  const { playlist, songs, loading, removeSong, getCoverArtUrl } =
    usePlaylistDetails(id, subsonicService, showToast);
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);

  const handleRemoveSong = async (songIndex: number) => {
    try {
      await removeSong(songIndex);
      showToast("Song removed");
    } catch (err) {
      showToast(`Failed to remove song: ${toErrorMessage(err)}`);
    }
    setConfirmRemove(null);
  };

  // Playing through the playlist keeps its context (queue + playlist id).
  const playFromIndex = (index: number) => {
    if (!playlist || songs.length === 0) return;
    playAlbum(buildPseudoAlbum(playlist), songs, index, playlist.id);
  };

  const handleShuffleClick = () => {
    if (!playlist || songs.length === 0) return;
    if (!currentSong) {
      if (!shuffle) toggleShuffle();
      playAlbum(buildPseudoAlbum(playlist), songs, Math.floor(Math.random() * songs.length));
    } else {
      toggleShuffle();
    }
  };

  return (
    <div className="page">
      <DetailHeader title={playlist?.name || "Playlist"} />

      <div className="page-scroll">
        {loading ? (
          <CenteredSpinner />
        ) : (
          <>
            {playlist && (
              <DetailHero
                imageUrl={getCoverArtUrl(playlist.coverArt)}
                title={playlist.name}
                metaLines={[
                  `${playlist.songCount} songs · ${formatTotalDuration(playlist.duration)}`,
                  playlist.comment ?? "",
                ]}
                actions={
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => playFromIndex(0)}
                      disabled={songs.length === 0}
                    >
                      <Play size={14} fill="currentColor" /> Play Playlist
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
                    key={`${song.id}-${index}`}
                    index={index}
                    title={song.title}
                    subtitle={song.artist}
                    durationSeconds={song.duration || 0}
                    active={isCurrentSong(song.id)}
                    playing={isPlaying}
                    starred={starred}
                    onClick={() => playFromIndex(index)}
                    onToggleStar={(e) => toggleStar(song.id, "song", starred, e)}
                    trailingAction={
                      <button
                        className="btn-icon track-row-action danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmRemove({ song, index });
                        }}
                        aria-label="Remove from playlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {confirmRemove && (
        <ConfirmDialog
          title="Remove Song"
          message={`Remove "${confirmRemove.song.title}" from this playlist?`}
          confirmLabel="Remove"
          destructive
          onConfirm={() => handleRemoveSong(confirmRemove.index)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default PlaylistDetailsPage;
