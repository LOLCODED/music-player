import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
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
