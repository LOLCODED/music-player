import { SubsonicConfig } from "../config/subsonic";
import { SubsonicAlbum, SubsonicSong } from "../types/subsonic";
import { request, toArray, SubsonicError } from "./SubsonicBase";

export type AlbumListType =
  | "newest"
  | "recent"
  | "frequent"
  | "random"
  | "alphabeticalByName"
  | "alphabeticalByArtist";

const DEFAULT_ALBUM_LIST_SIZE = 500;
const DEFAULT_SEARCH_COUNT = 50;

type SearchResult<K extends string> = {
  [key in K]: {
    song?: SubsonicSong | SubsonicSong[];
    album?: SubsonicAlbum | SubsonicAlbum[];
  };
};

export async function getAlbumList(
  config: SubsonicConfig,
  salt: string,
  type: AlbumListType = "alphabeticalByName",
  size: number = DEFAULT_ALBUM_LIST_SIZE,
  offset: number = 0
): Promise<SubsonicAlbum[]> {
  const data = await request<{
    albumList2: { album?: SubsonicAlbum | SubsonicAlbum[] };
  }>(config, salt, "getAlbumList2", { type, size, offset });
  return toArray(data.albumList2?.album);
}

export async function getAlbum(
  config: SubsonicConfig,
  salt: string,
  id: string
): Promise<{ album: SubsonicAlbum; songs: SubsonicSong[] }> {
  const data = await request<{
    album: SubsonicAlbum & { song?: SubsonicSong | SubsonicSong[] };
  }>(config, salt, "getAlbum", { id });
  if (!data.album) {
    throw new SubsonicError("Album not found");
  }
  const { song, ...album } = data.album;
  return { album, songs: toArray(song) };
}

export async function getSongs(
  config: SubsonicConfig,
  salt: string,
  count: number = DEFAULT_SEARCH_COUNT,
  offset: number = 0
): Promise<SubsonicSong[]> {
  // Empty search3 query is the closest thing to "list all songs" the API offers;
  // some servers (e.g. original Subsonic) return nothing for it.
  const data = await request<SearchResult<"searchResult3">>(config, salt, "search3", {
    query: "",
    songCount: count,
    songOffset: offset,
    albumCount: 0,
    artistCount: 0,
  });
  return toArray(data.searchResult3?.song);
}

export async function searchSongs(
  config: SubsonicConfig,
  salt: string,
  query: string,
  count: number = DEFAULT_SEARCH_COUNT,
  offset: number = 0
): Promise<SubsonicSong[]> {
  const data = await request<SearchResult<"searchResult3">>(config, salt, "search3", {
    query,
    songCount: count,
    songOffset: offset,
    albumCount: 0,
    artistCount: 0,
  });
  return toArray(data.searchResult3?.song);
}

export async function searchAlbums(
  config: SubsonicConfig,
  salt: string,
  query: string,
  albumCount: number = DEFAULT_SEARCH_COUNT,
  albumOffset: number = 0
): Promise<SubsonicAlbum[]> {
  const params = { query, albumCount, albumOffset, songCount: 0, artistCount: 0 };
  try {
    const data = await request<SearchResult<"searchResult3">>(
      config,
      salt,
      "search3",
      params
    );
    return toArray(data.searchResult3?.album);
  } catch (error) {
    // Fall back to search2 only when the server rejects search3 (older API versions)
    if (error instanceof SubsonicError && error.code !== undefined) {
      const data = await request<SearchResult<"searchResult2">>(
        config,
        salt,
        "search2",
        params
      );
      return toArray(data.searchResult2?.album);
    }
    throw error;
  }
}
