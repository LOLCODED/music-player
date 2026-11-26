import { createTrackPreloader, MAX_PRELOAD_BYTES } from "./trackPreloader";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function audioResponse(bytes: number, headers: Record<string, string> = {}): Response {
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { "Content-Type": "audio/mpeg", ...headers },
  });
}

describe("createTrackPreloader", () => {
  let created = 0;
  const revoke = vi.fn();

  beforeEach(() => {
    created = 0;
    revoke.mockClear();
    URL.createObjectURL = vi.fn(() => `blob:track-${++created}`);
    URL.revokeObjectURL = revoke;
  });

  it("exposes a local URL once the track has downloaded", async () => {
    const preloader = createTrackPreloader(vi.fn().mockResolvedValue(audioResponse(16)));
    preloader.preload("s1", "https://x/stream?id=s1");
    expect(preloader.urlFor("s1")).toBeUndefined();
    await flush();
    expect(preloader.urlFor("s1")).toBe("blob:track-1");
  });

  it("downloads each track only once", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(audioResponse(16));
    const preloader = createTrackPreloader(fetchImpl);
    preloader.preload("s1", "u");
    preloader.preload("s1", "u");
    await flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("skips tracks that declare a size above the cap", async () => {
    const response = audioResponse(16, { "Content-Length": String(MAX_PRELOAD_BYTES + 1) });
    const preloader = createTrackPreloader(vi.fn().mockResolvedValue(response));
    preloader.preload("s1", "u");
    await flush();
    expect(preloader.urlFor("s1")).toBeUndefined();
  });

  it("forgets failed downloads so they can be retried", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementation(() => Promise.resolve(audioResponse(16)));
    const preloader = createTrackPreloader(fetchImpl);
    preloader.preload("s1", "u");
    await flush();
    preloader.preload("s1", "u");
    await flush();
    expect(preloader.urlFor("s1")).toBe("blob:track-1");
  });

  it("aborts and frees tracks that are no longer needed", async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(audioResponse(16)));
    const preloader = createTrackPreloader(fetchImpl);
    preloader.preload("s1", "u");
    preloader.preload("s2", "u");
    await flush();

    preloader.retainOnly(["s2"]);

    expect(preloader.urlFor("s1")).toBeUndefined();
    expect(preloader.urlFor("s2")).toBe("blob:track-2");
    expect(revoke).toHaveBeenCalledWith("blob:track-1");
    expect((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].signal?.aborted).toBe(true);
  });
});
