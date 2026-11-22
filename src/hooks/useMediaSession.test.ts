import { renderHook } from "@testing-library/react";
import { useMediaSession } from "./useMediaSession";
import { Song } from "../types/player";

const song: Song = { id: "s1", title: "War Pigs", artist: "Black Sabbath", albumName: "Paranoid", albumArtUrl: "https://x/cover" } as Song;

describe("useMediaSession", () => {
  const handlers = new Map<string, (() => void) | null>();
  const session = {
    metadata: null as unknown,
    playbackState: "none",
    setActionHandler: (action: string, handler: (() => void) | null) => handlers.set(action, handler),
  };

  beforeEach(() => {
    handlers.clear();
    Object.defineProperty(navigator, "mediaSession", { value: session, configurable: true });
    vi.stubGlobal("MediaMetadata", class { constructor(init: object) { Object.assign(this, init); } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("publishes the song and playback state", () => {
    renderHook(() => useMediaSession(song, true, { togglePlayPause: vi.fn(), skipNext: vi.fn(), skipPrevious: vi.fn() }));
    expect(session.metadata).toMatchObject({ title: "War Pigs", artist: "Black Sabbath", album: "Paranoid" });
    expect(session.playbackState).toBe("playing");
  });

  it("routes lock-screen buttons to the player without double toggling", () => {
    const togglePlayPause = vi.fn();
    const skipNext = vi.fn();
    renderHook(() => useMediaSession(song, true, { togglePlayPause, skipNext, skipPrevious: vi.fn() }));
    handlers.get("play")?.();
    expect(togglePlayPause).not.toHaveBeenCalled();
    handlers.get("pause")?.();
    expect(togglePlayPause).toHaveBeenCalledTimes(1);
    handlers.get("nexttrack")?.();
    expect(skipNext).toHaveBeenCalled();
  });
});
