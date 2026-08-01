import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useSongs, SongSortType } from "../hooks/useSongs";
import { useViewMode } from "../hooks/useViewMode";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { formatTrackDuration } from "../utils/duration";
import ScrollSentinel from "../components/ScrollSentinel";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import MediaCard from "../components/MediaCard";
import MediaTable, { MediaTableHeader } from "../components/MediaTable";
import MediaTableRow from "../components/MediaTableRow";
import StarActionButton from "../components/StarActionButton";
import Toast from "../components/Toast";

const SORT_OPTIONS = [
  { value: "titleAsc", label: "Title A-Z" },
  { value: "titleDesc", label: "Title Z-A" },
  { value: "artistAsc", label: "Artist A-Z" },
  { value: "artistDesc", label: "Artist Z-A" },
  { value: "albumAsc", label: "Album A-Z" },
  { value: "recentlyPlayed", label: "Recently Played" },
  { value: "durationDesc", label: "Longest First" },
  { value: "random", label: "Random" },
];

const TABLE_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
  { label: "Album" },
  { label: "Time", align: "right", width: 56 },
];

const SongsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playSong, isCurrentSong, isPlaying } = useMusicPlayer();
  const [viewMode, setViewMode] = useViewMode("viewMode:songs");
  const { toast, showToast } = useToast();
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);

  const {
    songs, loading, searchLoading, error, hasMore,
    searchText, sortType, setSearchText, setSortType,
    loadMore, refresh, getCoverArtUrl,
  } = useSongs(subsonicService);

  const canLoadMore = hasMore && !searchText.trim();
  const showSpinner = (loading || searchLoading) && songs.length === 0;

  return (
    <div className="page">
      <ListPageHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        placeholder="Search songs or artists..."
        sortOptions={SORT_OPTIONS}
        sortType={sortType}
        onSortChange={(value) => setSortType(value as SongSortType)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "grid" ? "table" : "grid"))}
        onRefresh={refresh}
      />

      <div className="page-scroll">
        {showSpinner ? (
          <CenteredSpinner />
        ) : songs.length === 0 ? (
          <div className="empty-state">No songs found</div>
        ) : (
          <>
            {viewMode === "table" ? (
              <MediaTable headers={TABLE_HEADERS}>
                {songs.map((song) => {
                  const starred = isStarred(song.id, song.starred);
                  return (
                    <MediaTableRow
                      key={song.id}
                      title={song.title}
                      cells={[song.artist, song.album]}
                      time={song.duration ? formatTrackDuration(song.duration) : ""}
                      active={isCurrentSong(song.id)}
                      playing={isCurrentSong(song.id) && isPlaying}
                      onClick={() => playSong(song, undefined, songs)}
                      onPlay={() => playSong(song, undefined, songs)}
                      trailingAction={
                        <StarActionButton
                          starred={starred}
                          onClick={(e) => toggleStar(song.id, "song", starred, e)}
                        />
                      }
                    />
                  );
                })}
              </MediaTable>
            ) : (
              <div className="album-grid">
                {songs.map((song) => {
                  const starred = isStarred(song.id, song.starred);
                  return (
                    <MediaCard
                      key={song.id}
                      imageUrl={getCoverArtUrl(song.coverArt)}
                      title={song.title}
                      subtitle={song.artist}
                      starred={starred}
                      playing={isCurrentSong(song.id) && isPlaying}
                      onClick={() => playSong(song, undefined, songs)}
                      onPlay={() => playSong(song, undefined, songs)}
                      onToggleStar={(e) => toggleStar(song.id, "song", starred, e)}
                    />
                  );
                })}
              </div>
            )}
            <ScrollSentinel
              onVisible={loadMore}
              hasMore={canLoadMore}
              loading={loading}
              itemCount={songs.length}
            />
          </>
        )}
      </div>

      <Toast message={toast} />
      <Toast message={error} className="toast-low" />
    </div>
  );
};

export default SongsPage;
