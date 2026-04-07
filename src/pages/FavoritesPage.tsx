import React, { useState } from "react";
import { DEFAULT_ALBUM_ART } from "../utils/defaultArt";
import { LayoutGrid, List, Pause, Play, Star } from "lucide-react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useFavorites, FavoritesSection } from "../hooks/useFavorites";
import { useViewMode } from "../hooks/useViewMode";
import PageActions from "../components/PageActions";

const FavoritesPage: React.FC = () => {
  const { subsonicService } = useAuth();
  const { playSong, playAlbum, isCurrentSong, isPlaying, shuffle, toggleShuffle } = useMusicPlayer();
  const history = useHistory();
  const [section, setSection] = useState<FavoritesSection>("songs");
  const [viewMode, setViewMode] = useViewMode("viewMode:favorites");

  const {
    songs, albums, loading, error,
    searchText, setSearchText,
    unstarSong, unstarAlbum,
    refresh, getCoverArtUrl,
  } = useFavorites(subsonicService);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const handlePlayAlbum = async (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subsonicService) return;
    try {
      const data = await subsonicService.getAlbum(albumId);
      if (data.songs.length > 0) {
        if (!shuffle) toggleShuffle();
        const randomIndex = Math.floor(Math.random() * data.songs.length);
        playAlbum(data.album, data.songs, randomIndex);
      }
    } catch {}
  };

  const isEmpty = section === "songs" ? songs.length === 0 : albums.length === 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={section === "songs" ? "Search songs..." : "Search albums..."}
            style={{ flex: 1, maxWidth: 360 }}
          />
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as FavoritesSection)}
            style={{ width: "auto", minWidth: 100, flexShrink: 0 }}
          >
            <option value="songs">Songs</option>
            <option value="albums">Albums</option>
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
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : isEmpty ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--fg-muted)" }}>
            No favorite {section} yet
          </div>
        ) : section === "songs" ? (
          viewMode === "table" ? (
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 38 }}>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th style={{ textAlign: "right", paddingRight: 16 }}>Time</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
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
                    <td className="content-table-sub" style={{ textAlign: "right", paddingRight: 16 }}>
                      {formatDuration(song.duration)}
                    </td>
                    <td>
                      <button
                        className="btn-icon table-delete-btn"
                        onClick={(e) => { e.stopPropagation(); unstarSong(song.id); }}
                        aria-label="Remove from favorites"
                        title="Remove from favorites"
                      >
                        <Star size={13} fill="currentColor" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="album-grid">
              {songs.map((song) => (
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
                    className="album-card-star starred"
                    onClick={(e) => { e.stopPropagation(); unstarSong(song.id); }}
                    aria-label="Remove from favorites"
                  >
                    <Star size={13} fill="currentColor" />
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
              ))}
            </div>
          )
        ) : (
          viewMode === "table" ? (
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 38 }}>Title</th>
                  <th>Artist</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr
                    key={album.id}
                    className="content-table-row"
                    onClick={() => history.push(`/album/${album.id}`)}
                  >
                    <td className="content-table-name">
                      <div className="content-table-name-cell">
                        <button
                          className="table-play-btn"
                          onClick={(e) => handlePlayAlbum(album.id, e)}
                          aria-label={`Play ${album.name}`}
                        >
                          <Play size={11} fill="currentColor" />
                        </button>
                        {album.name}
                      </div>
                    </td>
                    <td className="content-table-sub">{album.artist}</td>
                    <td>
                      <button
                        className="btn-icon table-delete-btn"
                        onClick={(e) => { e.stopPropagation(); unstarAlbum(album.id); }}
                        aria-label="Remove from favorites"
                        title="Remove from favorites"
                      >
                        <Star size={13} fill="currentColor" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="album-grid">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="album-card"
                  onClick={() => history.push(`/album/${album.id}`)}
                >
                  <img
                    src={getCoverArtUrl(album.coverArt)}
                    alt={album.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_ALBUM_ART; }}
                  />
                  <button
                    className="album-card-star starred"
                    onClick={(e) => { e.stopPropagation(); unstarAlbum(album.id); }}
                    aria-label="Remove from favorites"
                  >
                    <Star size={13} fill="currentColor" />
                  </button>
                  <button
                    className="album-card-play"
                    onClick={(e) => handlePlayAlbum(album.id, e)}
                    aria-label={`Play ${album.name}`}
                  >
                    <Play size={13} style={{ marginLeft: 1 }} fill="currentColor" />
                  </button>
                  <div className="album-card-info">
                    <div className="album-card-title">{album.name}</div>
                    <div className="album-card-artist">{album.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {error && <div className="toast" style={{ bottom: 60 }}>{error}</div>}
    </div>
  );
};

export default FavoritesPage;
