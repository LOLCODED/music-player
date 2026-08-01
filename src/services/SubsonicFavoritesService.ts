import { SubsonicConfig } from "../config/subsonic";
import { SubsonicAlbum, SubsonicSong } from "../types/subsonic";
import { request, toArray } from "./SubsonicBase";

export type StarableType = "song" | "album" | "artist";

function starParams(id: string, type: StarableType): Record<string, string> {
  if (type === "album") return { albumId: id };
  if (type === "artist") return { artistId: id };
  return { id };
}

export async function star(
  config: SubsonicConfig,
  salt: string,
  id: string,
  type: StarableType
): Promise<void> {
  await request(config, salt, "star", starParams(id, type));
}

export async function unstar(
  config: SubsonicConfig,
  salt: string,
  id: string,
  type: StarableType
): Promise<void> {
  await request(config, salt, "unstar", starParams(id, type));
}

export async function getStarred(
  config: SubsonicConfig,
  salt: string
): Promise<{ songs: SubsonicSong[]; albums: SubsonicAlbum[] }> {
  const data = await request<{
    starred2: {
      song?: SubsonicSong | SubsonicSong[];
      album?: SubsonicAlbum | SubsonicAlbum[];
    };
  }>(config, salt, "getStarred2");
  return {
    songs: toArray(data.starred2?.song),
    albums: toArray(data.starred2?.album),
  };
}
