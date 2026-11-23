import { renderHook, waitFor } from "@testing-library/react";
import { CARPLAY_SIGNED_OUT_MESSAGE, useCarPlay } from "./useCarPlay";

const listeners = new Map<string, (data: unknown) => void>();
const plugin = vi.hoisted(() => ({
  ready: vi.fn().mockResolvedValue(undefined),
  resolveList: vi.fn().mockResolvedValue(undefined),
  addListener: vi.fn(),
}));
const auth = vi.hoisted(() => ({ subsonicService: null as unknown, loading: false }));
const playAlbum = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({ Capacitor: { isPluginAvailable: () => true } }));
vi.mock("../services/CarPlayPlugin", () => ({ CarPlay: plugin }));
vi.mock("../contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../contexts/MusicPlayerContext", () => ({ useMusicPlayer: () => ({ playAlbum }) }));

const album = { id: "al-1", name: "Paranoid", artist: "Black Sabbath" };
const songs = [{ id: "s1" }];
const service = {
  getCoverArtUrl: (id: string) => `https://x/${id}`,
  getAlbumList: vi.fn().mockResolvedValue([album]),
  getAlbum: vi.fn().mockResolvedValue({ album, songs }),
};

describe("useCarPlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listeners.clear();
    plugin.addListener.mockImplementation((event: string, handler: (data: unknown) => void) => {
      listeners.set(event, handler);
      return Promise.resolve({ remove: vi.fn() });
    });
    auth.subsonicService = service;
    auth.loading = false;
  });

  it("tells CarPlay it is ready once auth has settled", () => {
    auth.loading = true;
    const { rerender } = renderHook(() => useCarPlay());
    expect(plugin.ready).not.toHaveBeenCalled();
    auth.loading = false;
    rerender();
    expect(plugin.ready).toHaveBeenCalledTimes(1);
  });

  it("answers list requests from the library", async () => {
    renderHook(() => useCarPlay());
    listeners.get("listRequested")?.({ requestId: "r1", section: "newest" });
    await waitFor(() => expect(plugin.resolveList).toHaveBeenCalled());
    expect(plugin.resolveList.mock.calls[0][0]).toMatchObject({
      requestId: "r1",
      items: [{ id: "al-1", kind: "album", title: "Paranoid" }],
    });
  });

  it("asks the driver to sign in on the phone when signed out", async () => {
    auth.subsonicService = null;
    renderHook(() => useCarPlay());
    listeners.get("listRequested")?.({ requestId: "r2", section: "playlists" });
    await waitFor(() =>
      expect(plugin.resolveList).toHaveBeenCalledWith({
        requestId: "r2",
        items: [],
        emptyMessage: CARPLAY_SIGNED_OUT_MESSAGE,
      })
    );
  });

  it("plays the selected album through the player", async () => {
    renderHook(() => useCarPlay());
    listeners.get("itemSelected")?.({ kind: "album", id: "al-1" });
    await waitFor(() => expect(playAlbum).toHaveBeenCalledWith(album, songs, undefined, undefined));
  });
});
