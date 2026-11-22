import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubsonicConfig } from "../config/subsonic";
import { useAuth } from "../contexts/AuthContext";
import { useSavedConnections, type SavedConnection } from "./useSavedConnections";

const HOME_ROUTE = "/albums";

export function useLoginFlow(showToast: (msg: string) => void) {
  const navigate = useNavigate();
  // subsonicConfig holds the token+salt form of the credentials after a
  // successful login, so saved servers never contain the raw password.
  const { login, subsonicConfig } = useAuth();
  const { connections, loadFailed, saveConnection, removeConnection } = useSavedConnections();
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (loadFailed) showToast("Could not load saved servers");
  }, [loadFailed, showToast]);

  const connect = useCallback(
    async (config: SubsonicConfig, remember: boolean, label: string) => {
      setConnectingTo(label);
      try {
        const success = await login(config, remember);
        if (!success) {
          showToast("Failed to connect. Please check your credentials.");
          return false;
        }
        return true;
      } catch {
        showToast("An error occurred. Please try again.");
        return false;
      } finally {
        setConnectingTo(null);
      }
    },
    [login, showToast]
  );

  const connectNew = useCallback(
    async (config: SubsonicConfig) => {
      if (await connect(config, false, config.serverUrl)) setShowSaveDialog(true);
    },
    [connect]
  );

  const connectSaved = useCallback(
    async (saved: SavedConnection) => {
      if (await connect(saved, true, saved.name)) navigate(HOME_ROUTE, { replace: true });
    },
    [connect, navigate]
  );

  const saveCurrent = useCallback(
    (name: string) => {
      if (!subsonicConfig || !name) {
        showToast("Please enter a name for the server");
        return;
      }
      saveConnection(subsonicConfig, name);
      setShowSaveDialog(false);
      navigate(HOME_ROUTE, { replace: true });
    },
    [subsonicConfig, saveConnection, showToast, navigate]
  );

  const skipSave = useCallback(() => {
    setShowSaveDialog(false);
    navigate(HOME_ROUTE, { replace: true });
  }, [navigate]);

  const removeSaved = useCallback(
    (id: string) => {
      removeConnection(id);
      showToast("Server removed");
    },
    [removeConnection, showToast]
  );

  return {
    connections, connectingTo, showSaveDialog,
    connectNew, connectSaved, saveCurrent, skipSave, removeSaved,
  };
}
