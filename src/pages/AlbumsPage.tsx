import React from "react";
import { useNavigate } from "react-router-dom";
import { SubsonicAlbum } from "../types/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useAlbums, AlbumSortType } from "../hooks/useAlbums";
import { useViewMode } from "../hooks/useViewMode";
import { useStarToggle } from "../hooks/useStarToggle";
import { useToast } from "../hooks/useToast";
import { useShufflePlay } from "../hooks/useShufflePlay";
import { formatTotalDuration } from "../utils/duration";
import ScrollSentinel from "../components/ScrollSentinel";
import ListPageHeader from "../components/ListPageHeader";
import CenteredSpinner from "../components/CenteredSpinner";
import MediaCard from "../components/MediaCard";
import MediaTable, { MediaTableHeader } from "../components/MediaTable";
import MediaTableRow from "../components/MediaTableRow";
import StarActionButton from "../components/StarActionButton";
import Toast from "../components/Toast";

const SORT_OPTIONS = [
  { value: "alphabeticalByName", label: "Name A-Z" },
  { value: "alphabeticalByNameDesc", label: "Name Z-A" },
  { value: "alphabeticalByArtist", label: "Artist A-Z" },
  { value: "alphabeticalByArtistDesc", label: "Artist Z-A" },
  { value: "newest", label: "Newest" },
  { value: "recent", label: "Recently Played" },
  { value: "random", label: "Random" },
];

const TABLE_HEADERS: MediaTableHeader[] = [
  { label: "Title" },
  { label: "Artist" },
  { label: "Time", align: "right", width: 56 },
];

const AlbumsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useViewMode("viewMode:albums");
  const { toast, showToast } = useToast();
  const { isStarred, toggleStar } = useStarToggle(subsonicService, showToast);
  const shufflePlay = useShufflePlay(showToast);

  const {
    filteredAlbums, loading, searchLoading, error, hasMore,
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

  return (
    <div className="page">
      <ListPageHeader
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

      <div className="page-scroll">
        {showSpinner ? (
          <CenteredSpinner />
        ) : filteredAlbums.length === 0 ? (
          <div className="empty-state">No albums found</div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="album-grid">
                {filteredAlbums.map((album) => {
                  const starred = isStarred(album.id, album.starred);
                  return (
                    <MediaCard
                      key={album.id}
                      imageUrl={getCoverArtUrl(album.coverArt)}
                      title={album.name}
                      subtitle={album.artist}
                      starred={starred}
                      onClick={() => openAlbum(album)}
                      onPlay={() => handlePlay(album)}
                      onToggleStar={(e) => toggleStar(album.id, "album", starred, e)}
                    />
                  );
                })}
              </div>
            ) : (
              <MediaTable headers={TABLE_HEADERS}>
                {filteredAlbums.map((album) => {
                  const starred = isStarred(album.id, album.starred);
                  return (
                    <MediaTableRow
                      key={album.id}
                      title={album.name}
                      cells={[album.artist]}
                      time={formatTotalDuration(album.duration)}
                      onClick={() => openAlbum(album)}
                      onPlay={() => handlePlay(album)}
                      trailingAction={
                        <StarActionButton
                          starred={starred}
                          onClick={(e) => toggleStar(album.id, "album", starred, e)}
                        />
                      }
                    />
                  );
                })}
              </MediaTable>
            )}
            <ScrollSentinel
              onVisible={loadMore}
              hasMore={canLoadMore}
              loading={loading}
              itemCount={filteredAlbums.length}
            />
          </>
        )}
      </div>

      <Toast message={toast} />
      <Toast message={error} className="toast-low" />
    </div>
  );
};

export default AlbumsPage;
