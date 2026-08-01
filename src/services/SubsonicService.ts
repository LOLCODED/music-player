import { SubsonicConfig } from "../config/subsonic";
import { generateSalt, request, SubsonicError } from "./SubsonicBase";
import {
  getAlbumList,
  getAlbum,
  searchAlbums,
  getSongs,
  searchSongs,
  AlbumListType,
} from "./SubsonicAlbumService";
import { star, unstar, getStarred, StarableType } from "./SubsonicFavoritesService";
import { getStreamUrl, getCoverArtUrl } from "./SubsonicStreamService";
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
} from "./SubsonicPlaylistService";

export type { SubsonicAlbum, SubsonicSong, SubsonicPlaylist } from "../types/subsonic";
export type { AlbumListType } from "./SubsonicAlbumService";
export { SubsonicError } from "./SubsonicBase";

export function createSubsonicService(config: SubsonicConfig) {
  // One salt per session: the derived token is what the server sees, and a
  // fresh salt per request would not reduce replayability of a leaked pair.
  const salt = generateSalt();

  return {
    /**
     * Returns true when the server accepts the credentials, false when the
     * server explicitly rejects them, and throws on network/timeout errors so
     * callers can tell "bad password" apart from "server unreachable".
     */
    ping: async (): Promise<boolean> => {
      try {
        await request(config, salt, "ping");
        return true;
      } catch (error) {
        if (error instanceof SubsonicError && error.code !== undefined) {
          return false;
        }
        throw error;
      }
    },
    getAlbumList: (type?: AlbumListType, size?: number, offset?: number) =>
      getAlbumList(config, salt, type, size, offset),
    getAlbum: (id: string) => getAlbum(config, salt, id),
    searchAlbums: (query: string, albumCount?: number, albumOffset?: number) =>
      searchAlbums(config, salt, query, albumCount, albumOffset),
    getSongs: (count?: number, offset?: number) =>
      getSongs(config, salt, count, offset),
    searchSongs: (query: string, count?: number, offset?: number) =>
      searchSongs(config, salt, query, count, offset),
    getStreamUrl: (songId: string, timeOffset?: number, maxBitRate?: number) =>
      getStreamUrl(config, salt, songId, timeOffset, maxBitRate),
    getCoverArtUrl: (coverArtId: string, size?: number) =>
      getCoverArtUrl(config, salt, coverArtId, size),
    getPlaylists: () => getPlaylists(config, salt),
    getPlaylist: (id: string) => getPlaylist(config, salt, id),
    createPlaylist: (name: string, songIds?: string[]) =>
      createPlaylist(config, salt, name, songIds),
    deletePlaylist: (id: string) => deletePlaylist(config, salt, id),
    addToPlaylist: (playlistId: string, songIds: string[]) =>
      addToPlaylist(config, salt, playlistId, songIds),
    removeFromPlaylist: (playlistId: string, songIndexesToRemove: number[]) =>
      removeFromPlaylist(config, salt, playlistId, songIndexesToRemove),
    star: (id: string, type: StarableType) => star(config, salt, id, type),
    unstar: (id: string, type: StarableType) => unstar(config, salt, id, type),
    getStarred: () => getStarred(config, salt),
  };
}

export type SubsonicService = ReturnType<typeof createSubsonicService>;
