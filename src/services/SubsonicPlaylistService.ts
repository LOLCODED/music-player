import { SubsonicConfig } from "../config/subsonic";
import { SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import { request, toArray, SubsonicError } from "./SubsonicBase";

export async function getPlaylists(
  config: SubsonicConfig,
  salt: string
): Promise<SubsonicPlaylist[]> {
  const data = await request<{
    playlists: { playlist?: SubsonicPlaylist | SubsonicPlaylist[] };
  }>(config, salt, "getPlaylists");
  return toArray(data.playlists?.playlist);
}

export async function getPlaylist(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<{ playlist: SubsonicPlaylist; songs: SubsonicSong[] }> {
  const data = await request<{
    playlist: SubsonicPlaylist & { entry?: SubsonicSong | SubsonicSong[] };
  }>(config, salt, "getPlaylist", { id });
  if (!data.playlist) {
    throw new SubsonicError("Playlist not found");
  }
  const { entry, ...playlist } = data.playlist;
  return { playlist, songs: toArray(entry) };
}

export async function createPlaylist(
  config: SubsonicConfig,
  salt: string,
  name: string,
  songIds?: string[]
): Promise<string> {
  const data = await request<{ playlist: { id: string } }>(
    config,
    salt,
    "createPlaylist",
    { name, songId: songIds }
  );
  if (!data.playlist?.id) {
    throw new SubsonicError("Server did not return the created playlist");
  }
  return data.playlist.id;
}

export async function deletePlaylist(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<void> {
  await request(config, salt, "deletePlaylist", { id });
}

export async function addToPlaylist(
  config: SubsonicConfig,
  salt: string,
  playlistId: string,
  songIds: string[]
): Promise<void> {
  await request(config, salt, "updatePlaylist", {
    playlistId,
    songIdToAdd: songIds,
  });
}

export async function removeFromPlaylist(
  config: SubsonicConfig,
  salt: string,
  playlistId: string,
  songIndexesToRemove: number[]
): Promise<void> {
  await request(config, salt, "updatePlaylist", {
    playlistId,
    songIndexToRemove: songIndexesToRemove,
  });
}
