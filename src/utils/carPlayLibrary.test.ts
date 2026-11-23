import { CARPLAY_LIST_LIMIT, loadCarPlaySection, loadCarPlaySelection } from "./carPlayLibrary";
import type { SubsonicService } from "../services/SubsonicService";
import type { SubsonicAlbum, SubsonicPlaylist } from "../types/subsonic";

const album = { id: "al-1", name: "Paranoid", artist: "Black Sabbath", coverArt: "co-1" } as SubsonicAlbum;
const playlist = { id: "pl-1", name: "Road Trip", songCount: 3, duration: 600, created: "", coverArt: "co-2" } as SubsonicPlaylist;
const songs = [{ id: "s1" }, { id: "s2" }];

function makeService(overrides: Partial<SubsonicService> = {}): SubsonicService {
  return {
    getCoverArtUrl: (id: string) => `https://x/${id}`,
    getPlaylists: vi.fn().mockResolvedValue([playlist]),
    getAlbumList: vi.fn().mockResolvedValue([album]),
    getPlaylist: vi.fn().mockResolvedValue({ playlist, songs }),
    getAlbum: vi.fn().mockResolvedValue({ album, songs }),
    ...overrides,
  } as unknown as SubsonicService;
}

describe("loadCarPlaySection", () => {
  it("lists playlists with their song count and cover", async () => {
    const items = await loadCarPlaySection(makeService(), "playlists");
    expect(items).toEqual([
      { id: "pl-1", kind: "playlist", title: "Road Trip", subtitle: "3 songs", artworkUrl: "https://x/co-2" },
    ]);
  });

  it("caps the playlist list at the CarPlay limit", async () => {
    const many = Array.from({ length: CARPLAY_LIST_LIMIT + 5 }, (_, i) => ({ ...playlist, id: `p${i}` }));
    const service = makeService({ getPlaylists: vi.fn().mockResolvedValue(many) });
    expect(await loadCarPlaySection(service, "playlists")).toHaveLength(CARPLAY_LIST_LIMIT);
  });

  it("asks the server for the matching album list", async () => {
    const service = makeService();
    const items = await loadCarPlaySection(service, "recent");
    expect(service.getAlbumList).toHaveBeenCalledWith("recent", CARPLAY_LIST_LIMIT);
    expect(items).toEqual([
      { id: "al-1", kind: "album", title: "Paranoid", subtitle: "Black Sabbath", artworkUrl: "https://x/co-1" },
    ]);
  });
});

describe("loadCarPlaySelection", () => {
  it("loads a playlist as a pseudo album that keeps its playlist id", async () => {
    const selection = await loadCarPlaySelection(makeService(), "playlist", "pl-1");
    expect(selection.playlistId).toBe("pl-1");
    expect(selection.album).toMatchObject({ id: "pl-1", name: "Road Trip" });
    expect(selection.songs).toBe(songs);
  });

  it("loads an album without a playlist id", async () => {
    const selection = await loadCarPlaySelection(makeService(), "album", "al-1");
    expect(selection).toEqual({ album, songs });
  });
});
