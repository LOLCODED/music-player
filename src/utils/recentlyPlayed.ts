import { SubsonicSong } from "../types/subsonic";

const MAX_SONGS = 200;
const MAX_PLAYLISTS = 100;
const SONGS_KEY = "recentlyPlayed:songs";
const PLAYLISTS_KEY = "recentlyPlayed:playlists";

export function recordSongPlay(song: SubsonicSong): void {
  try {
    const songs = getRecentSongs().filter((s) => s.id !== song.id);
    songs.unshift(song);
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs.slice(0, MAX_SONGS)));
  } catch {}
}

export function recordPlaylistPlay(playlistId: string): void {
  try {
    const ids = getRecentPlaylistIds().filter((id) => id !== playlistId);
    ids.unshift(playlistId);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(ids.slice(0, MAX_PLAYLISTS)));
  } catch {}
}

export function getRecentSongs(): SubsonicSong[] {
  try {
    return JSON.parse(localStorage.getItem(SONGS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getRecentPlaylistIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
