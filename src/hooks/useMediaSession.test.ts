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

  it("re-registers the handlers whenever media starts playing", () => {
    const skipNext = vi.fn();
    renderHook(() => useMediaSession(song, true, { togglePlayPause: vi.fn(), skipNext, skipPrevious: vi.fn() }));
    handlers.clear();

    const audio = document.createElement("audio");
    document.body.appendChild(audio);
    audio.dispatchEvent(new Event("playing"));
    audio.remove();

    handlers.get("nexttrack")?.();
    expect(skipNext).toHaveBeenCalled();
  });

  it("re-registers the handlers when a song loads without playing", () => {
    renderHook(() => useMediaSession(song, false, { togglePlayPause: vi.fn(), skipNext: vi.fn(), skipPrevious: vi.fn() }));
    handlers.clear();
    document.body.appendChild(document.createElement("audio")).dispatchEvent(new Event("loadedmetadata"));
    expect(handlers.has("play")).toBe(true);
  });

  it("stops re-registering after unmount", () => {
    const { unmount } = renderHook(() => useMediaSession(song, true, { togglePlayPause: vi.fn(), skipNext: vi.fn(), skipPrevious: vi.fn() }));
    unmount();
    handlers.clear();
    document.dispatchEvent(new Event("playing"));
    expect(handlers.size).toBe(0);
  });
});
