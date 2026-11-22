import React, { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useSongs, SongSortType } from "../hooks/useSongs";
import { useViewMode } from "../hooks/useViewMode";
import { useScrollRestoration } from "../hooks/usePageCache";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { letterStarts } from "../utils/letterGroups";
import ScrollSentinel from "../components/ScrollSentinel";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import SongCollection from "../components/SongCollection";
import LetterRail from "../components/LetterRail";
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

const TITLE_SORTS: SongSortType[] = ["titleAsc", "titleDesc"];

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

  const searching = searchText.trim() !== "";
  const showSpinner = (loading || searchLoading) && songs.length === 0;
  const scrollRef = useScrollRestoration<HTMLDivElement>(
    subsonicService, "songs", !showSpinner && songs.length > 0
  );
  const starts = useMemo(
    () => (TITLE_SORTS.includes(sortType) && !searching ? letterStarts(songs, (s) => s.title) : null),
    [songs, sortType, searching]
  );
  const meta = !searching && !hasMore && songs.length > 0 ? `${songs.length.toLocaleString()} tracks` : undefined;

  return (
    <div className="page songs-page">
      <ListPageHeader
        title="Songs"
        meta={meta}
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
      <div className="page-scroll" ref={scrollRef}>
        {showSpinner ? (
          <CenteredSpinner />
        ) : songs.length === 0 ? (
          <div className="empty-state">No songs found</div>
        ) : (
          <>
            <SongCollection
              songs={songs}
              viewMode={viewMode}
              letterStarts={starts}
              isStarred={isStarred}
              toggleStar={toggleStar}
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              onPlay={(song) => playSong(song, undefined, songs)}
              getCoverArtUrl={getCoverArtUrl}
            />
            <ScrollSentinel onVisible={loadMore} hasMore={hasMore && !searching} loading={loading} itemCount={songs.length} />
          </>
        )}
      </div>
      {starts && <LetterRail available={new Set(starts.keys())} />}
      <Toast message={toast} />
      <Toast message={error} className="toast-low" />
    </div>
  );
};

export default SongsPage;
