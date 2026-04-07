import { SubsonicAlbum, SubsonicPlaylist } from "../types/subsonic";

export function buildPseudoAlbum(playlist: SubsonicPlaylist): SubsonicAlbum {
  return {
    id: playlist.id,
    name: playlist.name,
    artist: "Various Artists",
    artistId: "",
    coverArt: playlist.coverArt,
    songCount: playlist.songCount,
    duration: playlist.duration,
    created: playlist.created,
    year: 0,
    genre: "",
  };
}
