import React from "react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { LayoutGrid, List, Pause, Play, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useSongs } from "../hooks/useSongs";
import { useViewMode } from "../hooks/useViewMode";
import { useStarToggle } from "../hooks/useStarToggle";
import ScrollSentinel from "../components/ScrollSentinel";
import PageActions from "../components/PageActions";

const SongsPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playSong, isCurrentSong, isPlaying } = useMusicPlayer();
  const [viewMode, setViewMode] = useViewMode("viewMode:songs");
  const { isStarred, toggleStar } = useStarToggle(subsonicService);

  const {
    songs, loading, searchLoading, error, hasMore,
    searchText, sortType, setSearchText, setSortType,
    loadMore, refresh, getCoverArtUrl,
  } = useSongs(subsonicService);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
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
            placeholder="Search songs or artists..."
            style={{ flex: 1, maxWidth: 360 }}
          />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as typeof sortType)}
            style={{ width: "auto", minWidth: 150, flexShrink: 0 }}
          >
            <option value="titleAsc">Title A-Z</option>
            <option value="titleDesc">Title Z-A</option>
            <option value="artistAsc">Artist A-Z</option>
            <option value="artistDesc">Artist Z-A</option>
            <option value="albumAsc">Album A-Z</option>
            <option value="recentlyPlayed">Recently Played</option>
            <option value="durationDesc">Longest First</option>
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
        {(loading || searchLoading) && songs.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : songs.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--fg-muted)" }}>
            No songs found
          </div>
        ) : viewMode === "table" ? (
          <>
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 38 }}>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th style={{ textAlign: "right", paddingRight: 16, width: 56, flexShrink: 0 }}>Time</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => {
                  const starred = isStarred(song.id, song.starred);
                  return (
                    <tr
                      key={song.id}
                      className={`content-table-row${isCurrentSong(song.id) ? " active" : ""}`}
                      onClick={() => playSong(song, undefined, songs)}
                    >
                      <td className="content-table-name">
                        <div className="content-table-name-cell">
                          <button
                            className="table-play-btn"
                            onClick={(e) => { e.stopPropagation(); playSong(song, undefined, songs); }}
                            aria-label={`Play ${song.title}`}
                          >
                            {isCurrentSong(song.id) && isPlaying
                              ? <Pause size={11} fill="currentColor" />
                              : <Play size={11} fill="currentColor" />}
                          </button>
                          {song.title}
                        </div>
                      </td>
                      <td className="content-table-sub">{song.artist}</td>
                      <td className="content-table-sub">{song.album}</td>
                      <td style={{ textAlign: "right", paddingRight: 16, width: 56, whiteSpace: "nowrap", color: "var(--fg-muted)", fontSize: 13 }}>
                        {formatDuration(song.duration)}
                      </td>
                      <td style={{ width: 40, padding: "0 4px" }}>
                        <button
                          className="btn-icon table-delete-btn"
                          onClick={(e) => toggleStar(song.id, "song", starred, e)}
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
            <ScrollSentinel onVisible={loadMore} hasMore={canLoadMore} loading={loading} itemCount={songs.length} />
          </>
        ) : (
          <>
            <div className="album-grid">
              {songs.map((song) => {
                const starred = isStarred(song.id, song.starred);
                return (
                  <div
                    key={song.id}
                    className={`album-card${isCurrentSong(song.id) ? " active" : ""}`}
                    onClick={() => playSong(song, undefined, songs)}
                  >
                    <img
                      src={getCoverArtUrl(song.coverArt)}
                      alt={song.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
                    />
                    <button
                      className={`album-card-star${starred ? " starred" : ""}`}
                      onClick={(e) => toggleStar(song.id, "song", starred, e)}
                      aria-label={starred ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={13} fill={starred ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="album-card-play"
                      onClick={(e) => { e.stopPropagation(); playSong(song, undefined, songs); }}
                      aria-label={`Play ${song.title}`}
                    >
                      {isCurrentSong(song.id) && isPlaying
                        ? <Pause size={13} fill="currentColor" />
                        : <Play size={13} style={{ marginLeft: 1 }} fill="currentColor" />}
                    </button>
                    <div className="album-card-info">
                      <div className="album-card-title">{song.title}</div>
                      <div className="album-card-artist">{song.artist}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollSentinel onVisible={loadMore} hasMore={canLoadMore} loading={loading} itemCount={songs.length} />
          </>
        )}
      </div>

      {error && <div className="toast" style={{ bottom: 60 }}>{error}</div>}
    </div>
  );
};

export default SongsPage;
