import React, { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useSongs, SongSortType } from "../hooks/useSongs";
import { useViewMode } from "../hooks/useViewMode";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useScrollRestoration } from "../hooks/usePageCache";
import { useRenderWindow } from "../hooks/useRenderWindow";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { letterStarts } from "../utils/letterGroups";
import { useLetterJump } from "../hooks/useLetterJump";
import { SubsonicSong } from "../types/subsonic";
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

const SORT_KEYS: Partial<Record<SongSortType, (song: SubsonicSong) => string>> = {
  titleAsc: (s) => s.title,
  titleDesc: (s) => s.title,
  artistAsc: (s) => s.artist,
  artistDesc: (s) => s.artist,
  albumAsc: (s) => s.album,
};
const byTitle = (s: SubsonicSong) => s.title;
const RENDER_PAGE_SIZE = 100;

const SongsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playSong, isCurrentSong, isPlaying } = useMusicPlayer();
  const isDesktop = useIsDesktop();
  const [viewMode, setViewMode] = useViewMode("viewMode:songs", isDesktop ? "grid" : "table");
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
  const sortKey = SORT_KEYS[sortType];
  const starts = useMemo(
    () => (sortKey && !searching ? letterStarts(songs, sortKey) : null),
    [songs, sortKey, searching]
  );
  const meta = !searching && !hasMore && songs.length > 0 ? `${songs.length.toLocaleString()} tracks` : undefined;
  const { visible, hasHidden, showMore, ensureVisible } = useRenderWindow(
    subsonicService, "songs", songs, RENDER_PAGE_SIZE
  );
  const jumpToLetter = useLetterJump(starts, ensureVisible, visible.length);

  return (
    <div className="page songs-page lettered-page">
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
              songs={visible}
              viewMode={viewMode}
              letterStarts={starts}
              sortKey={sortKey ?? byTitle}
              isStarred={isStarred}
              toggleStar={toggleStar}
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              onPlay={(song) => playSong(song, undefined, songs)}
              getCoverArtUrl={getCoverArtUrl}
            />
            <ScrollSentinel
              onVisible={hasHidden ? showMore : loadMore}
              hasMore={hasHidden || (hasMore && !searching)}
              loading={loading}
              itemCount={visible.length}
            />
          </>
        )}
      </div>
      {starts && <LetterRail available={new Set(starts.keys())} onJump={jumpToLetter} />}
      <Toast message={toast} />
      <Toast message={error} className="toast-low" />
    </div>
  );
};

export default SongsPage;
