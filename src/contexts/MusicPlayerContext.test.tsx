import { vi } from "vitest";
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { MusicPlayerProvider, useMusicPlayer } from "./MusicPlayerContext";
import { SubsonicAlbum, SubsonicSong } from "../types/subsonic";

vi.mock("./AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    subsonicConfig: null,
    subsonicService: {
      getCoverArtUrl: (id: string, size?: number) =>
        `https://music.example.com/cover/${id}?size=${size ?? ""}`,
      getStreamUrl: (id: string) => `https://music.example.com/stream/${id}`,
    },
    login: async () => true,
    logout: () => {},
    loading: false,
  }),
}));

const album: SubsonicAlbum = {
  id: "al-1",
  name: "Night Drive",
  artist: "The Testers",
  artistId: "ar-1",
  coverArt: "co-1",
  songCount: 5,
  duration: 900,
  created: "2024-01-01T00:00:00.000Z",
};

function makeSong(id: string, title: string): SubsonicSong {
  return {
    id,
    parent: album.id,
    title,
    album: album.name,
    artist: album.artist,
    coverArt: `co-${id}`,
    size: 1000,
    duration: 180,
    path: `music/${id}.mp3`,
    suffix: "mp3",
    contentType: "audio/mpeg",
  };
}

const songs: SubsonicSong[] = [
  makeSong("s1", "One"),
  makeSong("s2", "Two"),
  makeSong("s3", "Three"),
  makeSong("s4", "Four"),
  makeSong("s5", "Five"),
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MusicPlayerProvider>{children}</MusicPlayerProvider>
);

function renderPlayer() {
  return renderHook(() => useMusicPlayer(), { wrapper });
}

type Player = ReturnType<typeof renderPlayer>;

function startAlbum(player: Player, queue = songs, startIndex = 0): void {
  act(() => player.result.current.playAlbum(album, queue, startIndex));
}

beforeEach(() => {
  localStorage.clear();
});

describe("playAlbum", () => {
  it("sets the queue, the current song and starts playing", () => {
    const player = renderPlayer();
    startAlbum(player, songs, 2);

    expect(player.result.current.currentSong?.id).toBe("s3");
    expect(player.result.current.currentPlaylist).toHaveLength(5);
    expect(player.result.current.currentAlbum).toEqual(album);
    expect(player.result.current.isPlaying).toBe(true);
    expect(player.result.current.getCurrentSongIndex()).toBe(2);
    expect(player.result.current.isCurrentSong("s3")).toBe(true);
  });

  it("ignores an empty queue", () => {
    const player = renderPlayer();
    startAlbum(player, []);

    expect(player.result.current.currentSong).toBeNull();
    expect(player.result.current.isPlaying).toBe(false);
  });
});

describe("skipNext", () => {
  it("advances sequentially", () => {
    const player = renderPlayer();
    startAlbum(player);

    act(() => player.result.current.skipNext());
    expect(player.result.current.currentSong?.id).toBe("s2");
    expect(player.result.current.getCurrentSongIndex()).toBe(1);

    act(() => player.result.current.skipNext());
    expect(player.result.current.currentSong?.id).toBe("s3");
  });

  it("stops at the end of the queue when repeat is off", () => {
    const player = renderPlayer();
    startAlbum(player, songs, songs.length - 1);

    act(() => player.result.current.skipNext());

    expect(player.result.current.currentSong?.id).toBe("s5");
    expect(player.result.current.isPlaying).toBe(false);
  });

  it("wraps to the first track when repeat is all", () => {
    const player = renderPlayer();
    startAlbum(player, songs, songs.length - 1);
    act(() => player.result.current.toggleRepeat());
    expect(player.result.current.repeatMode).toBe("all");

    act(() => player.result.current.skipNext());

    expect(player.result.current.currentSong?.id).toBe("s1");
    expect(player.result.current.isPlaying).toBe(true);
  });
});

describe("skipPrevious", () => {
  it("restarts the first track instead of doing nothing", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.togglePlayPause());
    act(() => player.result.current.setProgress(50));
    expect(player.result.current.isPlaying).toBe(false);

    act(() => player.result.current.skipPrevious());

    expect(player.result.current.currentSong?.id).toBe("s1");
    expect(player.result.current.isPlaying).toBe(true);
    expect(player.result.current.progress).toBe(0);
  });

  it("wraps to the last track from the first when repeat is all", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.toggleRepeat());

    act(() => player.result.current.skipPrevious());

    expect(player.result.current.currentSong?.id).toBe("s5");
    expect(player.result.current.getCurrentSongIndex()).toBe(4);
  });

  it("steps back through the queue", () => {
    const player = renderPlayer();
    startAlbum(player, songs, 3);

    act(() => player.result.current.skipPrevious());

    expect(player.result.current.currentSong?.id).toBe("s3");
  });
});

