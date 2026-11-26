import {
  clearPlaybackSnapshot,
  loadPlaybackSnapshot,
  savePlaybackProgress,
  savePlaybackQueue,
  type PlaybackQueueSnapshot,
} from "./playbackSnapshot";
import type { SubsonicSong } from "../types/subsonic";

const queue: PlaybackQueueSnapshot = {
  songs: [{ id: "s1", title: "One" } as SubsonicSong, { id: "s2", title: "Two" } as SubsonicSong],
  index: 1,
  album: null,
  sourcePath: "/playlist/p1",
  shuffle: true,
  repeatMode: "all",
};

describe("playbackSnapshot", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips the queue and position per connection", () => {
    savePlaybackQueue("a|me", queue);
    savePlaybackProgress("a|me", 42.5);
    expect(loadPlaybackSnapshot("a|me")).toEqual({ ...queue, progress: 42.5 });
    expect(loadPlaybackSnapshot("b|me")).toBeNull();
  });

  it("starts from the beginning when no position was saved", () => {
    savePlaybackQueue("a|me", queue);
    expect(loadPlaybackSnapshot("a|me")?.progress).toBe(0);
  });

  it("ignores corrupt or inconsistent data", () => {
    localStorage.setItem("playbackQueue:a|me", "{not json");
    expect(loadPlaybackSnapshot("a|me")).toBeNull();
    savePlaybackQueue("a|me", { ...queue, index: 5 });
    expect(loadPlaybackSnapshot("a|me")).toBeNull();
  });

  it("clears both parts", () => {
    savePlaybackQueue("a|me", queue);
    savePlaybackProgress("a|me", 10);
    clearPlaybackSnapshot("a|me");
    expect(loadPlaybackSnapshot("a|me")).toBeNull();
    expect(localStorage.getItem("playbackProgress:a|me")).toBeNull();
  });
});
