import React from "react";
import { act, renderHook } from "@testing-library/react";
import { PRELOAD_DELAY_MS, useStreamSource } from "./useStreamSource";
import { SettingsProvider } from "../contexts/SettingsContext";
import type { SubsonicService } from "../services/SubsonicService";

const network = vi.hoisted(() => ({ cellular: false }));
const preloader = vi.hoisted(() => ({
  ready: new Map<string, string>(),
  preload: vi.fn(),
  retainOnly: vi.fn(),
}));

vi.mock("./useIsCellular", () => ({ useIsCellular: () => network.cellular }));
vi.mock("../utils/trackPreloader", () => ({
  createTrackPreloader: () => ({
    preload: preloader.preload,
    retainOnly: preloader.retainOnly,
    urlFor: (id: string) => preloader.ready.get(id),
  }),
}));

const service = {
  getStreamUrl: (id: string, _offset?: number, maxBitRate?: number) => `live:${id}:${maxBitRate ?? "raw"}`,
} as unknown as SubsonicService;

const wrapper = ({ children }: { children: React.ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function render(currentSongId: string | null, isPlaying: boolean, nextId?: string) {
  return renderHook(
    ({ songId, playing }) => useStreamSource(service, songId, playing, () => nextId),
    { wrapper, initialProps: { songId: currentSongId, playing: isPlaying } }
  );
}

describe("useStreamSource", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    network.cellular = false;
    preloader.ready.clear();
    preloader.preload.mockClear();
    preloader.retainOnly.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("streams the original on Wi-Fi and 192 kbps on cellular by default", () => {
    expect(render("s1", true).result.current("s1")).toBe("live:s1:raw");
    network.cellular = true;
    expect(render("s1", true).result.current("s1")).toBe("live:s1:192");
  });

  it("plays a preloaded copy once it is ready", () => {
    preloader.ready.set("s2", "blob:s2");
    const { result } = render("s1", true, "s2");
    expect(result.current("s2")).toBe("blob:s2");
  });

  it("preloads the next song after a delay while playing", () => {
    render("s1", true, "s2");
    expect(preloader.preload).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(PRELOAD_DELAY_MS));
    expect(preloader.preload).toHaveBeenCalledWith("s2", "live:s2:raw");
    expect(preloader.retainOnly).toHaveBeenLastCalledWith(["s1", "s2"]);
  });

  it("does not preload while paused", () => {
    render("s1", false, "s2");
    act(() => vi.advanceTimersByTime(PRELOAD_DELAY_MS));
    expect(preloader.preload).not.toHaveBeenCalled();
  });

  it("frees every preload once playback stops", () => {
    const hook = render("s1", true, "s2");
    hook.rerender({ songId: null, playing: false });
    expect(preloader.retainOnly).toHaveBeenLastCalledWith([]);
  });
});
