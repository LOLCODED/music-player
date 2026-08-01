import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useFavorites, FavoritesSection } from "../hooks/useFavorites";
import { useViewMode } from "../hooks/useViewMode";
import { useToast } from "../hooks/useToast";
import { useShufflePlay } from "../hooks/useShufflePlay";
import { formatTrackDuration } from "../utils/duration";
import { toErrorMessage } from "../utils/errors";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import MediaCard from "../components/MediaCard";
import MediaTable, { MediaTableHeader } from "../components/MediaTable";
import MediaTableRow from "../components/MediaTableRow";
import StarActionButton from "../components/StarActionButton";
import Toast from "../components/Toast";

const SECTION_OPTIONS = [
  { value: "songs", label: "Songs" },
  { value: "albums", label: "Albums" },
];

const SONG_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
  { label: "Album" },
  { label: "Time", align: "right", width: 56 },
];

const ALBUM_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
];

interface FavoriteItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  cells: string[];
  time?: string;
  active: boolean;
  playing: boolean;
  onOpen: () => void;
  onPlay: () => void;
  onUnstar: () => void;
}

const FavoritesPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playSong, isCurrentSong, isPlaying } = useMusicPlayer();
  const navigate = useNavigate();
  const [section, setSection] = useState<FavoritesSection>("songs");
  const [viewMode, setViewMode] = useViewMode("viewMode:favorites");
  const { toast, showToast } = useToast();
  const shufflePlay = useShufflePlay(showToast);

  const {
    songs, albums, loading, error,
    searchText, setSearchText,
    unstarSong, unstarAlbum,
    refresh, getCoverArtUrl,
  } = useFavorites(subsonicService);

  const handleUnstar = async (unstar: () => Promise<void>) => {
    try {
      await unstar();
    } catch (err) {
      showToast(`Failed to remove favorite: ${toErrorMessage(err)}`);
    }
  };

  const handlePlayAlbum = (albumId: string) => {
    if (!subsonicService) return;
    shufflePlay(async () => {
      const data = await subsonicService.getAlbum(albumId);
      return { album: data.album, songs: data.songs };
    });
  };

  const items: FavoriteItem[] =
    section === "songs"
      ? songs.map((song) => ({
          id: song.id,
          imageUrl: getCoverArtUrl(song.coverArt),
          title: song.title,
          subtitle: song.artist,
          cells: [song.artist, song.album],
          time: song.duration ? formatTrackDuration(song.duration) : "",
          active: isCurrentSong(song.id),
          playing: isCurrentSong(song.id) && isPlaying,
          onOpen: () => playSong(song, undefined, songs),
          onPlay: () => playSong(song, undefined, songs),
          onUnstar: () => handleUnstar(() => unstarSong(song.id)),
        }))
      : albums.map((album) => ({
          id: album.id,
          imageUrl: getCoverArtUrl(album.coverArt),
          title: album.name,
          subtitle: album.artist,
          cells: [album.artist],
          time: undefined,
          active: false,
          playing: false,
          onOpen: () => navigate(`/album/${album.id}`),
          onPlay: () => handlePlayAlbum(album.id),
          onUnstar: () => handleUnstar(() => unstarAlbum(album.id)),
        }));

  const showSpinner = loading && items.length === 0;

  return (
    <div className="page">
      <ListPageHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        placeholder={section === "songs" ? "Search songs..." : "Search albums..."}
        sortOptions={SECTION_OPTIONS}
        sortType={section}
        onSortChange={(value) => setSection(value as FavoritesSection)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "grid" ? "table" : "grid"))}
        onRefresh={refresh}
      />

      <div className="page-scroll">
        {showSpinner ? (
          <CenteredSpinner />
        ) : items.length === 0 ? (
          <div className="empty-state">No favorite {section} yet</div>
        ) : viewMode === "table" ? (
          <MediaTable headers={section === "songs" ? SONG_HEADERS : ALBUM_HEADERS}>
            {items.map((item) => (
              <MediaTableRow
                key={item.id}
                title={item.title}
                cells={item.cells}
                time={item.time}
                active={item.active}
                playing={item.playing}
                onClick={item.onOpen}
                onPlay={item.onPlay}
                trailingAction={
                  <StarActionButton
                    starred
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onUnstar();
                    }}
                  />
                }
              />
            ))}
          </MediaTable>
        ) : (
          <div className="album-grid">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                imageUrl={item.imageUrl}
                title={item.title}
                subtitle={item.subtitle}
                starred
                playing={item.playing}
                onClick={item.onOpen}
                onPlay={item.onPlay}
                onToggleStar={item.onUnstar}
              />
            ))}
          </div>
        )}
      </div>

      <Toast message={toast} />
      <Toast message={error} className="toast-low" />
    </div>
  );
};

export default FavoritesPage;
