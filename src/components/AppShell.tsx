import React from "react";
import { Location, Navigate, Route, Routes } from "react-router-dom";
import AlbumsPage from "../pages/AlbumsPage";
import AlbumDetailsPage from "../pages/AlbumDetailsPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import PlaylistDetailsPage from "../pages/PlaylistDetailsPage";
import SongsPage from "../pages/SongsPage";
import FavoritesPage from "../pages/FavoritesPage";
import SettingsPage from "../pages/SettingsPage";
import ConnectionsPage from "../pages/ConnectionsPage";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import GlobalPlayer from "./GlobalPlayer";
import { useSettings } from "../contexts/SettingsContext";
import { useHistoryEntries } from "../hooks/useHistoryEntries";
import { useInteractiveEdgeSwipe } from "../hooks/useInteractiveEdgeSwipe";
import PageStack from "./PageStack";

function renderRoutes(location: Location) {
  return (
    <Routes location={location}>
      <Route path="/albums" element={<AlbumsPage />} />
      <Route path="/album/:id" element={<AlbumDetailsPage />} />
      <Route path="/playlists" element={<PlaylistsPage />} />
      <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
      <Route path="/songs" element={<SongsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/albums" replace />} />
    </Routes>
  );
}

const AppShell: React.FC = () => {
  const { playerPosition, mobilePlayerPosition } = useSettings();
  const neighbor = useHistoryEntries();
  const gestureLayers = useInteractiveEdgeSwipe(neighbor);
  return (
    <div
      className="app-shell"
      data-player-pos={playerPosition}
      data-mobile-player-pos={mobilePlayerPosition}
    >
      <Sidebar />
      <div className="app-content">
        <PageStack renderRoutes={renderRoutes} gestureLayers={gestureLayers} />
      </div>
      <div className="mobile-dock">
        <div className="player-area">
          <GlobalPlayer />
        </div>
        <TabBar />
      </div>
    </div>
  );
};

export default AppShell;
