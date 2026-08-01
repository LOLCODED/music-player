import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AlbumsPage from "../pages/AlbumsPage";
import AlbumDetailsPage from "../pages/AlbumDetailsPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import PlaylistDetailsPage from "../pages/PlaylistDetailsPage";
import SongsPage from "../pages/SongsPage";
import FavoritesPage from "../pages/FavoritesPage";
import SettingsPage from "../pages/SettingsPage";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import GlobalPlayer from "./GlobalPlayer";
import { useSettings } from "../contexts/SettingsContext";

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
        <Routes>
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/album/:id" element={<AlbumDetailsPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/albums" replace />} />
        </Routes>
      </div>
      <div className="player-area">
        <GlobalPlayer />
      </div>
      <TabBar />
    </div>
  );
};

export default AppShell;
