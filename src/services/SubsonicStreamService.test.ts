import { getStreamUrl } from "./SubsonicStreamService";
import { SubsonicConfig } from "../config/subsonic";

const config: SubsonicConfig = {
  serverUrl: "https://music.example.com",
  username: "user",
  password: "sesame",
  appName: "TestApp",
  apiVersion: "1.16.1",
};

const params = (url: string) => new URL(url).searchParams;

describe("getStreamUrl", () => {
  it("streams the original file when no bitrate cap is given", () => {
    const query = params(getStreamUrl(config, "salt", "s1"));
    expect(query.get("format")).toBe("raw");
    expect(query.has("maxBitRate")).toBe(false);
    expect(query.has("estimateContentLength")).toBe(false);
  });

  it("transcodes to MP3 with an estimated length when capped", () => {
    const query = params(getStreamUrl(config, "salt", "s1", undefined, 192));
    expect(query.get("format")).toBe("mp3");
    expect(query.get("maxBitRate")).toBe("192");
    expect(query.get("estimateContentLength")).toBe("true");
  });
});
