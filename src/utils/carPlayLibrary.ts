import type { SubsonicService } from "../services/SubsonicService";
import type { SubsonicAlbum, SubsonicPlaylist, SubsonicSong } from "../types/subsonic";
import type { CarPlayItem, CarPlayItemKind, CarPlaySection } from "../services/CarPlayPlugin";
import { COVER_ART_SIZE } from "./constants";
import { buildPseudoAlbum } from "./playlist";

// CarPlay caps list length; long lists are also unusable while driving.
export const CARPLAY_LIST_LIMIT = 100;

function artworkUrl(service: SubsonicService, coverArt?: string): string | undefined {
  return coverArt ? service.getCoverArtUrl(coverArt, COVER_ART_SIZE) : undefined;
}

function playlistItem(service: SubsonicService, playlist: SubsonicPlaylist): CarPlayItem {
  return {
    id: playlist.id,
    kind: "playlist",
    title: playlist.name,
    subtitle: `${playlist.songCount} songs`,
    artworkUrl: artworkUrl(service, playlist.coverArt),
  };
}

function albumItem(service: SubsonicService, album: SubsonicAlbum): CarPlayItem {
  return {
    id: album.id,
    kind: "album",
    title: album.name,
    subtitle: album.artist,
    artworkUrl: artworkUrl(service, album.coverArt),
  };
}

export async function loadCarPlaySection(
  service: SubsonicService,
  section: CarPlaySection
): Promise<CarPlayItem[]> {
  if (section === "playlists") {
    const playlists = await service.getPlaylists();
    return playlists.slice(0, CARPLAY_LIST_LIMIT).map((p) => playlistItem(service, p));
  }
  const albums = await service.getAlbumList(section, CARPLAY_LIST_LIMIT);
  return albums.map((a) => albumItem(service, a));
}

export interface PlayableSelection {
  album: SubsonicAlbum;
  songs: SubsonicSong[];
  playlistId?: string;
}

export async function loadCarPlaySelection(
  service: SubsonicService,
  kind: CarPlayItemKind,
  id: string
): Promise<PlayableSelection> {
  if (kind === "playlist") {
    const { playlist, songs } = await service.getPlaylist(id);
    return { album: buildPseudoAlbum(playlist), songs, playlistId: playlist.id };
  }
  return service.getAlbum(id);
}
