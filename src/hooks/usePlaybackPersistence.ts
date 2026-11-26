import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { connectionKey } from "../utils/connectionKey";
import {
  clearPlaybackSnapshot,
  loadPlaybackSnapshot,
  savePlaybackProgress,
  savePlaybackQueue,
  type PlaybackQueueSnapshot,
  type PlaybackSnapshot,
} from "../utils/playbackSnapshot";

/**
 * Keeps the queue and position across app launches, per connection: restores
 * the saved state once signed in, then saves every change. Returns a function
 * that forgets the saved state.
 */
export function usePlaybackPersistence(
  queue: PlaybackQueueSnapshot | null,
  progress: number,
  restore: (snapshot: PlaybackSnapshot) => void
) {
  const { subsonicService, subsonicConfig } = useAuth();
  const connection = subsonicConfig
    ? connectionKey(subsonicConfig.serverUrl, subsonicConfig.username)
    : null;
  // Saving waits until this connection's saved state has been read, so an
  // empty player at launch never overwrites it.
  const [restoredConnection, setRestoredConnection] = useState<string | null>(null);
  const ready = !!connection && restoredConnection === connection;

  const restoreRef = useRef(restore);
  const hasQueueRef = useRef(!!queue);
  useEffect(() => {
    restoreRef.current = restore;
    hasQueueRef.current = !!queue;
  });

  useEffect(() => {
    if (!connection || !subsonicService || restoredConnection === connection) return;
    const snapshot = loadPlaybackSnapshot(connection);
    if (snapshot && !hasQueueRef.current) restoreRef.current(snapshot);
    setRestoredConnection(connection);
  }, [connection, subsonicService, restoredConnection]);

  useEffect(() => {
    if (ready && connection && queue) savePlaybackQueue(connection, queue);
  }, [ready, connection, queue]);

  const hasQueue = !!queue;
  useEffect(() => {
    if (ready && connection && hasQueue) savePlaybackProgress(connection, progress);
  }, [ready, connection, hasQueue, progress]);

  return useCallback(() => {
    if (connection) clearPlaybackSnapshot(connection);
  }, [connection]);
}
