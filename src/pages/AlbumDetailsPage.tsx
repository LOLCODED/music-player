import React from "react";
import { Play, Repeat, Repeat1, Shuffle, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAlbumDetails } from "../hooks/useAlbumDetails";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { useAddToPlaylist } from "../hooks/useAddToPlaylist";
import { formatTotalDuration } from "../utils/duration";
import CenteredSpinner from "../components/CenteredSpinner";
import DetailHeader from "../components/DetailHeader";
import DetailHero from "../components/DetailHero";
import TrackListHeader from "../components/TrackListHeader";
import TrackRow from "../components/TrackRow";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import Toast from "../components/Toast";

const AlbumDetailsPage: React.FC = () => {
  const { id = "" } = useParams();
  const { subsonicService } = useAuth();
  const {
    playSong, playAlbum, isCurrentSong, isPlaying, currentSong,
    shuffle, repeatMode, toggleShuffle, toggleRepeat,
  } = useMusicPlayer();
  const { toast, showToast } = useToast();

  const { album, songs, loading, getCoverArtUrl } = useAlbumDetails(id, subsonicService, showToast);
  const { openAddToPlaylist, addToPlaylistDialog } = useAddToPlaylist(showToast);
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);

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
    <div className="page detail-page">
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
                      <AddToPlaylistButton
                        className="track-row-action"
                        onClick={() => openAddToPlaylist(song)}
                      />
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {addToPlaylistDialog}

      <Toast message={toast} />
    </div>
  );
};

export default AlbumDetailsPage;
