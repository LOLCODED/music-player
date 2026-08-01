import { SubsonicSong } from "../types/subsonic";

const MAX_SONGS = 200;
const MAX_PLAYLISTS = 100;
const SONGS_KEY = "recentlyPlayed:songs";
const PLAYLISTS_KEY = "recentlyPlayed:playlists";

function readStoredArray(key: string): unknown[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key: string, value: unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`Could not persist ${key}:`, err);
    }
  }
}

export function recordSongPlay(song: SubsonicSong): void {
  const songs = getRecentSongs().filter((s) => s.id !== song.id);
  songs.unshift(song);
  writeStoredArray(SONGS_KEY, songs.slice(0, MAX_SONGS));
}

export function recordPlaylistPlay(playlistId: string): void {
  const ids = getRecentPlaylistIds().filter((id) => id !== playlistId);
  ids.unshift(playlistId);
  writeStoredArray(PLAYLISTS_KEY, ids.slice(0, MAX_PLAYLISTS));
}

export function getRecentSongs(): SubsonicSong[] {
  return readStoredArray(SONGS_KEY).filter(
    (item): item is SubsonicSong =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as SubsonicSong).id === "string" &&
      typeof (item as SubsonicSong).title === "string"
  );
}

export function getRecentPlaylistIds(): string[] {
  return readStoredArray(PLAYLISTS_KEY).filter(
    (item): item is string => typeof item === "string"
  );
}
