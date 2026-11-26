import type { SubsonicAlbum, SubsonicSong } from "../types/subsonic";
import type { RepeatMode } from "../types/player";

export interface PlaybackQueueSnapshot {
  songs: SubsonicSong[];
  index: number;
  album: SubsonicAlbum | null;
  sourcePath: string | null;
  shuffle: boolean;
  repeatMode: RepeatMode;
}

export interface PlaybackSnapshot extends PlaybackQueueSnapshot {
  progress: number;
}

// The queue and the position are stored apart so the frequently changing
// position never rewrites a long queue.
const queueKey = (connection: string) => `playbackQueue:${connection}`;
const progressKey = (connection: string) => `playbackProgress:${connection}`;

function isQueueSnapshot(value: unknown): value is PlaybackQueueSnapshot {
  const snapshot = value as PlaybackQueueSnapshot | null;
  return (
    !!snapshot &&
    Array.isArray(snapshot.songs) &&
    Number.isInteger(snapshot.index) &&
    !!snapshot.songs[snapshot.index]
  );
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Without storage the queue simply isn't restored after a relaunch.
  }
}

export function savePlaybackQueue(connection: string, snapshot: PlaybackQueueSnapshot): void {
  write(queueKey(connection), JSON.stringify(snapshot));
}

export function savePlaybackProgress(connection: string, progress: number): void {
  write(progressKey(connection), String(progress));
}

export function loadPlaybackSnapshot(connection: string): PlaybackSnapshot | null {
  try {
    const queue: unknown = JSON.parse(localStorage.getItem(queueKey(connection)) ?? "null");
    if (!isQueueSnapshot(queue)) return null;
    const progress = Number(localStorage.getItem(progressKey(connection)));
    return { ...queue, progress: progress >= 0 && progress <= 100 ? progress : 0 };
  } catch {
    return null;
  }
}

export function clearPlaybackSnapshot(connection: string): void {
  try {
    localStorage.removeItem(queueKey(connection));
    localStorage.removeItem(progressKey(connection));
  } catch {
    // Nothing to clear without storage.
  }
}