describe("shuffle", () => {
  // Long enough that a "pick a random index each skip" implementation would
  // repeat a track with overwhelming probability.
  const longQueue = Array.from({ length: 12 }, (_, i) =>
    makeSong(`q${i}`, `Track ${i}`)
  );

  it("visits every track exactly once before the queue is exhausted", () => {
    const player = renderPlayer();
    startAlbum(player, longQueue);
    act(() => player.result.current.toggleShuffle());
    expect(player.result.current.shuffle).toBe(true);

    const visited = [player.result.current.currentSong!.id];
    for (let step = 1; step < longQueue.length; step++) {
      act(() => player.result.current.skipNext());
      visited.push(player.result.current.currentSong!.id);
    }

    expect(new Set(visited).size).toBe(longQueue.length);
    expect([...visited].sort()).toEqual(longQueue.map((song) => song.id).sort());
  });

  it("keeps the current track first so shuffle does not skip it", () => {
    const player = renderPlayer();
    startAlbum(player, songs, 2);

    act(() => player.result.current.toggleShuffle());

    expect(player.result.current.currentSong?.id).toBe("s3");
    expect(player.result.current.getCurrentSongIndex()).toBe(2);
  });

  it("stops after the shuffled queue is exhausted when repeat is off", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.toggleShuffle());

    for (let step = 0; step < songs.length; step++) {
      act(() => player.result.current.skipNext());
    }

    expect(player.result.current.isPlaying).toBe(false);
  });

  it("reshuffles into a fresh full cycle when wrapping with repeat all", () => {
    const player = renderPlayer();
    startAlbum(player, longQueue);
    act(() => player.result.current.toggleShuffle());
    act(() => player.result.current.toggleRepeat());
    expect(player.result.current.repeatMode).toBe("all");

    // Exhaust the first cycle, then wrap into the second one.
    for (let step = 1; step < longQueue.length; step++) {
      act(() => player.result.current.skipNext());
    }
    act(() => player.result.current.skipNext());

    expect(player.result.current.isPlaying).toBe(true);

    const secondCycle = [player.result.current.currentSong!.id];
    for (let step = 1; step < longQueue.length; step++) {
      act(() => player.result.current.skipNext());
      secondCycle.push(player.result.current.currentSong!.id);
    }

    expect(new Set(secondCycle).size).toBe(longQueue.length);
  });
});

describe("playSong", () => {
  it("toggles play/pause when the song is already current", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.setProgress(42));

    act(() => player.result.current.playSong(songs[0], album, songs));
    expect(player.result.current.isPlaying).toBe(false);
    expect(player.result.current.progress).toBe(42);
    expect(player.result.current.currentSong?.id).toBe("s1");

    act(() => player.result.current.playSong(songs[0], album, songs));
    expect(player.result.current.isPlaying).toBe(true);
    expect(player.result.current.progress).toBe(42);
  });

  it("switches to a different song and resets progress", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.setProgress(42));

    act(() => player.result.current.playSong(songs[3], album, songs));

    expect(player.result.current.currentSong?.id).toBe("s4");
    expect(player.result.current.progress).toBe(0);
    expect(player.result.current.getCurrentSongIndex()).toBe(3);
  });
});

describe("duplicate tracks in a queue", () => {
  const queue = [songs[0], songs[1], songs[0]];

  it("reports the playing position, not the first matching id", () => {
    const player = renderPlayer();
    startAlbum(player, queue, 0);

    act(() => player.result.current.skipNext());
    act(() => player.result.current.skipNext());

    expect(player.result.current.currentSong?.id).toBe("s1");
    expect(player.result.current.getCurrentSongIndex()).toBe(2);
  });

  it("steps backwards from the duplicate to its real predecessor", () => {
    const player = renderPlayer();
    startAlbum(player, queue, 2);

    act(() => player.result.current.skipPrevious());

    expect(player.result.current.getCurrentSongIndex()).toBe(1);
    expect(player.result.current.currentSong?.id).toBe("s2");
  });
});

describe("stop", () => {
  it("clears the current song and the queue", () => {
    const player = renderPlayer();
    startAlbum(player);

    act(() => player.result.current.stop());

    expect(player.result.current.currentSong).toBeNull();
    expect(player.result.current.currentPlaylist).toEqual([]);
    expect(player.result.current.currentAlbum).toBeNull();
    expect(player.result.current.currentSourcePath).toBeNull();
    expect(player.result.current.isPlaying).toBe(false);
    expect(player.result.current.getCurrentSongIndex()).toBe(-1);
  });

  it("makes skip a no-op once stopped", () => {
    const player = renderPlayer();
    startAlbum(player);
    act(() => player.result.current.stop());

    act(() => player.result.current.skipNext());

    expect(player.result.current.currentSong).toBeNull();
    expect(player.result.current.isPlaying).toBe(false);
  });
});

describe("getStreamUrl", () => {
  it("delegates to the subsonic service", () => {
    const player = renderPlayer();
    expect(player.result.current.getStreamUrl("s1")).toBe(
      "https://music.example.com/stream/s1"
    );
  });
});
