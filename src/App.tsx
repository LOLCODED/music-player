import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import LoginPage from "./pages/LoginPage";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MusicPlayerProvider>
          <BrowserRouter>
            <Switch>
              <Route exact path="/login" component={LoginPage} />
              <ProtectedRoute path="/" component={AppShell} />
              <Redirect to="/albums" />
            </Switch>
          </BrowserRouter>
        </MusicPlayerProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
