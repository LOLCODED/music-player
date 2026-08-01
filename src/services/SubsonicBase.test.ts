import { vi } from "vitest";
import MD5 from "crypto-js/md5";
import {
  buildActionUrl,
  deriveAuthToken,
  generateSalt,
  getServerBase,
  subsonicGet,
  toArray,
  SubsonicError,
} from "./SubsonicBase";
import { SubsonicConfig } from "../config/subsonic";

const passwordConfig: SubsonicConfig = {
  serverUrl: "https://music.example.com/",
  username: "user name",
  password: "sesame",
  appName: "TestApp",
  apiVersion: "1.16.1",
};

describe("getServerBase", () => {
  it("strips a trailing slash", () => {
    expect(getServerBase("http://a/")).toBe("http://a");
    expect(getServerBase("http://a")).toBe("http://a");
  });
});

describe("deriveAuthToken", () => {
  it("prefers a stored token+salt pair", () => {
    const config = { ...passwordConfig, password: undefined, token: "t", salt: "s" };
    expect(deriveAuthToken(config, "ignored")).toEqual({ token: "t", salt: "s" });
  });

  it("derives MD5(password + salt) from a password", () => {
    const { token, salt } = deriveAuthToken(passwordConfig, "abc123");
    expect(salt).toBe("abc123");
    expect(token).toBe(MD5("sesameabc123").toString());
  });

  it("throws without any credentials", () => {
    const config = { ...passwordConfig, password: undefined };
    expect(() => deriveAuthToken(config, "x")).toThrow(SubsonicError);
  });
});

describe("generateSalt", () => {
  it("produces unique 32-char hex strings", () => {
    const a = generateSalt();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(generateSalt()).not.toBe(a);
  });
});

describe("buildActionUrl", () => {
  it("encodes auth and custom params", () => {
    const url = new URL(buildActionUrl(passwordConfig, "abc", "getAlbum", { id: "al 1" }));
    expect(url.origin + url.pathname).toBe("https://music.example.com/rest/getAlbum.view");
    expect(url.searchParams.get("u")).toBe("user name");
    expect(url.searchParams.get("s")).toBe("abc");
    expect(url.searchParams.get("f")).toBe("json");
    expect(url.searchParams.get("id")).toBe("al 1");
  });

  it("repeats array params and skips undefined", () => {
    const url = new URL(
      buildActionUrl(passwordConfig, "abc", "createPlaylist", {
        songId: ["1", "2"],
        name: undefined,
      })
    );
    expect(url.searchParams.getAll("songId")).toEqual(["1", "2"]);
    expect(url.searchParams.has("name")).toBe(false);
  });
});

describe("toArray", () => {
  it("normalizes undefined, single values, and arrays", () => {
    expect(toArray(undefined)).toEqual([]);
    expect(toArray("x")).toEqual(["x"]);
    expect(toArray(["x", "y"])).toEqual(["x", "y"]);
  });
});

describe("subsonicGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch(body: unknown, ok = true, status = 200) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok, status, json: async () => body })
    );
  }

  it("returns the payload on ok status", async () => {
    stubFetch({ "subsonic-response": { status: "ok", version: "1.16.1", albumList2: {} } });
    const payload = await subsonicGet<{ albumList2: object }>("http://x/rest/y");
    expect(payload.albumList2).toEqual({});
  });

  it("throws SubsonicError with the server message on failed status", async () => {
    stubFetch({
      "subsonic-response": {
        status: "failed",
        version: "1.16.1",
        error: { code: 40, message: "Wrong username or password" },
      },
    });
    await expect(subsonicGet("http://x/rest/y")).rejects.toMatchObject({
      name: "SubsonicError",
      message: "Wrong username or password",
      code: 40,
    });
  });

  it("throws on HTTP errors", async () => {
    stubFetch({}, false, 503);
    await expect(subsonicGet("http://x/rest/y")).rejects.toThrow("HTTP 503");
  });

  it("throws on malformed bodies", async () => {
    stubFetch({ unexpected: true });
    await expect(subsonicGet("http://x/rest/y")).rejects.toThrow("Malformed");
  });
});
