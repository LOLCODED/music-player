import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SubsonicAlbum } from "../types/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useAlbums, AlbumSortType } from "../hooks/useAlbums";
import { useViewMode } from "../hooks/useViewMode";
import { useRenderWindow } from "../hooks/useRenderWindow";
import { useLetterJump } from "../hooks/useLetterJump";
import { letterStarts, withoutLeadingArticle } from "../utils/letterGroups";
import LetterRail from "../components/LetterRail";
import AlbumCollection from "../components/AlbumCollection";
import { useScrollRestoration } from "../hooks/usePageCache";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { useShufflePlay } from "../hooks/useShufflePlay";
import ScrollSentinel from "../components/ScrollSentinel";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import Toast from "../components/Toast";

const RENDER_PAGE_SIZE = 100;

const SORT_OPTIONS = [
  { value: "alphabeticalByName", label: "Name A-Z" },
  { value: "alphabeticalByNameDesc", label: "Name Z-A" },
  { value: "alphabeticalByArtist", label: "Artist A-Z" },
  { value: "alphabeticalByArtistDesc", label: "Artist Z-A" },
  { value: "newest", label: "Newest" },
  { value: "recent", label: "Recently Played" },
  { value: "random", label: "Random" },
];

const SORT_KEYS: Partial<Record<AlbumSortType, (album: SubsonicAlbum) => string>> = {
  alphabeticalByName: (a) => withoutLeadingArticle(a.name),
  alphabeticalByNameDesc: (a) => withoutLeadingArticle(a.name),
  alphabeticalByArtist: (a) => withoutLeadingArticle(a.artist),
  alphabeticalByArtistDesc: (a) => withoutLeadingArticle(a.artist),
};

const AlbumsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode("viewMode:albums");
  const { toast, showToast } = useToast();
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);
  const shufflePlay = useShufflePlay(showToast);

  const {
    viewKey, filteredAlbums, loading, searchLoading, error, hasMore,
    searchText, sortType, setSearchText, setSortType,
    loadMore, refresh, getCoverArtUrl,
  } = useAlbums(subsonicService);

  const handlePlay = (album: SubsonicAlbum) => {
    if (!subsonicService) return;
    shufflePlay(async () => ({
      album,
      songs: (await subsonicService.getAlbum(album.id)).songs,
    }));
  };

  const openAlbum = (album: SubsonicAlbum) => navigate(`/album/${album.id}`);
  const canLoadMore = hasMore && !searchText.trim();
  const showSpinner = (loading || searchLoading) && filteredAlbums.length === 0;
  const { visible, hasHidden, showMore, ensureVisible } = useRenderWindow(
    subsonicService, viewKey, filteredAlbums, RENDER_PAGE_SIZE
  );
  const sortKey = SORT_KEYS[sortType];
  const searching = searchText.trim() !== "";
  const starts = useMemo(
    () => (sortKey && !searching ? letterStarts(filteredAlbums, sortKey) : null),
    [filteredAlbums, sortKey, searching]
  );
  const keyOf = sortKey ?? ((a: SubsonicAlbum) => a.name);
  const scrollRef = useScrollRestoration<HTMLDivElement>(
    subsonicService, viewKey, !showSpinner && filteredAlbums.length > 0
  );
  const jumpToLetter = useLetterJump(starts, ensureVisible, visible.length, scrollRef);

  return (
    <div className="page lettered-page">
      <ListPageHeader
        title="Albums"
        searchText={searchText}
        onSearchChange={setSearchText}
        placeholder="Search albums or artists..."
        sortOptions={SORT_OPTIONS}
        sortType={sortType}
        onSortChange={(value) => setSortType(value as AlbumSortType)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === "grid" ? "table" : "grid"))}
        onRefresh={refresh}
      />

      <div className="page-scroll" ref={scrollRef}>
        {showSpinner ? (
          <CenteredSpinner />
        ) : filteredAlbums.length === 0 ? (
          <div className="empty-state">No albums found</div>
        ) : (
          <>
            <AlbumCollection
              albums={visible}
              viewMode={viewMode}
              letterStarts={starts}
              sortKey={keyOf}
              isStarred={isStarred}
              toggleStar={toggleStar}
              onOpen={openAlbum}
              onPlay={handlePlay}
              getCoverArtUrl={getCoverArtUrl}
            />
            <ScrollSentinel
              onVisible={hasHidden ? showMore : loadMore}
              hasMore={hasHidden || canLoadMore}
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

export default AlbumsPage;
