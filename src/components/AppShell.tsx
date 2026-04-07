import React from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { Disc3, Heart, ListMusic, LogOut, Music, Settings } from "lucide-react";
import AlbumsPage from "../pages/AlbumsPage";
import AlbumDetailsPage from "../pages/AlbumDetailsPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import PlaylistDetailsPage from "../pages/PlaylistDetailsPage";
import SongsPage from "../pages/SongsPage";
import FavoritesPage from "../pages/FavoritesPage";
import SettingsPage from "../pages/SettingsPage";
import Player from "./player/Player";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const albumsActive =
    location.pathname === "/albums" || location.pathname.startsWith("/album/");
  const playlistsActive =
    location.pathname === "/playlists" ||
    location.pathname.startsWith("/playlist/");
  const songsActive = location.pathname === "/songs";
  const favoritesActive = location.pathname === "/favorites";
  const settingsActive = location.pathname === "/settings";

  return (
    <div className="sidebar">
      <Link
        to="/songs"
        className={`sidebar-nav-link ${songsActive ? "active" : ""}`}
      >
        <Music size={16} />
        <span>Songs</span>
      </Link>
      <Link
        to="/albums"
        className={`sidebar-nav-link ${albumsActive ? "active" : ""}`}
      >
        <Disc3 size={16} />
        <span>Albums</span>
      </Link>
      <Link
        to="/playlists"
        className={`sidebar-nav-link ${playlistsActive ? "active" : ""}`}
      >
        <ListMusic size={16} />
        <span>Playlists</span>
      </Link>
      <Link
        to="/favorites"
        className={`sidebar-nav-link ${favoritesActive ? "active" : ""}`}
      >
        <Heart size={16} />
        <span>Favorites</span>
      </Link>
      <Link
        to="/settings"
        className={`sidebar-nav-link ${settingsActive ? "active" : ""}`}
        style={{ marginTop: "auto" }}
      >
        <Settings size={16} />
        <span>Settings</span>
      </Link>
      <button
        onClick={logout}
        className="sidebar-nav-link"
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );
};

const TabBar: React.FC = () => {
  const location = useLocation();
  const albumsActive =
    location.pathname === "/albums" || location.pathname.startsWith("/album/");
  const playlistsActive =
    location.pathname === "/playlists" ||
    location.pathname.startsWith("/playlist/");
  const songsActive = location.pathname === "/songs";
  const favoritesActive = location.pathname === "/favorites";

  return (
    <div className="tab-btn-bar">
      <Link
        to="/songs"
        className={`tab-btn ${songsActive ? "active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        <Music size={18} />
        <span>Songs</span>
      </Link>
      <Link
        to="/albums"
        className={`tab-btn ${albumsActive ? "active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        <Disc3 size={18} />
        <span>Albums</span>
      </Link>
      <Link
        to="/playlists"
        className={`tab-btn ${playlistsActive ? "active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        <ListMusic size={18} />
        <span>Playlists</span>
      </Link>
      <Link
        to="/favorites"
        className={`tab-btn ${favoritesActive ? "active" : ""}`}
        style={{ textDecoration: "none" }}
      >
        <Heart size={18} />
        <span>Favorites</span>
      </Link>
    </div>
  );
};

const GlobalPlayer: React.FC = () => {
  const {
    currentSong,
    currentAlbum,
    currentPlaylist,
    currentSourcePath,
    getCurrentSongIndex,
    isPlaying,
    progress,
    shuffle,
    repeatMode,
    togglePlayPause,
    skipNext,
    skipPrevious,
    setProgress,
    getStreamUrl,
    toggleShuffle,
    toggleRepeat,
    stop,
    playSong,
  } = useMusicPlayer();

  if (!currentSong) return null;

  const idx = getCurrentSongIndex();
  const previousEntry = idx > 0 ? currentPlaylist[idx - 1] : undefined;
  const nextEntry =
    idx >= 0 && idx + 1 < currentPlaylist.length
      ? currentPlaylist[idx + 1]
      : undefined;

  const queue = currentPlaylist.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
  }));

  return (
    <Player
      currentSong={currentSong}
      isPlaying={isPlaying}
      progress={progress}
      onPlayPause={togglePlayPause}
      onSeek={setProgress}
      onNext={skipNext}
      onPrevious={skipPrevious}
      onRequestStreamUrl={getStreamUrl}
      prevPreview={
        previousEntry
          ? { title: previousEntry.title, artist: previousEntry.artist }
          : undefined
      }
      nextPreview={
        nextEntry
          ? { title: nextEntry.title, artist: nextEntry.artist }
          : undefined
      }
      shuffle={shuffle}
      repeatMode={repeatMode}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={toggleRepeat}
      onStop={stop}
      queue={queue}
      currentQueueIndex={idx}
      onPlayQueueSong={(i) =>
        playSong(currentPlaylist[i], currentAlbum || undefined, currentPlaylist)
      }
      sourcePath={currentSourcePath}
    />
  );
};

const AppShell: React.FC = () => {
  const { playerPosition, mobilePlayerPosition } = useSettings();
  return (
    <div
      className="app-shell"
      data-player-pos={playerPosition}
      data-mobile-player-pos={mobilePlayerPosition}
    >
      <Sidebar />
      <div className="app-content">
        <Switch>
          <Route exact path="/albums" component={AlbumsPage} />
          <Route exact path="/album/:id" component={AlbumDetailsPage} />
          <Route exact path="/playlists" component={PlaylistsPage} />
          <Route exact path="/playlist/:id" component={PlaylistDetailsPage} />
          <Route exact path="/songs" component={SongsPage} />
          <Route exact path="/favorites" component={FavoritesPage} />
          <Route exact path="/settings" component={SettingsPage} />
          <Route exact path="/">
            <Redirect to="/albums" />
          </Route>
        </Switch>
      </div>
      <div className="player-area">
        <GlobalPlayer />
      </div>
      <TabBar />
    </div>
  );
};

export default AppShell;
