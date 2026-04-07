import React from "react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { LayoutGrid, List, Play, Star } from "lucide-react";
import { SubsonicAlbum } from "../types/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAlbums } from "../hooks/useAlbums";
import { useViewMode } from "../hooks/useViewMode";
import { useStarToggle } from "../hooks/useStarToggle";
import ScrollSentinel from "../components/ScrollSentinel";
import PageActions from "../components/PageActions";

const AlbumsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playAlbum, shuffle, toggleShuffle } = useMusicPlayer();
  const history = useHistory();
  const [viewMode, setViewMode] = useViewMode("viewMode:albums");
  const { isStarred, toggleStar } = useStarToggle(subsonicService);

  const {
    filteredAlbums, loading, searchLoading, error, hasMore,
    searchText, sortType, setSearchText, setSortType,
    loadMore, refresh, getCoverArtUrl,
  } = useAlbums(subsonicService);

  const handlePlayRandom = async (album: SubsonicAlbum, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subsonicService) return;
    try {
      const data = await subsonicService.getAlbum(album.id);
      if (data.songs.length > 0) {
        if (!shuffle) toggleShuffle();
        const randomIndex = Math.floor(Math.random() * data.songs.length);
        playAlbum(album, data.songs, randomIndex);
      }
    } catch {}
  };

  const canLoadMore = hasMore && !searchText.trim();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search albums or artists..."
            style={{ flex: 1, maxWidth: 360 }}
          />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as typeof sortType)}
            style={{ width: "auto", minWidth: 150, flexShrink: 0 }}
          >
            <option value="alphabeticalByName">Name A-Z</option>
            <option value="alphabeticalByNameDesc">Name Z-A</option>
            <option value="alphabeticalByArtist">Artist A-Z</option>
            <option value="alphabeticalByArtistDesc">Artist Z-A</option>
            <option value="newest">Newest</option>
            <option value="recent">Recently Played</option>
            <option value="random">Random</option>
          </select>
          <button
            className="btn-icon"
            onClick={() => setViewMode((v) => v === "grid" ? "table" : "grid")}
            title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            aria-label="Toggle view"
          >
            {viewMode === "grid" ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>
        </div>
        <PageActions onRefresh={refresh} />
      </div>

      <div className="page-scroll">
        {(loading || searchLoading) && filteredAlbums.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--fg-muted)" }}>
            No albums found
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="album-grid">
              {filteredAlbums.map((album) => {
                const starred = isStarred(album.id, album.starred);
                return (
                  <div
                    key={album.id + album.name}
                    className="album-card"
                    onClick={() => history.push(`/album/${album.id}`)}
                  >
                    <img
                      src={getCoverArtUrl(album.coverArt)}
                      alt={album.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
                    />
                    <button
                      className={`album-card-star${starred ? " starred" : ""}`}
                      onClick={(e) => toggleStar(album.id, "album", starred, e)}
                      aria-label={starred ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={13} fill={starred ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="album-card-play"
                      onClick={(e) => handlePlayRandom(album, e)}
                      aria-label={`Play ${album.name}`}
                    >
                      <Play size={13} style={{ marginLeft: 1 }} fill="currentColor" />
                    </button>
                    <div className="album-card-info">
                      <div className="album-card-title">{album.name}</div>
                      <div className="album-card-artist">{album.artist}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollSentinel onVisible={loadMore} hasMore={canLoadMore} loading={loading} itemCount={filteredAlbums.length} />
          </>
        ) : (
          <>
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 38 }}>Title</th>
                  <th>Artist</th>
                  <th style={{ textAlign: "right", paddingRight: 16, width: 56 }}>Time</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filteredAlbums.map((album) => {
                  const starred = isStarred(album.id, album.starred);
                  const h = Math.floor(album.duration / 3600);
                  const m = Math.floor((album.duration % 3600) / 60);
                  const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                  return (
                    <tr
                      key={album.id + album.name}
                      className="content-table-row"
                      onClick={() => history.push(`/album/${album.id}`)}
                    >
                      <td className="content-table-name">
                        <div className="content-table-name-cell">
                          <button
                            className="table-play-btn"
                            onClick={(e) => handlePlayRandom(album, e)}
                            aria-label={`Play ${album.name}`}
                          >
                            <Play size={11} fill="currentColor" />
                          </button>
                          {album.name}
                        </div>
                      </td>
                      <td className="content-table-sub">{album.artist}</td>
                      <td style={{ textAlign: "right", paddingRight: 16, width: 56, whiteSpace: "nowrap", color: "var(--fg-muted)", fontSize: 13 }}>
                        {durationStr}
                      </td>
                      <td style={{ width: 40, padding: "0 4px" }}>
                        <button
                          className="btn-icon table-delete-btn"
                          onClick={(e) => toggleStar(album.id, "album", starred, e)}
                          aria-label={starred ? "Remove from favorites" : "Add to favorites"}
                          title={starred ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star size={13} fill={starred ? "currentColor" : "none"} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ScrollSentinel onVisible={loadMore} hasMore={canLoadMore} loading={loading} itemCount={filteredAlbums.length} />
          </>
        )}
      </div>

      {error && <div className="toast" style={{ bottom: 60 }}>{error}</div>}
    </div>
  );
};

export default AlbumsPage;
