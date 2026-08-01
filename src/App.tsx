import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              {/* Trailing splat lets AppShell declare its own nested routes. */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </MusicPlayerProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
