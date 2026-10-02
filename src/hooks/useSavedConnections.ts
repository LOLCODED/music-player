import { useCallback, useState } from "react";
import { SubsonicConfig } from "../config/subsonic";

const SAVED_CONNECTIONS_KEY = "savedCredentials";

export interface SavedConnection extends SubsonicConfig {
  id: string;
  name: string;
}

function readSavedConnections(): { connections: SavedConnection[]; loadFailed: boolean } {
  const raw = localStorage.getItem(SAVED_CONNECTIONS_KEY);
  if (!raw) return { connections: [], loadFailed: false };
  try {
    const parsed: unknown = JSON.parse(raw);
    return { connections: Array.isArray(parsed) ? parsed : [], loadFailed: false };
  } catch {
    return { connections: [], loadFailed: true };
  }
}

function writeSavedConnections(connections: SavedConnection[]): void {
  localStorage.setItem(SAVED_CONNECTIONS_KEY, JSON.stringify(connections));
}

export function isSameConnection(a: SubsonicConfig, b: SubsonicConfig): boolean {
  return a.serverUrl === b.serverUrl && a.username === b.username;
}

export function useSavedConnections() {
  const [initial] = useState(readSavedConnections);
  const [connections, setConnections] = useState(initial.connections);

  const persist = useCallback((updated: SavedConnection[]) => {
    writeSavedConnections(updated);
    setConnections(updated);
  }, []);

  const saveConnection = useCallback(
    (config: SubsonicConfig, name: string) => {
      const { password: _password, ...credentials } = config;
      persist([...connections, { ...credentials, id: Date.now().toString(), name }]);
    },
    [connections, persist]
  );

  const removeConnection = useCallback(
    (id: string) => persist(connections.filter((c) => c.id !== id)),
    [connections, persist]
  );

  return { connections, loadFailed: initial.loadFailed, saveConnection, removeConnection };
}
