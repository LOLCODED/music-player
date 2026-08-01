import { recordSongPlay, getRecentSongs, recordPlaylistPlay, getRecentPlaylistIds } from "./recentlyPlayed";
import { SubsonicSong } from "../types/subsonic";

function makeSong(id: string): SubsonicSong {
  return {
    id,
    parent: "p",
    title: `Song ${id}`,
    album: "Album",
    artist: "Artist",
    size: 1,
    duration: 60,
    path: "a/b",
    suffix: "mp3",
    contentType: "audio/mpeg",
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("recentlyPlayed songs", () => {
  it("records most recent first and dedupes", () => {
    recordSongPlay(makeSong("1"));
    recordSongPlay(makeSong("2"));
    recordSongPlay(makeSong("1"));
    expect(getRecentSongs().map((s) => s.id)).toEqual(["1", "2"]);
  });

  it("filters out corrupted entries", () => {
    localStorage.setItem(
      "recentlyPlayed:songs",
      JSON.stringify([makeSong("1"), null, { id: 2 }, "junk"])
    );
    expect(getRecentSongs().map((s) => s.id)).toEqual(["1"]);
  });

  it("returns empty on non-array storage", () => {
    localStorage.setItem("recentlyPlayed:songs", '{"not":"an array"}');
    expect(getRecentSongs()).toEqual([]);
    localStorage.setItem("recentlyPlayed:songs", "not json");
    expect(getRecentSongs()).toEqual([]);
  });
});

describe("recentlyPlayed playlists", () => {
  it("records ids most recent first and dedupes", () => {
    recordPlaylistPlay("a");
    recordPlaylistPlay("b");
    recordPlaylistPlay("a");
    expect(getRecentPlaylistIds()).toEqual(["a", "b"]);
  });

  it("filters non-string entries", () => {
    localStorage.setItem("recentlyPlayed:playlists", JSON.stringify(["a", 1, null]));
    expect(getRecentPlaylistIds()).toEqual(["a"]);
  });
});
