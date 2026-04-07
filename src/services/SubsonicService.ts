import axios from "axios";
import { SubsonicConfig } from "../config/subsonic";
import { generateSalt, buildActionUrl } from "./SubsonicBase";
import { getAlbumList, getAlbum, searchAlbums, getSongs, searchSongs } from "./SubsonicAlbumService";
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

export type { SubsonicAlbum, SubsonicSong, SubsonicPlaylist, SubsonicResponse } from "../types/subsonic";

export function createSubsonicService(config: SubsonicConfig) {
  const salt = generateSalt();

  return {
    ping: async (): Promise<boolean> => {
      try {
        const url = buildActionUrl(config, salt, "ping");
        const response = await axios.get(url);
        return response.data?.["subsonic-response"]?.status === "ok";
      } catch {
        return false;
      }
    },
    getAlbumList: (
      type?: Parameters<typeof getAlbumList>[2],
      size?: number,
      offset?: number
    ) => getAlbumList(config, salt, type, size, offset),
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
