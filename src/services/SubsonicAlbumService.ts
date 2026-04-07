import axios from "axios";
import { SubsonicConfig } from "../config/subsonic";
import { SubsonicAlbum, SubsonicSong, SubsonicResponse } from "../types/subsonic";
import { buildActionUrl } from "./SubsonicBase";

export async function getAlbumList(
  config: SubsonicConfig,
  salt: string,
  type:
    | "newest"
    | "recent"
    | "frequent"
    | "random"
    | "alphabeticalByName"
    | "alphabeticalByArtist" = "alphabeticalByName",
  size: number = 500,
  offset: number = 0
): Promise<SubsonicAlbum[]> {
  const url = `${buildActionUrl(config, salt, "getAlbumList2")}&type=${type}&size=${size}&offset=${offset}`;
  const response = await axios.get<
    SubsonicResponse<{ albumList2: { album: SubsonicAlbum[] } }>
  >(url);

  if (response.data["subsonic-response"].status === "ok") {
    return response.data["subsonic-response"].albumList2?.album || [];
  }
  throw new Error(
    response.data["subsonic-response"].error?.message || "Failed to get albums"
  );
}

export async function getAlbum(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<{ album: SubsonicAlbum; songs: SubsonicSong[] }> {
  const url = `${buildActionUrl(config, salt, "getAlbum")}&id=${encodeURIComponent(id)}`;
  const response = await axios.get<
    SubsonicResponse<{ album: SubsonicAlbum & { song: SubsonicSong[] } }>
  >(url);

  if (response.data["subsonic-response"].status === "ok") {
    const albumData = response.data["subsonic-response"].album;
    return { album: albumData, songs: albumData.song || [] };
  }
  throw new Error(
    response.data["subsonic-response"].error?.message ||
      "Failed to get album details"
  );
}

export async function getSongs(
  config: SubsonicConfig,
  salt: string,
  count: number = 50,
  offset: number = 0
): Promise<SubsonicSong[]> {
  const url =
    `${buildActionUrl(config, salt, "search3")}` +
    `&query=&songCount=${count}&songOffset=${offset}&albumCount=0&artistCount=0`;
  const response = await axios.get<
    SubsonicResponse<{ searchResult3: { song?: SubsonicSong | SubsonicSong[] } }>
  >(url);
  if (response.data["subsonic-response"].status === "ok") {
    const raw = (response.data["subsonic-response"] as any).searchResult3?.song ?? [];
    return Array.isArray(raw) ? raw : [raw];
  }
  throw new Error(
    response.data["subsonic-response"].error?.message || "Failed to get songs"
  );
}

export async function searchSongs(
  config: SubsonicConfig,
  salt: string,
  query: string,
  count: number = 50,
  offset: number = 0
): Promise<SubsonicSong[]> {
  const url =
    `${buildActionUrl(config, salt, "search3")}` +
    `&query=${encodeURIComponent(query)}&songCount=${count}&songOffset=${offset}&albumCount=0&artistCount=0`;
  const response = await axios.get<
    SubsonicResponse<{ searchResult3: { song?: SubsonicSong | SubsonicSong[] } }>
  >(url);
  if (response.data["subsonic-response"].status === "ok") {
    const raw = (response.data["subsonic-response"] as any).searchResult3?.song ?? [];
    return Array.isArray(raw) ? raw : [raw];
  }
  throw new Error(
    response.data["subsonic-response"].error?.message || "Failed to search songs"
  );
}

export async function searchAlbums(
  config: SubsonicConfig,
  salt: string,
  query: string,
  albumCount: number = 50,
  albumOffset: number = 0
): Promise<SubsonicAlbum[]> {
  const params = `&query=${encodeURIComponent(query)}&albumCount=${albumCount}&albumOffset=${albumOffset}`;

  // Try search3 first
  const url3 = `${buildActionUrl(config, salt, "search3")}${params}`;
  const response3 = await axios.get<
    SubsonicResponse<{ searchResult3: { album?: SubsonicAlbum[] } }>
  >(url3);

  if (
    response3.data["subsonic-response"].status === "ok" &&
    (response3.data["subsonic-response"] as any).searchResult3
  ) {
    const albums =
      (response3.data["subsonic-response"] as any).searchResult3?.album || [];
    return Array.isArray(albums) ? albums : [albums];
  }

  // Fallback to search2
  const url2 = `${buildActionUrl(config, salt, "search2")}${params}`;
  const response2 = await axios.get<
    SubsonicResponse<{ searchResult2: { album?: SubsonicAlbum[] } }>
  >(url2);

  if (response2.data["subsonic-response"].status === "ok") {
    const albums =
      (response2.data["subsonic-response"] as any).searchResult2?.album || [];
    return Array.isArray(albums) ? albums : [albums];
  }
  throw new Error(
    response2.data["subsonic-response"].error?.message ||
      "Failed to search albums"
  );
}
