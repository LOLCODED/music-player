import axios from "axios";
import { SubsonicConfig } from "../config/subsonic";
import { SubsonicAlbum, SubsonicSong, SubsonicResponse } from "../types/subsonic";
import { buildActionUrl } from "./SubsonicBase";

export type StarableType = "song" | "album" | "artist";

function starParam(id: string, type: StarableType): string {
  if (type === "album") return `albumId=${encodeURIComponent(id)}`;
  if (type === "artist") return `artistId=${encodeURIComponent(id)}`;
  return `id=${encodeURIComponent(id)}`;
}

export async function star(
  config: SubsonicConfig,
  salt: string,
  id: string,
  type: StarableType
): Promise<void> {
  const url = `${buildActionUrl(config, salt, "star")}&${starParam(id, type)}`;
  await axios.get(url);
}

export async function unstar(
  config: SubsonicConfig,
  salt: string,
  id: string,
  type: StarableType
): Promise<void> {
  const url = `${buildActionUrl(config, salt, "unstar")}&${starParam(id, type)}`;
  await axios.get(url);
}

export async function getStarred(
  config: SubsonicConfig,
  salt: string
): Promise<{ songs: SubsonicSong[]; albums: SubsonicAlbum[] }> {
  const url = buildActionUrl(config, salt, "getStarred2");
  const response = await axios.get<
    SubsonicResponse<{ starred2: { song?: SubsonicSong | SubsonicSong[]; album?: SubsonicAlbum | SubsonicAlbum[] } }>
  >(url);

  if (response.data["subsonic-response"].status !== "ok") {
    throw new Error(
      response.data["subsonic-response"].error?.message || "Failed to get favorites"
    );
  }

  const raw = (response.data["subsonic-response"] as any).starred2 ?? {};
  const songs = raw.song ? (Array.isArray(raw.song) ? raw.song : [raw.song]) : [];
  const albums = raw.album ? (Array.isArray(raw.album) ? raw.album : [raw.album]) : [];

  return { songs, albums };
}
