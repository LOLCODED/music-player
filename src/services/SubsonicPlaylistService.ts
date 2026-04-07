import axios from "axios";
import { SubsonicConfig } from "../config/subsonic";
import { SubsonicPlaylist, SubsonicSong, SubsonicResponse } from "../types/subsonic";
import { buildActionUrl } from "./SubsonicBase";

export async function getPlaylists(
  config: SubsonicConfig,
  salt: string
): Promise<SubsonicPlaylist[]> {
  const url = buildActionUrl(config, salt, "getPlaylists");
  const response = await axios.get<
    SubsonicResponse<{ playlists: { playlist: SubsonicPlaylist[] } }>
  >(url);

  if (response.data["subsonic-response"].status === "ok") {
    const playlists =
      response.data["subsonic-response"].playlists?.playlist || [];
    return Array.isArray(playlists) ? playlists : [playlists];
  }
  throw new Error(
    response.data["subsonic-response"].error?.message ||
      "Failed to get playlists"
  );
}

export async function getPlaylist(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<{ playlist: SubsonicPlaylist; songs: SubsonicSong[] }> {
  const url = `${buildActionUrl(config, salt, "getPlaylist")}&id=${encodeURIComponent(id)}`;
  const response = await axios.get<
    SubsonicResponse<{ playlist: SubsonicPlaylist & { entry: SubsonicSong[] } }>
  >(url);

  if (response.data["subsonic-response"].status === "ok") {
    const playlistData = response.data["subsonic-response"].playlist;
    return { playlist: playlistData, songs: playlistData.entry || [] };
  }
  throw new Error(
    response.data["subsonic-response"].error?.message ||
      "Failed to get playlist details"
  );
}

export async function createPlaylist(
  config: SubsonicConfig,
  salt: string,
  name: string,
  songIds?: string[]
): Promise<string> {
  let url = `${buildActionUrl(config, salt, "createPlaylist")}&name=${encodeURIComponent(name)}`;
  if (songIds && songIds.length > 0) {
    url += `&songId=${songIds.map(encodeURIComponent).join("&songId=")}`;
  }

  const response = await axios.get<
    SubsonicResponse<{ playlist: { id: string } }>
  >(url);

  if (response.data["subsonic-response"].status === "ok") {
    return response.data["subsonic-response"].playlist.id;
  }
  throw new Error(
    response.data["subsonic-response"].error?.message ||
      "Failed to create playlist"
  );
}

export async function deletePlaylist(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<void> {
  const url = `${buildActionUrl(config, salt, "deletePlaylist")}&id=${encodeURIComponent(id)}`;
  const response = await axios.get<SubsonicResponse<{}>>(url);

  if (response.data["subsonic-response"].status !== "ok") {
    throw new Error(
      response.data["subsonic-response"].error?.message ||
        "Failed to delete playlist"
    );
  }
}

export async function addToPlaylist(
  config: SubsonicConfig,
  salt: string,
  playlistId: string,
  songIds: string[]
): Promise<void> {
  const url =
    `${buildActionUrl(config, salt, "updatePlaylist")}` +
    `&playlistId=${encodeURIComponent(playlistId)}` +
    `&songIdToAdd=${songIds.map(encodeURIComponent).join("&songIdToAdd=")}`;
  const response = await axios.get<SubsonicResponse<{}>>(url);

  if (response.data["subsonic-response"].status !== "ok") {
    throw new Error(
      response.data["subsonic-response"].error?.message ||
        "Failed to add songs to playlist"
    );
  }
}

export async function removeFromPlaylist(
  config: SubsonicConfig,
  salt: string,
  playlistId: string,
  songIndexesToRemove: number[]
): Promise<void> {
  const url =
    `${buildActionUrl(config, salt, "updatePlaylist")}` +
    `&playlistId=${encodeURIComponent(playlistId)}` +
    `&songIndexToRemove=${songIndexesToRemove.join("&songIndexToRemove=")}`;
  const response = await axios.get<SubsonicResponse<{}>>(url);

  if (response.data["subsonic-response"].status !== "ok") {
    throw new Error(
      response.data["subsonic-response"].error?.message ||
        "Failed to remove songs from playlist"
    );
  }
}
